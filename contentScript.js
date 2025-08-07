const overlayClass = 'product-image-overlay';
const tileSelector = '[class^="product-list_component_product-list__tile__"]';
const imageContainerSelector = '[class^="image-section_component_image-section__"]';
let enabled = false;
let currentOpacity = 0.03;
let imageCount = 0;

const updateCount = () => {
  const images = document.querySelectorAll(imageContainerSelector);
  const newCount = images.length;
  if (newCount !== imageCount) {
    imageCount = newCount;
    chrome.runtime.sendMessage({ type: 'COUNT_UPDATE', count: imageCount });
  }
};

chrome.storage.local.get(['enabled', 'opacity'], (res) => {
  enabled = res.enabled;
  currentOpacity = res.opacity ?? currentOpacity;
  if (enabled) {
    enableOverlay(currentOpacity);
  } else {
    updateCount();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE') {
    enabled = message.enabled;
    if (enabled) {
      enableOverlay()
    } else {
      disableOverlay()
    }
    updateCount();
  }

  if (message.type === 'OPACITY') {
    currentOpacity = message.opacity;
    if (enabled) {
      enableOverlay(currentOpacity);
    }
  }

  if (message.type === 'COUNT_REQUEST') {
    sendResponse({ count: imageCount });
  }
});

// 1. Create and inject the rule
function enableOverlay(opacity = opacity) {
  disableOverlay();
  if (document.getElementById('product-list-overlay-style')) return;
  const style = document.createElement('style');
  style.id = 'product-list-overlay-style';
  style.textContent = `
    [class^="product-list_component_product-list__tile__"]::after {
      content: "";
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: rgba(0, 0, 0, ${opacity});
      border-radius: 1rem;
      z-index: 1;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

// 2. Remove the rule
function disableOverlay() {
  const style = document.getElementById('product-list-overlay-style');
  if (style) style.remove();
}

