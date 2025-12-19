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
    
    // Зберегти в sessionStorage для надійності
    if (this.scrollPosition > 0) {
      sessionStorage.setItem('burgerMenuScrollPosition', this.scrollPosition.toString());
    }
    
    // Обчислити ширину scrollbar перед його зникненням
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    this.isOpen = true;
    this.burger.setAttribute('aria-expanded', 'true');
    this.menu.setAttribute('aria-hidden', 'false');
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'false');
    }
    
    // Використати подвійний requestAnimationFrame для iOS Safari
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Вимкнути smooth scroll тимчасово на html
        const html = document.documentElement;
        const originalScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        
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
        
        // Відновити smooth scroll через невелику затримку
        setTimeout(() => {
          html.style.scrollBehavior = originalScrollBehavior || '';
        }, 50);
      });
    });
  }
  
  close() {
    this.isOpen = false;
    this.burger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'true');
    }
    
    // Відновити scrollPosition з sessionStorage якщо втрачено
    if (!this.scrollPosition || this.scrollPosition === 0) {
      const saved = sessionStorage.getItem('burgerMenuScrollPosition');
      if (saved) {
        this.scrollPosition = parseInt(saved, 10);
      }
    }
    
    // Відновити стилі
    const scrollbarWidth = document.body.style.paddingRight ? 
      parseInt(document.body.style.paddingRight) : 0;
    
    // Вимкнути smooth scroll перед відновленням позиції
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    
    // Вимкнути -webkit-overflow-scrolling тимчасово
    const originalOverflowScrolling = document.body.style.webkitOverflowScrolling;
    document.body.style.webkitOverflowScrolling = 'auto';
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.paddingRight = '';
    
    // Використати подвійний requestAnimationFrame для iOS Safari
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Додаткова затримка для гарантії, що стилі застосовані
        setTimeout(() => {
          if (this.scrollPosition !== undefined && this.scrollPosition !== null && this.scrollPosition >= 0) {
            // Використати window.scrollTo з behavior: 'auto'
            window.scrollTo({
              top: this.scrollPosition,
              behavior: 'auto'
            });
            
            // Для iOS Safari - додаткова перевірка та повторний виклик
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
              // Додаткова затримка для iOS
              setTimeout(() => {
                window.scrollTo({
                  top: this.scrollPosition,
                  behavior: 'auto'
                });
              }, 50);
            }
          }
          
          // Відновити -webkit-overflow-scrolling
          document.body.style.webkitOverflowScrolling = originalOverflowScrolling || '';
          
          // Відновити smooth scroll після відновлення позиції
          setTimeout(() => {
            html.style.scrollBehavior = originalScrollBehavior || '';
          }, 100);
          
          // Очистити sessionStorage
          sessionStorage.removeItem('burgerMenuScrollPosition');
        }, 20); // Збільшена затримка для iOS Safari
      });
    });
  }
}
