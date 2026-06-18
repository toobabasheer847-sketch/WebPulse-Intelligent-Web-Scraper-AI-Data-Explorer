(function () {
  'use strict';

  let inspectorActive = false;
  let highlightedElement = null;
  const originalStyles = new WeakMap();

  const HIGHLIGHT_OUTLINE = '3px solid #FFA052';
  const HIGHLIGHT_SHADOW = '0 0 14px rgba(255, 160, 82, 0.65), 0 0 4px rgba(168, 85, 247, 0.4)';

  function isExtensionElement(el) {
    return el?.closest?.('[data-webpulse-extension]');
  }

  function saveOriginalStyle(el, prop) {
    if (!originalStyles.has(el)) {
      originalStyles.set(el, {});
    }
    const saved = originalStyles.get(el);
    if (!(prop in saved)) {
      saved[prop] = el.style.getPropertyValue(prop);
    }
  }

  function clearHighlight() {
    if (!highlightedElement) return;

    const saved = originalStyles.get(highlightedElement) || {};
    highlightedElement.style.outline = saved.outline ?? '';
    highlightedElement.style.outlineOffset = saved.outlineOffset ?? '';
    highlightedElement.style.boxShadow = saved.boxShadow ?? '';
    highlightedElement = null;
  }

  function applyHighlight(el) {
    if (!el || el === highlightedElement || isExtensionElement(el)) return;

    clearHighlight();
    highlightedElement = el;

    saveOriginalStyle(el, 'outline');
    saveOriginalStyle(el, 'outlineOffset');
    saveOriginalStyle(el, 'boxShadow');

    el.style.outline = HIGHLIGHT_OUTLINE;
    el.style.outlineOffset = '2px';
    el.style.boxShadow = HIGHLIGHT_SHADOW;
  }

  function escapeSelector(value) {
    if (typeof CSS !== 'undefined' && CSS.escape) {
      return CSS.escape(value);
    }
    return value.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
  }

  function isUniqueSelector(selector) {
    try {
      return document.querySelectorAll(selector).length === 1;
    } catch {
      return false;
    }
  }

  function getClassList(el) {
    if (!el.classList) return [];
    return Array.from(el.classList).filter((cls) => cls && !cls.startsWith('webpulse-'));
  }

  function getCssSelector(element) {
    if (!(element instanceof Element)) return '';

    if (element.id) {
      const idSelector = `#${escapeSelector(element.id)}`;
      if (isUniqueSelector(idSelector)) return idSelector;
    }

    const tag = element.tagName.toLowerCase();
    const classes = getClassList(element);

    if (classes.length) {
      const classSelector = `${tag}.${classes.map(escapeSelector).join('.')}`;
      if (isUniqueSelector(classSelector)) return classSelector;

      for (const cls of classes) {
        const singleClassSelector = `${tag}.${escapeSelector(cls)}`;
        if (isUniqueSelector(singleClassSelector)) return singleClassSelector;
      }
    }

    if (isUniqueSelector(tag)) return tag;

    const path = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
      let segment = current.tagName.toLowerCase();

      if (current.id) {
        segment = `#${escapeSelector(current.id)}`;
        path.unshift(segment);
        break;
      }

      const classNames = getClassList(current);
      if (classNames.length) {
        segment += `.${classNames.map(escapeSelector).join('.')}`;
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.tagName === current.tagName
        );
        if (siblings.length > 1) {
          segment += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }

      path.unshift(segment);
      current = current.parentElement;
    }

    const fullPath = path.join(' > ');
    if (isUniqueSelector(fullPath)) return fullPath;

    return path.length ? fullPath : tag;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      textarea.remove();
      return ok;
    }
  }

  function showToast(selector) {
    const existing = document.querySelector('[data-webpulse-extension="toast"]');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.setAttribute('data-webpulse-extension', 'toast');
    toast.textContent = `Selector Copied: ${selector} (Copied to Clipboard!)`;

    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '2147483647',
      padding: '14px 22px',
      background: 'linear-gradient(135deg, #180E31 0%, #0B051D 100%)',
      color: '#E9D5FF',
      border: '1px solid rgba(168, 85, 247, 0.45)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(88, 28, 135, 0.55), 0 0 20px rgba(255, 160, 82, 0.25)',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '0.01em',
      maxWidth: '90vw',
      textAlign: 'center',
      pointerEvents: 'none',
      animation: 'webpulse-toast-in 0.35s ease-out',
    });

    if (!document.getElementById('webpulse-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'webpulse-toast-styles';
      style.textContent = `
        @keyframes webpulse-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes webpulse-toast-out {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to   { opacity: 0; transform: translateX(-50%) translateY(-12px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'webpulse-toast-out 0.3s ease-in forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function deactivateInspector() {
    inspectorActive = false;
    clearHighlight();
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleClick, true);
    document.body.style.cursor = '';
  }

  function activateInspector() {
    if (inspectorActive) return;
    inspectorActive = true;
    document.body.style.cursor = 'crosshair';
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
  }

  function handleMouseMove(event) {
    if (!inspectorActive) return;
    const el = document.elementFromPoint(event.clientX, event.clientY);
    if (!el || isExtensionElement(el)) return;
    applyHighlight(el);
  }

  function handleMouseOut(event) {
    if (!inspectorActive) return;
    if (highlightedElement && event.target === highlightedElement) {
      clearHighlight();
    }
  }

  async function handleClick(event) {
    if (!inspectorActive) return;

    const target = event.target;
    if (!(target instanceof Element) || isExtensionElement(target)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const selector = getCssSelector(target);
    const copied = await copyToClipboard(selector);

    showToast(copied ? selector : `${selector} (copy failed — see console)`);
    deactivateInspector();

    try {
      chrome.runtime.sendMessage({
        type: 'WEBPULSE_SELECTOR_COPIED',
        selector,
        copied,
      });
    } catch {
      /* popup may already be closed */
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'WEBPULSE_ACTIVATE') {
      activateInspector();
      sendResponse({ ok: true, active: true });
      return true;
    }

    if (message?.type === 'WEBPULSE_DEACTIVATE') {
      deactivateInspector();
      sendResponse({ ok: true, active: false });
      return true;
    }

    if (message?.type === 'WEBPULSE_STATUS') {
      sendResponse({ ok: true, active: inspectorActive });
      return true;
    }
  });
})();
