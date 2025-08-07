const toggle = document.getElementById('toggle');
const opacitySlider = document.getElementById('opacity');
const countDiv = document.getElementById('count');

const updateCount = (count) => {
  countDiv.textContent = `Images found: ${count}`;
};

chrome.storage.local.get(['enabled', 'opacity'], (res) => {
  const enabled = res.enabled;
  toggle.checked = enabled;
  opacitySlider.value = res.opacity ?? 0.0;
  opacitySlider.disabled = !enabled;

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
