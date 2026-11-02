/**
 * Background script for Songsterr Random Favorite Picker
 * Handles message passing and storage change broadcasting
 */

/**
 * Logs only when debug mode is enabled in storage.
 * Keeps the production service worker quiet (it re-runs on every spin-up).
 * @param {...any} args - Arguments to log
 */
const logDebug = (...args) => {
    chrome.storage.sync.get('debug', (data) => {
        if (data.debug) console.log('[Background]', ...args);
    });
};

chrome.runtime.onInstalled.addListener(() => logDebug('Extension installed'));

/**
 * Message handler for content script requests.
 * 'getSettings' returns every setting the content script needs in one
 * round trip, instead of one message per setting.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSettings') {
        chrome.storage.sync.get(
            ['debug', 'shortcutKey', 'preferredInstrument', 'weightMode', 'newnessBoost', 'leastPlayedBoost'],
            (data) => {
                sendResponse({
                    debug: data.debug || false,
                    shortcutKey: data.shortcutKey || '=',
                    preferredInstrument: data.preferredInstrument || 'default',
                    weightMode: data.weightMode || 'off',
                    newnessBoost: data.newnessBoost || 1,
                    leastPlayedBoost: data.leastPlayedBoost || 1
                });
            }
        );
        return true; // Required for async response
    }

    // Don't return true for unhandled messages
});

/**
 * Storage change listener
 * Broadcasts settings changes to all tabs for real-time updates
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        let settingsChanged = {};

        if (changes.shortcutKey) {
            settingsChanged.shortcutKey = changes.shortcutKey.newValue;
        }
        if (changes.debug) {
            settingsChanged.debug = changes.debug.newValue;
        }
        if (changes.preferredInstrument) {
            settingsChanged.preferredInstrument = changes.preferredInstrument.newValue;
        }
        if (changes.weightMode) {
            settingsChanged.weightMode = changes.weightMode.newValue;
        }
        if (changes.newnessBoost) {
            settingsChanged.newnessBoost = changes.newnessBoost.newValue;
        }
        if (changes.leastPlayedBoost) {
            settingsChanged.leastPlayedBoost = changes.leastPlayedBoost.newValue;
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
