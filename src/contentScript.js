const imageContainerSelector = '[class^="image-section_component_image-section__"]';
let enabled = false;
let currentOpacity = 0.03;
let currentColorHex = '#000000';
let imageCount = 0;

function hexToRgb(hex) {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  const iv = m ? parseInt(m[1], 16) : 0;
  return {
    r: (iv >> 16) & 0xff,
    g: (iv >> 8) & 0xff,
    b: iv & 0xff,
  };
}


const updateCount = () => {
  const images = document.querySelectorAll(imageContainerSelector);
  const newCount = images.length;
  if (newCount !== imageCount) {
    imageCount = newCount;
    chrome.runtime.sendMessage({ type: 'COUNT_UPDATE', count: imageCount });
  }
};

chrome.storage.local.get(['enabled','opacity','colorHex'], res => {
  currentColorHex = res.colorHex || currentColorHex;
  currentOpacity  = res.opacity  || currentOpacity;
  enabled         = res.enabled;
  if (enabled) enableOverlay(currentOpacity);
  else updateCount();
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE') {
    enabled = message.enabled;
    if (enabled) {
      enableOverlay(currentOpacity)
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

  if (message.type === 'COLOR_CHANGE') {
    currentColorHex = message.colorHex;
    if (enabled) enableOverlay(currentOpacity, currentColorHex);  // update the injected style
    sendResponse({ status: 'ok' });
  }
});

// 1. Create and inject the rule
function enableOverlay(opacity = currentOpacity, color = currentColorHex) {
  disableOverlay();
  const { r, g, b } = hexToRgb(color);
  if (document.getElementById('product-list-overlay-style')) return;
  const style = document.createElement('style');
  style.id = 'product-list-overlay-style';
  style.textContent = `
    [class^="product-list_component_product-list__tile__"]::after {
      content: "";
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: rgba(${r}, ${g}, ${b}, ${opacity});
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

