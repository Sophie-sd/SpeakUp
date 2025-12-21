#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -o nounset

pip install -r requirements.txt

python manage.py migrate --noinput --settings=speakup.settings.production
python manage.py collectstatic --noinput --settings=speakup.settings.production

# Створення суперюзера, якщо він не існує
if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
    python manage.py shell --settings=speakup.settings.production << 'PYTHON_SCRIPT'
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@speakup.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if username and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"✅ Суперюзер {username} успішно створено")
    else:
        print(f"ℹ️  Суперюзер {username} вже існує")
PYTHON_SCRIPT
fi



