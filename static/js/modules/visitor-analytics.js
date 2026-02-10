'use strict';

/**
 * Модуль відстеження відвідувачів
 * Використовує sendBeacon для надійної відправки даних при виході
 */

const ANALYTICS_ENDPOINT = '/api/analytics/track/';
const SESSION_KEY = 'sp_analytics_sid';

export function initVisitorAnalytics() {
    // Не трекати ботів
    if (navigator.webdriver) return;
    
    // Поважати Do Not Track
    if (navigator.doNotTrack === '1') return;
    
    const sessionKey = getOrCreateSessionKey();
    const enteredAt = new Date().toISOString();
    const startTime = performance.now();
    
    let dataSent = false;
    
    // Відправити дані при виході зі сторінки
    function sendExitData() {
        if (dataSent) return;
        dataSent = true;
        
        const timeSpent = Math.round((performance.now() - startTime) / 1000);
        const data = JSON.stringify({
            session_key: sessionKey,
            url: location.pathname,
            page_title: document.title,
            entered_at: enteredAt,
            time_spent: timeSpent,
            is_exit: true,
            referrer: document.referrer || '',
        });
        
        // sendBeacon -- надійний при виході
        if (navigator.sendBeacon) {
            navigator.sendBeacon(ANALYTICS_ENDPOINT, data);
        }
    }
    
    // pagehide -- працює на mobile і desktop
    window.addEventListener('pagehide', sendExitData, { once: true });
    
    // visibilitychange як fallback для старих браузерів
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            sendExitData();
        }
    }, { once: true });
}

function getOrCreateSessionKey() {
    let key = sessionStorage.getItem(SESSION_KEY);
    if (!key) {
        // Використовуємо crypto.randomUUID якщо доступний
        if (crypto.randomUUID) {
            key = crypto.randomUUID();
        } else {
            // Fallback для старих браузерів
            key = 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => {
                return Math.floor(Math.random() * 16).toString(16);
            });
        }
        sessionStorage.setItem(SESSION_KEY, key);
    }
    return key;
}

// Автоматична ініціалізація (як footer-accordion.js)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Використати requestIdleCallback для неблокуючої ініціалізації
        if (window.requestIdleCallback) {
            requestIdleCallback(initVisitorAnalytics);
        } else {
            // Fallback -- затримка 2 секунди
            setTimeout(initVisitorAnalytics, 2000);
        }
    });
} else {
    // Документ вже завантажений
    if (window.requestIdleCallback) {
        requestIdleCallback(initVisitorAnalytics);
    } else {
        setTimeout(initVisitorAnalytics, 2000);
    }
}
