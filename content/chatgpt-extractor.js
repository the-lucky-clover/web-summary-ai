// ChatGPT Response Extractor
// Extracts AI responses from ChatGPT.com

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
