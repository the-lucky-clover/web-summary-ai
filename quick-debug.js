const puppeteer = require('puppeteer');
const path = require('path');

async function quickDebug() {
  console.log('🔍 Quick extension debug check...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--load-extension=' + path.join(__dirname),
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  
  // Capture console messages
  const messages = [];
  page.on('console', msg => {
    messages.push(`${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    messages.push(`ERROR: ${error.message}`);
  });

  await page.goto('data:text/html,<html><body><h1>Test</h1></body></html>');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check extension loading
  const results = await page.evaluate(() => {
    return {
      contentSummarizer: typeof ContentSummarizer !== 'undefined',
      historyManager: typeof HistoryManager !== 'undefined',
      floatingButton: !!document.getElementById('web-summarizer-fab'),
      bodyHasElements: document.body.children.length
    };
  });

  console.log('📊 Extension Check Results:');
  console.log(`   ContentSummarizer loaded: ${results.contentSummarizer}`);
  console.log(`   HistoryManager loaded: ${results.historyManager}`);
  console.log(`   Floating button exists: ${results.floatingButton}`);
  console.log(`   Body elements count: ${results.bodyHasElements}`);
  
  console.log('\n📜 Console Messages:');
  messages.forEach(msg => console.log(`   ${msg}`));

  await browser.close();
  return results;
}

quickDebug().then(results => {
  console.log('\n✅ Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug error:', error);
  process.exit(1);
});