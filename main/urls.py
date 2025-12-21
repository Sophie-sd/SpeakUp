from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    # Статичні сторінки
    path('', views.home_view, name='home'),
    path('about/', views.about_view, name='about'),
    path('feedback/', views.feedback_view, name='feedback'),
    path('contacts/', views.contacts_view, name='contacts'),
    path('job/', views.job_view, name='job'),
    path('advertising/', views.advertising_view, name='advertising'),
    
    # Блог
    path('news/', views.blog_list_view, name='blog_list'),
    path('news/<slug:slug>/', views.blog_detail_view, name='blog_detail'),
    
    # Програми
    path('programs/', views.programs_list_view, name='programs_list'),
    path('programs/<slug:slug>/', views.program_detail_view, name='program_detail'),
    
    # API та утиліти
    path('api/test/submit/', views.test_submit_view, name='test_submit'),
    path('api/advertising/submit/', views.advertising_submit_view, name='advertising_submit'),
    path('api/order-call/submit/', views.order_call_submit_view, name='order_call_submit'),
    path('robots.txt', views.robots_txt_view, name='robots_txt'),
]








