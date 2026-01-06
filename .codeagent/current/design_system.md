# Design System

## UI Components

### Loading Notifications (v1.3+)

**File**: `content.js`

#### Notification Types
```javascript
showNotification(message, type, timeout)
```

**Types** (defined in `NOTIFICATION_COLORS` constant, v1.4+):
- `"loading"` - Orange (#FF9800) with hourglass icon ⏳
- `"error"` - Red (#f44336)
- `"success"` - Green (#4CAF50)
- `"info"` - Blue (#2196F3)

#### Styling (constants-based, v1.4+)
```css
position: fixed
top: NOTIFICATION_TOP_PX (20px)
right: NOTIFICATION_RIGHT_PX (20px)
padding: 12px 20px
border-radius: 4px
box-shadow: 0 2px 8px rgba(0,0,0,0.3)
z-index: NOTIFICATION_Z_INDEX (10000)
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
font-size: 14px
max-width: NOTIFICATION_MAX_WIDTH_PX (300px)
```

#### Behavior
- **Auto-dismiss**: After timeout (if > 0)
- **Manual dismiss**: Call `notification.dismiss()`
- **Animations**: Slide-in from right, slide-out to right
- **Lifecycle**: Created → Shown → Dismissed → Removed from DOM

#### Usage Pattern
```javascript
const notification = showNotification("Loading...", "loading", 0);
try {
  await doWork();
} finally {
  notification.dismiss();  // Always cleanup
}
```

---

### Extension Popup

**File**: `popup.html`

#### Color Palette
```css
/* Dark theme (matches Chrome extension style) */
--background: #202124
--surface: #303134
--border: #5f6368
--border-accent: #8ab4f8
--text-primary: #e0e0e0
--text-secondary: #9aa0a6
--accent: #8ab4f8
--accent-hover: #aecbfa
--button-bg: #5f6368
--button-hover: #7e8183
--code-bg: #3c4043
```

#### Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Heading (h1)**: 18px, color: #8ab4f8
- **Body**: 14px, line-height: 1.4, color: #e0e0e0
- **Footer**: 12px, color: #9aa0a6
- **Code/Key Display**: monospace, color: #e8eaed

#### Layout
- **Popup Width**: 320px
- **Padding**: 16px
- **Border**: 4px solid #8ab4f8
- **Border Radius**: 4px (buttons), 3px (small elements)

#### Buttons
```css
/* Primary Button (Options) */
background: #8ab4f8
color: #202124
padding: 8px 12px
border-radius: 4px
font-weight: 500

/* Secondary Button (Change Key, Clear Cache) */
background: #5f6368
color: #e8eaed
padding: 4px 8px
border-radius: 3px
font-size: 12px

/* Clear Cache Button (v1.4+) */
width: 100%
margin-top: 8px
padding: 6px 12px
/* Success state: background: #4CAF50 */
```

#### Interactive States
- **Hover**: Lighter background color
- **Active**: No specific active state
- **Focus**: Browser default (blue outline)

---

## Songsterr Integration UI

### Random Button

**File**: `content.js`

#### Strategy 1: Clone Existing Button
- Clone existing Songsterr toolbar button
- Preserves exact styling and structure
- Replace SVG content with random icon
- Update text to "Random"

#### Strategy 2: Fallback Button
```html
<a id="random-icon" href="#" title="Play Random Song (Shortcut: =)">
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; min-height: 60px;">
    <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
      <img src="[random-48.png]" alt="Random" width="32" height="32" style="display: block; opacity: 0.8; transition: opacity 0.2s;">
    </div>
    <div style="font-size: 12px; margin-top: 4px; text-align: center; opacity: 0.9;">Random</div>
  </div>
</a>
```

#### Icon
- **File**: `images/random-48.png`
- **Size**: 48x48px (displayed at 32x32 or 40x40)
- **Format**: PNG with transparency
- **Style**: Simple, recognizable random/shuffle icon
- **Opacity**: 0.8 default, 1.0 on hover

#### Hover Effect
```javascript
mouseenter: img.style.opacity = '1'
mouseleave: img.style.opacity = '0.8'
```

---

## Icons & Assets

### Extension Icons
- `icon16.png` - 16x16px (toolbar, small)
- `icon48.png` - 48x48px (extension management)
- `icon128.png` - 128x128px (Chrome Web Store)

### Content Icons
- `random-48.png` - 48x48px (injected button)
- `random.png` - Original/backup icon

### Icon Style
- Simple, flat design
- Recognizable at small sizes
- Consistent with Chrome extension aesthetic
- Transparent background

---

## Responsive Design

### Popup
- Fixed width (320px)
- Vertical scrolling if content exceeds viewport
- No mobile/tablet considerations (Chrome extensions desktop-only)

### Songsterr Button
- Adapts to Songsterr's toolbar layout
- Flexible sizing (40x40 or 32x32 icon)
- Maintains aspect ratio
- Works with different toolbar heights

---

## Accessibility

### Current State
- ⚠️ Limited accessibility features
- Basic `title` attributes for tooltips
- No ARIA labels
- No keyboard navigation (except shortcut)
- No screen reader support

### Potential Improvements
- Add ARIA labels to buttons
- Add `role` attributes
- Improve keyboard navigation
- Add focus indicators
- Add screen reader announcements

---

## Animation & Transitions

### Popup (v1.3+)
- **Options Panel**: Smooth slide-down/up animation
  - `transition: max-height 0.3s ease-out, opacity 0.3s ease-out, padding 0.3s ease-out`
  - Collapsed: `max-height: 0`, `opacity: 0`, `padding: 0`
  - Expanded: `max-height: 200px`, `opacity: 1`, `padding: 12px`
  - Class-based state: `.options-panel.open`
  - Duration: 0.3 seconds
  - Easing: ease-out (feels natural)

### Songsterr Button
- **Hover**: `opacity` transition (0.2s)
- **Click**: No animation
- **Injection**: Instant (no fade-in)

### Loading Notifications (v1.3+)
- **Slide-in**: From right (400px) to position (0)
  - Animation: `slideInRight 0.3s ease-out`
  - Opacity: 0 → 1
- **Slide-out**: From position (0) to right (400px)
  - Animation: `slideOutRight 0.3s ease-out`
  - Opacity: 1 → 0
- **Timing**: 0.3s for both in/out
- **Trigger**: Auto on timeout or manual via `dismiss()`

### CSS Keyframes (v1.3+)
```css
@keyframes slideInRight {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(400px); opacity: 0; }
}
```

### Future Enhancements
- ✅ Smooth options panel expand/collapse (implemented v1.3)
- ✅ Loading indicator while fetching favorites (implemented v1.3)
- Button fade-in on injection
- Success/error feedback animations

---

## Layout Patterns

### Popup Structure
```
┌─────────────────────────────┐
│ Header (h1)                 │
├─────────────────────────────┤
│ Content (instructions)      │
├─────────────────────────────┤
│ Options Button              │
├─────────────────────────────┤
│ Options Panel (collapsible) │
│ - Shortcut key setting      │
│ - Debug mode toggle         │
├─────────────────────────────┤
│ Footer (copyright, links)   │
└─────────────────────────────┘
```

### Songsterr Button Placement
```
Songsterr Toolbar:
[Logo] [Random] [Favorites] [Search] [Profile] ...
       ^^^^^^^^
       Injected here
```

Fallback positions:
1. Empty div next to logo
2. Right after logo
3. Beginning of toolbar
4. End of toolbar

---

## Theming

### Current Theme
- **Dark mode only** (matches Chrome extension style)
- No light mode
- No theme switching

### Songsterr Integration
- **Adaptive**: Matches Songsterr's current theme
- Clones existing button styling
- Fallback uses neutral colors

### Future Enhancements
- Light mode for popup
- Theme detection (system preference)
- Custom theme options

---

## Spacing & Sizing

### Popup
- **Outer padding**: 16px
- **Section spacing**: 12-16px
- **Element spacing**: 8px
- **Text line-height**: 1.4

### Buttons
- **Padding**: 8px 12px (primary), 4px 8px (secondary)
- **Margin**: 12px bottom (primary), 8px (rows)
- **Border radius**: 4px (primary), 3px (secondary)

### Songsterr Button
- **Icon size**: 32-40px
- **Padding**: 8px
- **Min height**: 60px (fallback)
- **Text margin**: 4px top

---

## Typography Scale

### Popup
- **H1**: 18px (heading)
- **Body**: 14px (content, buttons)
- **Small**: 12px (footer, secondary buttons)
- **Code**: 14px monospace (key display)

### Songsterr Button
- **Label**: 12px (fallback only)
- **Icon**: Visual only (no text in cloned version)

---

## Color Usage Guidelines

### Popup
- **Background**: Dark (#202124) for main container
- **Surface**: Slightly lighter (#303134) for panels
- **Accent**: Blue (#8ab4f8) for primary actions and branding
- **Text**: Light gray (#e0e0e0) for readability on dark
- **Borders**: Subtle gray (#5f6368) for separation

### Songsterr Button
- **Inherit**: Use Songsterr's colors when cloning
- **Fallback**: Neutral with subtle opacity
- **Hover**: Increase opacity for feedback

---

## Component States

### Buttons
- **Default**: Normal appearance
- **Hover**: Lighter background or increased opacity
- **Active/Pressed**: No specific state
- **Disabled**: Not applicable (no disabled states)
- **Loading**: Not implemented (could add spinner)

### Inputs
- **Checkbox**: Chrome default with accent color (#8ab4f8)
- **Key Capture**: "Press any key..." text + `.listening` class

### Panels (v1.3+)
- **Collapsed**: `max-height: 0`, `opacity: 0`, `padding: 0`
- **Expanded**: `max-height: 200px`, `opacity: 1`, `padding: 12px`
- **Transition**: Smooth 0.3s ease-out animation
- **State management**: CSS class `.open` toggles state

---

## Design Principles

### Simplicity
- Minimal UI (one-click operation)
- Clear instructions
- No unnecessary features

### Consistency
- Match Chrome extension conventions
- Adapt to Songsterr's design
- Consistent spacing and sizing

### Accessibility
- High contrast text
- Clear labels
- Keyboard shortcut support

### Performance
- Lightweight (no heavy animations)
- Fast injection
- Minimal DOM manipulation

---

## Future Design Improvements

### Popup
- Add light mode
- Improve accessibility (ARIA, keyboard nav)
- ✅ Add animations (smooth transitions) - implemented v1.3
- ✅ Better visual feedback (success/error states) - loading notifications v1.3
- Settings validation feedback

### Songsterr Button
- Fade-in animation on injection
- ✅ Loading indicator while fetching - implemented v1.3
- Success animation on navigation
- Better error handling UI
- Tooltip improvements

### Notifications (v1.3+)
- ✅ Dismissible notifications - implemented
- ✅ Color-coded by type - implemented
- ✅ Smooth animations - implemented
- Add notification queue (multiple notifications)
- Add notification actions (buttons)
- Add notification icons (beyond hourglass)

### Overall
- Design system documentation
- Component library
- Style guide
- Figma/Sketch designs
- User testing and feedback
