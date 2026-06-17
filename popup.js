document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        currentYear: document.getElementById('current-year'),
        openSettingsBtn: document.getElementById('openSettingsBtn'),
        shortcutKeyDisplay: document.getElementById('shortcutKeyDisplay'),
        shortcutKeyDisplay2: document.getElementById('shortcutKeyDisplay2')
    };

    // Initialize UI
    elements.currentYear.textContent = new Date().getFullYear();

    // Show the current shortcut key in the read-only hints
    chrome.storage.sync.get('shortcutKey', (data) => {
        if (!chrome.runtime.lastError) {
            const key = data.shortcutKey || '=';
            elements.shortcutKeyDisplay.textContent = key;
            elements.shortcutKeyDisplay2.textContent = key;
        }
    });

    // Open the full settings page in a tab
    elements.openSettingsBtn.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
});
