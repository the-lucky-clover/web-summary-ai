const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testSimpleExtension() {
  console.log('🧪 Testing simplified extension...\n');

  // Backup original manifest and replace with test version
  const originalManifest = path.join(__dirname, 'manifest.json');
  const testManifest = path.join(__dirname, 'manifest-test.json');
  const backupManifest = path.join(__dirname, 'manifest-backup.json');

  // Backup and replace
  fs.copyFileSync(originalManifest, backupManifest);
  fs.copyFileSync(testManifest, originalManifest);

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--load-extension=' + path.join(__dirname),
        '--disable-extensions-except=' + path.join(__dirname),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    
    // Capture console messages
    const messages = [];
    page.on('console', msg => {
      messages.push(`${msg.type()}: ${msg.text()}`);
      console.log(`📝 ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      messages.push(`ERROR: ${error.message}`);
      console.log(`❌ ERROR: ${error.message}`);
    });

    await page.goto('data:text/html,<html><body><h1>Simple Test</h1></body></html>');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if test element exists
    const testElementExists = await page.evaluate(() => {
      return !!document.getElementById('test-extension-loaded');
    });

    console.log(`\n🎯 Test Results:`);
    console.log(`   Test element exists: ${testElementExists}`);
    console.log(`   Console messages: ${messages.length}`);

    await browser.close();
    return testElementExists;

  } finally {
    // Restore original manifest
    fs.copyFileSync(backupManifest, originalManifest);
    fs.unlinkSync(backupManifest);
    console.log('🔄 Restored original manifest');
  }
}

testSimpleExtension().then(success => {
  console.log(`\n${success ? '✅ Extension loading works!' : '❌ Extension loading failed'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});