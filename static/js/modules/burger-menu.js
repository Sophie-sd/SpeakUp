'use strict';

import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';

export class BurgerMenu {
  constructor() {
    this.button = document.querySelector('[data-burger-toggle]');
    this.overlay = document.querySelector('[data-burger-overlay]');
    this.dropdown = document.querySelector('[data-burger-menu]');
    this.links = this.dropdown?.querySelectorAll('.burger-menu__link');

    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.button || !this.overlay || !this.dropdown) return;

    this.button.addEventListener('click', () => this.toggle());
    this.overlay.addEventListener('click', () => this.close());

    this.links?.forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.button.setAttribute('aria-expanded', 'true');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.dropdown.setAttribute('aria-hidden', 'false');

    lockScroll();
    this.isOpen = true;
  }

  close() {
    this.button.setAttribute('aria-expanded', 'false');
    this.overlay.setAttribute('aria-hidden', 'true');
    this.dropdown.setAttribute('aria-hidden', 'true');

    unlockScroll();
    this.isOpen = false;
  }
}
