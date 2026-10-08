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

### Songsterr Layout History (keep updated)
- **Until Oct 2026**: top bar `nav#tablist` with a `topbarCenter` group of `itemWrapper` divs
- **Since Oct 2026 (v1.6.1)**: floating bottom bar, still `nav#tablist` (class `floatWide`; a `bottomBarNarrow` variant exists for small viewports, untested). Children: `a.item` (first), two `bottomBarCenter` groups, `bottomBarRight`. Items are `div.itemWrapper > a.item#menu-* > div.container.icon > svg(22x20) > use` + `div.text`. The selected tab has `aria-active="true"` and an `itemActive` class
- Injection strategy 1 looks for `[class*="topbarCenter"], [class*="bottomBarCenter"]`, clones an *inactive* `itemWrapper`, strips any `*Active*` class, and sizes the icon's `foreignObject` to the SVG's width/height attributes. Cloning the active item used to give the button the selected highlight, and a fixed 40px icon overflowed the 22x20 slot

### Why Multiple Fallback Selectors + MutationObserver? (v1.4+)
- Songsterr uses dynamically generated CSS class names (e.g., `Gl54yj`, `Fbh5d4`)
- Class names may change with Songsterr updates or A/B tests
- Songsterr is a SPA - toolbar may load after initial page load
- **Static approach**: 20+ fallback selectors tried on page load
- **Dynamic approach**: MutationObserver watches for toolbar appearance
- Observer keeps running after injection (debounced) so the button is restored if an SPA re-render drops it; it only disconnects if no toolbar is found within 30s
- Keyboard shortcut always works as ultimate fallback

---

## Development Patterns

### Constants-Based Configuration (v1.4+)
**Pattern**: Extract all magic numbers to named constants

**Implementation**:
```javascript
// At top of file
const CACHE_TTL_MS = 60000;
const NOTIFICATION_DURATION_MS = 3000;
const MAX_SONG_HISTORY = 10;
// ... etc
```

**Benefits**:
- Single source of truth for configuration
- Easy to adjust values without hunting through code
- Self-documenting (constant names explain purpose)
- Easier to test different values
- Better code readability

**Convention**:
- Use SCREAMING_SNAKE_CASE for constants
- Group related constants together
- Add units to names (MS for milliseconds, PX for pixels)
- Document purpose with inline comments

### Song History Tracking (v1.4+)
**Pattern**: Circular buffer with max size limit

**Implementation**:
```javascript
let songHistory = [];  // Stores last N song URLs

const addToSongHistory = (url) => {
  songHistory.push(url);
  if (songHistory.length > MAX_SONG_HISTORY) {
    songHistory.shift();  // Remove oldest
  }
};

const selectRandomSong = (favorites) => {
  // Filter out songs in history
  const available = favorites.filter(s => !songHistory.includes(s.href));
  // Use filtered list, or all if history is full
  const pool = available.length > 0 ? available : favorites;
  return pool[Math.floor(Math.random() * pool.length)];
};
```

**Benefits**:
- No immediate repeats (better variety)
- Automatic size management (no memory leaks)
- Graceful fallback when all songs are in history
- Simple O(n) filtering

**Gotchas**:
- History is per-tab (not shared across tabs)
- History is persisted in `sessionStorage` (`randomSong:songHistory`). Every random play is a full page navigation that reloads the content script, so in-memory-only history was wiped on each play and never filtered anything (fixed Oct 2026)
- History stores `songId`s (not URLs, as in the sketch above)
- If favorites < MAX_SONG_HISTORY, some repeats are inevitable
- Debug logs show filtering statistics

### Caching Strategy (v1.3+)
**Pattern**: Cache with TTL (Time To Live), mirrored to `sessionStorage` (`randomSong:favoritesCache`) so it survives the page navigation each play triggers

**Implementation**:
```javascript
const favoritesCache = {
  data: null,        // Cached favorites array
  timestamp: 0,      // When cache was created
  ttl: 60000        // Cache lifetime (60 seconds)
};
```

**Cache Logic**:
1. Check if cache exists and is fresh: `Date.now() - timestamp < ttl`
2. If fresh: Return cached data (instant, <10ms)
3. If stale/missing: Fetch from API, update cache, return data

**Benefits**:
- Reduces API calls by up to 60x for active users
- Improves perceived performance (instant on cache hit)
- Simple implementation, no external dependencies
- Automatic expiration (no manual invalidation needed)

**Gotchas**:
- Cache is per-tab (not shared across tabs)
- Cache clears on page reload
- 60-second TTL balances freshness vs performance
- Debug logs show cache age for troubleshooting

### Loading State Pattern (v1.3+)
**Pattern**: Dismissible notification with lifecycle management

**Implementation**:
```javascript
const notification = showNotification("Loading...", "loading", 0);
try {
  // Do async work
} finally {
  notification.dismiss();  // Always dismiss, even on error
}
```

**Key Features**:
- Returns object with `dismiss()` method
- Timeout of 0 = manual dismiss only
- Smooth slide-in/out animations (CSS)
- Color-coded by type (loading=orange, error=red, success=green)
- Single dismiss point using `finally` block

**Benefits**:
- Immediate visual feedback
- No orphaned notifications (finally ensures cleanup)
- Consistent UX across all async operations
- Easy to extend with new notification types

### Notification Stacking Pattern (v1.4.1+)
**Pattern**: Vertical stack with dynamic positioning

**Implementation**:
```javascript
let activeNotifications = [];  // Array of notification objects

const showNotification = (message, type, duration) => {
  // Calculate top position based on existing notifications
  let topPosition = NOTIFICATION_TOP_PX;
  activeNotifications.forEach(notif => {
    const rect = notif.element.getBoundingClientRect();
    topPosition = Math.max(topPosition, rect.bottom + NOTIFICATION_GAP_PX);
  });

  // Create notification at calculated position
  notification.style.top = `${topPosition}px`;
  notification.style.transition = 'top 0.3s ease-out';

  // Add to array
  activeNotifications.push(notificationObj);

  // On dismiss, update positions of remaining notifications
  const updateNotificationPositions = () => {
    let currentTop = NOTIFICATION_TOP_PX;
    activeNotifications.forEach(notif => {
      notif.element.style.top = `${currentTop}px`;
      currentTop += notif.element.offsetHeight + NOTIFICATION_GAP_PX;
    });
  };
};
```

**Benefits**:
- Multiple notifications visible simultaneously
- Each notification has full display time (readable)
- Smooth vertical stacking (top to bottom)
- Smooth slide-up when notifications dismiss
- No overlap or visual glitches

**Gotchas**:
- Must remove from array when dismissed
- Must update positions of remaining notifications
- CSS transition needed for smooth repositioning
- Calculate position based on actual element height (getBoundingClientRect)

**Use Case**: Shift+click shows two notifications (blue + orange), both visible and readable

### MutationObserver Pattern (v1.4+, persistent since Oct 2026)
**Pattern**: Watch for DOM changes to inject UI dynamically, and keep it injected

**Implementation**:
```javascript
const setupToolbarObserver = (hasInjected = false) => {
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (document.getElementById('random-icon')) return;  // still there
      const toolbar = findToolbar();
      if (toolbar && injectRandomButton(toolbar)) hasInjected = true;
    }, OBSERVER_DEBOUNCE_MS);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Disconnects only if nothing was ever injected within OBSERVER_TIMEOUT_MS
  return observer;
};
```

**Benefits**:
- Handles SPAs where content loads dynamically
- Restores the button when Songsterr re-renders its toolbar
- Works with Songsterr's client-side routing

**Gotchas**:
- Always started from `init()`, whether or not the first injection succeeded
- Debounced (200ms) and the steady-state check is a single `getElementById`, so running for the page lifetime is cheap
- Observe entire body with subtree:true for deep changes

### Button Creation Strategy
1. **First try**: Clone existing toolbar button (best styling match)
   - Preserves Songsterr's exact styling and structure
   - Replace SVG content with random icon
   - Update text to "Random"

2. **Fallback**: Create button with adaptive styling
   - Detect and copy classes from existing nav items
   - Use flexible CSS that adapts to different layouts
   - Add hover effects for better UX

3. **Injection** (v1.4+): Modular approach
   - `findToolbar()` - Try all selectors, return first match
   - `injectRandomButton(toolbar)` - Inject button, check duplicates
   - `setupToolbarObserver()` - Watch for toolbar if not found
   - Separation of concerns for easier testing

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
- **Cache debugging** (v1.3+): Log cache hits/misses and age
  - "Fetching fresh favorites from API..." = cache miss
  - "Using cached favorites, age: X seconds" = cache hit
  - Helps diagnose performance issues

### Code Documentation (v1.3+)
**Pattern**: JSDoc comments for all functions

**Format**:
```javascript
/**
 * Brief description of what function does
 * @param {Type} paramName - Description
 * @returns {Type} Description
 * @async (if applicable)
 */
```

**Benefits**:
- Better IDE autocomplete and type hints
- Easier onboarding for new developers
- Self-documenting code
- Helps catch type errors early

**Convention**: Document all functions, even small ones

---

## Gotchas & Lessons Learned

### Songsterr API
- Favorites endpoint: `https://www.songsterr.com/api/favorites` (JSON)
- Requires `credentials: 'same-origin'` for authentication; returns 401 when logged out
- Each item: `songId, artist, title, hasPlayer, isJunk, addedAt, lastViewedAt`, etc.
- Build a tab URL from `songId`: `/a/wsa/{slug}-tab-s{songId}` (slug is canonicalized server-side, so it need not be exact; no track suffix = default track)
- Legacy `/a/wa/favorites` now 302-redirects to the `/favorites` SPA and is no longer used

### Chrome Extension Permissions
- Only need `storage` permission (minimal permissions = better security)
- No need for `activeTab` or `tabs` permission
- Content scripts automatically have access to page DOM
- Web accessible resources needed for images used in content scripts

### Settings Storage Patterns (v1.6, Oct 2026)
- **Write only what changed**: `saveSettings()` sets just the fields passed in. Re-reading and rewriting every key let overlapping saves restore stale values.
- **Custom sliders have their own keys**: `customNewnessBoost` / `customLeastPlayedBoost` hold the user's slider positions; `newnessBoost` / `leastPlayedBoost` are the *active* boosts for whichever mode is selected. Presets overwrite the active boosts only.
- **Never write from a long-lived in-memory copy**: preset clicks don't write the custom keys; clicking Custom re-reads them from storage first (another settings tab may have changed them).
- **Guard async reads with a selection counter**: the Custom click's storage read is async, so its callback checks `weightSelectionId` and does nothing if a newer selection was made meanwhile.
- **Legacy migration**: settings from before v1.6 with Custom selected have no custom keys; they are copied from the active boosts once, at settings-page load.
- **Known gap**: open settings pages aren't kept in sync; moving one slider in a stale tab saves both sliders.
- **Display labels are duplicated** in `content.js` and `popup.js` (`WEIGHT_MODE_LABELS`, `INSTRUMENT_LABELS`) because the scripts share no module; keep them in step with the button text in `options.html`.

### Cross-Browser Notes (Firefox, Oct 2026)
- Firefox MV3 has no background service worker: `scripts/build-firefox.js` rewrites `background` to `{ scripts: ['background.js'] }` (event page)
- `browser_specific_settings.gecko.id` is required for `storage.sync` and is permanent once published on AMO
- The `chrome.*` namespace (with promises) works in Firefox MV3, so the source files are shared unchanged
- Content scripts run at `document_idle`, which can be after `load` has fired; `init()` checks `document.readyState` instead of relying on the event
- No `innerHTML` in `content.js` (AMO's linter flags it); the button is built with DOM APIs
- The Firefox package is unminified, so AMO needs no source-code upload
- Shift + shortcut: `e.key` is the shifted character, so matching uses a US-layout symbol map plus case-insensitive letters

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
- Use SCREAMING_SNAKE_CASE for constants (v1.4+)
- Add units to constant names: `_MS`, `_PX`, `_MAX`, etc.

### Error Handling
- Always wrap async operations in try-catch
- Log errors in debug mode
- Fail gracefully (keyboard shortcut works even if UI fails)
- Don't throw errors that break the extension
- **Use finally for cleanup** (v1.3+): Ensures notifications dismiss even on error
  ```javascript
  try {
    // risky operation
  } catch (error) {
    // handle error
  } finally {
    // cleanup (dismiss notifications, etc.)
  }
  ```

### Refactoring Patterns (v1.3+)
**Early Returns**: Reduce nesting, improve readability
```javascript
// Before
if (condition) {
  // lots of code
} else {
  return error;
}

// After (early return)
if (!condition) return error;
// lots of code (less indented)
```

**Single Responsibility**: Each function does one thing
- `fetchFavorites()` - only fetches and caches
- `playRandomSong()` - orchestrates the flow
- `showNotification()` - only handles notifications

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
- [ ] **Test caching** (v1.3+): Click twice within 1 minute, verify second is instant
- [ ] **Test loading notification** (v1.3+): Verify appears and dismisses
- [ ] **Test animations** (v1.3+): Options panel slides smoothly
- [ ] **Test cache expiration** (v1.3+): Wait 61 seconds, verify cache refreshes
- [ ] **Test song history** (v1.4+): Play 5 songs, verify no immediate repeats
- [ ] **Test Shift+key** (v1.4+): Verify force refresh notification and cache clear
- [ ] **Test clear cache button** (v1.4+): Click button, verify visual feedback
- [ ] **Test MutationObserver** (v1.4+): Navigate within Songsterr (SPA), verify button appears

---

## Deployment Process

1. **Update version**: Bump version in `manifest.json` and `package.json`
2. **Build**: Run `npm run build`
3. **Test**: Load unpacked extension from `dist/` and test all features
4. **Package**: Run `npm run zip` to create `extension.zip`
5. **Submit**: Upload to Chrome Web Store Developer Dashboard
6. **Tag**: Create git tag for version (e.g., `v1.2.0`)
7. **Push**: Push commits and tags to GitHub

### Chrome Web Store Submission Checklist (v1.4.1)
- [x] Extension name updated in manifest
- [x] Description optimized for store listing
- [x] Screenshots prepared (3 images in screenshots/chrome-web-store/)
- [x] Privacy policy finalized and accessible
- [x] Popup UI polished (no scrollbar, clean design)
- [x] All features tested and working
- [x] Build successful: `npm run build && npm run zip`
- [x] Submitted on Jan 6, 2026

### Chrome Popup Height Constraint (Learned in v1.4.1)
**Issue**: Chrome extensions have a **maximum popup height of ~600px**
- Forcing height > 600px causes unwanted scrollbar
- Solution: Set `max-height: 600px` on container with `overflow-y: auto`
- Let Chrome size popup naturally, don't force fixed height
- Reduce spacing/padding to fit content within limit
- Enable scrolling only when content exceeds limit (e.g., settings panel open)

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
- ✅ MutationObserver for more robust UI injection (implemented in v1.4)
- ✅ Song history to avoid repeats (implemented in v1.4)
- ✅ Modifier keys for power users (implemented in v1.4)
- Filters for random selection (artist, difficulty, instrument)
- Play queue of random songs
- Statistics and analytics
- Export/import settings

### Performance
- ✅ Cache favorites list temporarily (implemented in v1.3)
- ✅ Constants-based configuration (implemented in v1.4)
- Optimize selector matching algorithm
- Reduce bundle size further
- Consider IndexedDB for longer-term caching
