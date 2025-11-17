/* Apple Design System Content Script for iOS Safari */
/* Integrates seamlessly with iOS Safari and system UI patterns */

class iOSSafariSummarizer {
  constructor() {
    this.panel = null;
    this.isVisible = false;
    this.isAnalyzing = false;
    this.currentSummary = null;
    
    this.initializeExtension();
    this.bindEvents();
    this.detectUserAgent();
  }

  detectUserAgent() {
    // Detect iOS Safari and adjust behavior accordingly
    this.isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.supportsHaptics = 'vibrate' in navigator || 'haptics' in window;
    
    console.log('iOS Safari Summarizer initialized', {
      isIOSDevice: this.isIOSDevice,
      isSafari: this.isSafari,
      supportsHaptics: this.supportsHaptics
    });
  }

  initializeExtension() {
    // Add iOS-specific CSS
    this.injectStyles();
    
    // Listen for messages from popup/background
    if (typeof browser !== 'undefined' && browser.runtime) {
      browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
      });
    }
    
    // Create floating action button for iOS
    if (this.isIOSDevice) {
      this.createFloatingActionButton();
    }
    
    console.log('iOS Safari content script initialized');
  }

  injectStyles() {
    // Check if styles already injected
    if (document.getElementById('ios-safari-summarizer-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'ios-safari-summarizer-styles';
    link.rel = 'stylesheet';
    link.href = browser.runtime.getURL('content/content-ios.css');
    document.head.appendChild(link);
  }

  createFloatingActionButton() {
    const fab = document.createElement('button');
    fab.id = 'ios-summarizer-fab';
    fab.className = 'ios-floating-action-button';
    fab.innerHTML = `
      <svg class="ios-sf-symbol" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 10 C60 10, 70 15, 75 25 C80 35, 78 45, 75 50 C72 55, 65 58, 60 60 L60 80 C60 85, 55 90, 50 90 C45 90, 40 85, 40 80 L40 60 C35 58, 28 55, 25 50 C22 45, 20 35, 25 25 C30 15, 40 10, 50 10 Z"/>
      </svg>
    `;
    
    // Add FAB styles
    const fabStyles = document.createElement('style');
    fabStyles.textContent = `
      .ios-floating-action-button {
        position: fixed;
        bottom: env(safe-area-inset-bottom, 20px);
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: var(--ios-blue);
        color: white;
        box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
        cursor: pointer;
        z-index: 2147483646;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        -webkit-tap-highlight-color: transparent;
        transform: translateY(100px);
        opacity: 0;
      }
      
      .ios-floating-action-button.visible {
        transform: translateY(0);
        opacity: 1;
      }
      
      .ios-floating-action-button:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 12px 32px rgba(0, 122, 255, 0.4);
      }
      
      .ios-floating-action-button:active {
        transform: scale(0.95);
      }
      
      .ios-floating-action-button .ios-sf-symbol {
        width: 24px;
        height: 24px;
      }
      
      @media (max-width: 480px) {
        .ios-floating-action-button {
          bottom: calc(env(safe-area-inset-bottom, 0px) + 80px);
          right: 16px;
          width: 52px;
          height: 52px;
        }
      }
    `;
    
    document.head.appendChild(fabStyles);
    document.body.appendChild(fab);
    
    // Show FAB after page load
    setTimeout(() => {
      fab.classList.add('visible');
    }, 1000);
    
    // FAB click handler
    fab.addEventListener('click', (e) => {
      e.preventDefault();
      this.triggerHapticFeedback('medium');
      this.togglePanel();
    });
  }

  bindEvents() {
    // Listen for iOS-specific gestures
    if (this.isIOSDevice) {
      // Three-finger tap to open summarizer
      let touchCount = 0;
      let touchTimeout;
      
      document.addEventListener('touchstart', (e) => {
        touchCount = e.touches.length;
        
        if (touchCount === 3) {
          clearTimeout(touchTimeout);
          touchTimeout = setTimeout(() => {
            this.triggerHapticFeedback('heavy');
            this.togglePanel();
          }, 200);
        }
      });
      
      document.addEventListener('touchend', () => {
        if (touchCount < 3) {
          clearTimeout(touchTimeout);
        }
      });
    }
    
    // Keyboard shortcuts (when hardware keyboard is connected)
    document.addEventListener('keydown', (e) => {
      // Command + Shift + S for summarize (iOS with keyboard)
      if (e.metaKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.togglePanel();
      }
    });
    
    // Handle iOS orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.adjustPanelForOrientation();
      }, 100);
    });
  }

  togglePanel() {
    if (this.isVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  showPanel() {
    if (this.panel) {
      this.panel.classList.add('visible');
      this.isVisible = true;
      return;
    }
    
    this.createPanel();
    this.isVisible = true;
    
    // Add panel to DOM
    document.body.appendChild(this.panel);
    
    // Trigger animation
    requestAnimationFrame(() => {
      this.panel.classList.add('visible');
    });
    
    // Update content if page is already analyzed
    if (this.currentSummary) {
      this.displaySummary(this.currentSummary);
    } else {
      this.updateStatus('Ready to analyze', 'ready');
    }
  }

  hidePanel() {
    if (!this.panel) return;
    
    this.panel.classList.remove('visible');
    this.isVisible = false;
    
    setTimeout(() => {
      if (this.panel && this.panel.parentNode) {
        this.panel.parentNode.removeChild(this.panel);
        this.panel = null;
      }
    }, 400);
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'ios-summarizer-panel';
    this.panel.innerHTML = `
      <div class="ios-panel-header">
        <button class="ios-close-button" id="ios-close-btn">×</button>
        <h1 class="ios-panel-title">Web Summarizer AI</h1>
        <div style="width: 32px;"></div>
      </div>
      
      <div class="ios-panel-content">
        <div class="ios-status-card">
          <div class="ios-status-indicator" id="ios-status-indicator"></div>
          <p class="ios-status-text" id="ios-status-text">Ready to analyze</p>
        </div>
        
        <button class="ios-action-button" id="ios-analyze-btn">
          <svg class="ios-sf-symbol" viewBox="0 0 100 100" fill="currentColor">
            <path d="M20 25 L80 25 C82 25, 84 27, 84 29 C84 31, 82 33, 80 33 L20 33 C18 33, 16 31, 16 29 C16 27, 18 25, 20 25 Z M20 45 L70 45 C72 45, 74 47, 74 49 C74 51, 72 53, 70 53 L20 53 C18 53, 16 51, 16 49 C16 47, 18 45, 20 45 Z M20 65 L75 65 C77 65, 79 67, 79 69 C79 71, 77 73, 75 73 L20 73 C18 73, 16 71, 16 69 C16 67, 18 65, 20 65 Z"/>
          </svg>
          Analyze Page
        </button>
        
        <div class="ios-secondary-actions">
          <button class="ios-secondary-button" id="ios-history-btn">
            <svg class="ios-sf-symbol" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 15 C68 15, 83 30, 83 48 C83 66, 68 81, 50 81 C32 81, 17 66, 17 48 C17 30, 32 15, 50 15 Z M50 25 C38 25, 28 35, 28 47 C28 59, 38 69, 50 69 C62 69, 72 59, 72 47 C72 35, 62 25, 50 25 Z"/>
            </svg>
            History
          </button>
          
          <button class="ios-secondary-button" id="ios-settings-btn">
            <svg class="ios-sf-symbol" viewBox="0 0 100 100" fill="currentColor">
              <path d="M85 45 L78 42 C78 40, 78 38, 78 36 L85 33 C87 32, 88 30, 87 28 L84 22 C83 20, 81 19, 79 20 L72 23 C70 21, 68 19, 66 18 L69 11 C70 9, 69 7, 67 6 L61 3 C59 2, 57 3, 56 5 L53 12 C51 12, 49 12, 47 12 L44 5 C43 3, 41 2, 39 3 L33 6 C31 7, 30 9, 31 11 L34 18 C32 19, 30 21, 28 23 L21 20 C19 19, 17 20, 16 22 L13 28 C12 30, 13 32, 15 33 L22 36 C22 38, 22 40, 22 42 L15 45 C13 46, 12 48, 13 50 L16 56 C17 58, 19 59, 21 58 L28 55 C30 57, 32 59, 34 60 L31 67 C30 69, 31 71, 33 72 L39 75 C41 76, 43 75, 44 73 L47 66 C49 66, 51 66, 53 66 L56 73 C57 75, 59 76, 61 75 L67 72 C69 71, 70 69, 69 67 L66 60 C68 59, 70 57, 72 55 L79 58 C81 59, 83 58, 84 56 L87 50 C88 48, 87 46, 85 45 Z"/>
            </svg>
            Settings
          </button>
        </div>
        
        <div class="ios-progress-container" id="ios-progress-container">
          <div class="ios-progress-bar">
            <div class="ios-progress-fill" id="ios-progress-fill"></div>
          </div>
          <p class="ios-progress-text" id="ios-progress-text">Analyzing content...</p>
        </div>
        
        <div class="ios-summary-content" id="ios-summary-content">
          <div class="ios-summary-stats" id="ios-summary-stats"></div>
          <div class="ios-summary-text" id="ios-summary-text"></div>
          <div class="ios-export-actions">
            <button class="ios-export-button" id="ios-copy-btn">
              <svg class="ios-sf-symbol" viewBox="0 0 100 100" fill="currentColor">
                <path d="M20 25 L75 25 C77 25, 79 27, 79 29 L79 65 C79 67, 77 69, 75 69 L65 69 L65 75 C65 77, 63 79, 61 79 L15 79 C13 79, 11 77, 11 75 L11 39 C11 37, 13 35, 15 35 L25 35 L25 29 C25 27, 27 25, 29 25 Z"/>
              </svg>
              Copy
            </button>
            
            <button class="ios-export-button" id="ios-share-btn">
              <svg class="ios-sf-symbol" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 20 C52 20, 54 22, 54 24 L54 50 C54 52, 52 54, 50 54 C48 54, 46 52, 46 50 L46 24 C46 22, 48 20, 50 20 Z M65 35 C67 35, 69 37, 69 39 C69 41, 67 43, 65 43 L35 43 C33 43, 31 41, 31 39 C31 37, 33 35, 35 35 Z"/>
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.bindPanelEvents();
  }

  bindPanelEvents() {
    // Close button
    document.getElementById('ios-close-btn')?.addEventListener('click', () => {
      this.triggerHapticFeedback('light');
      this.hidePanel();
    });
    
    // Analyze button
    document.getElementById('ios-analyze-btn')?.addEventListener('click', () => {
      this.triggerHapticFeedback('medium');
      this.analyzePage();
    });
    
    // History button
    document.getElementById('ios-history-btn')?.addEventListener('click', () => {
      this.triggerHapticFeedback('light');
      this.openHistory();
    });
    
    // Settings button
    document.getElementById('ios-settings-btn')?.addEventListener('click', () => {
      this.triggerHapticFeedback('light');
      this.openSettings();
    });
    
    // Copy button
    document.getElementById('ios-copy-btn')?.addEventListener('click', () => {
      this.triggerHapticFeedback('medium');
      this.copyToClipboard();
    });
    
    // Share button
    document.getElementById('ios-share-btn')?.addEventListener('click', () => {
      this.triggerHapticFeedback('medium');
      this.shareWithSystem();
    });
    
    // Touch gesture handling
    let startY, startTime;
    this.panel.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });
    
    this.panel.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const deltaTime = Date.now() - startTime;
      
      // Swipe down to dismiss (iOS pattern)
      if (deltaY > 50 && deltaTime < 500) {
        e.preventDefault();
        this.hidePanel();
      }
    });
  }

  async analyzePage() {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    this.updateAnalyzingState(true);
    
    try {
      // Extract content
      const content = this.extractPageContent();
      
      if (!content || content.text.length < 100) {
        throw new Error('Insufficient content to analyze');
      }
      
      // Simulate analysis with progress updates
      await this.performAnalysisWithProgress(content);
      
      // Save to history
      await this.saveToHistory({
        title: document.title,
        url: window.location.href,
        content: content.text,
        summary: this.currentSummary,
        timestamp: Date.now()
      });
      
      this.displaySummary(this.currentSummary);
      this.triggerHapticFeedback('success');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      this.updateStatus(error.message || 'Analysis failed', 'error');
      this.triggerHapticFeedback('error');
    } finally {
      this.isAnalyzing = false;
      this.updateAnalyzingState(false);
    }
  }

  extractPageContent() {
    // Use iOS Safari's Reader Mode detection if available
    let content = '';
    
    // Try to use Safari's reader mode content
    const readerContent = document.querySelector('article') ||
                         document.querySelector('main') ||
                         document.querySelector('[role="main"]') ||
                         document.querySelector('.post-content') ||
                         document.querySelector('.entry-content') ||
                         document.querySelector('.article-content');
    
    if (readerContent) {
      // Clean content
      const clone = readerContent.cloneNode(true);
      const unwanted = clone.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, .comments');
      unwanted.forEach(el => el.remove());
      
      content = clone.innerText || clone.textContent || '';
    } else {
      // Fallback to body content
      content = document.body.innerText || document.body.textContent || '';
    }
    
    return {
      title: document.title,
      text: content.trim(),
      wordCount: content.trim().split(/\s+/).length,
      url: window.location.href,
      hasImages: document.querySelectorAll('img').length,
      hasVideos: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length
    };
  }

  async performAnalysisWithProgress(content) {
    const progressContainer = document.getElementById('ios-progress-container');
    const progressFill = document.getElementById('ios-progress-fill');
    const progressText = document.getElementById('ios-progress-text');
    
    progressContainer.style.display = 'block';
    
    // Simulate analysis steps
    const steps = [
      { progress: 20, text: 'Processing content...' },
      { progress: 40, text: 'Extracting key information...' },
      { progress: 60, text: 'Analyzing structure...' },
      { progress: 80, text: 'Generating summary...' },
      { progress: 100, text: 'Complete!' }
    ];
    
    for (const step of steps) {
      progressFill.style.width = `${step.progress}%`;
      progressText.textContent = step.text;
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Generate mock summary (replace with actual AI API)
    this.currentSummary = this.generateMockSummary(content);
    
    setTimeout(() => {
      progressContainer.style.display = 'none';
    }, 500);
  }

  generateMockSummary(content) {
    const sentences = content.text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints = sentences.slice(0, Math.min(5, Math.floor(sentences.length * 0.3)))
                               .map(s => s.trim());
    
    return {
      keyPoints: keyPoints,
      wordCount: content.wordCount,
      readingTime: Math.ceil(content.wordCount / 200),
      extractedAt: new Date().toISOString(),
      mediaElements: {
        images: content.hasImages,
        videos: content.hasVideos
      }
    };
  }

  displaySummary(summary) {
    const summaryContent = document.getElementById('ios-summary-content');
    const summaryStats = document.getElementById('ios-summary-stats');
    const summaryText = document.getElementById('ios-summary-text');
    
    // Update stats
    summaryStats.innerHTML = `
      <div class="ios-stat-item">
        <span class="ios-stat-value">${summary.wordCount.toLocaleString()}</span>
        <span class="ios-stat-label">Words</span>
      </div>
      <div class="ios-stat-item">
        <span class="ios-stat-value">${summary.readingTime}</span>
        <span class="ios-stat-label">Min read</span>
      </div>
      <div class="ios-stat-item">
        <span class="ios-stat-value">${summary.keyPoints.length}</span>
        <span class="ios-stat-label">Key points</span>
      </div>
    `;
    
    // Update summary text
    summaryText.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: var(--label-primary);">Key Points</h3>
      <ul class="ios-key-points">
        ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>
    `;
    
    summaryContent.style.display = 'block';
    this.updateStatus('Analysis complete', 'ready');
  }

  updateStatus(text, state) {
    const statusIndicator = document.getElementById('ios-status-indicator');
    const statusText = document.getElementById('ios-status-text');
    
    if (statusIndicator) {
      statusIndicator.className = `ios-status-indicator ${state}`;
    }
    
    if (statusText) {
      statusText.textContent = text;
    }
  }

  updateAnalyzingState(analyzing) {
    const analyzeBtn = document.getElementById('ios-analyze-btn');
    
    if (analyzing) {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `
        <svg class="ios-sf-symbol" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="50 25" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 50 50;360 50 50"/>
          </circle>
        </svg>
        Analyzing...
      `;
      this.updateStatus('Analyzing content...', 'processing');
    } else {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = `
        <svg class="ios-sf-symbol" viewBox="0 0 100 100" fill="currentColor">
          <path d="M20 25 L80 25 C82 25, 84 27, 84 29 C84 31, 82 33, 80 33 L20 33 C18 33, 16 31, 16 29 C16 27, 18 25, 20 25 Z M20 45 L70 45 C72 45, 74 47, 74 49 C74 51, 72 53, 70 53 L20 53 C18 53, 16 51, 16 49 C16 47, 18 45, 20 45 Z M20 65 L75 65 C77 65, 79 67, 79 69 C79 71, 77 73, 75 73 L20 73 C18 73, 16 71, 16 69 C16 67, 18 65, 20 65 Z"/>
        </svg>
        Analyze Page
      `;
    }
  }

  triggerHapticFeedback(type) {
    if (!this.supportsHaptics) return;
    
    // Use navigator.vibrate for basic haptic feedback
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate([20, 10, 20]);
          break;
        case 'success':
          navigator.vibrate([10, 5, 10, 5, 30]);
          break;
        case 'error':
          navigator.vibrate([50, 10, 50]);
          break;
      }
    }
    
    // Visual feedback for haptics
    const elements = document.querySelectorAll('.ios-action-button, .ios-secondary-button');
    elements.forEach(el => {
      el.classList.add(`ios-haptic-${type === 'heavy' ? 'medium' : 'light'}`);
      setTimeout(() => {
        el.classList.remove(`ios-haptic-${type === 'heavy' ? 'medium' : 'light'}`);
      }, 150);
    });
  }

  adjustPanelForOrientation() {
    if (!this.panel) return;
    
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape && this.isIOSDevice) {
      this.panel.style.width = 'min(450px, calc(100vw - 32px))';
      this.panel.style.maxHeight = 'calc(100vh - 32px)';
    } else {
      this.panel.style.width = 'min(400px, calc(100vw - 32px))';
      this.panel.style.maxHeight = 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)';
    }
  }

  async copyToClipboard() {
    if (!this.currentSummary) return;
    
    const text = this.currentSummary.keyPoints.join('\n\n');
    
    try {
      await navigator.clipboard.writeText(text);
      this.updateStatus('Copied to clipboard', 'ready');
      setTimeout(() => {
        this.updateStatus('Analysis complete', 'ready');
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }

  shareWithSystem() {
    if (!this.currentSummary) return;
    
    const text = this.currentSummary.keyPoints.join('\n\n');
    const title = document.title;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `Summary: ${title}`,
        text: text,
        url: url
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      this.copyToClipboard();
    }
  }

  async saveToHistory(entry) {
    try {
      // Send to background script for storage
      if (typeof browser !== 'undefined' && browser.runtime) {
        browser.runtime.sendMessage({
          action: 'saveHistory',
          data: entry
        });
      }
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  }

  openHistory() {
    if (typeof browser !== 'undefined' && browser.runtime) {
      browser.runtime.sendMessage({
        action: 'openHistory'
      });
    }
  }

  openSettings() {
    if (typeof browser !== 'undefined' && browser.runtime) {
      browser.runtime.sendMessage({
        action: 'openSettings'
      });
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'togglePanel':
        this.togglePanel();
        sendResponse({ success: true });
        break;
        
      case 'analyzePage':
        this.showPanel();
        setTimeout(() => {
          this.analyzePage();
        }, 300);
        sendResponse({ success: true });
        break;
        
      case 'getPageContent':
        const content = this.extractPageContent();
        sendResponse({ content: content });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }
}

// Initialize iOS Safari Summarizer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.iosSafariSummarizer = new iOSSafariSummarizer();
  });
} else {
  window.iosSafariSummarizer = new iOSSafariSummarizer();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = iOSSafariSummarizer;
}