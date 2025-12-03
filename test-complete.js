const puppeteer = require('puppeteer');
const path = require('path');

async function completeTest() {
  console.log('🧪 Complete Extension Test Suite\n');
  console.log('=================================\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--load-extension=' + path.join(__dirname),
      '--disable-extensions-except=' + path.join(__dirname),
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--user-data-dir=/tmp/test_profile_' + Date.now()
    ]
  });

  const page = await browser.newPage();
  
  // Capture all console output
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`📝 [${msg.type().toUpperCase()}] ${text}`);
  });

  // Capture errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });

  // Test 1: Basic HTML page
  console.log('\n🧪 Test 1: Loading basic HTML page...\n');
  await page.goto('data:text/html,<html><head><title>Test</title></head><body><h1>Test Article</h1><p>This is test content for the Web Summary AI extension.</p></body></html>', {
    waitUntil: 'networkidle0'
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  const basicPageTest = await page.evaluate(() => {
    return {
      webSummaryAI: typeof window.webSummaryAI !== 'undefined',
      historyManager: typeof HistoryManager !== 'undefined',
      floatingButton: !!document.getElementById('web-summary-fab'),
      bodyElements: document.body.children.length,
      documentState: document.readyState,
      title: document.title
    };
  });

  console.log('\n📊 Basic Page Test Results:');
  console.log(`   ✓ WebSummaryAI class: ${basicPageTest.webSummaryAI ? '✅ Loaded' : '❌ Not Found'}`);
  console.log(`   ✓ HistoryManager class: ${basicPageTest.historyManager ? '✅ Loaded' : '❌ Not Found'}`);
  console.log(`   ✓ Floating Button: ${basicPageTest.floatingButton ? '✅ Present' : '❌ Missing'}`);
  console.log(`   ✓ Body Elements: ${basicPageTest.bodyElements}`);
  console.log(`   ✓ Document State: ${basicPageTest.documentState}`);

  // Test 2: Click floating button if it exists
  if (basicPageTest.floatingButton) {
    console.log('\n🧪 Test 2: Testing floating button interaction...\n');
    
    await page.evaluate(() => {
      document.getElementById('web-summary-fab').click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const panelTest = await page.evaluate(() => {
      const panel = document.getElementById('web-summary-panel');
      return {
        panelExists: !!panel,
        panelVisible: panel ? window.getComputedStyle(panel).display !== 'none' : false
      };
    });
    
    console.log('📊 Panel Test Results:');
    console.log(`   ✓ Summary Panel: ${panelTest.panelExists ? '✅ Created' : '❌ Not Created'}`);
    console.log(`   ✓ Panel Visible: ${panelTest.panelVisible ? '✅ Visible' : '❌ Hidden'}`);
  } else {
    console.log('\n⚠️  Skipping Test 2: Floating button not found\n');
  }

  // Test 3: Test with actual web content
  console.log('\n🧪 Test 3: Testing with actual article content...\n');
  
  await page.goto('data:text/html,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Privacy Extension Test Article</title>
    </head>
    <body>
      <article>
        <h1>Privacy-Focused Web Summarization</h1>
        <p>This article discusses the importance of privacy in web extensions and how local processing ensures user data never leaves their device.</p>
        <h2>Key Principles</h2>
        <p>Privacy-first extensions should:</p>
        <ul>
          <li>Process all data locally</li>
          <li>Never transmit data without user consent</li>
          <li>Provide transparency in operations</li>
          <li>Minimize required permissions</li>
        </ul>
        <h2>Benefits</h2>
        <p>By keeping processing local, users maintain complete control over their data and can verify the extension's behavior through network monitoring.</p>
      </article>
    </body>
    </html>
  `), { waitUntil: 'networkidle0' });
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  const articleTest = await page.evaluate(() => {
    const button = document.getElementById('web-summary-fab');
    return {
      hasButton: !!button,
      articleContent: document.querySelector('article') ? document.querySelector('article').textContent.length : 0
    };
  });

  console.log('📊 Article Page Test Results:');
  console.log(`   ✓ Floating Button: ${articleTest.hasButton ? '✅ Present' : '❌ Missing'}`);
  console.log(`   ✓ Article Content Length: ${articleTest.articleContent} chars`);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const testsPassed = [
    basicPageTest.webSummaryAI,
    basicPageTest.historyManager,
    basicPageTest.floatingButton
  ].filter(Boolean).length;
  
  const totalTests = 3;
  
  console.log(`\n✅ Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`❌ Tests Failed: ${totalTests - testsPassed}/${totalTests}`);
  console.log(`⚠️  JavaScript Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors Detected:');
    errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
  }
  
  console.log('\n📝 Console Output Summary:');
  const errorLogs = consoleMessages.filter(m => m.type === 'error');
  const warningLogs = consoleMessages.filter(m => m.type === 'warning');
  const infoLogs = consoleMessages.filter(m => m.type === 'log' || m.type === 'info');
  
  console.log(`   Info messages: ${infoLogs.length}`);
  console.log(`   Warnings: ${warningLogs.length}`);
  console.log(`   Errors: ${errorLogs.length}`);
  
  if (errorLogs.length > 0) {
    console.log('\n❌ Console Errors:');
    errorLogs.forEach(log => console.log(`   - ${log.text}`));
  }

  if (warningLogs.length > 0) {
    console.log('\n⚠️  Console Warnings:');
    warningLogs.forEach(log => console.log(`   - ${log.text}`));
  }

  const overallPassed = testsPassed === totalTests && errors.length === 0 && errorLogs.length === 0;
  
  console.log('\n' + '='.repeat(50));
  console.log(overallPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED');
  console.log('='.repeat(50) + '\n');

  // Keep browser open for manual inspection
  console.log('💡 Browser will remain open for 10 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  await browser.close();
  
  process.exit(overallPassed ? 0 : 1);
}

completeTest().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
