// ==UserScript==
// @name         Niconico My Page "Show More" Auto-Click
// @namespace    https://www.nicovideo.jp/
// @version      1.0
// @description  ボタンを押すとページを監視し、「さらに表示する」ボタンを自動でクリックし続けます。もう一度押すと停止します。
// @author       you
// @match        https://www.nicovideo.jp/my/timeline/video
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let watching = false;   // 監視中かどうか
    let intervalId = null;  // setIntervalのID

    // 画面右下に浮かせる操作ボタンを作成
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '自動もっと見る: OFF';
    Object.assign(toggleBtn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 999999,
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#888',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(toggleBtn);

    function updateButtonUI() {
        if (watching) {
            toggleBtn.textContent = '自動もっと見る: ON（監視中）';
            toggleBtn.style.backgroundColor = '#2e9e44';
        } else {
            toggleBtn.textContent = '自動もっと見る: OFF';
            toggleBtn.style.backgroundColor = '#888';
        }
    }

    // 「さらに表示する」ボタンを探してクリックする処理
    function clickMoreButtonIfExists() {
        const moreBtn = document.querySelector('button.Timeline-more');
        if (moreBtn) {
            moreBtn.click();
            console.log('[自動もっと見る] 「さらに表示する」をクリックしました');
        }
    }

    function startWatching() {
        watching = true;
        updateButtonUI();
        // 即時に一度チェックしてから、以降1秒ごとに監視
        clickMoreButtonIfExists();
        intervalId = setInterval(clickMoreButtonIfExists, 1000);
    }

    function stopWatching() {
        watching = false;
        updateButtonUI();
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    toggleBtn.addEventListener('click', () => {
        if (watching) {
            stopWatching();
        } else {
            startWatching();
        }
    });
})();
