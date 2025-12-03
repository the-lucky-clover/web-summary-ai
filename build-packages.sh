#!/bin/bash

# Build Web Summary AI packages for all browsers
VERSION="1.0.0"
DIST_DIR="dist"

echo "🚀 Building Web Summary AI v${VERSION} for all browsers..."

# Create browser-specific directories
mkdir -p ${DIST_DIR}/chrome
mkdir -p ${DIST_DIR}/firefox
mkdir -p ${DIST_DIR}/edge
mkdir -p ${DIST_DIR}/safari

# Chrome/Chromium build
echo "📦 Building Chrome package..."
mkdir -p ${DIST_DIR}/chrome/build
cp -r assets background content debug demo history icons options popup *.html *.css *.js ${DIST_DIR}/chrome/build/ 2>/dev/null
cp manifest.json ${DIST_DIR}/chrome/build/
cd ${DIST_DIR}/chrome && zip -r web-summary-ai-v${VERSION}.zip build && rm -rf build && cd ../..
echo "✅ Chrome: dist/chrome/web-summary-ai-v${VERSION}.zip"

# Edge build
echo "📦 Building Edge package..."
mkdir -p ${DIST_DIR}/edge/build
cp -r assets background content debug demo history icons options popup *.html *.css *.js ${DIST_DIR}/edge/build/ 2>/dev/null
cp manifest-edge.json ${DIST_DIR}/edge/build/manifest.json
cd ${DIST_DIR}/edge && zip -r web-summary-ai-v${VERSION}.zip build && rm -rf build && cd ../..
echo "✅ Edge: dist/edge/web-summary-ai-v${VERSION}.zip"

# Firefox build
echo "📦 Building Firefox package..."
mkdir -p ${DIST_DIR}/firefox/build
cp -r assets background content debug demo history icons options popup *.html *.css *.js ${DIST_DIR}/firefox/build/ 2>/dev/null
cp manifest-firefox.json ${DIST_DIR}/firefox/build/manifest.json
cd ${DIST_DIR}/firefox && zip -r web-summary-ai-v${VERSION}.xpi build && rm -rf build && cd ../..
echo "✅ Firefox: dist/firefox/web-summary-ai-v${VERSION}.xpi"

# Safari build (copy source)
echo "📦 Preparing Safari package..."
mkdir -p ${DIST_DIR}/safari/source
cp -r safari-extension-v1.0.0/* ${DIST_DIR}/safari/source/
cd ${DIST_DIR}/safari && zip -r web-summary-ai-v${VERSION}.zip source && rm -rf source && cd ../..
echo "✅ Safari: dist/safari/web-summary-ai-v${VERSION}.zip"

echo ""
echo "✨ Build complete! Organized by browser:"
echo "  📁 dist/chrome/web-summary-ai-v${VERSION}.zip"
echo "  📁 dist/firefox/web-summary-ai-v${VERSION}.xpi"
echo "  📁 dist/edge/web-summary-ai-v${VERSION}.zip"
echo "  📁 dist/safari/web-summary-ai-v${VERSION}.zip"
