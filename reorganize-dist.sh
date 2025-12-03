#!/bin/bash

echo "🗂️  Reorganizing distribution into browser-specific folders..."

# Remove old flat structure
rm -rf dist/web-summary-ai-*.zip dist/web-summary-ai-*.xpi dist/README.md 2>/dev/null

# Create browser folders
mkdir -p dist/chrome
mkdir -p dist/firefox
mkdir -p dist/edge
mkdir -p dist/safari

echo "✅ Folders created"
