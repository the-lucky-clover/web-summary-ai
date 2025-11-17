const puppeteer = require('puppeteer');
const path = require('path');

async function testYouTubeIntegration() {
  console.log('🎬 Testing YouTube integration...\n');

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--load-extension=' + path.join(__dirname),
        '--disable-extensions-except=' + path.join(__dirname),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--user-data-dir=/tmp/puppeteer_youtube_test'
      ]
    });

    const page = await browser.newPage();

    // Monitor network requests
    const requests = [];
    page.on('request', (request) => {
      requests.push(request.url());
      if (!request.url().includes('youtube.com') && 
          !request.url().includes('googlevideo.com') &&
          !request.url().includes('ggpht.com') &&
          !request.url().includes('ytimg.com')) {
        console.log(`📡 External request: ${request.url()}`);
      }
    });

    // Go to a YouTube video (using a short, safe educational video)
    console.log('🌐 Navigating to YouTube...');
    await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Wait for extension to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if YouTube-specific extension features loaded
    const youtubeStatus = await page.evaluate(() => {
      return {
        hasFloatingButton: !!document.getElementById('web-summarizer-fab'),
        hasYouTubeScript: typeof window.youtubeContentScript !== 'undefined',
        videoTitle: document.querySelector('h1.ytd-watch-metadata')?.textContent || 'Not found',
        hasTranscriptButton: !!document.querySelector('[aria-label*="transcript" i], [aria-label*="Transcript" i]')
      };
    });

    console.log(`\n📺 YouTube Extension Status:`);
    console.log(`   Floating Button: ${youtubeStatus.hasFloatingButton ? 'YES' : 'NO'}`);
    console.log(`   YouTube Script: ${youtubeStatus.hasYouTubeScript ? 'YES' : 'NO'}`);
    console.log(`   Video Title: ${youtubeStatus.videoTitle.substring(0, 50)}...`);
    console.log(`   Transcript Available: ${youtubeStatus.hasTranscriptButton ? 'YES' : 'NO'}`);

    // Test clicking the floating button on YouTube
    if (youtubeStatus.hasFloatingButton) {
      console.log('\n🖱️ Testing extension on YouTube...');
      await page.evaluate(() => {
        document.getElementById('web-summarizer-fab').click();
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const summaryGenerated = await page.evaluate(() => {
        const panel = document.getElementById('web-summarizer-panel');
        return !!panel && panel.querySelector('.prompt-text')?.value?.length > 0;
      });

      console.log(`📝 YouTube summary generated: ${summaryGenerated ? 'YES' : 'NO'}`);
    }

    // Analyze YouTube-specific privacy
    const youtubeRequests = requests.filter(url => 
      !url.includes('youtube.com') && 
      !url.includes('googlevideo.com') &&
      !url.includes('ggpht.com') &&
      !url.includes('ytimg.com') &&
      !url.includes('gstatic.com')
    );

    console.log(`\n🔒 YouTube Privacy Check:`);
    console.log(`   Total requests: ${requests.length}`);
    console.log(`   Non-YouTube requests: ${youtubeRequests.length}`);
    
    if (youtubeRequests.length === 0) {
      console.log('✅ No suspicious external requests on YouTube');
    } else {
      console.log('⚠️ External requests detected:');
      youtubeRequests.forEach(url => console.log(`   - ${url}`));
    }

    await browser.close();

    return {
      passed: youtubeStatus.hasFloatingButton,
      videoDetected: youtubeStatus.videoTitle !== 'Not found',
      privacyScore: youtubeRequests.length === 0 ? 100 : 75
    };

  } catch (error) {
    console.error('❌ YouTube test failed:', error.message);
    return { passed: false, error: error.message };
  }
}

if (require.main === module) {
  testYouTubeIntegration().then(result => {
    console.log(`\n🎬 YouTube Test ${result.passed ? 'PASSED' : 'FAILED'}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    process.exit(result.passed ? 0 : 1);
  });
}

module.exports = { testYouTubeIntegration };