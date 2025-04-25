// background.js
console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => console.log('Extension installed'));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'playRandom') {
        const items = ['Song 1', 'Song 2', 'Song 3'];
        sendResponse({ randomItem: items[Math.floor(Math.random() * items.length)] });
    }
    if (message.action === 'getDebugMode') {
        chrome.storage.sync.get('debug', (data) => {
            sendResponse({ debug: data.debug || false });
        });
        return true; // Required for async response
    }
    
    if (message.action === 'getShortcutKey') {
        chrome.storage.sync.get('shortcutKey', (data) => {
            sendResponse({ shortcutKey: data.shortcutKey || '=' });
        });
        return true; // Required for async response
    }
    return true;
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        let settingsChanged = {};
        
        if (changes.shortcutKey) {
            settingsChanged.shortcutKey = changes.shortcutKey.newValue;
        }
        if (changes.debug) {
            settingsChanged.debug = changes.debug.newValue;
        }

        // Only broadcast if there are changes
        if (Object.keys(settingsChanged).length > 0) {
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'settingsChanged',
                        settings: settingsChanged
                    }).catch(() => {}); // Ignore errors for inactive tabs
                });
            });
        }
    }
});
