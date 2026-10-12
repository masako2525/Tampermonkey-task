// ==UserScript==
// @name         Iwara Like & Download V8 (Safe Mode)
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  ページ読み込み完了を待ち、競合を防ぎながらボタンを設置する安全版
// @author       Restress
// @match        https://www.iwara.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const BUTTON_ID = "restress-iwara-btn";

    // XPath検索関数
    function getElementByXPath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    function createButton() {
        // 二重生成防止（念には念を）
        if (document.getElementById(BUTTON_ID)) return;

        const btn = document.createElement("button");
        btn.id = BUTTON_ID;
        btn.innerHTML = "❤️ いいね & 💾 DL";

        Object.assign(btn.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: "9999",
            padding: "15px 30px",
            backgroundColor: "#ff0055",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
        });

        document.body.appendChild(btn);

        btn.addEventListener("click", function() {
            // 1. いいね
            const allHearts = document.querySelectorAll('svg[data-icon="heart"]');
            for (const heart of allHearts) {
                if (heart.closest('a')) continue;
                const realLikeBtn = heart.closest('button') || heart.closest('.icon');
                if (realLikeBtn) {
                    realLikeBtn.click();
                    console.log("Like clicked.");
                    break;
                }
            }

            // 2. ダウンロード
            const dlIcon = document.querySelector('svg[data-icon="download"]');
            if (dlIcon) {
                const clickTarget = dlIcon.closest('.text--small') || dlIcon.parentNode;
                clickTarget.click();

                setTimeout(() => {
                    let targetLink = getElementByXPath("//a[contains(text(), 'Source')]");
                    if (!targetLink) {
                        targetLink = getElementByXPath("//div[contains(@class, 'v-menu__content')]//a");
                    }

                    if (targetLink && targetLink.href) {
                        window.open(targetLink.href, '_blank');
                    } else {
                        const allMenuLinks = document.querySelectorAll('.v-menu__content a, .dropdown-content a');
                        if (allMenuLinks.length > 0 && allMenuLinks[0].href) {
                            window.open(allMenuLinks[0].href, '_blank');
                        } else {
                            alert("ダウンロードリンクが見つかりませんでした。");
                        }
                    }
                }, 1000);
            } else {
                alert("ダウンロードボタンが見つかりません。");
            }
        });
    }

    function removeButton() {
        const btn = document.getElementById(BUTTON_ID);
        if (btn) btn.remove();
    }

    // ★安全装置：ページの読み込み状態を監視
    // サイトが重い時に、スクリプトが暴れてクラッシュさせるのを防ぐ
    let isPageLoaded = false;

    // ページが完全に読み込まれたらフラグを立てる
    if (document.readyState === 'complete') {
        isPageLoaded = true;
    } else {
        window.addEventListener('load', () => { isPageLoaded = true; });
    }

    setInterval(() => {
        // まだ読み込み中なら何もしない
        if (!isPageLoaded) return;

        const currentUrl = window.location.href;
        if (currentUrl.includes("/video/")) {
            createButton();
        } else {
            removeButton();
        }
    }, 1000);

})();
