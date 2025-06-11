/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Email Opens Dashboard</title>
          <style>
            body {
              margin: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f0f2f5;
              color: #333;
            }
            .container {
              max-width: 960px;
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }
            h1 {
              text-align: center;
              margin-bottom: 24px;
              color: #1a73e8;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th, td {
              padding: 12px 16px;
              text-align: left;
              border-bottom: 1px solid #e0e0e0;
            }
            th {
              background: #f5f5f5;
              font-weight: 600;
            }
            tr:hover {
              background-color: #f1f9ff;
            }
            @media (max-width: 600px) {
              .container {
                padding: 16px;
              }
              table, thead, tbody, th, td, tr {
                display: block;
              }
              th {
                display: none;
              }
              td {
                position: relative;
                padding-left: 50%;
                margin-bottom: 12px;
                border: none;
                border-bottom: 1px solid #eee;
              }
              td:before {
                position: absolute;
                top: 12px;
                left: 16px;
                width: 45%;
                padding-right: 10px;
                white-space: nowrap;
                font-weight: 600;
                color: #555;
              }
              td:nth-of-type(1):before { content: "ID"; }
              td:nth-of-type(2):before { content: "Timestamp"; }
              td:nth-of-type(3):before { content: "User Agent"; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📬 Email Opens Dashboard</h1>
            <table>
              <thead>
                <tr><th>ID</th><th>Timestamp</th><th>User Agent</th></tr>
              </thead>
              <tbody>
                ${rows.join("") || `<tr><td colspan="3">No opens recorded yet.</td></tr>`}
              </tbody>
            </table>
          </div>
        </body>
        </html>`;

      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === "/") {
  		return new Response("Email Tracker is live. Visit /dashboard to see results.");
	}

	return new Response("Not found", { status: 404 });

  }
};
