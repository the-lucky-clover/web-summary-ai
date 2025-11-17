// AI API Abstraction Layer for Web Summary AI
class AIProvider {
  constructor(settings) {
    this.settings = settings;
    this.chatgptWindow = null;
    this.apiQueue = [];
    this.isProcessing = false;
  }

  async summarize(content, options = {}) {
    const { title, url, includeSentiment } = options;
    
    try {
      if (this.settings.aiProvider === 'chatgpt') {
        return await this.summarizeWithChatGPT(content, { title, url, includeSentiment });
      } else if (this.settings.aiProvider === 'custom') {
        return await this.summarizeWithCustomAPI(content, { title, url, includeSentiment });
      }
    } catch (error) {
      console.error('AI Provider Error:', error);
      throw new Error(`Summarization failed: ${error.message}`);
    }
  }

  async summarizeWithChatGPT(content, options) {
    const { title, url, includeSentiment } = options;
    
    // Build the prompt
    let prompt = this.buildPrompt(content, { title, url, includeSentiment });
    
    // Check if ChatGPT window is available
    if (!this.chatgptWindow || this.chatgptWindow.closed) {
      await this.openChatGPTWindow();
    }

    // Wait for authentication if needed
    await this.ensureChatGPTAuth();

    // Send the prompt and get response
    return await this.sendPromptToChatGPT(prompt);
  }

  async openChatGPTWindow() {
    return new Promise((resolve, reject) => {
      // Create a wrapper window for ChatGPT.com
      this.chatgptWindow = window.open(
        'https://chatgpt.com',
        'chatgpt_window',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!this.chatgptWindow) {
        reject(new Error('Failed to open ChatGPT window. Please disable popup blockers.'));
        return;
      }

      // Wait for window to load
      const checkWindow = setInterval(() => {
        try {
          if (this.chatgptWindow.document.readyState === 'complete') {
            clearInterval(checkWindow);
            resolve();
          }
        } catch (e) {
          // Cross-origin error expected until page loads
        }
      }, 1000);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkWindow);
        if (this.chatgptWindow && !this.chatgptWindow.closed) {
          resolve(); // Proceed even if we can't check the state
        } else {
          reject(new Error('ChatGPT window failed to load'));
        }
      }, 30000);
    });
  }

  async ensureChatGPTAuth() {
    // Check if user needs to authenticate
    return new Promise((resolve) => {
      const authCheck = setInterval(() => {
        try {
          // Try to detect if user is logged in by checking for common elements
          const isLoggedIn = this.chatgptWindow.document.querySelector('[data-testid="send-button"]') ||
                           this.chatgptWindow.document.querySelector('textarea[placeholder*="message"]');
          
          if (isLoggedIn) {
            clearInterval(authCheck);
            resolve();
          }
        } catch (e) {
          // Still loading or cross-origin
        }
      }, 2000);

      // Auto-resolve after 10 seconds to prevent hanging
      setTimeout(() => {
        clearInterval(authCheck);
        resolve();
      }, 10000);
    });
  }

  async sendPromptToChatGPT(prompt) {
    return new Promise((resolve, reject) => {
      try {
        // Inject a script to send the prompt
        const script = this.chatgptWindow.document.createElement('script');
        script.textContent = `
          (function() {
            const textarea = document.querySelector('textarea[placeholder*="message"]') || 
                           document.querySelector('#prompt-textarea') ||
                           document.querySelector('textarea');
            
            if (textarea) {
              // Set the prompt text
              textarea.value = \`${prompt.replace(/`/g, '\\`')}\`;
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
              
              // Find and click send button
              setTimeout(() => {
                const sendBtn = document.querySelector('[data-testid="send-button"]') ||
                              document.querySelector('button[aria-label*="Send"]') ||
                              document.querySelector('button:has(svg[data-icon="arrow-up"])');
                
                if (sendBtn && !sendBtn.disabled) {
                  sendBtn.click();
                  window.postMessage({ type: 'PROMPT_SENT' }, '*');
                } else {
                  window.postMessage({ type: 'SEND_FAILED', error: 'Send button not found or disabled' }, '*');
                }
              }, 500);
            } else {
              window.postMessage({ type: 'TEXTAREA_NOT_FOUND' }, '*');
            }
          })();
        `;

        // Listen for response
        const messageHandler = (event) => {
          if (event.source === this.chatgptWindow) {
            window.removeEventListener('message', messageHandler);
            
            if (event.data.type === 'PROMPT_SENT') {
              // Wait for response and extract it
              this.waitForChatGPTResponse().then(resolve).catch(reject);
            } else {
              reject(new Error(event.data.error || 'Failed to send prompt'));
            }
          }
        };

        window.addEventListener('message', messageHandler);
        this.chatgptWindow.document.head.appendChild(script);

      } catch (error) {
        reject(error);
      }
    });
  }

  async waitForChatGPTResponse() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds timeout

      const checkResponse = setInterval(() => {
        attempts++;
        
        try {
          // Look for the response text in various possible containers
          const responseElements = this.chatgptWindow.document.querySelectorAll(
            '[data-message-author-role="assistant"] .markdown, ' +
            '.prose, ' +
            '[data-testid*="conversation"] div[class*="markdown"]'
          );

          if (responseElements.length > 0) {
            const lastResponse = responseElements[responseElements.length - 1];
            const responseText = lastResponse.innerText || lastResponse.textContent;
            
            if (responseText && responseText.trim().length > 10) {
              clearInterval(checkResponse);
              resolve({
                success: true,
                content: responseText.trim(),
                provider: 'chatgpt',
                timestamp: Date.now()
              });
              return;
            }
          }

          if (attempts >= maxAttempts) {
            clearInterval(checkResponse);
            resolve({
              success: false,
              error: 'Response timeout',
              provider: 'chatgpt',
              timestamp: Date.now()
            });
          }
        } catch (e) {
          // Continue trying
        }
      }, 1000);
    });
  }

  async summarizeWithCustomAPI(content, options) {
    const { title, url, includeSentiment } = options;
    
    if (!this.settings.customApiUrl) {
      throw new Error('Custom API URL not configured');
    }

    const prompt = this.buildPrompt(content, { title, url, includeSentiment });
    
    const payload = {
      model: this.settings.customApiModel || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.settings.customApiKey) {
      headers['Authorization'] = `Bearer ${this.settings.customApiKey}`;
    }

    const response = await fetch(this.settings.customApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      content: data.choices?.[0]?.message?.content || data.response || data.text || 'No response',
      provider: 'custom',
      model: this.settings.customApiModel,
      timestamp: Date.now()
    };
  }

  buildPrompt(content, options) {
    const { title, url, includeSentiment } = options;
    
    // Use custom prompts if available, otherwise use system default
    let basePrompt;
    
    if (this.settings.useCustomPrompts && this.settings.customPromptMedium) {
      basePrompt = this.settings.customPromptMedium
        .replace(/\{title\}/g, title || 'Web Content')
        .replace(/\{content\}/g, content);
    } else {
      // Use the sophisticated default system prompt
      basePrompt = `You are an ultra-intelligent, semi-autonomous AI summarizer with forensic-level detail extraction capabilities. Your mission is to analyze ${url} and report back every technical, procedural, and contextual detail with surgical precision.

FORMAT YOUR OUTPUT AS FOLLOWS:
1. **Structured Outline of "${title}"**
   - Break the content down into sections, then further into detailed, sequential steps
   - Every action, tool, file, and command should be an individual sub-step
   - Include any visual references mentioned: buttons, menu names, tabs, sliders, or filenames

2. **Bullet Summary (w/ Emojis):**
   - Tools/frameworks
   - Ordered steps  
   - Devices/Specs
   - Test/benchmarks
   - Files/config paths
   - Pricing/sponsorship
   - Full URLs
   - Privacy/telemetry concerns

3. **TL;DR (3–15 Sentences):**
   - Write a detailed yet readable synthesis
   - Must include all named devices, tools, techniques, and results
   - If steps were shown, summarize their purpose and result

4. **Full Link Breakdown:**
   - Show every URL in full
   - Label: Free, Affiliate/Sponsored, Docs, Risky or tracking

CONTENT TO ANALYZE:
${content}`;
    }

    // Add sentiment analysis if enabled
    if (includeSentiment && this.settings.enableSentimentAnalysis) {
      basePrompt += `\n\n5. **Sentiment Analysis:**
   - Overall emotional tone (positive/negative/neutral)
   - Key emotional indicators
   - Audience engagement level
   - Potential bias or persuasive elements`;
    }

    return basePrompt;
  }

  cleanup() {
    if (this.chatgptWindow && !this.chatgptWindow.closed) {
      this.chatgptWindow.close();
    }
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIProvider;
}