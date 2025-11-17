# Installation Guide

This guide covers how to install and use the Web Summarizer AI extension.

## 🚀 Quick Installation (From Source)

### Method 1: Direct Installation (Recommended)

1. **Download the Extension**
   - Download the ZIP file from the GitHub releases page
   - OR clone the repository: `git clone https://github.com/user/web-summary-ai.git`

2. **Extract Files** (if using ZIP)
   - Extract the ZIP file to a folder on your computer
   - Remember the folder location

3. **Load in Chrome/Edge**
   - Open Chrome and go to `chrome://extensions/`
   - OR open Edge and go to `edge://extensions/`
   - Enable "Developer mode" using the toggle in the top right
   - Click "Load unpacked" button
   - Select the extracted extension folder
   - The extension will appear in your extensions list

4. **Verify Installation**
   - Look for the extension icon in your browser toolbar
   - Click the icon to open the popup
   - Visit any webpage and test the summarization feature

### Method 2: Build from Source

1. **Prerequisites**
   - Git installed on your computer
   - Basic command line knowledge

2. **Clone and Build**
   ```bash
   # Clone the repository
   git clone https://github.com/user/web-summary-ai.git
   cd web-summary-ai
   
   # Optional: Create a ZIP package
   npm run package
   ```

3. **Install** 
   - Follow steps 3-4 from Method 1 above

## 🔧 Configuration

### First-Time Setup

1. **Open Extension Settings**
   - Click the extension icon in your toolbar
   - Click "Settings" in the popup
   - OR right-click the extension icon → "Options"

2. **Configure Preferences**
   - **Summary Length**: Choose default length (short/medium/detailed)
   - **Language**: Select your preferred language
   - **Interface**: Enable/disable floating button and context menu
   - **YouTube**: Configure video summarization options

3. **Save Settings**
   - Settings are automatically saved as you change them
   - All settings are stored locally on your device

### Permissions Setup

The extension requests minimal permissions:

- ✅ **activeTab**: Access current page content when you use the extension
- ✅ **storage**: Save your preferences locally
- ✅ **YouTube hosts**: Extract transcripts from YouTube videos (optional)

**No additional permissions are needed or requested.**

## 📱 How to Use

### Basic Usage

1. **Navigate to Any Webpage**
   - Open any article, blog post, or webpage you want to summarize

2. **Activate Summarization**
   - **Method 1**: Click the extension icon in your toolbar
   - **Method 2**: Click the floating action button (if enabled)
   - **Method 3**: Right-click → "Summarize this page" (if enabled)

3. **Copy the Generated Prompt**
   - The extension will generate a formatted prompt
   - Click "Copy Prompt" to copy it to your clipboard

4. **Use with Your Preferred AI Service**
   - Open ChatGPT, Claude, Gemini, or any AI service
   - Paste the prompt and get your summary

### YouTube Videos

1. **Visit a YouTube Video**
   - Go to any YouTube video page (`youtube.com/watch?v=...`)

2. **Summarize the Video**
   - Click the "Summarize Video" button that appears
   - OR use the extension icon/floating button

3. **Transcript Extraction**
   - The extension will attempt to extract the video transcript
   - If transcript is unavailable, it will use the video description
   - Copy the generated prompt for use with AI services

### Advanced Features

#### Floating Action Button
- Enable in settings for quick access on any page
- Appears as a small icon in the bottom-right corner
- Click to instantly open the summarization panel

#### Context Menu Integration
- Right-click on any page to access summarization options
- "Summarize this page" for full page summarization
- "Summarize selected text" for highlighted content

#### Custom Summary Lengths
- **Short**: 2-3 sentence overview
- **Medium**: 1-2 paragraph comprehensive summary  
- **Detailed**: Full analysis with key points and details

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Extension Not Loading
**Problem**: Extension doesn't appear after installation
**Solutions**:
- Ensure Developer mode is enabled in `chrome://extensions/`
- Try refreshing the extensions page
- Check that you selected the correct folder (with manifest.json)
- Restart your browser

#### Summarization Not Working
**Problem**: Nothing happens when clicking summarize
**Solutions**:
- Refresh the webpage and try again
- Check that the page has sufficient text content
- Ensure you're not on a restricted page (chrome://, file://, etc.)
- Open browser console (F12) to check for error messages

#### Floating Button Not Showing
**Problem**: Floating action button doesn't appear
**Solutions**:
- Check that it's enabled in extension settings
- Try refreshing the page
- Some websites may hide it due to CSS conflicts
- Use the extension icon or context menu instead

#### YouTube Integration Issues
**Problem**: Video transcript not extracting
**Solutions**:
- Ensure the video has captions/transcript available
- Try manually enabling captions on the video
- Some videos don't have transcripts - the extension will use the description instead
- Check YouTube's transcript feature manually to verify availability

#### Settings Not Saving
**Problem**: Preferences reset after browser restart
**Solutions**:
- Ensure the extension has storage permission
- Check Chrome's storage settings aren't clearing extension data
- Try reinstalling the extension
- Check if you're in incognito mode (extensions may behave differently)

### Browser-Specific Issues

#### Chrome Issues
- Ensure you're using Chrome version 88 or later (Manifest V3 support)
- Check that extensions aren't disabled in Chrome settings
- Try disabling other extensions to check for conflicts

#### Edge Issues
- Ensure you're using Edge version 88 or later
- Enable "Allow extensions from other stores" if needed
- Check Edge's extension management settings

### Getting Help

If you continue to experience issues:

1. **Check the GitHub Issues**: https://github.com/user/web-summary-ai/issues
2. **Create a New Issue**: Include browser version, extension version, and error details
3. **Community Support**: Use GitHub Discussions for questions

## 🔒 Privacy and Security

### What The Extension Accesses
- **Page Content**: Only when you explicitly request summarization
- **Local Storage**: For saving your preferences
- **YouTube Data**: Only transcript data from videos you choose to summarize

### What The Extension Never Does
- ❌ Collects or stores your browsing history
- ❌ Sends data to external servers (except AI services you choose)
- ❌ Tracks your usage or behavior
- ❌ Uses analytics or metrics
- ❌ Stores or caches web content

### Security Best Practices
- Only install from official sources (GitHub releases)
- Review the source code if desired (it's fully open source)
- Keep the extension updated for latest security improvements
- Report any security concerns through GitHub issues

## 🚀 Performance Tips

### Optimal Usage
- **Content Length**: Works best with articles over 200 characters
- **Page Loading**: Wait for pages to fully load before summarizing
- **Memory Usage**: Extension uses minimal memory and CPU
- **Battery Impact**: No background processing means minimal battery usage

### Website Compatibility
The extension works well with:
- ✅ News sites (BBC, CNN, Reuters, etc.)
- ✅ Blog platforms (Medium, WordPress, etc.)
- ✅ Documentation sites (MDN, Stack Overflow, etc.)
- ✅ Academic papers and articles
- ✅ YouTube videos with transcripts
- ✅ E-commerce product pages

May have limited functionality on:
- ⚠️ Single-page applications with dynamic content
- ⚠️ Sites with heavy JavaScript rendering
- ⚠️ Pages with paywalls or login requirements
- ❌ Chrome internal pages (chrome://, extensions://, etc.)

## 📋 Uninstallation

### How to Remove the Extension

1. **Open Extensions Page**
   - Go to `chrome://extensions/` or `edge://extensions/`

2. **Remove Extension**
   - Find "Web Summarizer AI"
   - Click "Remove" button
   - Confirm removal in the popup

3. **Clean Up** (Optional)
   - Delete the extension folder from your computer
   - Your settings are automatically removed with the extension

### Data Cleanup
When you uninstall the extension:
- ✅ All local settings are automatically deleted
- ✅ No data remains on your device
- ✅ No external data to clean up (we don't store anything externally)

---

## 🤝 Support and Feedback

### Getting Support
- 📖 **Documentation**: This guide and the README
- 🐛 **Bug Reports**: GitHub Issues
- 💭 **Feature Requests**: GitHub Discussions
- 🔒 **Security Issues**: Email [security@example.com]

### Providing Feedback
We welcome feedback on:
- User experience and interface improvements
- Website compatibility issues
- Performance suggestions
- Feature requests that maintain our privacy principles

**Thank you for choosing a privacy-focused solution!** 🔒