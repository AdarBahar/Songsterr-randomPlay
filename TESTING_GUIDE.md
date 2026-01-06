# Testing Guide for v1.3.0

## Build Status
✅ Build completed successfully (Phase 2)
- Location: `dist/` folder
- Files: background.js, content.js, popup.js, popup.html, manifest.json, images/
- Version: 1.3.0
- New Features: Loading states, caching, animations, JSDoc

## Loading the Extension

### Chrome/Edge
1. Open browser and navigate to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. Extension should now appear in your extensions list

### Verify Installation
- Extension icon should appear in toolbar
- Click the icon to see the popup
- Version should show 1.2.1 in manifest

---

## Phase 2 New Features Test Checklist

### ✅ Test 1: Loading Notification
**What to test**: Loading notification appears while fetching favorites

**Steps**:
1. Go to https://www.songsterr.com (logged in with favorites)
2. Click the Random button (or press shortcut)
3. **Expected**: Orange notification appears in top-right saying "Loading favorites... ⏳"
4. **Expected**: Notification dismisses when song loads
5. Try again - notification should appear each time

**Pass criteria**:
- Orange notification with hourglass appears immediately
- Notification dismisses automatically when navigation starts
- Smooth slide-in animation from right

---

### ✅ Test 2: Favorites Caching (Performance)
**What to test**: Second click within 1 minute uses cache (instant)

**Steps**:
1. Go to Songsterr.com (logged in with favorites)
2. Enable debug mode in extension popup
3. Open DevTools Console (F12)
4. Click Random button - note the time it takes
5. **Expected**: Console shows "Fetching fresh favorites from API..."
6. Immediately click Random button again (within 1 minute)
7. **Expected**: Console shows "Using cached favorites, age: X seconds"
8. **Expected**: Second click is noticeably faster (instant)

**Pass criteria**:
- First click fetches from API (slower)
- Second click uses cache (instant, <10ms)
- Debug logs show cache age
- Cache works for 60 seconds

---

### ✅ Test 3: Cache Expiration
**What to test**: Cache expires after 1 minute and refreshes

**Steps**:
1. Enable debug mode
2. Open DevTools Console
3. Click Random button - see "Fetching fresh favorites..."
4. Wait exactly 61 seconds
5. Click Random button again
6. **Expected**: Console shows "Fetching fresh favorites..." (cache expired)

**Pass criteria**: Cache automatically expires and refreshes after 60 seconds

---

### ✅ Test 4: Options Panel Animation
**What to test**: Smooth slide-down/up animation in popup

**Steps**:
1. Click extension icon to open popup
2. Click "Options" button
3. **Expected**: Panel slides down smoothly (not instant)
4. Click "Close Options"
5. **Expected**: Panel slides up smoothly
6. Repeat several times

**Pass criteria**:
- Smooth animation (0.3s duration)
- No jerky movements
- Opacity fades in/out
- Height animates smoothly

---

## Phase 1 Regression Tests

### ✅ Test 5: Keyboard Shortcut in Input Fields
**What to test**: Shortcut should NOT trigger when typing in input fields

**Steps**:
1. Go to https://www.songsterr.com
2. Click on the search box (top of page)
3. Type the "=" key (or your configured shortcut)
4. **Expected**: Search box should show "=" character, page should NOT navigate
5. Try in other input fields on the page

**Pass criteria**: Shortcut only works when NOT focused on input/textarea/contentEditable

---

### ✅ Test 6: Error Notifications - Not Logged In
**What to test**: User sees notification when not logged in

**Steps**:
1. Log out of Songsterr (if logged in)
2. Go to any Songsterr page
3. Click the Random button or press the shortcut key
4. **Expected**: Red notification appears saying "Please log in to Songsterr to use this feature"
5. Notification should slide in from right and auto-dismiss after 3 seconds

**Pass criteria**: Clear error message with smooth animation

---

### ✅ Test 7: Error Notifications - No Favorites
**What to test**: User sees notification when they have no favorites

**Steps**:
1. Log in to Songsterr
2. Make sure you have NO favorites (remove all if needed)
3. Click the Random button or press shortcut
4. **Expected**: Red notification saying "No favorites found. Add some songs to your favorites first!"

**Pass criteria**: Helpful message guiding user to add favorites

---

### ✅ Test 8: Dynamic Tooltip
**What to test**: Button tooltip shows current shortcut and updates dynamically

**Steps**:
1. Go to Songsterr.com (logged in)
2. Hover over the Random button in the toolbar
3. **Expected**: Tooltip shows "Play Random Song (Shortcut: =)"
4. Click extension icon → Options → Change key → Press a different key (e.g., "r")
5. Hover over Random button again
6. **Expected**: Tooltip now shows "Play Random Song (Shortcut: r)"

**Pass criteria**: Tooltip updates without page reload

---

### ✅ Test 9: Modifier Keys Don't Trigger
**What to test**: Shortcut doesn't trigger with Ctrl/Alt/Meta modifiers

**Steps**:
1. On Songsterr.com, press Ctrl+= (or Cmd+= on Mac)
2. **Expected**: Browser zoom or other default action, NOT random song
3. Try Alt+= and Meta+=
4. **Expected**: No random song navigation

**Pass criteria**: Only plain key press triggers the shortcut

---

### ✅ Test 10: Console Errors
**What to test**: No JavaScript errors in console

**Steps**:
1. Open DevTools (F12)
2. Go to Console tab
3. Navigate to Songsterr.com
4. Click Random button
5. Change shortcut key in options
6. **Expected**: No red errors in console (warnings are OK)

**Pass criteria**: Clean console, no errors

---

### ✅ Test 11: Happy Path - Random Song Works
**What to test**: Extension still works correctly for normal use

**Steps**:
1. Log in to Songsterr
2. Make sure you have at least 3 favorites
3. Click the Random button
4. **Expected**: Navigate to a random favorite song
5. Press the shortcut key (=)
6. **Expected**: Navigate to another random favorite

**Pass criteria**: Random navigation works smoothly

---

## Reporting Issues

If any test fails, note:
- Browser version
- Which test failed
- Console errors (if any)
- Screenshots of unexpected behavior

## Next Steps After Testing

If all tests pass:
- [ ] Commit test results
- [ ] Push to GitHub
- [ ] Consider Chrome Web Store submission
- [ ] Move to Phase 2 development

