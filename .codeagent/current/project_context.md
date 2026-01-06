# Project Context

## What is this project?

**Random Favorite Picker for Songsterr** is a Chrome browser extension that enhances the Songsterr.com experience by adding a random song picker functionality. It allows users to play a random song from their favorites list with a single click or keyboard shortcut.

## Core Purpose

Enable Songsterr users to discover and practice songs from their favorites list randomly, making practice sessions more spontaneous and engaging.

## Tech Stack

- **Platform**: Chrome Extension (Manifest V3)
- **Languages**: JavaScript (ES6+), HTML5, CSS3
- **Build Tools**: Webpack 5, Terser (minification), Clean-CSS
- **APIs Used**:
  - Chrome Extension APIs (storage, runtime, tabs)
  - Songsterr.com favorites endpoint (`/a/wa/favorites`)

## Key Features

1. **Random Song Selection**: Fetches user's favorites from Songsterr and navigates to a random song
2. **UI Integration**: Adds a "Random" button to Songsterr's toolbar that matches the site's styling
3. **Keyboard Shortcut**: Customizable keyboard shortcut (default: "=" key)
4. **Settings Panel**:
   - Change keyboard shortcut
   - Toggle debug mode for troubleshooting
   - Clear cache & history button (v1.4+)
5. **Adaptive UI**: Multiple fallback strategies to handle Songsterr's dynamic CSS classes
6. **Loading States** (v1.3+): Visual feedback with loading notification while fetching favorites
7. **Performance Caching** (v1.3+): 1-minute cache for favorites to reduce API calls and improve responsiveness
8. **Smooth Animations** (v1.3+): Polished UI with slide-down/up animations for options panel
9. **Song History Tracking** (v1.4+): Avoids repeating last 10 songs for better variety
10. **Modifier Key Support** (v1.4+): Shift+key for force refresh (clears cache & history)
11. **Dynamic Toolbar Detection** (v1.4+): MutationObserver for robust UI injection in SPAs

## Architecture

### Components

- **content.js**: Main content script injected into Songsterr pages
  - Creates and injects the Random button into Songsterr's toolbar
  - Handles keyboard shortcuts (normal + Shift modifier)
  - Fetches favorites and navigates to random song
  - Manages debug logging
  - Implements favorites caching (60-second TTL)
  - Shows loading notifications with dismissible UI
  - Tracks song history to avoid repeats (last 10 songs)
  - Smart song selection filtering
  - MutationObserver for dynamic toolbar detection
  - Constants-based configuration
  - Comprehensive JSDoc documentation

- **background.js**: Service worker for extension lifecycle
  - Handles settings storage/retrieval
  - Broadcasts settings changes to all tabs
  - Manages extension installation events

- **popup.js/popup.html**: Extension popup UI
  - Settings interface for keyboard shortcut customization
  - Debug mode toggle
  - Clear cache & history button
  - User instructions and links
  - Smooth CSS animations for options panel (slide-down/up)

- **manifest.json**: Extension configuration (Manifest V3)
  - Permissions: storage
  - Content scripts for songsterr.com
  - Web accessible resources for icons

### Build System

- **Webpack**: Bundles and minifies JavaScript files
- **Copy Plugin**: Copies static assets (manifest, HTML, images)
- **Terser**: Minifies JS while preserving console.logs for debug mode
- **Output**: `dist/` directory with production-ready files

## Current State (as of v1.4.1)

- ✅ **Submitted to Chrome Web Store** (Jan 6, 2026) - Pending review
- ✅ Fully functional with current Songsterr layout
- ✅ Adaptive UI with MutationObserver + fallback selectors
- ✅ Settings persistence via Chrome sync storage
- ✅ Real-time settings updates across tabs
- ✅ Performance optimized with favorites caching (60s TTL)
- ✅ Enhanced UX with loading states and smooth animations
- ✅ Song history tracking for variety (no repeats in last 10)
- ✅ Power user features (Shift+key, manual cache clear)
- ✅ Constants-based configuration for maintainability
- ✅ Comprehensive code documentation with JSDoc
- ✅ Professional popup UI (no scrollbar, clean design)
- ✅ Chrome Web Store assets ready (screenshots, privacy policy)

## Recent Changes (Jan 2026)

### Jan 6, 2026 - Chrome Web Store Submission (v1.4.1)
**Commits**: 29e03c2, 1b7a17b, cb8191a, 46db36c, 7a2cc6b, 6b8718e, ac5d6c2
**Status**: ✅ Submitted to Chrome Web Store

**Popup UI Refinements**:
- Removed guitar icon from header for cleaner, professional look
- Fixed scrollbar issues (Chrome's ~600px max popup height)
- Restored original font sizes for better readability
- Optimized spacing to fit within Chrome's height limit
- Enabled scrollable container for settings panel

**Store Listing**:
- Updated extension name: "Random Song - Songsterr Extension"
- Updated description for Chrome Web Store
- Screenshots prepared (3 images in screenshots/chrome-web-store/)
- Privacy policy finalized
- Extension successfully submitted on Jan 6, 2026

**Technical**:
- Set `max-height: 600px` on container with `overflow-y: auto`
- No scrollbar when settings closed, smooth scrolling when open
- All content properly sized and readable

### Jan 6, 2026 - Bug Fixes & UI Improvements (v1.4.1 - Pre-Submission)
**Commits**: 1c99cc4, d859740, 24987cf, 5ade1b3, e5ad509, 906956d

**Bug Fixes**:
- Fixed duplicate event listener causing ReferenceError in popup
- Fixed button placement (now appears next to Songsterr logo)
- Fixed notification stacking (vertical stack with smooth transitions)
- Fixed notification disappearing too quickly on Shift+click

**UI/UX Improvements**:
- **Popup Redesign**: Complete modern redesign with gradient background
  - Card-based layout with better visual hierarchy
  - Keyboard shortcuts displayed as visual kbd elements
  - Reorganized layout: Reminder → Shortcuts → Settings → Features → Footer
  - Positive reminder (blue) instead of warning (red)
  - Compact footer (minimal height, always visible)
  - Increased width: 320px → 380px for better readability
- **Notification Stacking**: Multiple notifications now stack vertically
  - Each notification visible long enough to read
  - Smooth slide-up transitions when notifications dismiss
  - No overlap or visual glitches
- **Visual Confirmation**: Key change shows green checkmark feedback

**Technical**:
- Improved notification lifecycle management
- Better scope handling for timeout IDs
- Updated popup.js to handle new element IDs
- Maintained all existing functionality

### Jan 6, 2026 - Phase 3: Code Quality & Features (v1.4.0)
**Commit**: 6429d76

**Code Quality**:
- Extracted all magic numbers to named constants (CACHE_TTL_MS, NOTIFICATION_*, etc.)
- Better code organization with constants section
- Improved maintainability and readability

**New Features**:
- **Song History Tracking**: Tracks last 10 played songs to avoid immediate repeats
  - Smart selection filters out recent history
  - Falls back to all songs if history is full
- **Modifier Key Support**: Shift+key for force refresh (clears cache & history)
- **Cache Clear Button**: Manual control in options panel
- **MutationObserver**: Dynamic toolbar detection for SPAs
  - More robust than static selectors
  - Handles delayed content loading
  - Auto-disconnects after injection

**Functions Added**:
- `addToSongHistory()`, `isInRecentHistory()`, `selectRandomSong()`
- `findToolbar()`, `injectRandomButton()`, `setupToolbarObserver()`

### Jan 6, 2026 - Phase 2: Performance & UX Improvements (v1.3.0)
**Commits**: 8aa287e, 05ae0dc, 6c45338

**Performance Enhancements**:
- Implemented favorites caching with 60-second TTL
- Reduces API calls by up to 60x for active users
- Second click within 1 minute is instant (<10ms vs ~300ms)

**UX Improvements**:
- Added loading notification with hourglass icon while fetching favorites
- Dismissible notification system with smooth slide-in/out animations
- Options panel now has smooth slide-down/up animations (0.3s ease-out)

**Code Quality**:
- Added comprehensive JSDoc comments to all functions
- Refactored `playRandomSong()` with early returns and single dismiss point
- Consolidated duplicate code patterns
- Better error handling flow

**Testing**:
- Created comprehensive testing guide (TESTING_GUIDE.md)
- Added Phase 2 test summary (PHASE2_TEST_SUMMARY.md)
- 11 test scenarios covering all features

### Jan 6, 2026 - Phase 1: Critical Bug Fixes (v1.2.1)
**Commit**: e9d9dc7

**Bug Fixes**:
- Fixed keyboard shortcut triggering in input fields
- Fixed error notifications not appearing
- Fixed tooltip not updating dynamically
- Fixed modifier keys triggering shortcut

**Improvements**:
- Better error messages with context
- Improved notification system
- Enhanced debug logging

### Jan 5, 2026 - Documentation
**Commit**: ed486e1

- Integrated CodeAgent Kit v1.2.0 for better project documentation and AI-assisted development workflows

## Known Constraints

- Requires user to be logged into Songsterr
- Requires user to have songs in favorites list
- UI button placement depends on Songsterr's DOM structure (may break with major Songsterr redesigns)
- Keyboard shortcut always works regardless of UI button visibility

## Links

- **Repository**: https://github.com/AdarBahar/Songsterr-randomPlay
- **Chrome Web Store**: Pending review (submitted Jan 6, 2026)
- **Songsterr**: https://www.songsterr.com
