/**
 * Consultation Form Handler
 * Обробка HTMX форми консультації, очищення та показ повідомлень
 */

export class ConsultationFormHandler {
  constructor() {
    this.initializeListeners();
  }

  initializeListeners() {
    // Обробка успішної відправки форми (afterSwap)
    document.addEventListener('htmx:afterSwap', (e) => {
      this.handleAfterSwap(e);
    });

    // Обробка помилок
    document.addEventListener('htmx:responseError', (e) => {
      this.handleError(e);
    });

    // Обробка мережних помилок
    document.addEventListener('htmx:sendError', (e) => {
      this.handleError(e);
    });
  }

  handleAfterSwap(e) {
    const target = e.detail.target;
    
    // Перевірити чи це success message від консультації
    if (target.dataset.success === 'consultation' || target.classList.contains('message--success')) {
      this.handleSuccess(target);
    }
  }

  handleSuccess(successElement) {
    // Автоматично закрити повідомлення через 5 секунд
    const closeTimer = setTimeout(() => {
      this.closeMessage(successElement);
    }, 5000);

    // Обробник закриття по кліку на кнопку закриття
    const closeButton = successElement.querySelector('.message__close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        clearTimeout(closeTimer);
        this.closeMessage(successElement);
      });
    }
  }

  closeMessage(messageElement) {
    // Додати клас для анімації закриття
    messageElement.classList.add('message--closing');
    
    // Видалити елемент через 300ms (час анімації)
    setTimeout(() => {
      messageElement.remove();
    }, 300);
  }

  handleError(e) {
    console.error('Помилка форми консультації:', e);
  }
}

// Ініціалізація при загрузці DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ConsultationFormHandler();
  });
} else {
  new ConsultationFormHandler();
}
