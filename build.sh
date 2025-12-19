#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -o nounset

pip install -r requirements.txt

python manage.py migrate --noinput --settings=speakup.settings.production
python manage.py collectstatic --noinput --settings=speakup.settings.production


