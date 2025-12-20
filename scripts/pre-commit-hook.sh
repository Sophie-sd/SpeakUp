#!/bin/bash

echo "🔍 Running pre-commit checks..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
  echo "No files staged"
  exit 0
fi

ERROR_COUNT=0

# Django templates
TEMPLATE_FILES=$(echo "$STAGED_FILES" | grep '\.html$' || echo "")
if [ -n "$TEMPLATE_FILES" ]; then
  echo "Checking templates..."
  bash scripts/check_template_tags.sh || ((ERROR_COUNT++))
fi

# CSS
CSS_FILES=$(echo "$STAGED_FILES" | grep '\.css$' | grep -v 'normalize.css' || echo "")
if [ -n "$CSS_FILES" ]; then
  echo "Checking CSS..."
  npx stylelint $CSS_FILES || ((ERROR_COUNT++))
  bash scripts/check-css-rules.sh || ((ERROR_COUNT++))
fi

# JS
JS_FILES=$(echo "$STAGED_FILES" | grep '\.js$' || echo "")
if [ -n "$JS_FILES" ]; then
  echo "Checking JS..."
  npx eslint $JS_FILES || ((ERROR_COUNT++))
  bash scripts/check-js-rules.sh || ((ERROR_COUNT++))
fi

# HTML structure
if [ -n "$TEMPLATE_FILES" ]; then
  echo "Checking HTML..."
  npx htmlhint $TEMPLATE_FILES || ((ERROR_COUNT++))
  bash scripts/check-html-rules.sh || ((ERROR_COUNT++))
fi

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ Pre-commit failed!"
  echo "Run 'npm run fix:rules' to auto-fix"
  exit 1
fi

echo "✅ All checks passed!"
exit 0

