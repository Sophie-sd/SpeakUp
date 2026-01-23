from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Головні сторінки
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('contacts', views.contacts, name='contacts'),
    path('faq', views.faq, name='faq'),
    path('testing', views.testing, name='testing'),
    path('thank-you/', views.thank_you, name='thank_you'),
    path('thank-you-kids/', views.thank_you_kids, name='thank_you_kids'),

    # Homepage content forms
    path('submit-testimonial/', views.submit_testimonial, name='submit_testimonial'),
    path('get-testimonial-form/', views.get_testimonial_form, name='get_testimonial_form'),
    path('submit-consultation/', views.submit_consultation, name='submit_consultation'),

    # NEWS - ПЕРЕД catch-all! (КРИТИЧНО для SEO)
    path('news/', views.news_list, name='news_list'),
    path('news/<slug:slug>/', views.news_detail, name='news_detail'),

    # Feedback, Job, Shares
    path('feedback/', views.feedback_list, name='feedback'),
    path('job', views.job_list, name='job'),
    # Shares stubs (before general shares pattern)
    path('shares/kupy-2-urovnya-anglyjskogo-y-poluchy-eshhe-2-v-podarok/', views.shares_detail_stub, name='shares_detail_stub'),
    path('shares/page/<int:page>/', views.shares_page_stub, name='shares_page_stub'),
    path('shares/', views.shares_list, name='shares'),

    # Програми - список всіх програм (ПЕРЕД детальною сторінкою!)
    path('programs/', views.programs_list, name='programs_list'),
    # SEO Stub: Program (before dynamic pattern)
    path('programs/summer-camp-2021', views.summer_camp_2021_stub, name='summer_camp_2021_stub'),
    # Landing page для дитячого табору з грантом (ПЕРЕД динамічним slug!)
    path('programs/camp', views.camp_landing_page, name='camp_landing_page'),
    # Програми (динамічний slug)
    path('programs/<slug:slug>', views.program_detail, name='program_detail'),

    # Orphan: Локації (динамічний slug)
    path('school/<slug:slug>', views.school_location, name='school_location'),

    # SEO Stub Pages (ПЕРЕД catch-all!)
    # Specific stubs
    path('golovna-3/', views.golovna_3_stub, name='golovna_3_stub'),
    path('glavnaya-stranicza/', views.glavnaya_stranicza_stub, name='glavnaya_stranicza_stub'),
    path('sertyfikat/', views.sertyfikat_stub, name='sertyfikat_stub'),
    path('programma-loyalnosty/', views.programma_loyalnosty_stub, name='programma_loyalnosty_stub'),
    path('buy/', views.buy_stub, name='buy_stub'),
    path('dogovir-pro-nadannya-poslug-dostupu-do-elektronnogo-kabinetu-speak-up-2/', views.dogovir_stub, name='dogovir_stub'),

    # Landing pages для програм навчання (ПЕРЕД catch-all!)
    path('anglijska-dlya-ditej-kids-30', views.kids_learning_page, name='kids_learning_page'),
    path('product/misyacz-bezlimitu/', views.premium_learning_page, name='premium_learning_page'),

    # Документи з папки DogovoraURL
    path('documents/dogovir-dostup-do-kabinetu-speak-up/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-speak-up'}, name='document_dostup_speak_up'),
    path('documents/dogovir-dostup-do-kabinetu-study-systems-grup/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-study-systems-grup'}, name='document_dostup_study_systems_grup'),
    path('documents/dogovir-dostup-do-kabinetu-study-systems-kyiv/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-study-systems-kyiv'}, name='document_dostup_study_systems_kyiv'),
    path('documents/dogovir-dostup-do-kabinetu-study-systems-odesa/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-study-systems-odesa'}, name='document_dostup_study_systems_odesa'),
    path('documents/dogovir-dostup-do-kabinetu-study-systems-ukraina/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-study-systems-ukraina'}, name='document_dostup_study_systems_ukraina'),
    path('documents/dogovir-dostup-do-kabinetu-study-systems-tsentr/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-study-systems-tsentr'}, name='document_dostup_study_systems_tsentr'),
    path('documents/dogovir-poslugy-speak-up/', views.document_view, kwargs={'filename': 'dogovir-poslugy-speak-up'}, name='document_poslugy_speak_up'),
    path('documents/dogovir-poslugy-study-systems-grup/', views.document_view, kwargs={'filename': 'dogovir-poslugy-study-systems-grup'}, name='document_poslugy_study_systems_grup'),
    path('documents/dogovir-poslugy-study-systems-kyiv/', views.document_view, kwargs={'filename': 'dogovir-poslugy-study-systems-kyiv'}, name='document_poslugy_study_systems_kyiv'),
    path('documents/dogovir-poslugy-study-systems-odesa/', views.document_view, kwargs={'filename': 'dogovir-poslugy-study-systems-odesa'}, name='document_poslugy_study_systems_odesa'),
    path('documents/dogovir-poslugy-study-systems-ukraina/', views.document_view, kwargs={'filename': 'dogovir-poslugy-study-systems-ukraina'}, name='document_poslugy_study_systems_ukraina'),
    path('documents/dogovir-poslugy-study-systems-tsentr/', views.document_view, kwargs={'filename': 'dogovir-poslugy-study-systems-tsentr'}, name='document_poslugy_study_systems_tsentr'),

    # Orphan: Міста (динамічний slug) - В КІНЦІ як catch-all
    path('<slug:city>', views.city_page, name='city_page'),
]

