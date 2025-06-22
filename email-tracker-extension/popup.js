document.addEventListener("DOMContentLoaded", async () => {
  const summaryDiv = document.getElementById("summary");

  try {
    const res = await fetch("https://email-tracker-worker.doofenshmirtz17.workers.dev/dashboard-json");
    const data = await res.json();

    if (!Array.isArray(data)) {
      summaryDiv.innerText = "Failed to load summary.";
      return;
    }

    const totalTracked = data.length;
    const totalOpens = data.reduce((sum, entry) => sum + entry.opens, 0);
    const lastOpened = data
      .filter(e => e.last)
      .sort((a, b) => new Date(b.lastRaw) - new Date(a.lastRaw))[0]?.last || "N/A";

    summaryDiv.innerHTML = `
      <strong>Total Tracked Emails:</strong> ${totalTracked}<br/>
      <strong>Total Opens:</strong> ${totalOpens}<br/>
      <strong>Last Opened:</strong> ${lastOpened}<br/>
      <a href="https://email-tracker-worker.doofenshmirtz17.workers.dev/dashboard" target="_blank">View Full Dashboard</a>
    `;
  } catch (err) {
    summaryDiv.innerText = "Error loading summary.";
  }
});
