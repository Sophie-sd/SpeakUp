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
base_url = 'https://speak-up.com.ua'

# Список документів з іменами URL-ів
documents = [
    ('document_dostup_speak_up', 'Договір доступу до кабінету - Speak Up'),
    ('document_dostup_study_systems_grup', 'Договір доступу до кабінету - Study Systems Груп'),
    ('document_dostup_study_systems_kyiv', 'Договір доступу до кабінету - Study Systems Київ'),
    ('document_dostup_study_systems_odesa', 'Договір доступу до кабінету - Study Systems Одеса'),
    ('document_dostup_study_systems_ukraina', 'Договір доступу до кабінету - Study Systems Україна'),
    ('document_dostup_study_systems_tsentr', 'Договір доступу до кабінету - Study Systems Центр'),
    ('document_poslugy_speak_up', 'Договір послуг - Speak Up'),
    ('document_poslugy_study_systems_grup', 'Договір послуг - Study Systems Груп'),
    ('document_poslugy_study_systems_kyiv', 'Договір послуг - Study Systems Київ'),
    ('document_poslugy_study_systems_odesa', 'Договір послуг - Study Systems Одеса'),
    ('document_poslugy_study_systems_ukraina', 'Договір послуг - Study Systems Україна'),
    ('document_poslugy_study_systems_tsentr', 'Договір послуг - Study Systems Центр'),
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
