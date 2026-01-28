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

  // Знаходимо wrapper кнопки телефону для перевірки цілі кліку
  const phoneButtonWrap = hint.closest('.header__phone-btn-wrap');

  // Обробник для приховування при першій взаємодії
  const hideHint = (event) => {
    // Для click-подій: не ховати, якщо клік був по кнопці телефону
    if (event && event.type === 'click' && phoneButtonWrap) {
      if (phoneButtonWrap.contains(event.target)) {
        return; // Не ховаємо, якщо клік всередині wrap
      }
    }

    hint.classList.remove('header__phone-hint--visible');
    // Видаляємо обробники після першої взаємодії
    window.removeEventListener('scroll', hideHint, { passive: true });
    document.removeEventListener('click', hideHint);
  };

  // На touch-пристроях підвішувати слухачі з затримкою, щоб підказка залишалась видимою при завантаженні
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouch) {
    // На мобільних: затримка перед підписанням, щоб браузерний scroll при завантаженні не ховав підказку
    setTimeout(() => {
      // Слухаємо scroll з passive режимом для перформансу
      window.addEventListener('scroll', hideHint, { passive: true });

      // Слухаємо click на документі
      document.addEventListener('click', hideHint);
    }, 500);
  } else {
    // На десктопі: підписуємось одразу
    window.addEventListener('scroll', hideHint, { passive: true });
    document.addEventListener('click', hideHint);
  }

  // === Hover функціональність ===
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
