# Random Favorite Picker for Songsterr

A Chrome extension that adds a random song picker functionality to Songsterr.com, allowing users to play a random song from their favorites list with enhanced performance and user experience.

## Features

### Core Features
- **One-click random song selection** from your favorites
- **Keyboard shortcut support** (default: "=" key, fully customizable)
- **Smart UI integration** - Seamlessly adds a "Random" button to Songsterr's toolbar
- **Debug mode** for troubleshooting

### Performance & UX (v1.3+)
- **⚡ Lightning-fast caching** - Second click within 1 minute is instant (60-second cache)
- **🔄 Loading feedback** - Visual notification while fetching favorites
- **✨ Smooth animations** - Polished UI with slide-down/up transitions
- **📊 Performance boost** - Up to 60x fewer API calls for active users

### Smart Features (v1.4+)
- **🎲 No repeats** - Tracks last 10 songs to avoid playing the same song twice in a row
- **⚡ Force refresh** - Press Shift+key to clear cache and history instantly
- **🧹 Manual cache control** - Clear cache & history button in options panel
- **🔍 Dynamic detection** - MutationObserver ensures button appears even on SPA navigation

### User Experience
- **Dismissible notifications** - Color-coded feedback (loading, success, error)
- **Adaptive UI** - Multiple fallback strategies for Songsterr's dynamic layout
- **Settings persistence** - Preferences sync across devices via Chrome sync storage
- **Real-time updates** - Settings changes apply immediately across all tabs

## Installation

### From Chrome Web Store (Recommended)
**Status**: ✅ Submitted on January 6, 2026 - Pending Chrome Web Store review

The extension will be available for one-click installation once approved.

### Manual Installation (Development)
1. Download or clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and navigate to `chrome://extensions`
5. Enable "Developer mode" (toggle in top-right)
6. Click "Load unpacked" and select the `dist` directory
7. The extension icon should appear in your Chrome toolbar

## Usage

1. **Navigate to Songsterr.com** and log in
2. **Add songs to your favorites** (if you haven't already)
3. **Click the Random button** in Songsterr's toolbar, or
4. **Press the keyboard shortcut** (default: "=" key)
5. **Enjoy!** A random song from your favorites will load

### Keyboard Shortcuts
- **`=` (or custom key)**: Play random song (uses cache, avoids recent repeats)
- **`Shift + =`**: Force refresh - clears cache & history, fetches fresh favorites

### First-Time Setup
- Click the extension icon in Chrome toolbar
- Customize keyboard shortcut if desired
- Enable debug mode to see performance logs (optional)

### Performance Tips
- **Cache optimization**: Click Random multiple times within 1 minute to experience instant loading
- **Variety**: Extension automatically avoids repeating the last 10 songs
- **Force refresh**: Use Shift+key when you've added new favorites
- **Manual control**: Use "Clear Cache & History" button in options panel
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

### Build Output
- **Directory**: `dist/`
- **Contents**: All extension files (minified and optimized)
- **Size**: ~50KB total

### Chrome Web Store Submission

1. **Build the extension:**
   ```bash
   npm run build
   ```

2. **Create the ZIP file:**
   ```bash
   cd dist
   zip -r ../RandomFavoritePicker.zip . -x '*.DS_Store'
   cd ..
   ```

3. **Submit to Chrome Web Store:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload `RandomFavoritePicker.zip`
   - Fill in store listing details
   - Submit for review

See [deployment.md](.codeagent/current/deployment.md) for detailed deployment instructions.

## Version History

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
4. Try "Clear Cache & History" button in options panel

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

### Phase 4 (v2.0) - Major Features
- Migrate to TypeScript
- Add filters (artist, difficulty, instrument)
- Statistics dashboard
- Playlist mode (queue multiple random songs)
- Full test coverage

## Links

- **Repository**: https://github.com/AdarBahar/Songsterr-randomPlay
- **Issues**: https://github.com/AdarBahar/Songsterr-randomPlay/issues
- **Songsterr**: https://www.songsterr.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the Songsterr community
- Inspired by the need for spontaneous practice sessions
- Thanks to all contributors and testers

---

**Made with ❤️ for guitarists, bassists, drummers, and musicians everywhere!**
