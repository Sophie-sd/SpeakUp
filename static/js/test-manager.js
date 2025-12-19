/**
 * Модуль для керування тестом
 */

export class TestManager {
  constructor() {
    this.testForm = document.getElementById('test-form');
    this.testSection = document.getElementById('test-section');
    this.totalSteps = 5; // Кількість питань
    this.answers = {};
    this.userInfo = {};
    
    this.init();
  }
  
  init() {
    if (!this.testForm) return;
    
    this.setupEventListeners();
    this.addProgressIndicator();
    this.loadSavedData();
  }
  
  setupEventListeners() {
    // Кнопки запуску тесту
    const startBtns = document.querySelectorAll('[data-action="start-test"]');
    startBtns.forEach(btn => {
      btn.addEventListener('click', () => this.showTestForm());
    });
    
    // Radio buttons
    const radios = this.testForm.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => this.handleAnswerChange(e));
    });
    
    // Відправка форми
    this.testForm.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  addProgressIndicator() {
    const progressHtml = `
      <div class="test__progress">
        <div class="test__progress-bar">
          <div class="test__progress-fill"></div>
        </div>
        <span class="test__progress-text">
          Питання <span class="progress-current">0</span> з 
          <span class="progress-total">${this.totalSteps}</span>
        </span>
      </div>
    `;
    
    this.testForm.insertAdjacentHTML('afterbegin', progressHtml);
  }
  
  handleAnswerChange(event) {
    const questionName = event.target.name;
    this.answers[questionName] = event.target.value;
    
    this.updateProgress();
    this.saveAnswers();
    
    // Автоматичний скрол до наступного питання
    this.autoAdvanceIfNeeded(questionName);
  }
  
  updateProgress() {
    const answered = Object.keys(this.answers).length;
    const progress = (answered / this.totalSteps) * 100;
    
    const progressFill = this.testForm.querySelector('.test__progress-fill');
    const currentSpan = this.testForm.querySelector('.progress-current');
    
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (currentSpan) currentSpan.textContent = answered;
  }
  
  autoAdvanceIfNeeded(questionName) {
    const currentNum = parseInt(questionName.split('_')[1]);
    
    if (currentNum < this.totalSteps) {
      setTimeout(() => {
        const nextInput = document.querySelector(`input[name="question_${currentNum + 1}"]`);
        if (nextInput) {
          nextInput.closest('.test__question').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500);
    } else {
      // Скрол до полів користувача
      setTimeout(() => {
        const nameField = this.testForm.querySelector('[name="name"]');
        if (nameField && !nameField.value) {
          nameField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          nameField.focus();
        }
      }, 500);
    }
  }
  
  saveAnswers() {
    try {
      sessionStorage.setItem('test_answers', JSON.stringify(this.answers));
    } catch (error) {
      console.error('Failed to save answers:', error);
    }
  }
  
  loadSavedData() {
    try {
      const savedAnswers = sessionStorage.getItem('test_answers');
      if (savedAnswers) {
        this.answers = JSON.parse(savedAnswers);
        this.restoreAnswers();
      }
    } catch (error) {
      console.error('Failed to load answers:', error);
    }
  }
  
  restoreAnswers() {
    Object.entries(this.answers).forEach(([question, answer]) => {
      const radio = this.testForm.querySelector(
        `input[name="${question}"][value="${answer}"]`
      );
      if (radio) radio.checked = true;
    });
    this.updateProgress();
  }
  
  showTestForm() {
    if (!this.testSection) return;
    
    // Видаляємо клас приховування
    this.testSection.classList.remove('hidden');
    
    // Невелика затримка для рендерингу перед скролом
    setTimeout(() => {
      // Знаходимо заголовок для скролу
      const testTitle = this.testSection.querySelector('.test__title');
      
      if (testTitle) {
        // Скрол до заголовка з центруванням (не перекриє header)
        testTitle.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      } else {
        // Fallback: скрол до секції
        this.testSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }
  
  async handleSubmit(event) {
    event.preventDefault();
    
    // Валідація
    if (!this.validateForm()) return;
    
    // Отримання CSRF токена з meta тегу
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!csrfToken) {
      alert('Помилка безпеки: CSRF токен не знайдено');
      return;
    }
    
    // Формування даних
    const formData = new FormData(this.testForm);
    
    try {
      // Відправка на сервер
      const response = await fetch('/api/test/submit/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Успіх - показати повідомлення
        alert(data.message);
        
        // Очистити форму
        this.clearForm();
        
        // Приховати секцію тесту
        this.testSection.classList.add('hidden');
        
        // Скрол до CTA
        const ctaSection = document.getElementById('cta');
        if (ctaSection) {
          ctaSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Помилка
        alert(data.message || 'Помилка при відправці форми');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Помилка при відправці форми. Спробуйте пізніше.');
    }
  }
  
  validateForm() {
    // Перевірка відповідей
    for (let i = 1; i <= this.totalSteps; i++) {
      const questionName = `question_${i}`;
      if (!this.answers[questionName]) {
        alert(`Будь ласка, дайте відповідь на питання ${i}`);
        return false;
      }
    }
    
    // Перевірка імені
    const nameField = this.testForm.querySelector('[name="name"]');
    if (!nameField.value || nameField.value.trim().length < 2) {
      alert("Введіть коректне ім'я (мінімум 2 символи)");
      nameField.focus();
      return false;
    }
    
    // Перевірка телефону
    const phoneField = this.testForm.querySelector('[name="phone"]');
    const phoneValue = phoneField.value.replace(/[^\d+]/g, '');
    if (phoneValue.replace(/\D/g, '').length < 10) {
      alert("Введіть коректний номер телефону (мінімум 10 цифр)");
      phoneField.focus();
      return false;
    }
    
    return true;
  }
  
  clearForm() {
    this.testForm.reset();
    this.answers = {};
    sessionStorage.removeItem('test_answers');
    this.updateProgress();
  }
}






