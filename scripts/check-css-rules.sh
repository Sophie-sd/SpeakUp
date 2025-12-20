#!/bin/bash
set -e

echo "========================================="
echo "🎨 CSS Custom Rules Check"
echo "========================================="

ERROR_COUNT=0
WARNING_COUNT=0

CSS_FILES=$(find static/css -name "*.css" ! -name "normalize.css" 2>/dev/null || echo "")

if [ -z "$CSS_FILES" ]; then
  echo "⚠️  No CSS files"
  exit 0
fi

# Правило 1: 100vh fallback
echo ""
echo "📐 [Rule 1] Checking 100vh fallback..."
VH_ISSUES=$(echo "$CSS_FILES" | while read -r file; do
  grep -n '100vh' "$file" | while IFS=: read -r linenum line; do
    context=$(sed -n "$((linenum-1)),$((linenum+2))p" "$file")
    if ! echo "$context" | grep -qE '100dvh|Fallback'; then
      echo "$file:$linenum: $line"
    fi
  done
done)

if [ -n "$VH_ISSUES" ]; then
  echo "❌ Found 100vh without 100dvh fallback:"
  echo "$VH_ISSUES"
  ((ERROR_COUNT++))
else
  echo "✅ All 100vh have fallback"
fi

# Правило 2: safe-area-inset
echo ""
echo "📱 [Rule 2] Checking safe-area-inset..."
SAFE_AREA=$(echo "$CSS_FILES" | xargs grep -c 'env(safe-area-inset-' | grep -v ':0$' || echo "")
if [ -z "$SAFE_AREA" ]; then
  echo "⚠️  No safe-area-inset usage"
  ((WARNING_COUNT++))
else
  echo "✅ safe-area-inset used"
fi

# Правило 3: font-size rem
echo ""
echo "🔤 [Rule 3] Checking font-size units..."
PX_FONTS=$(echo "$CSS_FILES" | xargs grep -n 'font-size:.*px' || echo "")
if [ -n "$PX_FONTS" ]; then
  echo "⚠️  font-size in px:"
  echo "$PX_FONTS" | head -n 10
  ((WARNING_COUNT++))
else
  echo "✅ All font-sizes use rem"
fi

# Правило 4: flex shorthand
echo ""
echo "📦 [Rule 4] Checking flex shorthand..."
FLEX_ISSUES=$(echo "$CSS_FILES" | xargs grep -n 'flex:\s*1;' || echo "")
if [ -n "$FLEX_ISSUES" ]; then
  echo "❌ Found 'flex: 1;':"
  echo "$FLEX_ISSUES"
  ((ERROR_COUNT++))
else
  echo "✅ All flex explicit"
fi

# Правило 5: hover media query
echo ""
echo "🖱️  [Rule 5] Checking :hover in @media..."
UNCHECKED_HOVERS=$(echo "$CSS_FILES" | while read -r file; do
  awk '
    /@media.*\(hover: hover\)/ { in_media=1; next }
    /^}/ { if (in_media) in_media=0 }
    /:hover/ { if (!in_media) print FILENAME":"NR":"$0 }
  ' "$file"
done)

if [ -n "$UNCHECKED_HOVERS" ]; then
  echo "⚠️  :hover outside @media (hover: hover):"
  echo "$UNCHECKED_HOVERS" | head -n 5
  ((WARNING_COUNT++))
else
  echo "✅ All :hover in @media"
fi

# Правило 6: overscroll-behavior
echo ""
echo "📜 [Rule 6] Checking overscroll-behavior..."
OVERSCROLL=$(echo "$CSS_FILES" | xargs grep -c 'overscroll-behavior' | grep -v ':0$' || echo "")
if [ -z "$OVERSCROLL" ]; then
  echo "⚠️  No overscroll-behavior"
  ((WARNING_COUNT++))
else
  echo "✅ overscroll-behavior used"
fi

# Правило 7: !important
echo ""
echo "🚫 [Rule 7] Checking for !important..."
IMPORTANT=$(echo "$CSS_FILES" | xargs grep -n '!important' || echo "")
if [ -n "$IMPORTANT" ]; then
  echo "❌ !important found:"
  echo "$IMPORTANT"
  ((ERROR_COUNT++))
else
  echo "✅ No !important"
fi

# Правило 8: backdrop-filter
echo ""
echo "🌫️  [Rule 8] Checking backdrop-filter prefix..."
BACKDROP=$(echo "$CSS_FILES" | xargs grep -n 'backdrop-filter:' | grep -v '\-webkit-backdrop-filter' || echo "")
if [ -n "$BACKDROP" ]; then
  echo "⚠️  backdrop-filter without -webkit-:"
  echo "$BACKDROP"
  ((WARNING_COUNT++))
else
  echo "✅ All backdrop-filters OK"
fi

echo ""
echo "========================================="
echo "📊 CSS Summary"
echo "========================================="
echo "Errors: $ERROR_COUNT"
echo "Warnings: $WARNING_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ CSS check FAILED"
  exit 1
else
  echo "✅ CSS check PASSED"
  exit 0
fi

