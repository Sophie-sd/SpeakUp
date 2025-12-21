/**
 * Модуль для керування модальним вікном замовлення дзвінка
 */

export class ModalManager {
  constructor() {
    this.modal = document.getElementById('order-call-modal');
    this.form = document.getElementById('order-call-form');
    this.closeButtons = null;
    this.overlay = null;
    
    if (!this.modal) {
      console.warn('Modal element not found');
      return;
    }
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupCloseHandlers();
  }
  
  setupEventListeners() {
    // Кнопка "Замовити дзвінок" в херо блоці
    const orderCallBtn = document.querySelector('[data-action="order-call"]');
    if (orderCallBtn) {
      orderCallBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    }
    
    // Відправка форми
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
  
  setupCloseHandlers() {
    // Кнопки закриття
    this.closeButtons = this.modal.querySelectorAll('[data-modal-close]');
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });
    
    // Overlay
    this.overlay = this.modal.querySelector('.modal__overlay');
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    
    // ESC для закриття
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }
  
  open() {
    if (!this.modal) return;
    
    this.modal.setAttribute('aria-hidden', 'false');
    
    // iOS Safari fix: блокуємо скрол більш надійним способом
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
    
    // Зберігаємо поточну позицію скролу
    this.scrollPosition = window.scrollY;
    
    // Фокус на першому полі
    const firstInput = this.form?.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
  
  close() {
    if (!this.modal) return;
    
    this.modal.setAttribute('aria-hidden', 'true');
    
    // iOS Safari fix: відновлюємо скрол
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    
    // Відновлюємо позицію скролу
    if (typeof this.scrollPosition === 'number') {
      window.scrollTo(0, this.scrollPosition);
    }
    
    // Очистити форму
    if (this.form) {
      this.form.reset();
      this.clearErrors();
    }
  }
  
  isOpen() {
    return this.modal?.getAttribute('aria-hidden') === 'false';
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.form) return;
    
    // Валідація форми
    if (!this.validateForm()) {
      return;
    }
    
    // Отримання CSRF токена
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!csrfToken) {
      alert('Помилка безпеки: CSRF токен не знайдено');
      return;
    }
    
    // Отримати дані форми
    const formData = new FormData(this.form);
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent;
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Відправка...';
    }
    
    try {
      const response = await fetch('/api/order-call/submit/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Показати повідомлення про успіх
        alert(data.message || 'Дякуємо! Ми зв\'яжемося з вами найближчим часом.');
        
        // Закрити модальне вікно
        this.close();
      } else {
        alert(data.message || 'Помилка при відправці форми. Спробуйте пізніше.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Помилка при відправці форми. Спробуйте пізніше.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        if (originalButtonText) {
          submitButton.textContent = originalButtonText;
        }
      }
    }
  }
  
  validateForm() {
    if (!this.form) return false;
    
    let isValid = true;
    this.clearErrors();
    
    const nameInput = this.form.querySelector('#modal-name');
    const phoneInput = this.form.querySelector('#modal-phone');
    
    // Валідація імені
    if (nameInput) {
      const name = nameInput.value.trim();
      if (name.length < 2) {
        this.showError(nameInput, 'Ім\'я має містити мінімум 2 символи');
        isValid = false;
      }
    }
    
    // Валідація телефону
    if (phoneInput) {
      const phone = phoneInput.value.trim();
      const phonePattern = /^[+0-9\s\-()]{10,}$/;
      if (!phonePattern.test(phone)) {
        this.showError(phoneInput, 'Введіть коректний номер телефону');
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  showError(input, message) {
    if (!input) return;
    
    input.classList.add('error');
    const errorElement = input.parentElement?.querySelector('.field__error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }
  
  clearErrors() {
    if (!this.form) return;
    
    const errorInputs = this.form.querySelectorAll('.field__input.error');
    errorInputs.forEach(input => {
      input.classList.remove('error');
    });
    
    const errorMessages = this.form.querySelectorAll('.field__error');
    errorMessages.forEach(error => {
      error.classList.remove('show');
      error.textContent = '';
    });
  }
}





