// Privacy-focused content script - Retro themed Web Summary AI
class ContentSummarizer {
  constructor() {
    this.summaryPanel = null;
    this.isProcessing = false;
    this.themeManager = null;
    this.apiEndpoints = {
      chatgpt: 'https://chat.openai.com',
      // Add more AI services here if needed (locally configured)
    };
    
    this.initialize();
  }

  initialize() {
    // Initialize theme system
    this.initializeGameBoyTheme();
    
    // Listen for messages from popup and background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Add floating action button with animation
    this.addFloatingButton();
    
    // Add wildstyle logo to page
    this.addWildstyleLogo();
    
    console.log('Web Summary AI - Content script loaded with Retro theme');
  }

  initializeGameBoyTheme() {
    // Load theme from storage and apply to document
    chrome.storage.local.get(['theme'], (result) => {
      const theme = result.theme || 'system';
      document.documentElement.setAttribute('data-theme', theme);
    });

    // Listen for theme changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.theme) {
        document.documentElement.setAttribute('data-theme', changes.theme.newValue);
      }
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'summarize':
          const result = await this.summarizeCurrentPage(request.settings);
          sendResponse({ success: true, result });
          break;
          
        case 'openPanel':
          this.openSummaryPanel();
          sendResponse({ success: true });
          break;
          
        case 'getPageContent':
          const content = this.extractPageContent();
          sendResponse({ success: true, content });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Content script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  addFloatingButton() {
    // Remove existing button if present
    const existingBtn = document.getElementById('web-summarizer-fab');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Create Retro themed floating action button
    const floatingBtn = document.createElement('div');
    floatingBtn.id = 'web-summarizer-fab';
    floatingBtn.innerHTML = 'Σ'; // Summation symbol for AI
    floatingBtn.title = 'Web Summary AI - Click to summarize this page';
    floatingBtn.className = 'animate-materialize';
    
    // Retro styling applied via CSS classes

    floatingBtn.addEventListener('click', () => {
      this.openSummaryPanel();
    });

    document.body.appendChild(floatingBtn);
  }

  addWildstyleLogo() {
    // Add animated wildstyle logo to page header if space available
    const headerSelectors = ['header', '.header', '#header', 'nav', '.nav', '#nav'];
    let headerElement = null;
    
    for (const selector of headerSelectors) {
      headerElement = document.querySelector(selector);
      if (headerElement) break;
    }
    
    if (headerElement && headerElement.offsetHeight > 50) {
      const logoContainer = document.createElement('div');
      logoContainer.className = 'content-wildstyle-logo';
      logoContainer.innerHTML = '██╗ ██╗███████╗██████╗ ███████╗██╗   ██╗███╗   ███╗ █████╗ ██║██║███████╗███████╗██████╗  █████╗ ██║';
      
      // Try to insert at beginning of header
      headerElement.insertBefore(logoContainer, headerElement.firstChild);
    }
  }

  extractPageContent() {
    // Extract meaningful content from the page
    let content = '';
    let title = document.title || '';
    let url = window.location.href;

    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement');
    const clonedDoc = document.cloneNode(true);
    scripts.forEach(el => {
      const clonedEl = clonedDoc.querySelector(el.tagName.toLowerCase());
      if (clonedEl) clonedEl.remove();
    });

    // Try to find main content areas
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '.main-content'
    ];

    let mainContent = null;
    for (const selector of contentSelectors) {
      mainContent = document.querySelector(selector);
      if (mainContent && mainContent.textContent.trim().length > 200) {
        break;
      }
    }

    // Fallback to body if no main content area found
    if (!mainContent) {
      mainContent = document.body;
    }

    // Extract text content
    content = mainContent.innerText || mainContent.textContent || '';
    
    // Clean up the content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    // Limit content length to prevent API overload
    const maxLength = 10000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }

    return {
      title,
      url,
      content,
      length: content.length,
      domain: new URL(url).hostname
    };
  }

  async summarizeCurrentPage(settings = {}) {
    if (this.isProcessing) {
      throw new Error('Already processing a summary');
    }

    this.isProcessing = true;
    
    try {
      const pageContent = this.extractPageContent();
      
      if (!pageContent.content || pageContent.content.length < 100) {
        throw new Error('Insufficient content to summarize');
      }

      // Generate the summary prompt based on settings
      const prompt = this.generateSummaryPrompt(pageContent, settings);
      
      // For now, we'll create a summary panel that users can copy to ChatGPT
      // In a full implementation, you would integrate with AI APIs here
      this.displaySummaryInterface(pageContent, prompt, settings);
      
      return {
        status: 'Interface opened',
        contentLength: pageContent.length
      };
      
    } finally {
      this.isProcessing = false;
    }
  }

  generateSummaryPrompt(pageContent, settings) {
    // Use custom prompts if enabled and available
    if (settings.useCustomPrompts) {
      const customPromptKey = `customPrompt${settings.summaryLength.charAt(0).toUpperCase() + settings.summaryLength.slice(1)}`;
      const customPrompt = settings[customPromptKey];
      
      if (customPrompt && customPrompt.trim()) {
        // Replace placeholders in custom prompt
        return customPrompt
          .replace(/\{title\}/g, pageContent.title)
          .replace(/\{content\}/g, pageContent.content);
      }
    }

    // Fallback to default prompts
    const lengthInstructions = {
      short: 'Provide a brief 2-3 sentence summary',
      medium: 'Provide a comprehensive summary in 1-2 paragraphs',
      detailed: 'Provide a detailed summary with key points and main ideas'
    };

    const languageInstruction = settings.language && settings.language !== 'auto' 
      ? ` Please respond in ${this.getLanguageName(settings.language)}.`
      : '';

    return `${lengthInstructions[settings.summaryLength || 'medium']} of the following content from "${pageContent.title}":

${pageContent.content}${languageInstruction}

Focus on the main ideas, key points, and important information. Ignore advertisements, navigation elements, and irrelevant content.`;
  }

  getLanguageName(code) {
    const languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean'
    };
    return languages[code] || 'English';
  }

  displaySummaryInterface(pageContent, prompt, settings) {
    // Create or update Retro themed summary panel
    if (this.summaryPanel) {
      this.summaryPanel.remove();
    }

    this.summaryPanel = document.createElement('div');
    this.summaryPanel.id = 'web-summarizer-panel';
    this.summaryPanel.className = 'summary-panel';
    
    // Add wildstyle logo to panel header
    const logoHtml = `<div class="content-wildstyle-logo">██╗    ██╗███████╗██████╗     ███████╗██╗   ██╗███╗   ███╗ █████╗ ██████╗ ██╗███████╗███████╗██████╗     █████╗ ██╗</div>`;
    
    this.summaryPanel.innerHTML = `
      <div class="panel-header">
        ${logoHtml}
        <h3 class="panel-title">🎮 Web Summary AI</h3>
        <button class="close-button" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      
      <div class="panel-content">
        <div class="content-info">
          <h4>📊 Page Analysis</h4>
          <p><strong>Title:</strong> ${pageContent.title}</p>
          <p><strong>Domain:</strong> ${pageContent.domain}</p>
          <p><strong>Content Length:</strong> ${pageContent.length} characters</p>
          <p><strong>Summary Level:</strong> ${settings.length || 'medium'}</p>
        </div>
        
        <div class="prompt-section">
          <h4>🤖 AI-Ready Prompt</h4>
          <p class="instruction">🎯 Copy this prompt and paste it into any AI service:</p>
          <textarea class="prompt-text" readonly>${prompt}</textarea>
          <button class="copy-button" onclick="this.previousElementSibling.select(); document.execCommand('copy'); this.textContent='📋 Copied!'; setTimeout(() => this.textContent='📄 Copy Prompt', 2000)">📄 Copy Prompt</button>
        </div>
        
        <div class="quick-actions">
          <h4>🚀 Retro AI Services</h4>
          <button class="action-btn retro-button" onclick="window.open('https://chat.openai.com', '_blank')">🤖 ChatGPT</button>
          <button class="action-btn retro-button" onclick="window.open('https://claude.ai', '_blank')">🧠 Claude</button>
          <button class="action-btn retro-button" onclick="window.open('https://gemini.google.com', '_blank')">💎 Gemini</button>
        </div>
      </div>
    `;

    // Add styles
    this.summaryPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    `;

    document.body.appendChild(this.summaryPanel);
    // Styles are now handled by content.css - no additional styles needed
  }

  openSummaryPanel() {
    // Get current settings and summarize
    chrome.storage.local.get({
      summaryLength: 'medium',
      language: 'auto',
      useCustomPrompts: false,
      customPromptShort: '',
      customPromptMedium: '',
      customPromptDetailed: ''
    }, (settings) => {
      this.summarizeCurrentPage(settings);
    });
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ContentSummarizer();
  });
} else {
  new ContentSummarizer();
}