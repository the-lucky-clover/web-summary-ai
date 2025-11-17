const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');

// Simple test server to serve a test page
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Test page for summarization
app.get('/test-page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Article - Privacy Extension Test</title>
    </head>
    <body>
        <h1>Privacy Extension Security Test Article</h1>
        <p>This is a test page to verify that the Web Summary AI extension:</p>
        <ul>
            <li>Does NOT make unauthorized network requests</li>
            <li>Does NOT send data to external servers</li>
            <li>Does NOT collect browsing history</li>
            <li>Only processes content locally when explicitly requested</li>
            <li>Generates prompts that users must manually copy to their AI service</li>
        </ul>
        <h2>Key Benefits of This Extension</h2>
        <p>The extension works by:</p>
        <ol>
            <li>Extracting text content from web pages locally</li>
            <li>Formatting it into optimized prompts for AI services</li>
            <li>Displaying the ready-to-use prompt in the extension interface</li>
            <li>Allowing users to copy and paste into their preferred AI service</li>
        </ol>
        <p>This approach ensures complete privacy and gives users full control over their data.</p>
        <h2>Test Network Monitoring</h2>
        <p>If you monitor network requests while using this extension, you should only see:</p>
        <ul>
            <li>Requests to the current page (normal browsing)</li>
            <li>User-initiated requests to AI services (when you manually use the prompts)</li>
            <li>No automatic external API calls from the extension</li>
        </ul>
    </body>
    </html>
  `);
});

async function testExtension() {
  console.log('Starting extension security test...\n');

  // Start test server
  const server = app.listen(port, () => {
    console.log(`Test server running on http://localhost:${port}`);
  });

  try {
    const browser = await puppeteer.launch({
      headless: false, // Set to true for production test
      args: [
        '--load-extension=' + path.join(__dirname),
        '--disable-extensions-except=' + path.join(__dirname),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--user-data-dir=/tmp/puppeteer_dev_chrome_profile'
      ]
    });

    console.log('Browser launched with extension loaded');

    const page = await browser.newPage();

    // Monitor network requests
    console.log('\n🔍 Monitoring network requests...');
    const requests = [];

    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();

      requests.push({ url, method, type: 'request' });
      console.log(`📡 ${method} ${url.substring(0, 100)}...`);
    });

    page.on('response', (response) => {
      requests.push({ url: response.url(), method: 'RESPONSE', type: 'response' });
    });

    // Visit test page
    console.log('\n🌐 Visiting test page...');
    await page.goto(`http://localhost:${port}/test-page`, {
      waitUntil: 'networkidle2'
    });

    // Wait for extension to load and listen for console messages
    const messages = [];
    page.on('console', msg => {
      console.log(`🖥️ PAGE: ${msg.text()}`);
      messages.push(msg.text());
    });

    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if extension content script is loaded by looking for multiple indicators
    const extensionStatus = await page.evaluate(() => {
      return {
        hasFloatingButton: !!document.getElementById('web-summary-fab'),
        hasWebSummaryAI: typeof WebSummaryAI !== 'undefined',
        hasHistoryManager: typeof HistoryManager !== 'undefined',
        bodyChildCount: document.body ? document.body.children.length : 0,
        documentReadyState: document.readyState
      };
    });

    console.log(`\n📦 Extension Status:`);
    console.log(`   Floating Button: ${extensionStatus.hasFloatingButton ? 'YES' : 'NO'}`);
    console.log(`   WebSummaryAI: ${extensionStatus.hasWebSummaryAI ? 'YES' : 'NO'}`);
    console.log(`   HistoryManager: ${extensionStatus.hasHistoryManager ? 'YES' : 'NO'}`);
    console.log(`   Body Elements: ${extensionStatus.bodyChildCount}`);
    console.log(`   Document State: ${extensionStatus.documentReadyState}`);

    const hasFloatingButton = extensionStatus.hasFloatingButton;

    // Simulate clicking the floating button
    if (hasFloatingButton) {
      console.log('🖱️ Clicking extension floating button...');
      await page.evaluate(() => {
        document.getElementById('web-summary-fab').click();
      });

      // Wait for summary panel to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Analyze network requests for suspicious activity
    console.log('\n🔎 Analyzing network activity...');

    const externalRequests = requests.filter(req =>
      !req.url.includes('localhost:3000') &&
      !req.url.startsWith('data:') &&
      !req.url.startsWith('chrome-extension://')
    );

    const suspiciousRequests = requests.filter(req =>
      req.url.includes('analytics') ||
      req.url.includes('tracking') ||
      req.url.includes('api.') ||
      req.url.includes('server') ||
      req.url.includes('telemetry')
    );

    console.log(`📊 Total requests made: ${requests.length}`);
    console.log(`🌐 External requests: ${externalRequests.length}`);
    console.log(`🚩 Suspicious requests: ${suspiciousRequests.length}`);

    if (suspiciousRequests.length > 0) {
      console.log('\n⚠️ SUSPICIOUS REQUESTS FOUND:');
      suspiciousRequests.forEach(req => {
        console.log(`  - ${req.method} ${req.url}`);
      });
    } else {
      console.log('\n✅ No suspicious network activity detected');
    }

    // Check if any data was sent to external services
    const postRequests = requests.filter(req => req.method === 'POST' && !req.url.startsWith('chrome'));

    if (postRequests.length > 0) {
      console.log('\n⚠️ POST REQUESTS DETECTED:');
      postRequests.forEach(req => {
        console.log(`  - ${req.url}`);
      });
    } else {
      console.log('\n✅ No unauthorized POST requests detected');
    }

    // Evaluate extension behavior
    console.log('\n🎯 Extension Behavior Analysis:');
    const extensionWorked = await page.evaluate(() => {
      const panel = document.getElementById('web-summary-panel');
      if (panel) {
        const textarea = panel.querySelector('.prompt-text');
        return !!textarea && textarea.value.length > 0;
      }
      return false;
    });

    console.log(`🎯 Extension generated summary prompt: ${extensionWorked ? 'YES' : 'NO'}`);

    // Final security assessment
    console.log('\n🏆 FINAL SECURITY ASSESSMENT:');

    let securityScore = 0;
    const totalChecks = 6;

    if (suspiciousRequests.length === 0) {
      console.log('✅ No suspicious network requests');
      securityScore++;
    }

    if (postRequests.length === 0) {
      console.log('✅ No unauthorized data transmission');
      securityScore++;
    }

    if (hasFloatingButton && extensionWorked) {
      console.log('✅ Extension functions properly');
      securityScore++;
    }

    const extRequests = requests.filter(r => r.url.startsWith('chrome-extension://'));
    if (hasFloatingButton) {
      console.log('✅ Extension loaded and functioning');
      securityScore++;
    }

    if (!requests.some(r => r.url.includes('analytics'))) {
      console.log('✅ No analytics/tracking services');
      securityScore++;
    }

    if (!requests.some(r => r.url.includes('api.') && !r.url.includes('googleusercontent.com'))) {
      console.log('✅ No unauthorized external API calls');
      securityScore++;
    }

    console.log(`\n🔒 SECURITY SCORE: ${securityScore}/${totalChecks} (${Math.round(securityScore/totalChecks*100)}%)`);

    if (securityScore === totalChecks) {
      console.log('🎉 EXTENSION PASSED ALL PRIVACY TESTS');
      console.log('✨ This extension appears to be privacy-focused and secure');
    } else {
      console.log('⚠️ EXTENSION FAILED SOME PRIVACY TESTS');
      console.log('⚡ Review the findings above for potential privacy concerns');
    }

    await browser.close();
    server.close();

    return {
      securityScore,
      totalChecks,
      passed: securityScore === totalChecks,
      networkActivity: {
        total: requests.length,
        external: externalRequests.length,
        suspicious: suspiciousRequests.length,
        posts: postRequests.length
      }
    };

  } catch (error) {
    console.error('Test failed:', error);
    server.close();
    throw error;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testExtension().then(result => {
    process.exit(result.passed ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testExtension };
