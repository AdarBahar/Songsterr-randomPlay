# Testing Guide for v1.2.1

## Build Status
✅ Build completed successfully
- Location: `dist/` folder
- Files: background.js, content.js, popup.js, popup.html, manifest.json, images/

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

## Test Checklist

### ✅ Test 1: Keyboard Shortcut in Input Fields
**What to test**: Shortcut should NOT trigger when typing in input fields

**Steps**:
1. Go to https://www.songsterr.com
2. Click on the search box (top of page)
3. Type the "=" key (or your configured shortcut)
4. **Expected**: Search box should show "=" character, page should NOT navigate
5. Try in other input fields on the page

**Pass criteria**: Shortcut only works when NOT focused on input/textarea/contentEditable

---

### ✅ Test 2: Error Notifications - Not Logged In
**What to test**: User sees notification when not logged in

**Steps**:
1. Log out of Songsterr (if logged in)
2. Go to any Songsterr page
3. Click the Random button or press the shortcut key
4. **Expected**: Red notification appears saying "Please log in to Songsterr to use this feature"
5. Notification should slide in from right and auto-dismiss after 3 seconds

**Pass criteria**: Clear error message with smooth animation

---

### ✅ Test 3: Error Notifications - No Favorites
**What to test**: User sees notification when they have no favorites

**Steps**:
1. Log in to Songsterr
2. Make sure you have NO favorites (remove all if needed)
3. Click the Random button or press shortcut
4. **Expected**: Red notification saying "No favorites found. Add some songs to your favorites first!"

**Pass criteria**: Helpful message guiding user to add favorites

---

### ✅ Test 4: Dynamic Tooltip
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

### ✅ Test 5: Modifier Keys Don't Trigger
**What to test**: Shortcut doesn't trigger with Ctrl/Alt/Meta modifiers

**Steps**:
1. On Songsterr.com, press Ctrl+= (or Cmd+= on Mac)
2. **Expected**: Browser zoom or other default action, NOT random song
3. Try Alt+= and Meta+=
4. **Expected**: No random song navigation

**Pass criteria**: Only plain key press triggers the shortcut

---

### ✅ Test 6: Console Errors
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

### ✅ Test 7: Happy Path - Random Song Works
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

