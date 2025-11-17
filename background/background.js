// Privacy-focused background script - no external connections or tracking
class BackgroundController {
  constructor() {
    this.initializeExtension();
  }

  initializeExtension() {
    // Handle extension installation and updates
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle browser action clicks (for browsers that support it)
    if (chrome.action && chrome.action.onClicked) {
      chrome.action.onClicked.addListener((tab) => {
        this.handleActionClick(tab);
      });
    }

    // Handle context menu creation
    this.createContextMenus();

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open
    });

    // Handle tab updates to update badge
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    console.log('Web Summarizer AI - Background script loaded');
  }

  async handleInstallation(details) {
    try {
      if (details.reason === 'install') {
        // First-time installation
        console.log('Extension installed for the first time');
        
        // Set default settings
        await chrome.storage.local.set({
          summaryLength: 'medium',
          language: 'auto',
          autoSummarize: false,
          showFloatingButton: true,
          installDate: Date.now(),
          version: '1.0.0'
        });

        // Open welcome page
        chrome.tabs.create({
          url: chrome.runtime.getURL('options/options.html?welcome=true')
        });

      } else if (details.reason === 'update') {
        // Extension update
        console.log('Extension updated');
        
        // Migrate settings if necessary
        await this.migrateSettings(details.previousVersion);
      }
    } catch (error) {
      console.error('Installation handling error:', error);
    }
  }

  async migrateSettings(previousVersion) {
    try {
      // Get current settings
      const settings = await chrome.storage.local.get();
      
      // Add new settings introduced in updates
      const defaultNewSettings = {
        showFloatingButton: true // Example of new setting
      };

      // Merge with defaults for any missing settings
      const updatedSettings = { ...defaultNewSettings, ...settings };
      updatedSettings.version = '1.0.0';
      
      await chrome.storage.local.set(updatedSettings);
      console.log('Settings migrated successfully');
    } catch (error) {
      console.error('Settings migration error:', error);
    }
  }

  createContextMenus() {
    try {
      // Remove existing context menus
      chrome.contextMenus.removeAll(() => {
        // Create summarize context menu
        chrome.contextMenus.create({
          id: 'summarize-page',
          title: '📄 Summarize this page',
          contexts: ['page'],
          documentUrlPatterns: ['http://*/*', 'https://*/*']
        });

        chrome.contextMenus.create({
          id: 'summarize-selection',
          title: '📝 Summarize selected text',
          contexts: ['selection'],
          documentUrlPatterns: ['http://*/*', 'https://*/*']
        });

        chrome.contextMenus.create({
          id: 'separator',
          type: 'separator',
          contexts: ['page', 'selection']
        });

        chrome.contextMenus.create({
          id: 'open-options',
          title: '⚙️ Extension Settings',
          contexts: ['page']
        });
      });

      // Handle context menu clicks
      chrome.contextMenus.onClicked.addListener((info, tab) => {
        this.handleContextMenuClick(info, tab);
      });

    } catch (error) {
      console.error('Context menu creation error:', error);
    }
  }

  async handleContextMenuClick(info, tab) {
    try {
      switch (info.menuItemId) {
        case 'summarize-page':
          await this.sendMessageToTab(tab.id, { action: 'summarize' });
          break;
          
        case 'summarize-selection':
          await this.sendMessageToTab(tab.id, { 
            action: 'summarizeSelection',
            selectedText: info.selectionText
          });
          break;
          
        case 'open-options':
          chrome.runtime.openOptionsPage();
          break;
      }
    } catch (error) {
      console.error('Context menu click error:', error);
    }
  }

  async handleActionClick(tab) {
    try {
      // Open summary panel when extension icon is clicked
      await this.sendMessageToTab(tab.id, { action: 'openPanel' });
    } catch (error) {
      console.error('Action click error:', error);
      
      // Fallback: open popup if content script communication fails
      chrome.action.setPopup({ popup: 'popup/popup.html' });
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getSettings':
          const settings = await chrome.storage.local.get();
          sendResponse({ success: true, settings });
          break;

        case 'saveSettings':
          await chrome.storage.local.set(request.settings);
          sendResponse({ success: true });
          break;

        case 'updateBadge':
          await this.updateBadge(sender.tab.id, request.text, request.color);
          sendResponse({ success: true });
          break;

        case 'openOptionsPage':
          chrome.runtime.openOptionsPage();
          sendResponse({ success: true });
          break;

        case 'getTabInfo':
          const tab = await chrome.tabs.get(sender.tab.id);
          sendResponse({ success: true, tab });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Message handling error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async sendMessageToTab(tabId, message) {
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      console.error('Failed to send message to tab:', error);
      throw error;
    }
  }

  async updateBadge(tabId, text, color = '#1a73e8') {
    try {
      await chrome.action.setBadgeText({ text, tabId });
      await chrome.action.setBadgeBackgroundColor({ color, tabId });
    } catch (error) {
      console.error('Badge update error:', error);
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // Clear badge when navigating to new page
    if (changeInfo.status === 'loading') {
      this.updateBadge(tabId, '');
    }

    // Check if the page supports summarization
    if (changeInfo.status === 'complete' && tab.url) {
      this.checkPageCompatibility(tab);
    }
  }

  async checkPageCompatibility(tab) {
    try {
      const url = new URL(tab.url);
      
      // Check for restricted URLs
      const restrictedProtocols = ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'moz-extension:'];
      const isRestricted = restrictedProtocols.some(protocol => url.protocol.startsWith(protocol));
      
      if (isRestricted) {
        // Disable extension on restricted pages
        await chrome.action.setIcon({
          tabId: tab.id,
          path: {
            16: 'icons/icon16-disabled.png',
            32: 'icons/icon32-disabled.png',
            48: 'icons/icon48-disabled.png',
            128: 'icons/icon128-disabled.png'
          }
        });
        await chrome.action.setTitle({
          tabId: tab.id,
          title: 'Web Summarizer AI - Not available on this page'
        });
      } else {
        // Enable extension on compatible pages
        await chrome.action.setIcon({
          tabId: tab.id,
          path: {
            16: 'icons/icon16.png',
            32: 'icons/icon32.png',
            48: 'icons/icon48.png',
            128: 'icons/icon128.png'
          }
        });
        
        let title = 'Web Summarizer AI - Click to summarize this page';
        
        // Special handling for YouTube
        if (url.hostname === 'www.youtube.com' && url.pathname === '/watch') {
          title = 'Web Summarizer AI - Summarize this YouTube video';
        }
        
        await chrome.action.setTitle({ tabId: tab.id, title });
      }
    } catch (error) {
      console.error('Page compatibility check error:', error);
    }
  }
}

// Initialize background controller
new BackgroundController();