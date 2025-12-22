from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.translation import get_language
from django.core.exceptions import ValidationError
import logging
import re
from .models import TestSubmission, BlogPost, Program, AdvertisingLead
from .services import BitrixWebhookService
from .seo import get_seo_context, get_breadcrumbs, get_structured_data, structured_data_to_json

logger = logging.getLogger(__name__)


def get_blog_list_url(language):
    """Отримати URL списку блогу для конкретної мови"""
    return '/news/' if language == 'uk' else '/ru/news/'


def get_programs_list_url(language):
    """Отримати URL списку програм для конкретної мови"""
    return '/programs/' if language == 'uk' else '/ru/programs/'


def normalize_phone(phone):
    """
    Нормалізує номер телефону до формату +380XXXXXXXXX.
    Видаляє всі символи крім цифр та +, перевіряє формат +38(0XX)XXX-XX-XX.
    """
    if not phone:
        return None
    
    # Видаляємо всі символи крім цифр та +
    digits_only = re.sub(r'[^\d+]', '', phone)
    
    # Перевіряємо, що номер починається з +38
    if not digits_only.startswith('+38'):
        return None
    
    # Витягуємо цифри після +38
    phone_digits = digits_only[3:]
    
    # Перевіряємо, що після +38 рівно 10 цифр і починається з 0
    if len(phone_digits) != 10 or not phone_digits.startswith('0'):
        return None
    
    # Повертаємо нормалізований номер
    return f'+38{phone_digits}'


def validate_phone_format(phone):
    """
    Валідує формат телефону +38(0XX)XXX-XX-XX.
    Повертає (is_valid, error_message, normalized_phone).
    normalized_phone буде None якщо валідація не пройдена.
    """
    if not phone:
        return False, "Введіть номер телефону", None
    
    normalized = normalize_phone(phone)
    if not normalized:
        return False, "Номер телефону має починатися з +38(0XX)XXX-XX-XX. Введіть 10 цифр після +38, починаючи з 0", None
    
    return True, None, normalized


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


def advertising_view(request):
    """Новорічний рекламний лендінг /advertising/"""
    seo = get_seo_context(request, 'home')
    breadcrumbs = get_breadcrumbs(request, items=[
        ('Новорічна акція', request.path),
    ])
    structured_data = get_structured_data('home', breadcrumbs=breadcrumbs)

    context = {
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/advertising.html', context)


def thank_you_view(request):
    """Сторінка підтвердження після відправки форми"""
    seo = get_seo_context(request, 'thank_you')
    breadcrumbs = get_breadcrumbs(request, items=[
        ('Дякуємо', request.path),
    ])
    structured_data = get_structured_data('thank_you', breadcrumbs=breadcrumbs)

    context = {
        'seo': seo,
        'breadcrumbs': breadcrumbs,
        'structured_data': structured_data_to_json(structured_data),
    }
    return render(request, 'main/thank_you.html', context)


@require_http_methods(["POST"])
def advertising_submit_view(request):
    """Обробка відправки форми лендінгу акції"""
    try:
        name = request.POST.get('name', '').strip()
        phone = request.POST.get('phone', '').strip()
        consent = request.POST.get('consent')
        
        # Валідація імені
        if not name or len(name) < 2:
            return JsonResponse({
                'success': False,
                'message': "Введіть коректне ім'я (мінімум 2 символи)"
            }, status=400)
        
        # Валідація та нормалізація телефону
        is_valid_phone, phone_error, normalized_phone = validate_phone_format(phone)
        if not is_valid_phone:
            return JsonResponse({
                'success': False,
                'message': phone_error
            }, status=400)
        
        # Валідація згоди
        if not consent:
            return JsonResponse({
                'success': False,
                'message': "Потрібна згода на обробку персональних даних"
            }, status=400)
        
        # Збереження заявки в БД
        try:
            lead = AdvertisingLead.objects.create(
                name=name,
                phone=normalized_phone,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            logger.info(f"Advertising lead created: {lead.id} - {lead.name} - {lead.phone}")
        except ValidationError as e:
            logger.error(f"Validation error creating advertising lead: {e}")
            return JsonResponse({
                'success': False,
                'message': f"Помилка валідації: {', '.join(e.messages)}"
            }, status=400)
        except Exception as e:
            logger.error(f"Error creating advertising lead: {e}", exc_info=True)
            return JsonResponse({
                'success': False,
                'message': "Помилка при збереженні заявки. Спробуйте пізніше."
            }, status=500)
        
        # Відправка в Bitrix
        try:
            bitrix_service = BitrixWebhookService()
            bitrix_result = bitrix_service.send_lead(
                name=name,
                phone=normalized_phone,
                form_type='advertising'
            )
            
            # Оновлення статусу відправки в Bitrix
            lead.sent_to_bitrix = bitrix_result.get('success', False)
            lead.bitrix_response = bitrix_result
            lead.save()
            
            logger.info(f"Bitrix result for lead {lead.id}: {bitrix_result.get('success', False)}")
        except Exception as e:
            logger.error(f"Error sending to Bitrix for lead {lead.id}: {e}", exc_info=True)
            # Не повертаємо помилку, бо заявка вже збережена в БД
        
        return JsonResponse({
            'success': True,
            'message': "Дякуємо! Ми зв'яжемося з вами найближчим часом."
        })
        
    except Exception as e:
        logger.error(f"Advertising submission error: {e}", exc_info=True)
        return JsonResponse({
            'success': False,
            'message': "Помилка при обробці форми. Спробуйте пізніше."
        }, status=500)


@require_http_methods(["POST"])
def order_call_submit_view(request):
    """Обробка відправки модальної форми замовлення дзвінка"""
    try:
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
        
        bitrix_service = BitrixWebhookService()
        bitrix_result = bitrix_service.send_lead(
            name=name,
            phone=phone,
            form_type='order_call'
        )
        
        if bitrix_result.get('success'):
            return JsonResponse({
                'success': True,
                'message': "Дякуємо! Ми зв'яжемося з вами найближчим часом."
            })
        else:
            return JsonResponse({
                'success': False,
                'message': "Помилка при відправці форми. Спробуйте пізніше."
            }, status=500)
        
    except Exception as e:
        logger.error(f"Order call submission error: {e}", exc_info=True)
        return JsonResponse({
            'success': False,
            'message': "Помилка при обробці форми. Спробуйте пізніше."
        }, status=500)


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
        # Форматування відповідей для коментаря
        formatted_answers = []
        for i in range(1, 6):
            key = f'question_{i}'
            if key in answers:
                formatted_answers.append(f"Питання {i}: {answers[key]}")
        comments = '\n'.join(formatted_answers)
        
        bitrix_result = bitrix_service.send_lead(
            name=name,
            phone=phone,
            form_type='test',
            comments=comments,
            extra_data=answers
        )
        
        submission.sent_to_bitrix = bitrix_result['success']
        submission.bitrix_response = bitrix_result
        submission.save()
        
        return JsonResponse({
            'success': True,
            'message': "Дякуємо! Ми зв'яжемося з вами найближчим часом."
        })
        
    except Exception as e:
        logger.error(f"Test submission error: {e}", exc_info=True)
        return JsonResponse({
            'success': False,
            'message': "Помилка при обробці тесту. Спробуйте пізніше."
        }, status=500)


# Приклад HTMX view:
# 
# @require_http_methods(["POST"])
# def company_create(request):
#     form = CompanyForm(request.POST)
#     if form.is_valid():
#         company = form.save()
#         
#         # Для HTMX запитів повертаємо HTML фрагмент
#         if request.headers.get('HX-Request'):
#             html = render_to_string('companies/company_row.html', {'company': company})
#             return HttpResponse(html)
#         
#         # Для звичайних запитів — редірект
#         return redirect('company_list')
#     
#     # Якщо помилки
#     if request.headers.get('HX-Request'):
#         html = render_to_string('components/form.html', {'form': form})
#         return HttpResponse(html, status=400)
#     
#     return render(request, 'companies/create.html', {'form': form})



