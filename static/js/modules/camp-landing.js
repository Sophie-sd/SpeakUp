/**
 * Camp Landing Page - JavaScript Module
 * Handles CTA button interactions, modal triggers, and form submissions
 */

(function() {
  'use strict';

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCampLanding);
  } else {
    initCampLanding();
  }

  /**
   * Initialize all event handlers
   */
  function initCampLanding() {
    const ctaButton = document.getElementById('cta-button');
    const ctaButton2 = document.getElementById('cta-button-2');
    const ctaButtonFixed = document.getElementById('cta-button-fixed');
    const modalTrigger = document.getElementById('modal-trigger');
    const campModal = document.getElementById('camp-modal');
    const campModalClose = document.getElementById('camp-modal-close');
    const campCopyBtn = document.getElementById('camp-copy-phone');
    const campPhoneText = document.getElementById('camp-phone-text');

    if (ctaButton) {
      ctaButton.addEventListener('click', handleCtaClick);
    }

    if (ctaButton2) {
      ctaButton2.addEventListener('click', handleCtaClick);
    }

    if (ctaButtonFixed) {
      ctaButtonFixed.addEventListener('click', handleCtaClick);
    }

    // Modal close button
    if (campModalClose) {
      campModalClose.addEventListener('click', closeModal);
    }

    // Close modal on backdrop click
    if (campModal) {
      campModal.addEventListener('click', function(event) {
        if (event.target === this) {
          closeModal();
        }
      });
    }

    // Copy phone button
    if (campCopyBtn) {
      campCopyBtn.addEventListener('click', handleCopyPhone);
    }

    // Keyboard: close modal on Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeModal();
      }
    });

    // Initialize scroll handler for fixed CTA button visibility
    window.addEventListener('scroll', handleScrollVisibility);
    window.addEventListener('resize', handleScrollVisibility);
    // Initial check
    handleScrollVisibility();

    // Disable form submission for camp modal
    disableFormSubmission();
  }

  /**
   * Disable form submission for camp modal
   */
  function disableFormSubmission() {
    const campModal = document.getElementById('camp-modal');
    if (campModal) {
      const form = campModal.querySelector('form');
      if (form) {
        // Remove HTMX attributes
        form.removeAttribute('hx-post');
        form.removeAttribute('hx-swap');
        form.removeAttribute('hx-target');
        
        // Prevent form submission
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        });
      }
    }
  }

  /**
   * Handle CTA button click - open modal for consultation form
   * @param {Event} event - Click event
   */
  function handleCtaClick(event) {
    event.preventDefault();
    const button = event.currentTarget;
    openModal();
  }

  /**
   * Open camp modal
   */
  function openModal() {
    const campModal = document.getElementById('camp-modal');
    if (campModal) {
      campModal.classList.add('camp-modal--active');
      document.body.style.overflow = 'hidden';
      
      // Set focus to first form input for accessibility
      const firstInput = campModal.querySelector('input[type="text"], input[type="tel"]');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  /**
   * Close camp modal
   */
  function closeModal() {
    const campModal = document.getElementById('camp-modal');
    if (campModal) {
      campModal.classList.remove('camp-modal--active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle copy phone to clipboard
   * @param {Event} event - Click event
   */
  function handleCopyPhone(event) {
    event.preventDefault();
    const campCopyBtn = event.currentTarget;
    const campPhoneText = document.getElementById('camp-phone-text');

    if (!campPhoneText) return;

    const phoneNumber = campPhoneText.textContent.trim();

    // Use Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(phoneNumber).then(() => {
        showCopySuccess(campCopyBtn);
      }).catch(() => {
        fallbackCopy(phoneNumber, campCopyBtn);
      });
    } else {
      // Fallback for older browsers
      fallbackCopy(phoneNumber, campCopyBtn);
    }
  }

  /**
   * Fallback copy method for older browsers
   * @param {string} text - Text to copy
   * @param {HTMLElement} button - Button element
   */
  function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    
    try {
      textArea.select();
      document.execCommand('copy');
      showCopySuccess(button);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Show copy success state
   * @param {HTMLElement} button - Button element
   */
  function showCopySuccess(button) {
    const originalHTML = button.innerHTML;
    const originalClass = button.className;

    // Change to success state
    button.classList.add('copied');
    button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg><span class="camp-modal__copy-text">Скопійовано!</span>';

    // Restore after 2 seconds
    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = originalHTML;
      button.className = originalClass;
    }, 2000);
  }

  /**
   * Handle scroll visibility for fixed CTA button
   * Show button in bottom-left corner after scrolling past hero section
   */
  function handleScrollVisibility() {
    const heroSection = document.querySelector('.hero-section');
    const ctaButtonFixed = document.getElementById('cta-button-fixed');

    if (!heroSection || !ctaButtonFixed) return;

    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > heroBottom) {
      ctaButtonFixed.classList.add('visible');
    } else {
      ctaButtonFixed.classList.remove('visible');
    }
  }

  /**
   * Utility: Update dynamic content (grant amount, spots left)
   * Can be called from server/admin if needed
   */
  window.campLanding = {
    updateGrantAmount: function(amount) {
      const elements = document.querySelectorAll('#grant-amount');
      elements.forEach(el => {
        el.textContent = amount;
      });
    },
    updateSpotsLeft: function(spots) {
      const elements = document.querySelectorAll('#spots-left, #spots-left-2');
      elements.forEach(el => {
        el.textContent = spots;
      });
    },
    resetButtons: function() {
      const buttons = document.querySelectorAll('[data-action="open-modal"]');
      buttons.forEach(button => {
        button.classList.remove('success');
        button.disabled = false;
        button.style.pointerEvents = 'auto';

        const textSpan = button.querySelector('.button-text');
        if (textSpan) {
          textSpan.textContent = textSpan.dataset.originalText || 'Отримати грант';
        }

        const emoji = button.querySelector('.button-emoji');
        if (emoji) {
          emoji.textContent = emoji.dataset.originalEmoji || '🎓';
        }

        const arrow = button.querySelector('.button-arrow');
        if (arrow) {
          arrow.style.display = '';
        }
      });
    },
    openModal: openModal,
    closeModal: closeModal,
  };

})();
