# Правила iOS Safari та доступності

## Вступ

Цей документ описує 8 критичних правил для розробки, що забезпечують сумісність з iOS Safari та дотримання стандартів доступності. **Ці правила неможливо порушити** завдяки утилітам, шаблонам та лінтерам, вбудованим у проєкт.

---

## 1. ❌ Заборона `position: fixed` на iOS Safari

### Проблема
`position: fixed` на iOS Safari викликає "стрибання" елементів при скролі, особливо коли адресна панель браузера ховається або відображається. Це створює погану UX.

### Правильне рішення
Використовувати `.ios-safe-sticky` клас або функцію `createStickyElement()`, які застосовують `position: sticky` з fallback:

```css
/* ✅ ПРАВИЛЬНО */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

/* або використовувати утиліту */
<header class="ios-safe-sticky"></header>
```

```javascript
/* ✅ ПРАВИЛЬНО - JS утиліта */
import { createStickyElement } from '/static/js/utils/ios-sticky.js';
const header = createStickyElement('header', { top: 0 });
```

```javascript
/* ❌ НЕПРАВИЛЬНО */
const header = document.createElement('header');
header.style.position = 'fixed'; // ЗАБОРОНЕ!
```

### Чому це правило
- iOS Safari має баги з `position: fixed` при скроллі
- `position: sticky` працює надійніше та має кращу підтримку
- Утиліта автоматично обирає найкращий варіант

---

## 2. ❌ Відсутність `poster` для відео

### Проблема
Без `poster` атрибута порожній екран відображається до завантаження відео. Це погана продуктивність та UX.

### Правильне рішення
Завжди додавати `poster` з зображенням першого кадру:

```html
<!-- ✅ ПРАВИЛЬНО -->
<video
  poster="/static/images/video-thumbnail.jpg"
  controls
  width="640"
  height="360"
>
  <source src="/static/videos/demo.mp4" type="video/mp4">
  Ваш браузер не підтримує відео.
</video>
```

```javascript
/* ✅ ПРАВИЛЬНО - JS утиліта */
import { createSafeVideoElement } from '/static/js/utils/video-safe.js';
const video = createSafeVideoElement({
  src: '/static/videos/demo.mp4',
  poster: '/static/images/video-thumbnail.jpg',
  autoplay: true
});
```

```html
<!-- ❌ НЕПРАВИЛЬНО -->
<video controls>
  <source src="/static/videos/demo.mp4" type="video/mp4">
</video>
```

### Чому це правило
- Poster забезпечує миттєвий візуальний відгук
- Покращує LCP (Largest Contentful Paint)
- Поліпшує сприйняття продуктивності

---

## 3. ❌ Відсутність `prefers-reduced-motion`

### Проблема
Користувачі з motion sensitivity не можуть використовувати сайт, якщо анімація не приглушена. Це порушує WCAG 2.1 рівень AAA.

### Правильне рішення
Глобальне правило в `ios-safe.css` автоматично обирає всі анімації для користувачів з `prefers-reduced-motion: reduce`:

```css
/* ✅ ПРАВИЛЬНО - вже у ios-safe.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```css
/* ❌ НЕПРАВИЛЬНО - анімація без перевірки prefers-reduced-motion */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}
```

### Чому це правило
- WCAG 2.1 AAA вимагає цього
- Користувачі з motion sensitivity можуть мати проблеми зі здоров'ям
- Утиліта автоматично обирає всі анімації

---

## 4. ❌ Відсутність `safe-area-inset` для iOS

### Проблема
На iOS пристроях з notch (наприклад, iPhone 12+) або Dynamic Island текст може потрапити під ці елементи. Це робить контент нечитаним.

### Правильне рішення
Використовувати CSS custom properties зі значеннями `env()`:

```css
/* ✅ ПРАВИЛЬНО - вже у ios-safe.css */
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}

header {
  padding-top: var(--safe-area-top);
  padding-left: var(--safe-area-left);
  padding-right: var(--safe-area-right);
}
```

```css
/* ❌ НЕПРАВИЛЬНО - без safe-area-inset */
header {
  padding: 16px; /* на iPhone 12+ текст буде під notch */
}
```

### Чому це правило
- Dynamic Island та notch можуть закрити контент
- `env()` функція дає точні значення для кожного пристрою
- Fallback на 0px для браузерів без підтримки

---

## 5. ❌ Відсутність `fallback` для старих браузерів

### Проблема
Старі браузери (IE, Edge < 79) можуть не підтримувати сучасні CSS властивості. Без fallback контент може бути неправильно відображений.

### Правильне рішення
Використовувати `@supports` правила з fallback:

```css
/* ✅ ПРАВИЛЬНО */
.container {
  display: grid;
  gap: 1rem;
  
  @supports not (gap: 1rem) {
    padding: 1rem;
  }
}
```

```css
/* ❌ НЕПРАВИЛЬНО - без fallback */
.container {
  gap: 1rem; /* старі браузери це не розумітимуть */
}
```

### Чому це правило
- Graceful degradation для старих браузерів
- Контент залишається читаним навіть без нових властивостей
- Утиліти автоматично додають fallback

---

## 6. ❌ Синхронізація анімації з відео

### Проблема
Якщо відео не завантажилось, анімація може не запуститись або запуститись без відео. Це створює рассинхронізацію.

### Правильне рішення
Використовувати функцію `syncAnimationWithVideo()`, яка чекає на `loadeddata` подію:

```javascript
/* ✅ ПРАВИЛЬНО - JS утиліта */
import { syncAnimationWithVideo } from '/static/js/utils/video-safe.js';

const video = document.querySelector('video');
const animation = document.querySelector('.animated-overlay');

syncAnimationWithVideo(video, animation, {
  startEvent: 'play',
  fallbackDuration: 5000 // ms
});
```

```javascript
/* ❌ НЕПРАВИЛЬНО - анімація без синхронізації з відео */
const video = document.querySelector('video');
video.play();

setTimeout(() => {
  animation.classList.add('fade-in'); // може не бути синхрона з відео
}, 500);
```

### Чому це правило
- Гарантує синхронізацію анімації з контентом
- Обробляє помилки завантаження відео
- Fallback дозволяє анімації запуститись, якщо відео недоступне

---

## 7. ❌ Відсутність `aspect-ratio` fallback

### Проблема
`aspect-ratio` підтримується новими браузерами, але старі браузери (IE, Edge < 79, Android Browser < 86) не розумітимуть цю властивість. Контейнер може мати неправильний розмір.

### Правильне рішення
Використовувати `@supports` з fallback через `padding-top`:

```css
/* ✅ ПРАВИЛЬНО - вже у ios-safe.css */
.video-container {
  @supports (aspect-ratio: 16/9) {
    aspect-ratio: 16/9;
  }
  
  @supports not (aspect-ratio: 16/9) {
    padding-top: 56.25%; /* 16:9 */
    position: relative;
  }
}

@supports not (aspect-ratio: 16/9) {
  .video-container video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
```

```css
/* ❌ НЕПРАВИЛЬНО - без fallback */
.video-container {
  aspect-ratio: 16/9; /* старі браузери це не розумітимуть */
}
```

### Чому це правило
- Graceful degradation для старих браузерів
- Відео завжди буде правильного розміру
- Утиліти автоматично обирають найкращий варіант

---

## 8. ❌ Відсутність перевірки `autoplay`

### Проблема
Деякі браузери та платформи (мобільні iOS, Android) блокують `autoplay` навіть якщо відео має атрибут `muted`. Без перевірки користувач бачить відео, що не грає, або чує звук неочікувано.

### Правильне рішення
Використовувати функцію `createSafeVideoElement()`, яка перевіряє можливість autoplay:

```javascript
/* ✅ ПРАВИЛЬНО - JS утиліта */
import { createSafeVideoElement } from '/static/js/utils/video-safe.js';

const video = createSafeVideoElement({
  src: '/static/videos/demo.mp4',
  poster: '/static/images/video-thumbnail.jpg',
  autoplay: true, // утиліта перевірить чи можливо це
  muted: true
});
// utіліта автоматично:
// 1. Спробує запустити відео
// 2. Якщо не вдалось - додасть кнопку play
```

```html
<!-- ❌ НЕПРАВИЛЬНО - без перевірки autoplay -->
<video autoplay muted>
  <!-- на iOS це не працюватиме -->
  <source src="/static/videos/demo.mp4" type="video/mp4">
</video>
```

### Чому це правило
- iOS/Android блокують autoplay за замовчуванням
- Браузери можуть змінювати політики autoplay
- Утиліта автоматично додає fallback кнопку play

---

## Впровадження утиліт

Всі правила реалізуються через:
- **CSS утиліти** (`static/css/utils/ios-safe.css`) - автоматично застосовуються
- **JS утиліти** (`static/js/utils/video-safe.js`, `ios-sticky.js`) - імпортуються за потребою
- **Шаблони компонентів** (опціонально) - Django компоненти для повторного використання

Жодного ручного налаштування не потрібно - утиліти обирають найкращий варіант для кожного браузера.

---

## Контрольний список розробника

Перед комітом перевірте:
- [ ] Не використовуєш `position: fixed` - використовуєш `.ios-safe-sticky` або `createStickyElement()`
- [ ] Всі `<video>` мають атрибут `poster`
- [ ] Імпортуєш `ios-safe.css` у основний CSS (автоматично обирає `prefers-reduced-motion`)
- [ ] Використовуєш CSS custom properties для `safe-area-inset` (вже визначені в `:root`)
- [ ] Додаєш `@supports` fallback для сучасних властивостей
- [ ] Синхронізуєш анімацію з відео через `syncAnimationWithVideo()`
- [ ] Додаєш `@supports` fallback для `aspect-ratio`
- [ ] Перевіряєш `autoplay` через `createSafeVideoElement()`











