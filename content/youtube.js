// YouTube-specific content script for transcript extraction
class YouTubeSummarizer {
  constructor() {
    this.transcriptData = null;
    this.videoData = null;
    this.initialize();
  }

  initialize() {
    // Listen for messages specific to YouTube
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleYouTubeMessage(request, sender, sendResponse);
      return true;
    });

    // Monitor for video changes (YouTube SPA navigation)
    this.observeVideoChanges();
    
    console.log('YouTube Summarizer - Script loaded');
  }

  async handleYouTubeMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getYouTubeTranscript':
          const transcript = await this.extractTranscript();
          sendResponse({ success: true, transcript });
          break;
          
        case 'getVideoInfo':
          const videoInfo = this.extractVideoInfo();
          sendResponse({ success: true, videoInfo });
          break;
          
        case 'summarizeVideo':
          const summary = await this.summarizeVideo(request.settings);
          sendResponse({ success: true, summary });
          break;
          
        default:
          // Let the main content script handle other actions
          return false;
      }
    } catch (error) {
      console.error('YouTube script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  observeVideoChanges() {
    // YouTube is a SPA, so we need to watch for URL changes
    let currentVideoId = this.getVideoId();
    
    const observer = new MutationObserver(() => {
      const newVideoId = this.getVideoId();
      if (newVideoId && newVideoId !== currentVideoId) {
        currentVideoId = newVideoId;
        this.onVideoChange(newVideoId);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also listen for URL changes
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        const videoId = this.getVideoId();
        if (videoId && videoId !== currentVideoId) {
          currentVideoId = videoId;
          this.onVideoChange(videoId);
        }
      }
    }).observe(document, { subtree: true, childList: true });
  }

  getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  onVideoChange(videoId) {
    // Reset transcript data when video changes
    this.transcriptData = null;
    this.videoData = null;
    
    // Add YouTube-specific summarize button
    setTimeout(() => {
      this.addYouTubeSummaryButton();
    }, 2000); // Wait for YouTube to load
  }

  addYouTubeSummaryButton() {
    // Remove existing button
    const existingBtn = document.getElementById('youtube-summary-btn');
    if (existingBtn) existingBtn.remove();

    // Find the subscribe button area to place our button
    const targetArea = document.querySelector('#subscribe-button') || 
                      document.querySelector('#top-level-buttons-computed') ||
                      document.querySelector('#menu-container');

    if (!targetArea) return;

    const summaryBtn = document.createElement('button');
    summaryBtn.id = 'youtube-summary-btn';
    summaryBtn.innerHTML = `
      <span style="margin-right: 6px;">📄</span>
      Summarize Video
    `;
    
    summaryBtn.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-left: 8px;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s ease;
      font-family: "YouTube Sans", "Roboto", sans-serif;
    `;

    summaryBtn.addEventListener('mouseenter', () => {
      summaryBtn.style.transform = 'translateY(-1px)';
      summaryBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    });

    summaryBtn.addEventListener('mouseleave', () => {
      summaryBtn.style.transform = 'translateY(0)';
      summaryBtn.style.boxShadow = 'none';
    });

    summaryBtn.addEventListener('click', () => {
      this.summarizeCurrentVideo();
    });

    targetArea.appendChild(summaryBtn);
  }

  extractVideoInfo() {
    const videoId = this.getVideoId();
    const title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || 
                  document.title.replace(' - YouTube', '');
    
    const channelName = document.querySelector('#channel-name #container #text-container yt-formatted-string a')?.textContent ||
                       document.querySelector('#owner-text a')?.textContent;

    const description = document.querySelector('#expand-sectionized-description #description-text')?.textContent ||
                       document.querySelector('#description')?.textContent;

    const duration = document.querySelector('.ytp-time-duration')?.textContent;
    const views = document.querySelector('#info-contents #count yt-view-count-renderer span')?.textContent;

    return {
      videoId,
      title: title?.trim(),
      channelName: channelName?.trim(),
      description: description?.trim(),
      duration,
      views,
      url: window.location.href
    };
  }

  async extractTranscript() {
    // Try to get transcript from YouTube's transcript feature
    try {
      // Look for transcript button
      const transcriptButton = document.querySelector('[aria-label*="transcript" i], [aria-label*="captions" i]') ||
                              document.querySelector('button[aria-label*="Show transcript"]');

      if (!transcriptButton) {
        throw new Error('Transcript not available for this video');
      }

      // Click transcript button if not already open
      if (!document.querySelector('ytd-transcript-segment-renderer')) {
        transcriptButton.click();
        
        // Wait for transcript to load
        await this.waitForElement('ytd-transcript-segment-renderer', 5000);
      }

      // Extract transcript segments
      const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
      const transcript = [];

      segments.forEach(segment => {
        const timestamp = segment.querySelector('.segment-timestamp')?.textContent?.trim();
        const text = segment.querySelector('.segment-text')?.textContent?.trim();
        
        if (text) {
          transcript.push({
            timestamp: timestamp || '',
            text: text
          });
        }
      });

      if (transcript.length === 0) {
        throw new Error('Could not extract transcript content');
      }

      this.transcriptData = transcript;
      return transcript;

    } catch (error) {
      console.error('Transcript extraction error:', error);
      
      // Fallback: Try to extract from closed captions if available
      return this.extractClosedCaptions();
    }
  }

  async extractClosedCaptions() {
    // This is a more complex approach that would require intercepting network requests
    // For now, we'll return a placeholder
    throw new Error('Automatic transcript extraction not available. Please enable captions manually.');
  }

  async waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  async summarizeCurrentVideo() {
    try {
      const videoInfo = this.extractVideoInfo();
      
      // Try to get transcript
      let transcript = null;
      try {
        transcript = await this.extractTranscript();
      } catch (transcriptError) {
        console.warn('Transcript not available:', transcriptError.message);
      }

      // Generate summary interface
      this.displayVideoSummaryInterface(videoInfo, transcript);
      
    } catch (error) {
      console.error('Video summary error:', error);
      alert('Error: ' + error.message);
    }
  }

  displayVideoSummaryInterface(videoInfo, transcript) {
    // Remove existing panel
    const existingPanel = document.getElementById('youtube-summary-panel');
    if (existingPanel) existingPanel.remove();

    const panel = document.createElement('div');
    panel.id = 'youtube-summary-panel';
    
    // Create summary prompt
    let prompt = `Please summarize this YouTube video:

Title: ${videoInfo.title}
Channel: ${videoInfo.channelName}
Duration: ${videoInfo.duration || 'Unknown'}
URL: ${videoInfo.url}

`;

    if (transcript && transcript.length > 0) {
      prompt += `Transcript:\n`;
      transcript.forEach(segment => {
        prompt += `[${segment.timestamp}] ${segment.text}\n`;
      });
    } else if (videoInfo.description) {
      prompt += `Description:\n${videoInfo.description}\n`;
    }

    prompt += `\nPlease provide:
1. A brief overview of the video content
2. Key points and main topics discussed
3. Important timestamps (if available)
4. Target audience and main takeaways`;

    panel.innerHTML = `
      <div class="summary-header">
        <h3>📺 YouTube Video Summary</h3>
        <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      
      <div class="summary-content">
        <div class="video-info">
          <h4>📹 Video Information</h4>
          <p><strong>Title:</strong> ${videoInfo.title}</p>
          <p><strong>Channel:</strong> ${videoInfo.channelName || 'Unknown'}</p>
          <p><strong>Duration:</strong> ${videoInfo.duration || 'Unknown'}</p>
          <p><strong>Views:</strong> ${videoInfo.views || 'Unknown'}</p>
          <p><strong>Transcript:</strong> ${transcript ? 'Available' : 'Not available'}</p>
        </div>
        
        <div class="prompt-section">
          <h4>🤖 Ready-to-Use Prompt</h4>
          <p class="instruction">Copy this prompt and paste it into your preferred AI:</p>
          <textarea class="prompt-text" readonly>${prompt}</textarea>
          <button class="copy-btn" onclick="this.previousElementSibling.select(); document.execCommand('copy'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy Prompt', 2000)">Copy Prompt</button>
        </div>
        
        <div class="quick-actions">
          <h4>🚀 Quick Actions</h4>
          <button class="action-btn" onclick="window.open('https://chat.openai.com', '_blank')">Open ChatGPT</button>
          <button class="action-btn" onclick="window.open('https://claude.ai', '_blank')">Open Claude</button>
          <button class="action-btn" onclick="window.open('https://gemini.google.com', '_blank')">Open Gemini</button>
        </div>
      </div>
    `;

    // Apply the same styles as main content script
    panel.style.cssText = `
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      width: 420px !important;
      max-height: 80vh !important;
      background: white !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
      z-index: 10002 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      overflow: hidden !important;
      border: 1px solid #e0e0e0 !important;
    `;

    document.body.appendChild(panel);
    
    // Apply shared styles (reuse from content.css)
    if (!document.getElementById('youtube-summary-styles')) {
      const styles = document.createElement('style');
      styles.id = 'youtube-summary-styles';
      styles.textContent = document.getElementById('chatgpt-summary-styles')?.textContent || '';
      document.head.appendChild(styles);
    }
  }
}

// Initialize YouTube-specific functionality
if (window.location.hostname === 'www.youtube.com' && window.location.pathname === '/watch') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new YouTubeSummarizer();
    });
  } else {
    new YouTubeSummarizer();
  }
}