# Security

## Permissions

### Requested Permissions
```json
"permissions": [
    "storage"
]
```

### Why These Permissions?

**storage**:
- Store user settings (keyboard shortcut, debug mode)
- Use Chrome sync storage for cross-device settings
- No sensitive data stored

### Permissions NOT Requested
- ❌ `activeTab` - Not needed (content script has page access)
- ❌ `tabs` - Not needed (no tab manipulation)
- ❌ `webRequest` - Not needed (no network interception)
- ❌ `cookies` - Not needed (use Songsterr's own cookies)
- ❌ `history` - Not needed
- ❌ `bookmarks` - Not needed

**Principle**: Request minimal permissions necessary for functionality.

---

## Content Security Policy

### Manifest V3 CSP
```json
"content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'none'"
}
```

### What This Means
- **script-src 'self'**: Only load scripts from extension package (no external scripts)
- **object-src 'none'**: No plugins (Flash, Java, etc.)
- Prevents XSS attacks
- Prevents loading malicious external code

---

## Data Privacy

### Data Collection
**We collect ZERO user data.**

### What We Store (Locally Only)
- Keyboard shortcut preference (Chrome sync storage)
- Debug mode preference (Chrome sync storage)

### What We DON'T Store
- ❌ Songsterr login credentials
- ❌ Favorites list
- ❌ Browsing history
- ❌ Personal information
- ❌ Analytics or telemetry
- ❌ Usage statistics

### Data Transmission
- **No external servers**: Extension doesn't send data anywhere
- **No analytics**: No Google Analytics, no tracking
- **No third-party services**: No external API calls (except Songsterr's own API)

### Songsterr API Access
- Uses Songsterr's public favorites endpoint
- Authenticated via user's existing Songsterr session cookies
- No credentials stored or transmitted by extension
- Same-origin policy enforced

---

## Authentication & Authorization

### No Custom Auth
- Extension doesn't implement authentication
- Relies on user's existing Songsterr login session
- Uses browser's cookie handling (same-origin)

### Session Handling
- Songsterr session cookies managed by browser
- Extension uses `credentials: 'same-origin'` for API calls
- No session tokens stored by extension

---

## Code Security

### Input Validation

**Keyboard Shortcut**:
```javascript
// Limit key length
if (pressedKey.length > 20) {
    // Reject
}

// Filter modifier keys
const modifierKeys = ['Shift', 'Control', 'Alt', 'Meta', ...];
if (modifierKeys.includes(e.key)) {
    return; // Ignore
}
```

**Settings Storage**:
```javascript
const sanitizedSettings = {
    debug: Boolean(settings.debug),
    shortcutKey: settings.shortcutKey.slice(0, 20)
};
```

### XSS Prevention
- No `eval()` or `Function()` constructor
- No `innerHTML` with user input
- Use `textContent` for text insertion
- DOMParser for HTML parsing (Songsterr API response)

### Injection Prevention
- Content script doesn't execute arbitrary code
- No dynamic script loading
- All code bundled and minified at build time

---

## Third-Party Dependencies

### Production Dependencies
**None** - Pure vanilla JavaScript

### Development Dependencies
- `webpack` - Build tool (not in production bundle)
- `terser-webpack-plugin` - Minifier (not in production bundle)
- `copy-webpack-plugin` - Asset copier (not in production bundle)
- `clean-css-cli` - CSS minifier (not in production bundle)
- `bestzip` - Zip creator (not in production bundle)

### Dependency Security
- Run `npm audit` regularly
- Update dependencies quarterly
- Only dev dependencies (not shipped to users)
- No runtime dependencies = no supply chain attacks

---

## Network Security

### HTTPS Only
- Songsterr uses HTTPS
- All API calls over HTTPS
- No mixed content issues

### API Endpoints
- **Favorites**: `https://www.songsterr.com/a/wa/favorites`
- **Same-origin**: Extension only calls Songsterr's own API
- **No external APIs**: No third-party services

### CORS
- Not applicable (same-origin requests)
- Content script runs in page context
- Uses Songsterr's own cookies

---

## Manifest V3 Security Benefits

### Service Worker (vs Background Page)
- Isolated execution context
- No persistent background page
- Reduced memory footprint
- Better sandboxing

### Host Permissions
```json
"content_scripts": [{
    "matches": ["*://*.songsterr.com/*"]
}]
```
- Only runs on Songsterr domains
- No access to other websites
- User can see which sites extension accesses

---

## Threat Model

### Threats We Protect Against

1. **XSS Attacks**
   - CSP prevents external script loading
   - No `innerHTML` with user input
   - Input validation and sanitization

2. **Data Theft**
   - No data collection
   - No external transmission
   - Minimal permissions

3. **Session Hijacking**
   - No session token storage
   - Relies on browser's cookie security
   - Same-origin policy

4. **Supply Chain Attacks**
   - No production dependencies
   - Dev dependencies not shipped
   - Code review before release

### Threats Outside Our Control

1. **Songsterr Security**
   - If Songsterr is compromised, extension could be affected
   - Extension trusts Songsterr's API responses
   - Mitigation: Only parse HTML, don't execute scripts

2. **Browser Vulnerabilities**
   - Extension relies on Chrome's security model
   - Mitigation: Follow Chrome Extension best practices

3. **User's Machine**
   - If user's machine is compromised, extension could be affected
   - Mitigation: Minimal permissions, no sensitive data

---

## Privacy Policy

### Required for Chrome Web Store
See `privacy-policy.html` for user-facing privacy policy.

### Key Points
- No data collection
- No third-party sharing
- No analytics or tracking
- Settings stored locally in Chrome sync

---

## Security Best Practices Followed

✅ Minimal permissions
✅ Content Security Policy
✅ Input validation and sanitization
✅ No external dependencies in production
✅ HTTPS only
✅ No data collection
✅ No external API calls
✅ Code review before release
✅ Regular dependency updates
✅ No `eval()` or dynamic code execution
✅ Same-origin policy enforcement

---

## Incident Response

### If Security Issue Found

1. **Assess Severity**
   - Critical: Immediate action required
   - High: Fix within 24 hours
   - Medium: Fix within 1 week
   - Low: Fix in next release

2. **Immediate Actions**
   - Document the issue
   - Determine scope and impact
   - Develop fix

3. **Fix & Deploy**
   - Implement fix
   - Test thoroughly
   - Bump version (patch)
   - Submit to Chrome Web Store (expedited review if critical)

4. **Communication**
   - Update Chrome Web Store description
   - Post on GitHub issues
   - Respond to user reports

5. **Post-Mortem**
   - Document what happened
   - Update security practices
   - Add tests to prevent recurrence

---

## Security Audit Checklist

Before each release:
- [ ] Review all permissions (still minimal?)
- [ ] Check for new dependencies
- [ ] Run `npm audit`
- [ ] Review code changes for security issues
- [ ] Test input validation
- [ ] Verify CSP is still enforced
- [ ] Check for hardcoded secrets (should be none)
- [ ] Verify HTTPS for all network calls
- [ ] Test with malicious inputs
- [ ] Review Chrome Extension security guidelines

---

## Reporting Security Issues

### How to Report
- **Email**: adar.bahar@gmail.com
- **GitHub**: Create private security advisory
- **Do NOT**: Post publicly until fixed

### What to Include
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time
- Acknowledge within 24 hours
- Fix critical issues within 48 hours
- Fix high-priority issues within 1 week

---

## Future Security Enhancements

### Potential Improvements
- Add automated security scanning in CI/CD
- Implement Subresource Integrity (SRI) if using CDN
- Add security headers (if hosting web resources)
- Regular penetration testing
- Bug bounty program (if extension grows)

### Not Needed Currently
- Extension is simple and low-risk
- No sensitive data handling
- No backend or database
- Minimal attack surface
