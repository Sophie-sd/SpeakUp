'use strict';

/**
 * Scroll Lock Utility - Уніфіковане блокування/розблокування скролу
 * Зберігає позицію скролу і компенсує scrollbar
 */

let scrollPosition = 0;

/**
 * Блокує вертикальний скрол сторінки
 * Зберігає поточну позицію та компенсує ширину scrollbar
 */
export function lockScroll() {
  // Пропустити, якщо вже заблоковано
  if (document.body.style.overflow === 'hidden') {
    return;
  }

  // Зберегти поточну позицію скролу
  scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

  // Обчислити ширину scrollbar
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  // Застосувати стилі для блокування скролу
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100vw';

  // Компенсація scrollbar
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

/**
 * Розблокує вертикальний скрол сторінки
 * Відновлює поточну позицію
 */
export function unlockScroll() {
  // Очистити стилі
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.paddingRight = '';

  // Відновити позицію скролу
  if (scrollPosition > 0) {
    // Тимчасово вимкнути smooth scroll щоб позиція відновилася миттєво
    const htmlElement = document.documentElement;
    const originalScrollBehavior = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = 'auto';

    window.scrollTo({
      top: scrollPosition,
      behavior: 'auto'
    });

    // Відновити оригінальну scroll-behavior через наступний frame
    requestAnimationFrame(() => {
      htmlElement.style.scrollBehavior = originalScrollBehavior;
    });
  }

  scrollPosition = 0;
}

export default { lockScroll, unlockScroll };
