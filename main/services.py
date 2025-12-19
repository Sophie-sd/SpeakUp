import requests
import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


class BitrixWebhookService:
    """Сервіс для інтеграції з Bitrix24 через webhook"""
    
    def __init__(self):
        self.webhook_url = settings.BITRIX_WEBHOOK_URL
    
    def send_test_submission(self, submission_data):
        """Відправка результатів тесту в Bitrix CRM як лід"""
        
        # Перевірка наявності webhook URL
        if not self.webhook_url:
            logger.warning("Bitrix webhook URL not configured, falling back to email")
            return self._send_email_fallback(submission_data)
        
        try:
            # Формування даних для Bitrix
            bitrix_payload = {
                'fields': {
                    'TITLE': f"Тест: {submission_data['name']}",
                    'NAME': submission_data['name'],
                    'PHONE': [{'VALUE': submission_data['phone'], 'VALUE_TYPE': 'WORK'}],
                    'SOURCE_ID': 'WEB',
                    'SOURCE_DESCRIPTION': 'Тест на сайті',
                    'COMMENTS': self._format_answers(submission_data)
                }
            }
            
            # Відправка запиту
            response = requests.post(
                f"{self.webhook_url}crm.lead.add.json",
                json=bitrix_payload,
                timeout=10
            )
            
            response.raise_for_status()
            result = response.json()
            
            if result.get('result'):
                logger.info(f"Lead created in Bitrix: ID {result['result']}")
                return {'success': True, 'lead_id': result['result']}
            else:
                logger.error(f"Bitrix API error: {result}")
                # Fallback на email при помилці API
                self._send_email_fallback(submission_data)
                return {'success': False, 'error': result}
                
        except requests.RequestException as e:
            logger.error(f"Bitrix webhook error: {e}")
            # Fallback на email при помилці з'єднання
            return self._send_email_fallback(submission_data)
    
    def _send_email_fallback(self, submission_data):
        """Fallback: відправка результатів на email якщо Bitrix недоступний"""
        try:
            subject = f"[SpeakUp] Новий результат тесту - {submission_data['name']}"
            message = f"""
Новий результат тесту на сайті SpeakUp

=== КОНТАКТНІ ДАНІ ===
Ім'я: {submission_data['name']}
Телефон: {submission_data['phone']}

=== ВІДПОВІДІ ===
{self._format_answers(submission_data)}

---
Bitrix CRM був недоступний, тому результат надіслано на email.
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=False,
            )
            
            logger.info(f"Email fallback sent successfully for {submission_data['name']}")
            return {'success': True, 'method': 'email'}
            
        except Exception as email_error:
            logger.error(f"Email fallback failed: {email_error}")
            return {'success': False, 'error': str(email_error)}
    
    def _format_answers(self, data):
        """Форматування відповідей для коментаря в Bitrix/Email"""
        answers = []
        for i in range(1, 6):
            key = f'question_{i}'
            if key in data:
                answers.append(f"Питання {i}: {data[key]}")
        return '\n'.join(answers)






