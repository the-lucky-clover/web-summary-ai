// Privacy-focused popup script - no external requests, no tracking
// Retro themed UI with animations
class PopupController {
  constructor() {
    this.themeManager = null;
    this.historyManager = new HistoryManager();
    this.initializeThemeSystem();
    this.initializeElements();
    this.loadSettings();
    this.attachEventListeners();
    this.updateStatus();
    this.setupAnimations();
  }

  initializeThemeSystem() {
    // Wait for theme manager to be available
    if (window.gameBoyTheme) {
      this.themeManager = window.gameBoyTheme;
      this.setupThemeSelector();
    } else {
      // Retry after a short delay
      setTimeout(() => this.initializeThemeSystem(), 100);
    }
  }

  initializeElements() {
    this.elements = {
      summarizeBtn: document.getElementById('summarizeBtn'),
      openPanelBtn: document.getElementById('openPanelBtn'),
      statusText: document.getElementById('statusText'),
      statusIndicator: document.getElementById('statusIndicator'),
      summaryLength: document.getElementById('summaryLength'),
      language: document.getElementById('language'),
      historyBtn: document.getElementById('historyBtn'),
      optionsBtn: document.getElementById('optionsBtn'),
      aboutBtn: document.getElementById('aboutBtn'),
      themeSelector: document.getElementById('themeSelector')
    };
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.local.get({
        summaryLength: 'medium',
        language: 'auto',
        autoSummarize: false,
        theme: 'system'
      });
      
      this.elements.summaryLength.value = settings.summaryLength;
      this.elements.language.value = settings.language;
      
      // Apply theme if theme manager is ready
      if (this.themeManager) {
        this.themeManager.setTheme(settings.theme);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  setupThemeSelector() {
    if (!this.themeManager || !this.elements.themeSelector) return;
    
    const selector = this.themeManager.createThemeSelector();
    this.elements.themeSelector.appendChild(selector);
    
    // Listen for theme changes
    window.addEventListener('themeChanged', (event) => {
      this.saveTheme(event.detail.theme);
    });
  }

  async saveTheme(theme) {
    try {
      await chrome.storage.local.set({ theme: theme });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  setupAnimations() {
    // Add staggered animations to buttons
    const buttons = document.querySelectorAll('.retro-button');
    buttons.forEach((button, index) => {
      if (this.themeManager) {
        this.themeManager.animateElement(button, 'materialize', index + 1);
      }
    });

    // Animate status indicator
    this.animateStatusIndicator();
  }

  animateStatusIndicator() {
    const indicator = this.elements.statusIndicator;
    if (indicator) {
      indicator.style.animation = 'pulse 2s ease-in-out infinite';
    }
  }

  attachEventListeners() {
    // Summarize current page
    this.elements.summarizeBtn.addEventListener('click', () => {
      this.handleSummarize();
    });

    // Open summary panel
    this.elements.openPanelBtn.addEventListener('click', () => {
      this.handleOpenPanel();
    });

    // Settings change handlers
    this.elements.summaryLength.addEventListener('change', () => {
      this.saveSettings();
    });

    this.elements.language.addEventListener('change', () => {
      this.saveSettings();
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

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        summaryLength: this.elements.summaryLength.value,
        language: this.elements.language.value
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async handleSummarize() {
    try {
      this.setStatus('loading', 'Analyzing page...');
      this.elements.summarizeBtn.disabled = true;

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('Unable to access current tab');
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'summarize',
        settings: {
          length: this.elements.summaryLength.value,
          language: this.elements.language.value
        }
      });

      if (response && response.success) {
        this.setStatus('success', 'Summary generated!');
        // Close popup after successful action
        setTimeout(() => window.close(), 1000);
      } else {
        throw new Error(response?.error || 'Failed to summarize page');
      }
    } catch (error) {
      console.error('Summarization error:', error);
      this.setStatus('error', error.message || 'Summarization failed');
    } finally {
      this.elements.summarizeBtn.disabled = false;
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