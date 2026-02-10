/**
 * Footer Accordion Module
 * Handles mobile footer programs section accordion functionality
 * 
 * Behavior:
 * - Desktop (≥768px): Programs list always visible, toggle button hidden
 * - Mobile (≤767px): Programs list collapsible via accordion toggle
 * - ARIA attributes properly managed for accessibility
 * - Smooth transitions with CSS
 */

class FooterAccordion {
  constructor() {
    this.toggle = null;
    this.list = null;
    this.section = null;
    this.isExpanded = false;
    this.isMobile = window.innerWidth <= 767;
    
    this.init();
  }

  init() {
    const section = document.querySelector('.footer__programs-section');
    if (!section) return;

    this.section = section;
    this.toggle = section.querySelector('.footer__programs-toggle');
    this.list = section.querySelector('.footer__programs-list');

    if (!this.toggle || !this.list) return;

    // Set initial state
    this.updateState();

    // Event listeners
    this.toggle.addEventListener('click', () => this.handleToggleClick());
    window.addEventListener('resize', () => this.handleResize());

    // Keyboard support (Enter and Space to toggle)
    this.toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleToggleClick();
      }
    });
  }

  handleToggleClick() {
    if (!this.isMobile) return; // Only toggle on mobile

    this.isExpanded = !this.isExpanded;
    this.updateState();
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 767;

    // If breakpoint changed, update state
    if (wasMobile !== this.isMobile) {
      this.isExpanded = false;
      this.updateState();
    }
  }

  updateState() {
    if (!this.toggle || !this.list) return;

    // Desktop: always show, hide toggle
    if (!this.isMobile) {
      this.toggle.style.display = 'none';
      this.list.classList.remove('footer__programs-list--expanded');
      this.section.removeAttribute('data-expanded');
      this.toggle.setAttribute('aria-expanded', 'false');
      return;
    }

    // Mobile: show toggle, control visibility
    this.toggle.style.display = 'flex';

    if (this.isExpanded) {
      this.list.classList.add('footer__programs-list--expanded');
      this.section.setAttribute('data-expanded', 'true');
      this.toggle.setAttribute('aria-expanded', 'true');
    } else {
      this.list.classList.remove('footer__programs-list--expanded');
      this.section.setAttribute('data-expanded', 'false');
      this.toggle.setAttribute('aria-expanded', 'false');
    }
  }

  destroy() {
    if (this.toggle) {
      this.toggle.removeEventListener('click', () => this.handleToggleClick());
    }
    window.removeEventListener('resize', () => this.handleResize());
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FooterAccordion();
});

// Also initialize if this script loads after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FooterAccordion();
  });
} else {
  new FooterAccordion();
}
