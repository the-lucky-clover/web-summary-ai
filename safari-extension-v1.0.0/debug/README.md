# Web Summarizer AI Safari Extension - Debug Documentation

## Debug Console Setup

The debug console provides a comprehensive environment for testing and evaluating Safari extension functionality with Apple design system integration.

### Quick Start

1. **Launch Debug Session**
   ```bash
   cd /Users/pounds_1/Development/web-summary-ai/safari-extension-v1.0.0
   ./debug/start-debug-session.sh
   ```

2. **Open Debug Console**
   - Open Safari
   - Navigate to: `file://$(pwd)/debug/debug-console.html`
   - Or double-click `debug-console.html` to open in Safari

### Debug Console Features

#### Expression Evaluation
- **Input Area**: Enter JavaScript expressions to evaluate
- **Keyboard Shortcuts**:
  - `Cmd+Enter`: Execute expression
  - `Cmd+↑/↓`: Navigate command history
  - `Cmd+K`: Clear console

#### Available APIs for Testing

**Safari Extension APIs:**
```javascript
// Extension information
safari.extension.baseURI
safari.extension.displayVersion

// Extension messaging (if connected)
safari.extension.globalPage
```

**Browser APIs (Mocked for Testing):**
```javascript
// Tab management
browser.tabs.query({active: true})
browser.tabs.sendMessage(tabId, {action: 'summarize'})

// Storage operations
browser.storage.sync.get(['apiKey', 'model'])
browser.storage.sync.set({apiKey: 'new-key'})

// Runtime messaging
browser.runtime.sendMessage({action: 'test'})
```

**Helper Functions:**
```javascript
// Object inspection
inspect(object)

// Console management
clear()
help()
```

#### Component Testing

**Popup Testing:**
```javascript
// Test popup API connectivity
testPopupAPI()

// Simulate popup actions
document.querySelector('.summarize-button')?.click()
```

**Content Script Testing:**
```javascript
// Test content script injection
testContentScript()

// Simulate page interaction
browser.tabs.sendMessage(tabId, {
  action: 'extractContent',
  options: { maxLength: 1000 }
})
```

**Storage Testing:**
```javascript
// Test storage operations
testStorage()

// Mock storage data
browser.storage.sync.get().then(data => inspect(data))
```

#### Apple Design System Testing

**Theme Detection:**
```javascript
// Check dark mode
window.matchMedia('(prefers-color-scheme: dark)').matches

// Test system colors
getComputedStyle(document.documentElement)
  .getPropertyValue('--apple-blue')
```

**iOS Features:**
```javascript
// Mobile detection
navigator.userAgent.includes('Mobile')

// Device capabilities
window.DeviceMotionEvent !== undefined
window.DeviceOrientationEvent !== undefined

// Haptic feedback simulation
navigator.vibrate && navigator.vibrate([10, 30, 10])
```

**Animation Testing:**
```javascript
// Test Apple animations
document.querySelector('.apple-button').style.transform = 'scale(0.95)'
setTimeout(() => {
  document.querySelector('.apple-button').style.transform = 'scale(1)'
}, 150)
```

### Safari Extension Debugging

#### Loading the Extension

1. **Enable Development Features**
   - Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"
   - Develop → Allow Unsigned Extensions

2. **Load Extension**
   - Safari → Preferences → Extensions
   - Click "+" to add extension
   - Navigate to safari-extension folder
   - Select and enable

#### Inspector Access

**Popup Inspection:**
```bash
# Right-click extension icon → Inspect Popup
# Or use Safari Web Inspector on popup-apple.html
```

**Content Script Inspection:**
```bash
# On any webpage with extension active:
# Right-click → Inspect Element → Console tab
# Look for extension content script logs
```

**Background Script Inspection:**
```bash
# Safari → Develop → Web Extension Background Pages
# Select Web Summarizer AI extension
```

#### Common Debug Scenarios

**Test Extension Installation:**
```javascript
// Check if extension is loaded
typeof safari !== 'undefined' && safari.extension

// Get extension info
safari.extension ? {
  baseURI: safari.extension.baseURI,
  version: safari.extension.displayVersion
} : 'Extension not loaded'
```

**Test Content Script Injection:**
```javascript
// From popup or background, test content script
browser.tabs.query({active: true}).then(tabs => {
  return browser.tabs.sendMessage(tabs[0].id, {
    action: 'ping'
  });
}).then(response => {
  console.log('Content script response:', response);
});
```

**Test Storage Persistence:**
```javascript
// Set test data
browser.storage.sync.set({
  debugTest: 'Debug value at ' + new Date().toISOString()
}).then(() => {
  // Retrieve test data
  return browser.storage.sync.get(['debugTest']);
}).then(result => {
  console.log('Storage test result:', result);
});
```

**Test Apple Design Integration:**
```javascript
// Check SF symbols rendering
document.querySelector('.sf-symbol') ? 
  'SF symbols detected' : 'SF symbols not found'

// Test glassmorphic effects
getComputedStyle(document.querySelector('.glass-card'))
  .getPropertyValue('backdrop-filter')

// Verify iOS safe areas
getComputedStyle(document.documentElement)
  .getPropertyValue('--safe-area-inset-top')
```

### Performance Profiling

**Basic Performance Testing:**
```javascript
// Start performance measurement
performance.mark('extension-start')

// ... run extension code ...

// End measurement
performance.mark('extension-end')
performance.measure('extension-total', 'extension-start', 'extension-end')

// Get results
performance.getEntriesByName('extension-total')[0].duration
```

**Memory Usage Monitoring:**
```javascript
// Check memory usage (if available)
performance.memory ? {
  used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
  total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
} : 'Memory info not available'
```

### Error Handling & Debugging

**Common Error Scenarios:**

1. **Extension Not Loading**
   ```javascript
   // Check manifest syntax
   fetch('./manifest-apple.json')
     .then(r => r.json())
     .then(manifest => console.log('Manifest valid:', manifest))
     .catch(e => console.error('Manifest error:', e))
   ```

2. **Content Script Issues**
   ```javascript
   // Test content script injection
   browser.tabs.executeScript({
     code: 'console.log("Content script test successful")'
   }).catch(e => console.error('Content script error:', e))
   ```

3. **Storage Problems**
   ```javascript
   // Test storage permissions
   browser.storage.sync.get()
     .then(data => console.log('Storage accessible:', Object.keys(data)))
     .catch(e => console.error('Storage error:', e))
   ```

### Testing Checklist

#### Functionality Tests
- [ ] Extension loads in Safari
- [ ] Popup opens and displays correctly
- [ ] Content script injects on web pages
- [ ] Storage operations work correctly
- [ ] Background script processes messages

#### Apple Design Tests
- [ ] SF symbols render properly
- [ ] System colors adapt to light/dark mode
- [ ] Glassmorphic effects display correctly
- [ ] iOS safe areas are respected
- [ ] Native animations work smoothly

#### Cross-Platform Tests
- [ ] Works on macOS Safari
- [ ] Works on iOS Safari
- [ ] Responsive design adapts correctly
- [ ] Touch interactions work on mobile
- [ ] Haptic feedback simulates properly

### Debug Console Tips

1. **Use Verbose Mode**: Enable detailed logging for comprehensive debugging
2. **Export Debug Data**: Save debugging session data for analysis
3. **Simulate Errors**: Test error handling with controlled failures
4. **Performance Profile**: Monitor execution times and memory usage
5. **Network Monitoring**: Watch extension API calls and responses

### Advanced Debugging

**Custom Test Scenarios:**
```javascript
// Create comprehensive test suite
const testSuite = {
  async testFullWorkflow() {
    console.log('🧪 Testing full extension workflow...');
    
    // Test popup functionality
    await this.testPopup();
    
    // Test content script
    await this.testContentScript();
    
    // Test storage
    await this.testStorage();
    
    console.log('✅ Full workflow test complete');
  },
  
  async testPopup() {
    // Simulate popup interactions
    return new Promise(resolve => {
      console.log('Testing popup...');
      setTimeout(resolve, 500);
    });
  },
  
  async testContentScript() {
    // Test content script functionality
    return browser.tabs.query({active: true}).then(tabs => {
      return browser.tabs.sendMessage(tabs[0].id, {action: 'test'});
    });
  },
  
  async testStorage() {
    // Test storage operations
    await browser.storage.sync.set({testKey: 'testValue'});
    const result = await browser.storage.sync.get(['testKey']);
    console.log('Storage test:', result);
  }
};

// Run comprehensive test
testSuite.testFullWorkflow();
```

This debug console provides a professional development environment for testing and refining the Web Summarizer AI Safari extension with full Apple design system integration.