'use strict';

/**
 * Camp Form Handler - обробляє форму консультації в модальному вікні
 * Відправляє JSON запит і показує спливаючі повідомлення
 */
export class CampFormHandler {
  constructor(form) {
    this.form = form;
    this.isSubmitting = false;
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Захист від подвійної відправки
    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;

    const submitBtn = this.form.querySelector('[type="submit"]');
    if (!submitBtn) {
      this.isSubmitting = false;
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Відправляється...';

    try {
      const formData = new FormData(this.form);
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');

      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken.value
        }
      });

      const data = await response.json();

      if (data.success) {
        // Миттєвий редирект без спливаючих повідомлень
        window.location.href = data.redirect_url;
      } else {
        this.showErrors(data.errors || {});
      }
    } catch (error) {
      console.error('[CampFormHandler] Error:', error);
      this.showErrors({'__all__': ['Помилка з\'єднання. Спробуйте ще раз.']});
    } finally {
      this.isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  showErrors(errors) {
    // Очистити попередні помилки
    this.form.querySelectorAll('.form-error').forEach(el => el.remove());
    this.form.querySelectorAll('.form-group__input').forEach(input => {
      input.classList.remove('field-error');
    });

    // Показати нові помилки
    Object.keys(errors).forEach(field => {
      const fieldName = field === '__all__' ? null : field;
      const errorMessages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];

      if (fieldName) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        if (input) {
          input.classList.add('field-error');
          input.setAttribute('aria-invalid', 'true');
          const formGroup = input.closest('.form-group');
          if (formGroup) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'form-error';
            errorSpan.setAttribute('role', 'alert');
            errorSpan.textContent = errorMessages[0];
            formGroup.appendChild(errorSpan);
          }
        }
      } else {
        // Загальні помилки - спливаюче повідомлення
        const errorSpan = document.createElement('div');
        errorSpan.className = 'message message--error';
        errorSpan.setAttribute('role', 'alert');
        errorSpan.innerHTML = `
          <div class="message__text">${errorMessages[0]}</div>
          <button type="button" class="message__close" aria-label="Закрити">×</button>
        `;

        this.form.parentNode.insertBefore(errorSpan, this.form);

        errorSpan.querySelector('.message__close')?.addEventListener('click', () => {
          errorSpan.remove();
        });
      }
    });
  }
}
