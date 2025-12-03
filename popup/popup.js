// Privacy-focused popup script - no external requests, no tracking
// Auto-displays summary for current page
class PopupController {
  constructor() {
    this.themeManager = null;
    this.historyManager = new HistoryManager();
    this.currentSummary = null;
    this.initializeThemeSystem();
    this.initializeElements();
    this.loadSettings();
    this.attachEventListeners();
    this.autoSummarize(); // Auto-generate summary on popup open
  }

  initializeThemeSystem() {
    // Wait for theme manager to be available
    if (window.gameBoyTheme) {
      this.themeManager = window.gameBoyTheme;
    } else {
      // Retry after a short delay
      setTimeout(() => this.initializeThemeSystem(), 100);
    }
  }

  initializeElements() {
    this.elements = {
      openPanelBtn: document.getElementById('openPanelBtn'),
      statusText: document.getElementById('statusText'),
      statusIndicator: document.getElementById('statusIndicator'),
      summaryContainer: document.getElementById('summaryContainer'),
      summaryTitle: document.getElementById('summaryTitle'),
      summaryContent: document.getElementById('summaryContent'),
      copyBtn: document.getElementById('copyBtn'),
      refreshBtn: document.getElementById('refreshBtn'),
      historyBtn: document.getElementById('historyBtn'),
      optionsBtn: document.getElementById('optionsBtn'),
      aboutBtn: document.getElementById('aboutBtn')
    };
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.local.get({
        language: 'auto',
        theme: 'system',
        useCustomPrompt: false,
        customPrompt: '',
        openaiApiKey: '',
        aiModel: 'gpt-4o-mini',
        enableAI: false
      });
      
      this.settings = settings;
      
      // Apply theme if theme manager is ready
      if (this.themeManager) {
        this.themeManager.setTheme(settings.theme);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  attachEventListeners() {
    // Copy to clipboard
    this.elements.copyBtn.addEventListener('click', () => {
      this.copySummaryToClipboard();
    });

    // Refresh summary
    this.elements.refreshBtn.addEventListener('click', () => {
      this.autoSummarize();
    });

    // Open summary panel
    this.elements.openPanelBtn.addEventListener('click', () => {
      this.handleOpenPanel();
    });

    // Navigation buttons
    this.elements.historyBtn.addEventListener('click', () => {
      this.openHistory();
    });

    this.elements.optionsBtn.addEventListener('click', () => {
      this.openOptions();
    });

    this.elements.aboutBtn.addEventListener('click', () => {
      this.showAbout();
    });
  }

  async autoSummarize() {
    try {
      this.setStatus('loading', 'Extracting content...');
      this.elements.summaryContent.innerHTML = '<p class="loading-message">Analyzing page content...</p>';

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('Unable to access current tab');
      }

      // Check if it's a restricted page
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || 
          tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        throw new Error('Cannot access this page');
      }

      // Check for YouTube
      const isYouTube = tab.url.includes('youtube.com/watch');
      this.elements.summaryTitle.textContent = isYouTube ? 'Video Summary' : 'Page Summary';

      // Send message to content script to get page content
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getPageContent'
      });

      if (!response || !response.content) {
        throw new Error('Failed to extract page content');
      }

      // Generate summary prompt
      const prompt = this.generateSummaryPrompt(response, tab);
      
      // Check if AI is enabled
      if (this.settings.enableAI && this.settings.openaiApiKey) {
        this.setStatus('loading', 'Generating AI summary...');
        this.elements.summaryContent.innerHTML = '<p class="loading-message">⚡ Calling OpenAI API...</p>';
        
        try {
          const aiSummary = await this.callAIAPI(prompt);
          this.currentSummary = aiSummary;
          this.elements.summaryContent.textContent = aiSummary;
          this.setStatus('success', 'AI summary ready');
        } catch (error) {
          // Fallback to prompt if AI fails
          console.error('AI generation failed, showing prompt:', error);
          this.currentSummary = prompt + `\n\n⚠️ AI Error: ${error.message}\n📋 Copy the prompt above and use it manually.`;
          this.elements.summaryContent.textContent = this.currentSummary;
          this.setStatus('error', error.message);
        }
      } else {
        // No AI configured, show the prompt
        this.currentSummary = prompt;
        this.elements.summaryContent.textContent = prompt;
        this.setStatus('success', 'Prompt ready (AI not configured)');
      }
      
      // Save to history
      this.historyManager.addEntry({
        url: tab.url,
        title: tab.title,
        summary: summary,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Summarization error:', error);
      this.setStatus('error', error.message || 'Failed to generate summary');
      this.elements.summaryContent.innerHTML = `<p class="loading-message" style="color: #ea4335;">❌ ${error.message}</p>`;
    }
  }

  generateSummaryPrompt(pageContent, tab) {
    // Use custom prompt if enabled, otherwise use default forensic prompt
    if (this.settings.useCustomPrompt && this.settings.customPrompt) {
      return this.settings.customPrompt
        .replace(/\{\{CONTENT\}\}/g, pageContent.content)
        .replace(/\{\{URL\}\}/g, tab.url)
        .replace(/\{\{TITLE\}\}/g, tab.title)
        .replace(/\{\{SELECTED_LANGUAGE\}\}/g, this.settings.language);
    }

    // Default forensic prompt from messages.json
    return chrome.i18n.getMessage('defaultQuestion')
      .replace('{{CONTENT}}', pageContent.content)
      .replace('{{URL}}', tab.url)
      .replace('{{TITLE}}', tab.title)
      .replace('{{SELECTED_LANGUAGE}}', this.settings.language);
  }

  async callAIAPI(prompt) {
    // Check if API key is configured
    if (!this.settings.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: this.settings.aiModel || 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI API Error:', error);
      throw error;
    }
  }

  async copySummaryToClipboard() {
    try {
      await navigator.clipboard.writeText(this.currentSummary);
      this.setStatus('success', 'Copied to clipboard!');
      
      // Visual feedback
      this.elements.copyBtn.innerHTML = '<span class="btn-icon">✓</span>';
      setTimeout(() => {
        this.elements.copyBtn.innerHTML = '<span class="btn-icon">📋</span>';
      }, 2000);
    } catch (error) {
      console.error('Copy error:', error);
      this.setStatus('error', 'Failed to copy');
    }
  }

  async handleOpenPanel() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('Unable to access current tab');
      }

      // Send message to content script to open panel
      await chrome.tabs.sendMessage(tab.id, {
        action: 'openPanel'
      });

      // Close popup
      window.close();
    } catch (error) {
      console.error('Error opening panel:', error);
      this.setStatus('error', 'Failed to open panel');
    }
  }

  setStatus(type, message) {
    this.elements.statusText.textContent = message;
    this.elements.statusIndicator.className = `status-indicator ${type}`;
    
    // Auto-clear status after 3 seconds for non-error messages
    if (type !== 'error') {
      setTimeout(() => {
        this.setStatus('ready', 'Ready');
      }, 3000);
    }
  }

  updateStatus() {
    // Check if we can access the current page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = tabs[0].url;
        
        // Check if it's a restricted page
        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || 
            url.startsWith('edge://') || url.startsWith('about:')) {
          this.setStatus('error', 'Cannot access this page');
          this.elements.summarizeBtn.disabled = true;
          return;
        }

        // Check if it's a YouTube page for special handling
        if (url.includes('youtube.com/watch')) {
          this.setStatus('ready', 'YouTube video detected');
          this.elements.summarizeBtn.textContent = '📺 Summarize Video';
        } else {
          this.setStatus('ready', 'Ready to summarize');
          this.elements.summarizeBtn.innerHTML = '<span class="btn-icon">📄</span>Summarize Current Page';
        }
      }
    });
  }

  showAbout() {
    const aboutInfo = `
Web Summarizer AI v1.0.0

This is a privacy-focused, open-source extension that helps you summarize web content without any data collection or tracking.

Features:
• Summarize any webpage
• YouTube video transcription and summary
• Multiple summary lengths
• Multi-language support
• No data collection
• No external analytics
• Completely open source

Privacy Policy:
This extension does not collect, store, or transmit any personal data. All processing happens locally in your browser.

Source Code:
Available on GitHub under MIT License
    `.trim();

    alert(aboutInfo);
  }

  openHistory() {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('../history/history.html') 
    });
  }

  openOptions() {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('../options/options.html') 
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});