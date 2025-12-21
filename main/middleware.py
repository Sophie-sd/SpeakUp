from django.shortcuts import redirect
from django.utils.translation import get_language


class LegacyUrlRedirectMiddleware:
    """301 редіректи для сторінок які не переносяться"""
    
    # Мапа старих URL на нові (без мовних префіксів)
    REDIRECTS = {
        # Форми навчання → головна
        '/individualni-uroki/': '/',
        '/grupovi-zanyattya/': '/',
        '/online-zanyattya/': '/',
        '/korporatyvnyj/': '/',
        '/intensyvnyj-kurs/': '/',
        '/z-nosiyamy/': '/',
        
        # Спецпропозиції → головна
        '/specpropozyciyi/': '/',
        '/superintensyv/': '/',
        
        # Міста → контакти (якщо є окремі сторінки)
        '/kyiv/': '/contacts/',
        '/kharkiv/': '/contacts/',
        '/dnipro/': '/contacts/',
        '/odesa/': '/contacts/',
        '/lviv/': '/contacts/',
        '/kryvyj-rih/': '/contacts/',
        
        # Student Zone → головна (або інша цільова сторінка)
        '/student-zone/': '/',
    }
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        path = request.path
        language = get_language()
        
        # Прибрати мовний префікс для перевірки
        clean_path = path.replace(f'/{language}/', '/') if language == 'ru' else path
        
        # Перевірити чи потрібен редірект
        if clean_path in self.REDIRECTS:
            target = self.REDIRECTS[clean_path]
            # Додати мовний префікс якщо потрібно
            if language == 'ru':
                target = f'/ru{target}'
            return redirect(target, permanent=True)  # 301 редірект
        
        return self.get_response(request)






