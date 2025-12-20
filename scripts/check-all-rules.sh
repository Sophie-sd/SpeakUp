#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║   🚀 FULL PROJECT HEALTH CHECK        ║"
echo "╔════════════════════════════════════════╗"
echo ""

TOTAL_ERRORS=0

# 1. Django Template Tags
if [ -f "scripts/check_template_tags.sh" ]; then
  bash scripts/check_template_tags.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 2. HTML
if [ -f "scripts/check-html-rules.sh" ]; then
  bash scripts/check-html-rules.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 3. CSS
if [ -f "scripts/check-css-rules.sh" ]; then
  bash scripts/check-css-rules.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 4. JS
if [ -f "scripts/check-js-rules.sh" ]; then
  bash scripts/check-js-rules.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 5. Stylelint
if command -v npm &> /dev/null && [ -f "package.json" ]; then
  echo "========================================="
  echo "🎨 Running Stylelint..."
  echo "========================================="
  npm run lint:css || ((TOTAL_ERRORS++))
  echo ""
fi

# 6. ESLint
if command -v npm &> /dev/null && [ -f "package.json" ]; then
  echo "========================================="
  echo "⚡ Running ESLint..."
  echo "========================================="
  npm run lint:js || ((TOTAL_ERRORS++))
  echo ""
fi

# 7. HTMLHint
if command -v npm &> /dev/null && [ -f "package.json" ]; then
  echo "========================================="
  echo "📝 Running HTMLHint..."
  echo "========================================="
  npm run lint:html || ((TOTAL_ERRORS++))
  echo ""
fi

echo "╔════════════════════════════════════════╗"
echo "║   📊 FINAL SUMMARY                     ║"
echo "╔════════════════════════════════════════╗"
echo "Failed checks: $TOTAL_ERRORS"
echo ""

if [ $TOTAL_ERRORS -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED! 🎉"
  exit 0
else
  echo "❌ SOME CHECKS FAILED"
  echo "Run 'npm run fix:rules' to auto-fix"
  exit 1
fi

