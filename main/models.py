from django.db import models
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError
from django.urls import reverse
import re


def validate_ukrainian_phone(value):
    """
    Валідатор для українського номера телефону.
    Перевіряє формат +38(0XX)XXX-XX-XX або +380XXXXXXXXX.
    Користувач має вводити лише 10 цифр після +38, починаючи з 0.
    """
    if not value:
        raise ValidationError("Номер телефону обов'язковий")
    
    # Видаляємо всі символи крім цифр та +
    digits_only = re.sub(r'[^\d+]', '', value)
    
    # Перевіряємо, що номер починається з +38
    if not digits_only.startswith('+38'):
        raise ValidationError("Номер телефону має починатися з +38")
    
    # Витягуємо цифри після +38
    phone_digits = digits_only[3:]
    
    # Перевіряємо, що після +38 рівно 10 цифр
    if len(phone_digits) != 10:
        raise ValidationError("Після +38 має бути рівно 10 цифр")
    
    # Перевіряємо, що перша цифра після +38 це 0
    if not phone_digits.startswith('0'):
        raise ValidationError("Після +38 номер має починатися з 0")
    
    # Перевіряємо, що всі символи після +38 це цифри
    if not phone_digits.isdigit():
        raise ValidationError("Після +38 мають бути лише цифри")


class TestSubmission(models.Model):
    """Модель для збереження результатів тесту"""
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(2)],
        verbose_name="Ім'я"
    )
    phone = models.CharField(
        max_length=20,
        validators=[MinLengthValidator(10)],
        verbose_name="Телефон"
    )
    
    # Відповіді тесту
    question_1 = models.CharField(max_length=10, verbose_name="Питання 1")
    question_2 = models.CharField(max_length=10, verbose_name="Питання 2")
    question_3 = models.CharField(max_length=10, verbose_name="Питання 3")
    question_4 = models.CharField(max_length=10, verbose_name="Питання 4")
    question_5 = models.CharField(max_length=10, verbose_name="Питання 5")
    
    # Мета-дані
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    sent_to_bitrix = models.BooleanField(default=False)
    bitrix_response = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Результат тесту"
        verbose_name_plural = "Результати тестів"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.phone} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"


class AdvertisingLead(models.Model):
    """Модель для збереження заявок з рекламного лендингу"""
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(2)],
        verbose_name="Ім'я"
    )
    phone = models.CharField(
        max_length=20,
        validators=[validate_ukrainian_phone],
        verbose_name="Телефон"
    )
    
    # Мета-дані
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP адреса")
    user_agent = models.TextField(blank=True, verbose_name="User Agent")
    sent_to_bitrix = models.BooleanField(default=False, verbose_name="Відправлено в Bitrix")
    bitrix_response = models.JSONField(null=True, blank=True, verbose_name="Відповідь Bitrix")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Оновлено")
    
    class Meta:
        verbose_name = "Заявка з рекламного лендингу"
        verbose_name_plural = "Заявки з рекламного лендингу"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.phone} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"


class BlogPost(models.Model):
    """Стаття блогу з багатомовністю"""
    
    # Основні поля
    title_uk = models.CharField(max_length=200, verbose_name="Заголовок (UK)")
    title_ru = models.CharField(max_length=200, verbose_name="Заголовок (RU)")
    
    slug_uk = models.SlugField(max_length=200, unique=True, verbose_name="Slug (UK)")
    slug_ru = models.SlugField(max_length=200, unique=True, verbose_name="Slug (RU)")
    
    content_uk = models.TextField(verbose_name="Контент (UK)")
    content_ru = models.TextField(verbose_name="Контент (RU)")
    
    # SEO поля
    meta_description_uk = models.CharField(max_length=160, verbose_name="Meta Description (UK)")
    meta_description_ru = models.CharField(max_length=160, verbose_name="Meta Description (RU)")
    
    # Open Graph
    og_title_uk = models.CharField(max_length=100, blank=True, verbose_name="OG Title (UK)")
    og_title_ru = models.CharField(max_length=100, blank=True, verbose_name="OG Title (RU)")
    
    og_description_uk = models.CharField(max_length=200, blank=True, verbose_name="OG Description (UK)")
    og_description_ru = models.CharField(max_length=200, blank=True, verbose_name="OG Description (RU)")
    
    og_image = models.ImageField(upload_to='blog/og_images/', blank=True, verbose_name="OG Image")
    
    # Додаткові поля
    author = models.CharField(max_length=100, default="SPEAK UP", verbose_name="Автор")
    featured_image = models.ImageField(upload_to='blog/images/', blank=True, verbose_name="Зображення")
    
    is_published = models.BooleanField(default=False, verbose_name="Опубліковано")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата публікації")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Стаття блогу"
        verbose_name_plural = "Статті блогу"
        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['slug_uk']),
            models.Index(fields=['slug_ru']),
            models.Index(fields=['-published_at']),
        ]
    
    def __str__(self):
        return self.title_uk
    
    def get_absolute_url(self, language='uk'):
        """Отримати URL статті для конкретної мови"""
        slug = self.slug_uk if language == 'uk' else self.slug_ru
        return reverse('main:blog_detail', kwargs={'slug': slug})
    
    def get_title(self, language='uk'):
        """Отримати заголовок для конкретної мови"""
        return self.title_uk if language == 'uk' else self.title_ru
    
    def get_meta_description(self, language='uk'):
        """Отримати meta description для конкретної мови"""
        return self.meta_description_uk if language == 'uk' else self.meta_description_ru
    
    def get_og_title(self, language='uk'):
        """Отримати OG title для конкретної мови"""
        og_title = self.og_title_uk if language == 'uk' else self.og_title_ru
        return og_title or self.get_title(language)
    
    def get_og_description(self, language='uk'):
        """Отримати OG description для конкретної мови"""
        return self.og_description_uk if language == 'uk' else self.og_description_ru
    
    def get_content(self, language='uk'):
        """Отримати контент для конкретної мови"""
        return self.content_uk if language == 'uk' else self.content_ru


class Program(models.Model):
    """Програма навчання з багатомовністю"""
    
    # Основні поля
    title_uk = models.CharField(max_length=200, verbose_name="Назва (UK)")
    title_ru = models.CharField(max_length=200, verbose_name="Назва (RU)")
    
    slug = models.SlugField(max_length=200, unique=True, verbose_name="Slug (однаковий)")
    
    description_uk = models.TextField(verbose_name="Опис (UK)")
    description_ru = models.TextField(verbose_name="Опис (RU)")
    
    content_uk = models.TextField(verbose_name="Контент (UK)")
    content_ru = models.TextField(verbose_name="Контент (RU)")
    
    # SEO поля
    meta_title_uk = models.CharField(max_length=60, verbose_name="Meta Title (UK)")
    meta_title_ru = models.CharField(max_length=60, verbose_name="Meta Title (RU)")
    
    meta_description_uk = models.CharField(max_length=160, verbose_name="Meta Description (UK)")
    meta_description_ru = models.CharField(max_length=160, verbose_name="Meta Description (RU)")
    
    # Open Graph
    og_title_uk = models.CharField(max_length=100, blank=True, verbose_name="OG Title (UK)")
    og_title_ru = models.CharField(max_length=100, blank=True, verbose_name="OG Title (RU)")
    
    og_description_uk = models.CharField(max_length=200, blank=True, verbose_name="OG Description (UK)")
    og_description_ru = models.CharField(max_length=200, blank=True, verbose_name="OG Description (RU)")
    
    og_image = models.ImageField(upload_to='programs/og_images/', blank=True, verbose_name="OG Image")
    
    # Додаткові поля
    icon = models.ImageField(upload_to='programs/icons/', blank=True, verbose_name="Іконка")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок відображення")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Програма"
        verbose_name_plural = "Програми"
        ordering = ['order', 'title_uk']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active', 'order']),
        ]
    
    def __str__(self):
        return self.title_uk
    
    def get_absolute_url(self):
        """Отримати URL програми"""
        return reverse('main:program_detail', kwargs={'slug': self.slug})
    
    def get_title(self, language='uk'):
        """Отримати назву для конкретної мови"""
        return self.title_uk if language == 'uk' else self.title_ru
    
    def get_meta_title(self, language='uk'):
        """Отримати meta title для конкретної мови"""
        return self.meta_title_uk if language == 'uk' else self.meta_title_ru
    
    def get_description(self, language='uk'):
        """Отримати опис для конкретної мови"""
        return self.description_uk if language == 'uk' else self.description_ru
    
    def get_meta_description(self, language='uk'):
        """Отримати meta description для конкретної мови"""
        return self.meta_description_uk if language == 'uk' else self.meta_description_ru
    
    def get_og_title(self, language='uk'):
        """Отримати OG title для конкретної мови"""
        og_title = self.og_title_uk if language == 'uk' else self.og_title_ru
        return og_title or self.get_title(language)
    
    def get_og_description(self, language='uk'):
        """Отримати OG description для конкретної мови"""
        return self.og_description_uk if language == 'uk' else self.og_description_ru
    
    def get_content(self, language='uk'):
        """Отримати контент для конкретної мови"""
        return self.content_uk if language == 'uk' else self.content_ru
    
    def get_content_formatted(self, language='uk'):
        """Отримати форматований контент (alias для get_content)"""
        return self.get_content(language)
    
    def get_meta_title(self, language='uk'):
        """Отримати meta title для конкретної мови (fallback до title)"""
        return self.get_title(language) + " | SPEAK UP"







