from django.contrib import admin
from django.db import models
from .models import VisitorSession, PageView


class PageViewInline(admin.TabularInline):
    model = PageView
    extra = 0
    max_num = 20
    readonly_fields = (
        'url', 'page_title', 'entered_at', 'time_spent_seconds',
        'is_exit_page', 'source'
    )
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(VisitorSession)
class VisitorSessionAdmin(admin.ModelAdmin):
    list_display = (
        'ip_address', 'first_seen', 'last_activity',
        'pages_count', 'total_time', 'is_bot', 'device_type'
    )
    list_filter = ('is_bot', 'device_type', 'first_seen')
    search_fields = ('ip_address', 'session_key', 'referrer')
    readonly_fields = (
        'session_key', 'ip_address', 'user_agent', 'referrer',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'first_seen', 'last_activity', 'is_bot', 'device_type'
    )
    inlines = [PageViewInline]
    date_hierarchy = 'first_seen'
    list_per_page = 50
    
    def pages_count(self, obj):
        return obj.page_views.count()
    pages_count.short_description = 'Сторінок'
    
    def total_time(self, obj):
        total = obj.page_views.aggregate(
            total=models.Sum('time_spent_seconds')
        )['total'] or 0
        minutes, seconds = divmod(total, 60)
        return f'{minutes}хв {seconds}с'
    total_time.short_description = 'Загальний час'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = (
        'session_ip', 'url', 'time_spent_seconds',
        'entered_at', 'is_exit_page', 'source'
    )
    list_filter = ('source', 'is_exit_page', 'entered_at')
    search_fields = ('url', 'page_title', 'session__ip_address')
    list_per_page = 50
    date_hierarchy = 'entered_at'
    
    def get_readonly_fields(self, request, obj=None):
        # Повертаємо всі поля як readonly
        return [field.name for field in self.model._meta.fields]
    
    def session_ip(self, obj):
        return obj.session.ip_address
    session_ip.short_description = 'IP'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
