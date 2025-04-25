let isDebugMode = false;
let currentShortcutKey = '=';

const logDebug = (...args) => {
    if (isDebugMode) {
        console.log('[Debug]', ...args);
    }
};

const createRandomButton = () => {
    // Sanitize text content
    const sanitizeText = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.textContent;
    };

    const button = {
        link: document.createElement('a'),
        container: document.createElement('div'),
        image: document.createElement('img'),
        text: document.createElement('div')
    };

    // Setup link
    Object.assign(button.link, {
        id: 'random-icon',
        href: '#',
        className: 'I1z0'
    });
    button.link.style.cssText = 'cursor:pointer;display:block;height:100%;min-width:90px;padding:3px 40px;position:relative;text-decoration:none!important';

    // Setup container
    button.container.className = 'Bgs1l5';
    button.container.style.cssText = 'position:relative;min-width:63px;display:block';

    // Setup image
    Object.assign(button.image, {
        src: chrome.runtime.getURL('images/random-48.png'),
        alt: 'Random',
        width: 40,
        height: 35,
        className: 'I1on'
    });
    button.image.style.cssText = 'display:block;margin:0 auto';

    // Setup text
    button.text.className = 'I11po';
    button.text.textContent = sanitizeText('Random');
    button.text.style.cssText = `
        color:var(--topbar-item-content);
        font-size:12px;
        font-weight:500;
        -webkit-text-stroke:.4px transparent;
        letter-spacing:.3px;
        margin-top:2px;
        overflow:hidden;
        text-overflow:ellipsis;
        text-transform:uppercase;
        transition:all .25s ease-in-out;
        white-space:nowrap;
        text-align:center
    `;

    // Assemble button
    button.container.appendChild(button.image);
    button.link.append(button.container, button.text);

    return button.link;
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
        
        const topBar = document.querySelector('div.I12xi');
        if (!topBar) {
            logDebug('Top bar not found');
            return;
        }

        const randomButton = createRandomButton();
        topBar.appendChild(randomButton);
        logDebug('Random button added to toolbar');

        // Event listeners
        randomButton.addEventListener('click', (e) => {
            e.preventDefault();
            logDebug('Random button clicked');
            playRandomSong();
        });

        // Global keydown listener
        document.addEventListener('keydown', (e) => {
            if (e.key === currentShortcutKey) {
                e.preventDefault();
                logDebug('Shortcut key pressed:', currentShortcutKey);
                playRandomSong();
            }
        });
    });
}
