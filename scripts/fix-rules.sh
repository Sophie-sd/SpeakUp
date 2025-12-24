#!/bin/bash
set -e

echo "========================================="
echo "🔧 Automatic Fixes"
echo "========================================="

FIXED=0

# Fix 1: видалити inline styles
echo ""
echo "🎨 [Fix 1] Removing inline styles..."
HTML_FILES=$(find templates -name "*.html" 2>/dev/null || echo "")
if [ -n "$HTML_FILES" ]; then
  BEFORE=$(echo "$HTML_FILES" | xargs grep -c 'style="' | grep -v ':0$' | wc -l)
  echo "$HTML_FILES" | xargs sed -i.bak 's/ style="[^"]*"//g'
  AFTER=$(echo "$HTML_FILES" | xargs grep -c 'style="' | grep -v ':0$' | wc -l || echo "0")
  REMOVED=$((BEFORE - AFTER))
  if [ $REMOVED -gt 0 ]; then
    echo "✅ Removed $REMOVED inline styles"
    ((FIXED++))
  fi
fi

# Fix 2: додати inputmode="tel"
echo ""
echo "📞 [Fix 2] Adding inputmode..."
if [ -n "$HTML_FILES" ]; then
  echo "$HTML_FILES" | xargs sed -i.bak 's/<input type="tel"/<input type="tel" inputmode="tel"/g'
  echo "✅ Added inputmode"
  ((FIXED++))
fi

# Fix 3: flex: 1; → flex: 1 0 0;
echo ""
echo "📦 [Fix 3] Fixing flex..."
CSS_FILES=$(find static/css -name "*.css" ! -name "normalize.css" 2>/dev/null || echo "")
if [ -n "$CSS_FILES" ]; then
  echo "$CSS_FILES" | xargs sed -i.bak 's/flex: 1;/flex: 1 0 0;/g'
  echo "✅ Fixed flex"
  ((FIXED++))
fi

# Видалити .bak
find . -name "*.bak" -delete

echo ""
echo "========================================="
echo "📊 Summary"
echo "========================================="
echo "Fixes applied: $FIXED"
echo "✅ Auto-fix complete"





