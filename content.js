/** @type {boolean} Debug mode flag */
let isDebugMode = false;

/** @type {string} Current keyboard shortcut key */
let currentShortcutKey = '=';

/**
 * Cache for favorites to reduce API calls
 * @type {{data: Array|null, timestamp: number, ttl: number}}
 */
let favoritesCache = {
    data: null,
    timestamp: 0,
    ttl: 60000 // 1 minute cache
};

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
const showNotification = (message, type = 'info', duration = 3000) => {
    const notification = document.createElement('div');
    notification.textContent = message;

    const colors = {
        error: '#f44336',
        success: '#4CAF50',
        info: '#2196F3',
        loading: '#FF9800'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
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
                    transform: translateX(400px);
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
                    transform: translateX(400px);
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
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Return object with dismiss method
    return {
        element: notification,
        dismiss: () => {
            if (timeoutId) clearTimeout(timeoutId);
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
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
 * Plays a random song from user's favorites
 * Shows loading state and handles errors with user notifications
 * @async
 * @returns {Promise<void>}
 */
const playRandomSong = async () => {
    // Show loading notification
    const loadingNotification = showNotification('Loading favorites...', 'loading', 0);

    try {
        const favoriteSongs = await fetchFavorites();
        logDebug('Found favorite songs:', favoriteSongs.length);

        if (favoriteSongs.length === 0) {
            showNotification('No favorites found. Add some songs to your favorites first!', 'error');
            logDebug('No favorite songs found');
            return;
        }

        const randomSong = favoriteSongs[Math.floor(Math.random() * favoriteSongs.length)];
        const url = new URL(randomSong.href);

        if (url.hostname !== 'www.songsterr.com') {
            showNotification('Invalid song URL detected', 'error');
            logDebug('Invalid hostname:', url.hostname);
            return;
        }

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

// Listen for settings changes
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
    }
});

if (window.location.hostname.includes("songsterr.com")) {
    window.addEventListener('load', async () => {
        await initializeSettings();

        // Try multiple selectors for the top bar (Songsterr may have changed their CSS)
        const topBarSelectors = [
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

        let topBar = null;
        for (const selector of topBarSelectors) {
            topBar = document.querySelector(selector);
            if (topBar) {
                logDebug('Top bar found with selector:', selector);
                break;
            }
        }

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

            // Only trigger if no modifier keys are pressed (to avoid conflicts)
            if (e.key === currentShortcutKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                logDebug('Shortcut key pressed:', currentShortcutKey);
                playRandomSong();
            }
        });

        if (!topBar) {
            logDebug('Top bar not found with any selector. Available elements:');
            // Log some common elements to help debug
            const commonElements = document.querySelectorAll('nav, header, div[class*="nav"], div[class*="header"], div[class*="toolbar"]');
            commonElements.forEach((el, index) => {
                logDebug(`Element ${index}:`, el.tagName, el.className, el.id);
            });
            logDebug('Keyboard shortcut still available:', currentShortcutKey);
            return;
        }

        const randomButton = createRandomButton();

        // Try to find the empty div classes next to the logo
        const emptyDivs = topBar.querySelectorAll('div.Gl5687');
        const logo = topBar.querySelector('#logo, a[aria-label="Songsterr"]');

        let inserted = false;

        // First try: use the first empty div if available
        if (emptyDivs.length > 0) {
            emptyDivs[0].appendChild(randomButton);
            logDebug('Random button inserted into empty div.Gl5687');
            inserted = true;
        }
        // Second try: insert right after the logo
        else if (logo && logo.nextSibling) {
            topBar.insertBefore(randomButton, logo.nextSibling);
            logDebug('Random button inserted after logo');
            inserted = true;
        }
        // Third try: insert right after the logo (if no next sibling)
        else if (logo) {
            logo.insertAdjacentElement('afterend', randomButton);
            logDebug('Random button inserted adjacent to logo');
            inserted = true;
        }
        // Fallback: insert at the beginning
        else if (topBar.firstChild) {
            topBar.insertBefore(randomButton, topBar.firstChild);
            logDebug('Random button inserted at the beginning of toolbar (fallback)');
            inserted = true;
        }
        // Last resort: append to the end
        else {
            topBar.appendChild(randomButton);
            logDebug('Random button added to empty toolbar (last resort)');
            inserted = true;
        }

        if (!inserted) {
            logDebug('Failed to insert random button');
        }

        // Event listeners for the UI button
        randomButton.addEventListener('click', (e) => {
            e.preventDefault();
            logDebug('Random button clicked');
            playRandomSong();
        });
    });
}
