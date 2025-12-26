from django.core.management.base import BaseCommand
from django.utils import timezone
from main.models import BlogPost, Program


class Command(BaseCommand):
    help = 'Створити тестові дані для BlogPost та Program'

    def handle(self, *args, **options):
        # Очистити стару дані
        BlogPost.objects.all().delete()
        Program.objects.all().delete()
        
        # Створити 3 тестові статті блогу
        blog_posts_data = [
            {
                'title_uk': 'Неправильні глаголи в англійському мовою',
                'title_ru': 'Неправильные глаголы в английском языке',
                'slug_uk': 'nepravylni-hlagoly-v-angilskiy-movi',
                'slug_ru': 'nepravylnye-glagoly-v-anglijskom-yazyke',
                'content_uk': 'Неправильні глаголи - це глаголи, які не підпорядковуються стандартним правилам утворення часів...',
                'content_ru': 'Неправильные глаголы - это глаголы, которые не подчиняются стандартным правилам образования времён...',
                'meta_description_uk': 'Вивчайте неправильні глаголи англійської мови з прикладами та вправами',
                'meta_description_ru': 'Изучайте неправильные глаголы английского языка с примерами и упражнениями',
                'og_description_uk': 'Неправильні глаголи: повний гайд для вивчення',
                'og_description_ru': 'Неправильные глаголы: полный гайд для изучения',
                'is_published': True,
            },
            {
                'title_uk': 'Все о Past Simple: як утворюється, правила вживання',
                'title_ru': 'Все о Past Simple: как образуется, правила употребления',
                'slug_uk': 'past-simple-utvorennya-pravyla-vzhyvannya',
                'slug_ru': 'past-simple-obrazovaniye-pravila-upotrebleniya',
                'content_uk': 'Past Simple - один з найважливіших часів англійської мови. Використовується для опису завершених дій...',
                'content_ru': 'Past Simple - один из самых важных времён английского языка. Используется для описания завершённых действий...',
                'meta_description_uk': 'Past Simple час англійської мови: утворення, правила, приклади',
                'meta_description_ru': 'Past Simple время английского языка: образование, правила, примеры',
                'og_description_uk': 'Past Simple: повний посібник',
                'og_description_ru': 'Past Simple: полный справочник',
                'is_published': True,
            },
            {
                'title_uk': 'Кольори в англійській мові: назви, прикметники, ідіоми',
                'title_ru': 'Цвета в английском языке: названия, прилагательные, идиомы',
                'slug_uk': 'kolory-v-angilskiy-movi-nazvy-prykmetnyky',
                'slug_ru': 'cveta-v-anglijskom-yazyke-nazvaniya-prilagatelnye',
                'content_uk': 'Навчіться називати кольори англійською мовою та використовувати їх в речах...',
                'content_ru': 'Научитесь называть цвета на английском языке и использовать их в предложениях...',
                'meta_description_uk': 'Кольори англійської мови: назви, прилеметники, ідіоми та фрази',
                'meta_description_ru': 'Цвета английского языка: названия, прилагательные, идиомы и фразы',
                'og_description_uk': 'Повний гайд з кольорів англійської мови',
                'og_description_ru': 'Полный гайд по цветам английского языка',
                'is_published': True,
            }
        ]
        
        for data in blog_posts_data:
            BlogPost.objects.create(
                author='SPEAK UP',
                published_at=timezone.now(),
                **data
            )
        
        # Створити 5 тестових програм
        programs_data = [
            {
                'title_uk': 'Безлімітний онлайн курс',
                'title_ru': 'Безлимитный онлайн курс',
                'slug': 'bezlimitnyj-onlajn-kurs',
                'description_uk': 'Необмежений доступ до усіх матеріалів',
                'description_ru': 'Неограниченный доступ ко всем материалам',
                'content_uk': 'Детальна інформація про безлімітний курс...',
                'content_ru': 'Подробная информация о безлимитном курсе...',
                'meta_title_uk': 'Безлімітний онлайн курс | SPEAK UP',
                'meta_title_ru': 'Безлимитный онлайн курс | SPEAK UP',
                'meta_description_uk': 'Онлайн курс англійської з необмеженим доступом до матеріалів',
                'meta_description_ru': 'Онлайн курс английского с неограниченным доступом к материалам',
                'og_description_uk': 'Безлімітний доступ до матеріалів',
                'og_description_ru': 'Безлимитный доступ к материалам',
                'is_active': True,
                'order': 1,
            },
            {
                'title_uk': 'Мні-курси',
                'title_ru': 'Мини-курсы',
                'slug': 'mini-kursy',
                'description_uk': 'Коротки інтенсивні курси',
                'description_ru': 'Короткие интенсивные курсы',
                'content_uk': 'Деталі про мні-курси...',
                'content_ru': 'Детали о мини-курсах...',
                'meta_title_uk': 'Мні-курси | SPEAK UP',
                'meta_title_ru': 'Мини-курсы | SPEAK UP',
                'meta_description_uk': 'Короткі інтенсивні курси англійської мови',
                'meta_description_ru': 'Короткие интенсивные курсы английского языка',
                'og_description_uk': 'Інтенсивне навчання за короткий період',
                'og_description_ru': 'Интенсивное обучение за короткий период',
                'is_active': True,
                'order': 2,
            },
            {
                'title_uk': 'Курс для бізнесу',
                'title_ru': 'Курс для бизнеса',
                'slug': 'kurs-dlya-biznesa',
                'description_uk': 'Англійська для професіоналів',
                'description_ru': 'Английский для профессионалов',
                'content_uk': 'Програма розроблена для бізнес-професіоналів...',
                'content_ru': 'Программа разработана для бизнес-профессионалов...',
                'meta_title_uk': 'Курс англійської для бізнесу | SPEAK UP',
                'meta_title_ru': 'Курс английского для бизнеса | SPEAK UP',
                'meta_description_uk': 'Англійська мова для бізнесу та професійного спілкування',
                'meta_description_ru': 'Английский язык для бизнеса и профессионального общения',
                'og_description_uk': 'Професійна англійська для кар\'єру',
                'og_description_ru': 'Профессиональный английский для карьеры',
                'is_active': True,
                'order': 3,
            },
            {
                'title_uk': 'Для IT-спеціалістів',
                'title_ru': 'Для IT-специалистов',
                'slug': 'dlya-it-specialistov',
                'description_uk': 'Англійська для IT-фахівців',
                'description_ru': 'Английский для IT-специалистов',
                'content_uk': 'Курс зосереджений на IT-термінології...',
                'content_ru': 'Курс сосредоточен на IT-терминологии...',
                'meta_title_uk': 'Англійська для IT | SPEAK UP',
                'meta_title_ru': 'Английский для IT | SPEAK UP',
                'meta_description_uk': 'Специалізована програма для IT-фахівців',
                'meta_description_ru': 'Специализированная программа для IT-специалистов',
                'og_description_uk': 'IT терміни та розмовна англійська',
                'og_description_ru': 'IT термины и разговорный английский',
                'is_active': True,
                'order': 4,
            },
            {
                'title_uk': 'Курс для туризму',
                'title_ru': 'Курс для туризма',
                'slug': 'kurs-dlya-turizma',
                'description_uk': 'Англійська для туристичних гайдів',
                'description_ru': 'Английский для туристических гидов',
                'content_uk': 'Курс орієнтований на туристичний словник...',
                'content_ru': 'Курс ориентирован на туристический словарь...',
                'meta_title_uk': 'Англійська для туризму | SPEAK UP',
                'meta_title_ru': 'Английский для туризма | SPEAK UP',
                'meta_description_uk': 'Англійська мова для туристичної індустрії',
                'meta_description_ru': 'Английский язык для туристической индустрии',
                'og_description_uk': 'Комунікація з туристами англійською',
                'og_description_ru': 'Общение с туристами на английском',
                'is_active': True,
                'order': 5,
            }
        ]
        
        for data in programs_data:
            Program.objects.create(**data)
        
        self.stdout.write(self.style.SUCCESS('✅ Тестові дані успішно створені!'))
        self.stdout.write(f'Блог: {BlogPost.objects.count()} статей')
        self.stdout.write(f'Програми: {Program.objects.count()} програм')











