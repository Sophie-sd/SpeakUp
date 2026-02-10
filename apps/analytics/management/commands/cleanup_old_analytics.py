from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

from apps.analytics.models import VisitorSession


class Command(BaseCommand):
    help = 'Видалити аналітичні дані старші за ANALYTICS_RETENTION_DAYS'
    
    def handle(self, *args, **options):
        days = getattr(settings, 'ANALYTICS_RETENTION_DAYS', 30)
        cutoff = timezone.now() - timedelta(days=days)
        
        self.stdout.write(f'Видалення сесій старших за {days} днів (до {cutoff})...')
        
        # Batch delete для уникнення блокування таблиці
        total = 0
        while True:
            ids = list(
                VisitorSession.objects.filter(first_seen__lt=cutoff)
                .values_list('id', flat=True)[:1000]
            )
            if not ids:
                break
            
            # CASCADE автоматично видалить пов'язані PageView
            deleted, _ = VisitorSession.objects.filter(id__in=ids).delete()
            total += deleted
            
            self.stdout.write(f'Видалено {deleted} сесій... (загалом: {total})')
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('Немає старих записів для видалення'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Успішно видалено {total} сесій старших за {days} днів')
            )
