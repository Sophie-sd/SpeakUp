from django.db import models
from django.utils import timezone


class VisitorSession(models.Model):
    """Сесія відвідувача сайту"""
    
    DEVICE_CHOICES = [
        ('mobile', 'Mobile'),
        ('desktop', 'Desktop'),
        ('tablet', 'Tablet'),
    ]
    
    session_key = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        verbose_name='Ключ сесії'
    )
    ip_address = models.GenericIPAddressField(
        db_index=True,
        verbose_name='IP адреса'
    )
    user_agent = models.CharField(
        max_length=512,
        verbose_name='User Agent'
    )
    referrer = models.CharField(
        max_length=2048,
        blank=True,
        default='',
        verbose_name='Referrer'
    )
    utm_source = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='UTM Source'
    )
    utm_medium = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='UTM Medium'
    )
    utm_campaign = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='UTM Campaign'
    )
    utm_content = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='UTM Content'
    )
    utm_term = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='UTM Term'
    )
    first_seen = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        verbose_name='Перше відвідування'
    )
    last_activity = models.DateTimeField(
        default=timezone.now,
        verbose_name='Остання активність'
    )
    is_bot = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name='Це бот'
    )
    device_type = models.CharField(
        max_length=10,
        choices=DEVICE_CHOICES,
        default='desktop',
        verbose_name='Тип пристрою'
    )
    
    class Meta:
        verbose_name = 'Сесія відвідувача'
        verbose_name_plural = 'Сесії відвідувачів'
        ordering = ['-first_seen']
        indexes = [
            models.Index(fields=['first_seen', 'ip_address']),
            models.Index(fields=['is_bot', 'first_seen']),
        ]
    
    def __str__(self):
        return f'{self.ip_address} - {self.first_seen}'


class PageView(models.Model):
    """Перегляд окремої сторінки"""
    
    SOURCE_CHOICES = [
        ('js', 'JavaScript'),
        ('server', 'Server'),
    ]
    
    session = models.ForeignKey(
        VisitorSession,
        on_delete=models.CASCADE,
        related_name='page_views',
        verbose_name='Сесія'
    )
    url = models.CharField(
        max_length=2048,
        db_index=True,
        verbose_name='URL'
    )
    page_title = models.CharField(
        max_length=512,
        blank=True,
        default='',
        verbose_name='Заголовок сторінки'
    )
    entered_at = models.DateTimeField(
        default=timezone.now,
        verbose_name='Час входу'
    )
    time_spent_seconds = models.PositiveIntegerField(
        default=0,
        verbose_name='Проведено секунд'
    )
    is_exit_page = models.BooleanField(
        default=False,
        verbose_name='Вихідна сторінка'
    )
    source = models.CharField(
        max_length=10,
        choices=SOURCE_CHOICES,
        default='server',
        verbose_name='Джерело запису'
    )
    
    class Meta:
        verbose_name = 'Перегляд сторінки'
        verbose_name_plural = 'Перегляди сторінок'
        ordering = ['entered_at']
        indexes = [
            models.Index(fields=['session', 'entered_at']),
            models.Index(fields=['url', 'entered_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['session', 'url', 'entered_at'],
                name='unique_pageview'
            )
        ]
    
    def __str__(self):
        return f'{self.session.ip_address} - {self.url}'
