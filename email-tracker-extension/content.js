function generateTrackingId() {
  return 'id-' + Math.random().toString(36).substring(2, 10);
}

function getSubjectAndRecipient() {
  const subjectEl = document.querySelector('input[name="subjectbox"]');
  const subject = subjectEl?.value.trim() || "No subject";

  const toTextarea = document.querySelector('textarea[name="to"]');
  let recipient = toTextarea
    ? toTextarea.value.trim() || "unknown"
    : "unknown";

  if (recipient === "unknown") {
    const chipContainer = document.querySelector('[aria-label="To recipients"], [aria-label="To"]');
    if (chipContainer) {
      const chips = chipContainer.querySelectorAll('span[email]');
      if (chips.length) {
        recipient = Array.from(chips)
          .map(s => s.getAttribute('email'))
          .join(', ');
      }
    }
  }

  return { subject, recipient };
}

function injectPixel(body, id) {
  const img = document.createElement('img');
  img.src = `https://email-tracker-worker.doofenshmirtz17.workers.dev/pixel?id=${id}`;
  img.width = 1;
  img.height = 1;
  img.style.display = 'none';
  img.className = 'email-tracking-pixel';
  body.appendChild(img);
}

function hookSendButton(id) {
  const sendBtn = document.querySelector('div.T-I[role="button"][data-tooltip^="Send"]');
  if (!sendBtn || sendBtn.dataset.hooked) return;
  sendBtn.dataset.hooked = 'true';

  sendBtn.addEventListener('click', () => {
    const { subject, recipient } = getSubjectAndRecipient();
    const payload = JSON.stringify({ id, subject, recipient });
    navigator.sendBeacon(
      'https://email-tracker-worker.doofenshmirtz17.workers.dev/map',
      new Blob([payload], { type: 'application/json' })
    );
  });
}

function trackComposeWindows() {
  const bodies = document.querySelectorAll('[aria-label="Message Body"]');
  bodies.forEach(body => {
    // If we’ve already processed this window, skip it
    if (body.dataset.trackingId) return;

    const id = generateTrackingId();
    body.dataset.trackingId = id;
    injectPixel(body, id);
    hookSendButton(id);
    console.log(`[Tracker] Compose window set up with ID=${id}`);
  });
}

setInterval(trackComposeWindows, 2000);

//Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass (Use this command in your vs-code terminal every time they ask for security access) 
