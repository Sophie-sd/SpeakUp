/**
 * Contact Block Copy Handler
 * Handles copying phone number to clipboard for all contact blocks on the page
 */

(function() {
  'use strict';

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactBlockCopy);
  } else {
    initContactBlockCopy();
  }

  /**
   * Initialize copy button handlers for all contact blocks
   */
  function initContactBlockCopy() {
    const copyButtons = document.querySelectorAll('[data-contact-copy]');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', handleCopyClick);
    });
  }

  /**
   * Handle copy button click
   * @param {Event} event - Click event
   */
  function handleCopyClick(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const contactBlock = button.closest('[data-contact-block]');
    
    if (!contactBlock) {
      console.warn('Contact block not found');
      return;
    }

    const phoneText = contactBlock.querySelector('[data-contact-phone]');
    if (!phoneText) {
      console.warn('Phone text element not found');
      return;
    }

    const phoneNumber = phoneText.textContent.trim();

    // Use Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(phoneNumber)
        .then(() => showCopySuccess(button))
        .catch(() => fallbackCopy(phoneNumber, button));
    } else {
      // Fallback for older browsers
      fallbackCopy(phoneNumber, button);
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
    textArea.style.left = '-999999px';
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
   * Show success feedback on the copy button
   * @param {HTMLElement} button - Button element
   */
  function showCopySuccess(button) {
    const originalText = button.querySelector('.contact-block__copy-text');
    const originalContent = button.innerHTML;

    // Add success class
    button.classList.add('copied');

    // Change button text temporarily
    if (originalText) {
      originalText.textContent = 'Скопійовано!';
    } else {
      button.textContent = 'Скопійовано!';
    }

    // Revert after 2 seconds
    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = originalContent;
    }, 2000);
  }
})();
