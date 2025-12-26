#!/bin/bash
set -e

echo "========================================="
echo "⚡ JavaScript Custom Rules Check"
echo "========================================="

ERROR_COUNT=0
WARNING_COUNT=0

JS_FILES=$(find static/js -name "*.js" 2>/dev/null || echo "")

if [ -z "$JS_FILES" ]; then
  echo "⚠️  No JS files"
  exit 0
fi

# Правило 1: var
echo ""
echo "🚫 [Rule 1] Checking for var..."
VAR_USAGE=$(echo "$JS_FILES" | xargs grep -nE '\bvar\s+' || echo "")
if [ -n "$VAR_USAGE" ]; then
  echo "❌ 'var' found:"
  echo "$VAR_USAGE"
  ((ERROR_COUNT++))
else
  echo "✅ No 'var'"
fi

# Правило 2: pageshow
echo ""
echo "🔄 [Rule 2] Checking pageshow event..."
PAGESHOW=$(echo "$JS_FILES" | xargs grep -c "pageshow" | grep -v ':0$' || echo "")
if [ -z "$PAGESHOW" ]; then
  echo "⚠️  No 'pageshow' listener"
  ((WARNING_COUNT++))
else
  echo "✅ pageshow found"
fi

# Правило 3: strict mode
echo ""
echo "🔒 [Rule 3] Checking strict mode..."
STRICT=$(echo "$JS_FILES" | xargs grep -c "'use strict'" | grep -v ':0$' || echo "")
IIFE=$(echo "$JS_FILES" | xargs grep -c '(function()' | grep -v ':0$' || echo "")

if [ -z "$STRICT" ] && [ -z "$IIFE" ]; then
  echo "⚠️  No 'use strict' or IIFE"
  ((WARNING_COUNT++))
else
  echo "✅ Strict mode or IIFE"
fi

# Правило 4: eval
echo ""
echo "🚨 [Rule 4] Checking eval()..."
EVAL=$(echo "$JS_FILES" | xargs grep -nE '\beval\s*\(' || echo "")
if [ -n "$EVAL" ]; then
  echo "❌ eval() found:"
  echo "$EVAL"
  ((ERROR_COUNT++))
else
  echo "✅ No eval()"
fi

# Правило 5: HTMX
echo ""
echo "🔗 [Rule 5] Checking HTMX integration..."
HTMX_INT=$(echo "$JS_FILES" | xargs grep -cE 'htmx:(afterSwap|configRequest|responseError|sendError)' | grep -v ':0$' || echo "")
if [ -n "$HTMX_INT" ]; then
  echo "✅ HTMX integration found"
else
  echo "ℹ️  No HTMX integration"
fi

echo ""
echo "========================================="
echo "📊 JS Summary"
echo "========================================="
echo "Errors: $ERROR_COUNT"
echo "Warnings: $WARNING_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ JS check FAILED"
  exit 1
else
  echo "✅ JS check PASSED"
  exit 0
fi







