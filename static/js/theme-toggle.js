/**
 * Theme Toggle Manager
 * Управління перемиканням темної/світлої теми
 */
export class ThemeToggle {
  constructor() {
    this.button = document.querySelector('.theme-toggle__button');
    this.icon = document.querySelector('.theme-toggle__icon');
    this.html = document.documentElement;
    this.storageKey = 'speakup-theme';
    this.autoModeKey = 'speakup-theme-auto';
    this.autoCheckInterval = null;
    
    if (!this.button || !this.icon) {
      console.warn('Theme toggle elements not found');
      return;
    }
    
    this.init();
  }
  
  /**
   * Ініціалізація перемикача теми
   */
  init() {
    const isAuto = this.isAutoMode();
    
    if (isAuto) {
      // Автоматичний режим: використати тему на основі часу
      const timeBasedTheme = this.getTimeBasedTheme();
      this.setTheme(timeBasedTheme, false);
      this.startAutoCheck();
    } else {
      // Ручний режим: використати збережену тему
      const savedTheme = this.getStoredTheme();
      if (savedTheme) {
        this.setTheme(savedTheme, false);
      } else {
        // Якщо немає збереженої теми, використати тему за часом
        const timeBasedTheme = this.getTimeBasedTheme();
        this.setTheme(timeBasedTheme, false);
      }
    }
    
    // Додати обробник події кліку + touch для iOS
    this.button.addEventListener('click', () => this.toggle());
    this.button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.toggle();
    }, { passive: false });
  }
  
  /**
   * Перемикання теми
   */
  toggle() {
    const currentTheme = this.html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // При ручному перемиканні вимкнути автоматичний режим
    this.setAutoMode(false);
    this.setTheme(newTheme, true);
  }
  
  /**
   * Встановити тему
   * @param {string} theme - 'dark' або 'light'
   * @param {boolean} save - чи зберігати в localStorage
   */
  setTheme(theme, save = true) {
    if (theme === 'light') {
      this.html.setAttribute('data-theme', 'light');
    } else {
      this.html.removeAttribute('data-theme');
    }
    
    // SVG іконки перемикаються автоматично через CSS на основі data-theme
    
    if (save && !this.isAutoMode()) {
      // Зберігати тему тільки якщо автоматичний режим вимкнено
      this.saveTheme(theme);
    }
  }
  
  /**
   * Отримати збережену тему з localStorage
   * @returns {string|null}
   */
  getStoredTheme() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (e) {
      console.warn('Failed to read theme from localStorage:', e);
      return null;
    }
  }
  
  /**
   * Зберегти тему в localStorage
   * @param {string} theme - 'dark' або 'light'
   */
  saveTheme(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }
  
  /**
   * Отримати системну тему
   * @returns {string} 'dark' або 'light'
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }
  
  /**
   * Отримати поточний київський час (години)
   * @returns {number} Години (0-23)
   */
  getKievTime() {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Kyiv',
        hour: '2-digit',
        hour12: false
      });
      
      const now = new Date();
      const kievTimeString = formatter.format(now);
      const hours = parseInt(kievTimeString.split(':')[0], 10);
      
      return hours;
    } catch (e) {
      console.warn('Failed to get Kiev time, using local time:', e);
      return new Date().getHours();
    }
  }
  
  /**
   * Отримати тему на основі поточного часу
   * @returns {string} 'dark' або 'light'
   */
  getTimeBasedTheme() {
    const hours = this.getKievTime();
    
    // 07:00-18:00 → світла тема
    // 18:00-07:00 → темна тема
    if (hours >= 7 && hours < 18) {
      return 'light';
    }
    return 'dark';
  }
  
  /**
   * Перевірити чи увімкнено автоматичний режим
   * @returns {boolean}
   */
  isAutoMode() {
    try {
      const autoMode = localStorage.getItem(this.autoModeKey);
      // За замовчуванням автоматичний режим увімкнено (якщо не встановлено явно false)
      return autoMode !== 'false';
    } catch (e) {
      console.warn('Failed to read auto mode from localStorage:', e);
      return true; // За замовчуванням увімкнено
    }
  }
  
  /**
   * Встановити автоматичний режим
   * @param {boolean} enabled - чи увімкнути автоматичний режим
   */
  setAutoMode(enabled) {
    try {
      localStorage.setItem(this.autoModeKey, enabled ? 'true' : 'false');
      
      if (enabled) {
        // Якщо увімкнули автоматичний режим, встановити тему за часом
        const timeBasedTheme = this.getTimeBasedTheme();
        this.setTheme(timeBasedTheme, false);
        this.startAutoCheck();
      } else {
        // Якщо вимкнули, зупинити автоматичну перевірку
        this.stopAutoCheck();
      }
    } catch (e) {
      console.warn('Failed to save auto mode to localStorage:', e);
    }
  }
  
  /**
   * Запустити автоматичну перевірку теми
   */
  startAutoCheck() {
    // Зупинити попередній інтервал якщо він є
    this.stopAutoCheck();
    
    // Перевіряти кожну хвилину
    this.autoCheckInterval = setInterval(() => {
      if (this.isAutoMode()) {
        const timeBasedTheme = this.getTimeBasedTheme();
        const currentTheme = this.html.getAttribute('data-theme') || 'dark';
        
        if (timeBasedTheme !== currentTheme) {
          this.setTheme(timeBasedTheme, false);
        }
      }
    }, 60000); // 60 секунд
  }
  
  /**
   * Зупинити автоматичну перевірку теми
   */
  stopAutoCheck() {
    if (this.autoCheckInterval) {
      clearInterval(this.autoCheckInterval);
      this.autoCheckInterval = null;
    }
  }
}






