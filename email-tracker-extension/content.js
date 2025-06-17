
let currentTrackingId = null;

function generateTrackingId() {
  return 'id-' + Math.random().toString(36).substring(2, 10);
}

function insertTrackingPixel() {
  const composeBodies = document.querySelectorAll('[aria-label="Message Body"]');

  composeBodies.forEach(body => {
    if (body.querySelector('.email-tracking-pixel')) return;

    if (!currentTrackingId) {
      currentTrackingId = generateTrackingId();
    }

    const pixel = document.createElement('img');
    pixel.src = `https://email-tracker-worker.agrawal-kr9.workers.dev/pixel?id=${currentTrackingId}`;
    pixel.width = 1;
    pixel.height = 1;
    pixel.style.display = "none";
    pixel.className = "email-tracking-pixel";
    pixel.setAttribute('data-tracking-id', currentTrackingId);

    body.appendChild(pixel);
    console.log(`[📥 Pixel inserted] ID: ${currentTrackingId}`);
  });
}

setInterval(insertTrackingPixel, 2000);


