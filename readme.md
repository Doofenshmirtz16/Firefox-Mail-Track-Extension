# Email Tracker — Firefox Extension + Cloudflare Worker

Track whether your emails are opened using a Firefox extension and a Cloudflare Worker backend.

---

## ✨ Features

* 🔍 Inserts a 1×1 invisible tracking pixel into Gmail compose window
* ☁️ Cloudflare Worker handles pixel requests
* 📦 Cloudflare KV logs opens with timestamp & user agent
* 📊 Simple dashboard at `/dashboard` to view logs

---

## 🧱 Tech Stack

* Firefox WebExtension (JavaScript)
* Cloudflare Workers
* Cloudflare KV
* HTML/CSS (Dashboard)

---

## 📁 Project Structure

```
email-tracker/
├── extension/                    # Firefox extension files
│   ├── manifest.json
│   └── content.js
├── email-tracker-worker/        # Cloudflare Worker backend
│   ├── index.js
│   └── wrangler.jsonc
└── README.md
```

---

## 🚀 Setup Instructions

### 1. Set up Cloudflare Worker

Install Wrangler CLI:

```bash
npm install -g wrangler
```

Initialize your project (if not done):

```bash
wrangler init email-tracker-worker --type javascript
```

Navigate to project:

```bash
cd email-tracker-worker
```

Create KV Namespace:

```bash
wrangler kv:namespace create EMAIL_TRACKER
```

Update `wrangler.jsonc`:

```jsonc
{
  "name": "email-tracker-worker",
  "main": "index.js",
  "compatibility_date": "2025-06-09",
  "kv_namespaces": [
    {
      "binding": "EMAIL_TRACKER",
      "id": "<your-kv-id>"
    }
  ]
}
```

Deploy:

```bash
npx wrangler deploy
```

### 2. Create Cloudflare Worker Code

`index.js`

```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/pixel") {
      const trackingId = url.searchParams.get("id") || "unknown";
      const timestamp = new Date().toISOString();
      const userAgent = request.headers.get("User-Agent") || "unknown";

      const logEntry = JSON.stringify({ id: trackingId, timestamp, userAgent });
      const kvKey = `${trackingId}:${timestamp}`;
      await env.EMAIL_TRACKER.put(kvKey, logEntry);

      console.log(`[OPEN] Email opened with ID: ${trackingId} at ${timestamp}`);

      return new Response(
        Uint8Array.from(
          atob("R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="),
          c => c.charCodeAt(0)
        ),
        {
          headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-cache"
          }
        }
      );
    }

    if (url.pathname === "/dashboard") {
      const list = await env.EMAIL_TRACKER.list();
      const rows = await Promise.all(
        list.keys.map(async (key) => {
          const value = await env.EMAIL_TRACKER.get(key.name);
          const data = JSON.parse(value);
          return `<tr>
                    <td>${data.id}</td>
                    <td>${data.timestamp}</td>
                    <td>${data.userAgent}</td>
                  </tr>`;
        })
      );

      const html = `
        <html>
          <head><title>Email Opens</title></head>
          <body>
            <h1>Email Opens Dashboard</h1>
            <table border="1" cellpadding="6">
              <thead>
                <tr><th>ID</th><th>Timestamp</th><th>User Agent</th></tr>
              </thead>
              <tbody>${rows.join("")}</tbody>
            </table>
          </body>
        </html>`;

      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  }
};
```

---

### 3. Firefox Extension Code

`manifest.json`

```json
{
  "manifest_version": 2,
  "name": "Email Tracker",
  "version": "1.0",
  "description": "Track email opens via Cloudflare Worker",
  "permissions": ["https://mail.google.com/*"],
  "content_scripts": [
    {
      "matches": ["https://mail.google.com/*"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
}
```

`content.js`

```js
function insertTrackingPixel() {
  const composeBodies = document.querySelectorAll('[aria-label="Message Body"]');

  composeBodies.forEach(body => {
    if (body.querySelector('.email-tracking-pixel')) return;

    const img = document.createElement('img');
    const trackingId = "abc123"; // Replace with dynamic ID logic later
    img.src = `https://your-subdomain.workers.dev/pixel?id=${trackingId}`;
    img.width = 1;
    img.height = 1;
    img.style.display = "none";
    img.className = "email-tracking-pixel";

    body.appendChild(img);
    console.log("[Email Tracker] Pixel inserted.");
  });
}

setInterval(insertTrackingPixel, 2000);
```

---

### 4. Load Extension in Firefox

* Visit `about:debugging`
* Click "This Firefox"
* Click "Load Temporary Add-on"
* Select the `manifest.json` file inside your `extension/` folder

---

## 📊 Sample Dashboard Output

```
Email Opens Dashboard
----------------------
ID        | Timestamp                | User Agent
----------|--------------------------|-----------------------------
abc123    | 2025-06-09T12:20:41Z     | Mozilla/5.0 (...)
```

---

## 📌 Future Enhancements

* [ ] Generate unique IDs per email
* [ ] Secure dashboard with auth
* [ ] Export logs to CSV
* [ ] Add support for multiple email platforms

---

## 📝 Credits

Developed by Kritagya Agarwal, Sumit Sharma, Jay Jain, 2025. Inspired by Mailtrack, reimagined for Firefox using modern serverless technologies.

Mentorship, guidance, and code architecture suggestions by ChatGPT.

## 📄 License

MIT License
