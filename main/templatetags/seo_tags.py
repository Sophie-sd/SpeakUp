from django import template
from django.utils.translation import get_language

register = template.Library()


@register.simple_tag(takes_context=True)
def get_alternate_lang_url(context, lang_code):
    """Отримати URL для альтернативної мови"""
    request = context['request']
    current_path = request.path
    current_lang = get_language()
    
    if current_lang == 'uk' and lang_code == 'ru':
        return f"/ru{current_path}"
    elif current_lang == 'ru' and lang_code == 'uk':
        return current_path.replace('/ru/', '/', 1)
    else:
        return current_path









