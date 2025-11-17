# AI Agent Instructions - Web Summarizer AI

## Privacy-First Architecture

This is **Web Summarizer AI** - a privacy-focused web extension that extracts content locally and generates prompts for AI services. **NEVER** add external API calls, tracking, or data collection.

### Core Principle: Local-Only Processing
- Content extraction happens entirely in the browser via `content/content.js`
- No content is sent to external servers - extension only formats prompts for manual copy/paste
- All settings stored via `chrome.storage.local` (never synced or transmitted)

## Key Components & Data Flow

### Extension Structure
```
toolset 'background' - Service worker, context menus, installation handling
toolset 'content' - Main content extraction, floating button, summary interface
toolset 'youtube' - YouTube-specific transcript extraction
toolset 'popup' - Extension popup interface and settings
toolset 'options' - Settings page configuration
toolset 'safari' - Safari variant (mirror structure)
```

### Message Passing Pattern
All components communicate via `chrome.runtime.sendMessage()` with actions:
- `'summarize'` - Extract and format page content
- `'getPageContent'` - Return raw page content object
- `'getYouTubeTranscript'` - Extract YouTube transcripts when available
- `'getVideoInfo'` - Return YouTube video metadata
- `'summarizeVideo'` - Generate video-specific summary prompts
- `'openPanel'` - Display summary interface

## Development Guidelines

### Content Extraction Logic
The `extractPageContent()` method in `content/content.js` uses this priority selector system:
```javascript
const contentSelectors = [
  'article', 'main', '[role="main"]', '.content', '.post-content',
  '.entry-content', '.article-content', '#content', '.main-content'
];
```
**Pattern**: Loop through selectors, validate content length > 200 chars, fallback to `document.body`. Always clean whitespace and limit to 10KB max.

### YouTube Integration Deep Dive
`content/youtube.js` handles YouTube's SPA navigation:
- `observeVideoChanges()` monitors URL changes and DOM mutations
- `extractTranscript()` clicks transcript button and scrapes segments with timestamps
- `extractVideoInfo()` pulls title, channel, description, duration, views from DOM selectors
- `waitForElement()` helper provides async DOM element waiting with timeout

**Critical YouTube Selectors**:
```javascript
'h1.ytd-watch-metadata yt-formatted-string'  // video title
'#channel-name #container #text-container yt-formatted-string a'  // channel
'ytd-transcript-segment-renderer'  // transcript segments
```

### Settings Management Architecture
Settings handled by `options/options.js` with full settings object:
```javascript
defaultSettings = {
  summaryLength: 'medium',     // short/medium/detailed
  language: 'auto',            // language codes or 'auto'
  showFloatingButton: true,    // floating action button
  contextMenu: true,           // right-click menu
  youtubeButton: true,         // YouTube-specific buttons
  autoTranscript: true         // auto-extract transcripts
};
```

### Chrome Extension Manifest V3 Patterns
- **Service Worker**: `background/background.js` handles installation, context menus, tab updates
- **Content Scripts**: Separate for general web (`content.js`) and YouTube (`youtube.js`)
- **Host Permissions**: Minimal - only `*://*.youtube.com/*` for transcript access
- **Web Accessible Resources**: Only `assets/*` and `content/summarize-panel.html`

## Safari Extension Variant

The `safari-extension-v1.0.0/` directory contains a Safari version with identical structure but different manifest format. When working on features:
- **Always update both Chrome and Safari versions**
- Safari uses different permission models - check manifest differences
- Test Safari-specific APIs if modifying extension core functionality

### Safari Deployment Architecture
Safari Web Extensions require a native macOS/iOS app wrapper for App Store distribution:
- **macOS**: Xcode project with Safari Web Extension target
- **iOS/iPadOS**: Universal binary supporting both platforms
- **Distribution**: App Store only (no sideloading like Chrome)
- **Testing**: Use Safari Technology Preview and iOS Simulator

### Safari-Specific Development Patterns
```javascript
// Safari compatibility detection
if (navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")) {
  // Safari-specific handling
}

// Background script differences in Safari
// Use safari.extension namespace for some APIs
if (typeof safari !== 'undefined') {
  // Safari Web Extension API
} else {
  // Standard WebExtension API
}
```

## Testing & Development Workflows

### Load Extension for Development
```bash
# Chrome/Edge Development
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select project root

# Safari macOS Development
# 1. Create Xcode project with Safari Web Extension target
# 2. Build and run from Xcode (⌘+R)
# 3. Safari → Develop → Allow Unsigned Extensions
# 4. Safari → Preferences → Extensions → Enable extension

# Safari iOS Development (requires macOS + Xcode)
# 1. Connect iPhone/iPad via USB or use iOS Simulator
# 2. Build and run iOS target to device (⌘+R)  
# 3. On device: Settings → Safari → Extensions → Enable extension
# 4. Debug via Safari on Mac → Develop → [Device Name]
```

### Automated Privacy Testing
```bash
node test-extension.js
# Launches Puppeteer with extension loaded
# Serves test page at http://localhost:3000/test-page
# Monitors ALL network requests - should only see localhost and user-initiated
# Verifies floating button injection and no external calls
```

### Manual Privacy Verification Checklist
1. **DevTools Network Tab**: No requests to external domains during extension use
2. **Storage Tab**: Only `chrome.storage.local` entries, no cookies/indexedDB
3. **Console**: No error messages about blocked requests or CORS issues
4. **Extension API Usage**: Verify only `activeTab` and `storage` permissions used

### Debugging Workflows
```bash
# Debug content scripts
console.log() messages appear in page console, not extension console

# Debug background script
Open chrome://extensions/ → Details → Inspect views: background page

# Debug popup
Right-click extension icon → Inspect popup

# YouTube debugging
Enable console.log in youtube.js, check for transcript extraction errors
```

## Code Patterns & Conventions

### Async Message Response Pattern
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  this.handleMessage(request, sender, sendResponse);
  return true; // CRITICAL: Keep message channel open for async responses
});
```

### Content Validation with Privacy Focus
```javascript
// Always validate before processing
if (!pageContent.content || pageContent.content.length < 100) {
  throw new Error('Insufficient content to summarize');
}

// Limit content to prevent resource abuse
const maxLength = 10000;
if (content.length > maxLength) {
  content = content.substring(0, maxLength) + '...';
}
```

### DOM Element Safety Pattern
```javascript
// Remove existing elements before creating new ones
const existingBtn = document.getElementById('youtube-summary-btn');
if (existingBtn) existingBtn.remove();

// High z-index for UI elements to avoid conflicts
floatingBtn.style.zIndex = '10000';
```

### YouTube SPA Navigation Handling
```javascript
// Monitor both URL changes and DOM mutations
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    this.onVideoChange(this.getVideoId());
  }
}).observe(document, { subtree: true, childList: true });
```

## Advanced Integration Points

### Floating Button Lifecycle
- Created in `addFloatingButton()` with gradient styling
- Removed/recreated on navigation to prevent stale references  
- Uses CSS `position: fixed` with `bottom: 20px; right: 20px`
- Hover effects via inline event listeners (not CSS to avoid CSP issues)

### Cross-Platform Considerations
- **Chrome**: Uses Manifest V3 service worker pattern
- **Safari**: May need different manifest structure in safari-extension-v1.0.0/
- **Settings sync**: Always use `chrome.storage.local`, never `chrome.storage.sync`

## Critical Don'ts

- **Never add external API integrations** - users must copy prompts manually to maintain privacy
- **Never implement automatic data transmission** - all processing must be local-only
- **Never add tracking/analytics** - violates core privacy promise
- **Never modify minimal permissions** in `manifest.json` - keep `activeTab` and `storage` only
- **Never store sensitive data** - only store user preferences locally
- **Never use `chrome.storage.sync`** - data must never leave user's device
- **Never add dependencies** - keep extension self-contained for security audit

## Key Files for Deep Understanding
- `README.md` - Complete project vision and privacy promises
- `PRIVACY.md` - Privacy policy and data handling commitments  
- `manifest.json` - Extension permissions and architecture constraints
- `content/content.js` - Core content extraction with selector priority system
- `content/youtube.js` - SPA navigation handling and transcript extraction
- `test-extension.js` - Automated privacy verification and security testing
- `options/options.js` - Complete settings management architecture
