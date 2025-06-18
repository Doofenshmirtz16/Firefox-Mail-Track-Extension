function generateTrackingId() {
  return 'id-' + Math.random().toString(36).substring(2, 10);
}

function getSubjectAndRecipient() {
  const subjectInput = document.querySelector('input[name="subjectbox"]');
  const subject = subjectInput?.value?.trim() || "No subject";

  const toField = document.querySelector('[aria-label="To recipients"]') ||
                  document.querySelector('[aria-label="To"]');

  let recipient = "unknown";
  if (toField) {
    const emailChips = toField.querySelectorAll('span[email]');
    if (emailChips.length > 0) {
      recipient = Array.from(emailChips).map(span => span.getAttribute('email')).join(', ');
    } else {
      recipient = toField.textContent.trim() || "unknown";
    }
  }

  return { subject, recipient };
}

function insertTrackingPixelForCompose(composeBody) {
  if (composeBody.querySelector('.email-tracking-pixel')) return;

  const id = generateTrackingId();
  const { subject, recipient } = getSubjectAndRecipient();

  const pixel = document.createElement('img');
  pixel.src = `https://email-tracker-worker.doofenshmirtz17.workers.dev/pixel?id=${id}&subject=${encodeURIComponent(subject)}&recipient=${encodeURIComponent(recipient)}`;
  pixel.width = 1;
  pixel.height = 1;
  pixel.style.display = "none";
  pixel.className = "email-tracking-pixel";
  pixel.setAttribute('data-tracking-id', id);

  composeBody.appendChild(pixel);
  console.log(`[📥 Pixel inserted] ID: ${id} | ${subject} → ${recipient}`);
}

function trackComposeWindows() {
  const composeBodies = document.querySelectorAll('[aria-label="Message Body"]');

  composeBodies.forEach(body => {
    // If already has a pixel, skip
    if (body.querySelector('.email-tracking-pixel')) return;

    // Wait until subject or recipient has value
    const interval = setInterval(() => {
      const { subject, recipient } = getSubjectAndRecipient();
      const subjectReady = subject !== "No subject";
      const recipientReady = recipient !== "unknown";

      if (subjectReady || recipientReady) {
        insertTrackingPixelForCompose(body);
        clearInterval(interval);
      }
    }, 1000); // check every 1 second
  });
}

setInterval(trackComposeWindows, 2000);

//Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
