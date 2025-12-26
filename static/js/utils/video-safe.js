/**
 * Video Safe Utilities
 * 
 * Цей модуль містить утиліти для безпечної роботи з відео, що дотримуються всіх правил:
 * - Обов'язковий poster атрибут
 * - Перевірка можливості autoplay
 * - Синхронізація анімації з завантаженням відео
 * - Graceful degradation для браузерів без підтримки відео
 * 
 * Використання:
 * import { createSafeVideoElement, syncAnimationWithVideo } from './video-safe.js';
 */

/**
 * Створює безпечний <video> елемент з обов'язковою перевіркою poster та autoplay
 * 
 * @param {Object} options - Опції для створення відео
 * @param {string} options.src - Шлях до відео файлу (обов'язковий)
 * @param {string} options.poster - Шлях до poster зображення (обов'язковий!)
 * @param {string} [options.type='video/mp4'] - MIME type відео
 * @param {boolean} [options.autoplay=false] - Спроба запустити відео автоматично
 * @param {boolean} [options.controls=true] - Показати контролі відео
 * @param {boolean} [options.muted=true] - Вимкнути звук (потрібно для autoplay)
 * @param {boolean} [options.loop=false] -ループ відео
 * @param {number} [options.width] - Ширина відео
 * @param {number} [options.height] - Висота відео
 * @param {string} [options.fallbackText] - Текст для браузерів без підтримки відео
 * 
 * @returns {HTMLVideoElement} <video> елемент
 * @throws {Error} Якщо poster або src не передані
 * 
 * @example
 * const video = createSafeVideoElement({
 *   src: '/static/videos/demo.mp4',
 *   poster: '/static/images/demo-poster.jpg',
 *   autoplay: true,
 *   muted: true
 * });
 * document.body.appendChild(video);
 */
export function createSafeVideoElement(options = {}) {
  // Перевірка обов'язкових параметрів
  if (!options.src) {
    throw new Error('createSafeVideoElement: src є обов\'язковим параметром');
  }
  
  if (!options.poster) {
    throw new Error(
      'createSafeVideoElement: poster є обов\'язковим параметром. ' +
      'Без poster користувач бачить порожній екран до завантаження відео. ' +
      'Використовуйте першого кадра чи мініатюру як poster.'
    );
  }
  
  // Деструктуризація опцій з fallback значеннями
  const {
    src,
    poster,
    type = 'video/mp4',
    autoplay = false,
    controls = true,
    muted = true,
    loop = false,
    width,
    height,
    fallbackText = 'Ваш браузер не підтримує відео. Завантажте його: <a href="' + src + '">скачати відео</a>'
  } = options;
  
  // Створення <video> елемента
  const video = document.createElement('video');
  
  // Додавання обов'язкових атрибутів
  video.poster = poster;
  video.src = src;
  
  // Додавання опціональних атрибутів
  video.controls = controls;
  video.muted = muted;
  video.loop = loop;
  
  if (width) video.width = width;
  if (height) video.height = height;
  
  // Додавання <source> елемента для краще підтримки типів
  const source = document.createElement('source');
  source.src = src;
  source.type = type;
  video.appendChild(source);
  
  // Додавання fallback тексту для браузерів без підтримки відео
  const fallback = document.createElement('p');
  fallback.innerHTML = fallbackText;
  video.appendChild(fallback);
  
  // Обробка autoplay з перевіркою можливості
  if (autoplay) {
    // Спробуємо запустити відео
    const autoplayPromise = video.play().catch(() => {
      // Якщо autoplay не вдалось (iOS, Android, нові браузери блокують це),
      // додамо кнопку play
      handleAutoplayBlocked(video);
    });
    
    // Відслідкуємо коли відео завантажилось
    video.addEventListener('loadeddata', () => {
      if (!video.autoplay && autoplayPromise && autoplayPromise.catch) {
        autoplayPromise.catch(() => {
          // Уже обробили блокування autoplay
        });
      }
    }, { once: true });
  }
  
  return video;
}

/**
 * Обробляє ситуацію коли autoplay був заблокований браузером
 * Додає прозоре посвітлення з кнопкою play поверх видео
 * 
 * @param {HTMLVideoElement} video - <video> елемент
 * @private
 */
function handleAutoplayBlocked(video) {
  // Якщо вже є оверлей - не додавати новий
  if (video.nextElementSibling?.classList.contains('video-play-overlay')) {
    return;
  }
  
  // Створення overlay контейнера
  const overlay = document.createElement('div');
  overlay.className = 'video-play-overlay';
  
  // Стилізація оверлею (inline, але мінімальна)
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    cursor: pointer;
    z-index: 10;
  `;
  
  // Створення кнопки play
  const playBtn = document.createElement('button');
  playBtn.className = 'video-play-btn';
  playBtn.setAttribute('aria-label', 'Запустити відео');
  
  // SVG іконка play
  playBtn.innerHTML = `
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="white" opacity="0.9"/>
      <path d="M26 22v20l14-10z" fill="#000"/>
    </svg>
  `;
  
  // Стилізація кнопки
  playBtn.style.cssText = `
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  `;
  
  // Ефект при наведенні
  playBtn.addEventListener('mouseenter', () => {
    playBtn.style.transform = 'scale(1.1)';
  });
  
  playBtn.addEventListener('mouseleave', () => {
    playBtn.style.transform = 'scale(1)';
  });
  
  // Обробка клику на кнопку play
  const handlePlayClick = () => {
    video.play().then(() => {
      // Успішно запустили - видалити оверлей
      overlay.remove();
    }).catch((error) => {
      // Все ще не можемо запустити
      console.warn('Не можемо запустити відео:', error);
    });
  };
  
  playBtn.addEventListener('click', handlePlayClick);
  overlay.addEventListener('click', handlePlayClick);
  
  // Видаляємо оверлей якщо відео почав грати самостійно
  video.addEventListener('play', () => {
    overlay.remove();
  }, { once: true });
  
  overlay.appendChild(playBtn);
  
  // Вставляємо оверлей після видео
  // Якщо видео в контейнері з position: relative - це буде працювати
  video.parentElement?.style.setProperty('position', 'relative', 'important');
  video.parentElement?.insertBefore(overlay, video.nextSibling);
}

/**
 * Синхронізує анімацію з завантаженням та програванням відео
 * 
 * Це гарантує що анімація не запуститься поки відео не готове,
 * та вона не буде затримуватись якщо відео завантажується довго.
 * 
 * @param {HTMLVideoElement} video - <video> елемент
 * @param {HTMLElement} animationElement - Елемент який буде анімуватись
 * @param {Object} [options] - Опції синхронізації
 * @param {string} [options.startEvent='play'] - Подія яка запускає анімацію ('play', 'timeupdate', тощо)
 * @param {number} [options.fallbackDuration=5000] - Час в мс, після якого анімація запуститься навіть якщо відео не готове
 * @param {string} [options.animationClass='active'] - Клас який додасться до елемента для запуску анімації
 * @param {Function} [options.onStart] - Callback коли анімація стартує
 * @param {Function} [options.onEnd] - Callback коли анімація завершується
 * 
 * @returns {Object} Об'єкт з методами контролю синхронізації
 * 
 * @example
 * const sync = syncAnimationWithVideo(
 *   document.querySelector('video'),
 *   document.querySelector('.animated-overlay'),
 *   {
 *     startEvent: 'play',
 *     fallbackDuration: 3000,
 *     animationClass: 'fade-in'
 *   }
 * );
 * 
 * // Пізніше можна отримати статус
 * console.log(sync.isAnimating);
 */
export function syncAnimationWithVideo(
  video,
  animationElement,
  options = {}
) {
  // Опції з fallback значеннями
  const {
    startEvent = 'play',
    fallbackDuration = 5000,
    animationClass = 'active',
    onStart = null,
    onEnd = null
  } = options;
  
  // Стан синхронізації
  const state = {
    isAnimating: false,
    videoReady: false,
    fallbackTimeout: null
  };
  
  /**
   * Запускає анімацію
   */
  const startAnimation = () => {
    if (state.isAnimating) return; // Уже запущена
    
    state.isAnimating = true;
    
    // Очистити fallback timeout якщо він був встановлений
    if (state.fallbackTimeout) {
      clearTimeout(state.fallbackTimeout);
      state.fallbackTimeout = null;
    }
    
    // Додаємо клас анімації
    animationElement.classList.add(animationClass);
    
    // Callback при старті
    if (onStart && typeof onStart === 'function') {
      onStart();
    }
  };
  
  /**
   * Зупиняє анімацію
   */
  const stopAnimation = () => {
    if (!state.isAnimating) return; // Вже зупинена
    
    state.isAnimating = false;
    
    // Видаляємо клас анімації
    animationElement.classList.remove(animationClass);
    
    // Callback при завершенні
    if (onEnd && typeof onEnd === 'function') {
      onEnd();
    }
  };
  
  /**
   * Проверяет готовность видео
   */
  const checkVideoReady = () => {
    return video.readyState >= 2; // HAVE_CURRENT_DATA або краще
  };
  
  // Обробника для початку програвання
  const handleVideoStart = () => {
    state.videoReady = checkVideoReady();
    
    if (state.videoReady) {
      startAnimation();
    } else {
      // Відео не готове - встановити fallback timeout
      state.fallbackTimeout = setTimeout(() => {
        startAnimation();
      }, fallbackDuration);
    }
  };
  
  // Обробник для зупинки програвання
  const handleVideoStop = () => {
    stopAnimation();
  };
  
  // Обробник коли відео готове для програвання
  const handleVideoReady = () => {
    state.videoReady = true;
    
    // Якщо анімація вже запущена (через fallback) - все ОК
    // Якщо ще не запущена - запустити тепер
    if (!state.isAnimating && video.playing) {
      startAnimation();
    }
  };
  
  // Додаємо слухачі подій
  const eventMap = {
    play: handleVideoStart,
    playing: handleVideoReady,
    pause: handleVideoStop,
    ended: handleVideoStop,
    loadeddata: handleVideoReady,
    progress: handleVideoReady
  };
  
  // Додаємо обробник для обраної стартової події
  video.addEventListener(startEvent, handleVideoStart);
  
  // Додаємо інші обробники
  Object.entries(eventMap).forEach(([event, handler]) => {
    if (event !== startEvent) {
      video.addEventListener(event, handler);
    }
  });
  
  // Повертаємо об'єкт з методами контролю та статусом
  return {
    start: startAnimation,
    stop: stopAnimation,
    get isAnimating() {
      return state.isAnimating;
    },
    get videoReady() {
      return state.videoReady;
    },
    /**
     * Видаляє всі слухачі подій (для очистки)
     */
    destroy() {
      video.removeEventListener(startEvent, handleVideoStart);
      Object.entries(eventMap).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
      if (state.fallbackTimeout) {
        clearTimeout(state.fallbackTimeout);
      }
      stopAnimation();
    }
  };
}

/**
 * Перевіряє чи навіть можливий autoplay у цьому браузері/пристрої
 * 
 * @param {Object} [options] - Опції перевірки
 * @param {boolean} [options.muted=true] - Перевіряти з muted=true
 * 
 * @returns {Promise<boolean>} true якщо autoplay можливий, false інакше
 * 
 * @example
 * const canAutoplay = await canAutoplayVideo();
 * if (!canAutoplay) {
 *   console.log('Autoplay заблокований - показати кнопку play');
 * }
 */
export async function canAutoplayVideo(options = {}) {
  const { muted = true } = options;
  
  const video = document.createElement('video');
  video.muted = muted;
  video.autoplay = true;
  
  // Спробуємо запустити
  try {
    const promise = video.play();
    if (promise !== undefined) {
      await promise;
      // Успішно запустили
      video.pause();
      video.src = '';
      return true;
    }
  } catch (error) {
    // Autoplay заблокований
    return false;
  }
  
  return false;
}

/**
 * Завантажує poster зображення до того як відео почнеться
 * Це поліпшує LCP (Largest Contentful Paint)
 * 
 * @param {string} posterUrl - URL до poster зображення
 * @returns {Promise<void>}
 * 
 * @example
 * await preloadPoster('/static/images/video-poster.jpg');
 */
export function preloadPoster(posterUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = posterUrl;
  });
}













