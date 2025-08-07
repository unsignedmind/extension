const toggle = document.getElementById('toggle');
const opacitySlider = document.getElementById('opacity');
const colorPicker = document.getElementById('colorPicker');
const countDiv = document.getElementById('count');

const updateCount = (count) => {
  countDiv.textContent = `Images found: ${count}`;
};

chrome.storage.local.get(['enabled', 'opacity', 'colorHex'], (res) => {
  const enabled = res.enabled;
  toggle.checked = enabled;
  opacitySlider.value = res.opacity ?? 0.0;
  opacitySlider.disabled = !enabled;
  colorPicker.value = res.colorHex;
  document.querySelector('#opacityValue').textContent = res.opacity;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'COUNT_REQUEST' }, (response) => {
      if (response) updateCount(response.count);
    });
  });
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  opacitySlider.disabled = !enabled;
  chrome.storage.local.set({ enabled });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'ENABLE', enabled });
  });
});

opacitySlider.addEventListener('input', () => {
  const opacity = parseFloat(opacitySlider.value);
  document.querySelector('#opacityValue').textContent = opacity;
  chrome.storage.local.set({ opacity });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'OPACITY', opacity });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'COUNT_UPDATE') {
    updateCount(message.count);
  }
});

const picker = document.getElementById('colorPicker');
const valueLabel = document.getElementById('colorValue');

function hexToRgb(hex) {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  const iv = m ? parseInt(m[1], 16) : 0;
  return {
    r: (iv >> 16) & 0xff,
    g: (iv >> 8) & 0xff,
    b: iv & 0xff,
  };
}

// 3. Add the event listener
picker.addEventListener('input', (e) => {
  const hex = e.target.value;                    // e.g. "#3a5fcd"
  const { r, g, b } = hexToRgb(hex);              // convert to {r,g,b}
  const rgbString = `rgb(${r},${g},${b})`;

  // Update the label in the popup
  valueLabel.textContent = rgbString;

  // Persist the new color
  chrome.storage.local.set({ colorHex: hex });

  // Notify the content script
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'COLOR_CHANGE',
      colorHex: hex
    });
  });
});


