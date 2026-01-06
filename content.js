// ============================================================================
// CONSTANTS
// ============================================================================

/** Cache time-to-live in milliseconds (1 minute) */
const CACHE_TTL_MS = 60000;

/** Default notification duration in milliseconds */
const NOTIFICATION_DURATION_MS = 3000;

/** Notification animation duration in milliseconds */
const NOTIFICATION_ANIMATION_MS = 300;

/** Notification position from top in pixels */
const NOTIFICATION_TOP_PX = 20;

/** Notification position from right in pixels */
const NOTIFICATION_RIGHT_PX = 20;

/** Notification max width in pixels */
const NOTIFICATION_MAX_WIDTH_PX = 300;

/** Notification z-index */
const NOTIFICATION_Z_INDEX = 10000;

/** Animation slide distance in pixels */
const SLIDE_DISTANCE_PX = 400;

/** Default keyboard shortcut */
const DEFAULT_SHORTCUT_KEY = '=';

/** Maximum song history size (to avoid repeats) */
const MAX_SONG_HISTORY = 10;

/** Notification colors by type */
const NOTIFICATION_COLORS = {
    error: '#f44336',
    success: '#4CAF50',
    info: '#2196F3',
    loading: '#FF9800'
};

// ============================================================================
// STATE
// ============================================================================

/** @type {boolean} Debug mode flag */
let isDebugMode = false;

/** @type {string} Current keyboard shortcut key */
let currentShortcutKey = DEFAULT_SHORTCUT_KEY;

/**
 * Cache for favorites to reduce API calls
 * @type {{data: Array|null, timestamp: number, ttl: number}}
 */
let favoritesCache = {
    data: null,
    timestamp: 0,
    ttl: CACHE_TTL_MS
};

/**
 * History of recently played song URLs to avoid immediate repeats
 * @type {Array<string>}
 */
let songHistory = [];

/**
 * Logs debug messages to console when debug mode is enabled
 * @param {...any} args - Arguments to log
 */
const logDebug = (...args) => {
    if (isDebugMode) {
        console.log('[Debug]', ...args);
    }
};

/**
 * Shows a temporary notification to the user
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', or 'loading'
 * @param {number} duration - Duration in ms (0 = no auto-dismiss, for loading states)
 * @returns {Object} Notification element with dismiss() method
 */
const showNotification = (message, type = 'info', duration = NOTIFICATION_DURATION_MS) => {
    const notification = document.createElement('div');
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: ${NOTIFICATION_TOP_PX}px;
        right: ${NOTIFICATION_RIGHT_PX}px;
        padding: 12px 20px;
        background: ${NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.info};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: ${NOTIFICATION_Z_INDEX};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: ${NOTIFICATION_MAX_WIDTH_PX}px;
        animation: slideInRight ${NOTIFICATION_ANIMATION_MS / 1000}s ease-out;
    `;

    // Add loading spinner for loading type
    if (type === 'loading') {
        const spinner = document.createElement('span');
        spinner.textContent = ' ⏳';
        notification.appendChild(spinner);
    }

    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(${SLIDE_DISTANCE_PX}px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(${SLIDE_DISTANCE_PX}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after duration (if duration > 0)
    let timeoutId = null;
    if (duration > 0) {
        timeoutId = setTimeout(() => {
            notification.style.animation = `slideOutRight ${NOTIFICATION_ANIMATION_MS / 1000}s ease-out`;
            setTimeout(() => notification.remove(), NOTIFICATION_ANIMATION_MS);
        }, duration);
    }

    // Return object with dismiss method
    return {
        element: notification,
        dismiss: () => {
            if (timeoutId) clearTimeout(timeoutId);
            notification.style.animation = `slideOutRight ${NOTIFICATION_ANIMATION_MS / 1000}s ease-out`;
            setTimeout(() => notification.remove(), NOTIFICATION_ANIMATION_MS);
        }
    };
};

/**
 * Creates the random song button for the Songsterr toolbar
 * Attempts to clone existing toolbar styling for consistency
 * @returns {HTMLElement|null} The created button element or null if creation fails
 */
const createRandomButton = () => {
    // Strategy 1: Try to clone an existing toolbar item (best styling match)
    const existingButtons = document.querySelectorAll('a[class*="Gl5"], nav a, header a');

    for (const existingButton of existingButtons) {
        if (existingButton.querySelector('svg') && existingButton.querySelector('div')) {
            try {
                const button = existingButton.cloneNode(true);

                // Update attributes
                button.id = 'random-icon';
                button.href = '#';
                button.setAttribute('aria-active', 'false');
                button.title = `Play Random Song (Shortcut: ${currentShortcutKey})`;

                // Replace SVG content
                const svg = button.querySelector('svg');
                if (svg) {
                    svg.innerHTML = `
                        <foreignObject width="40" height="40">
                            <img src="${chrome.runtime.getURL('images/random-48.png')}"
                                 alt="Random" width="40" height="40"
                                 style="width: 100%; height: 100%; object-fit: contain;">
                        </foreignObject>
                    `;
                }

                // Update text (find any text-containing div)
                const textDivs = button.querySelectorAll('div');
                for (const div of textDivs) {
                    if (div.textContent && div.textContent.trim() && !div.querySelector('svg, img')) {
                        div.textContent = 'Random';
                        break;
                    }
                }

                button.addEventListener('click', (e) => e.preventDefault());
                logDebug('Random button created by cloning existing button');
                return button;
            } catch (error) {
                logDebug('Failed to clone button, trying next one:', error);
                continue;
            }
        }
    }

    // Strategy 2: Flexible fallback with adaptive styling
    const button = document.createElement('a');
    button.id = 'random-icon';
    button.href = '#';
    button.title = `Play Random Song (Shortcut: ${currentShortcutKey})`;

    // Try to detect and use existing classes
    const existingNavItem = document.querySelector('nav a, header a');
    if (existingNavItem) {
        button.className = existingNavItem.className;
    }

    // Create flexible structure that adapts to different layouts
    button.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; min-height: 60px;">
            <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
                <img src="${chrome.runtime.getURL('images/random-48.png')}"
                     alt="Random" width="32" height="32"
                     style="display: block; opacity: 0.8; transition: opacity 0.2s;">
            </div>
            <div style="font-size: 12px; margin-top: 4px; text-align: center; opacity: 0.9;">Random</div>
        </div>
    `;

    // Add hover effects
    button.addEventListener('mouseenter', () => {
        const img = button.querySelector('img');
        if (img) img.style.opacity = '1';
    });

    button.addEventListener('mouseleave', () => {
        const img = button.querySelector('img');
        if (img) img.style.opacity = '0.8';
    });

    button.addEventListener('click', (e) => e.preventDefault());
    logDebug('Random button created with fallback method');
    return button;
};

/**
 * Fetches favorites from Songsterr with caching
 * @returns {Promise<Array>} Array of favorite song elements
 */
const fetchFavorites = async () => {
    const now = Date.now();

    // Check if cache is valid
    if (favoritesCache.data && (now - favoritesCache.timestamp) < favoritesCache.ttl) {
        logDebug('Using cached favorites, age:', Math.round((now - favoritesCache.timestamp) / 1000), 'seconds');
        return favoritesCache.data;
    }

    logDebug('Fetching fresh favorites from API...');
    const response = await fetch('https://www.songsterr.com/a/wa/favorites', {
        credentials: 'same-origin',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error('AUTH_REQUIRED');
        } else {
            throw new Error(`HTTP_ERROR_${response.status}`);
        }
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const favoriteSongs = Array.from(doc.querySelectorAll('a[data-song]'));

    // Update cache
    favoritesCache.data = favoriteSongs;
    favoritesCache.timestamp = now;
    logDebug('Cached', favoriteSongs.length, 'favorites');

    return favoriteSongs;
};

/**
 * Adds a song URL to the history to avoid immediate repeats
 * Maintains a maximum history size
 * @param {string} songUrl - The URL of the song to add to history
 */
const addToSongHistory = (songUrl) => {
    songHistory.push(songUrl);
    if (songHistory.length > MAX_SONG_HISTORY) {
        songHistory.shift(); // Remove oldest entry
    }
    logDebug('Song history updated:', songHistory.length, 'songs');
};

/**
 * Checks if a song is in the recent history
 * @param {string} songUrl - The URL to check
 * @returns {boolean} True if song is in recent history
 */
const isInRecentHistory = (songUrl) => {
    return songHistory.includes(songUrl);
};

/**
 * Selects a random song from favorites, avoiding recent history if possible
 * @param {Array} favoriteSongs - Array of favorite song elements
 * @returns {HTMLElement|null} Selected song element or null if none available
 */
const selectRandomSong = (favoriteSongs) => {
    // Filter out songs in recent history
    const availableSongs = favoriteSongs.filter(song => !isInRecentHistory(song.href));

    // If all songs are in history (or very few favorites), use all songs
    const songsToChooseFrom = availableSongs.length > 0 ? availableSongs : favoriteSongs;

    if (availableSongs.length === 0 && favoriteSongs.length > 0) {
        logDebug('All songs in history, choosing from all favorites');
    } else if (availableSongs.length < favoriteSongs.length) {
        logDebug(`Filtered ${favoriteSongs.length - availableSongs.length} songs from history`);
    }

    return songsToChooseFrom[Math.floor(Math.random() * songsToChooseFrom.length)];
};

/**
 * Plays a random song from user's favorites
 * Shows loading state and handles errors with user notifications
 * Avoids playing recently played songs when possible
 * @async
 * @param {boolean} forceRefresh - If true, bypasses cache and clears history
 * @returns {Promise<void>}
 */
const playRandomSong = async (forceRefresh = false) => {
    // Show loading notification
    const loadingNotification = showNotification('Loading favorites...', 'loading', 0);

    try {
        // Clear cache and history if force refresh
        if (forceRefresh) {
            favoritesCache.data = null;
            songHistory = [];
            logDebug('Force refresh: cache and history cleared');
        }

        const favoriteSongs = await fetchFavorites();
        logDebug('Found favorite songs:', favoriteSongs.length);

        if (favoriteSongs.length === 0) {
            showNotification('No favorites found. Add some songs to your favorites first!', 'error');
            logDebug('No favorite songs found');
            return;
        }

        const randomSong = selectRandomSong(favoriteSongs);
        if (!randomSong) {
            showNotification('No songs available', 'error');
            logDebug('No songs available after filtering');
            return;
        }

        const url = new URL(randomSong.href);

        if (url.hostname !== 'www.songsterr.com') {
            showNotification('Invalid song URL detected', 'error');
            logDebug('Invalid hostname:', url.hostname);
            return;
        }

        // Add to history before navigating
        addToSongHistory(randomSong.href);

        logDebug('Navigating to random song:', randomSong.href);
        window.location.href = randomSong.href;
        // Note: Navigation will dismiss the loading notification automatically

    } catch (error) {
        if (error.message === 'AUTH_REQUIRED') {
            showNotification('Please log in to Songsterr to use this feature', 'error');
        } else if (error.message.startsWith('HTTP_ERROR_')) {
            const status = error.message.replace('HTTP_ERROR_', '');
            showNotification(`Failed to fetch favorites (Error ${status})`, 'error');
        } else {
            showNotification('Failed to load favorites. Please try again.', 'error');
        }

        logDebug('Error fetching favorites:', error);
    } finally {
        // Always dismiss loading notification unless we're navigating
        loadingNotification.dismiss();
    }
};

/**
 * Initializes extension settings from Chrome storage
 * Fetches shortcut key and debug mode settings
 * @async
 * @returns {Promise<void>}
 */
const initializeSettings = async () => {
    try {
        const [shortcutResponse, debugResponse] = await Promise.all([
            chrome.runtime.sendMessage({ action: 'getShortcutKey' }),
            chrome.runtime.sendMessage({ action: 'getDebugMode' })
        ]);

        if (shortcutResponse && shortcutResponse.shortcutKey) {
            currentShortcutKey = shortcutResponse.shortcutKey;
            logDebug('Shortcut key initialized:', currentShortcutKey);
        }

        if (debugResponse && typeof debugResponse.debug !== 'undefined') {
            isDebugMode = debugResponse.debug;
            logDebug('Debug mode initialized:', isDebugMode);
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
};

// Listen for settings changes and commands
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'settingsChanged' && message.settings) {
        if (typeof message.settings.shortcutKey !== 'undefined') {
            currentShortcutKey = message.settings.shortcutKey;
            logDebug('Shortcut key updated to:', currentShortcutKey);

            // Update button tooltip if it exists
            const button = document.getElementById('random-icon');
            if (button) {
                button.title = `Play Random Song (Shortcut: ${currentShortcutKey})`;
            }
        }
        if (typeof message.settings.debug !== 'undefined') {
            isDebugMode = message.settings.debug;
            logDebug('Debug mode updated to:', isDebugMode);
        }
    } else if (message.action === 'clearCacheAndHistory') {
        // Clear favorites cache and song history
        favoritesCache.data = null;
        favoritesCache.timestamp = 0;
        songHistory = [];
        logDebug('Cache and history cleared via popup');
        showNotification('Cache and history cleared!', 'success', 2000);
        sendResponse({ success: true });
    }
});

/**
 * Toolbar selectors to try for finding the Songsterr toolbar
 * @type {Array<string>}
 */
const TOOLBAR_SELECTORS = [
    'div.I12xi',           // Original selector
    'nav.Gl54yj',          // Current Songsterr nav element
    'header.Gl56d3',       // Current Songsterr header element
    'header.Fbh5d4',       // Current Songsterr header element
    '.Gl54yj',             // Songsterr nav class
    '.Gl56d3',             // Songsterr header class
    '.Fbh5d4',             // Songsterr header class
    'nav[class*="Gl"]',    // Any nav with Songsterr-style class
    'header[class*="Gl"]', // Any header with Songsterr-style class
    'header[class*="Fb"]', // Any header with Songsterr-style class
    'header nav',          // Common header navigation
    'nav[role="navigation"]', // Semantic navigation
    '.navbar',             // Bootstrap-style navbar
    '.header-nav',         // Common header nav class
    '.top-nav',            // Common top nav class
    '.main-nav',           // Common main nav class
    'div[class*="nav"]',   // Any div with "nav" in class name
    'div[class*="header"]', // Any div with "header" in class name
    'div[class*="toolbar"]', // Any div with "toolbar" in class name
    'div[class*="top"]'    // Any div with "top" in class name
];

/**
 * Attempts to find the toolbar using multiple selectors
 * @returns {HTMLElement|null} The toolbar element or null if not found
 */
const findToolbar = () => {
    for (const selector of TOOLBAR_SELECTORS) {
        const element = document.querySelector(selector);
        if (element) {
            logDebug('Toolbar found with selector:', selector);
            return element;
        }
    }
    return null;
};

/**
 * Injects the random button into the toolbar
 * @param {HTMLElement} toolbar - The toolbar element to inject into
 * @returns {boolean} True if injection was successful
 */
const injectRandomButton = (toolbar) => {
    // Check if button already exists
    if (document.getElementById('random-icon')) {
        logDebug('Random button already exists');
        return true;
    }

    const randomButton = createRandomButton();
    if (!randomButton) {
        logDebug('Failed to create random button');
        return false;
    }

    randomButton.addEventListener('click', () => {
        logDebug('Random button clicked');
        playRandomSong();
    });

    toolbar.appendChild(randomButton);
    logDebug('Random button injected successfully');
    return true;
};

/**
 * Sets up a MutationObserver to watch for toolbar appearance
 * Useful for SPAs where the toolbar may load after initial page load
 * @returns {MutationObserver} The observer instance
 */
const setupToolbarObserver = () => {
    let hasInjected = false;

    const observer = new MutationObserver((mutations) => {
        if (hasInjected) return;

        const toolbar = findToolbar();
        if (toolbar) {
            if (injectRandomButton(toolbar)) {
                hasInjected = true;
                observer.disconnect();
                logDebug('Toolbar observer disconnected after successful injection');
            }
        }
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    logDebug('Toolbar observer set up');
    return observer;
};

if (window.location.hostname.includes("songsterr.com")) {
    window.addEventListener('load', async () => {
        await initializeSettings();

        // Set up keyboard shortcut regardless of whether UI button can be added
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcut when user is typing in input fields
            const activeElement = document.activeElement;
            if (activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            )) {
                return;
            }

            // Check if the shortcut key is pressed
            if (e.key === currentShortcutKey) {
                // Shift + key = force refresh (clear cache and history)
                if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    logDebug('Shift + shortcut key pressed: force refresh');
                    showNotification('Refreshing favorites and clearing history...', 'info', 1500);
                    playRandomSong(true); // Force refresh
                }
                // Just the key (no modifiers) = normal random play
                else if (!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    logDebug('Shortcut key pressed:', currentShortcutKey);
                    playRandomSong();
                }
                // Other modifier combinations are ignored to avoid conflicts
            }
        });

        // Try to find and inject button into toolbar
        const toolbar = findToolbar();
        if (toolbar) {
            injectRandomButton(toolbar);
        } else {
            // Toolbar not found immediately, set up observer to watch for it
            logDebug('Toolbar not found on load, setting up observer');
            setupToolbarObserver();
        }

        // Always log keyboard shortcut availability
        logDebug('Keyboard shortcut available:', currentShortcutKey, '(Shift+key for force refresh)');

        // Event listeners for the UI button
        randomButton.addEventListener('click', (e) => {
            e.preventDefault();
            logDebug('Random button clicked');
            playRandomSong();
        });
    });
}
