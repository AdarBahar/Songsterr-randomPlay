let isDebugMode = false;
let currentShortcutKey = '=';

const logDebug = (...args) => {
    if (isDebugMode) {
        console.log('[Debug]', ...args);
    }
};

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
                button.title = 'Play Random Song (Shortcut: =)';

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
    button.title = 'Play Random Song (Shortcut: =)';

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

const playRandomSong = async () => {
    try {
        logDebug('Fetching favorites...');
        const response = await fetch('https://www.songsterr.com/a/wa/favorites', {
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const favoriteSongs = doc.querySelectorAll('a[data-song]');
        logDebug('Found favorite songs:', favoriteSongs.length);

        if (favoriteSongs.length) {
            const randomSong = favoriteSongs[Math.floor(Math.random() * favoriteSongs.length)];
            const url = new URL(randomSong.href);
            if (url.hostname === 'www.songsterr.com') {
                logDebug('Navigating to random song:', randomSong.href);
                window.location.href = randomSong.href;
            }
        } else {
            logDebug('No favorite songs found');
        }
    } catch (error) {
        logDebug('Error fetching favorites:', error);
    }
};

// Initialize settings
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
            if (e.key === currentShortcutKey) {
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
