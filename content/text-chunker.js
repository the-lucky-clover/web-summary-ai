/**
 * Text Chunking Utility
 * Intelligently splits large content into manageable chunks for AI processing
 */

class TextChunker {
  constructor(options = {}) {
    // Token limits for different providers
    this.tokenLimits = {
      'chatgpt-web': 3000,      // Conservative limit for ChatGPT web interface
      'gpt-4o-mini': 120000,     // 128k context window
      'gpt-4o': 120000,          // 128k context window
      'gpt-4': 7000,             // 8k context window
      'claude-3-haiku-20240307': 180000,     // 200k context window
      'claude-3-5-sonnet-20241022': 180000,  // 200k context window
      'claude-3-opus-20240229': 180000,      // 200k context window
      'gemini-1.5-flash': 950000,            // 1M context window
      'gemini-1.5-pro': 1900000              // 2M context window
    };
    
    // Approximate tokens per character (rough estimate: 1 token ≈ 4 chars)
    this.charsPerToken = 4;
    
    this.maxChunkTokens = options.maxChunkTokens || 3000;
    this.overlapTokens = options.overlapTokens || 200;
  }
  
  /**
   * Estimate token count for text
   */
  estimateTokens(text) {
    return Math.ceil(text.length / this.charsPerToken);
  }
  
  /**
   * Get token limit for a specific model
   */
  getTokenLimit(model) {
    return this.tokenLimits[model] || this.tokenLimits['chatgpt-web'];
  }
  
  /**
   * Check if content needs chunking
   */
  needsChunking(text, model = 'chatgpt-web') {
    const tokenCount = this.estimateTokens(text);
    const limit = this.getTokenLimit(model);
    return tokenCount > (limit * 0.8); // Use 80% of limit to be safe
  }
  
  /**
   * Split text into sentences
   */
  splitIntoSentences(text) {
    // Split on sentence boundaries while preserving the delimiter
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }
  
  /**
   * Split text into paragraphs
   */
  splitIntoParagraphs(text) {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  }
  
  /**
   * Intelligently chunk text based on natural boundaries
   */
  chunkText(text, maxTokens = null) {
    const targetTokens = maxTokens || this.maxChunkTokens;
    const targetChars = targetTokens * this.charsPerToken;
    const overlapChars = this.overlapTokens * this.charsPerToken;
    
    // If text is small enough, return as-is
    if (this.estimateTokens(text) <= targetTokens) {
      return [{
        text: text,
        index: 0,
        tokens: this.estimateTokens(text)
      }];
    }
    
    const chunks = [];
    let paragraphs = this.splitIntoParagraphs(text);
    
    let currentChunk = '';
    let currentIndex = 0;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
      
      // If adding this paragraph exceeds limit, save current chunk and start new one
      if (this.estimateTokens(testChunk) > targetTokens && currentChunk) {
        chunks.push({
          text: currentChunk,
          index: currentIndex,
          tokens: this.estimateTokens(currentChunk)
        });
        
        // Start new chunk with overlap from previous chunk
        const sentences = this.splitIntoSentences(currentChunk);
        const overlapSentences = sentences.slice(-3); // Last 3 sentences for context
        currentChunk = overlapSentences.join(' ') + '\n\n' + paragraph;
        currentIndex++;
      } else {
        currentChunk = testChunk;
      }
      
      // If a single paragraph is too large, split by sentences
      if (this.estimateTokens(paragraph) > targetTokens) {
        const sentences = this.splitIntoSentences(paragraph);
        currentChunk = '';
        
        for (const sentence of sentences) {
          const testSentence = currentChunk + (currentChunk ? ' ' : '') + sentence;
          
          if (this.estimateTokens(testSentence) > targetTokens && currentChunk) {
            chunks.push({
              text: currentChunk,
              index: currentIndex,
              tokens: this.estimateTokens(currentChunk)
            });
            currentChunk = sentence;
            currentIndex++;
          } else {
            currentChunk = testSentence;
          }
        }
      }
    }
    
    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk,
        index: currentIndex,
        tokens: this.estimateTokens(currentChunk)
      });
    }
    
    return chunks;
  }
  
  /**
   * Create a summary-friendly chunked prompt
   */
  createChunkedPrompts(text, basePrompt, model = 'chatgpt-web') {
    const limit = this.getTokenLimit(model);
    const chunks = this.chunkText(text, limit * 0.7); // Leave room for prompt and response
    
    if (chunks.length === 1) {
      return [{
        prompt: basePrompt + '\n\n' + chunks[0].text,
        chunkInfo: { index: 0, total: 1, tokens: chunks[0].tokens }
      }];
    }
    
    // Multiple chunks - create progressive summarization prompts
    return chunks.map((chunk, index) => {
      const chunkInfo = `[Part ${index + 1} of ${chunks.length}]`;
      let prompt = '';
      
      if (index === 0) {
        prompt = `${basePrompt}\n\n${chunkInfo}\nThis is a multi-part content. Summarize this first part, noting key points to continue:\n\n${chunk.text}`;
      } else if (index === chunks.length - 1) {
        prompt = `${chunkInfo}\nThis is the final part. Provide a comprehensive summary incorporating all parts:\n\n${chunk.text}`;
      } else {
        prompt = `${chunkInfo}\nThis is a middle section. Continue summarizing and tracking key themes:\n\n${chunk.text}`;
      }
      
      return {
        prompt: prompt,
        chunkInfo: { index, total: chunks.length, tokens: chunk.tokens }
      };
    });
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextChunker;
}
