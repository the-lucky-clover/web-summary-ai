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
        enableAI: true,
        useChatGPTWeb: true,
        aiProvider: 'none',
        apiKey: '',
        aiModel: 'gpt-4o-mini',
        useApiForLargeContent: false
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
      if (this.settings.enableAI) {
        // Check for large content and decide which method to use
        const contentLength = response.content.length;
        const isLargeContent = contentLength > 12000; // ~3000 tokens
        
        // Use API if: provider configured AND (always use API OR content is large and useApiForLargeContent enabled)
        const useAPI = this.settings.aiProvider !== 'none' && this.settings.apiKey &&
                       (this.settings.useApiForLargeContent || !this.settings.useChatGPTWeb);
        
        if (useAPI && isLargeContent && this.settings.useApiForLargeContent) {
          // Large content + API configured for large content
          this.setStatus('loading', 'Processing with API (large content)...');
          this.elements.summaryContent.innerHTML = '<p class="loading-message">🔄 Chunking and processing large content...</p>';
          
          try {
            const aiSummary = await this.processWithAPI(prompt, response.content);
            this.currentSummary = aiSummary;
            this.elements.summaryContent.textContent = aiSummary;
            this.setStatus('success', 'AI summary ready');
          } catch (error) {
            console.error('API processing failed:', error);
            // Fallback to ChatGPT web
            if (this.settings.useChatGPTWeb) {
              this.currentSummary = await this.tryChatGPTWeb(prompt);
            } else {
              throw error;
            }
          }
        } else if (useAPI && !this.settings.useChatGPTWeb) {
          // API-only mode
          this.setStatus('loading', 'Calling API...');
          this.elements.summaryContent.innerHTML = '<p class="loading-message">⚡ Generating AI summary...</p>';
          
          try {
            const aiSummary = await this.processWithAPI(prompt, response.content);
            this.currentSummary = aiSummary;
            this.elements.summaryContent.textContent = aiSummary;
            this.setStatus('success', 'AI summary ready');
          } catch (error) {
            console.error('API failed:', error);
            this.currentSummary = prompt + `\n\n⚠️ API Error: ${error.message}\n📋 Copy the prompt above and use it manually.`;
            this.elements.summaryContent.textContent = this.currentSummary;
            this.setStatus('error', error.message);
          }
        } else if (this.settings.useChatGPTWeb) {
          // Default: ChatGPT web mode
          this.setStatus('loading', 'Opening ChatGPT...');
          this.elements.summaryContent.innerHTML = '<p class="loading-message">🌐 Opening ChatGPT.com...</p>';
          
          try {
            this.currentSummary = await this.tryChatGPTWeb(prompt);
          } catch (error) {
            console.error('ChatGPT web failed:', error);
            this.currentSummary = prompt + `\n\n⚠️ Error: ${error.message}\n📋 Copy the prompt above and use it manually.`;
            this.elements.summaryContent.textContent = this.currentSummary;
            this.setStatus('error', error.message);
          }
        } else {
          // No AI method configured
          this.currentSummary = prompt + '\n\n⚠️ No AI method configured. Enable ChatGPT web or add an API key in settings.';
          this.elements.summaryContent.textContent = this.currentSummary;
          this.setStatus('warning', 'AI not configured');
        }
      } else {
        // No AI configured, show the prompt
        this.currentSummary = prompt;
        this.elements.summaryContent.textContent = prompt;
        this.setStatus('success', 'Prompt ready');
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

  async sendToChatGPTWeb(prompt) {
    return new Promise(async (resolve, reject) => {
      try {
        // First, check if user is logged in by opening ChatGPT briefly
        this.setStatus('loading', 'Checking ChatGPT login status...');
        this.elements.summaryContent.innerHTML = '<p class="loading-message">🔐 Verifying ChatGPT access...</p>';
        
        const checkTab = await chrome.tabs.create({ url: 'https://chatgpt.com', active: false });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check login status
        const loginStatus = await new Promise((resolveLogin) => {
          chrome.tabs.sendMessage(checkTab.id, { action: 'checkChatGPTLogin' }, (response) => {
            if (chrome.runtime.lastError) {
              resolveLogin({ loggedIn: false, needsCloudflare: false });
            } else {
              resolveLogin(response || { loggedIn: false, needsCloudflare: false });
            }
          });
        });
        
        // Handle login/Cloudflare requirements
        if (loginStatus.needsCloudflare) {
          // Show Cloudflare tab to user
          chrome.tabs.update(checkTab.id, { active: true });
          this.elements.summaryContent.innerHTML = 
            '<p class="loading-message" style="color: #f59e0b;">⚠️ Cloudflare Verification Required</p>' +
            '<p>Please complete the security check in the ChatGPT tab, then click the refresh button below.</p>';
          reject(new Error('Cloudflare verification required. Please complete the check and try again.'));
          return;
        }
        
        if (!loginStatus.loggedIn) {
          // Show login tab to user
          chrome.tabs.update(checkTab.id, { active: true });
          this.elements.summaryContent.innerHTML = 
            '<p class="loading-message" style="color: #ea4335;">🔐 ChatGPT Login Required</p>' +
            '<p>Please log in to ChatGPT in the new tab, then click the refresh button below to generate your summary.</p>';
          reject(new Error('Please log in to ChatGPT and try again.'));
          return;
        }
        
        // User is logged in, proceed with summary in background
        this.setStatus('loading', 'Generating AI summary...');
        this.elements.summaryContent.innerHTML = '<p class="loading-message">🤖 Processing in background...</p>';
        
        // Navigate to prompt URL (stays in background)
        const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
        await chrome.tabs.update(checkTab.id, { url: chatgptUrl });
        
        // Set up listener for the response
        let checkCount = 0;
        const maxChecks = 90; // 90 seconds timeout for generation
        let tabClosed = false;

        const checkForResponse = setInterval(() => {
          checkCount++;

          if (checkCount >= maxChecks) {
            clearInterval(checkForResponse);
            if (!tabClosed) {
              chrome.tabs.remove(checkTab.id).catch(() => {});
            }
            resolve('⏱️ Response timeout. The AI may be taking longer than expected.\n\nPlease try again or use a shorter prompt.');
            return;
          }

          // Try to get response from background tab
          chrome.tabs.sendMessage(checkTab.id, { action: 'getChatGPTResponse' }, (response) => {
            if (chrome.runtime.lastError) {
              // Tab not ready yet or closed
              return;
            }

            if (response && response.success && response.content && response.content.length > 50) {
              clearInterval(checkForResponse);
              
              // Close the background tab silently
              chrome.tabs.remove(checkTab.id).catch(() => {});
              tabClosed = true;
              
              resolve(response.content);
            }
          });
        }, 1000);

        // Update status periodically
        const statusUpdates = [
          { time: 5000, message: '⏳ ChatGPT is thinking...' },
          { time: 15000, message: '📝 Generating summary...' },
          { time: 30000, message: '⏱️ Almost there...' }
        ];
        
        statusUpdates.forEach(update => {
          setTimeout(() => {
            if (checkCount < maxChecks && !tabClosed) {
              this.elements.summaryContent.innerHTML = `<p class="loading-message">${update.message}<br><br>Processing silently in background...</p>`;
            }
          }, update.time);
        });
        
      } catch (error) {
        reject(error);
      }
    });
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
  
  /**
   * Try ChatGPT web method with error handling
   */
  async tryChatGPTWeb(prompt) {
    try {
      const aiSummary = await this.sendToChatGPTWeb(prompt);
      this.elements.summaryContent.textContent = aiSummary;
      this.setStatus('success', 'AI summary ready');
      return aiSummary;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Process content with API (handles chunking for large content)
   */
  async processWithAPI(prompt, content) {
    // Load text chunker utility
    const chunker = new TextChunker();
    const provider = this.settings.aiProvider;
    const model = this.settings.aiModel;
    
    // Check if content needs chunking
    if (chunker.needsChunking(content, model)) {
      this.elements.summaryContent.innerHTML = '<p class="loading-message">📦 Large content detected. Breaking into chunks...</p>';
      
      // Create chunked prompts
      const chunks = chunker.createChunkedPrompts(content, prompt, model);
      
      this.elements.summaryContent.innerHTML = `<p class="loading-message">🔄 Processing ${chunks.length} chunks...<br><br>This may take a moment...</p>`;
      
      // Process with AI provider
      const aiProvider = new AIProvider();
      const summary = await aiProvider.processChunkedContent(
        provider,
        this.settings.apiKey,
        model,
        chunks
      );
      
      return summary;
    } else {
      // Content is small enough for single request
      this.elements.summaryContent.innerHTML = '<p class="loading-message">⚡ Generating summary...</p>';
      
      const aiProvider = new AIProvider();
      const summary = await aiProvider.callAPI(
        provider,
        this.settings.apiKey,
        model,
        prompt
      );
      
      return summary;
    }
  }
}

// Load utility classes
// Note: These are loaded via script tags in popup.html
class TextChunker {
  constructor(options = {}) {
    this.tokenLimits = {
      'chatgpt-web': 3000,
      'gpt-4o-mini': 120000,
      'gpt-4o': 120000,
      'gpt-4': 7000,
      'claude-3-haiku-20240307': 180000,
      'claude-3-5-sonnet-20241022': 180000,
      'claude-3-opus-20240229': 180000,
      'gemini-1.5-flash': 950000,
      'gemini-1.5-pro': 1900000
    };
    this.charsPerToken = 4;
    this.maxChunkTokens = options.maxChunkTokens || 3000;
  }
  
  estimateTokens(text) {
    return Math.ceil(text.length / this.charsPerToken);
  }
  
  getTokenLimit(model) {
    return this.tokenLimits[model] || this.tokenLimits['chatgpt-web'];
  }
  
  needsChunking(text, model = 'chatgpt-web') {
    const tokenCount = this.estimateTokens(text);
    const limit = this.getTokenLimit(model);
    return tokenCount > (limit * 0.8);
  }
  
  splitIntoSentences(text) {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }
  
  splitIntoParagraphs(text) {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  }
  
  chunkText(text, maxTokens = null) {
    const targetTokens = maxTokens || this.maxChunkTokens;
    const targetChars = targetTokens * this.charsPerToken;
    
    if (this.estimateTokens(text) <= targetTokens) {
      return [{text: text, index: 0, tokens: this.estimateTokens(text)}];
    }
    
    const chunks = [];
    let paragraphs = this.splitIntoParagraphs(text);
    let currentChunk = '';
    let currentIndex = 0;
    
    for (let paragraph of paragraphs) {
      const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
      
      if (this.estimateTokens(testChunk) > targetTokens && currentChunk) {
        chunks.push({text: currentChunk, index: currentIndex, tokens: this.estimateTokens(currentChunk)});
        currentChunk = paragraph;
        currentIndex++;
      } else {
        currentChunk = testChunk;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push({text: currentChunk, index: currentIndex, tokens: this.estimateTokens(currentChunk)});
    }
    
    return chunks;
  }
  
  createChunkedPrompts(text, basePrompt, model = 'chatgpt-web') {
    const limit = this.getTokenLimit(model);
    const chunks = this.chunkText(text, limit * 0.7);
    
    if (chunks.length === 1) {
      return [{prompt: basePrompt + '\n\n' + chunks[0].text, chunkInfo: {index: 0, total: 1, tokens: chunks[0].tokens}}];
    }
    
    return chunks.map((chunk, index) => {
      const chunkInfo = `[Part ${index + 1} of ${chunks.length}]`;
      let prompt = '';
      
      if (index === 0) {
        prompt = `${basePrompt}\n\n${chunkInfo}\nThis is a multi-part content. Summarize this first part:\n\n${chunk.text}`;
      } else if (index === chunks.length - 1) {
        prompt = `${chunkInfo}\nThis is the final part. Provide a comprehensive summary:\n\n${chunk.text}`;
      } else {
        prompt = `${chunkInfo}\nContinue summarizing:\n\n${chunk.text}`;
      }
      
      return {prompt, chunkInfo: {index, total: chunks.length, tokens: chunk.tokens}};
    });
  }
}

class AIProvider {
  constructor() {
    this.endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      anthropic: 'https://api.anthropic.com/v1/messages',
      google: 'https://generativelanguage.googleapis.com/v1beta/models/'
    };
  }
  
  async callOpenAI(apiKey, model, prompt) {
    const response = await fetch(this.endpoints.openai, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`},
      body: JSON.stringify({
        model: model,
        messages: [{role: 'user', content: prompt}],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async callAnthropic(apiKey, model, prompt) {
    const response = await fetch(this.endpoints.anthropic, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01'},
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        messages: [{role: 'user', content: prompt}]
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  }
  
  async callGoogle(apiKey, model, prompt) {
    const url = `${this.endpoints.google}${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{parts: [{text: prompt}]}],
        generationConfig: {temperature: 0.7, maxOutputTokens: 2000}
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
  
  async callAPI(provider, apiKey, model, prompt) {
    if (!apiKey) throw new Error(`API key required for ${provider}`);
    
    switch (provider) {
      case 'openai': return await this.callOpenAI(apiKey, model, prompt);
      case 'anthropic': return await this.callAnthropic(apiKey, model, prompt);
      case 'google': return await this.callGoogle(apiKey, model, prompt);
      default: throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  
  async processChunkedContent(provider, apiKey, model, chunks) {
    const summaries = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const summary = await this.callAPI(provider, apiKey, model, chunk.prompt);
      summaries.push({chunkIndex: chunk.chunkInfo.index, summary: summary, tokens: chunk.chunkInfo.tokens});
      
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (summaries.length > 1) {
      const combinedSummaries = summaries.map((s, i) => `Part ${i + 1}:\n${s.summary}`).join('\n\n');
      const synthesisPrompt = `Based on these summaries, provide a comprehensive final summary:\n\n${combinedSummaries}`;
      
      try {
        return await this.callAPI(provider, apiKey, model, synthesisPrompt);
      } catch (error) {
        return combinedSummaries;
      }
    }
    
    return summaries[0].summary;
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});