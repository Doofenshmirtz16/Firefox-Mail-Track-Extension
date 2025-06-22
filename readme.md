# Email Tracker — Firefox Extension + Cloudflare Worker

Track whether your emails are opened using a Firefox extension and a Cloudflare Worker backend.

---

## ✨ Features

- 🔍 Automatically inserts a unique invisible tracking pixel in Gmail
- 🧠 Uses two ID system (system-generated + user-facing ID) for reliability
- 📦 Cloudflare KV logs open events with timestamps and user agents
- 🇮🇳 Timestamps shown in IST for relevance
- 📊 Detailed dashboard showing opens, metadata, and export to CSV
- 📋 Extension popup shows latest email tracking summary
- 🧼 Filters out Gmail image proxy prefetch to reduce false positives
- 🔁 Automatically reinjects removed tracking pixels
- 🌐 Deployable on any Cloudflare Worker and compatible with modern Firefox

---

## 🧱 Tech Stack

- Firefox WebExtension (JavaScript, Manifest V3)
- Cloudflare Workers & KV storage
- HTML/CSS (Dashboard + Popup UI)

---

## Additional Features
- Popup feature with icon for the extension in firefox
- Dashboard shows both types of logs and timestamps for each mail: time when mail is sent to the receiver and time when mails are opened
- Same mails when opened more than once have are counted under same id
- Expandable section for each mail to get information about time and user agent for all the logged in data
- Subject and Recipients column are successully implemented without getting the tracker stripped from the mail
- Feature to download data as an csv file

---

## 📁 Project Structure

```
email-tracker/
├── content.js             # Main script that runs in Gmail and injects tracking pixels
├── popup.html             # Popup UI
├── popup.js               # Fetches summary data for popup
├── style.css              # Styling for popup
├── icons/                 # Icon assets (48x48 and 96x96 PNG)
│   ├── icon48.png
│   └── icon96.png
├── manifest.json          # Firefox extension manifest (v3)
├── dashboard.html         # Visual dashboard for email open logs
├── dashboard.js           # Fetches and displays logs from Cloudflare Worker
├── worker.js              # Cloudflare Worker backend (pixel, map, export, dashboard endpoints)
├── wrangler.jsonc         # Wrangler config for Cloudflare Worker
└── README.md              # You're here
```

---

## 🚀 Setup Instructions

### 2. Clone the repository
```
git clone https://github.com/Doofenshmirtz16/Firefox-Mail-Track-Extension.git
cd Firefox-Mail-Track-Extension
```

### 1. Set up Cloudflare Worker

Install Wrangler CLI:

```bash
npm install -g wrangler
```

Initialize your project (if not done):

```bash
wrangler init email-tracker-worker --type javascript
```
or
```
wrangler init email-tracker-worker
```
based on your wrangler CLI version. (--type flag is supported in older versions only)

Navigate to project:

```bash
cd email-tracker-worker
```

Create KV Namespace:


```bash
wrangler kv namespace create EMAIL_TRACKER
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
#### "Remember to change the link of your worker url with your worker domain in all files, i.e, content.js, manifest.js and index.js (if applicable)."

---

### 4. Load Extension in Firefox

* Visit `about:debugging`
* Click "This Firefox"
* Click "Load Temporary Add-on"
* Select the `manifest.json` file inside your `extension/` folder
* Send a test email from Gmail to see tracking in action

---

## 📊 Dashboard

Open your Worker endpoint:

```
https://<your-worker-subdomain>.workers.dev/dashboard
```

You’ll see:

- Email ID
- Subject
- Recipient
- First open time (IST)
- Last open time (IST)
- Open count
- Export CSV option

---

## 📝 Manifest Highlights

```json
"action": {
  "default_title": "Email Tracker Summary",
  "default_popup": "popup.html",
  "default_icon": {
    "48": "icons/icon48.png",
    "96": "icons/icon96.png"
  }
}
```

---


## 🧪 Popup Summary

Click the toolbar icon for a quick popup showing:

- Total tracked emails
- Last opened email info
- Link to full dashboard

---

## 📊 Sample Dashboard Output
```
| ID            | Subject        | Recipient                        | Opens | First Open             | Last Open              | User Agent                                            |
| ------------- | -------------- | -------------------------------- | ----- | ---------------------- | ---------------------- | ----------------------------------------------------- |
| `id-a1b2c3d4` | `Project Plan` | `example.user@gmail.com`         | 2     | 22/6/2025, 4:15:30 pm  | 22/6/2025, 4:30:45 pm  | Mozilla/5.0 (Windows NT 5.1; ... GoogleImageProxy)    |
```
Clicking on each section would provide you with details of mail

---

## 📝 Credits

Developed by Kritagya Agarwal, Sumit Sharma, Jay Jain, 2025. Inspired by Mailtrack, reimagined for Firefox using modern serverless technologies.

## 📄 License

MIT License – free for personal and educational use.
