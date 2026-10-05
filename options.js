document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        debugToggle: document.getElementById('debugMode'),
        changeKeyBtn: document.getElementById('changeKeyBtn'),
        currentKey: document.getElementById('currentKey'),
        currentYear: document.getElementById('current-year'),
        appVersion: document.getElementById('appVersion'),
        clearCacheBtn: document.getElementById('clearCacheBtn'),
        instrumentSeg: document.getElementById('instrumentSeg'),
        weightSeg: document.getElementById('weightSeg'),
        customWeights: document.getElementById('customWeights'),
        newnessSlider: document.getElementById('newnessSlider'),
        leastPlayedSlider: document.getElementById('leastPlayedSlider'),
        newnessValue: document.getElementById('newnessValue'),
        leastPlayedValue: document.getElementById('leastPlayedValue'),
        snackbar: document.getElementById('snackbar'),
        snackbarIcon: document.getElementById('snackbarIcon'),
        snackbarText: document.getElementById('snackbarText')
    };

    // How long the "Change saved" snackbar stays visible, in milliseconds
    const SNACKBAR_DURATION_MS = 2000;
    let snackbarTimer = null;

    /**
     * Shows a brief confirmation snackbar. Repeated calls restart the timer.
     * @param {string} message
     * @param {boolean} isError
     */
    const showSnackbar = (message, isError = false) => {
        elements.snackbarText.textContent = message;
        elements.snackbarIcon.textContent = isError ? '!' : '✓';
        elements.snackbar.classList.toggle('is-error', isError);
        elements.snackbar.classList.add('show');

        if (snackbarTimer) clearTimeout(snackbarTimer);
        snackbarTimer = setTimeout(() => {
            elements.snackbar.classList.remove('show');
        }, SNACKBAR_DURATION_MS);
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

    // Segmented randomization control
    const weightSegButtons = Array.from(elements.weightSeg.querySelectorAll('.seg'));
    const setActiveWeight = (mode) => {
        weightSegButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.value === mode));
    };

    // The user's own slider positions. Kept separately from the active boosts
    // so they survive switching to a preset and back to Custom.
    let customWeights = { newnessBoost: 1, leastPlayedBoost: 1 };

    /**
     * Reflects the randomization mode in the UI. The sliders always show the
     * user's custom values, whichever mode is active.
     * @param {string} mode - Preset key or 'custom'
     */
    const applyWeightUI = (mode) => {
        setActiveWeight(mode);
        elements.newnessSlider.value = customWeights.newnessBoost;
        elements.leastPlayedSlider.value = customWeights.leastPlayedBoost;
        elements.newnessValue.textContent = `${customWeights.newnessBoost}×`;
        elements.leastPlayedValue.textContent = `${customWeights.leastPlayedBoost}×`;
        elements.customWeights.classList.toggle('show', mode === 'custom');
    };

    // Storage keys needed to work out the user's custom slider values
    const CUSTOM_WEIGHT_KEYS = ['weightMode', 'newnessBoost', 'leastPlayedBoost',
        'customNewnessBoost', 'customLeastPlayedBoost'];

    /**
     * Works out the user's custom slider values from stored settings.
     * Settings saved before custom values were stored separately only have
     * them in the active boosts, and only while Custom is selected.
     * @param {Object} data - Stored settings (CUSTOM_WEIGHT_KEYS)
     * @returns {{newnessBoost: number, leastPlayedBoost: number}}
     */
    const resolveCustomWeights = (data) => {
        const legacyCustom = data.weightMode === 'custom' ? data : {};
        return {
            newnessBoost: data.customNewnessBoost || legacyCustom.newnessBoost || 1,
            leastPlayedBoost: data.customLeastPlayedBoost || legacyCustom.leastPlayedBoost || 1
        };
    };

    // Load saved settings
    chrome.storage.sync.get(
        ['debug', 'shortcutKey', 'preferredInstrument', ...CUSTOM_WEIGHT_KEYS],
        (data) => {
            if (!chrome.runtime.lastError) {
                elements.debugToggle.checked = data.debug || false;
                elements.currentKey.textContent = data.shortcutKey || '=';
                setActiveInstrument(data.preferredInstrument || 'default');

                customWeights = resolveCustomWeights(data);
                applyWeightUI(data.weightMode || 'off');

                // One-time migration: give older Custom settings their own keys
                // so they outlive a later switch to a preset
                if (data.weightMode === 'custom' && data.customNewnessBoost == null) {
                    chrome.storage.sync.set({
                        customNewnessBoost: customWeights.newnessBoost,
                        customLeastPlayedBoost: customWeights.leastPlayedBoost
                    });
                }
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
     * Writes only the fields passed in, so overlapping saves of different
     * settings can't overwrite each other with stale values.
     * @param {Object} settings - Partial settings to update
     */
    const saveSettings = (settings) => {
        const sanitizedSettings = {};

        if ('debug' in settings) {
            sanitizedSettings.debug = Boolean(settings.debug);
        }
        if ('shortcutKey' in settings) {
            sanitizedSettings.shortcutKey = settings.shortcutKey.slice(0, 20);
        }
        if ('preferredInstrument' in settings) {
            sanitizedSettings.preferredInstrument = VALID_INSTRUMENTS.includes(settings.preferredInstrument)
                ? settings.preferredInstrument
                : 'default';
        }
        if ('weightMode' in settings) {
            sanitizedSettings.weightMode = VALID_WEIGHT_MODES.includes(settings.weightMode)
                ? settings.weightMode
                : 'off';
        }
        if ('newnessBoost' in settings) {
            sanitizedSettings.newnessBoost = clampBoost(settings.newnessBoost, 1);
        }
        if ('leastPlayedBoost' in settings) {
            sanitizedSettings.leastPlayedBoost = clampBoost(settings.leastPlayedBoost, 1);
        }
        if ('customNewnessBoost' in settings) {
            sanitizedSettings.customNewnessBoost = clampBoost(settings.customNewnessBoost, 1);
        }
        if ('customLeastPlayedBoost' in settings) {
            sanitizedSettings.customLeastPlayedBoost = clampBoost(settings.customLeastPlayedBoost, 1);
        }

        chrome.storage.sync.set(sanitizedSettings, () => {
            if (chrome.runtime.lastError) {
                showSnackbar("Couldn't save change. Please try again.", true);
                return;
            }
            showSnackbar('Change saved');
            if ('shortcutKey' in sanitizedSettings) {
                elements.currentKey.textContent = sanitizedSettings.shortcutKey;
            }
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

    // Counts randomization selections, so a slow storage read for an earlier
    // Custom click can't override a newer selection
    let weightSelectionId = 0;

    // Randomization preset handler (segmented control)
    weightSegButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.value;
            const selectionId = ++weightSelectionId;

            // Presets never touch the stored custom slider values
            if (mode !== 'custom') {
                applyWeightUI(mode);
                saveSettings({ weightMode: mode, ...WEIGHT_PRESETS[mode] });
                return;
            }

            // Custom restores the user's own slider values. Read them fresh:
            // the in-memory copy can be stale (settings open in another tab,
            // or a click before the initial load finished).
            chrome.storage.sync.get(CUSTOM_WEIGHT_KEYS, (data) => {
                if (selectionId !== weightSelectionId) return; // superseded
                if (!chrome.runtime.lastError) {
                    customWeights = resolveCustomWeights(data);
                }
                applyWeightUI('custom');
                saveSettings({ weightMode: 'custom', ...customWeights });
            });
        });
    });

    // Custom slider handlers: live label update on input, persist on release
    const updateSliderLabels = () => {
        elements.newnessValue.textContent = `${elements.newnessSlider.value}×`;
        elements.leastPlayedValue.textContent = `${elements.leastPlayedSlider.value}×`;
    };
    const saveSliderValues = () => {
        customWeights = {
            newnessBoost: Number(elements.newnessSlider.value),
            leastPlayedBoost: Number(elements.leastPlayedSlider.value)
        };
        applyWeightUI('custom');
        saveSettings({
            weightMode: 'custom',
            ...customWeights,
            customNewnessBoost: customWeights.newnessBoost,
            customLeastPlayedBoost: customWeights.leastPlayedBoost
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
