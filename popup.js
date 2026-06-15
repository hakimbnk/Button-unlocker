const toggleSwitch = document.getElementById('toggleSwitch');
const siteDot = document.getElementById('siteDot');
const siteName = document.getElementById('siteName');
const siteBadge = document.getElementById('siteBadge');
const btnDot = document.getElementById('btnDot');
const btnText = document.getElementById('btnText');
const toggleSub = document.getElementById('toggleSub');

const SUPPORTED_DOMAINS = [
  'claude.ai', 'chatgpt.com', 'chat.openai.com', 'gemini.google.com',
  'perplexity.ai', 'mistral.ai', 'chat.mistral.ai',
  'huggingface.co', 'poe.com', 'you.com', 'copilot.microsoft.com'
];

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch { return ''; }
}

function isSupported(host) {
  return SUPPORTED_DOMAINS.some(d => host.includes(d));
}

// Load saved state
chrome.storage.local.get(['enabled'], (result) => {
  toggleSwitch.checked = result.enabled || false;
  refreshStatus();
});

function refreshStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    const host = getDomainFromUrl(tabs[0].url || '');

    // Highlight current site in grid
    document.querySelectorAll('.site-item').forEach(el => {
      el.classList.toggle('active-site', host.includes(el.dataset.domain));
    });

    if (!isSupported(host)) {
      siteDot.className = 'site-dot';
      siteName.textContent = host || 'Site non supporté';
      siteBadge.textContent = 'NON SUPPORTÉ';
      siteBadge.className = 'site-badge unsupported';
      btnDot.className = 'btn-dot missing';
      btnText.textContent = 'Allez sur un site IA supporté';
      toggleSub.textContent = 'Site non pris en charge';
      return;
    }

    // Supported site
    siteDot.className = 'site-dot detected';
    siteBadge.textContent = 'SUPPORTÉ ✓';
    siteBadge.className = 'site-badge';

    chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        siteName.textContent = host;
        btnDot.className = 'btn-dot missing';
        btnText.textContent = 'Rechargez la page pour activer';
        toggleSub.textContent = 'Rechargez la page d\'abord';
        return;
      }
      siteName.textContent = response.siteName || host;
      if (response.buttonFound) {
        btnDot.className = 'btn-dot found';
        btnText.textContent = 'Bouton trouvé et débloqué ✓';
        toggleSub.textContent = response.enabled ? 'Extension active' : 'Activez pour débloquer';
      } else {
        btnDot.className = 'btn-dot';
        btnText.textContent = 'Tapez un message pour voir le bouton';
        toggleSub.textContent = 'Bouton pas encore visible';
      }
    });
  });
}

toggleSwitch.addEventListener('change', () => {
  const enabled = toggleSwitch.checked;
  chrome.storage.local.set({ enabled });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', enabled }, (response) => {
      if (chrome.runtime.lastError) {
        // Inject if not loaded
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }).then(() => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', enabled });
          }, 500);
        });
      }
    });
    setTimeout(refreshStatus, 600);
  });
});

// Auto-refresh every 2s
setInterval(refreshStatus, 2000);
refreshStatus();
