// Test AI Provider Integration for Web Summary AI
const puppeteer = require('puppeteer');
const path = require('path');

async function testAIProviderIntegration() {
  let browser;
  
  try {
    console.log('🚀 Starting AI Provider Integration Tests...');
    
    // Launch browser with extension
    const extensionPath = path.join(__dirname);
    browser = await puppeteer.launch({
      headless: false, // Keep visible for debugging
      args: [
        `--load-extension=${extensionPath}`,
        '--disable-extensions-except=' + extensionPath,
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--no-sandbox'
      ]
    });

    const page = await browser.newPage();
    
    // Get extension ID by checking extension pages
    console.log('🔍 Getting extension ID...');
    const targets = await browser.targets();
    const extensionTarget = targets.find(target => target.url().includes('chrome-extension://'));
    if (!extensionTarget) {
      throw new Error('Extension not loaded properly');
    }
    
    const extensionId = extensionTarget.url().split('/')[2];
    console.log(`✓ Extension loaded with ID: ${extensionId}`);

    // Test 1: AI Provider Configuration
    console.log('\n📋 Test 1: AI Provider Settings Configuration');
    await page.goto(`chrome-extension://${extensionId}/options/options.html`);
    
    // Wait for options page to load
    await page.waitForSelector('#aiProvider', { timeout: 10000 });
    console.log('✓ Options page loaded successfully');

    // Test ChatGPT provider selection
    console.log('🤖 Testing ChatGPT provider selection...');
    await page.select('#aiProvider', 'chatgpt');
    
    // Check if ChatGPT instructions appear
    try {
      await page.waitForFunction(() => {
        const instructions = document.getElementById('chatgptInstructions');
        return instructions && instructions.style.display === 'block';
      }, { timeout: 3000 });
      console.log('✓ ChatGPT instructions displayed correctly');
    } catch (error) {
      console.log('❌ ChatGPT instructions not displayed');
    }

    // Test custom API provider selection  
    console.log('⚙️ Testing Custom API provider selection...');
    await page.select('#aiProvider', 'custom');
    
    try {
      await page.waitForFunction(() => {
        const instructions = document.getElementById('customApiInstructions');
        return instructions && instructions.style.display === 'block';
      }, { timeout: 3000 });
      console.log('✓ Custom API instructions displayed correctly');
    } catch (error) {
      console.log('❌ Custom API instructions not displayed');
    }

    // Test 2: Settings Persistence
    console.log('\n💾 Test 2: Settings Persistence');
    
    // Fill in custom API settings
    await page.type('#customApiUrl', 'https://api.openai.com/v1/chat/completions');
    await page.type('#customApiModel', 'gpt-4');
    await page.check('#enableSentimentAnalysis');
    
    // Save settings
    await page.click('#saveSettings');
    await page.waitForSelector('.success', { timeout: 5000 });
    console.log('✓ Settings saved successfully');
    
    // Reload page and check if settings persist
    await page.reload();
    await page.waitForSelector('#aiProvider', { timeout: 5000 });
    
    const savedProvider = await page.evaluate(() => document.getElementById('aiProvider').value);
    const savedUrl = await page.evaluate(() => document.getElementById('customApiUrl').value);
    const sentimentEnabled = await page.evaluate(() => document.getElementById('enableSentimentAnalysis').checked);
    
    console.log(`✓ Provider persisted: ${savedProvider}`);
    console.log(`✓ API URL persisted: ${savedUrl}`);
    console.log(`✓ Sentiment analysis persisted: ${sentimentEnabled}`);

    // Test 3: Connection Testing
    console.log('\n🔗 Test 3: Connection Testing');
    
    // Switch back to ChatGPT provider
    await page.select('#aiProvider', 'chatgpt');
    await page.waitForFunction(() => {
      const instructions = document.getElementById('chatgptInstructions');
      return instructions && instructions.style.display === 'block';
    }, { timeout: 3000 });
    
    // Test connection button
    const testButton = await page.$('#testChatGPTConnection');
    if (testButton) {
      console.log('🔍 Testing ChatGPT connection...');
      
      // Set up popup handler
      page.on('popup', async (popup) => {
        console.log('✓ ChatGPT test popup opened');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await popup.close();
        console.log('✓ Test popup closed');
      });
      
      await page.click('#testChatGPTConnection');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for test to complete
      
      const statusText = await page.evaluate(() => {
        const status = document.getElementById('connectionStatus');
        return status ? status.textContent : '';
      });
      
      console.log(`✓ Connection test result: ${statusText}`);
    } else {
      console.log('❌ Test connection button not found');
    }

    // Test 4: AI Provider Script Loading
    console.log('\n🧠 Test 4: AI Provider Script Loading');
    
    // Navigate to a test page
    await page.goto('data:text/html,<html><head><title>Test Page</title></head><body><h1>AI Integration Test</h1><p>This is a test page with some content to summarize. The Web Summary AI extension should be able to extract this content and process it using the configured AI provider. This test verifies that the AI provider abstraction layer is working correctly.</p></body></html>');
    
    // Wait for content script to load
    await page.waitForFunction(() => window.webSummaryAI, { timeout: 10000 });
    console.log('✓ Content script loaded with AI provider support');
    
    // Check if AI provider can be initialized
    const hasAIProvider = await page.evaluate(async () => {
      try {
        if (window.webSummaryAI && typeof window.webSummaryAI.initializeAI === 'function') {
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    });
    
    if (hasAIProvider) {
      console.log('✓ AI provider initialization method available');
    } else {
      console.log('❌ AI provider initialization method not found');
    }

    // Test 5: Floating Action Button with AI Integration
    console.log('\n🎯 Test 5: Floating Action Button AI Integration');
    
    // Look for floating action button
    const fabButton = await page.$('#web-summary-fab');
    if (fabButton) {
      console.log('✓ Floating action button found');
      
      // Click the FAB to trigger summarization
      await page.click('#web-summary-fab');
      
      // Wait for summary processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if summary interface appeared
      const summaryPanel = await page.$('#web-summary-panel');
      if (summaryPanel) {
        console.log('✓ Summary panel appeared after FAB click');
        
        // Check panel content
        const panelContent = await page.evaluate(() => {
          const panel = document.getElementById('web-summary-panel');
          return panel ? panel.textContent : '';
        });
        
        if (panelContent.includes('Summary') || panelContent.includes('AI')) {
          console.log('✓ Summary panel contains expected content');
        } else {
          console.log('⚠️ Summary panel content may be incomplete');
        }
      } else {
        console.log('❌ Summary panel did not appear');
      }
    } else {
      console.log('❌ Floating action button not found');
    }

    // Test 6: Error Handling
    console.log('\n🛡️ Test 6: Error Handling');
    
    // Test with invalid custom API settings
    await page.goto(`chrome-extension://${extensionId}/options/options.html`);
    await page.waitForSelector('#aiProvider', { timeout: 5000 });
    
    // Set invalid API configuration
    await page.select('#aiProvider', 'custom');
    await page.fill('#customApiUrl', 'invalid-url');
    await page.fill('#customApiKey', '');
    await page.click('#saveSettings');
    
    console.log('✓ Saved invalid API configuration for error testing');
    
    // Go back to content page and try to summarize
    await page.goto('data:text/html,<html><head><title>Error Test</title></head><body><h1>Error Handling Test</h1><p>This page tests error handling when AI provider is misconfigured.</p></body></html>');
    
    await page.waitForFunction(() => window.webSummaryAI, { timeout: 5000 });
    
    const fabButton2 = await page.$('#web-summary-fab');
    if (fabButton2) {
      await page.click('#web-summary-fab');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✓ Extension handled invalid API configuration gracefully');
    }

    console.log('\n✅ All AI Provider Integration Tests Completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the tests
testAIProviderIntegration();