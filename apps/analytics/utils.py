import re


BOT_PATTERNS = re.compile(
    r'bot|crawl|spider|slurp|yahoo|bing|baidu|yandex|duckduckgo'
    r'|facebookexternalhit|twitterbot|linkedinbot|whatsapp'
    r'|googlebot|google-ads|adsbot|mediapartners'
    r'|python-requests|curl|wget|httpx|aiohttp'
    r'|render/|go-http-client',
    re.IGNORECASE
)


def is_bot_user_agent(ua: str) -> bool:
    """Перевірка чи User Agent належить боту"""
    return bool(BOT_PATTERNS.search(ua))


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
