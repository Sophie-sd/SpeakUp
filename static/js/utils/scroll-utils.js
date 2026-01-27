'use strict';

/**
 * Scroll Utilities - Допоміжні функції для плавного скролу
 */

/**
 * Прокрутити до елемента консультації з плавною анімацією
 * @param {HTMLElement} element - Елемент для прокрутки
 * @param {string} block - Позиція блоку ('start', 'center', 'end')
 */
export function scrollToConsultation(element, block = 'center') {
  if (!element) return;

  try {
    element.scrollIntoView({
      behavior: 'smooth',
      block: block
    });
  } catch (error) {
    console.warn('[ScrollUtils] scrollIntoView not supported:', error);
    // Fallback для старих браузерів
    element.scrollIntoView();
  }
}

/**
 * Прокрутити до елемента з плавною анімацією
 * @param {HTMLElement} element - Елемент для прокрутки
 * @param {number} offset - Додатковий відступ в пікселях
 */
export function smoothScrollTo(element, offset = 0) {
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * Прокрутити на певну позицію з плавною анімацією
 * @param {number} position - Позиція в пікселях
 */
export function scrollToPosition(position) {
  window.scrollTo({
    top: position,
    behavior: 'smooth'
  });
}

export default {
  scrollToConsultation,
  smoothScrollTo,
  scrollToPosition
};
