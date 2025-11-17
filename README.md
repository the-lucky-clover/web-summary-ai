# Web Summarizer AI - Smart Reader & YouTube Tool

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)
![No Data Collection](https://img.shields.io/badge/Privacy-No%20Data%20Collection-brightgreen.svg)

A privacy-focused, open-source Chrome extension for summarizing web content and YouTube videos using AI services like ChatGPT, without any data collection, tracking, or analytics.

## 🔒 Privacy First

This extension was created as a **clean, privacy-respecting alternative** to existing summarization extensions that often include:
- ❌ User tracking and analytics
- ❌ Data collection and storage
- ❌ External API calls without consent
- ❌ Bloated features and permissions

**Our approach:**
- ✅ **Zero data collection** - No personal information is gathered
- ✅ **Local processing** - All content analysis happens in your browser
- ✅ **No analytics** - No tracking pixels, metrics, or telemetry
- ✅ **Minimal permissions** - Only essential permissions requested
- ✅ **Open source** - Full transparency with reviewable code
- ✅ **No external dependencies** - No third-party libraries that could compromise privacy

## ✨ Features

### Core Functionality
- 📄 **Web Page Summarization** - Extract and format content from any webpage
- 📺 **YouTube Integration** - Automatic transcript extraction and video summarization
- 🎯 **Smart Content Detection** - Automatically identifies main content areas
- 🌍 **Multi-language Support** - Works with content in multiple languages
- ⚡ **Quick Access** - Floating action button and context menu integration

### Customization Options
- 📏 **Summary Lengths** - Short, medium, or detailed summaries
- 🗣️ **Language Selection** - Choose output language for summaries
- 🎨 **Dark/Light Mode** - Automatic theme detection
- ⚙️ **Flexible Settings** - Customize behavior to your preferences

### Privacy & Security
- 🔒 **No Data Collection** - Your content never leaves your device
- 🚫 **No Tracking** - No analytics, cookies, or user profiling
- 💾 **Local Storage Only** - Settings stored locally on your device
- 🌐 **No External Calls** - No unauthorized network requests

## 🚀 Installation

### From Source (Recommended)
1. **Download the extension:**
   ```bash
   git clone https://github.com/user/web-summary-ai.git
   # OR download the ZIP file and extract it
   ```

2. **Load in Chrome/Edge:**
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the extension folder

3. **Start using:**
   - Visit any webpage
   - Click the extension icon or use the floating button
   - Copy the generated prompt to your preferred AI service

### From Chrome Web Store
*Coming soon - submission pending*

## 🎯 How It Works

This extension **does not include AI processing**. Instead, it:

1. **Extracts Content** - Intelligently identifies and extracts main content from web pages
2. **Formats Prompts** - Creates optimized prompts for AI services
3. **Provides Interface** - Offers easy copying to ChatGPT, Claude, Gemini, or other AI services
4. **Maintains Privacy** - All processing happens locally in your browser

### Supported Content Types
- 📰 **News Articles** - Automatic article detection and extraction
- 📝 **Blog Posts** - Clean content extraction from blogs
- 📖 **Documentation** - Technical docs and guides
- 🎥 **YouTube Videos** - Transcript extraction when available
- 📄 **General Web Pages** - Any text-based content

### Compatible AI Services
- 🤖 **ChatGPT** (OpenAI)
- 🧠 **Claude** (Anthropic) 
- ✨ **Gemini** (Google)
- 🦎 **Grok** (xAI)
- 🔍 **Perplexity**
- 🧬 **DeepSeek**
- *Any AI service that accepts text prompts*

## 📱 Usage

### Quick Start
1. **Navigate** to any webpage you want to summarize
2. **Click** the extension icon in your browser toolbar
3. **Choose** your preferred summary length and language
4. **Click** "Summarize Current Page"
5. **Copy** the generated prompt
6. **Paste** into your preferred AI service

### Advanced Features
- **Floating Button**: Enable in settings for quick access on any page
- **Context Menu**: Right-click on pages for quick summarization
- **YouTube Integration**: Automatic transcript extraction for video summaries
- **Custom Prompts**: Modify the generated prompts to your needs

## ⚙️ Configuration

### Settings Options
- **Default Summary Length**: Choose between short, medium, or detailed
- **Language Preference**: Set your preferred output language
- **Interface Options**: Show/hide floating buttons and context menus
- **YouTube Integration**: Enable automatic transcript extraction

### Privacy Settings
- **Local Storage**: All settings stored locally on your device
- **No Sync**: Settings are not synchronized with any external service
- **Transparent**: Full control over what data the extension accesses

## 🛡️ Security & Privacy

### Data Handling
- **Content Access**: Only when you explicitly request summarization
- **No Storage**: Web content is not stored or cached
- **No Transmission**: Content is not sent to external servers
- **Local Processing**: All analysis happens in your browser

### Permissions Explained
- `activeTab`: Access current page content only when extension is used
- `storage`: Save your preferences locally on your device
- YouTube host permission: Extract transcripts from YouTube videos you choose

### What We DON'T Do
- ❌ Collect browsing history
- ❌ Track user behavior
- ❌ Store personal information
- ❌ Use analytics or metrics
- ❌ Share data with third parties
- ❌ Include advertising or monetization

## 🔧 Development

### Prerequisites
- Node.js (v16 or later)
- Chrome/Edge browser
- Basic knowledge of Chrome extensions

### Setup
```bash
# Clone the repository
git clone https://github.com/user/web-summary-ai.git
cd web-summary-ai

# Install development dependencies (optional)
npm install

# Load the extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the project directory
```

### Project Structure
```
web-summary-ai/
├── manifest.json          # Extension manifest
├── popup/                 # Extension popup interface
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # Content scripts
│   ├── content.js         # Main content script
│   ├── content.css        # Content styles
│   └── youtube.js         # YouTube-specific functionality
├── background/            # Background script
│   └── background.js
├── options/               # Settings page
│   ├── options.html
│   ├── options.css
│   └── options.js
├── icons/                 # Extension icons
└── assets/                # Additional assets
```

### Building for Distribution
```bash
# Create a distribution package
zip -r web-summary-ai.zip . -x "*.git*" "node_modules/*" "*.md"
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Guidelines
- Follow existing code style and conventions
- Add comments for complex functionality
- Test thoroughly before submitting
- Maintain privacy-first principles
- No external dependencies without discussion

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include browser version and extension version
- Check existing issues before creating new ones

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Why MIT License?
- **Freedom**: Use, modify, and distribute freely
- **Transparency**: No restrictions on commercial use
- **Community**: Encourages open source contributions
- **Privacy**: No tracking of usage or distribution

## 🙏 Acknowledgments

- **Inspiration**: Created as a privacy-focused alternative to existing extensions
- **Community**: Built for users who value privacy and transparency
- **Open Source**: Standing on the shoulders of the open source community

## 📞 Support

### Getting Help
- 📖 **Documentation**: Check this README and the extension's options page
- 🐛 **Bug Reports**: Use GitHub Issues for bugs and feature requests
- 💡 **Discussions**: Use GitHub Discussions for questions and ideas
- 🔒 **Privacy Concerns**: Contact us directly for privacy-related questions

### Roadmap
- [ ] Firefox support
- [ ] Safari support  
- [ ] PDF document summarization
- [ ] Improved transcript extraction
- [ ] Custom prompt templates
- [ ] Export functionality

---

**Made with ❤️ for privacy-conscious users**

*This extension is not affiliated with OpenAI, ChatGPT, or any AI service providers. It simply helps format content for use with these services.*