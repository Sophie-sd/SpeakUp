from django.contrib import admin
from .models import TestSubmission, BlogPost, Program, AdvertisingLead


@admin.register(TestSubmission)
class TestSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'created_at', 'sent_to_bitrix']
    list_filter = ['sent_to_bitrix', 'created_at']
    search_fields = ['name', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent', 'bitrix_response']
    
    fieldsets = (
        ('Контактні дані', {
            'fields': ('name', 'phone')
        }),
        ('Відповіді', {
            'fields': ('question_1', 'question_2', 'question_3', 'question_4', 'question_5')
        }),
        ('Інтеграція з Bitrix', {
            'fields': ('sent_to_bitrix', 'bitrix_response')
        }),
        ('Мета-дані', {
            'fields': ('ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(AdvertisingLead)
class AdvertisingLeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'created_at', 'sent_to_bitrix']
    list_filter = ['sent_to_bitrix', 'created_at']
    search_fields = ['name', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent', 'bitrix_response']
    
    fieldsets = (
        ('Контактні дані', {
            'fields': ('name', 'phone')
        }),
        ('Інтеграція з Bitrix', {
            'fields': ('sent_to_bitrix', 'bitrix_response')
        }),
        ('Мета-дані', {
            'fields': ('ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title_uk', 'slug_uk', 'is_published', 'published_at', 'created_at']
    list_filter = ['is_published', 'published_at', 'created_at']
    search_fields = ['title_uk', 'title_ru', 'slug_uk', 'slug_ru']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основне (Українська)', {
            'fields': ('title_uk', 'slug_uk', 'content_uk', 'meta_description_uk', 'og_title_uk', 'og_description_uk')
        }),
        ('Основне (Російська)', {
            'fields': ('title_ru', 'slug_ru', 'content_ru', 'meta_description_ru', 'og_title_ru', 'og_description_ru')
        }),
        ('Зображення та автор', {
            'fields': ('og_image', 'featured_image', 'author')
        }),
        ('Публікація', {
            'fields': ('is_published', 'published_at')
        }),
        ('Мета-дані', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['title_uk', 'slug', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title_uk', 'title_ru', 'slug']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['order', 'title_uk']
    
    fieldsets = (
        ('Основне (Українська)', {
            'fields': ('title_uk', 'description_uk', 'content_uk', 'meta_title_uk', 'meta_description_uk', 'og_title_uk', 'og_description_uk')
        }),
        ('Основне (Російська)', {
            'fields': ('title_ru', 'description_ru', 'content_ru', 'meta_title_ru', 'meta_description_ru', 'og_title_ru', 'og_description_ru')
        }),
        ('URL та активність', {
            'fields': ('slug', 'is_active', 'order')
        }),
        ('Зображення', {
            'fields': ('og_image', 'icon')
        }),
        ('Мета-дані', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )







