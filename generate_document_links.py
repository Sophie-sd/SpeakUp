#!/usr/bin/env python
"""
Скрипт для генерації посилань на документи з папки DogovoraURL.
"""
import os
import sys
import django

# Налаштування Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SpeakUp.settings.develop')
django.setup()

from django.urls import reverse

# Базовий URL для production
base_url = 'https://speakup.com.ua'

# Список документів з іменами URL-ів
documents = [
    ('document_dostup_spik_ap', 'Договір доступу до кабінету - Спік Ап'),
    ('document_dostup_stadi_grup', 'Договір доступу до кабінету - Стаді Сістемс Груп'),
    ('document_dostup_stadi_kiiv', 'Договір доступу до кабінету - Стаді Сістемс Київ'),
    ('document_dostup_stadi_odesa', 'Договір доступу до кабінету - Стаді Сістемс Одеса'),
    ('document_dostup_stadi_ukraina', 'Договір доступу до кабінету - Стаді Сістемс Україна'),
    ('document_dostup_stadi_tsentr', 'Договір доступу до кабінету - Стаді Сістемс Центр'),
    ('document_poslugy_spik_ap', 'Договір послуг - Спік Ап'),
    ('document_poslugy_stadi_grup', 'Договір послуг - Стаді Сістемс Груп'),
    ('document_poslugy_stadi_kiiv', 'Договір послуг - Стаді Сістемс Київ'),
    ('document_poslugy_stadi_odesa', 'Договір послуг - Стаді Сістемс Одеса'),
    ('document_poslugy_stadi_ukraina', 'Договір послуг - Стаді Сістемс Україна'),
    ('document_poslugy_stadi_tsentr', 'Договір послуг - Стаді Сістемс Центр'),
]

print('\n' + '='*80)
print('ПОСИЛАННЯ НА ДОГОВОРИ (12 шт.)')
print('='*80 + '\n')

for i, (url_name, name) in enumerate(documents, 1):
    try:
        url = reverse(f'core:{url_name}')
        full_url = f'{base_url}{url}'
        print(f'{i:2}. {name}')
        print(f'    {full_url}\n')
    except Exception as e:
        print(f'{i:2}. {name} - ПОМИЛКА: {e}\n')

print('='*80)
print(f'Всього посилань: {len(documents)}')
print('='*80 + '\n')
