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
    path('documents/dogovir-dostup-do-kabinetu-spik-ap/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-spik-ap'}, name='document_dostup_spik_ap'),
    path('documents/dogovir-dostup-do-kabinetu-stadi-sistems-grup/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-stadi-sistems-grup'}, name='document_dostup_stadi_grup'),
    path('documents/dogovir-dostup-do-kabinetu-stadi-sistems-kiiv/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-stadi-sistems-kiiv'}, name='document_dostup_stadi_kiiv'),
    path('documents/dogovir-dostup-do-kabinetu-stadi-sistems-odesa/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-stadi-sistems-odesa'}, name='document_dostup_stadi_odesa'),
    path('documents/dogovir-dostup-do-kabinetu-stadi-sistems-ukraina/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-stadi-sistems-ukraina'}, name='document_dostup_stadi_ukraina'),
    path('documents/dogovir-dostup-do-kabinetu-stadi-sistems-tsentr/', views.document_view, kwargs={'filename': 'dogovir-dostup-do-kabinetu-stadi-sistems-tsentr'}, name='document_dostup_stadi_tsentr'),
    path('documents/dogovir-poslugy-spik-ap/', views.document_view, kwargs={'filename': 'dogovir-poslugy-spik-ap'}, name='document_poslugy_spik_ap'),
    path('documents/dogovir-poslugy-stadi-sistems-grup/', views.document_view, kwargs={'filename': 'dogovir-poslugy-stadi-sistems-grup'}, name='document_poslugy_stadi_grup'),
    path('documents/dogovir-poslugy-stadi-sistems-kiiv/', views.document_view, kwargs={'filename': 'dogovir-poslugy-stadi-sistems-kiiv'}, name='document_poslugy_stadi_kiiv'),
    path('documents/dogovir-poslugy-stadi-sistems-odesa/', views.document_view, kwargs={'filename': 'dogovir-poslugy-stadi-sistems-odesa'}, name='document_poslugy_stadi_odesa'),
    path('documents/dogovir-poslugy-stadi-sistems-ukraina/', views.document_view, kwargs={'filename': 'dogovir-poslugy-stadi-sistems-ukraina'}, name='document_poslugy_stadi_ukraina'),
    path('documents/dogovir-poslugy-stadi-sistems-tsentr/', views.document_view, kwargs={'filename': 'dogovir-poslugy-stadi-sistems-tsentr'}, name='document_poslugy_stadi_tsentr'),

    # Orphan: Міста (динамічний slug) - В КІНЦІ як catch-all
    path('<slug:city>', views.city_page, name='city_page'),
]

