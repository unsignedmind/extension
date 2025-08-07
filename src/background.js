chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: false, opacity: 0.03 });
});
