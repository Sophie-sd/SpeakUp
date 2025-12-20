#!/bin/bash
set -e

echo "========================================="
echo "🔖 Django Template Tags Check"
echo "========================================="

ERROR_COUNT=0

HTML_FILES=$(find templates -name "*.html" 2>/dev/null || echo "")

if [ -z "$HTML_FILES" ]; then
  echo "⚠️  No template files found"
  exit 0
fi

echo ""
echo "🚫 [CRITICAL] Checking for broken Django template tags..."

# Перевірка 1: {{ на одному рядку, }} на іншому (використовуємо perl для кросплатформенності)
BROKEN_VAR_TAGS=$(echo "$HTML_FILES" | xargs perl -nle 'print "$ARGV:$.: $_" if /\{\{[^}]*$/ && !/\{\{.*\}\}/' 2>/dev/null || echo "")
if [ -n "$BROKEN_VAR_TAGS" ]; then
  echo "❌ Found {{ }} tags broken across lines:"
  echo "$BROKEN_VAR_TAGS" | head -n 20
  ((ERROR_COUNT++))
fi

# Перевірка 2: {% на одному рядку, %} на іншому
BROKEN_BLOCK_TAGS=$(echo "$HTML_FILES" | xargs perl -nle 'print "$ARGV:$.: $_" if /\{%[^%]*$/ && !/\{%[^%]*%\}/' 2>/dev/null || echo "")
if [ -n "$BROKEN_BLOCK_TAGS" ]; then
  echo "❌ Found {% %} tags broken across lines:"
  echo "$BROKEN_BLOCK_TAGS" | head -n 20
  ((ERROR_COUNT++))
fi

if [ $ERROR_COUNT -eq 0 ]; then
  echo "✅ All Django template tags are on single lines"
fi

echo ""
echo "========================================="
echo "📊 Django Template Tags Summary"
echo "========================================="
echo "Errors: $ERROR_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ Django template tags check FAILED"
  echo ""
  echo "🔧 How to fix:"
  echo "   - Keep {{ variable }} on one line"
  echo "   - Keep {% tag %} on one line"
  echo "   - Use {% with %} for complex expressions"
  echo "   - Use custom template filters for long variable names"
  exit 1
else
  echo "✅ Django template tags check PASSED"
  exit 0
fi

