'use strict';

/**
 * HTMX Integration Module
 * Обробка CSRF, помилок, lifecycle events
 */

// CSRF Token для HTMX
document.body.addEventListener('htmx:configRequest', (event) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    event.detail.headers['X-CSRFToken'] = csrfToken;
  }
});

// Response Error
document.body.addEventListener('htmx:responseError', (event) => {
  console.error('HTMX Response Error:', event.detail);
  const target = event.detail.target;
  if (target) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'message message--error';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.innerHTML = '<div class="message__text">Помилка завантаження. Спробуйте ще раз.</div>';
    target.insertBefore(errorMsg, target.firstChild);
  }
});

// Send Error
document.body.addEventListener('htmx:sendError', (event) => {
  console.error('HTMX Send Error:', event.detail);
  const target = event.detail.target;
  if (target) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'message message--error';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.innerHTML = '<div class="message__text">Помилка відправки. Перевірте з\'єднання.</div>';
    target.insertBefore(errorMsg, target.firstChild);
  }
});

// After Swap
document.body.addEventListener('htmx:afterSwap', (event) => {
  // Закриття модальних вікон
  if (event.detail.target.classList.contains('modal')) {
    const closeBtn = event.detail.target.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        event.detail.target.remove();
      });
    }
  }
  
  console.log('HTMX content swapped:', event.detail.target);
});

// bfcache для Safari/Firefox
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('Page restored from bfcache');
    if (typeof htmx !== 'undefined') {
      htmx.trigger(document.body, 'pageRestored');
    }
  }
});

export { };


