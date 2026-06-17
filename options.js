document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        debugToggle: document.getElementById('debugMode'),
        changeKeyBtn: document.getElementById('changeKeyBtn'),
        currentKey: document.getElementById('currentKey'),
        currentYear: document.getElementById('current-year'),
        appVersion: document.getElementById('appVersion'),
        clearCacheBtn: document.getElementById('clearCacheBtn'),
        instrumentSeg: document.getElementById('instrumentSeg'),
        weightPreset: document.getElementById('weightPreset'),
        customWeights: document.getElementById('customWeights'),
        newnessSlider: document.getElementById('newnessSlider'),
        leastPlayedSlider: document.getElementById('leastPlayedSlider'),
        newnessValue: document.getElementById('newnessValue'),
        leastPlayedValue: document.getElementById('leastPlayedValue')
    };

    // Randomization presets -> (newnessBoost, leastPlayedBoost)
    const WEIGHT_PRESETS = {
        off:       { newnessBoost: 1, leastPlayedBoost: 1 },
        new:       { newnessBoost: 8, leastPlayedBoost: 1 },
        forgotten: { newnessBoost: 1, leastPlayedBoost: 8 },
        both:      { newnessBoost: 5, leastPlayedBoost: 5 }
    };

    let isListening = false;

    // Initialize UI
    elements.currentYear.textContent = new Date().getFullYear();
    elements.appVersion.textContent = `v${chrome.runtime.getManifest().version}`;

    // Segmented instrument control
    const segButtons = Array.from(elements.instrumentSeg.querySelectorAll('.seg'));
    const setActiveInstrument = (value) => {
        segButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.value === value));
    };

    /**
     * Reflects the randomization settings in the UI (preset, sliders, labels).
     * @param {string} mode - Preset key or 'custom'
     * @param {number} newnessBoost
     * @param {number} leastPlayedBoost
     */
    const applyWeightUI = (mode, newnessBoost, leastPlayedBoost) => {
        elements.weightPreset.value = mode;
        elements.newnessSlider.value = newnessBoost;
        elements.leastPlayedSlider.value = leastPlayedBoost;
        elements.newnessValue.textContent = `${newnessBoost}×`;
        elements.leastPlayedValue.textContent = `${leastPlayedBoost}×`;
        elements.customWeights.classList.toggle('show', mode === 'custom');
    };

    // Load saved settings
    chrome.storage.sync.get(
        ['debug', 'shortcutKey', 'preferredInstrument', 'weightMode', 'newnessBoost', 'leastPlayedBoost'],
        (data) => {
            if (!chrome.runtime.lastError) {
                elements.debugToggle.checked = data.debug || false;
                elements.currentKey.textContent = data.shortcutKey || '=';
                setActiveInstrument(data.preferredInstrument || 'default');
                applyWeightUI(
                    data.weightMode || 'off',
                    data.newnessBoost || 1,
                    data.leastPlayedBoost || 1
                );
            }
        }
    );

    const VALID_INSTRUMENTS = ['default', 'guitar', 'bass', 'drums'];
    const VALID_WEIGHT_MODES = ['off', 'new', 'forgotten', 'both', 'custom'];

    // Clamp a boost to the integer slider range [1, 10]
    const clampBoost = (value, fallback) => {
        const n = Math.round(Number(value));
        if (Number.isNaN(n)) return fallback;
        return Math.min(10, Math.max(1, n));
    };

    /**
     * Validates and saves settings to Chrome storage.
     * @param {Object} settings - Partial settings to update
     */
    const saveSettings = (settings) => {
        const keys = ['debug', 'shortcutKey', 'preferredInstrument', 'weightMode', 'newnessBoost', 'leastPlayedBoost'];
        chrome.storage.sync.get(keys, (currentSettings) => {
            const sanitizedSettings = {
                debug: 'debug' in settings ? Boolean(settings.debug) : currentSettings.debug,
                shortcutKey: 'shortcutKey' in settings
                    ? settings.shortcutKey.slice(0, 20)
                    : (currentSettings.shortcutKey || '='),
                preferredInstrument: 'preferredInstrument' in settings
                    ? (VALID_INSTRUMENTS.includes(settings.preferredInstrument) ? settings.preferredInstrument : 'default')
                    : (currentSettings.preferredInstrument || 'default'),
                weightMode: 'weightMode' in settings
                    ? (VALID_WEIGHT_MODES.includes(settings.weightMode) ? settings.weightMode : 'off')
                    : (currentSettings.weightMode || 'off'),
                newnessBoost: 'newnessBoost' in settings
                    ? clampBoost(settings.newnessBoost, 1)
                    : (currentSettings.newnessBoost || 1),
                leastPlayedBoost: 'leastPlayedBoost' in settings
                    ? clampBoost(settings.leastPlayedBoost, 1)
                    : (currentSettings.leastPlayedBoost || 1)
            };

            chrome.storage.sync.set(sanitizedSettings, () => {
                if ('shortcutKey' in settings) {
                    elements.currentKey.textContent = sanitizedSettings.shortcutKey;
                }
            });
        });
    };

    // Debug toggle handler
    elements.debugToggle.addEventListener('change', () => {
        saveSettings({ debug: elements.debugToggle.checked });
    });

    // Preferred instrument handler (segmented control)
    segButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            setActiveInstrument(value);
            saveSettings({ preferredInstrument: value });
        });
    });

    // Randomization preset handler
    elements.weightPreset.addEventListener('change', () => {
        const mode = elements.weightPreset.value;
        if (mode === 'custom') {
            const newnessBoost = Number(elements.newnessSlider.value);
            const leastPlayedBoost = Number(elements.leastPlayedSlider.value);
            applyWeightUI('custom', newnessBoost, leastPlayedBoost);
            saveSettings({ weightMode: 'custom', newnessBoost, leastPlayedBoost });
        } else {
            const preset = WEIGHT_PRESETS[mode];
            applyWeightUI(mode, preset.newnessBoost, preset.leastPlayedBoost);
            saveSettings({ weightMode: mode, ...preset });
        }
    });

    // Custom slider handlers: live label update on input, persist on release
    const updateSliderLabels = () => {
        elements.newnessValue.textContent = `${elements.newnessSlider.value}×`;
        elements.leastPlayedValue.textContent = `${elements.leastPlayedSlider.value}×`;
    };
    const saveSliderValues = () => {
        elements.weightPreset.value = 'custom';
        elements.customWeights.classList.add('show');
        saveSettings({
            weightMode: 'custom',
            newnessBoost: Number(elements.newnessSlider.value),
            leastPlayedBoost: Number(elements.leastPlayedSlider.value)
        });
    };
    elements.newnessSlider.addEventListener('input', updateSliderLabels);
    elements.leastPlayedSlider.addEventListener('input', updateSliderLabels);
    elements.newnessSlider.addEventListener('change', saveSliderValues);
    elements.leastPlayedSlider.addEventListener('change', saveSliderValues);

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
                elements.changeKeyBtn.classList.remove('listening');
                setTimeout(() => {
                    elements.changeKeyBtn.textContent = 'Change Key';
                    isListening = false;
                }, 2000);
                document.removeEventListener('keydown', handleKeyPress);
                return;
            }

            saveSettings({ shortcutKey: pressedKey });

            // Visual confirmation
            elements.changeKeyBtn.textContent = 'Key Changed! ✓';
            elements.changeKeyBtn.style.backgroundColor = '#4CAF50';
            elements.changeKeyBtn.classList.remove('listening');

            setTimeout(() => {
                elements.changeKeyBtn.textContent = 'Change Key';
                elements.changeKeyBtn.style.backgroundColor = '';
                isListening = false;
            }, 2000);

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
        const originalBg = elements.clearCacheBtn.style.background;
        elements.clearCacheBtn.textContent = '✓ Cleared!';
        elements.clearCacheBtn.style.background = '#34a853';

        setTimeout(() => {
            elements.clearCacheBtn.textContent = originalText;
            elements.clearCacheBtn.style.background = originalBg;
        }, 2000);
    });
});
