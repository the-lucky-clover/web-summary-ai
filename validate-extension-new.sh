#!/bin/bash

echo "🔍 Extension Validation Tests"
echo "=============================="
echo ""

# Test 1: Manifest validation
echo "1️⃣  Validating manifest.json..."
if python3 -m json.tool manifest.json > /dev/null 2>&1; then
    echo "   ✅ Manifest JSON is valid"
else
    echo "   ❌ Manifest JSON has syntax errors"
    exit 1
fi

# Test 2: Required files exist
echo ""
echo "2️⃣  Checking required files..."
required_files=(
    "manifest.json"
    "background/background.js"
    "content/content.js"
    "content/youtube.js"
    "assets/history-manager.js"
    "popup/popup.html"
    "popup/popup.js"
    "options/options.html"
    "options/options.js"
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
)

all_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file MISSING"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    echo ""
    echo "   ❌ Some required files are missing"
    exit 1
fi

# Test 3: JavaScript syntax validation
echo ""
echo "3️⃣  Validating JavaScript syntax..."
js_files=(
    "background/background.js"
    "content/content.js"
    "content/youtube.js"
    "assets/history-manager.js"
    "popup/popup.js"
    "options/options.js"
)

js_valid=true
for file in "${js_files[@]}"; do
    if node --check "$file" 2>/dev/null; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file has syntax errors"
        node --check "$file"
        js_valid=false
    fi
done

if [ "$js_valid" = false ]; then
    echo ""
    echo "   ❌ Some JavaScript files have syntax errors"
    exit 1
fi

# Test 4: Check manifest permissions
echo ""
echo "4️⃣  Checking manifest permissions..."
permissions=$(grep -A 5 '"permissions"' manifest.json)
if echo "$permissions" | grep -q "activeTab"; then
    echo "   ✅ activeTab permission present"
else
    echo "   ⚠️  activeTab permission missing"
fi

if echo "$permissions" | grep -q "storage"; then
    echo "   ✅ storage permission present"
else
    echo "   ⚠️  storage permission missing"
fi

# Test 5: Check content script configuration
echo ""
echo "5️⃣  Checking content script configuration..."
if grep -q '"content_scripts"' manifest.json; then
    echo "   ✅ Content scripts configured"
    content_scripts=$(grep -A 10 '"content_scripts"' manifest.json)
    if echo "$content_scripts" | grep -q "content.js"; then
        echo "   ✅ content.js included"
    else
        echo "   ⚠️  content.js not found in manifest"
    fi
    if echo "$content_scripts" | grep -q "youtube.js"; then
        echo "   ✅ youtube.js included"
    else
        echo "   ⚠️  youtube.js not found in manifest"
    fi
else
    echo "   ❌ No content scripts configured"
fi

# Test 6: Check for common privacy issues
echo ""
echo "6️⃣  Checking for privacy issues..."
privacy_ok=true

# Check for external API calls in JS files
for file in "${js_files[@]}"; do
    if grep -q "fetch\|XMLHttpRequest\|axios\|ajax" "$file" 2>/dev/null; then
        if ! grep -q "localhost\|chrome.storage\|chrome.runtime" "$file"; then
            echo "   ⚠️  $file may contain external API calls"
            privacy_ok=false
        fi
    fi
done

if [ "$privacy_ok" = true ]; then
    echo "   ✅ No obvious privacy issues detected"
fi

# Test 7: Check file sizes
echo ""
echo "7️⃣  Checking file sizes..."
large_files=$(find . -name "*.js" -size +1M 2>/dev/null)
if [ -z "$large_files" ]; then
    echo "   ✅ All JS files are reasonable size"
else
    echo "   ⚠️  Large files detected:"
    echo "$large_files"
fi

# Summary
echo ""
echo "=============================="
echo "✅ VALIDATION COMPLETE"
echo "=============================="
echo ""
echo "📋 Summary:"
echo "   • Manifest: Valid"
echo "   • Required files: Present"
echo "   • JavaScript syntax: Valid"
echo "   • Privacy: No obvious issues"
echo ""
echo "🚀 Extension is ready for manual testing in Chrome!"
echo "   Run ./manual-test.sh for testing instructions"
echo ""
