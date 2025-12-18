from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.translation import get_language
from .models import TestSubmission, BlogPost, Program
from .services import BitrixWebhookService
from .seo import get_seo_context, get_breadcrumbs, get_structured_data, structured_data_to_json


def get_blog_list_url(language):
    """Отримати URL списку блогу для конкретної мови"""
    return '/news/' if language == 'uk' else '/ru/news/'


def get_programs_list_url(language):
    """Отримати URL списку програм для конкретної мови"""
    return '/programs/' if language == 'uk' else '/ru/programs/'


@ensure_csrf_cookie
def home_view(request):
    """Головна сторінка"""
    seo = get_seo_context(request, 'home')
    breadcrumbs = get_breadcrumbs(request)
    structured_data = get_structured_data('home', breadcrumbs=breadcrumbs)
    
    context = {
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/home.html', context)


def robots_txt_view(request):
    """Генерація robots.txt - адаптовано з існуючого сайту"""
    lines = [
        "User-agent: *",
        "Disallow: /admin/",
        "Allow: /admin/login/",
        "Disallow: /api/test/",
        "Disallow: /media/private/",
        "Disallow: /__pycache__/",
        "Disallow: /trackback/",
        "Disallow: /search/",
        "Disallow: */trackback/",
        "Disallow: */*/trackback/",
        "Disallow: */*/feed/",
        "Disallow: */feed/",
        "Disallow: /*?*",
        "Disallow: /page/",
        "Disallow: /author/",
        "Allow: /media/public/",
        "Allow: /static/",
        "Allow: /news/",
        "Allow: /programs/",
        "Sitemap: https://speak-up.com.ua/sitemap.xml",
        "Clean-param: utm_source&utm_medium&utm_campaign&utm_term&utm_content",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


def blog_list_view(request):
    """Список статей блогу"""
    language = get_language()
    blog_posts = BlogPost.objects.filter(is_published=True).order_by('-published_at')
    
    seo = get_seo_context(request, 'blog')
    breadcrumbs = get_breadcrumbs(request)
    structured_data = get_structured_data('blog', breadcrumbs=breadcrumbs)
    
    context = {
        'blog_posts': blog_posts,
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/blog_list.html', context)


def blog_detail_view(request, slug):
    """Детальна сторінка статті блогу"""
    language = get_language()
    
    # Отримати статтю за slug для поточної мови
    if language == 'uk':
        blog_post = get_object_or_404(BlogPost, slug_uk=slug, is_published=True)
    else:
        blog_post = get_object_or_404(BlogPost, slug_ru=slug, is_published=True)
    
    # SEO контекст
    seo = get_seo_context(request, 'blog_detail', obj=blog_post)
    
    # Breadcrumbs
    breadcrumbs = get_breadcrumbs(request, items=[
        ('Блог', '/news/'),
        (blog_post.get_title(language), request.path),
    ])
    
    # Структуровані дані
    structured_data = get_structured_data('blog_detail', obj=blog_post, breadcrumbs=breadcrumbs)
    
    context = {
        'blog_post': blog_post,
        'language': language,
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/blog_detail.html', context)


def programs_list_view(request):
    """Список програм"""
    language = get_language()
    programs = Program.objects.filter(is_active=True).order_by('order')
    
    seo = get_seo_context(request, 'programs')
    breadcrumbs = get_breadcrumbs(request)
    structured_data = get_structured_data('programs', breadcrumbs=breadcrumbs)
    
    context = {
        'programs': programs,
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/programs_list.html', context)


def program_detail_view(request, slug):
    """Детальна сторінка програми"""
    language = get_language()
    program = get_object_or_404(Program, slug=slug, is_active=True)
    
    # SEO контекст
    seo = get_seo_context(request, 'program_detail', obj=program)
    
    # Breadcrumbs
    breadcrumbs = get_breadcrumbs(request, items=[
        ('Програми', request.build_absolute_uri(get_programs_list_url(language))),
        (program.get_title(language), request.path),
    ])
    
    # Структуровані дані
    structured_data = get_structured_data('program_detail', obj=program, breadcrumbs=breadcrumbs)
    
    context = {
        'program': program,
        'language': language,
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/program_detail.html', context)


def about_view(request):
    """Сторінка про школу"""
    seo = get_seo_context(request, 'about')
    breadcrumbs = get_breadcrumbs(request, items=[
        ('Про нас', request.path),
    ])
    structured_data = get_structured_data('about', breadcrumbs=breadcrumbs)
    
    context = {
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/about.html', context)


def feedback_view(request):
    """Сторінка з відгуками"""
    seo = get_seo_context(request, 'feedback')
    breadcrumbs = get_breadcrumbs(request, items=[
        ('Відгуки', request.path),
    ])
    structured_data = get_structured_data('feedback', breadcrumbs=breadcrumbs)
    
    context = {
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/feedback.html', context)


def contacts_view(request):
    """Сторінка контактів"""
    seo = get_seo_context(request, 'contacts')
    breadcrumbs = get_breadcrumbs(request, items=[
        ('Контакти', request.path),
    ])
    structured_data = get_structured_data('contacts', breadcrumbs=breadcrumbs)
    
    context = {
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/contacts.html', context)


def job_view(request):
    """Сторінка вакансій"""
    seo = get_seo_context(request, 'job')
    breadcrumbs = get_breadcrumbs(request, items=[
        ('Вакансії', request.path),
    ])
    structured_data = get_structured_data('job', breadcrumbs=breadcrumbs)
    
    context = {
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/job.html', context)


@require_http_methods(["POST"])
def test_submit_view(request):
    """Обробка відправки тесту"""
    try:
        # Валідація полів
        name = request.POST.get('name', '').strip()
        phone = request.POST.get('phone', '').strip()
        
        if not name or len(name) < 2:
            return JsonResponse({
                'success': False,
                'message': "Введіть коректне ім'я (мінімум 2 символи)"
            }, status=400)
        
        if not phone or len(phone.replace(' ', '').replace('-', '').replace('+', '')) < 10:
            return JsonResponse({
                'success': False,
                'message': "Введіть коректний номер телефону (мінімум 10 цифр)"
            }, status=400)
        
        # Отримання відповідей (всі radio)
        answers = {}
        for i in range(1, 6):
            answer = request.POST.get(f'question_{i}')
            if not answer:
                return JsonResponse({
                    'success': False,
                    'message': f"Будь ласка, дайте відповідь на питання {i}"
                }, status=400)
            answers[f'question_{i}'] = answer
        
        # Збереження в БД
        submission = TestSubmission.objects.create(
            name=name,
            phone=phone,
            question_1=answers['question_1'],
            question_2=answers['question_2'],
            question_3=answers['question_3'],
            question_4=answers['question_4'],
            question_5=answers['question_5'],
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Відправка в Bitrix
        bitrix_service = BitrixWebhookService()
        bitrix_result = bitrix_service.send_test_submission({
            'name': name,
            'phone': phone,
            **answers
        })
        
        submission.sent_to_bitrix = bitrix_result['success']
        submission.bitrix_response = bitrix_result
        submission.save()
        
        return JsonResponse({
            'success': True,
            'message': "Дякуємо! Ми зв'яжемося з вами найближчим часом."
        })
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Test submission error: {e}")
        return JsonResponse({
            'success': False,
            'message': "Помилка при обробці тесту. Спробуйте пізніше."
        }, status=500)




