"""
Sitemap конфігурація для Django sitemap framework
"""
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import BlogPost, Program


class StaticViewSitemap(Sitemap):
    """Статичні сторінки"""
    priority = 1.0
    changefreq = 'weekly'
    
    def items(self):
        return [
            'main:home',
            'main:about',
            'main:feedback',
            'main:contacts',
        ]
    
    def location(self, item):
        return reverse(item)


class BlogSitemap(Sitemap):
    """Статті блогу"""
    changefreq = 'weekly'
    priority = 0.8
    
    def items(self):
        return BlogPost.objects.filter(is_published=True).order_by('-published_at')
    
    def lastmod(self, obj):
        return obj.updated_at
    
    def location(self, obj):
        # Повертає URL для української версії
        return reverse('main:blog_detail', kwargs={'slug': obj.slug_uk})


class ProgramSitemap(Sitemap):
    """Програми навчання"""
    changefreq = 'monthly'
    priority = 0.9
    
    def items(self):
        return Program.objects.filter(is_active=True).order_by('order')
    
    def lastmod(self, obj):
        return obj.updated_at
    
    def location(self, obj):
        return reverse('main:program_detail', kwargs={'slug': obj.slug})











