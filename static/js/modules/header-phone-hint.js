'use strict';

/**
 * Header Phone Hint - підказка біля кнопки телефону
 * Показує підказку при завантаженні сторінки, приховує при першому scroll або click
 */
export function initHeaderPhoneHint() {
  const hint = document.querySelector('[data-header-phone-hint]');

  if (!hint) {
    console.warn('[Header Phone Hint] Hint element not found');
    return;
  }

  // Показуємо підказку при завантаженні
  hint.classList.add('header__phone-hint--visible');

  // Обробник для приховування при першій взаємодії
  const hideHint = () => {
    hint.classList.remove('header__phone-hint--visible');
    // Видаляємо обробники після першої взаємодії
    window.removeEventListener('scroll', hideHint, { passive: true });
    document.removeEventListener('click', hideHint);
  };

  // Слухаємо scroll з passive режимом для перформансу
  window.addEventListener('scroll', hideHint, { passive: true });

  // Слухаємо click на документі
  document.addEventListener('click', hideHint);
}

export default { initHeaderPhoneHint };
