// Stamps the extension version from manifest.json into the landing pages.
//
// Runs automatically before every build (see "prebuild" / "prebuild:firefox"
// in package.json), so bumping the version in manifest.json and building a
// release is enough to update the footers. The landing pages still have to be
// deployed for the live site to change.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** Pages that show the version as <span class="ver">vX.Y.Z</span> */
const PAGES = ['landing/index.html', 'landing/privacy.html'];

const VERSION_SPAN = /(<span class="ver">)v[^<]*(<\/span>)/g;

const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));

for (const page of PAGES) {
    const file = path.join(ROOT, page);
    const html = fs.readFileSync(file, 'utf8');

    if (html.search(VERSION_SPAN) === -1) {
        console.warn(`sync-version: no version span found in ${page}`);
        continue;
    }

    const updated = html.replace(VERSION_SPAN, `$1v${version}$2`);
    if (updated !== html) {
        fs.writeFileSync(file, updated);
        console.log(`sync-version: ${page} -> v${version}`);
    }
}
