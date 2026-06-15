

const SITE_CONFIGS = {
  'claude.ai': {
    name: 'Claude',
    selectors: [
      'button[data-testid="send-button"]',
      'button#composer-submit-button',
      'button[aria-label="Envoyer le prompt"]',
      'button[aria-label="Send message"]',
      'button.composer-submit-btn'
    ]
  },
  'chatgpt.com': {
    name: 'ChatGPT',
    selectors: [
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Envoyer le message"]',
      '#prompt-textarea ~ button',
      'form button[type="button"]:last-child'
    ]
  },
  'chat.openai.com': {
    name: 'ChatGPT',
    selectors: [
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send message"]'
    ]
  },
  'gemini.google.com': {
    name: 'Gemini',
    selectors: [
      'button.send-button',
      'button[aria-label="Send message"]',
      'button[aria-label="Envoyer le message"]',
      'button[jsname="Qx7uuf"]',
      '.send-button',
      'mat-icon-button[aria-label*="Send"]'
    ]
  },
  'perplexity.ai': {
    name: 'Perplexity',
    selectors: [
      'button[aria-label="Submit"]',
      'button[type="submit"]',
      'button.bg-super',
      'button[data-testid="submit-button"]',
      'textarea + button',
      'button svg[data-icon="arrow-right"]'
    ]
  },
  'mistral.ai': {
    name: 'Mistral',
    selectors: [
      'button[type="submit"]',
      'button[aria-label="Send"]',
      'button[aria-label="Envoyer"]',
      'button.send-btn',
      'form button:last-child'
    ]
  },
  'chat.mistral.ai': {
    name: 'Mistral',
    selectors: [
      'button[type="submit"]',
      'button[aria-label="Send"]',
      'button[aria-label="Envoyer"]'
    ]
  },
  'huggingface.co': {
    name: 'HuggingFace',
    selectors: [
      'button[type="submit"]',
      'button.btn-submit',
      'button[aria-label="Send"]',
      'button[data-testid="submit"]'
    ]
  },
  'poe.com': {
    name: 'Poe',
    selectors: [
      'button[class*="SendButton"]',
      'button[data-testid="send-button"]',
      'button[aria-label="Send message"]',
      'button.Button_sendButton__'
    ]
  },
  'you.com': {
    name: 'You.com',
    selectors: [
      'button[type="submit"]',
      'button[aria-label="Submit"]',
      'button[data-testid="search-submit"]',
      'button.search-submit'
    ]
  },
  'copilot.microsoft.com': {
    name: 'Copilot',
    selectors: [
      'button[aria-label="Submit"]',
      'button[aria-label="Send"]',
      'button#submit-button',
      'button[type="submit"]',
      'cib-chat-input button'
    ]
  }
};


function getCurrentConfig() {
  const host = window.location.hostname.replace('www.', '');
  for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
    if (host.includes(domain)) {
      return { domain, ...config };
    }
  }
  return null;
}

let isEnabled = false;
let observer = null;
let intervalId = null;
const config = getCurrentConfig();


chrome.storage.local.get(['enabled'], (result) => {
  isEnabled = result.enabled || false;
  if (isEnabled) startUnlocker();
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    isEnabled = message.enabled;
    isEnabled ? startUnlocker() : stopUnlocker();
    sendResponse({ status: isEnabled ? 'started' : 'stopped' });
  } else if (message.action === 'getStatus') {
    sendResponse({
      enabled: isEnabled,
      buttonFound: !!findButton(),
      siteName: config ? config.name : null
    });
  }
  return true;
});

function findButton() {
  if (!config) return null;
  for (const selector of config.selectors) {
    try {
      const btn = document.querySelector(selector);
      if (btn) return btn;
    } catch(e) {}
  }
  return null;
}

function unlockButton() {
  const btn = findButton();
  if (btn) {
    btn.disabled = false;
    btn.removeAttribute('disabled');
    btn.removeAttribute('aria-disabled');
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    return true;
  }
  return false;
}

function startUnlocker() {
  if (!config) return;
  unlockButton();

  observer = new MutationObserver(() => {
    if (isEnabled) unlockButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'aria-disabled', 'style', 'class']
  });

  intervalId = setInterval(() => {
    if (isEnabled) unlockButton();
  }, 300);

  console.log(`[AI Unlocker] ✅ Activé sur ${config.name}`);
}

function stopUnlocker() {
  if (observer) { observer.disconnect(); observer = null; }
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
  if (config) console.log(`[AI Unlocker] ⛔ Désactivé sur ${config.name}`);
}
