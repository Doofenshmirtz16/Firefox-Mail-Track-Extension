
let currentTrackingId = null;

function generateTrackingId() {
  return 'id-' + Math.random().toString(36).substring(2, 10);
}

function insertTrackingPixel() {
  const composeBodies = document.querySelectorAll('[aria-label="Message Body"]');

  composeBodies.forEach(body => {
    if (body.querySelector('.email-tracking-pixel')) return;

    if (!currentTrackingId) {
      currentTrackingId = generateTrackingId();  // generate once per session
    }

    const img = document.createElement('img');
    img.src = `https://email-tracker-worker.agrawal-kr9.workers.dev/pixel?id=${currentTrackingId}`;
    img.width = 1;
    img.height = 1;
    img.style.display = "none";
    img.className = "email-tracking-pixel";
    img.setAttribute('data-tracking-id', currentTrackingId);

    body.appendChild(img);
    console.log(`[Email Tracker] Inserted pixel with ID: ${currentTrackingId}`);
  });
}

setInterval(insertTrackingPixel, 2000);
