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
    document.body.style.overflow = 'hidden';
    
    // Фокус на першому полі
    const firstInput = this.form?.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
  
  close() {
    if (!this.modal) return;
    
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Очистити форму
    if (this.form) {
      this.form.reset();
      this.clearErrors();
    }
  }
  
  isOpen() {
    return this.modal?.getAttribute('aria-hidden') === 'false';
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    if (!this.form) return;
    
    // Валідація форми
    if (!this.validateForm()) {
      return;
    }
    
    // Отримати дані форми
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone')
    };
    
    // Тимчасово: вивести дані в консоль
    console.log('Order call data:', data);
    
    // Тут буде відправка на сервер
    // TODO: Додати AJAX запит на сервер
    
    // Показати повідомлення про успіх
    alert('Дякуємо! Ми зв\'яжемося з вами найближчим часом.');
    
    // Закрити модальне вікно
    this.close();
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




