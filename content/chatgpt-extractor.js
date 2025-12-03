// ChatGPT Response Extractor
// Extracts AI responses from ChatGPT.com and checks login status

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkChatGPTLogin') {
    // Check if user is logged in to ChatGPT
    try {
      const loginIndicators = [
        // User avatar/profile button exists
        () => document.querySelector('[data-testid="profile-button"]'),
        () => document.querySelector('button[id*="radix"][id*="menu-trigger"]'),
        () => document.querySelector('img[alt*="User"]'),
        // Navigation menu exists (logged-in users see this)
        () => document.querySelector('nav[aria-label="Chat history"]'),
        () => document.querySelector('.sidebar'),
        // No login button visible
        () => !document.querySelector('button:has-text("Log in")') && !document.querySelector('a[href*="login"]')
      ];
      
      // Check for Cloudflare challenge
      const cloudflareCheck = document.title.toLowerCase().includes('just a moment') ||
                             document.body.innerText.toLowerCase().includes('checking your browser') ||
                             document.querySelector('#challenge-running') !== null;
      
      if (cloudflareCheck) {
        sendResponse({ 
          loggedIn: false, 
          needsCloudflare: true, 
          message: 'Cloudflare verification needed. Please complete the check in the ChatGPT tab.' 
        });
        return true;
      }
      
      // Check if user is logged in
      const isLoggedIn = loginIndicators.some(check => {
        try {
          return check() !== null;
        } catch {
          return false;
        }
      });
      
      sendResponse({ 
        loggedIn: isLoggedIn, 
        needsCloudflare: false,
        message: isLoggedIn ? 'Logged in' : 'Please log in to ChatGPT in the new tab'
      });
    } catch (error) {
      sendResponse({ loggedIn: false, needsCloudflare: false, error: error.message });
    }
    return true;
  }
  
  if (request.action === 'getChatGPTResponse') {
    try {
      // Look for ChatGPT response in various possible selectors
      const responseSelectors = [
        '[data-message-author-role="assistant"] .markdown',
        '[data-message-author-role="assistant"]',
        '.agent-turn .markdown',
        '.prose',
        'article[data-testid^="conversation-turn"]',
        '.text-message'
      ];

      let responseContent = '';

      for (const selector of responseSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Get the last response (most recent)
          const lastElement = elements[elements.length - 1];
          const text = lastElement.innerText || lastElement.textContent;
          
          if (text && text.trim().length > 50) {
            responseContent = text.trim();
            break;
          }
        }
      }

      if (responseContent) {
        sendResponse({ success: true, content: responseContent });
      } else {
        sendResponse({ success: false, error: 'No response found yet' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open for async response
  }
});

// Also check if we're on ChatGPT and the page has loaded
if (window.location.hostname.includes('chatgpt.com') || window.location.hostname.includes('chat.openai.com')) {
  console.log('ChatGPT extractor loaded');
}
