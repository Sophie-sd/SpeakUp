# Інструкції після деплою оптимізацій продуктивності

## Дата: 6 лютого 2026

## Що було зроблено

### 1. Gunicorn оптимізація ✅
- Створено `gunicorn.conf.py` з оптимальними налаштуваннями
- 3 workers для Render Starter plan (512MB RAM)
- Preload application для швидшого запуску
- Connection keepalive для HTTP/1.1
- Max requests lifecycle для запобігання memory leaks

### 2. Кешування статичних файлів ✅
- Увімкнено browser cache на 1 рік для статики
- WhiteNoise immutable files
- Brotli compression увімкнено
- Оптимізовані MIME types

### 3. Database оптимізація ✅
- Connection pooling (CONN_MAX_AGE = 600s)
- Statement timeout (30s)
- Connect timeout (10s)

### 4. Cache для middleware ✅
- Додано локальний memory cache
- NewsRedirectMiddleware тепер кешує redirects (1 година)
- Зменшено DB queries для redirects

### 5. Frontend оптимізація ✅
- Додано preconnect для unpkg.com та GTM
- Додано preload для критичних ресурсів
- Оптимізовано prefetch стратегію

### 6. Middleware order ✅
- HealthCheckMiddleware - перший (швидкий вихід)
- Оптимізовано порядок для мінімізації overhead

## Тестування після деплою

### Крок 1: Перевірка працездатності
```bash
# Перевірити healthcheck
curl https://speak-up.com.ua/healthz

# Повинно повернути "OK" з 200 status
```

### Крок 2: Перевірка gunicorn
```bash
# В логах Render шукати:
# "[Gunicorn] Starting with 3 workers"
# "[Gunicorn] Preload app: True"
```

### Крок 3: Перевірка кешування
```bash
# Перевірити headers для статичних файлів
curl -I https://speak-up.com.ua/static/css/base.css

# Шукати заголовки:
# Cache-Control: public, max-age=31536000, immutable
# Content-Encoding: br (або gzip)
```

### Крок 4: Перевірка швидкості завантаження
1. Відкрити https://speak-up.com.ua у браузері
2. Відкрити DevTools → Network
3. Очистити cache (Cmd+Shift+R або Ctrl+Shift+R)
4. Перезавантажити сторінку
5. Перевірити метрики:
   - **Time to First Byte (TTFB)**: повинно бути <500ms
   - **Load Time**: повинно бути <2s
   - **Number of requests**: ~30-40

### Крок 5: Перевірка з кешем
1. Перезавантажити сторінку знову (без очищення кешу)
2. Перевірити метрики:
   - Більшість статичних файлів повинні бути "(from disk cache)"
   - Load Time: повинно бути <1s

### Крок 6: PageSpeed Insights
```bash
# Протестувати на:
# https://pagespeed.web.dev/
# Ввести: https://speak-up.com.ua

# Цільові показники:
# Performance: >80 (Mobile), >90 (Desktop)
# First Contentful Paint: <1.8s
# Largest Contentful Paint: <2.5s
# Time to Interactive: <3.8s
```

## Моніторинг

### Метрики для відстеження
1. **Response Time** - середній час відповіді сервера
2. **Error Rate** - відсоток 5xx помилок
3. **Memory Usage** - використання пам'яті workers
4. **CPU Usage** - використання CPU

### Render Dashboard
- Перейти до Render Dashboard
- Перевірити Metrics → Web Service
- Переконатися, що memory usage <450MB (з 512MB)

### Логи для перевірки
```bash
# В Render logs шукати:
# - Successful worker spawns
# - No memory errors
# - No timeout errors
# - Cache hits для news redirects
```

## Очікувані покращення

### До оптимізації
- TTFB: ~2-3s
- Load Time: ~5-8s
- Requests: 40+
- Cache: 0%

### Після оптимізації
- TTFB: <500ms (покращення 4-6x)
- Load Time: <2s (покращення 2.5-4x)
- Requests: ~30-40 (без змін, але з кешем)
- Cache: >80% (при повторних візитах)

## Проблеми та рішення

### Якщо сайт не запускається
1. Перевірити логи Render на наявність помилок
2. Можливо потрібно зменшити кількість workers до 2
3. Відредагувати gunicorn.conf.py: `workers = 2`

### Якщо high memory usage
1. Зменшити workers в gunicorn.conf.py
2. Зменшити CONN_MAX_AGE до 300
3. Зменшити MAX_ENTRIES в CACHES до 500

### Якщо slow requests
1. Перевірити DB query performance
2. Додати індекси для NewsArticle.old_url_uk, old_url_ru
3. Збільшити cache timeout для redirects

### Якщо 404 для зображень
Це окрема проблема, не пов'язана з оптимізацією:
```bash
# Виправити шляхи до зображень в базі даних
python manage.py shell
# >>> from apps.core.models import NewsArticle
# >>> articles = NewsArticle.objects.all()
# >>> for article in articles:
# >>>     # Перевірити та виправити image paths
```

## Подальші оптимізації (опціонально)

### Фаза 2 (якщо потрібно ще більше покращень)
1. Додати Redis для cache (замість locmem)
2. Bundle критичних CSS файлів
3. Додати CDN (Cloudflare)
4. Lazy loading для зображень
5. Оптимізувати database queries (select_related/prefetch_related)

### Фаза 3 (advanced)
1. HTTP/2 Server Push
2. Service Workers для offline
3. Progressive Web App (PWA)
4. WebP/AVIF images

## Контрольний список

- [ ] Деплой на Render виконано
- [ ] Healthcheck працює
- [ ] Gunicorn logs показують 3 workers
- [ ] Статичні файли мають Cache-Control headers
- [ ] TTFB <500ms
- [ ] Load Time <2s
- [ ] PageSpeed score >80
- [ ] Memory usage <450MB
- [ ] No errors в логах

## Повернення до попередньої версії (якщо щось пішло не так)

```bash
# В render.yaml повернути:
startCommand: gunicorn SpeakUp.wsgi:application

# В production.py повернути:
WHITENOISE_MAX_AGE = 0

# Видалити gunicorn.conf.py

# Деплой
git revert HEAD
git push
```

## Контакти підтримки

Якщо виникли питання або проблеми:
1. Перевірити логи Render
2. Перевірити цей документ
3. Звернутися до команди розробки
