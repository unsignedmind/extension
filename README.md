# Product Image Overlay Extension

A Chrome extension that overlays a semi-transparent layer over product images on any page. It is useful for rapid visual prototyping.

## Features

- Toggle overlay on/off from the popup.
- Opacity slider to adjust transparency.
- Live count of images on the current tab.
- Remembers enabled state and opacity using `chrome.storage.local`.

## Development

1. Open **chrome://extensions** in Chrome.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this folder.
4. The extension icon will appear in the toolbar.

## Files

- `manifest.json` – Extension configuration.
- `background.js` – Initializes default settings.
- `contentScript.js` – Injects overlays and watches for DOM changes.
- `overlay.css` – Basic overlay styling.
- `popup/` – Popup UI code.
