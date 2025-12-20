/**
 * Main entry point - ініціалізація всіх модулів
 */

import { VideoRotationManager } from './video-rotation.js';
import { AccordionManager } from './accordion.js';
import { TestManager } from './test-manager.js';
import { ModalManager } from './modal-manager.js';
import { BurgerMenu } from './burger-menu.js';
import './htmx-integration.js';

document.addEventListener('DOMContentLoaded', () => {
  // Ініціалізація відео ротації
  new VideoRotationManager();
  
  // Ініціалізація accordion
  new AccordionManager('advantages-accordion');
  
  // Ініціалізація тесту
  new TestManager();
  
  // Ініціалізація модального вікна
  new ModalManager();
  
  // Ініціалізація бургер-меню
  new BurgerMenu();
  
  // Smooth scroll для всіх якорних посилань
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
