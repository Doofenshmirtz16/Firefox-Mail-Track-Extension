
export default {
async fetch(request, env, ctx) {
const url = new URL(request.url);


if (url.pathname === "/pixel") {
  const trackingId = url.searchParams.get("id") || "unknown";
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get("User-Agent") || "unknown";

  const newEntry = { timestamp, userAgent };
  let data = [];

  const existing = await env.EMAIL_TRACKER.get(trackingId);
  if (existing) {
    try {
      data = JSON.parse(existing);
    } catch (e) {
      data = [];
    }
<<<<<<< HEAD
  }

  data.push(newEntry);
  await env.EMAIL_TRACKER.put(trackingId, JSON.stringify(data));

  console.log(`[OPEN] Email ID: ${trackingId} at ${timestamp}`);

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
  const tableRows = [];

  for (const key of list.keys) {
    try {
      const raw = await env.EMAIL_TRACKER.get(key.name);
      if (!raw) continue;

      const events = JSON.parse(raw);
      if (!Array.isArray(events)) continue;

      events.forEach(event => {
        tableRows.push(`
          <tr>
            <td>${key.name}</td>
            <td>${event.timestamp}</td>
            <td>${event.userAgent}</td>
          </tr>`);
      });
    } catch (e) {
      console.error(`Error processing key ${key.name}:`, e);
      continue;
    }
  }

  const html = `
    <html>
      <head>
        <title>Email Opens</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { padding: 8px 12px; border: 1px solid #ccc; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>Email Opens Dashboard</h1>
        <table>
          <thead>
            <tr><th>ID</th><th>Timestamp</th><th>User Agent</th></tr>
          </thead>
          <tbody>
            ${tableRows.join("")}
          </tbody>
        </table>
      </body>
    </html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}

return new Response("Not found", { status: 404 });
}
}
=======

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
>>>>>>> aecc9bbd3a30dd6ab97d89b3c7f09ac6ca91d29d
