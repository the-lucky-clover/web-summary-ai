#!/usr/bin/env node

/**
 * Test Custom Prompts Feature - Web Summary AI Extension
 * Tests the new custom prompts functionality added to the extension
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testCustomPrompts() {
  console.log('🧪 Testing Custom Prompts Feature - Web Summary AI Extension');
  console.log('=' .repeat(60));

  let browser;
  try {
    // Launch browser with extension loaded
    const extensionPath = path.resolve(__dirname);
    browser = await puppeteer.launch({
      headless: false, // Show browser for visual testing
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      ]
    });

    const pages = await browser.pages();
    const page = pages[0];

    console.log('✅ Browser launched with extension loaded');

    // Wait for extension to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Navigate to extension options page
    const extensionId = await getExtensionId(page);
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    
    console.log(`📋 Opening options page: ${optionsUrl}`);
    await page.goto(optionsUrl);
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: Check if custom prompts section exists
    console.log('\n🔍 Test 1: Checking if custom prompts section exists...');
    const customPromptsCheckbox = await page.$('#useCustomPrompts');
    if (customPromptsCheckbox) {
      console.log('✅ Custom prompts checkbox found');
    } else {
      console.log('❌ Custom prompts checkbox NOT found');
      return false;
    }

    // Test 2: Enable custom prompts and check visibility
    console.log('\n🔍 Test 2: Testing custom prompts toggle...');
    await page.click('#useCustomPrompts');
    await new Promise(resolve => setTimeout(resolve, 500));

    const shortPromptTextarea = await page.$('#customPromptShort');
    const isVisible = await page.evaluate(el => {
      return el && window.getComputedStyle(el.parentElement).display !== 'none';
    }, shortPromptTextarea);

    if (isVisible) {
      console.log('✅ Custom prompt textareas are visible when enabled');
    } else {
      console.log('❌ Custom prompt textareas are NOT visible when enabled');
      return false;
    }

    // Test 3: Load a template
    console.log('\n🔍 Test 3: Testing template loading...');
    await page.select('#promptTemplates', 'academic');
    await page.click('#loadTemplate');
    await new Promise(resolve => setTimeout(resolve, 500));

    const shortPromptValue = await page.$eval('#customPromptShort', el => el.value);
    if (shortPromptValue.includes('academic summary')) {
      console.log('✅ Academic template loaded successfully');
    } else {
      console.log('❌ Academic template did NOT load correctly');
      return false;
    }

    // Test 4: Save settings
    console.log('\n🔍 Test 4: Testing settings save...');
    await page.click('#saveSettings');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const saveButtonText = await page.$eval('#saveSettings', el => el.textContent);
    if (saveButtonText.includes('Saved')) {
      console.log('✅ Settings saved successfully');
    } else {
      console.log('❌ Settings save did NOT complete');
      return false;
    }

    // Test 5: Test on a web page
    console.log('\n🔍 Test 5: Testing custom prompts on a web page...');
    const testPage = await browser.newPage();
    await testPage.goto('data:text/html,<html><head><title>Test Page</title></head><body><h1>Test Article</h1><p>This is a test article with some content to summarize. It contains important information about testing the custom prompts feature.</p></body></html>');
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if floating button exists
    const floatingButton = await testPage.$('.web-summarizer-fab');
    if (floatingButton) {
      console.log('✅ Floating action button found on test page');
      
      // Click the button to trigger summarization
      await testPage.click('.web-summarizer-fab');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if summary panel appears
      const summaryPanel = await testPage.$('[id*="summary-interface"]');
      if (summaryPanel) {
        console.log('✅ Summary interface appeared after clicking button');
        
        // Check if the prompt contains academic template content
        const promptText = await testPage.$eval('textarea', el => el.value);
        if (promptText.includes('academic summary')) {
          console.log('✅ Custom academic prompt is being used');
        } else {
          console.log('⚠️  Default prompt is being used (custom prompts may not be applied)');
        }
      } else {
        console.log('❌ Summary interface did NOT appear');
      }
    } else {
      console.log('❌ Floating action button NOT found on test page');
    }

    console.log('\n🎉 Custom Prompts Feature Test Complete!');
    console.log('=' .repeat(60));
    
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function getExtensionId(page) {
  // Navigate to extensions page to get the extension ID
  await page.goto('chrome://extensions/');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Look for our extension
  const extensionId = await page.evaluate(() => {
    const extensions = document.querySelectorAll('extensions-item');
    for (const ext of extensions) {
      const name = ext.shadowRoot?.querySelector('#name')?.textContent;
      if (name && name.includes('Web Summary AI')) {
        return ext.id;
      }
    }
    return null;
  });
  
  return extensionId;
}

// Run the test
if (require.main === module) {
  testCustomPrompts()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { testCustomPrompts };