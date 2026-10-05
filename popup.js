document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        currentYear: document.getElementById('current-year'),
        appVersion: document.getElementById('appVersion'),
        openSettingsBtn: document.getElementById('openSettingsBtn'),
        shortcutKeyDisplay: document.getElementById('shortcutKeyDisplay'),
        shortcutKeyDisplay2: document.getElementById('shortcutKeyDisplay2'),
        summaryRandomization: document.getElementById('summaryRandomization'),
        summaryInstrument: document.getElementById('summaryInstrument'),
        aboutToggle: document.getElementById('aboutToggle'),
        aboutList: document.getElementById('aboutList')
    };

    // Initialize UI
    elements.currentYear.textContent = new Date().getFullYear();
    elements.appVersion.textContent = `v${chrome.runtime.getManifest().version}`;

    // Display names for the randomization modes and instruments (match the settings page)
    const WEIGHT_MODE_LABELS = {
        off: 'Pure random',
        new: 'Discover new',
        forgotten: 'Revisit forgotten',
        both: 'Fresh & forgotten',
        custom: 'Custom'
    };
    const INSTRUMENT_LABELS = {
        default: 'Default',
        guitar: 'Guitar',
        bass: 'Bass',
        drums: 'Drums'
    };

    // Show the current shortcut key and active settings (read-only)
    chrome.storage.sync.get(['shortcutKey', 'weightMode', 'preferredInstrument'], (data) => {
        if (!chrome.runtime.lastError) {
            const key = data.shortcutKey || '=';
            elements.shortcutKeyDisplay.textContent = key;
            elements.shortcutKeyDisplay2.textContent = key;
            elements.summaryRandomization.textContent = WEIGHT_MODE_LABELS[data.weightMode] || WEIGHT_MODE_LABELS.off;
            elements.summaryInstrument.textContent = INSTRUMENT_LABELS[data.preferredInstrument] || INSTRUMENT_LABELS.default;
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
