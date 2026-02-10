import re
import time


BOT_PATTERNS = re.compile(
    r'bot|crawl|spider|slurp|yahoo|bing|baidu|yandex|duckduckgo'
    r'|facebookexternalhit|twitterbot|linkedinbot|whatsapp'
    r'|googlebot|google-ads|adsbot|mediapartners'
    r'|python-requests|curl|wget|httpx|aiohttp'
    r'|render/|go-http-client',
    re.IGNORECASE
)

# In-memory request log для поведінкової перевірки ботів
_request_log = {}  # {ip: [timestamp, timestamp, ...]}


def is_bot_user_agent(ua: str) -> bool:
    """Перевірка чи User Agent належить боту"""
    return bool(BOT_PATTERNS.search(ua))


def is_suspicious_frequency(ip: str, threshold: int = 5, window: int = 10) -> bool:
    """
    Поведінкова перевірка ботів за частотою запитів.
    Якщо з одного IP прийшло threshold+ запитів за window секунд - це бот.
    """
    now = time.time()
    times = _request_log.get(ip, [])
    # Залишити тільки записи в межах вікна
    times = [t for t in times if now - t < window]
    times.append(now)
    _request_log[ip] = times
    
    # Періодично очищати старі записи (кожні 1000 запитів)
    if len(_request_log) > 1000:
        cutoff = now - window * 2
        _request_log.clear()
        for ip_key, timestamps in list(_request_log.items()):
            valid = [t for t in timestamps if t > cutoff]
            if valid:
                _request_log[ip_key] = valid
            else:
                del _request_log[ip_key]
    
    return len(times) >= threshold


def get_client_ip(request) -> str:
    """Отримати IP адресу клієнта з урахуванням проксі"""
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def detect_device_type(ua: str) -> str:
    """Визначити тип пристрою за User Agent"""
    ua_lower = ua.lower()
    if 'mobile' in ua_lower or 'android' in ua_lower:
        return 'mobile'
    if 'tablet' in ua_lower or 'ipad' in ua_lower:
        return 'tablet'
    return 'desktop'
