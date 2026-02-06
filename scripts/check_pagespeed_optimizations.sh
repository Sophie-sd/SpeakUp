#!/bin/bash

# Скрипт для перевірки оптимізацій PageSpeed
# Виводить розміри файлів до/після оптимізації

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMG_DIR="$PROJECT_ROOT/static/img"

echo "📊 Аналіз оптимізацій PageSpeed"
echo "================================"
echo ""

# Функція для форматування розміру
format_size() {
    local size=$1
    if [ $size -gt 1048576 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", $size/1048576}") MB"
    elif [ $size -gt 1024 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", $size/1024}") KB"
    else
        echo "${size} B"
    fi
}

# Перевірка WebP конвертацій
echo "🖼️  WebP Оптимізація"
echo "-------------------"

declare -a IMAGES=(
    "speak_man"
    "speak_kid"
    "speak_premium"
    "statSpeaky"
    "formsSpeaky"
    "1card"
    "2card"
    "3card"
    "4card"
    "5card"
)

TOTAL_ORIGINAL=0
TOTAL_WEBP=0

for IMG in "${IMAGES[@]}"; do
    PNG_FILE="$IMG_DIR/${IMG}.png"
    WEBP_FILE="$IMG_DIR/${IMG}.webp"
    
    if [ -f "$PNG_FILE" ] && [ -f "$WEBP_FILE" ]; then
        PNG_SIZE=$(stat -f%z "$PNG_FILE" 2>/dev/null || stat -c%s "$PNG_FILE" 2>/dev/null)
        WEBP_SIZE=$(stat -f%z "$WEBP_FILE" 2>/dev/null || stat -c%s "$WEBP_FILE" 2>/dev/null)
        
        TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + PNG_SIZE))
        TOTAL_WEBP=$((TOTAL_WEBP + WEBP_SIZE))
        
        SAVINGS=$(awk "BEGIN {printf \"%.1f\", (1 - $WEBP_SIZE/$PNG_SIZE) * 100}")
        
        echo "  ${IMG}:"
        echo "    PNG:  $(format_size $PNG_SIZE)"
        echo "    WebP: $(format_size $WEBP_SIZE) (економія ${SAVINGS}%)"
    fi
done

echo ""
echo "📉 Загальна економія:"
echo "  Оригінальні PNG: $(format_size $TOTAL_ORIGINAL)"
echo "  WebP версії:     $(format_size $TOTAL_WEBP)"
TOTAL_SAVINGS=$(awk "BEGIN {printf \"%.1f\", (1 - $TOTAL_WEBP/$TOTAL_ORIGINAL) * 100}")
SAVED_SIZE=$((TOTAL_ORIGINAL - TOTAL_WEBP))
echo "  Збережено:       $(format_size $SAVED_SIZE) (${TOTAL_SAVINGS}%)"
echo ""

# Перевірка реалізованих оптимізацій
echo "✅ Реалізовані оптимізації:"
echo "---------------------------"

check_optimization() {
    local file=$1
    local pattern=$2
    local desc=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo "  ✓ $desc"
        return 0
    else
        echo "  ✗ $desc"
        return 1
    fi
}

# Перевірка preconnect
check_optimization "$PROJECT_ROOT/templates/base.html" "preconnect.*cloudinary" "Cloudinary preconnect"
check_optimization "$PROJECT_ROOT/templates/base.html" "preconnect.*run.app" "Google Analytics preconnect"

# Перевірка async CSS loading
check_optimization "$PROJECT_ROOT/templates/base.html" "preload.*as=\"style\".*onload" "Async CSS loading"

# Перевірка WebP в шаблонах
check_optimization "$PROJECT_ROOT/templates/core/index.html" "formsSpeaky.webp" "WebP у hero секції"
check_optimization "$PROJECT_ROOT/templates/core/components/pricing-section.html" "speak_man.webp" "WebP в програмах"

# Перевірка width/height атрибутів
check_optimization "$PROJECT_ROOT/templates/core/index.html" "width=.*height=" "Width/Height атрибути"

# Перевірка fetchpriority
check_optimization "$PROJECT_ROOT/templates/core/index.html" "fetchpriority=\"high\"" "Fetchpriority на LCP"

echo ""
echo "📋 Рекомендації для наступних кроків:"
echo "------------------------------------"
echo "  1. Деплой на Render"
echo "  2. Тест на PageSpeed Insights (mobile)"
echo "  3. Очікувані покращення:"
echo "     - LCP: 105.7s → <4s (через async CSS + WebP)"
echo "     - FCP: 3.7s → <2s (через критичний CSS)"
echo "     - CLS: 0.134 → <0.1 (через width/height)"
echo "     - Розмір зображень: -37MB → -3MB (після WebP)"
echo ""
