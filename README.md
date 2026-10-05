# Random Favorite Picker for Songsterr

A Chrome extension that adds a random song picker to Songsterr.com. Play a random song from your favorites with one click, weight the randomness toward newly added or least-played songs, and jump straight to your preferred instrument's track.

## Features

### Core Features
- **One-click random song selection** from your favorites
- **Keyboard shortcut support** (default: "=" key, fully customizable)
- **Smart UI integration** - Seamlessly adds a "Random" button to Songsterr's toolbar
- **Debug mode** for troubleshooting

### New in v1.5
- **🎯 Preferred instrument** - Open the Guitar, Bass, or Drums track when a song has one (falls back to the default track)
- **🎲 Weighted randomization** - Bias picks toward newly added and/or least-played favorites, via presets (Discover new / Revisit forgotten / Fresh & forgotten) or custom sliders
- **🗂️ Full settings page** - Settings now open in a dedicated browser tab; the popup is a compact launcher
- **🔌 JSON API** - Reads favorites from Songsterr's `/api/favorites` endpoint (more robust than HTML scraping, and the source of the new date-based features)
- **🎨 Redesigned UI** - Modern zinc-dark theme with bundled fonts, segmented controls, and an animated equalizer mark

### Performance & UX (v1.3+)
- **⚡ Lightning-fast caching** - Second click within 1 minute is instant (60-second cache)
- **🔄 Loading feedback** - Visual notification while fetching favorites
- **✨ Smooth animations** - Polished UI with slide-down/up transitions
- **📊 Performance boost** - Up to 60x fewer API calls for active users

### Smart Features (v1.4+)
- **🎲 No repeats** - Tracks last 10 songs to avoid playing the same song twice in a row
- **⚡ Force refresh** - Press Shift+key to clear cache and history instantly
- **🧹 Manual cache control** - Clear cache & history button on the Settings page
- **🔍 Dynamic detection** - MutationObserver injects the button once the toolbar appears and re-adds it if Songsterr re-renders
- **🦊 Chrome and Firefox** - Same code base, separate Firefox package (Firefox 140+)

### User Experience
- **Dismissible notifications** - Color-coded feedback (loading, success, error), shown top-center
- **Settings at a glance** - Active randomization and instrument shown in the popup, the Random button tooltip, and the loading notification
- **Instant saves** - Settings save as you change them, confirmed by a "Change saved" snackbar
- **Adaptive UI** - Multiple fallback strategies for Songsterr's dynamic layout
- **Settings persistence** - Preferences sync across devices via Chrome sync storage
- **Real-time updates** - Settings changes apply immediately across all tabs

## Installation

### From Chrome Web Store (Recommended)
Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/random-song-songsterr-ext/iieohhnmhcmnchcefjjlfdmobhmoaobe).

### Firefox
Install from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/random-songsterr-extension/) (Firefox 140 or newer).

### Manual Installation (Development)
1. Download or clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and navigate to `chrome://extensions`
5. Enable "Developer mode" (toggle in top-right)
6. Click "Load unpacked" and select the `dist` directory
7. The extension icon should appear in your Chrome toolbar

### Firefox (Development)
Requires Firefox 140 or newer.
1. Run `npm run build:firefox` (no `npm install` needed for this step)
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on…" and select `dist-firefox/manifest.json`
4. The add-on stays loaded until Firefox restarts

## Usage

1. **Navigate to Songsterr.com** and log in
2. **Add songs to your favorites** (if you haven't already)
3. **Click the Random button** in Songsterr's toolbar, or
4. **Press the keyboard shortcut** (default: "=" key)
5. **Enjoy!** A random song from your favorites will load

### Keyboard Shortcuts
- **`=` (or custom key)**: Play random song (uses cache, avoids recent repeats)
- **`Shift + =`**: Force refresh - clears cache & history, fetches fresh favorites (Shift + symbol keys assume a US keyboard layout)

### Settings
Click the extension icon, then **Open Settings** (or right-click the icon → Options) to open the full settings page in a tab. There you can:
- **Randomization** - choose Pure random, Discover new, Revisit forgotten, Fresh & forgotten, or Custom (two sliders)
- **Preferred Instrument** - Default / Guitar / Bass / Drums
- **Keyboard Shortcut** - rebind the trigger key
- **Debug Mode** - show detailed console logs
- **Clear Cache & History** - force a fresh fetch

Settings sync across devices via Chrome sync storage and apply live to open Songsterr tabs.

### Performance Tips
- **Cache optimization**: Click Random multiple times within 1 minute to experience instant loading
- **Variety**: Extension automatically avoids repeating the last 10 songs
- **Force refresh**: Use Shift+key when you've added new favorites
- **Manual control**: Use the "Clear Cache & History" button on the Settings page
- **Debug mode**: Enable to see cache hits/misses and performance metrics in console

## Development

### Prerequisites
- Node.js (v14+ recommended)
- npm (comes with Node.js)
- Chrome browser

### Setup

1. Clone the repository
```bash
git clone https://github.com/AdarBahar/Songsterr-randomPlay.git
cd Songsterr-randomPlay
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run build
```

The built extension will be in the `dist` directory.

### Development Workflow

1. Make changes to source files (`content.js`, `popup.js`, etc.)
2. Run `npm run build` to rebuild
3. Go to `chrome://extensions` and click refresh icon on the extension
4. Reload any Songsterr tabs to see changes

### Testing

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing instructions.

**Quick test checklist**:
- [ ] Random button appears on Songsterr toolbar
- [ ] Keyboard shortcut works
- [ ] Loading notification appears
- [ ] Second click within 1 minute is instant (cache working)
- [ ] Options panel animates smoothly
- [ ] No console errors

## Building for Production

### Build Commands

```bash
# Build for production (minified)
npm run build

# Create distribution ZIP
npm run zip

# Full compile (build + zip)
npm run compile
```

### Releasing a New Version
1. Bump `version` in `manifest.json` and `package.json`.
2. Run `npm run compile` and `npm run compile:firefox`. Every build first runs `scripts/sync-version.js`, which stamps the manifest version into the landing page footers (`landing/index.html`, `landing/privacy.html`).
3. Commit, tag (`vX.Y.Z`), upload the zips to the stores, and deploy `landing/` so the live site shows the new version.

### Build Output
- **Directory**: `dist/`
- **Contents**: All extension files (minified and optimized), including bundled fonts
- **Size**: ~110KB total (fonts account for ~52KB)

### Chrome Web Store Submission

1. **Build and package** (produces `extension.zip` with files at the archive root):
   ```bash
   npm run compile
   ```

2. **Submit to Chrome Web Store:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload `extension.zip`
   - Fill in store listing details
   - Submit for review

### Firefox Add-ons (AMO) Submission

The Firefox package is built by `scripts/build-firefox.js`. It ships the same
source files unminified (so no separate source upload is needed for review) and
patches `manifest.json` with the Firefox-only bits: an event-page background
script instead of a service worker, and `browser_specific_settings.gecko`.

1. **Build and package** (produces `extension-firefox.zip`):
   ```bash
   npm run compile:firefox
   ```

2. **Validate** (optional):
   ```bash
   npx web-ext lint --source-dir dist-firefox
   ```

3. **Submit to AMO:**
   - Go to the [Add-on Developer Hub](https://addons.mozilla.org/developers/)
   - Upload `extension-firefox.zip`
   - Fill in listing details and submit for review

See [deployment.md](.codeagent/current/deployment.md) for detailed deployment instructions.

## Version History

### v1.6.0 (2026-10-04) - Firefox Support & Fixes
- 🦊 **Firefox build** - `npm run compile:firefox` produces an AMO-ready package (event-page background, gecko add-on ID)
- 🎲 **Repeat avoidance fixed** - Song history and the favorites cache now persist in `sessionStorage`; previously every play's page navigation wiped them
- ⌨️ **Shift + shortcut fixed** - Force refresh now fires for symbol and letter keys (Shift + `=` reports as `+`)
- 🔍 **Button re-injection** - The toolbar observer keeps running and restores the button after an SPA re-render
- ⏱️ **Startup race fixed** - The content script no longer depends on the `load` event, which may already have fired
- ⚙️ **Settings saves fixed** - Changing one setting no longer risks reverting another
- 🔁 **Small libraries** - Never replays the song just played when another favorite exists
- ⚖️ **Fair weighting** - Favorites with identical dates now get equal odds
- 🗂️ **Settings page layout** - Responsive card grid that uses the page width; fits one screen on desktop
- ✅ **"Change saved" confirmation** - A snackbar confirms every settings change
- 🎚️ **Custom sliders remembered** - Switching to a preset and back to Custom restores your slider values
- 🧾 **Active settings at a glance** - Randomization and instrument shown in the popup, the Random button tooltip, and the loading notification
- 📍 **Notifications centered** - On-page notifications now appear top-center instead of top-right
- 🖼️ **Icons** - `icon16.png` is now a true 16px image; the old 32px file is `icon32.png`

### v1.5.0 (2026-06-17) - Instruments, Weighted Randomization & Redesign
- 🔌 **JSON API migration** - Favorites now come from `/api/favorites` (structured data, more robust than HTML scraping)
- 🎯 **Preferred instrument** - Open the Guitar/Bass/Drums track when available, else the default track
- 🎲 **Weighted randomization** - Favor newly added (`addedAt`) and/or least-played (`lastViewedAt`) favorites; presets + custom sliders
- 🗂️ **Full settings page** - Dedicated options tab; popup slimmed to a launcher
- 🎨 **Redesigned UI** - Zinc-dark theme, bundled fonts, segmented controls, animated equalizer, version shown in footers
- 🛠️ **Maintenance** - Consolidated build pipeline, hardened the toolbar MutationObserver, narrowed web-accessible resources to songsterr.com

### v1.4.1 (2026-01-06) - Chrome Web Store Submission ✅
- 🎨 **Popup UI refinements** - Removed guitar icon, cleaner header
- 🐛 **Fixed scrollbar issues** - Proper height constraints for Chrome's limits
- 📏 **Restored font sizes** - Better readability after over-compression
- 📜 **Scrollable settings** - Settings panel scrolls smoothly when expanded
- 🏪 **Chrome Web Store ready** - Screenshots, privacy policy, metadata finalized
- ✅ **Submitted** - Extension submitted to Chrome Web Store on Jan 6, 2026

### v1.4.0 (2026-01-06) - Code Quality & Features
- 🎯 **Constants extraction** - All magic numbers moved to named constants
- 🎲 **Song history tracking** - Avoids repeating last 10 songs for better variety
- ⚡ **Modifier key support** - Shift+key for force refresh (clears cache & history)
- 🧹 **Cache clear button** - Manual control in options panel
- 🔍 **MutationObserver** - Dynamic toolbar detection for SPAs
- 📦 **Modular functions** - Better code organization and maintainability

### v1.3.0 (2026-01-06) - Performance & UX Improvements
- ⚡ Added favorites caching (60-second TTL) for instant repeat clicks
- 🔄 Added loading notification with visual feedback
- ✨ Added smooth animations for options panel
- 📚 Added comprehensive JSDoc documentation
- 🧹 Code cleanup and refactoring

### v1.2.1 (2026-01-06) - Critical Bug Fixes
- 🐛 Fixed keyboard shortcut triggering in input fields
- 🐛 Fixed error notifications not appearing
- 🐛 Fixed tooltip not updating dynamically
- 🐛 Fixed modifier keys triggering shortcut

### v1.2.0 - Initial Chrome Web Store Release
- 🎉 First public release
- ✅ Core functionality: random song selection
- ✅ Keyboard shortcut support
- ✅ Settings panel with customization

## Performance Metrics

### Before v1.3.0
- Every click: ~300ms (API call)
- No visual feedback
- No caching
- Possible immediate repeats

### After v1.4.0
- First click: ~300ms (API call) + loading notification
- Subsequent clicks (within 1 min): <10ms (cached) ⚡
- **60x reduction** in API calls for active users
- **No repeats** in last 10 songs (better variety)
- Smooth animations and visual feedback
- Force refresh option (Shift+key)

## Technical Details

### Architecture
- **Manifest V3** Chrome Extension
- **Vanilla JavaScript** (no frameworks)
- **Webpack** for bundling and minification
- **Chrome Sync Storage** for settings persistence

### Key Technologies
- Content Scripts for DOM manipulation
- Service Worker for background tasks
- Chrome Extension APIs (storage, runtime, messaging)
- Songsterr API integration

### Code Quality
- **Constants-based configuration** (v1.4+) - All magic numbers extracted
- **Comprehensive JSDoc documentation** - All functions documented
- **Early return patterns** for readability
- **Single responsibility functions** - Modular design
- **Proper error handling** with try-catch-finally
- **MutationObserver** for dynamic content (v1.4+)

See [project_context.md](.codeagent/current/project_context.md) for detailed architecture documentation.

## Troubleshooting

### Button not appearing?
1. Check if you're on songsterr.com
2. Enable debug mode and check console
3. Keyboard shortcut still works as fallback

### Random song not playing?
1. Verify you're logged into Songsterr
2. Check if you have favorites added
3. Enable debug mode to see error messages

### Cache not working?
1. Enable debug mode
2. Check console for "Using cached favorites" message
3. Verify you're clicking within 60 seconds
4. Try the "Clear Cache & History" button on the Settings page

### Getting same song repeatedly?
1. Extension tracks last 10 songs to avoid repeats
2. If you have fewer than 10 favorites, some repeats are inevitable
3. Use Shift+key to force refresh and clear history

### More help
- See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed testing scenarios
- Check console with debug mode enabled
- Open an issue on GitHub

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (see TESTING_GUIDE.md)
5. Submit a pull request

## Roadmap

### ✅ Phase 3 (v1.4) - Code Quality & Features - COMPLETE
- ✅ Extract magic numbers to constants
- ✅ Add song history tracking (avoid repeats)
- ✅ Support modifier keys (Shift+key for force refresh)
- ✅ Use MutationObserver for dynamic toolbar detection
- ✅ Add cache clear button

### ✅ Phase 4 (v1.5) - Instruments & Weighted Randomization - COMPLETE
- ✅ Migrate favorites fetch to the JSON API
- ✅ Preferred instrument (Guitar/Bass/Drums) track selection
- ✅ Weighted randomization (newly added / least played)
- ✅ Full-page settings + redesigned UI

### Phase 5 (v2.0) - Major Features
- Migrate to TypeScript
- More filters (artist, difficulty)
- Statistics dashboard
- Playlist mode (queue multiple random songs)
- Full test coverage

## Links

- **Repository**: https://github.com/AdarBahar/Songsterr-randomPlay
- **Issues**: https://github.com/AdarBahar/Songsterr-randomPlay/issues
- **Chrome Web Store**: https://chromewebstore.google.com/detail/random-song-songsterr-ext/iieohhnmhcmnchcefjjlfdmobhmoaobe
- **Firefox Add-ons**: https://addons.mozilla.org/firefox/addon/random-songsterr-extension/
- **Website**: https://www.bahar.co.il/songsterr-randomSong
- **Songsterr**: https://www.songsterr.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the Songsterr community
- Inspired by the need for spontaneous practice sessions
- Thanks to all contributors and testers

---

**Made with ❤️ for guitarists, bassists, drummers, and musicians everywhere!**
