// Privacy-focused options page script
class OptionsController {
  constructor() {
    this.defaultSettings = {
      language: 'auto',
      showFloatingButton: true,
      contextMenu: true,
      youtubeButton: true,
      autoTranscript: true,
      useCustomPrompt: false,
      customPrompt: '',
      enableAI: true,
      useChatGPTWeb: true,
      aiProvider: 'none',
      apiKey: '',
      aiModel: 'gpt-4o-mini',
      useApiForLargeContent: false
    };

    this.promptTemplates = this.getPromptTemplates();
    
    this.initialize();
  }

  initialize() {
    this.initializeElements();
    this.setupNavigation();
    this.loadSettings();
    this.attachEventListeners();
    this.checkWelcomeMode();
    this.updateBrowserInfo();
  }

  initializeElements() {
    this.elements = {
      // Navigation
      navButtons: document.querySelectorAll('.nav-btn'),
      sections: document.querySelectorAll('.settings-section'),
      
      // Settings inputs
      defaultLanguage: document.getElementById('defaultLanguage'),
      showFloatingButton: document.getElementById('showFloatingButton'),
      contextMenu: document.getElementById('contextMenu'),
      youtubeButton: document.getElementById('youtubeButton'),
      autoTranscript: document.getElementById('autoTranscript'),
      
      // AI settings
      enableAI: document.getElementById('enableAI'),
      useChatGPTWeb: document.getElementById('useChatGPTWeb'),
      aiProvider: document.getElementById('aiProvider'),
      apiKey: document.getElementById('apiKey'),
      aiModel: document.getElementById('aiModel'),
      useApiForLargeContent: document.getElementById('useApiForLargeContent'),
      apiKeyContainer: document.getElementById('apiKeyContainer'),
      modelContainer: document.getElementById('modelContainer'),
      
      // Custom prompt (simplified to single field)
      useCustomPrompt: document.getElementById('useCustomPrompt'),
      customPrompt: document.getElementById('customPrompt'),
      customPromptSettings: document.getElementById('customPromptSettings'),
      
      // Actions
      saveSettings: document.getElementById('saveSettings'),
      resetSettings: document.getElementById('resetSettings'),
      
      // Info elements
      notification: document.getElementById('notification'),
      releaseDate: document.getElementById('releaseDate'),
      browserInfo: document.getElementById('browserInfo')
    };
  }

  setupNavigation() {
    this.elements.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const sectionId = btn.dataset.section;
        this.showSection(sectionId);
        
        // Update active nav button
        this.elements.navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  showSection(sectionId) {
    this.elements.sections.forEach(section => {
      section.classList.remove('active');
      if (section.id === sectionId) {
        section.classList.add('active');
      }
    });
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.local.get(this.defaultSettings);
      
      // Apply settings to UI
      this.elements.defaultLanguage.value = settings.language;
      this.elements.showFloatingButton.checked = settings.showFloatingButton;
      this.elements.contextMenu.checked = settings.contextMenu;
      this.elements.youtubeButton.checked = settings.youtubeButton;
      this.elements.autoTranscript.checked = settings.autoTranscript;
      
      // AI settings
      this.elements.enableAI.checked = settings.enableAI !== undefined ? settings.enableAI : true;
      this.elements.useChatGPTWeb.checked = settings.useChatGPTWeb !== undefined ? settings.useChatGPTWeb : true;
      this.elements.aiProvider.value = settings.aiProvider || 'none';
      this.elements.apiKey.value = settings.apiKey || '';
      this.elements.aiModel.value = settings.aiModel || 'gpt-4o-mini';
      this.elements.useApiForLargeContent.checked = settings.useApiForLargeContent || false;
      
      // Show/hide API settings and update model options
      this.updateProviderUI(settings.aiProvider || 'none');
      
      // Custom prompt
      this.elements.useCustomPrompt.checked = settings.useCustomPrompt;
      this.elements.customPrompt.value = settings.customPrompt || '';
      
      // Show/hide custom prompt settings based on checkbox
      this.toggleCustomPromptSettings(settings.useCustomPrompt);
      
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showNotification('Error loading settings', 'error');
    }
  }

  attachEventListeners() {
    // Save settings button
    this.elements.saveSettings.addEventListener('click', () => {
      this.saveSettings();
    });

    // Reset settings button
    this.elements.resetSettings.addEventListener('click', () => {
      this.resetSettings();
    });

    // AI toggle
    this.elements.enableAI.addEventListener('change', () => {
      this.autoSave();
    });
    
    this.elements.useChatGPTWeb.addEventListener('change', () => {
      this.autoSave();
    });
    
    // API provider change
    this.elements.aiProvider.addEventListener('change', () => {
      this.updateProviderUI(this.elements.aiProvider.value);
      this.autoSave();
    });
    
    this.elements.apiKey.addEventListener('input', () => {
      this.autoSave();
    });
    
    this.elements.aiModel.addEventListener('change', () => {
      this.autoSave();
    });
    
    this.elements.useApiForLargeContent.addEventListener('change', () => {
      this.autoSave();
    });

    // Custom prompt toggle
    this.elements.useCustomPrompt.addEventListener('change', () => {
      this.toggleCustomPromptSettings(this.elements.useCustomPrompt.checked);
      this.autoSave();
    });

    // Auto-save on change for better UX
    const inputs = [
      this.elements.defaultLanguage,
      this.elements.showFloatingButton,
      this.elements.contextMenu,
      this.elements.youtubeButton,
      this.elements.autoTranscript,
      this.elements.enableAI,
      this.elements.useChatGPTWeb,
      this.elements.aiProvider,
      this.elements.apiKey,
      this.elements.aiModel,
      this.elements.useApiForLargeContent,
      this.elements.useCustomPrompt,
      this.elements.customPrompt
    ];

    inputs.forEach(input => {
      const eventType = input.type === 'checkbox' ? 'change' : input.tagName === 'TEXTAREA' ? 'input' : 'change';
      input.addEventListener(eventType, () => {
        this.autoSave();
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            this.saveSettings();
            break;
          case 'r':
            e.preventDefault();
            this.resetSettings();
            break;
        }
      }
    });
  }

  async saveSettings() {
    try {
      const settings = {
        language: this.elements.defaultLanguage.value,
        showFloatingButton: this.elements.showFloatingButton.checked,
        contextMenu: this.elements.contextMenu.checked,
        youtubeButton: this.elements.youtubeButton.checked,
        autoTranscript: this.elements.autoTranscript.checked,
        enableAI: this.elements.enableAI.checked,
        useChatGPTWeb: this.elements.useChatGPTWeb.checked,
        aiProvider: this.elements.aiProvider.value,
        apiKey: this.elements.apiKey.value,
        aiModel: this.elements.aiModel.value,
        useApiForLargeContent: this.elements.useApiForLargeContent.checked,
        useCustomPrompt: this.elements.useCustomPrompt.checked,
        customPrompt: this.elements.customPrompt.value,
        lastUpdated: Date.now()
      };

      await chrome.storage.local.set(settings);
      
      // Update save button state
      const originalText = this.elements.saveSettings.innerHTML;
      this.elements.saveSettings.innerHTML = '✅ Saved!';
      this.elements.saveSettings.disabled = true;
      
      setTimeout(() => {
        this.elements.saveSettings.innerHTML = originalText;
        this.elements.saveSettings.disabled = false;
      }, 2000);

      this.showNotification('Settings saved successfully!');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showNotification('Error saving settings', 'error');
    }
  }

  async autoSave() {
    try {
      const settings = {
        language: this.elements.defaultLanguage.value,
        showFloatingButton: this.elements.showFloatingButton.checked,
        contextMenu: this.elements.contextMenu.checked,
        youtubeButton: this.elements.youtubeButton.checked,
        autoTranscript: this.elements.autoTranscript.checked,
        enableAI: this.elements.enableAI.checked,
        useChatGPTWeb: this.elements.useChatGPTWeb.checked,
        aiProvider: this.elements.aiProvider.value,
        apiKey: this.elements.apiKey.value,
        aiModel: this.elements.aiModel.value,
        useApiForLargeContent: this.elements.useApiForLargeContent.checked,
        useCustomPrompt: this.elements.useCustomPrompt.checked,
        customPrompt: this.elements.customPrompt.value,
        lastUpdated: Date.now()
      };

      await chrome.storage.local.set(settings);
      
    } catch (error) {
      console.error('Error auto-saving settings:', error);
    }
  }

  async resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    try {
      // Clear all settings
      await chrome.storage.local.clear();
      
      // Set defaults
      await chrome.storage.local.set({
        ...this.defaultSettings,
        installDate: Date.now(),
        version: '1.0.0'
      });
      
      // Reload settings in UI
      await this.loadSettings();
      
      this.showNotification('Settings reset to defaults');
      
    } catch (error) {
      console.error('Error resetting settings:', error);
      this.showNotification('Error resetting settings', 'error');
    }
  }

  showNotification(message, type = 'success') {
    const notification = this.elements.notification;
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  checkWelcomeMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('welcome') === 'true') {
      // Show welcome message
      setTimeout(() => {
        this.showWelcomeMessage();
      }, 1000);
    }
  }

  showWelcomeMessage() {
    const message = `Welcome to Web Summary AI! 🎉

This privacy-focused extension helps you summarize web content without any data collection or tracking.

Key features:
• Zero data collection
• Local processing only  
• Open source code
• Works with any AI service

Your settings are ready to use. Enjoy summarizing!`;

    alert(message);
  }

  updateBrowserInfo() {
    // Detect browser
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    }
    
    this.elements.browserInfo.textContent = browser;
    
    // Update release date
    this.elements.releaseDate.textContent = 'October 2024';
  }

  toggleCustomPromptSettings(show) {
    if (this.elements.customPromptSettings) {
      this.elements.customPromptSettings.style.display = show ? 'block' : 'none';
    }
  }

  getPromptTemplates() {
    return {
      academic: {
        short: "Provide a concise academic summary of the following content from '{title}'. Focus on key concepts, methodologies, and findings:\n\n{content}\n\nSummarize in 2-3 sentences with academic precision.",
        medium: "Analyze and summarize the following academic content from '{title}'. Include main arguments, evidence, methodologies, and conclusions:\n\n{content}\n\nProvide a structured summary in 1-2 paragraphs covering key points and implications.",
        detailed: "Conduct a comprehensive academic analysis of the following content from '{title}'. Include theoretical framework, methodology, key findings, limitations, and implications:\n\n{content}\n\nProvide a detailed summary with critical analysis and scholarly perspective."
      },
      business: {
        short: "Create a brief executive summary of the following business content from '{title}':\n\n{content}\n\nHighlight key business insights, metrics, and actionable takeaways in 2-3 sentences.",
        medium: "Summarize the following business content from '{title}' with focus on strategic implications:\n\n{content}\n\nProvide 1-2 paragraphs covering key business points, metrics, opportunities, and recommendations.",
        detailed: "Analyze the following business content from '{title}' for strategic insights:\n\n{content}\n\nProvide comprehensive summary including market analysis, financial implications, risks, opportunities, and strategic recommendations."
      },
      news: {
        short: "Summarize this news article from '{title}' in a brief, factual manner:\n\n{content}\n\nProvide the who, what, when, where, and why in 2-3 sentences.",
        medium: "Create a news digest of the following article from '{title}':\n\n{content}\n\nSummarize in 1-2 paragraphs covering key facts, context, and implications.",
        detailed: "Provide comprehensive news analysis of the following article from '{title}':\n\n{content}\n\nInclude detailed summary, background context, stakeholder perspectives, and potential implications."
      },
      technical: {
        short: "Provide a concise technical summary of the following documentation from '{title}':\n\n{content}\n\nFocus on key functionality, requirements, and implementation details in 2-3 sentences.",
        medium: "Summarize the following technical content from '{title}' for developers:\n\n{content}\n\nProvide 1-2 paragraphs covering technical specifications, implementation details, and usage guidelines.",
        detailed: "Create comprehensive technical documentation summary from '{title}':\n\n{content}\n\nInclude detailed technical analysis, architecture overview, implementation steps, configuration requirements, and troubleshooting considerations."
      },
      creative: {
        short: "Provide an engaging summary of the following creative content from '{title}':\n\n{content}\n\nCapture the essence, style, and key themes in 2-3 compelling sentences.",
        medium: "Summarize the following creative work from '{title}' with artistic perspective:\n\n{content}\n\nProvide 1-2 paragraphs covering themes, artistic elements, and creative impact.",
        detailed: "Analyze the following creative content from '{title}' with depth and insight:\n\n{content}\n\nProvide comprehensive analysis including themes, artistic techniques, cultural context, and creative significance."
      }
    };
  }

  loadPromptTemplate() {
    const selectedTemplate = this.elements.promptTemplates.value;
    if (!selectedTemplate || !this.promptTemplates[selectedTemplate]) {
      return;
    }

    const template = this.promptTemplates[selectedTemplate];
    
    // Set default prompts if textareas are empty
    if (!this.elements.customPromptShort.value.trim()) {
      this.elements.customPromptShort.value = template.short;
    }
    if (!this.elements.customPromptMedium.value.trim()) {
      this.elements.customPromptMedium.value = template.medium;
    }
    if (!this.elements.customPromptDetailed.value.trim()) {
      this.elements.customPromptDetailed.value = template.detailed;
    }

    // Reset template selector
    this.elements.promptTemplates.value = '';
    
    // Auto-save the changes
    this.autoSave();
  }
}

// Initialize options controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});