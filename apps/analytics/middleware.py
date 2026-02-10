import threading
import os
from datetime import timedelta
from django.conf import settings
from django.utils import timezone

from .models import VisitorSession, PageView
from .utils import is_bot_user_agent, get_client_ip, detect_device_type, is_suspicious_frequency


class VisitorTrackingMiddleware:
    """
    Middleware для відстеження відвідувачів (fallback якщо JS не працює).
    Записує тільки якщо JS не відправив дані.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.enabled = getattr(settings, 'ANALYTICS_ENABLED', True)
        self.ignore_paths = getattr(settings, 'ANALYTICS_IGNORE_PATHS', [
            '/admin/', '/static/', '/media/', '/api/analytics/', '/healthz'
        ])
        self.file_extensions = (
            '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', 
            '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map', '.txt', '.xml'
        )
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Пропустити якщо вимкнено
        if not self.enabled:
            return response
        
        # Пропустити ігноровані шляхи
        path = request.path
        if any(path.startswith(ignore) for ignore in self.ignore_paths):
            return response
        
        # Пропустити файли
        if path.endswith(self.file_extensions):
            return response
        
        ip = get_client_ip(request)
        ua = request.META.get('HTTP_USER_AGENT', '')
        
        # Пропустити ботів (User-Agent)
        if is_bot_user_agent(ua):
            return response
        
        # Пропустити ботів (поведінка)
        if is_suspicious_frequency(ip):
            return response
        
        # Перевірити _google_ads_bot від GoogleAdsBotMiddleware
        if getattr(request, '_google_ads_bot', False):
            return response
        
        # Записати в фоновому потоці
        def _record():
            try:
                self._record_pageview(request, ip, ua)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'Middleware analytics error: {e}')
        
        thread = threading.Thread(target=_record, daemon=True)
        thread.start()
        
        return response
    
    def _normalize_url(self, url: str) -> str:
        """Нормалізувати URL -- прибрати trailing slash (крім кореня)"""
        if url != '/' and url.endswith('/'):
            return url.rstrip('/')
        return url
    
    def _record_pageview(self, request, ip: str, ua: str):
        """Записати перегляд сторінки"""
        now = timezone.now()
        normalized_url = self._normalize_url(request.path)
        
        # Створити унікальний ключ сесії на базі Django session
        if hasattr(request, 'session'):
            if '_analytics_session_key' not in request.session:
                import uuid
                request.session['_analytics_session_key'] = str(uuid.uuid4())
            session_key = request.session['_analytics_session_key']
        else:
            # Fallback якщо немає сесії
            import hashlib
            session_key = hashlib.md5(f'{ip}{ua}'.encode()).hexdigest()
        
        # Отримати або створити сесію (НЕ записуємо ботів)
        session, created = VisitorSession.objects.get_or_create(
            session_key=session_key,
            defaults={
                'ip_address': ip,
                'user_agent': ua[:512],
                'referrer': request.META.get('HTTP_REFERER', '')[:2048],
                'first_seen': now,
                'last_activity': now,
                'is_bot': False,  # Бо ми вже відфільтрували ботів вище
                'device_type': detect_device_type(ua),
            }
        )
        
        # Оновити час останньої активності
        if not created:
            session.last_activity = now
            session.save(update_fields=['last_activity'])
        
        # Перевірити чи вже є запис за останні 30 секунд (дедуплікація)
        recent_exists = PageView.objects.filter(
            session=session,
            url=normalized_url,
            entered_at__gte=now - timedelta(seconds=30)
        ).exists()
        
        # Записати тільки якщо немає дубля
        if not recent_exists:
            PageView.objects.create(
                session=session,
                url=normalized_url,
                page_title='',
                entered_at=now,
                time_spent_seconds=0,
                is_exit_page=False,
                source='server',
            )

