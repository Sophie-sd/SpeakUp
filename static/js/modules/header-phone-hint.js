'use strict';

/**
 * Header Phone Hint - підказка біля кнопки телефону
 * Показує підказку при завантаженні сторінки, приховує при першому scroll або click
 * Також показує при наведенні на кнопку телефону
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

  // === Hover функціональність ===
  // Знаходимо wrapper кнопки телефону
  const phoneButtonWrap = hint.closest('.header__phone-btn-wrap');

  if (phoneButtonWrap) {
    // При наведенні на кнопку - показуємо підказку
    phoneButtonWrap.addEventListener('mouseenter', () => {
      hint.classList.add('header__phone-hint--visible');
    });

    // При знятті курсору - ховаємо підказку
    phoneButtonWrap.addEventListener('mouseleave', () => {
      hint.classList.remove('header__phone-hint--visible');
    });
  }
}

export default { initHeaderPhoneHint };
