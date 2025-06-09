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

    if (url.pathname === "/") {
  		return new Response("Email Tracker is live. Visit /dashboard to see results.");
	}

	return new Response("Not found", { status: 404 });

  }
};


