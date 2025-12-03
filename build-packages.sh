#!/bin/bash

# Build Web Summary AI packages for all browsers
VERSION="1.0.0"
DIST_DIR="dist"

echo "🚀 Building Web Summary AI v${VERSION} for all browsers..."

# Clean dist directory
rm -rf ${DIST_DIR}
mkdir -p ${DIST_DIR}

# Chrome/Chromium build
echo "📦 Building Chrome package..."
mkdir -p ${DIST_DIR}/chrome-build
cp -r assets background content debug demo history icons options popup *.html *.css *.js ${DIST_DIR}/chrome-build/ 2>/dev/null
cp manifest.json ${DIST_DIR}/chrome-build/
cd ${DIST_DIR}/chrome-build && zip -r ../web-summary-ai-chrome-v${VERSION}.zip . && cd ../..
echo "✅ Chrome: web-summary-ai-chrome-v${VERSION}.zip"

# Edge build (same as Chrome)
echo "📦 Building Edge package..."
mkdir -p ${DIST_DIR}/edge-build
cp -r assets background content debug demo history icons options popup *.html *.css *.js ${DIST_DIR}/edge-build/ 2>/dev/null
cp manifest-edge.json ${DIST_DIR}/edge-build/manifest.json
cd ${DIST_DIR}/edge-build && zip -r ../web-summary-ai-edge-v${VERSION}.zip . && cd ../..
echo "✅ Edge: web-summary-ai-edge-v${VERSION}.zip"

# Firefox build
echo "📦 Building Firefox package..."
mkdir -p ${DIST_DIR}/firefox-build
cp -r assets background content debug demo history icons options popup *.html *.css *.js ${DIST_DIR}/firefox-build/ 2>/dev/null
cp manifest-firefox.json ${DIST_DIR}/firefox-build/manifest.json
cd ${DIST_DIR}/firefox-build && zip -r ../web-summary-ai-firefox-v${VERSION}.xpi . && cd ../..
echo "✅ Firefox: web-summary-ai-firefox-v${VERSION}.xpi"

# Safari build (copy source)
echo "📦 Preparing Safari package..."
mkdir -p ${DIST_DIR}/safari-build
cp -r safari-extension-v1.0.0/* ${DIST_DIR}/safari-build/
cd ${DIST_DIR} && zip -r web-summary-ai-safari-v${VERSION}.zip safari-build && cd ..
echo "✅ Safari: web-summary-ai-safari-v${VERSION}.zip (requires Xcode to build)"

# Clean up build directories
rm -rf ${DIST_DIR}/chrome-build ${DIST_DIR}/edge-build ${DIST_DIR}/firefox-build ${DIST_DIR}/safari-build

echo ""
echo "✨ Build complete! Packages available in ${DIST_DIR}/"
ls -lh ${DIST_DIR}/*.{zip,xpi} 2>/dev/null
