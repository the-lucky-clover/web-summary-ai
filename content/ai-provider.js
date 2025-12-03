/**
 * AI Provider Handler
 * Unified interface for multiple AI providers (OpenAI, Anthropic, Google)
 */

class AIProvider {
  constructor() {
    this.endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      anthropic: 'https://api.anthropic.com/v1/messages',
      google: 'https://generativelanguage.googleapis.com/v1beta/models/'
    };
  }
  
  /**
   * Call OpenAI API
   */
  async callOpenAI(apiKey, model, prompt) {
    const response = await fetch(this.endpoints.openai, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
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
  
  /**
   * Call Anthropic API (Claude)
   */
  async callAnthropic(apiKey, model, prompt) {
    const response = await fetch(this.endpoints.anthropic, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  }
  
  /**
   * Call Google Gemini API
   */
  async callGoogle(apiKey, model, prompt) {
    const url = `${this.endpoints.google}${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
  
  /**
   * Unified API call method
   */
  async callAPI(provider, apiKey, model, prompt) {
    if (!apiKey) {
      throw new Error(`API key required for ${provider}`);
    }
    
    switch (provider) {
      case 'openai':
        return await this.callOpenAI(apiKey, model, prompt);
      
      case 'anthropic':
        return await this.callAnthropic(apiKey, model, prompt);
      
      case 'google':
        return await this.callGoogle(apiKey, model, prompt);
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  
  /**
   * Process chunked content with API
   */
  async processChunkedContent(provider, apiKey, model, chunks) {
    const summaries = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const summary = await this.callAPI(provider, apiKey, model, chunk.prompt);
        summaries.push({
          chunkIndex: chunk.chunkInfo.index,
          summary: summary,
          tokens: chunk.chunkInfo.tokens
        });
        
        // Add small delay between requests to avoid rate limits
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        throw error;
      }
    }
    
    // If multiple chunks, create final synthesis
    if (summaries.length > 1) {
      const combinedSummaries = summaries.map((s, i) => 
        `Part ${i + 1}:\n${s.summary}`
      ).join('\n\n');
      
      const synthesisPrompt = `Based on these summaries of different parts, provide a comprehensive final summary:\n\n${combinedSummaries}`;
      
      try {
        const finalSummary = await this.callAPI(provider, apiKey, model, synthesisPrompt);
        return finalSummary;
      } catch (error) {
        // If synthesis fails, return combined summaries
        console.error('Synthesis error:', error);
        return combinedSummaries;
      }
    }
    
    return summaries[0].summary;
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIProvider;
}
