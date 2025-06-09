function generateTrackingId() {
  // Generate a random 12-char alphanumeric ID (base36)
  return 'id-' + Math.random().toString(36).substring(2, 10);
}

function insertTrackingPixel() {
  const composeBodies = document.querySelectorAll('[aria-label="Message Body"]');

  composeBodies.forEach(body => {
    // If pixel already exists, skip
    if (body.querySelector('.email-tracking-pixel')) return;

    // Generate unique tracking ID
    const trackingId = generateTrackingId();

    // Create tracking pixel
    const img = document.createElement('img');
    img.src = `https://email-tracker-worker.doofenshmirtz17.workers.dev/pixel?id=${trackingId}`;
    img.width = 1;
    img.height = 1;
    img.style.display = "none";
    img.className = "email-tracking-pixel";

    // Attach tracking ID as data attribute (optional)
    img.setAttribute('data-tracking-id', trackingId);

    // Append pixel to body
    body.appendChild(img);

    console.log(`[Email Tracker] Inserted pixel with ID: ${trackingId}`);
  });
}

// Monitor compose windows every 2s
setInterval(insertTrackingPixel, 2000);
