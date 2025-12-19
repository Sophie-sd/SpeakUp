/**
 * iOS Sticky Positioning Utilities
 * 
 * Цей модуль надає безпечну альтернативу position: fixed для iOS Safari.
 * position: fixed викликає проблеми на iOS при скроллі (елементи "стрибають").
 * 
 * Замість цього використовуйте position: sticky, який працює надійніше.
 * 
 * Використання:
 * import { createStickyElement, makeStickyHeaderFooter } from './ios-sticky.js';
 * 
 * const header = createStickyElement('header', { top: 0 });
 * document.body.prepend(header);
 */

/**
 * Створює елемент з безпечним sticky позиціонуванням для iOS
 * 
 * ❌ НІКОЛИ не використовуйте position: fixed - це викликає баги на iOS Safari
 * ✅ ЗАВЖДИ використовуйте position: sticky через цю функцію або клас .ios-safe-sticky
 * 
 * @param {string} tagName - Назва HTML елемента ('header', 'nav', 'footer', тощо)
 * @param {Object} [options] - Опції позиціонування
 * @param {number} [options.top] - Відстань від верху в px (для sticky)
 * @param {number} [options.bottom] - Відстань від низу в px (для sticky)
 * @param {number} [options.zIndex=100] - z-index для елемента
 * @param {string} [options.backgroundColor] - Колір фону
 * @param {Object} [options.attributes] - HTML атрибути
 * @param {Object} [options.customStyle] - Додаткові CSS стилі
 * 
 * @returns {HTMLElement} Елемент з applied sticky позиціонуванням
 * 
 * @example
 * // Простий sticky header
 * const header = createStickyElement('header', {
 *   top: 0,
 *   zIndex: 100,
 *   backgroundColor: '#fff'
 * });
 * document.body.prepend(header);
 * 
 * // Sticky footer з атрибутами
 * const footer = createStickyElement('footer', {
 *   bottom: 0,
 *   attributes: {
 *     id: 'main-footer',
 *     class: 'footer-bar'
 *   }
 * });
 */
export function createStickyElement(tagName = 'div', options = {}) {
  const {
    top,
    bottom,
    zIndex = 100,
    backgroundColor,
    attributes = {},
    customStyle = {}
  } = options;
  
  // Створення елемента
  const element = document.createElement(tagName);
  
  // Додавання атрибутів
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'class') {
      element.classList.add(...value.split(' '));
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Додавання базових стилів для sticky позиціонування
  const baseStyles = {
    position: '-webkit-sticky', // Safari
    WebkitSticky: true,
    position: 'sticky',
    zIndex: `${zIndex}`,
  };
  
  // Додавання top/bottom
  if (typeof top === 'number') {
    baseStyles.top = `${top}px`;
  }
  if (typeof bottom === 'number') {
    baseStyles.bottom = `${bottom}px`;
  }
  
  // Додавання backgroundColor якщо передано
  if (backgroundColor) {
    baseStyles.backgroundColor = backgroundColor;
  }
  
  // Об'єднання з custom стилями
  const allStyles = {
    ...baseStyles,
    ...customStyle
  };
  
  // Застосування стилів до елемента
  applyStyles(element, allStyles);
  
  return element;
}

/**
 * Конвертує element з position: fixed на position: sticky
 * 
 * Використовуйте цю функцію якщо у вас вже є елемент з position: fixed,
 * який потрібно конвертувати на iOS-безпечну версію.
 * 
 * @param {HTMLElement} element - Елемент для конвертування
 * @param {Object} [options] - Опції для sticky позиціонування
 * @param {number} [options.top] - Відстань від верху (якщо не встановлена)
 * @param {number} [options.bottom] - Відстань від низу (якщо не встановлена)
 * 
 * @returns {HTMLElement} Той же елемент з оновленим позиціонуванням
 * 
 * @example
 * const header = document.querySelector('header');
 * // Було position: fixed - конвертуємо
 * fixedToSticky(header, { top: 0 });
 */
export function fixedToSticky(element, options = {}) {
  const { top, bottom } = options;
  
  // Видаляємо position: fixed
  element.style.position = 'sticky';
  element.style.webkitPosition = '-webkit-sticky'; // Safari
  
  // Встановлюємо top або bottom
  if (typeof top === 'number') {
    element.style.top = `${top}px`;
  } else if (typeof bottom === 'number') {
    element.style.bottom = `${bottom}px`;
  }
  
  // Переконуємось що есть z-index
  if (!element.style.zIndex) {
    element.style.zIndex = '100';
  }
  
  return element;
}

/**
 * Встановлює sticky позиціонування для header та footer одночасно
 * 
 * Це корисна утиліта для типового дизайну з sticky header та footer
 * 
 * @param {Object} options - Опції налаштування
 * @param {HTMLElement} [options.header] - Header елемент
 * @param {HTMLElement} [options.footer] - Footer елемент
 * @param {number} [options.headerTop=0] - Відстань header від верху
 * @param {number} [options.footerBottom=0] - Відстань footer від низу
 * @param {number} [options.headerZIndex=100] - z-index для header
 * @param {number} [options.footerZIndex=100] - z-index для footer
 * @param {string} [options.backgroundColor='inherit'] - Колір фону
 * 
 * @returns {Object} Об'єкт з посиланнями на header та footer
 * 
 * @example
 * makeStickyHeaderFooter({
 *   header: document.querySelector('header'),
 *   footer: document.querySelector('footer'),
 *   headerTop: 0,
 *   footerBottom: 0,
 *   backgroundColor: '#fff'
 * });
 */
export function makeStickyHeaderFooter(options = {}) {
  const {
    header,
    footer,
    headerTop = 0,
    footerBottom = 0,
    headerZIndex = 100,
    footerZIndex = 100,
    backgroundColor = 'inherit'
  } = options;
  
  if (header) {
    applyStyles(header, {
      position: 'sticky',
      WebkitPosition: '-webkit-sticky',
      top: `${headerTop}px`,
      zIndex: `${headerZIndex}`,
      backgroundColor
    });
  }
  
  if (footer) {
    applyStyles(footer, {
      position: 'sticky',
      WebkitPosition: '-webkit-sticky',
      bottom: `${footerBottom}px`,
      zIndex: `${footerZIndex}`,
      backgroundColor
    });
  }
  
  return { header, footer };
}

/**
 * Утиліта для безпечного застосування стилів без використання inline style
 * Це допомагає дотримуватись CSP та уникати inline стилів де можливо
 * 
 * @param {HTMLElement} element - Елемент
 * @param {Object} styles - Об'єкт зі стилями
 * @private
 */
function applyStyles(element, styles) {
  Object.entries(styles).forEach(([key, value]) => {
    // Конвертуємо camelCase на kebab-case для CSS властивостей
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Видаляємо "webkit" префікс із ключів (обробляємо окремо)
    if (key === 'WebkitPosition') {
      element.style.webkitPosition = value;
    } else {
      element.style[key] = value;
    }
  });
}

/**
 * Обчислює поточну відстань sticky елемента від краю viewport
 * 
 * Корисно для визначення коли sticky елемент дійсно "залипає"
 * 
 * @param {HTMLElement} element - Sticky елемент
 * @param {string} edge - 'top' або 'bottom'
 * 
 * @returns {number} Відстань від краю viewport в px
 * 
 * @example
 * const header = document.querySelector('header');
 * const distanceFromTop = getStickyEdgeDistance(header, 'top');
 * console.log(`Header є ${distanceFromTop}px від верху viewport`);
 */
export function getStickyEdgeDistance(element, edge = 'top') {
  const rect = element.getBoundingClientRect();
  
  if (edge === 'top') {
    return rect.top;
  } else if (edge === 'bottom') {
    return window.innerHeight - rect.bottom;
  }
  
  return 0;
}

/**
 * Перевіряє чи sticky елемент наразі "залипає" (не скролиться разом із контентом)
 * 
 * @param {HTMLElement} element - Sticky елемент
 * @param {string} edge - 'top' або 'bottom'
 * 
 * @returns {boolean} true якщо елемент залипає, false якщо скролиться
 * 
 * @example
 * const header = document.querySelector('header');
 * if (isSticky(header, 'top')) {
 *   console.log('Header залипає у верхній частині');
 * }
 */
export function isSticky(element, edge = 'top') {
  const distance = getStickyEdgeDistance(element, edge);
  
  if (edge === 'top') {
    return distance <= 0; // Якщо елемент вище viewport - він залипає
  } else if (edge === 'bottom') {
    return distance <= 0; // Якщо елемент нижче viewport - він залипає
  }
  
  return false;
}

/**
 * Додає слухач для визначення коли sticky елемент "залипає" або "відлипає"
 * 
 * @param {HTMLElement} element - Sticky елемент
 * @param {Object} callbacks - Callbacks для подій
 * @param {Function} callbacks.onSticky - Викликається коли елемент залипає
 * @param {Function} callbacks.onUnsticky - Викликається коли елемент скролиться
 * @param {string} [edge='top'] - Яку сторону спостерігати ('top' або 'bottom')
 * 
 * @returns {Function} Функція для видалення слухача
 * 
 * @example
 * const header = document.querySelector('header');
 * const unsubscribe = observeStickiness(header, {
 *   onSticky: () => console.log('Header залипає'),
 *   onUnsticky: () => console.log('Header скролиться'),
 *   edge: 'top'
 * });
 * 
 * // Пізніше видалити слухач
 * unsubscribe();
 */
export function observeStickiness(element, callbacks = {}, edge = 'top') {
  const { onSticky, onUnsticky } = callbacks;
  
  let wasSticky = isSticky(element, edge);
  
  const handleScroll = () => {
    const isCurrentlySticky = isSticky(element, edge);
    
    if (isCurrentlySticky && !wasSticky) {
      // Став sticky
      if (onSticky && typeof onSticky === 'function') {
        onSticky();
      }
    } else if (!isCurrentlySticky && wasSticky) {
      // Став unsticky
      if (onUnsticky && typeof onUnsticky === 'function') {
        onUnsticky();
      }
    }
    
    wasSticky = isCurrentlySticky;
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Повертаємо функцію видалення слухача
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

/**
 * Утиліта для додавання safe-area padding до sticky елемента на iOS
 * Це запобігає тому щоб елемент не потрапив під notch/Dynamic Island
 * 
 * @param {HTMLElement} element - Sticky елемент
 * @param {Object} [options] - Опції
 * @param {boolean} [options.horizontal=true] - Додати left/right padding
 * @param {boolean} [options.top=false] - Додати top padding
 * 
 * @returns {HTMLElement} Той же елемент з safe-area padding
 * 
 * @example
 * const header = document.querySelector('header');
 * applySafeAreaPadding(header, { horizontal: true, top: false });
 * // Тепер header не потрапить під notch на iPhone 12+
 */
export function applySafeAreaPadding(element, options = {}) {
  const {
    horizontal = true,
    top = false
  } = options;
  
  if (horizontal) {
    element.style.paddingLeft = 'var(--safe-area-left, 0px)';
    element.style.paddingRight = 'var(--safe-area-right, 0px)';
  }
  
  if (top) {
    element.style.paddingTop = 'var(--safe-area-top, 0px)';
  }
  
  return element;
}







