#!/bin/bash

# Web Summarizer AI Safari Extension - Debug Session Launcher
# This script sets up a comprehensive debugging environment

echo "🚀 Starting Web Summarizer AI Safari Extension Debug Session"
echo "============================================================="

# Check if we're in the right directory
if [ ! -f "manifest-apple.json" ]; then
    echo "❌ Error: manifest-apple.json not found. Please run from the safari-extension directory."
    exit 1
fi

# Create debug directory if it doesn't exist
mkdir -p debug

# Set up debug environment
echo "📋 Setting up debug environment..."

# Check Safari extension files
echo "🔍 Checking Safari extension files..."
FILES=(
    "manifest-apple.json"
    "popup-apple.html"
    "popup-apple.css" 
    "popup-apple.js"
    "content-ios.css"
    "content-ios.js"
    "options-apple.html"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file found"
    else
        echo "  ❌ $file missing"
    fi
done

# Start debug console
echo "🖥️  Starting debug console..."
if [ -f "debug/debug-console.html" ]; then
    echo "  📱 Debug console available at: file://$(pwd)/debug/debug-console.html"
else
    echo "  ❌ Debug console not found"
fi

# Safari extension debugging instructions
echo ""
echo "🧪 Safari Extension Debugging Instructions:"
echo "==========================================="
echo ""
echo "1. Open Safari and go to Safari > Preferences > Advanced"
echo "   ✓ Enable 'Show Develop menu in menu bar'"
echo ""
echo "2. Go to Develop > Allow Unsigned Extensions"
echo ""
echo "3. Load the extension:"
echo "   • Go to Safari > Preferences > Extensions"
echo "   • Click the '+' button to add extension"
echo "   • Navigate to: $(pwd)"
echo "   • Select the safari-extension folder"
echo ""
echo "4. Open the debug console:"
echo "   • Open: file://$(pwd)/debug/debug-console.html"
echo "   • Or use Safari's Web Inspector on extension pages"
echo ""
echo "5. Test extension components:"
echo "   • Popup: Right-click extension icon > Inspect Popup"
echo "   • Content Script: Right-click webpage > Inspect Element > Console"
echo "   • Background: Safari > Develop > Web Extension Background Pages"
echo ""

# Expression examples
echo "💡 Debug Expression Examples:"
echo "============================="
echo ""
echo "Basic Safari Extension API:"
echo "  safari.extension.baseURI"
echo "  safari.extension.displayVersion"
echo ""
echo "Browser API Testing:"
echo "  browser.tabs.query({active: true})"
echo "  browser.storage.sync.get(['apiKey'])"
echo "  browser.runtime.sendMessage({action: 'test'})"
echo ""
echo "Content Script Communication:"
echo "  browser.tabs.sendMessage(tabId, {action: 'summarize'})"
echo ""
echo "Apple Design Testing:"
echo "  document.querySelector('.apple-button').click()"
echo "  window.matchMedia('(prefers-color-scheme: dark)').matches"
echo ""
echo "iOS Features:"
echo "  navigator.userAgent.includes('Mobile')"
echo "  window.DeviceMotionEvent !== undefined"
echo ""

# Performance testing
echo "⚡ Performance Testing Commands:"
echo "==============================="
echo ""
echo "  performance.mark('start')"
echo "  // ... run code to test ..."
echo "  performance.mark('end')"
echo "  performance.measure('test', 'start', 'end')"
echo "  performance.getEntriesByName('test')[0].duration"
echo ""

# Debugging tips
echo "🔧 Debugging Tips:"
echo "=================="
echo ""
echo "• Use console.log() extensively in extension scripts"
echo "• Check Safari's Error Console (Develop > Show Error Console)"
echo "• Use breakpoints in Safari Web Inspector"
echo "• Monitor network requests in Network tab"
echo "• Inspect storage in Storage tab of Web Inspector"
echo "• Test on both macOS and iOS Safari"
echo "• Verify Apple design guidelines compliance"
echo ""

# Common issues
echo "🚨 Common Issues & Solutions:"
echo "============================"
echo ""
echo "1. Extension not loading:"
echo "   → Check manifest-apple.json syntax"
echo "   → Verify file paths are correct"
echo "   → Enable unsigned extensions in Safari"
echo ""
echo "2. Content script not injecting:"
echo "   → Check matches patterns in manifest"
echo "   → Verify permissions are granted"
echo "   → Test on allowed domains"
echo ""
echo "3. Popup not showing:"
echo "   → Check popup HTML/CSS/JS for errors"
echo "   → Verify popup dimensions"
echo "   → Test popup path in manifest"
echo ""
echo "4. Storage not working:"
echo "   → Check storage permissions"
echo "   → Verify API calls are correct"
echo "   → Test with Web Inspector"
echo ""

# Quick test commands
echo "⚡ Quick Test Commands:"
echo "======================"
echo ""
echo "Test popup functionality:"
echo "  open -a Safari 'file://$(pwd)/popup-apple.html'"
echo ""
echo "Test options page:"
echo "  open -a Safari 'file://$(pwd)/options-apple.html'"
echo ""
echo "Validate manifest:"
echo "  python3 -m json.tool manifest-apple.json"
echo ""
echo "Check file sizes:"
echo "  ls -lah *.html *.css *.js"
echo ""

# Start monitoring
echo "📊 Starting file monitoring (Ctrl+C to stop)..."
echo "Watching for changes in extension files..."

# Use fswatch if available, otherwise use basic monitoring
if command -v fswatch >/dev/null 2>&1; then
    fswatch -o . | while read f; do
        echo "🔄 Files changed - $(date '+%H:%M:%S')"
    done
else
    echo "💡 Install fswatch for automatic file monitoring: brew install fswatch"
    echo "📝 Monitoring manually - press Enter to check for changes, Ctrl+C to exit"
    while true; do
        read -p ""
        echo "🔄 Manual check - $(date '+%H:%M:%S')"
        ls -la *.html *.css *.js 2>/dev/null | head -10
    done
fi