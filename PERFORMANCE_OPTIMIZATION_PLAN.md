# План оптимізації продуктивності SpeakUp на Render

## Дата: 6 лютого 2026

## Виявлені проблеми

### 1. Статичні файли (КРИТИЧНО)
- ❌ Послідовне завантаження 30+ CSS/JS файлів
- ❌ Відсутність browser cache (`WHITENOISE_MAX_AGE = 0`)
- ❌ Відсутність CDN
- ❌ HTTP/1.1 замість HTTP/2

### 2. Gunicorn налаштування (ВИСОКИЙ ПРІОРИТЕТ)
- ❌ Дефолтні worker налаштування (1 worker)
- ❌ Відсутність preload для додатку
- ❌ Відсутність keepalive налаштувань
- ❌ Відсутність timeout оптимізацій

### 3. Frontend оптимізація (СЕРЕДНІЙ ПРІОРИТЕТ)
- ❌ Багато окремих CSS файлів замість bundle
- ❌ Відсутність critical CSS inline
- ❌ HTMX завантажується з зовнішнього CDN без preconnect
- ❌ Багато модулів JS завантажуються окремо

### 4. База даних (НИЗЬКИЙ ПРІОРИТЕТ)
- ❌ Відсутність connection pooling
- ❌ Відсутність query оптимізацій

### 5. Middleware (НИЗЬКИЙ ПРІОРИТЕТ)
- ⚠️ Багато middleware для кожного запиту
- ⚠️ Database запити в middleware (NewsRedirectMiddleware)

## Рішення

### ФАЗА 1: Критичні виправлення (ЗАРАЗ)

#### 1.1. Gunicorn оптимізація
```bash
# gunicorn.conf.py
workers = (2 * cpu_count) + 1  # Оптимальна кількість для Render Starter
worker_class = 'sync'
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 5
preload_app = True
```

#### 1.2. Увімкнути кешування статичних файлів
```python
# production.py
WHITENOISE_MAX_AGE = 31536000  # 1 рік для статики з хешами
WHITENOISE_IMMUTABLE_FILE_TEST = lambda path, url: True  # immutable для всіх статичних файлів
```

#### 1.3. HTTP/2 та Compression
- Додати заголовки у WhiteNoise для кращої компресії
- Оптимізувати middleware order

#### 1.4. Preconnect для CDN
```html
<link rel="preconnect" href="https://unpkg.com" crossorigin>
<link rel="dns-prefetch" href="https://unpkg.com">
```

### ФАЗА 2: Frontend оптимізація (НАСТУПНА)

#### 2.1. CSS bundling
- Об'єднати критичні CSS в один файл
- Залишити page-specific CSS окремо

#### 2.2. JS modules оптимізація
- Розглянути bundling для production
- Використати import maps

#### 2.3. Image optimization
- Виправити 404 для news/images/
- Додати lazy loading для всіх зображень

### ФАЗА 3: Database оптимізація (ПОТІМ)

#### 3.1. Connection pooling
```python
DATABASES = {
    'default': {
        'CONN_MAX_AGE': 600,  # 10 хвилин
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

#### 3.2. Query оптимізація
- Додати select_related/prefetch_related де потрібно
- Cache для NewsRedirectMiddleware

## Метрики успіху

### До оптимізації (поточний стан):
- Time to First Byte (TTFB): ~2-3s
- Load Time: ~5-8s
- Number of requests: 40+

### Після оптимізації (цільові показники):
- Time to First Byte (TTFB): <500ms
- Load Time: <2s
- Number of requests: <30
- Browser cache hit rate: >80%

## Ризики та міtigації

1. **Ризик**: Кешування може призвести до показу старої версії після деплою
   **Міtigація**: WhiteNoise автоматично додає хеші до файлів

2. **Ризик**: Збільшення workers може перевищити memory ліміт
   **Міtigація**: Почати з 3 workers, моніторити memory

3. **Ризик**: Preload може збільшити час старту
   **Міtigація**: Acceptable trade-off для швидкості після старту

## Виконання

### Крок 1: Створити gunicorn.conf.py ✓
### Крок 2: Оновити production.py для кешування ✓
### Крок 3: Оновити render.yaml для використання gunicorn config ✓
### Крок 4: Оновити base.html з preconnect hints ✓
### Крок 5: Тестування на Render після деплою
### Крок 6: Моніторинг метрик
