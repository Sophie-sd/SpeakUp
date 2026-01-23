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

    // Initialize HTMX event handlers for form submission
    initializeFormHandlers();
  }

  /**
   * Initialize HTMX form handlers
   */
  function initializeFormHandlers() {
    // Remove error class when user starts typing
    document.addEventListener('htmx:oobBeforeSwap', (e) => {
      const target = e.detail.target;
      if (target && target.id === 'consultation-form-wrapper') {
        // Remove all error classes when form is about to be re-rendered
        const formInputs = target.querySelectorAll('input.field-error');
        formInputs.forEach(input => {
          input.classList.remove('field-error');
        });
      }
    });

    // Handle successful form submission
    document.addEventListener('htmx:afterSwap', (e) => {
      const target = e.detail.target;
      
      // Check if this is the consultation form wrapper
      if (target && target.id === 'consultation-form-wrapper') {
        const successElement = target.querySelector('[data-success="consultation"]');
        
        if (successElement) {
          // Extract the success message
          const message = successElement.querySelector('.message__text')?.textContent || 
                         'Дякуємо! Ми зв\'яжемось з вами найближчим часом.';
          
          // Show toast notification
          showToast(message, 'success');
          
          // Clear form inputs
          setTimeout(() => {
            const form = document.querySelector('#consultation-form-wrapper form');
            if (form) {
              form.reset();
            }
          }, 500);
          
          // Remove the success message element (it's not needed anymore)
          setTimeout(() => {
            successElement.remove();
            // Reload the form
            reloadConsultationForm();
          }, 3000);
        }
      }
    });

    // Handle form validation errors
    document.addEventListener('htmx:afterSwap', (e) => {
      const target = e.detail.target;
      
      if (target && target.id === 'consultation-form-wrapper') {
        const form = target.querySelector('form');
        
        // Check if form has validation errors
        const errorElements = target.querySelectorAll('.form-error');
        if (errorElements.length > 0 && e.detail.xhr.status === 400) {
          // Add error class to inputs with errors
          errorElements.forEach((errorEl) => {
            const inputGroup = errorEl.closest('.form-group');
            if (inputGroup) {
              const input = inputGroup.querySelector('input');
              if (input) {
                input.classList.add('field-error');
              }
            }
          });
          
          // Focus on first input with error
          const firstErrorInput = target.querySelector('input.field-error');
          if (firstErrorInput) {
            setTimeout(() => firstErrorInput.focus(), 100);
          }
        }
      }
    });

    // Handle network/server errors
    document.addEventListener('htmx:responseError', (e) => {
      console.error('Form submission error:', e);
      showToast('Помилка при відправці. Спробуйте ще раз.', 'error');
    });
  }

  /**
   * Reload the consultation form
   */
  function reloadConsultationForm() {
    if (typeof htmx !== 'undefined') {
      const formWrapper = document.getElementById('consultation-form-wrapper');
      if (formWrapper) {
        const formLocation = 'camp-landing';
        htmx.ajax('GET', `/submit-consultation/?form_location=${encodeURIComponent(formLocation)}`, {
          target: '#consultation-form-wrapper',
          swap: 'innerHTML'
        });
      }
    }
  }

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - 'success' or 'error'
   */
  function showToast(message, type = 'success') {
    const toast = document.getElementById('camp-toast');
    if (!toast) return;

    const messageEl = toast.querySelector('.camp-toast__message');
    const iconEl = toast.querySelector('.camp-toast__icon');

    if (messageEl) {
      messageEl.textContent = message;
    }

    // Set icon and type
    if (type === 'error') {
      toast.classList.add('camp-toast--error');
      if (iconEl) iconEl.textContent = '⚠';
    } else {
      toast.classList.remove('camp-toast--error');
      if (iconEl) iconEl.textContent = '✓';
    }

    // Show toast
    toast.classList.add('camp-toast--visible');

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      hideToast();
    }, 5000);

    // Add close button handler
    const closeBtn = toast.querySelector('[data-close-toast]');
    if (closeBtn) {
      closeBtn.onclick = () => {
        clearTimeout(hideTimer);
        hideToast();
      };
    }
  }

  /**
   * Hide toast notification
   */
  function hideToast() {
    const toast = document.getElementById('camp-toast');
    if (toast) {
      toast.classList.remove('camp-toast--visible');
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
   * Show success state on button after click
   * @param {HTMLElement} button - Button element
   */
  function showButtonSuccess(button) {
    const originalText = button.textContent;
    const originalHTML = button.innerHTML;

    // Store original state
    button.dataset.originalHtml = originalHTML;

    // Update button UI to show success
    button.classList.add('success');

    // Change text
    const textSpan = button.querySelector('.button-text');
    if (textSpan) {
      textSpan.textContent = 'Дякуємо! Ми зв\'яжемося з вами';
    }

    // Remove arrow
    const arrow = button.querySelector('.button-arrow');
    if (arrow) {
      arrow.style.display = 'none';
    }

    // Change emoji
    const emoji = button.querySelector('.button-emoji');
    if (emoji) {
      emoji.textContent = '✅';
    }

    // Disable button
    button.disabled = true;
    button.style.pointerEvents = 'none';

    // Optional: Restore after delay
    setTimeout(function() {
      // Keep success state visible
    }, 3000);
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
    showToast: showToast,
    hideToast: hideToast,
  };

})();
