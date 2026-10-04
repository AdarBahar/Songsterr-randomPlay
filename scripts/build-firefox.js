// Builds the Firefox package into dist-firefox/.
//
// Sources are copied as-is (no webpack/minification) so the add-on can be
// reviewed on addons.mozilla.org without a separate source-code upload.
// manifest.json stays the single source of truth; only the Firefox-specific
// differences are patched in here.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist-firefox');

/** Files and directories shipped in the extension package */
const PACKAGE_FILES = [
    'background.js',
    'content.js',
    'popup.js',
    'popup.html',
    'options.js',
    'options.html',
    'images',
    'fonts/HankenGrotesk.woff2',
    'fonts/SpaceMono.woff2'
];

/** Add-on ID. Permanent once published on AMO; also required for storage.sync. */
const GECKO_ID = 'random-song-songsterr@bahar.co.il';

/**
 * Oldest supported Firefox (desktop / Android): the first releases that
 * understand data_collection_permissions. 140 is also an ESR, and is past 127,
 * where MV3 host access (content script matches) became granted at install.
 */
const GECKO_MIN_VERSION = '140.0';
const GECKO_ANDROID_MIN_VERSION = '142.0';

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const file of PACKAGE_FILES) {
    fs.cpSync(path.join(ROOT, file), path.join(OUT, file), { recursive: true });
}

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));

// Firefox runs MV3 background code as an event page, not a service worker
manifest.background = { scripts: ['background.js'] };

manifest.browser_specific_settings = {
    gecko: {
        id: GECKO_ID,
        strict_min_version: GECKO_MIN_VERSION,
        // The extension only talks to songsterr.com and collects nothing
        data_collection_permissions: { required: ['none'] }
    },
    gecko_android: {
        strict_min_version: GECKO_ANDROID_MIN_VERSION
    }
};

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 4) + '\n');

console.log(`Firefox build ready in ${path.relative(ROOT, OUT)}/ (v${manifest.version})`);
