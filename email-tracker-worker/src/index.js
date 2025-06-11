
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