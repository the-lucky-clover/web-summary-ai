# Contributing to Web Summarizer AI

Thank you for your interest in contributing! This project was created to provide a privacy-focused alternative to existing summarization extensions, and we welcome contributions that align with our privacy-first principles.

## 🌟 Our Mission

Create and maintain a **completely private, open-source browser extension** that helps users summarize web content without any data collection, tracking, or privacy compromises.

## 🔒 Core Principles

Before contributing, please ensure your changes align with our core principles:

1. **Privacy First**: No data collection, tracking, or external analytics
2. **Transparency**: All functionality must be open and reviewable
3. **Minimal Permissions**: Only request essential browser permissions
4. **Local Processing**: All operations happen in the user's browser
5. **No External Dependencies**: Avoid third-party libraries that could compromise privacy

## 🚀 How to Contribute

### 1. Types of Contributions

We welcome several types of contributions:

#### 🐛 Bug Reports
- Extension not working on specific websites
- UI/UX issues or inconsistencies
- Performance problems
- Security vulnerabilities

#### ✨ Feature Requests
- New summarization options
- Additional language support
- UI/UX improvements
- Better content detection

#### 💻 Code Contributions
- Bug fixes
- New features
- Performance optimizations
- Code quality improvements
- Documentation updates

#### 📖 Documentation
- README improvements
- Code documentation
- User guides
- Translation of documentation

### 2. Getting Started

#### Prerequisites
- Git
- Chrome or Edge browser
- Basic knowledge of JavaScript, HTML, CSS
- Understanding of Chrome extension development

#### Setup Development Environment
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/your-username/web-summary-ai.git
cd web-summary-ai

# 3. Create a new branch for your feature
git checkout -b feature/your-feature-name

# 4. Load the extension in Chrome
# - Open chrome://extensions/
# - Enable Developer mode
# - Click "Load unpacked"
# - Select the project directory

# 5. Make your changes and test thoroughly
```

### 3. Development Guidelines

#### Code Style
- **Consistent Formatting**: Use 2 spaces for indentation
- **Clear Variable Names**: Use descriptive, self-documenting variable names
- **Comments**: Add comments for complex logic or privacy-sensitive operations
- **ES6+ Syntax**: Use modern JavaScript features when appropriate
- **Error Handling**: Always include proper error handling

#### Privacy Requirements
All contributions must maintain our privacy standards:
- ❌ No external API calls (except to user-chosen AI services)
- ❌ No analytics, metrics, or tracking code
- ❌ No data collection or storage beyond local settings
- ❌ No third-party libraries that could compromise privacy
- ✅ Local processing only
- ✅ Minimal permissions
- ✅ Transparent functionality

#### Code Structure
```javascript
// Good: Clear, privacy-focused code
class ContentSummarizer {
  constructor() {
    // Initialize without any external connections
    this.initialize();
  }

  extractPageContent() {
    // Extract content locally, never send externally
    const content = document.body.innerText;
    return this.cleanContent(content);
  }
}

// Bad: External calls without user consent
class BadSummarizer {
  constructor() {
    // Don't do this - no analytics!
    this.analytics = new GoogleAnalytics('tracking-id');
  }

  sendToAPI(content) {
    // Don't do this - no automatic external calls!
    fetch('https://api.example.com/summarize', {
      method: 'POST',
      body: content
    });
  }
}
```

### 4. Testing Your Changes

#### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] All features work on different websites
- [ ] YouTube integration works properly
- [ ] Settings page functions correctly
- [ ] No console errors or warnings
- [ ] Privacy principles maintained

#### Test on Multiple Sites
Test your changes on various types of websites:
- News articles (CNN, BBC, etc.)
- Blog posts (Medium, personal blogs)
- Documentation sites (MDN, Stack Overflow)
- YouTube videos
- E-commerce sites
- Social media platforms

#### Browser Compatibility
- Chrome (latest version)
- Edge (latest version)
- Test in both normal and incognito modes

### 5. Submitting Your Contribution

#### Pull Request Process
1. **Ensure your branch is up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a clear commit message**:
   ```bash
   git commit -m "Add feature: Improved content extraction for news sites"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** with:
   - Clear title describing the change
   - Detailed description of what was changed
   - Screenshots for UI changes
   - Testing steps and results
   - Confirmation that privacy principles are maintained

#### Pull Request Template
```markdown
## Description
Brief description of what this PR accomplishes.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Tested on multiple websites
- [ ] No console errors
- [ ] Privacy principles maintained
- [ ] Extension loads and functions properly

## Privacy Checklist
- [ ] No new external API calls added
- [ ] No analytics or tracking code included
- [ ] Only local processing implemented
- [ ] Minimal permissions used
- [ ] No data collection added

## Screenshots (if applicable)
Include screenshots for UI changes.
```

### 6. Code Review Process

#### What We Look For
- **Functionality**: Does the code work as intended?
- **Privacy Compliance**: Does it maintain our privacy standards?
- **Code Quality**: Is the code clean, readable, and well-documented?
- **Security**: Are there any security vulnerabilities?
- **Performance**: Does it impact extension performance?
- **Compatibility**: Does it work across different browsers and sites?

#### Review Timeline
- Initial review within 48 hours
- Feedback and discussion as needed
- Final approval when all requirements are met

### 7. Reporting Issues

#### Security Issues
For security vulnerabilities:
1. **DO NOT** open a public issue
2. Email security details to [security@example.com]
3. Include steps to reproduce
4. We'll respond within 24 hours

#### Bug Reports
Use our bug report template:
```markdown
**Bug Description**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g. Chrome 120]
- Extension Version: [e.g. 1.0.0]
- OS: [e.g. Windows 11]

**Additional Context**
Any other context about the problem.
```

### 8. Feature Requests

When suggesting new features:
- Ensure they align with our privacy principles
- Provide clear use cases and benefits
- Consider implementation complexity
- Think about user experience impact

#### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Problem It Solves**
What problem does this feature address?

**Proposed Solution**
How do you envision this feature working?

**Privacy Impact**
How does this feature maintain our privacy standards?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Any other context, mockups, or examples.
```

## 🎯 Specific Contribution Areas

### High-Priority Areas
1. **Content Detection**: Improving extraction from various website layouts
2. **YouTube Integration**: Better transcript extraction methods
3. **Performance**: Optimizing content processing speed
4. **Accessibility**: Making the extension more accessible
5. **Internationalization**: Supporting more languages

### Medium-Priority Areas
1. **UI/UX Improvements**: Better design and user experience
2. **Error Handling**: More robust error handling and user feedback
3. **Documentation**: Expanding user and developer documentation
4. **Testing**: Automated testing frameworks

### Future Considerations
1. **Firefox Support**: Porting to Firefox add-ons
2. **Safari Support**: Creating Safari Web Extension
3. **Advanced Features**: Custom prompt templates, export functionality

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Maintain professionalism in all interactions

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussion
- **Pull Requests**: Code review and technical discussion

## 📚 Resources

### Learning Resources
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Web APIs Reference](https://developer.mozilla.org/en-US/docs/Web/API)

### Privacy Resources
- [Privacy by Design Principles](https://www.ipc.on.ca/wp-content/uploads/resources/7foundationalprinciples.pdf)
- [GDPR Guidelines](https://gdpr.eu/)
- [Browser Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for major contributions
- GitHub contributors page

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for helping us build a better, more private web!** 🚀

*Questions? Feel free to open an issue or start a discussion on GitHub.*