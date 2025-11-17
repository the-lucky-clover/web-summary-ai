// Simple test content script
console.log('🚀 Test content script loading...');

// Test Chrome extension API availability
if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('✅ Chrome extension API available');
} else {
  console.log('❌ Chrome extension API not available');
}

// Test class loading
if (typeof HistoryManager !== 'undefined') {
  console.log('✅ HistoryManager loaded');
} else {
  console.log('❌ HistoryManager not loaded');
}

// Create a simple element to verify injection
const testDiv = document.createElement('div');
testDiv.id = 'test-extension-loaded';
testDiv.textContent = 'Extension Test Loaded';
testDiv.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  padding: 10px;
  z-index: 10000;
`;
document.body.appendChild(testDiv);

console.log('🎯 Test element added to page');