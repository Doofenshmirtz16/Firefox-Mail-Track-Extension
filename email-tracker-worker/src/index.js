


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Pixel endpoint
    if (url.pathname === "/pixel") {
      const trackingId = url.searchParams.get("id") || "unknown";
      const subject = url.searchParams.get("subject") || "No subject";
      const recipient = url.searchParams.get("recipient") || "unknown";
      const timestamp = new Date().toISOString();
      const userAgent = request.headers.get("User-Agent") || "unknown";

      const newEntry = { timestamp, userAgent };
      let data = { subject, recipient, events: [] };
      const existing = await env.EMAIL_TRACKER.get(trackingId);
      if (existing) {
        try {
          data = JSON.parse(existing);
        } catch {
          data = { subject, recipient, events: [] };
        }
      }

      if (!data.subject) data.subject = subject;
      if (!data.recipient) data.recipient = recipient;
      data.events.push(newEntry);

      await env.EMAIL_TRACKER.put(trackingId, JSON.stringify(data));
      return new Response(
        Uint8Array.from(atob("R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="), c => c.charCodeAt(0)),
        { headers: { "Content-Type": "image/gif", "Cache-Control": "no-cache" } }
      );
    }

    // 2. Metadata POST
    if (url.pathname === "/map" && request.method === "POST") {
      try {
        const body = await request.json();
        const { id, subject, recipient } = body;
        if (!id) return new Response("Missing ID", { status: 400 });

        await env.EMAIL_TRACKER.put(`${id}-meta`, JSON.stringify({ subject: subject || "No subject", recipient: recipient || "unknown" }));
        return new Response("Metadata saved", { status: 200 });
      } catch {
        return new Response("Error parsing metadata", { status: 400 });
      }
    }

    // 3. Metadata GET fallback
    if (url.pathname === "/meta") {
      const trackingId = url.searchParams.get("id");
      if (!trackingId) return new Response("Missing tracking ID", { status: 400 });
      const meta = {
        subject: url.searchParams.get("subject") || "No subject",
        recipient: url.searchParams.get("recipient") || "unknown"
      };
      await env.EMAIL_TRACKER.put(`${trackingId}-meta`, JSON.stringify(meta));
      return new Response("Metadata stored", { status: 200 });
    }

    // 4. JSON API for dashboard
    if (url.pathname === "/api/events") {
      const list = await env.EMAIL_TRACKER.list();
      const summaries = [];

      for (const key of list.keys) {
        if (key.name.endsWith("-meta")) continue;
        try {
          const raw = await env.EMAIL_TRACKER.get(key.name);
          const parsed = JSON.parse(raw || "{}");
          const events = parsed.events || [];
          if (events.length > 0) {
            const sorted = events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            summaries.push({
              id: key.name,
              first: sorted[0].timestamp,
              last: sorted[sorted.length - 1].timestamp,
              agent: sorted[sorted.length - 1].userAgent || "unknown"
            });
          }
        } catch {}
      }

      summaries.sort((a, b) => new Date(b.last) - new Date(a.last));
      return new Response(JSON.stringify(summaries), { headers: { "Content-Type": "application/json" } });
    }

    // 4. Dashboard (original layout restored, minimal columns)
if (url.pathname === "/dashboard") {
  const list = await env.EMAIL_TRACKER.list();
  const summaries = [];

  for (const key of list.keys) {
    if (key.name.endsWith("-meta")) continue;

    let data = {};
    try {
      const raw = await env.EMAIL_TRACKER.get(key.name);
      data = JSON.parse(raw || "{}");
    } catch (e) {}

    const events = Array.isArray(data.events) ? data.events : [];

    if (events.length > 0) {
      const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const first = sortedEvents[0];
      const last = sortedEvents[sortedEvents.length - 1];

      const firstIST = new Date(first.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const lastIST = new Date(last.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      summaries.push({
        id: key.name,
        first: firstIST,
        last: lastIST,
        agent: last.userAgent || "unknown"
      });
    }
  }

  summaries.sort((a, b) => new Date(b.last) - new Date(a.last));

  const rows = summaries.map(entry => `
    <tr>
      <td>${entry.id}</td>
      <td>${entry.first}</td>
      <td>${entry.last}</td>
      <td>${entry.agent}</td>
    </tr>`);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="30" />
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
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          background: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
        }
        .summary div {
          flex: 1;
          text-align: center;
        }
        .summary h3 {
          margin: 0 0 4px;
          font-size: 16px;
          color: #666;
        }
        .summary p {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .export-btn {
          text-align: right;
          margin-bottom: 10px;
        }
        .export-btn a {
          background-color: #1a73e8;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
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
          .summary {
            flex-direction: column;
            gap: 8px;
          }
          .export-btn {
            text-align: center;
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
          td:nth-of-type(2):before { content: "First Opened"; }
          td:nth-of-type(3):before { content: "Last Opened"; }
          td:nth-of-type(4):before { content: "User Agent"; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📬 Email Opens Dashboard</h1>
        <div class="export-btn">
          <a href="/export">⬇️ Download CSV</a>
        </div>
        <div class="summary">
          <div><h3>Total Emails</h3><p>${summaries.length}</p></div>
          <div><h3>Last Opened</h3><p>${summaries[0]?.last || "N/A"}</p></div>
        </div>
        <table>
          <thead>
            <tr><th>ID</th><th>First Opened</th><th>Last Opened</th><th>User Agent</th></tr>
          </thead>
          <tbody>
            ${rows.join("") || `<tr><td colspan="4">No opens recorded yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}



    // 6. Export CSV
    if (url.pathname === "/export") {
      const list = await env.EMAIL_TRACKER.list();
      const rows = [["ID", "First Opened", "Last Opened", "User Agent"]];

      for (const key of list.keys) {
        if (key.name.endsWith("-meta")) continue;

        let events = [];
        try {
          const raw = await env.EMAIL_TRACKER.get(key.name);
          const parsed = JSON.parse(raw || "{}");
          events = parsed.events || [];
        } catch {}

        if (events.length > 0) {
          const sorted = events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          rows.push([
            key.name,
            new Date(sorted[0].timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            new Date(sorted[sorted.length - 1].timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            sorted[sorted.length - 1].userAgent || "unknown"
          ]);
        }
      }

      const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=email-tracking.csv"
        }
      });
    }

    // 7. Root
    if (url.pathname === "/") {
      return new Response(`<html><body><h1>Email Tracker Worker</h1><p>Visit <a href="/dashboard">/dashboard</a> to view logs.</p></body></html>`, {
        headers: { "Content-Type": "text/html" }
      });
    }

    // 8. Fallback
    return new Response("Not found", { status: 404 });
  }
};




