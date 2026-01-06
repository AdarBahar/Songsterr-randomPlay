# Deployment

## Development Setup

### Prerequisites
- Node.js (v14+ recommended)
- npm (comes with Node.js)
- Chrome browser
- Git

### Initial Setup
```bash
# Clone repository
git clone https://github.com/AdarBahar/Songsterr-randomPlay.git
cd Songsterr-randomPlay

# Install dependencies
npm install

# Build extension
npm run build
```

### Development Workflow
```bash
# Build for development
npm run build

# The built extension will be in dist/ directory
```

### Loading Extension in Chrome (Development)
1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist/` directory from the project
5. Extension should now appear in Chrome toolbar

### Making Changes
1. Edit source files (`content.js`, `background.js`, `popup.js`, etc.)
2. Run `npm run build` to rebuild
3. Go to `chrome://extensions` and click the refresh icon on the extension
4. Reload any Songsterr tabs to see changes

---

## Build Scripts

### Available Commands

```bash
# Build for production (minified)
npm run build

# Minify CSS (currently unused)
npm run minify-css

# Create extension.zip for distribution
npm run zip

# Full compile (build + minify + zip)
npm run compile
```

### Build Output
- **Directory**: `dist/`
- **Contents**:
  - `background.js` (minified service worker)
  - `content.js` (minified content script)
  - `popup.js` (minified popup script)
  - `popup.html` (popup UI)
  - `manifest.json` (minified, comments removed)
  - `images/` (all icon files)

---

## Production Deployment

### Pre-Release Checklist
- [ ] Update version in `manifest.json`
- [ ] Update version in `package.json`
- [ ] Test all features in development mode
- [ ] Test with fresh install (delete and reload extension)
- [ ] Test keyboard shortcut
- [ ] Test settings persistence
- [ ] Test on multiple Songsterr pages
- [ ] Test with/without favorites
- [ ] Test while logged in/out
- [ ] Check console for errors (debug mode on)
- [ ] Review git diff for unintended changes
- [ ] Update README.md if needed
- [ ] **Test caching** (v1.3+): Click twice within 1 minute, verify instant second click
- [ ] **Test loading notification** (v1.3+): Verify appears and dismisses properly
- [ ] **Test animations** (v1.3+): Options panel slides smoothly
- [ ] **Test cache expiration** (v1.3+): Wait 61 seconds, verify fresh fetch
- [ ] **Test song history** (v1.4+): Play 5+ songs, verify no immediate repeats
- [ ] **Test Shift+key** (v1.4+): Verify force refresh clears cache & history
- [ ] **Test clear cache button** (v1.4+): Click in popup, verify visual feedback
- [ ] **Test MutationObserver** (v1.4+): Navigate within Songsterr, verify button appears
- [ ] Run comprehensive test suite (see TESTING_GUIDE.md)

### Build for Production
```bash
# Clean build
rm -rf dist/
npm run build

# Verify build output
ls -la dist/

# Create distribution package
npm run zip
# Creates extension.zip in project root
```

### Chrome Web Store Submission

1. **Prepare Package**
   ```bash
   npm run build
   cd dist
   zip -r ../RandomFavoritePicker.zip . -x '*.DS_Store'
   cd ..
   ```

2. **Upload to Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Click on the extension (or "New Item" for first release)
   - Upload `RandomFavoritePicker.zip`
   - Fill in store listing details:
     - Name: Random Favorite Picker
     - Description: Play a random song from your favorites list on Songsterr
     - Category: Productivity
     - Language: English
   - Upload screenshots and promotional images
   - Set pricing (Free)
   - Submit for review

3. **Review Process**
   - Google reviews extension (usually 1-3 days)
   - May request changes or clarifications
   - Once approved, extension goes live

4. **Post-Release**
   - Create git tag: `git tag v1.2.0`
   - Push tag: `git push origin v1.2.0`
   - Create GitHub release with changelog
   - Monitor user reviews and feedback

---

## Version Management

### Versioning Scheme
Follow semantic versioning: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes or major rewrites
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, minor improvements

### Current Version: 1.4.0
- Major: 1 (initial release)
- Minor: 4 (code quality & features)
- Patch: 0

### Updating Version
Update in **both** files:
1. `manifest.json`: `"version": "1.2"`
2. `package.json`: `"version": "1.2.0"`

Note: Chrome Web Store uses format `X.Y` while npm uses `X.Y.Z`

---

## Environment Variables

### None Required
This extension has no environment variables or configuration files.

### Settings Storage
All user settings stored in Chrome sync storage:
- `shortcutKey`: Keyboard shortcut (default: "=")
- `debug`: Debug mode enabled/disabled (default: false)

---

## Rollback Procedure

### If Issues Found After Release

1. **Immediate Action**
   - Don't panic - users can disable extension
   - Identify the issue and severity

2. **Quick Fix** (if possible)
   ```bash
   # Fix the issue
   # Update version (e.g., 1.2.0 -> 1.2.1)
   npm run build
   npm run zip
   # Submit updated version to Chrome Web Store
   ```

3. **Rollback** (if fix takes time)
   ```bash
   # Checkout previous version
   git checkout v1.1.0

   # Update version to indicate rollback (e.g., 1.2.1)
   # Build and submit
   npm run build
   npm run zip
   ```

4. **Communication**
   - Update Chrome Web Store description with known issues
   - Respond to user reviews
   - Post update on GitHub issues

---

## Monitoring & Maintenance

### What to Monitor
- Chrome Web Store reviews and ratings
- GitHub issues
- Songsterr layout changes (check periodically)
- Chrome Extension API updates
- Manifest V3 changes

### Regular Maintenance
- **Monthly**: Check Songsterr for layout changes
- **Quarterly**: Update dependencies (`npm update`)
- **Yearly**: Review Chrome Extension best practices

### Debugging User Issues
1. Ask user to enable debug mode
2. Ask user to check console for `[Debug]` messages
3. **Check cache logs** (v1.3+): Look for "Using cached favorites" or "Fetching fresh"
4. Ask for Chrome version and OS
5. Ask for screenshot of Songsterr page
6. Test on same Songsterr page if possible
7. **Performance issues**: Check if caching is working (should see cache age in logs)

---

## CI/CD (Future)

### Potential Setup
- GitHub Actions for automated builds
- Automated testing on PR
- Automated version bumping
- Automated Chrome Web Store publishing (via API)

### Not Implemented Yet
Currently manual build and deployment process.

---

## Backup & Recovery

### Source Code
- Primary: GitHub repository
- Backup: Local development machine
- Published versions: Chrome Web Store

### No Data Loss Risk
- Extension stores no user data (only settings in Chrome sync)
- No backend or database
- Settings sync automatically via Chrome

---

## Security Considerations

### Build Security
- No secrets or API keys in code
- No external dependencies in production
- All code is client-side JavaScript
- Minimal permissions requested

### Distribution Security
- Only distribute via Chrome Web Store (official channel)
- Don't distribute .zip files directly to users
- Chrome Web Store provides malware scanning

### Update Security
- Chrome auto-updates extensions
- Users always get latest version
- No manual update process needed
