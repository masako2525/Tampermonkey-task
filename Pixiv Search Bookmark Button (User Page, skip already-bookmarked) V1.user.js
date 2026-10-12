// ==UserScript==
// @name         Pixiv Search Bookmark Button (User Page, skip already-bookmarked) V1
// @match        https://www.pixiv.net/search*
// @grant        none
// @version      1.0
// ==/UserScript==

(function () {
  'use strict';

  const DELAY_MS = 1500;

  let stopRequested = false;
  let isRunning = false;

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function getBookmarkButtons() {
    return Array.from(
      document.querySelectorAll('[data-ga4-label="bookmark_button"] button')
    );
  }

  // Tailwindの「任意値クラス」（色コードそのものがクラス名になっているもの）。
  // ハッシュ化クラス名と違い、pixiv側がこの色自体を変えない限り安定して使える。
  const BOOKMARKED_COLOR = '#ff4060';   // いいね済み（ピンク）
  const NOT_BOOKMARKED_COLOR = '#1f1f1f'; // 未いいね（グレー/黒）

  function isAlreadyBookmarked(btn) {
    // 1. aria-pressed があれば最優先（あるかどうかは要確認）
    const ariaPressed = btn.getAttribute('aria-pressed');
    if (ariaPressed === 'true') return true;
    if (ariaPressed === 'false') return false;

    // 2. SVGのclass文字列に含まれる色コードで判定
    const svg = btn.querySelector('svg');
    if (svg) {
      const cls = svg.getAttribute('class') || '';
      if (cls.includes(BOOKMARKED_COLOR)) return true;
      if (cls.includes(NOT_BOOKMARKED_COLOR)) return false;

      console.warn('未知の色クラスを検出。判定できません:', cls);
    }

    console.warn('ブックマーク状態を判定できませんでした。安全側に倒して未ブックマーク扱いにします。');
    return false;
  }

  async function clickAllBookmarks() {
    if (isRunning) {
      console.log('既に実行中です。');
      return;
    }
    isRunning = true;
    stopRequested = false;
    updateButtonUI();

    const buttons = getBookmarkButtons();
    console.log(`対象ボタン数: ${buttons.length}`);

    let clickedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < buttons.length; i++) {
      if (stopRequested) {
        console.log('停止が要求されたため中断しました。');
        break;
      }

      const btn = buttons[i];

      if (isAlreadyBookmarked(btn)) {
        skippedCount++;
        console.log(`(${i + 1}/${buttons.length}) スキップ（既にブックマーク済み）`);
        continue;
      }

      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(300);
      btn.click();
      clickedCount++;
      console.log(`(${i + 1}/${buttons.length}) クリック済み`);
      await sleep(DELAY_MS);
    }

    console.log(`完了: クリック ${clickedCount}件 / スキップ ${skippedCount}件`);
    isRunning = false;
    updateButtonUI();
  }

  function stopBookmarking() {
    stopRequested = true;
    console.log('停止リクエストを受け付けました。現在の待機が終わったら止まります。');
  }

  window.clickAllBookmarks = clickAllBookmarks;
  window.stopBookmarking = stopBookmarking;

  // ====== ここから追加：フローティングボタンUI ======

  const fab = document.createElement('button');
  fab.textContent = '♥ 一括いいね開始';
  fab.style.position = 'fixed';
  fab.style.bottom = '24px';
  fab.style.left = '24px';
  fab.style.zIndex = '999999';
  fab.style.padding = '12px 20px';
  fab.style.borderRadius = '24px';
  fab.style.border = 'none';
  fab.style.background = '#0096fa';
  fab.style.color = '#fff';
  fab.style.fontSize = '14px';
  fab.style.fontWeight = 'bold';
  fab.style.cursor = 'pointer';
  fab.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

  function updateButtonUI() {
    if (isRunning) {
      fab.textContent = '■ 停止';
      fab.style.background = '#ff5050';
    } else {
      fab.textContent = '♥ 一括いいね開始';
      fab.style.background = '#0096fa';
    }
  }

  fab.addEventListener('click', () => {
    if (isRunning) {
      stopBookmarking();
    } else {
      clickAllBookmarks();
    }
  });

  // ページ読み込み完了後にボタンを設置
  window.addEventListener('load', () => {
    document.body.appendChild(fab);
  });

})();
