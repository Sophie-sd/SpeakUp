# Scripts Documentation — SpeakUp Code Quality

## Огляд

Ця директорія містить bash-скрипти для автоматичної перевірки якості коду проекту SpeakUp. Система перевіряє **110+ правил** для HTML, CSS, JavaScript та Django шаблонів.

## Доступні скрипти

### 1. check_template_tags.sh
**Призначення:** Перевірка Django template tags ({{ }} та {% %}) на розриви між рядками.

**Запуск:**
```bash
bash scripts/check_template_tags.sh
```

**Що перевіряє:**
- {{ variable }} не розривається на кілька рядків
- {% tag %} не розривається на кілька рядків

**Як виправити порушення:**
```django
<!-- ❌ Неправильно -->
{% if user.is_authenticated and
     user.has_permission %}

<!-- ✅ Правильно -->
{% if user.is_authenticated and user.has_permission %}

<!-- ✅ Або через {% with %} -->
{% with has_access=user.is_authenticated and user.has_permission %}
  {% if has_access %}
```

### 2. check-html-rules.sh
**Призначення:** 7 кастомних правил для HTML.

**Запуск:**
```bash
bash scripts/check-html-rules.sh
```

**Що перевіряє:**
1. viewport meta містить `viewport-fit=cover` та `interactive-widget=resizes-content`
2. Відсутність inline styles
3. Відсутність inline event handlers
4. inputmode для tel/number inputs
5. video теги з poster, playsinline, muted
6. script теги з defer/async
7. touch-action для інтерактивних елементів

### 3. check-css-rules.sh
**Призначення:** 8 кастомних правил для CSS.

**Запуск:**
```bash
bash scripts/check-css-rules.sh
```

**Що перевіряє:**
1. 100vh має fallback 100dvh
2. safe-area-inset для fixed елементів
3. font-size в rem (warning)
4. flex: 1 0 0; замість flex: 1;
5. :hover в @media (hover: hover)
6. overscroll-behavior на body
7. Відсутність !important
8. backdrop-filter з -webkit- prefix

### 4. check-js-rules.sh
**Призначення:** 5 кастомних правил для JavaScript.

**Запуск:**
```bash
bash scripts/check-js-rules.sh
```

**Що перевіряє:**
1. Відсутність var
2. pageshow event listener для bfcache
3. 'use strict'; або IIFE
4. Відсутність eval()
5. HTMX integration

### 5. fix-rules.sh
**Призначення:** Автоматичне виправлення простих порушень.

**Запуск:**
```bash
bash scripts/fix-rules.sh
# Або через npm:
npm run fix:rules
```

**Що виправляє:**
- Видаляє inline styles
- Додає inputmode="tel"
- Виправляє flex: 1; → flex: 1 0 0;

### 6. check-all-rules.sh
**Призначення:** Запуск ВСІХ перевірок.

**Запуск:**
```bash
bash scripts/check-all-rules.sh
# Або через npm:
npm run check:rules
```

**Що запускає:**
1. check_template_tags.sh
2. check-html-rules.sh
3. check-css-rules.sh
4. check-js-rules.sh
5. Stylelint
6. ESLint
7. HTMLHint

### 7. pre-commit-hook.sh
**Призначення:** Git hook що запускається перед commit.

**Автоматичний запуск** при `git commit`.

**Що робить:**
- Перевіряє тільки staged files
- Блокує commit якщо є помилки
- Показує які файли мають проблеми

## Workflow

### Щоденна робота

1. **Перед commit:**
   ```bash
   npm run check:rules
   ```

2. **Якщо є помилки:**
   ```bash
   npm run fix:rules
   npm run lint:fix
   ```

3. **Ручне виправлення решти:**
   - Читайте вивід скриптів
   - Виправляйте порушення вручну
   - Повторіть крок 1

4. **Commit:**
   ```bash
   git add .
   git commit -m "Your message"
   ```

### Обхід pre-commit hook (НЕ рекомендується)

Якщо дуже потрібно (hotfix):
```bash
git commit --no-verify -m "Emergency hotfix"
```

**УВАГА:** Використовуйте тільки у критичних ситуаціях!

## Troubleshooting

### Помилка: "bash: permission denied"
```bash
chmod +x scripts/*.sh
```

### Помилка: "npx: command not found"
```bash
npm install
```

### Pre-commit hook не спрацьовує
```bash
npx husky install
chmod +x .husky/pre-commit
```

### Занадто багато помилок
```bash
# Виправте по одному типу:
npm run lint:css -- --fix
npm run lint:js -- --fix
bash scripts/fix-rules.sh
```

## Підтримка

При виникненні проблем:
1. Перечитайте вивід скрипта — він містить підказки
2. Перевірте файл з прикладами виправлень
3. Зверніться до документації проекту

