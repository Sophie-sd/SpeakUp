"""
SEO утиліти для генерації мета-тегів та структурованих даних
"""
import json
from django.utils.translation import get_language
from django.urls import reverse


# Verification коди (КРИТИЧНІ - ЗБЕРЕГТИ З ІСНУЮЧОГО САЙТУ)
SEO_VERIFICATION = {
    'google_site_verification': 'QXPW5ZdEtJluRf6Jv_Le7g05RN_5ZvnXDIC3rLA2M2s',
    'facebook_domain_verification': 'cykv54tlwphzawmh1yi4h75ehrufxc',
}

# SEO дані для статичних сторінок
SEO_DATA = {
    'home': {
        'uk': {
            'title': 'Курси англійської мови в Києві у школі SPEAK UP',
            'description': "Курси англійської мови від школи Speak Up. Навчання англійській ✓для дорослих і дітей ✓індівідуально та у міні групах ☎ +38 (093)170 78 67",
            'og_type': 'website',
            'og_title': 'SPEAK UP',
            'og_description': "Курси англійської мови від школи Speak Up. Навчання англійській для дорослих і дітей.",
        },
        'ru': {
            'title': 'Курсы английского языка в Киеве в школе SPEAK UP',
            'description': "Курсы английского языка от школы Speak Up. Обучение английскому ✓для взрослых и детей ✓индивидуально и в мини-группах ☎ +38 (093)170 78 67",
            'og_type': 'website',
            'og_title': 'SPEAK UP',
            'og_description': "Курсы английского языка от школы Speak Up. Обучение английскому для взрослых и детей.",
        }
    },
    'about': {
        'uk': {
            'title': 'Про школу SPEAK UP - історія та методика',
            'description': "Дізнайтесь про школу SPEAK UP: історія, методика, викладачі та гарантії якості навчання англійської мови.",
            'og_type': 'website',
        },
        'ru': {
            'title': 'О школе SPEAK UP - история и методика',
            'description': "Узнайте о школе SPEAK UP: история, методика, преподаватели и гарантии качества обучения английскому языку.",
            'og_type': 'website',
        }
    },
    'feedback': {
        'uk': {
            'title': 'Відгуки та рекомендації наших клієнтів | SPEAK UP',
            'description': "Прочитайте відгуки учнів школи SPEAK UP про ефективність навчання англійської мови та якість послуг.",
            'og_type': 'website',
        },
        'ru': {
            'title': 'Отзывы и рекомендации наших клиентов | SPEAK UP',
            'description': "Прочитайте отзывы учеников школы SPEAK UP об эффективности обучения английскому языку и качестве услуг.",
            'og_type': 'website',
        }
    },
    'contacts': {
        'uk': {
            'title': 'Контакти | SPEAK UP - Школа англійської мови',
            'description': "Контактна інформація школи SPEAK UP: адреси, номери телефонів, графік роботи. Зв'яжіться з нами!",
            'og_type': 'website',
        },
        'ru': {
            'title': 'Контакты | SPEAK UP - Школа английского языка',
            'description': "Контактная информация школы SPEAK UP: адреса, номера телефонов, график работы. Свяжитесь с нами!",
            'og_type': 'website',
        }
    },
    'blog': {
        'uk': {
            'title': 'Блог | SPEAK UP - Поради з вивчення англійської мови',
            'description': 'Статті та поради про вивчення англійської мови від експертів школи SPEAK UP',
            'og_type': 'website',
            'og_title': 'Блог SPEAK UP',
        },
        'ru': {
            'title': 'Блог | SPEAK UP - Советы по изучению английского языка',
            'description': 'Статьи и советы об изучении английского языка от экспертов школы SPEAK UP',
            'og_type': 'website',
            'og_title': 'Блог SPEAK UP',
        }
    },
    'programs': {
        'uk': {
            'title': 'Програми навчання | SPEAK UP - Курси англійської мови',
            'description': 'Оберіть програму навчання англійської мови в школі SPEAK UP: для бізнесу, IT, медицини, подорожей',
            'og_type': 'website',
            'og_title': 'Програми SPEAK UP',
        },
        'ru': {
            'title': 'Программы обучения | SPEAK UP - Курсы английского языка',
            'description': 'Выберите программу обучения английскому языку в школе SPEAK UP: для бизнеса, IT, медицины, путешествий',
            'og_type': 'website',
            'og_title': 'Программы SPEAK UP',
        }
    },
    'job': {
        'uk': {
            'title': 'Вакансії | SPEAK UP - Робота в школі англійської мови',
            'description': 'Приєднуйтесь до команди SPEAK UP! Відкриті вакансії викладачів та співробітників',
            'og_type': 'website',
        },
        'ru': {
            'title': 'Вакансии | SPEAK UP - Работа в школе английского языка',
            'description': 'Присоединяйтесь к команде SPEAK UP! Открытые вакансии преподавателей и сотрудников',
            'og_type': 'website',
        }
    },
    'thank_you': {
        'uk': {
            'title': 'Дякуємо! | SPEAK UP',
            'description': 'Ваша заявка успішно відправлена. Ми зв\'яжемося з вами найближчим часом.',
            'og_type': 'website',
        },
        'ru': {
            'title': 'Спасибо! | SPEAK UP',
            'description': 'Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.',
            'og_type': 'website',
        }
    }
}


def get_seo_context(request, page_type, obj=None):
    """
    Генерація SEO контексту для сторінки
    
    Args:
        request: Django request object
        page_type: тип сторінки ('home', 'blog_detail', 'program_detail' тощо)
        obj: об'єкт моделі (BlogPost, Program тощо)
    
    Returns:
        dict з SEO даними
    """
    language = get_language()
    current_url = request.build_absolute_uri()
    
    # Базові дані
    context = {
        'verification': SEO_VERIFICATION,
        'canonical_url': current_url,
        'og_url': current_url,
        'og_site_name': 'SPEAK UP',
        'twitter_card': 'summary',
    }
    
    # Спеціальні дані для типів сторінок
    if page_type in SEO_DATA and language in SEO_DATA[page_type]:
        context.update(SEO_DATA[page_type][language])
    
    # Додаткові обробки для динамічних сторінок
    if page_type == 'blog_detail' and obj:
        title = obj.get_title(language)
        description = obj.get_meta_description(language)
        og_description = obj.get_og_description(language) or description
        
        context.update({
            'title': f"{title} | SPEAK UP",
            'description': description,
            'og_type': 'article',
            'og_title': obj.get_og_title(language) or title,
            'og_description': og_description,
            'og_image': request.build_absolute_uri(obj.og_image.url) if obj.og_image else None,
            'twitter_title': title,
            'twitter_description': description,
            'article_published_time': obj.published_at.isoformat() if obj.published_at else None,
            'article_modified_time': obj.updated_at.isoformat(),
        })
    
    elif page_type == 'program_detail' and obj:
        title = obj.get_meta_title(language)
        description = obj.get_meta_description(language)
        og_description = obj.get_og_description(language) or description
        
        context.update({
            'title': title,
            'description': description,
            'og_type': 'article',
            'og_title': obj.get_og_title(language) or obj.get_title(language),
            'og_description': og_description,
            'og_image': request.build_absolute_uri(obj.og_image.url) if obj.og_image else None,
            'twitter_title': title,
            'twitter_description': description,
        })
    
    # Додати twitter теги якщо їх немає
    if 'twitter_title' not in context:
        context['twitter_title'] = context.get('title', '')
    if 'twitter_description' not in context:
        context['twitter_description'] = context.get('description', '')
    if 'twitter_image' not in context:
        context['twitter_image'] = context.get('og_image')
    
    return context


def get_breadcrumbs(request, items=None):
    """
    Генерація breadcrumbs для структурованих даних
    
    Args:
        request: Django request object
        items: список додаткових елементів [(name, url), ...]
    
    Returns:
        list breadcrumb елементів для шаблону
    """
    language = get_language()
    base_url = "https://speak-up.com.ua"
    
    breadcrumbs = [
        {
            'name': 'Speak UP',
            'url': base_url if language == 'uk' else f"{base_url}/ru/",
            'position': 1,
        }
    ]
    
    if items:
        for i, (name, url) in enumerate(items, start=2):
            breadcrumbs.append({
                'name': name,
                'url': url,
                'position': i,
            })
    
    return breadcrumbs


def get_structured_data(page_type, obj=None, breadcrumbs=None):
    """
    Генерація JSON-LD структурованих даних
    
    Args:
        page_type: тип сторінки
        obj: об'єкт моделі
        breadcrumbs: breadcrumb елементи
    
    Returns:
        list JSON-LD об'єктів
    """
    structured_data = []
    
    # Organization (на всіх сторінках)
    structured_data.append({
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "SPEAK UP",
        "url": "https://speak-up.com.ua",
        "logo": "https://speak-up.com.ua/static/images/logo.png",
        "description": "Міжнародна школа англійської мови",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "UA",
            "addressLocality": "Київ"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+38-093-170-78-67",
            "contactType": "customer service"
        }
    })
    
    # BreadcrumbList
    if breadcrumbs:
        structured_data.append({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": item['position'],
                    "name": item['name'],
                    "item": item['url']
                }
                for item in breadcrumbs
            ]
        })
    
    # Article (для блогу)
    if page_type == 'blog_detail' and obj:
        language = get_language()
        structured_data.append({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": obj.get_title(language),
            "author": {
                "@type": "Organization",
                "name": "SPEAK UP"
            },
            "datePublished": obj.published_at.isoformat() if obj.published_at else None,
            "dateModified": obj.updated_at.isoformat(),
            "image": f"https://speak-up.com.ua{obj.og_image.url}" if obj.og_image else None,
            "publisher": {
                "@type": "Organization",
                "name": "SPEAK UP",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://speak-up.com.ua/static/images/logo.png"
                }
            }
        })
    
    # Course (для програм)
    if page_type == 'program_detail' and obj:
        language = get_language()
        structured_data.append({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": obj.get_title(language),
            "description": obj.get_description(language),
            "provider": {
                "@type": "EducationalOrganization",
                "name": "SPEAK UP",
                "url": "https://speak-up.com.ua"
            },
            "courseCode": obj.slug
        })
    
    return structured_data


def structured_data_to_json(structured_data_list):
    """
    Конвертує список структурованих даних в JSON для шаблону
    """
    return [json.dumps(data, ensure_ascii=False) for data in structured_data_list]










