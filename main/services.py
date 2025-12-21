import requests
import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


class BitrixWebhookService:
    """Сервіс для інтеграції з Bitrix24 через webhook"""
    
    def __init__(self):
        self.webhook_url = settings.BITRIX_WEBHOOK_URL
    
    def send_lead(self, name, phone, form_type='general', title=None, 
                  source_description=None, comments='', extra_data=None):
        """
        Універсальний метод для відправки ліда в Bitrix24
        
        Args:
            name: Ім'я клієнта
            phone: Телефон
            form_type: Тип форми ('test', 'advertising', 'order_call', 'general')
            title: Заголовок ліда (якщо None, генерується автоматично)
            source_description: Опис джерела
            comments: Додаткові коментарі
            extra_data: Додаткові дані (dict)
        
        Returns:
            dict: {'success': bool, 'lead_id': int|None, 'error': str|None, 'method': str}
        """
        if not self.webhook_url:
            logger.warning("Bitrix webhook URL not configured, falling back to email")
            return self._send_email_fallback_lead(name, phone, form_type, comments)
        
        # Генерація заголовка якщо не вказано
        if not title:
            title_map = {
                'test': f"Тест: {name}",
                'advertising': f"Акція: {name}",
                'order_call': f"Замовлення дзвінка: {name}",
                'general': f"Заявка з сайту: {name}"
            }
            title = title_map.get(form_type, f"Заявка: {name}")
        
        # Генерація опису джерела якщо не вказано
        if not source_description:
            source_map = {
                'test': 'Тест на сайті',
                'advertising': 'Новорічна акція',
                'order_call': 'Замовлення дзвінка з сайту',
                'general': 'Заявка з сайту'
            }
            source_description = source_map.get(form_type, 'Заявка з сайту')
        
        # Формування коментарів
        if not comments:
            comments_map = {
                'test': 'Результат проходження тесту',
                'advertising': 'Заявка з лендінгу акції',
                'order_call': 'Клієнт запросив зворотний дзвінок',
                'general': 'Заявка з форми сайту'
            }
            comments = comments_map.get(form_type, 'Заявка з сайту')
        
        # Додавання додаткових даних до коментарів
        if extra_data:
            extra_lines = []
            for key, value in extra_data.items():
                extra_lines.append(f"{key}: {value}")
            if extra_lines:
                comments += "\n\n" + "\n".join(extra_lines)
        
        try:
            bitrix_payload = {
                'fields': {
                    'TITLE': title,
                    'NAME': name,
                    'PHONE': [{'VALUE': phone, 'VALUE_TYPE': 'WORK'}],
                    'SOURCE_ID': 'WEB',
                    'SOURCE_DESCRIPTION': source_description,
                    'COMMENTS': comments
                }
            }
            
            response = requests.post(
                f"{self.webhook_url}crm.lead.add.json",
                json=bitrix_payload,
                timeout=10
            )
            
            response.raise_for_status()
            result = response.json()
            
            if result.get('result'):
                logger.info(f"Lead created in Bitrix: ID {result['result']} (type: {form_type})")
                return {'success': True, 'lead_id': result['result'], 'method': 'bitrix'}
            else:
                logger.error(f"Bitrix API error: {result}")
                return self._send_email_fallback_lead(name, phone, form_type, comments)
                
        except requests.RequestException as e:
            logger.error(f"Bitrix webhook error: {e}")
            return self._send_email_fallback_lead(name, phone, form_type, comments)
    
    def _send_email_fallback_lead(self, name, phone, form_type, comments):
        """Fallback: відправка ліда на email якщо Bitrix недоступний"""
        try:
            form_type_names = {
                'test': 'Тест',
                'advertising': 'Акція',
                'order_call': 'Замовлення дзвінка',
                'general': 'Заявка'
            }
            form_name = form_type_names.get(form_type, 'Заявка')
            
            subject = f"[SpeakUp] Нова {form_name.lower()} - {name}"
            message = f"""
Нова {form_name.lower()} на сайті SpeakUp

=== КОНТАКТНІ ДАНІ ===
Ім'я: {name}
Телефон: {phone}
Тип форми: {form_name}

=== КОМЕНТАРІ ===
{comments}

---
Bitrix CRM був недоступний, тому заявка надіслана на email.
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=False,
            )
            
            logger.info(f"Email fallback sent successfully for {name} (type: {form_type})")
            return {'success': True, 'method': 'email'}
            
        except Exception as email_error:
            logger.error(f"Email fallback failed: {email_error}")
            return {'success': False, 'error': str(email_error), 'method': 'email'}
    
    def send_test_submission(self, submission_data):
        """Відправка результатів тесту в Bitrix CRM як лід (зворотна сумісність)"""
        formatted_answers = self._format_answers(submission_data)
        return self.send_lead(
            name=submission_data['name'],
            phone=submission_data['phone'],
            form_type='test',
            comments=formatted_answers,
            extra_data={f'question_{i}': submission_data.get(f'question_{i}', '') 
                       for i in range(1, 6) if f'question_{i}' in submission_data}
        )
    
    
    def _format_answers(self, data):
        """Форматування відповідей для коментаря в Bitrix/Email"""
        answers = []
        for i in range(1, 6):
            key = f'question_{i}'
            if key in data:
                answers.append(f"Питання {i}: {data[key]}")
        return '\n'.join(answers)







