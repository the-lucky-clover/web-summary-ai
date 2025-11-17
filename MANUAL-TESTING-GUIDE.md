# 🎮 Web Summary AI - Manual Testing Guide

## Quick Start Testing

### Step 1: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `web-summary-ai` directory
5. The extension should appear with the Web Summary AI icon

### Step 2: Verify Installation

Check that you see:
- ✅ Extension icon in Chrome toolbar
- ✅ Version 1.0.0
- ✅ No errors in the extension card
- ✅ "Manifest Version: 3" displayed

### Step 3: Test on a Web Page

1. Navigate to any article or blog post (try: https://en.wikipedia.org/wiki/Artificial_intelligence)
2. Look for the **Σ floating button** in the bottom-right corner
3. The button should appear with retro styling and animations
4. Click the floating button to open the summary panel

### Step 4: Test Summary Generation

1. Click the **"Generate Summary"** button in the panel
2. A formatted prompt should appear that you can copy
3. The prompt should include:
   - Page title
   - Page URL
   - Extracted content
   - Summarization instructions

### Step 5: Test YouTube Integration

1. Navigate to any YouTube video with transcripts/captions
2. The floating button should appear
3. Click to generate a summary
4. The prompt should include the video transcript

### Step 6: Test Extension Popup

1. Click the Web Summary AI icon in the Chrome toolbar
2. The popup should open with retro styling
3. You should see:
   - Current page information
   - Quick action buttons
   - Recent history
   - Settings link

### Step 7: Test Options Page

1. Right-click the extension icon → **Options**
2. OR click **Settings** from the popup
3. Test the following settings:
   - Theme Mode (Light/Dark/System/Custom)
   - Button Style (Floating/Fixed Bottom Bar/Top Bar)
   - Color customization
   - Summary length preferences
   - Language settings

### Step 8: Test Theme Switching

1. Go to Options page
2. Switch between Light/Dark/System themes
3. Changes should apply immediately to:
   - Options page
   - Popup
   - Floating button on content pages
   - Summary panel

### Step 9: Test on Different Sites

Test the extension on various site types:
- ✅ News articles (CNN, BBC, NYTimes)
- ✅ Blog posts (Medium, personal blogs)
- ✅ Documentation sites (MDN, GitHub docs)
- ✅ Wikipedia articles
- ✅ YouTube videos
- ✅ Academic papers (arXiv)

### Step 10: Check Console for Errors

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for:
   - ❌ Any red errors
   - ✅ "Web Summary AI - Content script loaded" message
   - ✅ No network errors or blocked requests

## Common Issues & Solutions

### Issue: Floating Button Not Appearing

**Solutions:**
1. Check that "Show Floating Button" is enabled in Options
2. Reload the page (Ctrl/Cmd + R)
3. Check browser console for JavaScript errors
4. Verify the extension is enabled in `chrome://extensions/`

### Issue: Summary Panel Won't Open

**Solutions:**
1. Check browser console for errors
2. Try reloading the extension:
   - Go to `chrome://extensions/`
   - Click the refresh icon on Web Summary AI
3. Reload the web page

### Issue: YouTube Transcripts Not Working

**Solutions:**
1. Ensure the video has captions/transcripts available
2. Check that host permissions are granted for YouTube
3. Try a different video

### Issue: Theme Not Changing

**Solutions:**
1. Hard reload the options page (Ctrl+Shift+R)
2. Check that changes are being saved (look for success message)
3. Try switching to a different theme first, then back

## Debug Mode Testing

### Enable Verbose Logging

1. Open `chrome://extensions/`
2. Click **Details** on Web Summary AI
3. Click **Inspect views: background page**
4. In the console, run:
   ```javascript
   chrome.storage.local.set({debugMode: true})
   ```

### View Background Script Logs

1. Go to `chrome://extensions/`
2. Click **Inspect views: background page**
3. Monitor console for messages

### View Content Script Logs

1. Open any web page
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for messages starting with "Web Summary AI"

## Performance Testing

### Check Memory Usage

1. Open Chrome Task Manager (Shift+Esc)
2. Find "Extension: Web Summary AI"
3. Memory usage should be < 50MB
4. CPU should be near 0% when idle

### Check Network Activity

1. Open DevTools → Network tab
2. Load a page with the extension active
3. Verify:
   - ✅ No unexpected external requests
   - ✅ No analytics or tracking calls
   - ✅ Only legitimate page resources

## Privacy Verification

### Verify No External Calls

1. Open DevTools → Network tab
2. Click the floating button
3. Generate a summary
4. Check that NO requests are made to:
   - ❌ Analytics services (Google Analytics, etc.)
   - ❌ AI APIs (OpenAI, Anthropic, Google, etc.)
   - ❌ Tracking services
   - ✅ All processing should be local only

### Check Storage

1. Open DevTools → Application tab
2. Go to Storage → Local Storage
3. Find the extension's storage
4. Verify:
   - ✅ Only settings and history are stored
   - ✅ No personal identifiable information
   - ✅ No tracking IDs

## Safari Extension Testing

The Safari variant is in `/safari-extension-v1.0.0/`. To test:

1. Open Xcode
2. Create new "Safari Extension" project
3. Copy files from safari-extension-v1.0.0
4. Build and run in Safari
5. Follow same testing steps as Chrome

## Automated Testing

Run the included test scripts:

```bash
# Run all tests
bash run-all-tests.sh

# Run individual tests
node test-extension.js
node test-youtube.js
node test-ai-integration.js
node test-custom-prompts.js
```

## Test Checklist

- [ ] Extension loads without errors
- [ ] Floating button appears on web pages
- [ ] Button animations work smoothly
- [ ] Summary panel opens when button clicked
- [ ] Content is extracted correctly
- [ ] Generated prompts are well-formatted
- [ ] YouTube transcripts are captured
- [ ] Popup opens and displays correctly
- [ ] Options page opens and saves settings
- [ ] Theme switching works (Light/Dark/System/Custom)
- [ ] Button style switching works
- [ ] Color customization applies correctly
- [ ] No console errors
- [ ] No external network requests
- [ ] History is saved and displayed
- [ ] Extension works on various websites
- [ ] Performance is acceptable
- [ ] Privacy is maintained

## Reporting Issues

When reporting issues, please include:

1. Chrome version
2. Extension version
3. Steps to reproduce
4. Expected behavior
5. Actual behavior
6. Console errors (if any)
7. Screenshots (if applicable)

## Next Steps

After testing, consider:

1. Testing on multiple browsers (Chrome, Edge, Brave)
2. Testing on different operating systems
3. Testing with various screen sizes
4. Performance profiling for optimization
5. Accessibility testing with screen readers
6. Preparing for Chrome Web Store submission

---

**Need help?** Check the README.md or open an issue on GitHub.
