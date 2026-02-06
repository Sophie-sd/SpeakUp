#!/bin/bash

# Скрипт для конвертації PNG зображень в WebP формат
# Використовує cwebp (частина libwebp)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMG_DIR="$PROJECT_ROOT/static/img"

echo "🖼️  Конвертація зображень у WebP формат..."
echo "Директорія: $IMG_DIR"
echo ""

# Перевірка наявності cwebp
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp не знайдено!"
    echo "Встановіть libwebp:"
    echo "  macOS: brew install webp"
    echo "  Ubuntu: sudo apt-get install webp"
    exit 1
fi

# Список файлів для конвертації (великі PNG без WebP версії)
declare -a IMAGES=(
    "speak_man.png"
    "speak_kid.png"
    "speak_premium.png"
    "statSpeaky.png"
    "formsSpeaky.png"
    "3card.png"
    "4card.png"
    "5card.png"
)

CONVERTED=0
SKIPPED=0

for IMG in "${IMAGES[@]}"; do
    SOURCE="$IMG_DIR/$IMG"
    TARGET="$IMG_DIR/${IMG%.png}.webp"
    
    if [ ! -f "$SOURCE" ]; then
        echo "⚠️  Пропущено: $IMG (не знайдено)"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    if [ -f "$TARGET" ]; then
        echo "⏭️  Пропущено: $IMG (WebP вже існує)"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    echo "🔄 Конвертація: $IMG"
    
    # Конвертація з якістю 85 (баланс між розміром та якістю)
    cwebp -q 85 -m 6 "$SOURCE" -o "$TARGET"
    
    if [ $? -eq 0 ]; then
        ORIGINAL_SIZE=$(stat -f%z "$SOURCE" 2>/dev/null || stat -c%s "$SOURCE" 2>/dev/null)
        NEW_SIZE=$(stat -f%z "$TARGET" 2>/dev/null || stat -c%s "$TARGET" 2>/dev/null)
        SAVINGS=$(awk "BEGIN {printf \"%.1f\", (1 - $NEW_SIZE/$ORIGINAL_SIZE) * 100}")
        
        echo "  ✅ Збережено ${SAVINGS}% ($(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE) → $(numfmt --to=iec-i --suffix=B $NEW_SIZE))"
        CONVERTED=$((CONVERTED + 1))
    else
        echo "  ❌ Помилка конвертації"
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Готово!"
echo "  Конвертовано: $CONVERTED"
echo "  Пропущено: $SKIPPED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
