/**
 * Модуль для ротації відео в hero секції
 * Використовує device detection для показу правильних відео
 */

export class VideoRotationManager {
  constructor() {
    this.currentIndex = 0;
    this.isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.device = this.isMobile ? 'mobile' : 'desktop';
    
    this.videoElements = [];
    this.isTransitioning = false;
    this.endedHandlers = new Map();
    this.init();
  }
  
  init() {
    // Знайти відео для поточного пристрою
    const allVideos = document.querySelectorAll('.video-rotating');
    this.videoElements = Array.from(allVideos).filter(video => {
      const videoDevice = video.dataset.device;
      return videoDevice === this.device;
    });
    
    if (this.videoElements.length === 0) {
      return;
    }
    
    // Налаштування iOS оптимізацій
    if (this.isIOS) {
      this.applyIOSOptimizations();
      
      // На iOS уникаємо складної ротації: показуємо лише перше відео
      const firstVideo = this.videoElements[0];
      this.videoElements.forEach((video, index) => {
        if (index === 0) {
          video.classList.remove('video-hidden');
          video.play().catch(() => {});
        } else {
          video.classList.add('video-hidden');
          video.pause();
        }
      });
      return;
    }
    
    // Для інших платформ потрібні щонайменше 2 відео для ротації
    if (this.videoElements.length < 2) {
      this.videoElements[0].classList.remove('video-hidden');
      this.videoElements[0].play().catch(() => {});
      return;
    }
    
    // Налаштування мобільних оптимізацій
    if (this.isMobile) {
      this.applyMobileOptimizations();
    }
    
    // Запуск ротації (для desktop та Android мобільних)
    this.startRotation();
  }
  
  startRotation() {
    // Початковий стан
    this.videoElements.forEach((video, index) => {
      if (index === 0) {
        video.classList.remove('video-hidden');
        video.play();
        this.setupVideoEndTransition(video, index);
      } else {
        video.classList.add('video-hidden');
        video.pause();
      }
    });
  }
  
  setupVideoEndTransition(video, videoIndex) {
    // Видалити попередній handler якщо він існує
    if (this.endedHandlers.has(video)) {
      const oldHandler = this.endedHandlers.get(video);
      video.removeEventListener('ended', oldHandler);
    }
    
    const checkVideoTime = () => {
      // Перевірка чи не відбувається вже перехід
      if (this.isTransitioning) {
        return;
      }
      
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      // За 1 секунду до кінця - запускаємо перехід
      if (duration && currentTime >= duration - 1) {
        this.startTransition(videoIndex);
        return;
      }
      
      // Перевіряємо кожні 100мс
      if (!video.paused && !this.isTransitioning) {
        setTimeout(checkVideoTime, 100);
      }
    };
    
    checkVideoTime();
    
    // Додатковий обробник з збереженням для майбутнього видалення
    const endedHandler = () => {
      if (!this.isTransitioning) {
        this.startTransition(videoIndex);
      }
    };
    
    video.addEventListener('ended', endedHandler);
    this.endedHandlers.set(video, endedHandler);
  }
  
  startTransition(fromIndex) {
    // Захист від подвійного виклику
    if (this.isTransitioning) {
      return;
    }
    
    this.isTransitioning = true;
    
    const currentVideo = this.videoElements[fromIndex];
    const nextIndex = (fromIndex + 1) % this.videoElements.length;
    const nextVideo = this.videoElements[nextIndex];
    
    // Підготовка наступного відео
    nextVideo.currentTime = 0;
    nextVideo.classList.remove('video-hidden');
    nextVideo.play();
    
    // Плавний перехід
    setTimeout(() => {
      currentVideo.classList.add('video-hidden');
      
      setTimeout(() => {
        currentVideo.pause();
        currentVideo.currentTime = 0;
        this.isTransitioning = false;
        
        this.currentIndex = nextIndex;
        this.setupVideoEndTransition(nextVideo, nextIndex);
      }, 1000);
    }, 100);
  }
  
  applyIOSOptimizations() {
    this.videoElements.forEach(video => {
      video.playsInline = true;
      video.muted = true;
      video.setAttribute('webkit-playsinline', 'true');
    });
  }
  
  applyMobileOptimizations() {
    // Мобільні оптимізації (без блокування ротації)
    this.videoElements.forEach(video => {
      video.muted = true;
    });
  }
}






