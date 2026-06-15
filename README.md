# Ia Button Unlocker

> A Chrome extension that automatically re-enables the send button on AI chat platforms when it gets disabled.
![Version](https://img.shields.io/badge/version-2.0-a855f7?style=flat-square)
![Manifest](https://img.shields.io/badge/manifest-v3-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Platforms](https://img.shields.io/badge/platforms-8%20AI%20sites-orange?style=flat-square)

- **Auto-unlock** — detects and re-enables the send button instantly
- **Real-time watching** — uses `MutationObserver` to react the moment the site tries to re-disable it
- **Universal** — works across 8 major AI platforms
- **Persistent state** — remembers ON/OFF setting across sessions
- **Clean UI** — dark-themed popup with live status indicators
- **Lightweight** — no dependencies, pure vanilla JS

> This extension is not on the Chrome Web Store. Install it manually in **Developer Mode**.


### Step 1 — Download

```bash
git clone https://github.com/yourusername/ai-send-button-unlocker.git
```

Or download the ZIP and extract it.

### Step 2 — Load in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Toggle **Developer mode** ON (top right)
3. Click **"Load unpacked"**
4. Select the `ai-unblocker` folder

### Step 3 — Use it

1. Go to any supported AI platform
2. Click the extension icon in your toolbar
3. Toggle **ON** → the send button is now unlocked 

---

## Project Structure

```
ai-unblocker/
├── manifest.json      # Extension config & permissions
├── content.js         # Core logic — injected into AI pages
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic & toggle handling
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## How It Works

The extension uses **two parallel mechanisms** to keep the button unlocked:

```
Page loads
    │
    ▼
content.js injected automatically
    │
    ▼
User toggles ON
    │
    ├──► findButton()       — scans DOM using CSS selectors
    │
    ├──► unlockButton()     — removes: disabled, aria-disabled,
    │                         restores: opacity, pointer-events, cursor
    │
    ├──► MutationObserver   — fires instantly on any DOM attribute change
    │
    └──► setInterval 300ms  — safety net polling fallback
              │
              ▼
         Site tries to re-disable the button
              │
              ▼
         Extension re-enables it immediately 
```
