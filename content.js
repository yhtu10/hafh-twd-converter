let COIN_TO_TWD = 7;
let ENABLED = true;

const BADGE_CLASS = 'hafh-twd-badge';

chrome.storage.sync.get({ coinToTwd: 7, enabled: true }, (data) => {
  COIN_TO_TWD = data.coinToTwd;
  ENABLED = data.enabled;
  if (ENABLED) {
    setTimeout(scan, 800);
    setTimeout(scan, 2000);
    setTimeout(scan, 3500);
    setTimeout(scan, 6000);
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    ENABLED = changes.enabled.newValue;
    if (ENABLED) {
      scan();
    } else {
      removeAllBadges();
    }
  }
  if (changes.coinToTwd !== undefined) {
    COIN_TO_TWD = changes.coinToTwd.newValue;
    if (ENABLED) {
      removeAllBadges();
      scan();
    }
  }
});

function formatTWD(amount) {
  return 'NT$ ' + Math.round(amount).toLocaleString('zh-TW');
}

function removeAllBadges() {
  document.querySelectorAll('.' + BADGE_CLASS).forEach(el => el.remove());
}

function scan() {
  // 物件價格
  document.querySelectorAll('.amount-of-coin-container').forEach(container => {
    if (container.querySelector('.' + BADGE_CLASS)) return;
    // 跳過劃掉的原價（span 有 line-through class）
    if (container.querySelector('.line-through')) return;

    const m = container.textContent.match(/(\d[\d,]*)/);
    if (!m) return;
    const coinValue = parseInt(m[1].replace(/,/g, ''), 10);
    if (coinValue <= 0 || coinValue >= 100000) return;

    const badge = document.createElement('span');
    badge.className = BADGE_CLASS;
    badge.textContent = `≈ ${formatTWD(coinValue * COIN_TO_TWD)}`;
    // 插在數字 span 後面，而非容器最尾端
    const numSpan = container.querySelector('.typo-bold');
    if (numSpan) {
      numSpan.insertAdjacentElement('afterend', badge);
    } else {
      container.appendChild(badge);
    }
  });

  // 頁頭餘額
  document.querySelectorAll('.link__price').forEach(priceDiv => {
    if (priceDiv.querySelector('.' + BADGE_CLASS)) return;
    const label = priceDiv.querySelector('.link__label');
    if (!label) return;
    const m = label.textContent.match(/(\d[\d,]*)/);
    if (!m) return;
    const coinValue = parseInt(m[1].replace(/,/g, ''), 10);
    if (coinValue <= 0) return;

    const badge = document.createElement('span');
    badge.className = BADGE_CLASS;
    badge.textContent = `≈ ${formatTWD(coinValue * COIN_TO_TWD)}`;
    label.insertAdjacentElement('afterend', badge);
  });
}

let scanTimer = null;
const observer = new MutationObserver(() => {
  clearTimeout(scanTimer);
  scanTimer = setTimeout(() => { if (ENABLED) scan(); }, 400);
});

observer.observe(document.body, { childList: true, subtree: true });
