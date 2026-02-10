import json
import threading
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils import timezone

from .models import VisitorSession, PageView
from .utils import is_bot_user_agent, get_client_ip, detect_device_type


@csrf_exempt
@require_POST
def track_pageview(request):
    """Отримати дані про перегляд сторінки від JS через sendBeacon"""
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return HttpResponse(status=400)
    
    # Швидка валідація
    session_key = data.get('session_key', '')[:64]
    url = data.get('url', '')[:2048]
    if not session_key or not url:
        return HttpResponse(status=400)
    
    # Повертаємо 204 негайно, обробка в фоновому потоці
    def _record():
        try:
            ip = get_client_ip(request)
            ua = request.META.get('HTTP_USER_AGENT', '')[:512]
            now = timezone.now()
            
            # Отримати або створити сесію
            session, created = VisitorSession.objects.get_or_create(
                session_key=session_key,
                defaults={
                    'ip_address': ip,
                    'user_agent': ua,
                    'referrer': data.get('referrer', '')[:2048],
                    'utm_source': data.get('utm_source', '')[:255],
                    'utm_medium': data.get('utm_medium', '')[:255],
                    'utm_campaign': data.get('utm_campaign', '')[:255],
                    'utm_content': data.get('utm_content', '')[:255],
                    'utm_term': data.get('utm_term', '')[:255],
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
            
            # Створити або оновити перегляд сторінки
            entered_at_str = data.get('entered_at')
            if entered_at_str:
                try:
                    from django.utils.dateparse import parse_datetime
                    entered_at = parse_datetime(entered_at_str) or now
                except (ValueError, TypeError):
                    entered_at = now
            else:
                entered_at = now
            
            PageView.objects.update_or_create(
                session=session,
                url=url,
                entered_at=entered_at,
                defaults={
                    'page_title': data.get('page_title', '')[:512],
                    'time_spent_seconds': int(data.get('time_spent', 0)),
                    'is_exit_page': data.get('is_exit', False),
                    'source': 'js',
                }
            )
        except Exception as e:
            # Логуємо помилку, але не падаємо
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Analytics recording error: {e}')
    
    # Запустити в фоновому потоці
    thread = threading.Thread(target=_record, daemon=True)
    thread.start()
    
    return HttpResponse(status=204)
