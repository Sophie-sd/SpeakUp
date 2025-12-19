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
    this.scrollPosition = 0;
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
    // Зберігати позицію ПЕРЕД будь-якими змінами
    this.scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    
    // Обчислити ширину scrollbar перед його зникненням
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    this.isOpen = true;
    this.burger.setAttribute('aria-expanded', 'true');
    this.menu.setAttribute('aria-hidden', 'false');
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'false');
    }
    
    // Використати requestAnimationFrame для плавного переходу
    requestAnimationFrame(() => {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100vw';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      
      // Компенсувати зникнення scrollbar
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    });
  }
  
  close() {
    this.isOpen = false;
    this.burger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'true');
    }
    
    // Відновити стилі
    const scrollbarWidth = document.body.style.paddingRight ? 
      parseInt(document.body.style.paddingRight) : 0;
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.paddingRight = '';
    
    // Використати requestAnimationFrame для плавного відновлення позиції
    requestAnimationFrame(() => {
      // Додаткова затримка для гарантії, що стилі застосовані
      setTimeout(() => {
        if (this.scrollPosition !== undefined && this.scrollPosition !== null) {
          window.scrollTo({
            top: this.scrollPosition,
            behavior: 'auto' // Не використовуємо 'smooth' щоб уникнути конфліктів
          });
        }
      }, 0);
    });
  }
}
