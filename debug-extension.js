const puppeteer = require('puppeteer');
const path = require('path');

async function debugExtension() {
  console.log('🔍 Debugging extension loading...\n');

  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        '--load-extension=' + path.join(__dirname),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-extensions-except=' + path.join(__dirname),
        '--enable-logging',
        '--log-level=0'
      ]
    });

    console.log('✅ Browser launched with extension');

    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();

    // Navigate to test page
    await page.goto('file://' + path.join(__dirname, 'test-page.html'));

    // Wait for content scripts
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check console for errors
    page.on('console', msg => {
      console.log(`🖥️ PAGE LOG: ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });

    // Check if content script loaded
    const debugInfo = await page.evaluate(() => {
      return {
        webSummaryAI: typeof WebSummaryAI !== 'undefined',
        historyManager: typeof HistoryManager !== 'undefined',
        floatingButton: !!document.querySelector('.web-summary-fab'),
        bodyClasses: document.body.className,
        scriptTags: Array.from(document.scripts).length,
        errors: window.lastError || 'none'
      };
    });

    console.log(`📦 WebSummaryAI class loaded: ${debugInfo.webSummaryAI ? 'YES' : 'NO'}`);
    console.log(`🎯 Floating button exists: ${debugInfo.floatingButton ? 'YES' : 'NO'}`);
    console.log(`📚 HistoryManager class loaded: ${debugInfo.historyManager ? 'YES' : 'NO'}`);
    console.log(`📄 Scripts loaded: ${debugInfo.scriptTags}`);
    console.log(`🏷️  Body classes: ${debugInfo.bodyClasses || 'none'}`);

    // Leave browser open for manual inspection
    console.log('\n🔍 Browser left open for manual inspection...');
    console.log('Press Ctrl+C to close when done debugging');

    // Keep the process alive
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugExtension().catch(console.error);