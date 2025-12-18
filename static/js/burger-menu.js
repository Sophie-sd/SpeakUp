/**
 * Модуль для керування бургер-меню в хедері
 */

export class BurgerMenu {
  constructor() {
    this.burger = document.querySelector('[data-burger-toggle]');
    this.menu = document.querySelector('[data-burger-menu]');
    this.overlay = document.querySelector('[data-burger-overlay]');
    
    if (!this.burger || !this.menu) {
      console.warn('Burger menu elements not found');
      return;
    }
    
    this.isOpen = false;
    this.init();
  }
  
  init() {
    // Встановити початковий стан
    this.burger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'true');
    }
    
    // Додати event listeners
    this.burger.addEventListener('click', () => this.toggle());
    
    // Закрити при кліку на overlay
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    
    // Закрити при кліку поза меню
    document.addEventListener('click', (e) => {
      if (this.isOpen && 
          !this.menu.contains(e.target) && 
          !this.burger.contains(e.target) &&
          (!this.overlay || !this.overlay.contains(e.target))) {
        this.close();
      }
    });
    
    // Закрити при кліку на посилання в меню
    const links = this.menu.querySelectorAll('.header__dropdown-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        this.close();
      });
    });
    
    // Закрити при натисканні Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    this.isOpen = true;
    this.burger.setAttribute('aria-expanded', 'true');
    this.menu.setAttribute('aria-hidden', 'false');
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'false');
    }
    
    // Запобігти скролу body при відкритому меню
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.isOpen = false;
    this.burger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'true');
    }
    
    // Відновити скрол body
    document.body.style.overflow = '';
  }
}
