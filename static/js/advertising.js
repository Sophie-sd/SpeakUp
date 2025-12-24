'use strict';

// Примусово встановити світлу тему
(function() {
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.classList.add('landing-page');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
})();

// Існуючий код advertising.js починається тут...
(() => {
  const defaultConfig = {
    main_title: 'Подвоюємо вашу англійську за 1 грн',
    subtitle: 'Новорічна пропозиція SpeakUp: оплачуєте курс — отримуєте вдвічі більше навчання.',
    cta_text: 'Отримати подвоєння',
    form_button_text: 'Забронювати акцію',
    primary_color: '#E53935',
    background_color: '#FFFFFF',
    text_color: '#111111',
    surface_color: '#F9FAFB',
    accent_color: '#D6B15E',
    font_family: 'Manrope',
    font_size: 16,
  };

  /**
   * Нормалізує номер телефону, видаляючи всі символи крім цифр та +
   */
  function normalizePhone(phone) {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  }

  /**
   * Валідує формат телефону +38(0XX)XXX-XX-XX
   * Перевіряє, що номер починається з +38, далі йде 0, і всього 10 цифр після +38
   */
  function validatePhone(phone) {
    if (!phone) return false;
    
    const normalized = normalizePhone(phone);
    
    // Перевіряємо, що номер починається з +38
    if (!normalized.startsWith('+38')) return false;
    
    // Витягуємо цифри після +38
    const phoneDigits = normalized.substring(3);
    
    // Перевіряємо, що після +38 рівно 10 цифр і починається з 0
    if (phoneDigits.length !== 10 || !phoneDigits.startsWith('0')) return false;
    
    // Перевіряємо, що всі символи після +38 це цифри
    return /^\d+$/.test(phoneDigits);
  }

  /**
   * Форматує номер телефону до формату +38(0XX)XXX-XX-XX
   */
  function formatPhone(phone) {
    if (!phone) return '';
    
    const normalized = normalizePhone(phone);
    
    // Якщо номер не починається з +38, додаємо префікс
    let digits = normalized.startsWith('+38') ? normalized.substring(3) : normalized;
    
    // Обмежуємо до 10 цифр
    digits = digits.substring(0, 10);
    
    // НЕ додаємо автоматично 0 - користувач вводить його самостійно
    
    // Форматуємо: +38(0XX)XXX-XX-XX
    if (digits.length >= 3) {
      const part1 = digits.substring(0, 3); // 0XX
      const part2 = digits.substring(3, 6); // XXX
      const part3 = digits.substring(6, 8); // XX
      const part4 = digits.substring(8, 10); // XX
      
      if (digits.length <= 3) {
        return `+38(${part1}`;
      } else if (digits.length <= 6) {
        return `+38(${part1})${part2}`;
      } else if (digits.length <= 8) {
        return `+38(${part1})${part2}-${part3}`;
      } else {
        return `+38(${part1})${part2}-${part3}-${part4}`;
      }
    }
    
    return digits ? `+38(${digits}` : '+38(';
  }

  /**
   * Обробляє введення в поле телефону, автоматично форматує номер
   */
  function setupPhoneMask(phoneField) {
    if (!phoneField) return;
    
    // Додаємо префікс +38( якщо поле порожнє
    phoneField.addEventListener('focus', () => {
      if (!phoneField.value || phoneField.value.trim() === '') {
        phoneField.value = '+38(';
        phoneField.setSelectionRange(4, 4);
      }
    });
    
    // Обробляємо введення
    phoneField.addEventListener('input', (e) => {
      const cursorPosition = e.target.selectionStart;
      const oldValue = e.target.value;
      const normalized = normalizePhone(oldValue);
      
      // Якщо номер не починається з +38, додаємо префікс
      let digits = normalized.startsWith('+38') ? normalized.substring(3) : normalized;
      
      // Обмежуємо до 10 цифр
      digits = digits.substring(0, 10);
      
      // НЕ додаємо автоматично 0 - користувач вводить його самостійно
      
      // Форматуємо номер
      const formatted = formatPhone('+38' + digits);
      e.target.value = formatted;
      
      // Відновлюємо позицію курсора
      let newCursorPosition = cursorPosition;
      if (formatted.length > oldValue.length) {
        newCursorPosition = Math.min(cursorPosition + (formatted.length - oldValue.length), formatted.length);
      } else if (formatted.length < oldValue.length) {
        newCursorPosition = Math.max(cursorPosition - (oldValue.length - formatted.length), 4);
      }
      e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    });
    
    // Обробляємо видалення
    phoneField.addEventListener('keydown', (e) => {
      const selectionStart = phoneField.selectionStart;
      
      // Якщо користувач намагається видалити +38(, блокуємо
      if ((e.key === 'Backspace' || e.key === 'Delete') && 
          selectionStart <= 4 && 
          phoneField.value.startsWith('+38(')) {
        e.preventDefault();
        phoneField.setSelectionRange(4, 4);
      }
      
      // Якщо користувач намагається вставити текст, перевіряємо формат
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        setTimeout(() => {
          const normalized = normalizePhone(phoneField.value);
          if (!normalized.startsWith('+38')) {
            phoneField.value = formatPhone('+38' + normalized);
          } else {
            phoneField.value = formatPhone(normalized);
          }
        }, 0);
      }
    });
  }

  function setFieldError(fieldWrapper, hasError) {
    if (!fieldWrapper) return;
    if (hasError) {
      fieldWrapper.classList.add('field--error');
    } else {
      fieldWrapper.classList.remove('field--error');
    }
  }

  function validateForm() {
    const nameField = document.getElementById('name-input');
    const phoneField = document.getElementById('phone-input');
    const consent = document.getElementById('consent');

    const nameWrapper = nameField?.closest('.field');
    const phoneWrapper = phoneField?.closest('.field');

    let isValid = true;

    if (!nameField || !phoneField || !consent) {
      return false;
    }

    const trimmedName = nameField.value.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setFieldError(nameWrapper, true);
      isValid = false;
    } else {
      setFieldError(nameWrapper, false);
    }

    const phoneValue = phoneField.value.trim();
    if (!validatePhone(phoneValue)) {
      setFieldError(phoneWrapper, true);
      isValid = false;
    } else {
      setFieldError(phoneWrapper, false);
    }

    if (!consent.checked) {
      setFieldError(consent.closest('.field'), true);
      isValid = false;
    } else {
      setFieldError(consent.closest('.field'), false);
    }

    return isValid;
  }

  function setupForm() {
    const form = document.getElementById('lead-form');
    const formContainer = document.getElementById('form-container');
    const successContainer = document.getElementById('success-container');
    const phoneField = document.getElementById('phone-input');

    if (!form || !formContainer || !successContainer) return;

    // Налаштовуємо маску для поля телефону
    if (phoneField) {
      setupPhoneMask(phoneField);
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!csrfToken) {
        alert('Помилка безпеки: CSRF токен не знайдено');
        return;
      }

      const formData = new FormData(form);
      const submitButton = document.getElementById('form-button');
      const originalButtonText = submitButton?.textContent;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Відправка...';
      }

      try {
        const response = await fetch('/api/advertising/submit/', {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRFToken': csrfToken
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Відстеження події generate_lead для Google Analytics
          if (typeof gtag === 'function') {
            gtag('event', 'generate_lead', {
              event_category: 'lead',
              event_label: 'advertising_form'
            });
          }
          window.location.href = '/thank-you/';
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
    });
  }

  function scrollToTarget(targetSelector) {
    const target =
      typeof targetSelector === 'string'
        ? document.querySelector(targetSelector)
        : targetSelector;

    if (!target || !target.scrollIntoView) return;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function setupScrollButtons() {
    const buttons = document.querySelectorAll('[data-scroll-target]');
    if (!buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const selector = button.getAttribute('data-scroll-target');
        if (!selector) return;
        scrollToTarget(selector);
      });
    });
  }

  function setupFaq() {
    const container = document.getElementById('faq-container');
    if (!container) return;

    const items = container.querySelectorAll('.faq-item');

    items.forEach((item) => {
      const questionButton = item.querySelector('.faq-item__question');
      const answer = item.querySelector('.faq-item__answer');

      if (!questionButton || !answer) return;

      questionButton.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq-item--open');

        items.forEach((otherItem) => {
          otherItem.classList.remove('faq-item--open');
          const otherAnswer = otherItem.querySelector('.faq-item__answer');
          if (otherAnswer) {
            otherAnswer.style.maxHeight = '0px';
          }
        });

        if (!isOpen) {
          item.classList.add('faq-item--open');
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      });
    });
  }

  function applyColors(config) {
    const root = document.documentElement;
    const background = config.background_color || defaultConfig.background_color;
    const surface = config.surface_color || defaultConfig.surface_color;
    const text = config.text_color || defaultConfig.text_color;
    const primary = config.primary_color || defaultConfig.primary_color;
    const accent = config.accent_color || defaultConfig.accent_color;

    root.style.setProperty('--landing-bg', background);
    root.style.setProperty('--landing-surface', surface);
    root.style.setProperty('--landing-text-main', text);
    root.style.setProperty('--landing-accent', primary);
    root.style.setProperty('--landing-gold-start', accent);
  }

  function applyTypography(config) {
    const fontFamily = config.font_family || defaultConfig.font_family;
    const fontSize = config.font_size || defaultConfig.font_size;

    if (document.body) {
      document.body.style.fontFamily = `${fontFamily}, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    }
    document.documentElement.style.fontSize = `${fontSize}px`;
  }

  function applyContent(config) {
    const titleRoot = document.getElementById('landing-main-title');
    const titleText = document.getElementById('main-title-text');
    const subtitle = document.getElementById('subtitle');
    const primaryCtaButtons = document.querySelectorAll(
      '[data-scroll-target][class*="btn-primary"]',
    );
    const formButton = document.getElementById('form-button');

    const titleValue = config.main_title || defaultConfig.main_title;
    if (titleRoot && titleText) {
      titleText.textContent = titleValue;
    }

    if (subtitle) {
      subtitle.textContent = config.subtitle || defaultConfig.subtitle;
    }

    const ctaText = config.cta_text || defaultConfig.cta_text;
    primaryCtaButtons.forEach((button) => {
      button.textContent = ctaText;
    });

    if (formButton) {
      formButton.textContent = config.form_button_text || defaultConfig.form_button_text;
    }
  }

  function setupElementSdk() {
    if (!window.elementSdk) return;

    window.elementSdk.init({
      defaultConfig,
      onConfigChange: async (config) => {
        const nextConfig = config || {};
        applyContent(nextConfig);
        applyColors(nextConfig);
        applyTypography(nextConfig);
      },
      mapToCapabilities: (config) => ({
        recolorables: [
          {
            get: () => config.background_color || defaultConfig.background_color,
            set: (value) => {
              config.background_color = value;
              window.elementSdk.setConfig({ background_color: value });
            },
          },
          {
            get: () => config.surface_color || defaultConfig.surface_color,
            set: (value) => {
              config.surface_color = value;
              window.elementSdk.setConfig({ surface_color: value });
            },
          },
          {
            get: () => config.text_color || defaultConfig.text_color,
            set: (value) => {
              config.text_color = value;
              window.elementSdk.setConfig({ text_color: value });
            },
          },
          {
            get: () => config.primary_color || defaultConfig.primary_color,
            set: (value) => {
              config.primary_color = value;
              window.elementSdk.setConfig({ primary_color: value });
            },
          },
          {
            get: () => config.accent_color || defaultConfig.accent_color,
            set: (value) => {
              config.accent_color = value;
              window.elementSdk.setConfig({ accent_color: value });
            },
          },
        ],
        borderables: [],
        fontEditable: {
          get: () => config.font_family || defaultConfig.font_family,
          set: (value) => {
            config.font_family = value;
            window.elementSdk.setConfig({ font_family: value });
          },
        },
        fontSizeable: {
          get: () => config.font_size || defaultConfig.font_size,
          set: (value) => {
            config.font_size = value;
            window.elementSdk.setConfig({ font_size: value });
          },
        },
      }),
      mapToEditPanelValues: (config) =>
        new Map([
          ['main_title', config.main_title || defaultConfig.main_title],
          ['subtitle', config.subtitle || defaultConfig.subtitle],
          ['cta_text', config.cta_text || defaultConfig.cta_text],
          ['form_button_text', config.form_button_text || defaultConfig.form_button_text],
        ]),
    });
  }

  function init() {
    setupForm();
    setupScrollButtons();
    setupFaq();
    setupElementSdk();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



