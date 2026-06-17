document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        currentYear: document.getElementById('current-year'),
        appVersion: document.getElementById('appVersion'),
        openSettingsBtn: document.getElementById('openSettingsBtn'),
        shortcutKeyDisplay: document.getElementById('shortcutKeyDisplay'),
        shortcutKeyDisplay2: document.getElementById('shortcutKeyDisplay2'),
        aboutToggle: document.getElementById('aboutToggle'),
        aboutList: document.getElementById('aboutList')
    };

    // Initialize UI
    elements.currentYear.textContent = new Date().getFullYear();
    elements.appVersion.textContent = `v${chrome.runtime.getManifest().version}`;

    // Show the current shortcut key in the read-only hints
    chrome.storage.sync.get('shortcutKey', (data) => {
        if (!chrome.runtime.lastError) {
            const key = data.shortcutKey || '=';
            elements.shortcutKeyDisplay.textContent = key;
            elements.shortcutKeyDisplay2.textContent = key;
        }
    });

    // Collapsible "Why it's cool?" section (closed by default)
    elements.aboutToggle.addEventListener('click', () => {
        const isOpen = elements.aboutList.classList.toggle('open');
        elements.aboutToggle.classList.toggle('is-open', isOpen);
        elements.aboutToggle.setAttribute('aria-expanded', String(isOpen));
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
