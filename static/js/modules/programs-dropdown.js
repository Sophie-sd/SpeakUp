'use strict';

/**
 * ProgramsDropdown - Управління випадаючим списком для кнопки "Програми"
 * Підтримує hover на desktop та toggle на всіх пристроях
 */
export class ProgramsDropdown {
  constructor() {
    this.container = document.querySelector('[data-programs-dropdown]');
    this.button = this.container?.querySelector('button[data-nav-tab]');
    this.dropdown = this.container?.querySelector('[data-dropdown-menu]');

    if (!this.container || !this.button || !this.dropdown) {
      console.warn('[ProgramsDropdown] Елементи не знайдені');
      return;
    }

    this.isFixed = false; // Чи dropdown зафіксовано кліком
    this.isOpen = false;  // Чи dropdown відкритий зараз
    this.isMobile = this.checkIfMobile(); // Чи мобільний viewport

    this.setupEventListeners();
    
    // Встановити active якщо на сторінці програм
    if (this.checkIfProgramsPageActive()) {
      this.button.classList.add('header__link--active');
    }
  }

  /**
   * Перевіряє, чи мобільний viewport (≤767px)
   */
  checkIfMobile() {
    return window.matchMedia('(width <= 767px)').matches;
  }

  /**
   * Перевіряє, чи ми на сторінці програм
   */
  checkIfProgramsPageActive() {
    const currentPath = window.location.pathname;
    const programPaths = ['/buy/', '/programs/camp', '/product/misyacz-bezlimitu/', '/programs/'];
    return programPaths.some(path => currentPath === path || currentPath.startsWith(path));
  }

  /**
   * Налаштування всіх обробників подій
   */
  setupEventListeners() {
    // Hover (тільки desktop)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this.button.addEventListener('mouseenter', () => {
        if (!this.isFixed) {
          this.open();
        }
      });

      this.container.addEventListener('mouseleave', () => {
        if (!this.isFixed) {
          this.close();
        }
      });
    }

    // Click (всі пристрої) - toggle фіксації
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      this.isFixed = !this.isFixed;
      
      if (this.isFixed) {
        this.open();
      } else {
        this.close();
      }
    });

    // Outside click (закрити якщо зафіксовано)
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && this.isFixed) {
        this.isFixed = false;
        this.close();
      }
    });

    // Touch support для iOS: touchend для більш надійного закриття (в addition до click)
    document.addEventListener('touchend', (e) => {
      // Спеціально для touch: закриваємо якщо дропдаун зафіксовано і клік зовні
      if (this.isMobile && this.isFixed && !this.container.contains(e.target)) {
        this.isFixed = false;
        this.close();
      }
    }, { passive: true });

    // Escape key для закриття
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.isFixed = false;
        this.close();
        this.button.focus(); // Повернути фокус на кнопку для accessibility
      }
    });
  }

  /**
   * Відкрити dropdown
   */
  open() {
    this.isOpen = true;
    this.dropdown.setAttribute('aria-hidden', 'false');
    this.button.setAttribute('aria-expanded', 'true');
    this.button.classList.add('header__link--active');
    
    // На мобільній додаємо клас для усунення обрізання через overflow
    if (this.isMobile) {
      document.body.classList.add('programs-dropdown-open');
    }
  }

  /**
   * Закрити dropdown
   */
  close() {
    this.isOpen = false;
    this.dropdown.setAttribute('aria-hidden', 'true');
    this.button.setAttribute('aria-expanded', 'false');
    
    // На мобільній знімаємо клас обрізання
    if (this.isMobile) {
      document.body.classList.remove('programs-dropdown-open');
    }
    
    // Залишаємо active тільки якщо на сторінці програм
    if (!this.checkIfProgramsPageActive()) {
      this.button.classList.remove('header__link--active');
    }
  }

  /**
   * Очищення обробників (на випадок, якщо потрібно буде видалити елемент)
   */
  destroy() {
    // Видалення обробників можна додати у разі потреби
    console.log('[ProgramsDropdown] destroyed');
  }
}
