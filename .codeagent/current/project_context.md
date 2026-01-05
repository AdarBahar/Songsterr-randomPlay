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
5. **Adaptive UI**: Multiple fallback strategies to handle Songsterr's dynamic CSS classes

## Architecture

### Components

- **content.js**: Main content script injected into Songsterr pages
  - Creates and injects the Random button into Songsterr's toolbar
  - Handles keyboard shortcuts
  - Fetches favorites and navigates to random song
  - Manages debug logging

- **background.js**: Service worker for extension lifecycle
  - Handles settings storage/retrieval
  - Broadcasts settings changes to all tabs
  - Manages extension installation events

- **popup.js/popup.html**: Extension popup UI
  - Settings interface for keyboard shortcut customization
  - Debug mode toggle
  - User instructions and links

- **manifest.json**: Extension configuration (Manifest V3)
  - Permissions: storage
  - Content scripts for songsterr.com
  - Web accessible resources for icons

### Build System

- **Webpack**: Bundles and minifies JavaScript files
- **Copy Plugin**: Copies static assets (manifest, HTML, images)
- **Terser**: Minifies JS while preserving console.logs for debug mode
- **Output**: `dist/` directory with production-ready files

## Current State (as of v1.2)

- ✅ Published on Chrome Web Store
- ✅ Fully functional with current Songsterr layout
- ✅ Adaptive UI with multiple fallback selectors
- ✅ Settings persistence via Chrome sync storage
- ✅ Real-time settings updates across tabs

## Recent Changes (Jan 2026)

- **Jan 5, 2026**: Integrated CodeAgent Kit v1.2.0 for better project documentation and AI-assisted development workflows

## Known Constraints

- Requires user to be logged into Songsterr
- Requires user to have songs in favorites list
- UI button placement depends on Songsterr's DOM structure (may break with major Songsterr redesigns)
- Keyboard shortcut always works regardless of UI button visibility

## Links

- **Repository**: https://github.com/AdarBahar/Songsterr-randomPlay
- **Chrome Web Store**: (Extension ID to be added)
- **Songsterr**: https://www.songsterr.com
