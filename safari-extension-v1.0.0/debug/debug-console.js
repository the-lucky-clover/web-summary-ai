class DebugConsole {
    constructor() {
        this.currentComponent = 'popup';
        this.currentTab = 'console';
        this.extensionConnected = false;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.debugData = {};
        
        this.initializeConsole();
        this.connectToExtension();
    }

    initializeConsole() {
        this.logToConsole('System', 'Debug console initialized for Web Summarizer AI Safari Extension');
        this.logToConsole('System', 'Available APIs: browser.tabs, browser.storage, browser.runtime, safari.extension');
        
        // Check for Safari extension APIs
        if (typeof safari !== 'undefined' && safari.extension) {
            this.logToConsole('System', '✅ Safari Extension API detected');
            this.extensionConnected = true;
            this.updateConnectionStatus(true);
        } else {
            this.logToConsole('Warning', '⚠️  Safari Extension API not detected - running in standalone mode');
            this.updateConnectionStatus(false);
        }

        // Load debug data
        this.loadDebugData();
    }

    connectToExtension() {
        // Try to connect to the extension
        setTimeout(() => {
            if (typeof safari !== 'undefined' && safari.extension) {
                this.extensionConnected = true;
                this.updateConnectionStatus(true);
                this.logToConsole('System', '🔗 Connected to Safari Extension');
                this.inspectExtensionComponents();
            }
        }, 1000);
    }

    updateConnectionStatus(connected) {
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        
        if (connected) {
            indicator.className = 'status-indicator';
            text.textContent = 'Extension Connected';
        } else {
            indicator.className = 'status-indicator disconnected';
            text.textContent = 'Standalone Mode';
        }
    }

    logToConsole(type, message, data = null) {
        const output = document.getElementById('console-output');
        const entry = document.createElement('div');
        entry.className = `console-entry ${type.toLowerCase()}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'console-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        const content = document.createElement('div');
        content.className = 'console-content';
        
        if (data) {
            content.textContent = `${message}\n${JSON.stringify(data, null, 2)}`;
        } else {
            content.textContent = message;
        }
        
        entry.appendChild(timestamp);
        entry.appendChild(content);
        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
    }

    async evaluateExpression(expression) {
        if (!expression.trim()) return;

        this.commandHistory.unshift(expression);
        this.historyIndex = -1;

        this.logToConsole('input', `> ${expression}`);

        try {
            // Create a safe evaluation context
            const context = this.createEvaluationContext();
            
            // Evaluate the expression
            let result;
            
            // Special handling for common Safari extension patterns
            if (expression.includes('safari.extension')) {
                result = await this.evaluateSafariExtension(expression);
            } else if (expression.includes('browser.')) {
                result = await this.evaluateBrowserAPI(expression);
            } else {
                // Standard JavaScript evaluation
                const func = new Function('context', `
                    with(context) {
                        return ${expression};
                    }
                `);
                result = func(context);
            }

            // Handle promises
            if (result instanceof Promise) {
                result = await result;
            }

            this.logToConsole('output', 'Result:', result);
            
        } catch (error) {
            this.logToConsole('error', `Error: ${error.message}`);
            console.error('Debug console error:', error);
        }
    }

    createEvaluationContext() {
        return {
            // Mock browser APIs for testing
            browser: {
                tabs: {
                    query: async (queryInfo) => {
                        this.logToConsole('System', 'Simulating browser.tabs.query', queryInfo);
                        return [{
                            id: 1,
                            url: 'https://example.com',
                            title: 'Example Page',
                            active: true
                        }];
                    },
                    sendMessage: async (tabId, message) => {
                        this.logToConsole('System', 'Simulating browser.tabs.sendMessage', { tabId, message });
                        return { success: true };
                    }
                },
                storage: {
                    sync: {
                        get: async (keys) => {
                            this.logToConsole('System', 'Simulating browser.storage.sync.get', keys);
                            return {
                                apiKey: 'test-api-key',
                                model: 'gpt-4',
                                maxTokens: 150
                            };
                        },
                        set: async (data) => {
                            this.logToConsole('System', 'Simulating browser.storage.sync.set', data);
                            return true;
                        }
                    }
                },
                runtime: {
                    sendMessage: async (message) => {
                        this.logToConsole('System', 'Simulating browser.runtime.sendMessage', message);
                        return { success: true, response: 'Mock response' };
                    }
                }
            },
            // Safari extension specific APIs
            safari: typeof safari !== 'undefined' ? safari : {
                extension: {
                    baseURI: 'safari-extension://mock-extension-id/',
                    displayVersion: '1.0.0'
                }
            },
            // Helper functions
            inspect: (obj) => {
                this.inspectObject(obj);
                return obj;
            },
            clear: () => this.clearConsole(),
            help: () => this.showHelp()
        };
    }

    async evaluateSafariExtension(expression) {
        if (typeof safari !== 'undefined' && safari.extension) {
            // Real Safari extension environment
            return eval(expression);
        } else {
            // Mock Safari extension for testing
            this.logToConsole('Warning', 'Using mock Safari extension API');
            return eval(expression.replace('safari.extension', 'context.safari.extension'));
        }
    }

    async evaluateBrowserAPI(expression) {
        // Handle browser API calls
        this.logToConsole('System', `Evaluating browser API: ${expression}`);
        
        // Create a function that can access the browser context
        const func = new Function('browser', `return ${expression}`);
        return func(this.createEvaluationContext().browser);
    }

    inspectObject(obj, maxDepth = 3) {
        const tree = document.getElementById('inspector-tree');
        tree.innerHTML = '';
        
        this.renderObjectTree(obj, tree, 0, maxDepth);
        
        // Switch to inspector tab
        this.switchTab('inspector');
    }

    renderObjectTree(obj, container, depth = 0, maxDepth = 3) {
        if (depth > maxDepth) {
            const item = document.createElement('div');
            item.className = 'tree-item';
            item.style.marginLeft = `${depth * 16}px`;
            item.innerHTML = '<span class="tree-value">...</span>';
            container.appendChild(item);
            return;
        }

        if (obj === null || obj === undefined) {
            const item = document.createElement('div');
            item.className = 'tree-item';
            item.style.marginLeft = `${depth * 16}px`;
            item.innerHTML = `<span class="tree-value">${obj}</span>`;
            container.appendChild(item);
            return;
        }

        if (typeof obj === 'string') {
            const item = document.createElement('div');
            item.className = 'tree-item';
            item.style.marginLeft = `${depth * 16}px`;
            item.innerHTML = `<span class="tree-string">"${obj}"</span>`;
            container.appendChild(item);
            return;
        }

        if (typeof obj === 'number' || typeof obj === 'boolean') {
            const item = document.createElement('div');
            item.className = 'tree-item';
            item.style.marginLeft = `${depth * 16}px`;
            item.innerHTML = `<span class="tree-${typeof obj}">${obj}</span>`;
            container.appendChild(item);
            return;
        }

        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            
            for (const key of keys) {
                const item = document.createElement('div');
                item.className = 'tree-item tree-expandable';
                item.style.marginLeft = `${depth * 16}px`;
                
                const value = obj[key];
                const valueType = typeof value;
                let valuePreview = '';
                
                if (value === null) {
                    valuePreview = 'null';
                } else if (valueType === 'object') {
                    if (Array.isArray(value)) {
                        valuePreview = `Array(${value.length})`;
                    } else {
                        valuePreview = 'Object';
                    }
                } else {
                    valuePreview = String(value);
                    if (valuePreview.length > 50) {
                        valuePreview = valuePreview.substring(0, 50) + '...';
                    }
                }
                
                item.innerHTML = `${key}: <span class="tree-value">${valuePreview}</span>`;
                
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.classList.toggle('expanded');
                    
                    const childContainer = item.nextElementSibling;
                    if (childContainer && childContainer.classList.contains('tree-children')) {
                        childContainer.style.display = childContainer.style.display === 'none' ? 'block' : 'none';
                    } else if (valueType === 'object' && value !== null) {
                        const children = document.createElement('div');
                        children.className = 'tree-children';
                        this.renderObjectTree(value, children, depth + 1, maxDepth);
                        item.parentNode.insertBefore(children, item.nextSibling);
                    }
                });
                
                container.appendChild(item);
            }
        }
    }

    loadDebugData() {
        // Load stored debug data
        const stored = localStorage.getItem('webSummarizerDebugData');
        if (stored) {
            try {
                this.debugData = JSON.parse(stored);
                this.logToConsole('System', 'Loaded debug data from localStorage');
            } catch (e) {
                this.logToConsole('Warning', 'Failed to load debug data from localStorage');
            }
        }
    }

    saveDebugData() {
        try {
            localStorage.setItem('webSummarizerDebugData', JSON.stringify(this.debugData));
            this.logToConsole('System', 'Debug data saved to localStorage');
        } catch (e) {
            this.logToConsole('Error', 'Failed to save debug data to localStorage');
        }
    }

    inspectExtensionComponents() {
        this.logToConsole('System', 'Inspecting extension components...');
        
        // Check popup
        try {
            const popupData = {
                url: safari.extension ? safari.extension.baseURI + 'popup-apple.html' : 'popup-apple.html',
                scripts: ['popup-apple.js'],
                styles: ['popup-apple.css']
            };
            this.debugData.popup = popupData;
            this.logToConsole('System', 'Popup component detected', popupData);
        } catch (e) {
            this.logToConsole('Warning', 'Popup component inspection failed');
        }

        // Check content scripts
        try {
            const contentData = {
                scripts: ['content-ios.js'],
                styles: ['content-ios.css'],
                matches: ['<all_urls>']
            };
            this.debugData.content = contentData;
            this.logToConsole('System', 'Content script component detected', contentData);
        } catch (e) {
            this.logToConsole('Warning', 'Content script inspection failed');
        }

        this.saveDebugData();
    }

    showHelp() {
        const helpText = `
Web Summarizer AI Debug Console - Help

Available Commands:
• browser.tabs.query({active: true}) - Get active tab
• browser.storage.sync.get(['apiKey']) - Get stored settings
• safari.extension.baseURI - Get extension base URI
• inspect(object) - Inspect object properties
• clear() - Clear console
• help() - Show this help

Component Testing:
• testPopupAPI() - Test popup functionality
• testContentScript() - Test content script injection
• testStorage() - Test storage operations
• testNotifications() - Test notification system

Keyboard Shortcuts:
• Cmd+Enter - Execute expression
• Up/Down arrows - Navigate command history
• Cmd+K - Clear console

Debug Tools:
• Enable verbose logging for detailed output
• Export debug data for analysis
• Simulate errors for testing error handling
• Performance profiling for optimization
        `;
        
        this.logToConsole('System', helpText.trim());
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
        
        // Update panels
        document.querySelectorAll('.inspector-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-panel`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Load tab-specific data
        switch (tabName) {
            case 'inspector':
                this.loadInspectorData();
                break;
            case 'network':
                this.loadNetworkData();
                break;
            case 'storage':
                this.loadStorageData();
                break;
        }
    }

    loadInspectorData() {
        const tree = document.getElementById('inspector-tree');
        if (this.debugData && Object.keys(this.debugData).length > 0) {
            tree.innerHTML = '';
            this.renderObjectTree(this.debugData, tree);
        }
    }

    loadNetworkData() {
        // Simulate network requests
        const networkPanel = document.querySelector('#network-panel .console-output');
        networkPanel.innerHTML = `
            <div class="console-entry output">
                <div class="console-timestamp">${new Date().toLocaleTimeString()}</div>
                <div class="console-content">Network monitoring initialized
No requests captured yet - interact with extension to see network activity</div>
            </div>
        `;
    }

    loadStorageData() {
        const tree = document.getElementById('storage-tree');
        
        // Mock storage data
        const storageData = {
            'browser.storage.sync': {
                apiKey: 'sk-...',
                model: 'gpt-4',
                maxTokens: 150,
                temperature: 0.7
            },
            'browser.storage.local': {
                lastSummary: 'Recent summary text...',
                cache: {
                    'https://example.com': 'Cached summary'
                }
            },
            localStorage: {
                webSummarizerDebugData: this.debugData
            }
        };
        
        tree.innerHTML = '';
        this.renderObjectTree(storageData, tree);
    }

    handleKeydown(event) {
        const input = document.getElementById('expression-input');
        
        if (event.metaKey && event.key === 'Enter') {
            event.preventDefault();
            const expression = input.value.trim();
            if (expression) {
                this.evaluateExpression(expression);
                input.value = '';
            }
        } else if (event.key === 'ArrowUp' && event.metaKey) {
            event.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                input.value = this.commandHistory[this.historyIndex];
            }
        } else if (event.key === 'ArrowDown' && event.metaKey) {
            event.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                input.value = this.commandHistory[this.historyIndex];
            } else if (this.historyIndex === 0) {
                this.historyIndex = -1;
                input.value = '';
            }
        } else if (event.metaKey && event.key === 'k') {
            event.preventDefault();
            this.clearConsole();
        }
    }

    clearConsole() {
        document.getElementById('console-output').innerHTML = '';
        this.logToConsole('System', 'Console cleared');
    }
}

// Global functions for UI interaction
let debugConsole;

function initDebugConsole() {
    debugConsole = new DebugConsole();
}

function selectComponent(component) {
    document.querySelectorAll('.sidebar-item[data-component]').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-component="${component}"]`).classList.add('active');
    
    debugConsole.currentComponent = component;
    debugConsole.logToConsole('System', `Selected component: ${component}`);
}

function switchTab(tabName) {
    debugConsole.switchTab(tabName);
}

function handleKeydown(event) {
    debugConsole.handleKeydown(event);
}

function clearConsole() {
    debugConsole.clearConsole();
}

// Test functions
function testPopupAPI() {
    debugConsole.logToConsole('System', 'Testing popup API...');
    debugConsole.evaluateExpression('safari.extension ? safari.extension.baseURI : "Safari extension not available"');
}

function testContentScript() {
    debugConsole.logToConsole('System', 'Testing content script injection...');
    debugConsole.evaluateExpression('browser.tabs.query({active: true}).then(tabs => browser.tabs.sendMessage(tabs[0].id, {action: "test"}))');
}

function testStorage() {
    debugConsole.logToConsole('System', 'Testing storage operations...');
    debugConsole.evaluateExpression('browser.storage.sync.get(["apiKey", "model"])');
}

function testNotifications() {
    debugConsole.logToConsole('System', 'Testing notification system...');
    debugConsole.logToConsole('Output', 'Notification test completed (mock)');
}

function inspectCurrentTab() {
    debugConsole.logToConsole('System', 'Inspecting current tab...');
    debugConsole.evaluateExpression('browser.tabs.query({active: true, currentWindow: true})');
}

function enableVerboseLogging() {
    debugConsole.logToConsole('System', 'Verbose logging enabled');
    console.log('Web Summarizer AI Debug: Verbose logging enabled');
}

function exportDebugData() {
    const data = JSON.stringify(debugConsole.debugData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'web-summarizer-debug-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    debugConsole.logToConsole('System', 'Debug data exported');
}

function simulateError() {
    debugConsole.logToConsole('Error', 'Simulated error for testing error handling');
    try {
        throw new Error('This is a simulated error for testing purposes');
    } catch (e) {
        debugConsole.logToConsole('Error', e.message);
    }
}

function performanceProfile() {
    debugConsole.logToConsole('System', 'Starting performance profile...');
    
    const start = performance.now();
    
    // Simulate some work
    setTimeout(() => {
        const end = performance.now();
        debugConsole.logToConsole('Output', `Performance profile completed in ${(end - start).toFixed(2)}ms`);
    }, 100);
}

function runTests() {
    debugConsole.logToConsole('System', '🧪 Running comprehensive extension tests...');
    
    const tests = [
        'testPopupAPI()',
        'testContentScript()',
        'testStorage()',
        'testNotifications()'
    ];
    
    tests.forEach((test, index) => {
        setTimeout(() => {
            debugConsole.logToConsole('System', `Running test ${index + 1}/${tests.length}: ${test}`);
            eval(test);
        }, index * 500);
    });
    
    setTimeout(() => {
        debugConsole.logToConsole('System', '✅ All tests completed');
    }, tests.length * 500 + 100);
}

function resetExtension() {
    if (confirm('Are you sure you want to reset the extension debug state?')) {
        localStorage.removeItem('webSummarizerDebugData');
        debugConsole.debugData = {};
        debugConsole.clearConsole();
        debugConsole.logToConsole('System', '🔄 Extension debug state reset');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDebugConsole);

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebugConsole;
}