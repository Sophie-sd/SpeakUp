"""
Django settings імпорт на основі DJANGO_SETTINGS_MODULE
"""
import os

# Отримання модуля налаштувань з environment
settings_module = os.environ.get('DJANGO_SETTINGS_MODULE', 'speakup.settings.development')

# Імпорт правильного модуля
if 'development' in settings_module:
    from .development import *
elif 'production' in settings_module:
    from .production import *
elif 'test' in settings_module:
    from .test import *
else:
    # Fallback на base settings
    from .base import *







