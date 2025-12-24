/**
 * Модуль для керування accordion секцією переваг
 */

export class AccordionManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.items = this.container.querySelectorAll('[data-accordion-item]');
    this.init();
  }
  
  init() {
    this.items.forEach((item, index) => {
      const trigger = item.querySelector('[data-accordion-trigger]');
      const content = item.querySelector('[data-accordion-content]');
      
      if (!trigger || !content) return;
      
      // Додати event listener
      trigger.addEventListener('click', () => {
        this.toggleItem(item);
      });
      
      // Встановити початкову висоту
      if (index === 0) {
        // Перший елемент відкритий за замовчуванням
        this.openItem(item);
      }
    });
  }
  
  toggleItem(item) {
    const isActive = item.classList.contains('accordion__item--active');
    
    if (isActive) {
      this.closeItem(item);
    } else {
      // Закрити всі інші
      this.items.forEach(otherItem => {
        if (otherItem !== item) {
          this.closeItem(otherItem);
        }
      });
      
      // Відкрити цей
      this.openItem(item);
    }
  }
  
  openItem(item) {
    const content = item.querySelector('[data-accordion-content]');
    item.classList.add('accordion__item--active');
    
    // Встановити max-height для анімації
    content.style.maxHeight = content.scrollHeight + 'px';
  }
  
  closeItem(item) {
    const content = item.querySelector('[data-accordion-content]');
    item.classList.remove('accordion__item--active');
    content.style.maxHeight = '0';
  }
}










