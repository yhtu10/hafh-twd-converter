async function setActionIcon() {
  try {
    const url = chrome.runtime.getURL('icon.svg');
    const response = await fetch(url);
    const svgText = await response.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });

    const sizes = [16, 32, 48, 128];
    const imageData = {};

    for (const size of sizes) {
      const bitmap = await createImageBitmap(blob, {
        resizeWidth: size,
        resizeHeight: size,
        resizeQuality: 'high',
      });
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      imageData[size] = ctx.getImageData(0, 0, size, size);
    }

    await chrome.action.setIcon({ imageData });
  } catch (e) {
    console.error('HafH icon error:', e);
  }
}

chrome.runtime.onInstalled.addListener(setActionIcon);
chrome.runtime.onStartup.addListener(setActionIcon);
