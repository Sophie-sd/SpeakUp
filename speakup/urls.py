from django.contrib import admin
from django.conf.urls.i18n import i18n_patterns
from django.contrib.sitemaps.views import sitemap
from django.urls import path, include
from main.sitemaps import StaticViewSitemap, BlogSitemap, ProgramSitemap

sitemaps = {
    'static': StaticViewSitemap,
    'blog': BlogSitemap,
    'programs': ProgramSitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
]

urlpatterns += i18n_patterns(
    path('', include('main.urls')),
    prefix_default_language=False,
)




