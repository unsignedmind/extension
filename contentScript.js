const overlayClass = 'product-image-overlay';
let enabled = false;
let opacity = 0.5;
let imageCount = 0;

const updateCount = () => {
  const imgs = document.querySelectorAll('img');
  const newCount = imgs.length;
  if (newCount !== imageCount) {
    imageCount = newCount;
    chrome.runtime.sendMessage({ type: 'COUNT_UPDATE', count: imageCount });
  }
};

const applyOverlay = (img) => {
  const container = img.parentElement;
  if (!container) return;

  const existing = container.querySelector(`.${overlayClass}`);
  if (existing) {
    existing.style.opacity = opacity;
    return;
  }

  const computed = window.getComputedStyle(container);
  if (computed.position === 'static') {
    container.dataset.originalPosition = 'static';
    container.style.position = 'relative';
  }

  const overlay = document.createElement('div');
  overlay.className = overlayClass;
  overlay.style.opacity = opacity;
  container.appendChild(overlay);
};

const applyToAll = () => {
  document.querySelectorAll('img').forEach(applyOverlay);
  updateCount();
};

const removeAll = () => {
  document.querySelectorAll(`.${overlayClass}`).forEach((overlay) => {
    const container = overlay.parentElement;
    overlay.remove();
    if (container && container.dataset.originalPosition === 'static') {
      container.style.position = '';
      delete container.dataset.originalPosition;
    }
  });
};

const observer = new MutationObserver((mutations) => {
  updateCount();
  if (!enabled) return;
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      if (node.tagName === 'IMG') {
        applyOverlay(node);
      }
      node.querySelectorAll?.('img').forEach(applyOverlay);
    });
  });
});

observer.observe(document.documentElement, { childList: true, subtree: true });

chrome.storage.local.get(['enabled', 'opacity'], (res) => {
  enabled = res.enabled;
  opacity = res.opacity ?? opacity;
  if (enabled) {
    applyToAll();
  } else {
    updateCount();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE') {
    enabled = message.enabled;
    if (enabled) {
      applyToAll();
    } else {
      removeAll();
    }
    updateCount();
  }

  if (message.type === 'OPACITY') {
    opacity = message.opacity;
    if (enabled) {
      document.querySelectorAll(`.${overlayClass}`).forEach((overlay) => {
        overlay.style.opacity = opacity;
      });
    }
  }

  if (message.type === 'COUNT_REQUEST') {
    sendResponse({ count: imageCount });
  }
});
