/* Apple Design System JavaScript for Safari Extension */

class AppleSafariExtension {
  constructor() {
    this.currentTab = null;
    this.isAnalyzing = false;
    this.historyManager = new HistoryManager();
    
    this.initializeExtension();
    this.bindEvents();
    this.updateUI();
  }

  async initializeExtension() {
    try {
      // Get current active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tabs[0];
      
      // Update page info
      this.updatePageInfo();
      
      // Load user preferences
      await this.loadUserPreferences();
      
      // Update stats
      await this.updateStats();
      
      console.log('Safari extension initialized with Apple design system');
    } catch (error) {
      console.error('Extension initialization failed:', error);
      this.showError('Failed to initialize extension');
    }
  }

  bindEvents() {
    // Primary action button
    document.getElementById('summarize-btn')?.addEventListener('click', () => {
      this.handleSummarize();
    });

    // Secondary action buttons
    document.getElementById('history-btn')?.addEventListener('click', () => {
      this.openHistory();
    });

    document.getElementById('export-btn')?.addEventListener('click', () => {
      this.openExport();
    });

    // Header actions
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.openSettings();
    });

    // Footer actions
    document.getElementById('share-btn')?.addEventListener('click', () => {
      this.shareWithSystem();
    });

    document.getElementById('shortcuts-btn')?.addEventListener('click', () => {
      this.showKeyboardShortcuts();
    });

    // Keyboard shortcuts (macOS style)
    document.addEventListener('keydown', (e) => {
      if (e.metaKey) { // Command key on macOS
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            this.handleSummarize();
            break;
          case 'h':
            e.preventDefault();
            this.openHistory();
            break;
          case 'e':
            e.preventDefault();
            this.openExport();
            break;
          case ',':
            e.preventDefault();
            this.openSettings();
            break;
        }
      }
    });

    // Handle system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.updateTheme();
    });
  }

  async handleSummarize() {
    if (this.isAnalyzing || !this.currentTab) return;

    try {
      this.isAnalyzing = true;
      this.updateAnalyzingState(true);

      // Inject content script if needed
      await this.ensureContentScript();

      // Get page content
      const content = await this.extractPageContent();
      
      if (!content || content.trim().length < 100) {
        throw new Error('Insufficient content to analyze');
      }

      // Show progress
      this.updateProgress(25, 'Processing content...');

      // Simulate AI analysis (replace with actual API call)
      const summary = await this.performAnalysis(content);

      this.updateProgress(75, 'Generating summary...');

      // Save to history
      await this.saveToHistory({
        title: this.currentTab.title,
        url: this.currentTab.url,
        content: content,
        summary: summary,
        timestamp: Date.now()
      });

      this.updateProgress(100, 'Complete!');

      // Show results with native sheet presentation
      await this.showSummaryResults(summary);

      // Update stats
      await this.updateStats();

    } catch (error) {
      console.error('Analysis failed:', error);
      this.showError(error.message || 'Analysis failed');
    } finally {
      this.isAnalyzing = false;
      this.updateAnalyzingState(false);
    }
  }

  async ensureContentScript() {
    try {
      await browser.tabs.executeScript(this.currentTab.id, {
        file: '../content/content.js'
      });
    } catch (error) {
      // Content script might already be injected
      console.log('Content script injection:', error.message);
    }
  }

  async extractPageContent() {
    const results = await browser.tabs.executeScript(this.currentTab.id, {
      code: `
        // Extract main content using Safari's built-in reader mode detection
        const article = document.querySelector('article') || 
                       document.querySelector('main') || 
                       document.querySelector('[role="main"]') ||
                       document.body;
        
        // Remove unwanted elements
        const unwanted = article.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement');
        unwanted.forEach(el => el.remove());
        
        // Get clean text
        const text = article.innerText || article.textContent || '';
        
        // Return structured content
        ({
          title: document.title,
          text: text.trim(),
          wordCount: text.trim().split(/\\s+/).length,
          url: window.location.href
        });
      `
    });

    return results[0];
  }

  async performAnalysis(content) {
    // Simulate analysis time based on content length
    const analysisTime = Math.min(3000, content.text.length / 50);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate AI summary (replace with actual API)
        const sentences = content.text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const keyPoints = sentences.slice(0, Math.min(5, Math.floor(sentences.length * 0.3)));
        
        const summary = {
          keyPoints: keyPoints.map(point => point.trim()),
          wordCount: content.wordCount,
          readingTime: Math.ceil(content.wordCount / 200),
          sentiment: 'neutral', // Mock sentiment
          topics: this.extractTopics(content.text)
        };
        
        resolve(summary);
      }, analysisTime);
    });
  }

  extractTopics(text) {
    // Simple keyword extraction (replace with proper NLP)
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  async showSummaryResults(summary) {
    // Create native macOS-style sheet overlay
    const sheet = document.createElement('div');
    sheet.className = 'summary-sheet';
    sheet.innerHTML = `
      <div class="sheet-container">
        <div class="sheet-header">
          <h2>Analysis Complete</h2>
          <button class="sheet-close" onclick="this.closest('.summary-sheet').remove()">
            <svg class="sf-symbol" viewBox="0 0 100 100" fill="currentColor">
              <path d="M25 25 L75 75 M75 25 L25 75" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="sheet-content">
          <div class="summary-stats">
            <div class="stat">
              <span class="value">${summary.wordCount}</span>
              <span class="label">Words</span>
            </div>
            <div class="stat">
              <span class="value">${summary.readingTime}</span>
              <span class="label">Min read</span>
            </div>
            <div class="stat">
              <span class="value">${summary.keyPoints.length}</span>
              <span class="label">Key points</span>
            </div>
          </div>
          <div class="key-points">
            <h3>Key Points</h3>
            <ul>
              ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
          </div>
          <div class="sheet-actions">
            <button class="secondary-button" onclick="this.closest('.summary-sheet').remove()">
              <svg class="sf-symbol" viewBox="0 0 100 100" fill="currentColor">
                <path d="M20 45 L80 45 C82 45, 84 47, 84 49 C84 51, 82 53, 80 53 L20 53 C18 53, 16 51, 16 49 C16 47, 18 45, 20 45 Z"/>
              </svg>
              Copy Text
            </button>
            <button class="primary-button" onclick="this.closest('.summary-sheet').remove()">
              <svg class="sf-symbol" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 15 C52 15, 54 17, 54 19 L54 55 L62 47 C63 46, 65 46, 66 47 C67 48, 67 50, 66 51 L51 66 C50 67, 49 67, 48 66 L33 51 C32 50, 32 48, 33 47 C34 46, 36 46, 37 47 L45 55 L45 19 C45 17, 47 15, 50 15 Z"/>
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    `;

    // Add sheet styles
    const style = document.createElement('style');
    style.textContent = `
      .summary-sheet {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(20px);
        z-index: 1000;
        animation: fadeInUp 0.3s ease;
      }
      
      .sheet-container {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--system-background);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        max-height: 80vh;
        overflow: hidden;
      }
      
      .sheet-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--separator-non-opaque);
      }
      
      .sheet-header h2 {
        font-size: 18px;
        font-weight: 600;
        color: var(--label-primary);
      }
      
      .sheet-close {
        width: 32px;
        height: 32px;
        border: none;
        background: var(--system-fill);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      
      .sheet-close .sf-symbol {
        width: 16px;
        height: 16px;
      }
      
      .sheet-content {
        padding: 20px;
        overflow-y: auto;
        max-height: calc(80vh - 80px);
      }
      
      .summary-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
        padding: 16px;
        background: var(--system-secondary-background);
        border-radius: var(--radius-large);
      }
      
      .stat {
        text-align: center;
      }
      
      .stat .value {
        display: block;
        font-size: 24px;
        font-weight: 700;
        color: var(--apple-blue);
        line-height: 1;
        margin-bottom: 4px;
      }
      
      .stat .label {
        font-size: 12px;
        color: var(--label-secondary);
        font-weight: 500;
        text-transform: uppercase;
      }
      
      .key-points h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--label-primary);
      }
      
      .key-points ul {
        list-style: none;
        padding: 0;
      }
      
      .key-points li {
        padding: 12px;
        margin-bottom: 8px;
        background: var(--system-secondary-background);
        border-radius: var(--radius-medium);
        font-size: 14px;
        line-height: 1.4;
        color: var(--label-primary);
      }
      
      .sheet-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--separator-non-opaque);
      }
      
      .sheet-actions button {
        flex: 1;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(sheet);

    // Animate in
    requestAnimationFrame(() => {
      sheet.style.animation = 'fadeInUp 0.3s ease';
    });
  }

  updatePageInfo() {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo && this.currentTab) {
      const title = this.currentTab.title.length > 30 
        ? this.currentTab.title.substring(0, 30) + '...'
        : this.currentTab.title;
      
      pageInfo.querySelector('.page-title').textContent = title;
    }
  }

  updateAnalyzingState(analyzing) {
    const button = document.getElementById('summarize-btn');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const progressSection = document.getElementById('progress-section');

    if (analyzing) {
      button.disabled = true;
      button.innerHTML = `
        <svg class="sf-symbol analyzing" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="60 40" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 50 50;360 50 50"/>
          </circle>
        </svg>
        <span>Analyzing...</span>
      `;
      
      statusDot.className = 'status-dot processing';
      statusText.textContent = 'Analyzing content';
      progressSection.style.display = 'block';
    } else {
      button.disabled = false;
      button.innerHTML = `
        <svg class="sf-symbol" viewBox="0 0 100 100" fill="currentColor">
          <path d="M20 25 L80 25 C82 25, 84 27, 84 29 C84 31, 82 33, 80 33 L20 33 C18 33, 16 31, 16 29 C16 27, 18 25, 20 25 Z M20 45 L70 45 C72 45, 74 47, 74 49 C74 51, 72 53, 70 53 L20 53 C18 53, 16 51, 16 49 C16 47, 18 45, 20 45 Z M20 65 L75 65 C77 65, 79 67, 79 69 C79 71, 77 73, 75 73 L20 73 C18 73, 16 71, 16 69 C16 67, 18 65, 20 65 Z"/>
        </svg>
        <span>Analyze Page</span>
      `;
      
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Ready to analyze';
      progressSection.style.display = 'none';
    }
  }

  updateProgress(percentage, text) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = text;
  }

  async updateStats() {
    try {
      const stats = await this.historyManager.getStats();
      const statsSection = document.getElementById('stats-section');
      
      if (stats.totalEntries > 0) {
        document.getElementById('word-count').textContent = stats.totalWords.toLocaleString();
        document.getElementById('reading-time').textContent = Math.ceil(stats.totalWords / 200);
        document.getElementById('summary-count').textContent = stats.totalEntries;
        statsSection.style.display = 'grid';
      } else {
        statsSection.style.display = 'none';
      }
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  async saveToHistory(entry) {
    await this.historyManager.addEntry(entry);
  }

  showError(message) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    statusDot.className = 'status-dot error';
    statusText.textContent = message;
    
    // Show native macOS alert
    if (typeof browser !== 'undefined' && browser.notifications) {
      browser.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon48.png',
        title: 'Web Summarizer AI',
        message: message
      });
    }
    
    setTimeout(() => {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Ready to analyze';
    }, 3000);
  }

  openHistory() {
    browser.tabs.create({ url: '../history/history.html' });
  }

  openExport() {
    // Implementation for export functionality
    console.log('Opening export options');
  }

  openSettings() {
    browser.runtime.openOptionsPage();
  }

  shareWithSystem() {
    // macOS system share integration
    if (navigator.share) {
      navigator.share({
        title: 'Web Summarizer AI',
        text: 'Check out this intelligent content summarization tool',
        url: 'https://web-summary-ai.pages.dev'
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText('https://web-summary-ai.pages.dev');
      this.showSuccess('Link copied to clipboard');
    }
  }

  showKeyboardShortcuts() {
    // Show macOS-style keyboard shortcuts overlay
    const shortcuts = [
      { key: '⌘ + Enter', action: 'Analyze Page' },
      { key: '⌘ + H', action: 'Open History' },
      { key: '⌘ + E', action: 'Export Summary' },
      { key: '⌘ + ,', action: 'Settings' }
    ];
    
    console.log('Keyboard shortcuts:', shortcuts);
  }

  showSuccess(message) {
    const statusText = document.getElementById('status-text');
    const originalText = statusText.textContent;
    
    statusText.textContent = message;
    statusText.style.color = 'var(--apple-green)';
    
    setTimeout(() => {
      statusText.textContent = originalText;
      statusText.style.color = '';
    }, 2000);
  }

  async loadUserPreferences() {
    try {
      const prefs = await browser.storage.sync.get([
        'theme',
        'autoAnalyze',
        'exportFormat',
        'keyboardShortcuts'
      ]);
      
      // Apply preferences
      if (prefs.theme) {
        document.documentElement.setAttribute('data-theme', prefs.theme);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  updateTheme() {
    // Handle automatic dark mode switching
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  updateUI() {
    // Ensure proper SF Pro font loading
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    }
  }
}

// Simple History Manager for demonstration
class HistoryManager {
  constructor() {
    this.storageKey = 'web-summarizer-history';
  }

  async addEntry(entry) {
    const history = await this.getHistory();
    history.unshift({
      id: Date.now().toString(),
      ...entry
    });
    
    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(50);
    }
    
    await browser.storage.local.set({ [this.storageKey]: history });
  }

  async getHistory() {
    const result = await browser.storage.local.get(this.storageKey);
    return result[this.storageKey] || [];
  }

  async getStats() {
    const history = await this.getHistory();
    const totalWords = history.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    
    return {
      totalEntries: history.length,
      totalWords: totalWords,
      lastAnalyzed: history[0]?.timestamp || null
    };
  }
}

// Initialize extension when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AppleSafariExtension();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppleSafariExtension, HistoryManager };
}