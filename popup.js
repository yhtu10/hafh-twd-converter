const rateInput = document.getElementById('rate');
const saveBtn = document.getElementById('save');
const status = document.getElementById('status');
const enabledToggle = document.getElementById('enabled');
const toggleStatus = document.getElementById('toggle-status');

chrome.storage.sync.get({ coinToTwd: 7, enabled: true }, (data) => {
  rateInput.value = data.coinToTwd;
  enabledToggle.checked = data.enabled;
  toggleStatus.textContent = data.enabled ? '已開啟' : '已關閉，所有標籤已隱藏';
});

enabledToggle.addEventListener('change', () => {
  const enabled = enabledToggle.checked;
  chrome.storage.sync.set({ enabled }, () => {
    toggleStatus.textContent = enabled ? '已開啟' : '已關閉，所有標籤已隱藏';
  });
});

saveBtn.addEventListener('click', () => {
  const rate = parseFloat(rateInput.value);
  if (isNaN(rate) || rate <= 0) return;

  chrome.storage.sync.set({ coinToTwd: rate }, () => {
    status.textContent = '已儲存！';
    setTimeout(() => { status.textContent = ''; }, 2000);
  });
});
