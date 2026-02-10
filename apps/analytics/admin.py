from django.contrib import admin
from django.db import models
from django.utils.html import format_html
from .models import VisitorSession, PageView


class PageViewInline(admin.TabularInline):
    model = PageView
    extra = 0
    max_num = 100
    can_delete = False
    
    fields = ('step_number', 'url_display', 'time_display', 'duration_display', 'action_display')
    readonly_fields = ('step_number', 'url_display', 'time_display', 'duration_display', 'action_display')
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def step_number(self, obj):
        # Номер кроку в маршруті
        if obj.pk:
            session_views = list(obj.session.page_views.order_by('entered_at'))
            return session_views.index(obj) + 1
        return '-'
    step_number.short_description = '#'
    
    def url_display(self, obj):
        return obj.url
    url_display.short_description = 'Сторінка'
    
    def time_display(self, obj):
        return obj.entered_at.strftime('%H:%M:%S')
    time_display.short_description = 'Час входу'
    
    def duration_display(self, obj):
        minutes, seconds = divmod(obj.time_spent_seconds, 60)
        if minutes > 0:
            return f'{minutes}хв {seconds}с'
        return f'{seconds}с'
    duration_display.short_description = 'Проведено'
    
    def action_display(self, obj):
        if obj.is_exit_page:
            return format_html('<span style="color: red;">[вийшов]</span>')
        return '→'
    action_display.short_description = 'Дія'


@admin.register(VisitorSession)
class VisitorSessionAdmin(admin.ModelAdmin):
    list_display = (
        'visitor_number', 'ip_address', 'entry_time', 
        'entry_page', 'exit_page', 'pages_count', 
        'total_time', 'device_type'
    )
    list_filter = ('device_type', 'first_seen')
    search_fields = ('ip_address', 'session_key')
    readonly_fields = (
        'session_key', 'ip_address', 'user_agent', 'referrer',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'first_seen', 'last_activity', 'device_type'
    )
    inlines = [PageViewInline]
    date_hierarchy = 'first_seen'
    list_per_page = 50
    
    def get_queryset(self, request):
        # За замовчуванням показувати тільки людей (не ботів)
        qs = super().get_queryset(request)
        if not request.GET.get('is_bot__exact'):
            # Якщо фільтр не встановлено явно, показуємо тільки не-ботів
            qs = qs.filter(is_bot=False)
        return qs
    
    def visitor_number(self, obj):
        # Умовний номер відвідувача (ID)
        return f'#{obj.id}'
    visitor_number.short_description = 'Користувач'
    visitor_number.admin_order_field = 'id'
    
    def entry_time(self, obj):
        return obj.first_seen.strftime('%d.%m %H:%M')
    entry_time.short_description = 'Вхід о'
    entry_time.admin_order_field = 'first_seen'
    
    def entry_page(self, obj):
        first_page = obj.page_views.order_by('entered_at').first()
        if first_page:
            url = first_page.url
            if len(url) > 25:
                return url[:22] + '...'
            return url
        return '-'
    entry_page.short_description = 'Вхідна сторінка'
    
    def exit_page(self, obj):
        last_page = obj.page_views.order_by('-entered_at').first()
        if last_page:
            url = last_page.url
            if len(url) > 25:
                return url[:22] + '...'
            return url
        return '-'
    exit_page.short_description = 'Вихідна сторінка'
    
    def pages_count(self, obj):
        return obj.page_views.count()
    pages_count.short_description = 'Сторінок'
    
    def total_time(self, obj):
        total = obj.page_views.aggregate(
            total=models.Sum('time_spent_seconds')
        )['total'] or 0
        minutes, seconds = divmod(total, 60)
        return f'{minutes}хв {seconds}с'
    total_time.short_description = 'Час на сайті'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


# НЕ реєструємо PageView окремо - він буде тільки як inline
