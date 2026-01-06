document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        debugToggle: document.getElementById('debugMode'),
        changeKeyBtn: document.getElementById('changeKeyBtn'),
        currentKey: document.getElementById('currentKey'),
        shortcutKeyDisplay: document.getElementById('shortcutKeyDisplay'),
        optionsBtn: document.getElementById('optionsBtn'),
        optionsPanel: document.getElementById('optionsPanel'),
        currentYear: document.getElementById('current-year'),
        clearCacheBtn: document.getElementById('clearCacheBtn')
    };

    let isListening = false;

    // Initialize UI
    elements.currentYear.textContent = new Date().getFullYear();
    
    // Options panel toggle with smooth animation
    elements.optionsBtn.addEventListener('click', () => {
        const isOpen = elements.optionsPanel.classList.contains('open');
        if (isOpen) {
            elements.optionsPanel.classList.remove('open');
            elements.optionsBtn.textContent = 'Options';
        } else {
            elements.optionsPanel.classList.add('open');
            elements.optionsBtn.textContent = 'Close Options';
        }
    });

    // Load saved settings
    chrome.storage.sync.get(['debug', 'shortcutKey'], (data) => {
        if (!chrome.runtime.lastError) {
            elements.debugToggle.checked = data.debug || false;
            const key = data.shortcutKey || '=';
            elements.currentKey.textContent = key;
            elements.shortcutKeyDisplay.textContent = key;
        }
    });

    /**
     * Validates and saves settings to Chrome storage
     * Sanitizes input to prevent storage issues
     * @param {Object} settings - Settings object with optional debug and shortcutKey properties
     * @param {boolean} [settings.debug] - Debug mode flag
     * @param {string} [settings.shortcutKey] - Keyboard shortcut key
     */
    const saveSettings = (settings) => {
        // Get current settings first
        chrome.storage.sync.get(['debug', 'shortcutKey'], (currentSettings) => {
            const sanitizedSettings = {
                debug: 'debug' in settings ? Boolean(settings.debug) : currentSettings.debug,
                shortcutKey: settings.shortcutKey ? settings.shortcutKey.slice(0, 20) : (currentSettings.shortcutKey || '=')
            };

            // Save to storage - this will trigger the storage.onChanged event
            chrome.storage.sync.set(sanitizedSettings, () => {
                // Only update UI elements if the corresponding settings were changed
                if ('shortcutKey' in settings) {
                    elements.currentKey.textContent = sanitizedSettings.shortcutKey;
                    elements.shortcutKeyDisplay.textContent = sanitizedSettings.shortcutKey;
                }
            });
        });
    };

    // Debug toggle handler
    elements.debugToggle.addEventListener('change', () => {
        saveSettings({ debug: elements.debugToggle.checked });
    });

    // Shortcut key handler with validation
    elements.changeKeyBtn.addEventListener('click', () => {
        if (isListening) return;

        isListening = true;
        elements.changeKeyBtn.textContent = 'Press any key...';
        elements.changeKeyBtn.classList.add('listening');

        const handleKeyPress = (e) => {
            e.preventDefault();
            
            // Filter out modifier keys when pressed alone
            const modifierKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Enter', 'Escape'];
            if (modifierKeys.includes(e.key)) {
                return;
            }

            const pressedKey = e.key;
            
            // Limit key length for storage
            if (pressedKey.length > 20) {
                elements.changeKeyBtn.textContent = 'Invalid key';
                setTimeout(() => {
                    elements.changeKeyBtn.textContent = 'Change Key';
                }, 2000);
                return;
            }

            saveSettings({ shortcutKey: pressedKey });
            elements.changeKeyBtn.textContent = 'Change Key';
            elements.changeKeyBtn.classList.remove('listening');
            isListening = false;
            
            document.removeEventListener('keydown', handleKeyPress);
        };

        document.addEventListener('keydown', handleKeyPress);
    });

    // Clear cache and history button handler
    elements.clearCacheBtn.addEventListener('click', () => {
        // Send message to all tabs to clear cache and history
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: 'clearCacheAndHistory' }, () => {
                    // Ignore errors for tabs that don't have the content script
                    if (chrome.runtime.lastError) {
                        // Silent fail - expected for non-Songsterr tabs
                    }
                });
            });
        });

        // Visual feedback
        const originalText = elements.clearCacheBtn.textContent;
        elements.clearCacheBtn.textContent = 'Cleared! ✓';
        elements.clearCacheBtn.style.backgroundColor = '#4CAF50';

        setTimeout(() => {
            elements.clearCacheBtn.textContent = originalText;
            elements.clearCacheBtn.style.backgroundColor = '';
        }, 2000);
    });
});
