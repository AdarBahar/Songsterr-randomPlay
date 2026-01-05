# Memory Log

Durable knowledge, decisions, patterns, "how we do things here", and gotchas.

---

## Architecture Decisions

### Why Manifest V3?
- Manifest V2 is being deprecated by Chrome
- V3 uses service workers instead of background pages (more efficient)
- Future-proof the extension for long-term maintenance

### Why Content Script Injection?
- Direct DOM manipulation needed to inject UI button into Songsterr's toolbar
- Must match Songsterr's styling for seamless integration
- Content scripts run in page context with access to DOM

### Why Multiple Fallback Selectors?
- Songsterr uses dynamically generated CSS class names (e.g., `Gl54yj`, `Fbh5d4`)
- Class names may change with Songsterr updates or A/B tests
- 20+ fallback selectors ensure extension remains functional
- Keyboard shortcut always works as ultimate fallback

---

## Development Patterns

### Button Creation Strategy
1. **First try**: Clone existing toolbar button (best styling match)
   - Preserves Songsterr's exact styling and structure
   - Replace SVG content with random icon
   - Update text to "Random"

2. **Fallback**: Create button with adaptive styling
   - Detect and copy classes from existing nav items
   - Use flexible CSS that adapts to different layouts
   - Add hover effects for better UX

### Settings Management
- Use Chrome sync storage for cross-device settings sync
- Validate and sanitize all user inputs before storage
- Broadcast settings changes to all tabs via background script
- Update UI immediately when settings change

### Debug Logging
- Conditional logging based on debug mode setting
- Helps diagnose issues without cluttering console
- Log key events: button creation, favorites fetch, navigation
- Log available DOM elements when selectors fail

---

## Gotchas & Lessons Learned

### Songsterr API
- Favorites endpoint: `https://www.songsterr.com/a/wa/favorites`
- Requires `credentials: 'same-origin'` for authentication
- Returns HTML (not JSON) - must parse with DOMParser
- Songs have `data-song` attribute on anchor tags

### Chrome Extension Permissions
- Only need `storage` permission (minimal permissions = better security)
- No need for `activeTab` or `tabs` permission
- Content scripts automatically have access to page DOM
- Web accessible resources needed for images used in content scripts

### Build System
- Keep console.logs in production for debug mode (`drop_console: false`)
- Clean dist directory before each build (`clean: true`)
- Copy manifest.json and minify it (remove comments)
- Images must be copied to dist directory

### Settings Persistence
- Chrome sync storage has size limits (100KB total, 8KB per item)
- Limit shortcut key length to 20 characters
- Filter out modifier keys when pressed alone (Shift, Control, Alt, etc.)
- Use `return true` in message listeners for async responses

### UI Injection Timing
- Wait for `window.load` event before injecting button
- Songsterr may load toolbar dynamically
- Multiple insertion strategies increase success rate
- Always set up keyboard shortcut even if UI injection fails

---

## Code Conventions

### File Organization
- `content.js`: All page interaction logic
- `background.js`: Settings storage and message passing
- `popup.js`: Settings UI logic only
- Keep files focused and single-purpose

### Naming
- Use descriptive function names: `createRandomButton`, `playRandomSong`
- Prefix debug logs with `[Debug]`
- Use camelCase for variables and functions
- Use UPPER_CASE for constants (if any)

### Error Handling
- Always wrap async operations in try-catch
- Log errors in debug mode
- Fail gracefully (keyboard shortcut works even if UI fails)
- Don't throw errors that break the extension

---

## Testing Checklist

Before releasing:
- [ ] Test on fresh Songsterr page load
- [ ] Test keyboard shortcut
- [ ] Test UI button click
- [ ] Test settings changes (shortcut key, debug mode)
- [ ] Test with no favorites (should handle gracefully)
- [ ] Test while logged out (should handle gracefully)
- [ ] Test in incognito mode
- [ ] Build and test production bundle
- [ ] Verify all images load correctly
- [ ] Check console for errors (with debug mode on)

---

## Deployment Process

1. **Update version**: Bump version in `manifest.json` and `package.json`
2. **Build**: Run `npm run build`
3. **Test**: Load unpacked extension from `dist/` and test all features
4. **Package**: Run `npm run zip` to create `extension.zip`
5. **Submit**: Upload to Chrome Web Store Developer Dashboard
6. **Tag**: Create git tag for version (e.g., `v1.2.0`)
7. **Push**: Push commits and tags to GitHub

---

## Dependencies

### Production
- None (vanilla JavaScript)

### Development
- `webpack` + `webpack-cli`: Bundling and build
- `terser-webpack-plugin`: JavaScript minification
- `copy-webpack-plugin`: Copy static assets
- `clean-css-cli`: CSS minification (currently unused)
- `bestzip`: Create extension.zip for distribution

### Why These Tools?
- Webpack: Industry standard, great plugin ecosystem
- Terser: Best JS minifier, configurable console.log preservation
- Copy Plugin: Handles manifest transformation and asset copying
- Bestzip: Cross-platform zip creation

---

## Common Issues & Solutions

### Button Not Appearing
1. Check if Songsterr changed their layout (inspect DOM)
2. Enable debug mode to see which selectors are being tried
3. Add new selectors to `topBarSelectors` array if needed
4. Keyboard shortcut still works as fallback

### Settings Not Persisting
1. Check Chrome sync storage quota
2. Verify `storage` permission in manifest
3. Check for errors in background script console
4. Test with `chrome.storage.local` as fallback

### Random Song Not Playing
1. Verify user is logged into Songsterr
2. Check if user has favorites
3. Enable debug mode to see API response
4. Check if Songsterr API endpoint changed

### Build Errors
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` fresh
3. Check Node.js version compatibility
4. Verify all files exist before build

---

## Future Improvements

### Code Quality
- Add TypeScript for better type safety
- Add unit tests for core functions
- Add E2E tests with Puppeteer
- Set up CI/CD pipeline

### Features
- MutationObserver for more robust UI injection
- Filters for random selection (artist, difficulty, instrument)
- Play queue of random songs
- Statistics and analytics
- Export/import settings

### Performance
- Lazy load settings only when needed
- Cache favorites list temporarily
- Optimize selector matching algorithm
- Reduce bundle size further
