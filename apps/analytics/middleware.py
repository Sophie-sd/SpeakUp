import threading
import os
from django.conf import settings
from django.utils import timezone

from .models import VisitorSession, PageView
from .utils import is_bot_user_agent, get_client_ip, detect_device_type


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
        
        # Пропустити ботів
        ua = request.META.get('HTTP_USER_AGENT', '')
        if is_bot_user_agent(ua):
            return response
        
        # Перевірити _google_ads_bot від GoogleAdsBotMiddleware
        if getattr(request, '_google_ads_bot', False):
            return response
        
        # Записати в фоновому потоці
        def _record():
            try:
                self._record_pageview(request)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'Middleware analytics error: {e}')
        
        thread = threading.Thread(target=_record, daemon=True)
        thread.start()
        
        return response
    
    def _record_pageview(self, request):
        """Записати перегляд сторінки"""
        ip = get_client_ip(request)
        ua = request.META.get('HTTP_USER_AGENT', '')[:512]
        now = timezone.now()
        
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
        
        # Отримати або створити сесію
        session, created = VisitorSession.objects.get_or_create(
            session_key=session_key,
            defaults={
                'ip_address': ip,
                'user_agent': ua,
                'referrer': request.META.get('HTTP_REFERER', '')[:2048],
                'first_seen': now,
                'last_activity': now,
                'is_bot': is_bot_user_agent(ua),
                'device_type': detect_device_type(ua),
            }
        )
        
        # Оновити час останньої активності
        if not created:
            session.last_activity = now
            session.save(update_fields=['last_activity'])
        
        # Перевірити чи JS вже записав цю сторінку
        # Шукаємо останній перегляд з source='js' для цієї сторінки
        recent_js_view = PageView.objects.filter(
            session=session,
            url=request.path,
            source='js',
            entered_at__gte=now - timezone.timedelta(seconds=10)
        ).exists()
        
        # Записати тільки якщо JS не записав
        if not recent_js_view:
            PageView.objects.update_or_create(
                session=session,
                url=request.path,
                entered_at=now,
                defaults={
                    'page_title': '',
                    'time_spent_seconds': 0,
                    'is_exit_page': False,
                    'source': 'server',
                }
            )
