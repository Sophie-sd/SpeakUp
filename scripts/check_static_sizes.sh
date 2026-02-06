#!/bin/bash
# Скрипт для оптимізації статичних файлів перед деплоєм

echo "=== SpeakUp Static Files Optimization ==="
echo "Дата: $(date)"
echo ""

# Функція для виведення розміру файлу
print_size() {
    local file=$1
    if [ -f "$file" ]; then
        local size=$(wc -c < "$file" | awk '{print $1}')
        local size_kb=$(echo "scale=2; $size/1024" | bc)
        echo "  Розмір: ${size_kb} KB"
    fi
}

# Перевірка наявності required tools
echo "Перевірка інструментів..."

# Кількість CSS файлів
css_count=$(find static/css -name "*.css" | wc -l)
echo "Знайдено CSS файлів: $css_count"

# Кількість JS файлів
js_count=$(find static/js -name "*.js" | wc -l)
echo "Знайдено JS файлів: $js_count"

echo ""
echo "=== Статистика розмірів ==="

# Top 10 найбільших CSS файлів
echo ""
echo "Top 10 найбільших CSS файлів:"
find static/css -name "*.css" -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}' | sort -hr | head -10

# Top 10 найбільших JS файлів
echo ""
echo "Top 10 найбільших JS файлів:"
find static/js -name "*.js" -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}' | sort -hr | head -10

echo ""
echo "=== Загальний розмір ==="

# Загальний розмір CSS
css_size=$(find static/css -name "*.css" -type f -exec wc -c {} \; | awk '{total += $1} END {print total}')
css_size_kb=$(echo "scale=2; $css_size/1024" | bc)
echo "Загальний CSS: ${css_size_kb} KB"

# Загальний розмір JS
js_size=$(find static/js -name "*.js" -type f -exec wc -c {} \; | awk '{total += $1} END {print total}')
js_size_kb=$(echo "scale=2; $js_size/1024" | bc)
echo "Загальний JS: ${js_size_kb} KB"

# Загальний розмір статики
total_size=$(echo "scale=2; ($css_size + $js_size)/1024" | bc)
echo "Загальний розмір (CSS + JS): ${total_size} KB"

echo ""
echo "=== Рекомендації ==="
echo "1. Розгляньте bundling для критичних CSS файлів"
echo "2. Перевірте можливість видалення невикористаних CSS правил"
echo "3. Розгляньте lazy loading для не критичних модулів"
echo "4. WhiteNoise автоматично стискає файли під час collectstatic"

echo ""
echo "=== Завершено ==="
