#!/bin/bash
# Команда для Render shell терміналу для перевірки заявок

python3 manage.py shell << 'EOF'
from apps.core.models import ConsultationRequest
from apps.leads.admin import UnifiedLeadAdminMixin, ChildrenLearningRequestAdmin, ConsultationRequestAdmin
from django.utils.html import format_html
from django.db.models import Q

print("=" * 80)
print("ПЕРЕВІРКА ЗАЯВОК ДИТЯЧЕ НАВЧАННЯ (children_learning)")
print("=" * 80)

# Отримати останні 10 заявок зі статусом children_learning
children_requests = ConsultationRequest.objects.filter(status='children_learning').order_by('-created_at')[:10]

print(f"\nЗнайдено заявок: {children_requests.count()}\n")

if children_requests.exists():
    for i, req in enumerate(children_requests, 1):
        print(f"\n--- Заявка #{i} (ID: {req.id}) ---")
        print(f"Дата створення: {req.created_at}")
        print(f"Ім'я (name): '{req.name}' (тип: {type(req.name)}, порожнє: {not req.name or not req.name.strip()})")
        print(f"Телефон (phone): '{req.phone}' (тип: {type(req.phone)}, порожнє: {not req.phone or not req.phone.strip()})")
        print(f"Статус: {req.status}")
        
        # Тестуємо метод get_contact_info
        mixin = UnifiedLeadAdminMixin()
        admin_instance = ChildrenLearningRequestAdmin(ConsultationRequest, None)
        contact_info = admin_instance.get_contact_info(req)
        print(f"get_contact_info() повертає: {contact_info}")
        print(f"  (тип: {type(contact_info)})")
        
        # Перевірка логіки
        parts = []
        if req.name and req.name.strip():
            parts.append(f'<strong>{req.name}</strong>')
        if req.phone and req.phone.strip():
            parts.append(req.phone)
        
        print(f"  Логіка перевірки: parts = {parts}")
        if parts:
            expected = format_html('<br>'.join(parts))
            print(f"  Очікуваний результат: {expected}")
        else:
            print(f"  Очікуваний результат: '-'")
else:
    print("Заявок зі статусом 'children_learning' не знайдено!")

print("\n" + "=" * 80)
print("ПЕРЕВІРКА ЗАЯВОК З ІНШИХ ДЖЕРЕЛ (для порівняння)")
print("=" * 80)

# Отримати заявки з інших статусів для порівняння
other_requests = ConsultationRequest.objects.exclude(status='children_learning').order_by('-created_at')[:5]

print(f"\nЗнайдено інших заявок: {other_requests.count()}\n")

if other_requests.exists():
    for i, req in enumerate(other_requests, 1):
        print(f"\n--- Заявка #{i} (ID: {req.id}) ---")
        print(f"Статус: {req.status}")
        print(f"Ім'я: '{req.name}'")
        print(f"Телефон: '{req.phone}'")
        
        admin_instance = ConsultationRequestAdmin(ConsultationRequest, None)
        contact_info = admin_instance.get_contact_info(req)
        print(f"get_contact_info() повертає: {contact_info}")

print("\n" + "=" * 80)
print("СТАТИСТИКА ПО ПОЛЯХ")
print("=" * 80)

children_all = ConsultationRequest.objects.filter(status='children_learning')
print(f"\nВсього заявок children_learning: {children_all.count()}")
print(f"  З заповненим name: {children_all.exclude(name__isnull=True).exclude(name='').count()}")
print(f"  З порожнім/None name: {children_all.filter(Q(name__isnull=True) | Q(name='')).count()}")
print(f"  З заповненим phone: {children_all.exclude(phone__isnull=True).exclude(phone='').count()}")
print(f"  З порожнім/None phone: {children_all.filter(Q(phone__isnull=True) | Q(phone='')).count()}")

# Перевірка останніх 3 заявок детально
print("\n" + "=" * 80)
print("ДЕТАЛЬНА ПЕРЕВІРКА ОСТАННІХ 3 ЗАЯВОК")
print("=" * 80)

recent = children_all.order_by('-created_at')[:3]
for req in recent:
    print(f"\nID: {req.id}, Дата: {req.created_at}")
    print(f"  name repr: {repr(req.name)}")
    print(f"  phone repr: {repr(req.phone)}")
    print(f"  name bool: {bool(req.name)}")
    print(f"  phone bool: {bool(req.phone)}")
    print(f"  name.strip() if name else None: {req.name.strip() if req.name else None}")
    print(f"  phone.strip() if phone else None: {req.phone.strip() if req.phone else None}")

EOF
