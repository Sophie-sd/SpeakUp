"""
Factory для моделей analytics (для майбутніх тестів)
"""
# import factory
# from factory.django import DjangoModelFactory
# from apps.analytics.models import VisitorSession, PageView
# 
# class VisitorSessionFactory(DjangoModelFactory):
#     class Meta:
#         model = VisitorSession
#     
#     session_key = factory.Faker('uuid4')
#     ip_address = factory.Faker('ipv4')
#     user_agent = factory.Faker('user_agent')
#     device_type = 'desktop'
#     is_bot = False
# 
# class PageViewFactory(DjangoModelFactory):
#     class Meta:
#         model = PageView
#     
#     session = factory.SubFactory(VisitorSessionFactory)
#     url = factory.Faker('uri_path')
#     page_title = factory.Faker('sentence')
#     source = 'js'
