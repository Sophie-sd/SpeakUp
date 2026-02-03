'use strict';

import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';

/**
 * Pricing Modal - модальне вікно для деталей замовлення пакетів
 * Обробляє відкриття/закриття модального вікна та генерацію контенту
 */
export function initPricingModal() {
  const modal = document.querySelector('.pricing-modal');
  const modalBackdrop = document.querySelector('.pricing-modal__backdrop');
  const modalClose = document.querySelector('.pricing-modal__close');
  const triggers = document.querySelectorAll('[data-pricing-modal-trigger]');

  if (!modal || triggers.length === 0) return;

  // Дані для генерації опису пакетів
  const packageDescriptions = {
    // === НАВЧАННЯ ЗА РІВНЯМИ ===
    start: {
      packageType: 'levels',
      description: 'Ви обираєте першу ступінь навчання - Старт',
      includes: [
        '1 рівень навчання (3 місяці)',
        'Групові заняття з викладачем',
        'Мультимедійні уроки онлайн',
        'Доступ до Student Zone 24/7',
        'Індивідуальні консультації',
        'Гарантія якості: повторне проходження безкоштовно при результаті тесту <65%'
      ]
    },
    progress: {
      packageType: 'levels',
      description: 'Ви обираєте пакет з 2 рівнями англійської мови',
      includes: [
        '2 рівні навчання (6 місяців)',
        'Групові заняття з викладачем',
        'Мультимедійні уроки онлайн',
        'Доступ до Student Zone 24/7',
        'Індивідуальні консультації',
        'Гарантія якості: повторне проходження безкоштовно при результаті тесту <65%'
      ]
    },
    confidence: {
      packageType: 'levels',
      description: 'Ви обираєте пакет з 3 рівнями англійської мови',
      includes: [
        '3 рівні навчання (9 місяців)',
        'Групові заняття з викладачем',
        'Мультимедійні уроки онлайн',
        'Доступ до Student Zone 24/7',
        'Індивідуальні консультації',
        'Гарантія якості: повторне проходження безкоштовно при результаті тесту <65%'
      ]
    },
    maximum: {
      packageType: 'levels',
      description: 'Ви обираєте максимальний пакет - полний курс англійської',
      includes: [
        '4 рівні навчання (12 місяців)',
        'Групові заняття з викладачем',
        'Мультимедійні уроки онлайн',
        'Доступ до Student Zone 24/7',
        'Індивідуальні консультації',
        'Гарантія якості: повторне проходження безкоштовно при результаті тесту <65%'
      ]
    }
  };

  /**
   * Генерує опис для індивідуальних занять на основі data-атрибутів
   */
  function generateIndividualDescription(attrs) {
    const teacherLabel = attrs.teacher === 'native' ? 'носієм мови' : 'локальним викладачем';
    const categoryLabel = attrs.category === 'specialized' ? 'спеціалізована англійська' : 'загальна англійська (рівні A1-C2)';
    const timeLabel = attrs.time === 'evening' ? 'вечір (16:00-21:00)' : 'день (до 16:00)';

    const categoryDescription =
      attrs.category === 'specialized'
        ? 'Підготовка до іспитів (IELTS, TOEFL), вузька тематика (IT, медицина, фінанси) та інші іноземні мови.'
        : 'Розмовна практика, граматика, різні рівні англійської, а також Бізнес-англійська.';

    return {
      packageType: 'individual',
      description: `Індивідуальні заняття з ${teacherLabel}`,
      includes: [
        `${attrs.lessonCount} занять по ${attrs.lessonDuration} хвилин`,
        categoryDescription,
        `Час навчання: ${timeLabel}`,
        'Персональна програма під ваші цілі',
        'Гнучкий графік занять',
        'Можливість зміни викладача',
        'Матеріали курсу в електронному вигляді'
      ]
    };
  }

  /**
   * Генерує опис для безлімітних пакетів на основі data-атрибутів
   */
  function generateUnlimitedDescription(attrs) {
    const months = parseInt(attrs.months);
    const giftMonths = parseInt(attrs.giftMonths) || 0;
    const totalMonths = months + giftMonths;
    
    const giftText = giftMonths > 0 
      ? ` + ${giftMonths} ${giftMonths === 1 ? 'місяць' : 'місяці'} в подарунок 🎁`
      : '';

    return {
      packageType: 'unlimited',
      description: `Безлімітне навчання на ${months} місяців${giftText}`,
      includes: [
        'Безлімітні заняття в мультимедійному класі',
        'Заняття з викладачем (групи 1-10 учнів)',
        'Доступ до Student Zone 24/7',
        'Індивідуальні консультації',
        'Розмовні клуби кожного тижня',
        'Multimedia Lesson – інтерактивні мультимедійні уроки',
        'Group Class – групові заняття з викладачем',
        'Workshops – мовні практикуми',
        'Academic Progress Report – контроль прогресу'
      ]
    };
  }

  /**
   * Генерує HTML контент модалки
   */
  function generateModalContent(trigger) {
    const packageId = trigger.dataset.pricingModalTrigger;
    const packageName = trigger.dataset.packageName;
    const packageType = trigger.dataset.packageType;
    const priceOld = trigger.dataset.priceOld;
    const priceNew = trigger.dataset.priceNew;
    const discountPercent = trigger.dataset.discountPercent;
    const pricePerUnit = trigger.dataset.pricePerUnit;

    let packageInfo;

    if (packageType === 'levels') {
      packageInfo = packageDescriptions[packageId];
    } else if (packageType === 'individual') {
      // Отримуємо дані для індивідуальних занять
      const teacher = trigger.dataset.teacher;
      const category = trigger.dataset.category;
      const time = trigger.dataset.time;
      const lessonCount = trigger.dataset.lessonCount;
      const lessonDuration = trigger.dataset.lessonDuration;

      packageInfo = generateIndividualDescription({
        teacher,
        category,
        time,
        lessonCount,
        lessonDuration
      });
    } else if (packageType === 'unlimited') {
      // Отримуємо дані для безлімітних пакетів
      const months = trigger.dataset.months;
      const giftMonths = trigger.dataset.giftMonths || '0';

      packageInfo = generateUnlimitedDescription({
        months,
        giftMonths
      });
    }

    if (!packageInfo) {
      console.warn(`No description found for package: ${packageId}`);
      return '';
    }

    const hasDiscount = priceOld && priceNew && parseInt(priceOld) > parseInt(priceNew);
    const savings = hasDiscount ? parseInt(priceOld) - parseInt(priceNew) : 0;

    return `
      <p class="pricing-modal__subtitle">${packageInfo.description}</p>

      <div class="pricing-modal__includes">
        <div class="pricing-modal__includes-title">Що включено:</div>
        <ul class="pricing-modal__includes-list">
          ${packageInfo.includes.map(item => `<li class="pricing-modal__includes-item">${item}</li>`).join('')}
        </ul>
      </div>

      <div class="pricing-modal__pricing">
        ${
          hasDiscount
            ? `
          <div class="pricing-modal__pricing-row">
            <span class="pricing-modal__pricing-label">Звичайна ціна:</span>
            <span class="pricing-modal__pricing-value pricing-modal__price-old">${priceOld} грн</span>
          </div>
        `
            : ''
        }
        <div class="pricing-modal__pricing-row">
          <span class="pricing-modal__pricing-label">Ціна:</span>
          <span class="pricing-modal__pricing-value pricing-modal__price-new">${priceNew} грн</span>
        </div>
        ${
          hasDiscount
            ? `
          <div class="pricing-modal__savings">
            <span>💰 Ви економите:</span>
            <span>${savings} грн</span>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  /**
   * Відкрити модальне вікно
   */
  function openModal(trigger) {
    const body = modal.querySelector('.pricing-modal__body');

    // Генеруємо контент
    body.innerHTML = generateModalContent(trigger);

    // Додаємо клас активації
    modal.classList.add('pricing-modal--active');
    lockScroll();

    // Trap focus для доступності
    const focusableElements = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      firstFocusable.focus();

      function handleTabKey(e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }

      modal.addEventListener('keydown', handleTabKey);

      // Зберігаємо обробник для видалення
      modal._tabKeyHandler = handleTabKey;
    }
  }

  /**
   * Закрити модальне вікно
   */
  function closeModal(trigger = null) {
    modal.classList.remove('pricing-modal--active');
    unlockScroll();

    // Видаляємо обробник Tab
    if (modal._tabKeyHandler) {
      modal.removeEventListener('keydown', modal._tabKeyHandler);
      delete modal._tabKeyHandler;
    }

    // Повертаємо фокус на кнопку, якщо це можливо
    if (trigger) {
      trigger.focus();
    }
  }

  /**
   * Обробник для Escape клавіші
   */
  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      const trigger = document.querySelector('[data-pricing-modal-trigger].active');
      closeModal(trigger);
      document.removeEventListener('keydown', handleEscapeKey);
    }
  }

  /**
   * Обробник для кнопок оплати
   */
  function handlePaymentButton(event) {
    const button = event.target;
    const buttonText = button.textContent.trim();

    // Якщо це кнопка консультації - закрити pricing modal та відкрити trial modal
    if (button.classList.contains('pricing-modal__consultation-btn')) {
      closeModal();
      // Знаходимо trial modal trigger та емулюємо клік
      const trialTriggers = document.querySelectorAll('[data-trial-modal-trigger]');
      if (trialTriggers.length > 0) {
        // Використовуємо перший доступний тригер (зазвичай це кнопка в хедері)
        trialTriggers[0].click();
      }
      return;
    }

    // Для інших кнопок оплати
    alert('Функціонал буде доданий незабаром');
  }

  // === EVENT LISTENERS ===

  // Відкриття модалки при натисканні на кнопки карток
  triggers.forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      trigger.classList.add('active');
      openModal(trigger);
      document.addEventListener('keydown', handleEscapeKey);
    });
  });

  // Закриття при натисканні на X
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      const trigger = document.querySelector('[data-pricing-modal-trigger].active');
      trigger?.classList.remove('active');
      closeModal(trigger);
      document.removeEventListener('keydown', handleEscapeKey);
    });
  }

  // Закриття при натисканні на backdrop
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => {
      const trigger = document.querySelector('[data-pricing-modal-trigger].active');
      trigger?.classList.remove('active');
      closeModal(trigger);
      document.removeEventListener('keydown', handleEscapeKey);
    });
  }

  // Обробка кнопок оплати
  const paymentButtons = modal.querySelectorAll('.pricing-modal__actions .button');
  paymentButtons.forEach(button => {
    button.addEventListener('click', handlePaymentButton);
  });
}

// Автоматическая инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPricingModal);
} else {
  // DOM уже загружен
  initPricingModal();
}

export default { initPricingModal };
