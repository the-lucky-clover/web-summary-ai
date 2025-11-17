// Privacy-focused content script - Retro themed Web Summary AI
class WebSummaryAI {
  constructor() {
    this.summaryPanel = null;
    this.historyManager = new HistoryManager();
    this.isProcessing = false;
    this.themeManager = null;
    this.aiProvider = null;
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
    // Load enhanced theme system from storage
    chrome.storage.local.get([
      'themeMode', 'primaryColor', 'secondaryColor', 'accentColor', 
      'backgroundColor', 'surfaceColor', 'textColor', 'enableAnimations'
    ], (result) => {
      const themeMode = result.themeMode || 'system';
      this.applyContentTheme(themeMode, result);
    });

    // Listen for theme changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        // Check if any theme-related settings changed
        const themeKeys = ['themeMode', 'primaryColor', 'secondaryColor', 'accentColor', 
                          'backgroundColor', 'surfaceColor', 'textColor'];
        
        const themeChanged = themeKeys.some(key => changes[key]);
        
        if (themeChanged) {
          chrome.storage.local.get(themeKeys.concat(['enableAnimations']), (result) => {
            const themeMode = result.themeMode || 'system';
            this.applyContentTheme(themeMode, result);
          });
        }

        // Handle button style changes
        if (changes.buttonStyle || changes.showFloatingButton) {
          this.addFloatingButton(); // Refresh button with new style
        }
      }
    });
  }

  applyContentTheme(themeMode, settings) {
    const root = document.documentElement;
    
    // Set theme attribute
    root.setAttribute('data-theme', themeMode);
    
    if (themeMode === 'custom') {
      // Apply custom colors to CSS variables
      root.style.setProperty('--primary-color', settings.primaryColor || '#1a73e8');
      root.style.setProperty('--secondary-color', settings.secondaryColor || '#34a853');
      root.style.setProperty('--accent-color', settings.accentColor || '#fbbc04');
      root.style.setProperty('--background-color', settings.backgroundColor || '#ffffff');
      root.style.setProperty('--surface-color', settings.surfaceColor || '#f8f9fa');
      root.style.setProperty('--text-color', settings.textColor || '#202124');
    } else {
      // Clear custom properties for system/light/dark themes
      const customProps = ['--primary-color', '--secondary-color', '--accent-color', 
                          '--background-color', '--surface-color', '--text-color'];
      customProps.forEach(prop => root.style.removeProperty(prop));
    }

    // Handle animations preference
    if (settings.enableAnimations === false) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
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

  async addFloatingButton() {
    // Remove existing button if present
    const existingBtn = document.getElementById('web-summary-fab');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Get user settings for button style
    const settings = await this.getSettings();
    
    if (!settings.showFloatingButton) {
      return; // Button is disabled
    }

    const buttonStyle = settings.buttonStyle || 'floating';
    
    // Create action button with appropriate style
    const actionBtn = document.createElement('div');
    actionBtn.id = 'web-summary-fab';
    actionBtn.title = 'Web Summary AI - Click to summarize this page';
    
    // Set button content and classes based on style
    switch (buttonStyle) {
      case 'floating':
        actionBtn.innerHTML = '⚡'; // Lightning bolt for speed
        actionBtn.className = 'web-summary-fab floating-style animate-materialize';
        break;
        
      case 'fixed-bottom':
        actionBtn.innerHTML = `
          <div class="fab-content">
            <span class="fab-icon">🧠</span>
            <span class="fab-text">Summarize Page</span>
          </div>
        `;
        actionBtn.className = 'web-summary-fab fixed-bottom-style animate-slide-up';
        break;
        
      case 'fixed-corner':
        actionBtn.innerHTML = '📝';
        actionBtn.className = 'web-summary-fab fixed-corner-style animate-bounce-in';
        break;
        
      case 'minimal':
        actionBtn.innerHTML = '●';
        actionBtn.className = 'web-summary-fab minimal-style animate-fade-in';
        break;
        
      default:
        actionBtn.innerHTML = '⚡';
        actionBtn.className = 'web-summary-fab floating-style animate-materialize';
    }

    // Add enhanced interaction handlers
    this.addButtonInteractions(actionBtn);

    actionBtn.addEventListener('click', () => {
      this.openSummaryPanel();
    });

    document.body.appendChild(actionBtn);
    
    // Trigger entrance animation
    setTimeout(() => {
      actionBtn.classList.add('animate-entrance');
    }, 100);
  }

  addButtonInteractions(button) {
    // Enhanced hover and click animations
    button.addEventListener('mouseenter', () => {
      button.classList.add('hover-active');
    });

    button.addEventListener('mouseleave', () => {
      button.classList.remove('hover-active');
    });

    button.addEventListener('mousedown', () => {
      button.classList.add('click-active');
    });

    button.addEventListener('mouseup', () => {
      button.classList.remove('click-active');
    });

    // Periodic pulse animation for attention
    setInterval(() => {
      if (!button.matches(':hover') && Math.random() < 0.1) {
        button.classList.add('attention-pulse');
        setTimeout(() => {
          button.classList.remove('attention-pulse');
        }, 2000);
      }
    }, 10000);
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

      // Initialize AI provider if not already done
      if (!this.aiProvider) {
        await this.initializeAI();
      }

      // Check if AI provider is configured (ChatGPT or Custom API)
      if (settings.aiProvider && settings.aiProvider !== 'manual') {
        try {
          // Use AI provider for automatic summarization
          const summary = await this.generateSummaryWithAI(pageContent, settings);
          this.displaySummaryResult(pageContent, summary, settings);
        } catch (error) {
          console.warn('AI Provider failed, falling back to manual mode:', error);
          // Fallback to manual prompt generation
          const prompt = this.generateSummaryPrompt(pageContent, settings);
          this.displaySummaryInterface(pageContent, prompt, settings);
        }
      } else {
        // Manual mode: Generate prompt for user to copy
        const prompt = this.generateSummaryPrompt(pageContent, settings);
        this.displaySummaryInterface(pageContent, prompt, settings);
      }
      
      return {
        status: 'Interface opened',
        contentLength: pageContent.length
      };
      
    } finally {
      this.isProcessing = false;
    }
  }

  async initializeAI() {
    const settings = await this.getSettings();
    
    // Import AI Provider
    if (!window.AIProvider) {
      await this.loadAIProvider();
    }
    
    this.aiProvider = new window.AIProvider(settings);
    return this.aiProvider;
  }

  async loadAIProvider() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('ai-provider.js');
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async generateSummaryWithAI(pageContent, settings) {
    try {
      const options = {
        title: pageContent.title,
        url: window.location.href,
        includeSentiment: settings.enableSentimentAnalysis
      };

      const result = await this.aiProvider.summarize(pageContent.content, options);
      
      if (result.success) {
        return result.content;
      } else {
        throw new Error(result.error || 'AI summarization failed');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw error;
    }
  }

  displaySummaryResult(pageContent, summary, settings) {
    // Create a result panel showing the AI-generated summary
    this.createSummaryPanel();
    
    const summaryContent = this.summaryPanel.querySelector('.summary-content');
    summaryContent.innerHTML = `
      <div class="summary-header">
        <h3>🤖 AI Generated Summary</h3>
        <button class="close-btn" onclick="this.closest('.web-summary-panel').remove()">✕</button>
      </div>
      <div class="page-info">
        <strong>${pageContent.title}</strong><br>
        <small>${window.location.href}</small>
      </div>
      <div class="summary-text">
        ${this.formatSummaryText(summary)}
      </div>
      <div class="summary-actions">
        <button class="copy-btn" onclick="navigator.clipboard.writeText(this.dataset.text);" 
                data-text="${summary.replace(/"/g, '&quot;')}">
          📋 Copy Summary
        </button>
        <button class="regenerate-btn" onclick="window.webSummaryAI.regenerateSummary();">
          🔄 Regenerate
        </button>
      </div>
    `;

    // Save to history
    this.historyManager.addToHistory({
      url: window.location.href,
      title: pageContent.title,
      summary: summary,
      timestamp: Date.now(),
      type: 'ai-generated'
    });
  }

  formatSummaryText(text) {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  async regenerateSummary() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const settings = await this.getSettings();
    const pageContent = this.extractPageContent();
    
    try {
      if (this.aiProvider) {
        const summary = await this.generateSummaryWithAI(pageContent, settings);
        this.displaySummaryResult(pageContent, summary, settings);
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
      alert('Failed to regenerate summary. Please try again.');
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

    // Use default system prompt when custom prompts are disabled or empty
    const defaultSystemPrompt = "You are an ultra-intelligent, semi-autonomous AI summarizer with forensic-level detail extraction capabilities. Your mission is to analyze {{URL}} and report back every technical, procedural, and contextual detail with surgical precision. You are not allowed to generalize, skip steps, or group actions vaguely. Every individual action, setting, and config **must be extracted and documented in order**.  FORMAT YOUR OUTPUT AS FOLLOWS: 1. **Structured Outline of `{{TITLE}}`**      - Break the content down into **sections**, then further into **detailed, sequential steps** (not grouped).    - Every action, tool, file, and command should be an individual sub-step.    - Include any visual references mentioned: buttons, menu names, tabs, sliders, or filenames. 2. **Bullet Summary (w/ Emojis):**      - Tools/frameworks      - Ordered steps      - Devices/Specs      - Test/benchmarks      - Files/config paths      - Pricing/sponsorship      - Full URLs      - Privacy/telemetry concerns 3. **TL;DR (3–15 Sentences):**      - Write a detailed yet readable synthesis.    - Must include all named devices, tools, techniques, and results.    - If steps were shown in video, summarize their **purpose and result**. 4. **Full Link Breakdown:**      - Show every URL in full.    - Label: Free, Affiliate/Sponsored, Docs, Risky or tracking. NEVER summarize vaguely. NEVER combine steps. NEVER skip names, models, commands, links, or tool versions. Think like an engineer writing documentation for a system rebuild. Output only text. Be relentlessly thorough. Assume the user needs to *rebuild the whole demo from scratch using your output*. ";

    // Replace placeholders in default system prompt
    return defaultSystemPrompt
      .replace(/\{\{URL\}\}/g, window.location.href)
      .replace(/\{\{TITLE\}\}/g, pageContent.title)
      + `\n\nCONTENT TO ANALYZE:\n${pageContent.content}`;
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
    this.summaryPanel.id = 'web-summary-panel';
    this.summaryPanel.className = 'summary-panel';
    
    // Simple header for extension popup
    
    this.summaryPanel.innerHTML = `
      <div class="panel-header">
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
    
    // Save to history
    this.saveToHistory(pageContent, prompt, settings);
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

  saveToHistory(pageContent, prompt, settings) {
    try {
      const entry = {
        url: window.location.href,
        title: pageContent.title || document.title,
        content: pageContent.content ? pageContent.content.substring(0, 500) : '', // Store preview only
        summary: prompt, // The generated prompt acts as the summary
        length: settings.summaryLength || settings.length || 'medium',
        language: settings.language || 'auto'
      };
      
      this.historyManager.addEntry(entry);
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.webSummaryAI = new WebSummaryAI();
  });
} else {
  window.webSummaryAI = new WebSummaryAI();
}