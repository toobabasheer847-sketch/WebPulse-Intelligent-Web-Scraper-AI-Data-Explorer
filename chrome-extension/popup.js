'use strict';

const activateBtn = document.getElementById('activateBtn');
const statusEl = document.getElementById('status');

let isActive = false;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function setActiveState(active) {
  isActive = active;
  activateBtn.disabled = active;
  activateBtn.classList.toggle('active', active);
  activateBtn.textContent = active ? 'Inspector Active…' : 'Activate Inspector';
  setStatus(active ? 'Hover and click any element to copy its selector.' : '');
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function isRestrictedUrl(url) {
  if (!url) return true;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('devtools://')
  );
}

async function sendToContentScript(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
    return chrome.tabs.sendMessage(tabId, message);
  }
}

activateBtn.addEventListener('click', async () => {
  if (isActive) return;

  try {
    const tab = await getActiveTab();

    if (!tab?.id) {
      setStatus('No active tab found.', true);
      return;
    }

    if (isRestrictedUrl(tab.url)) {
      setStatus('Cannot inspect this page. Open a regular website first.', true);
      return;
    }

    setActiveState(true);

    await sendToContentScript(tab.id, { type: 'WEBPULSE_ACTIVATE' });
    setStatus('Inspector enabled — click any element on the page.');
  } catch (err) {
    setActiveState(false);
    setStatus(err?.message || 'Failed to activate inspector on this tab.', true);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'WEBPULSE_SELECTOR_COPIED') {
    setActiveState(false);
    setStatus(`Copied: ${message.selector}`);
    setTimeout(() => window.close(), 400);
  }
});

(async function init() {
  try {
    const tab = await getActiveTab();
    if (!tab?.id || isRestrictedUrl(tab.url)) return;

    const response = await chrome.tabs.sendMessage(tab.id, { type: 'WEBPULSE_STATUS' });
    if (response?.active) {
      setActiveState(true);
    }
  } catch {
    /* content script not yet available on this tab */
  }
})();
