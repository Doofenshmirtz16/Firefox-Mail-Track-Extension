// 1. Generate a unique tracking ID
let systemId = null;
let userFacingId = null;

function generateTrackingId() {
  return 'id-' + Math.random().toString(36).substring(2, 10);
}

// 2. Extract subject and recipient from Gmail compose window
function getSubjectAndRecipient() {
  const subjectEl = document.querySelector('input[name="subjectbox"]');
  const subject = subjectEl?.value.trim() || "No subject";

  let recipient = "unknown";
  const toInput = document.querySelector('textarea[name="to"]');
  if (toInput && toInput.value.trim()) {
    recipient = toInput.value.trim();
  }

  if (recipient === "unknown") {
    const chipContainer = document.querySelector('[aria-label="To recipients"], [aria-label="To"]');
    if (chipContainer) {
      const chips = chipContainer.querySelectorAll('[email], [data-hovercard-id]');
      if (chips.length > 0) {
        recipient = Array.from(chips)
          .map(chip => chip.getAttribute("email") || chip.getAttribute("data-hovercard-id"))
          .filter(Boolean)
          .join(", ");
      }
    }
  }

  return { subject, recipient };
}

// 3. Create pixel element with ID and metadata
function createPixel(id, subject, recipient) {
  const img = document.createElement('img');
  const params = [`id=${encodeURIComponent(id)}`];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (recipient) params.push(`recipient=${encodeURIComponent(recipient)}`);
  
  // Prevent Gmail or browser from caching the image
  params.push(`t=${Date.now()}`); // Unique timestamp
  
  img.src = `https://email-tracker-worker.doofenshmirtz17.workers.dev/pixel?${params.join("&")}`;
  img.width = 1;
  img.height = 1;
  img.style.display = 'none';
  img.className = 'email-tracking-pixel';
  return img;
}


// 4. Hook Gmail "Send" button to inject final pixel and send metadata
function hookSendButton(body) {
  const sendBtn = document.querySelector('div.T-I[role="button"][data-tooltip^="Send"]');
  if (!sendBtn || sendBtn.dataset.hooked) return;
  sendBtn.dataset.hooked = 'true';

  const reinforce = () => {
    const { subject, recipient } = getSubjectAndRecipient();

    if (!body.querySelector('img.email-tracking-pixel.reinforced')) {
      const px = createPixel(systemId, subject, recipient);
      px.classList.add('reinforced');
      body.appendChild(px);
    }

    // ❗ Send mapping info with metadata
    navigator.sendBeacon(
      'https://email-tracker-worker.doofenshmirtz17.workers.dev/map',
      new Blob([JSON.stringify({
        id: userFacingId,       // the open pixel
        systemId: systemId,     // the composed pixel
        subject,
        recipient
      })], { type: 'application/json' })
    );
  };

  sendBtn.addEventListener('click', reinforce, { capture: true });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') reinforce();
  });
}

// 5. Watch for new compose windows and inject tracking pixel
function trackComposeWindows() {
  document.querySelectorAll('[aria-label="Message Body"]').forEach(body => {
    if (body.dataset.trackingId) return;

    systemId = generateTrackingId();  // generate early ID
    body.dataset.trackingId = systemId;

    body.appendChild(createPixel(systemId)); // no subject/recipient yet

    hookSendButton(body); // no need to pass ID directly anymore

    const obs = new MutationObserver(() => {
      if (!body.querySelector('img.email-tracking-pixel')) {
        body.appendChild(createPixel(systemId));
      }
    });
    obs.observe(body, { childList: true, subtree: true });

    console.log(`[Tracker] Compose window set up with systemId=${systemId}`);
  });
}

// Start polling for compose windows
setInterval(trackComposeWindows, 2000);

//Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
