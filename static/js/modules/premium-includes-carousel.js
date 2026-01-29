'use strict';

/**
 * Premium Includes Carousel - горизонтальна навігація для "Що входить в курс"
 */
export function initPremiumIncludesCarousel() {
  const carousel = document.getElementById('includes-carousel');
  const prevBtn = document.getElementById('includes-prev');
  const nextBtn = document.getElementById('includes-next');

  if (!carousel || !prevBtn || !nextBtn) {
    return;
  }

  const scrollAmount = 320; // ширина картки + gap

  prevBtn.addEventListener('click', () => {
    carousel.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  });

  nextBtn.addEventListener('click', () => {
    carousel.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  });

  // Оновлення стану кнопок на основі позиції скролу
  function updateButtonStates() {
    const atStart = carousel.scrollLeft <= 0;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 10;

    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;

    prevBtn.style.opacity = atStart ? '0.5' : '1';
    nextBtn.style.opacity = atEnd ? '0.5' : '1';
  }

  carousel.addEventListener('scroll', updateButtonStates, { passive: true });
  updateButtonStates();
}
