# Icon Files

This project includes SVG icons for favicon and Apple touch icon.

## Files Created

- **`favicon.svg`** - Modern favicon (works in all modern browsers)
- **`apple-touch-icon.svg`** - Apple touch icon for iOS devices (180x180)

## Current Implementation

The HTML includes:
```html
<link rel="icon" type="image/svg+xml" href="favicon.svg" />
<link rel="apple-touch-icon" href="apple-touch-icon.svg" />
```

## Optional: PNG Conversion for Maximum Compatibility

While SVG icons work in modern browsers and iOS 11+, you may want to create PNG versions for:
- Older iOS devices (pre-iOS 11)
- Better compatibility with some browsers
- Traditional favicon.ico format

### Converting to PNG

You can convert the SVG files to PNG using:

**Option 1: Online Tools**
- Use [CloudConvert](https://cloudconvert.com/svg-to-png) or similar
- Convert `favicon.svg` to `favicon.png` (32x32 or 16x16)
- Convert `apple-touch-icon.svg` to `apple-touch-icon.png` (180x180)

**Option 2: Command Line (ImageMagick)**
```bash
# Install ImageMagick (if not installed)
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Convert favicon
convert -background none -resize 32x32 favicon.svg favicon.png

# Convert Apple touch icon
convert -background none -resize 180x180 apple-touch-icon.svg apple-touch-icon.png
```

**Option 3: Node.js Script**
```bash
npm install --save-dev sharp
```

Then create a simple script to convert:
```javascript
const sharp = require('sharp');

sharp('favicon.svg')
  .resize(32, 32)
  .png()
  .toFile('favicon.png');

sharp('apple-touch-icon.svg')
  .resize(180, 180)
  .png()
  .toFile('apple-touch-icon.png');
```

### Updating HTML for PNG

If you create PNG versions, update `index.html`:
```html
<link rel="icon" type="image/png" href="favicon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
```

## Icon Design

The icons feature:
- A coffee cup with handle
- Coffee liquid inside
- Steam lines above
- Brown/coffee-colored palette
- Simple, recognizable design that scales well

## Testing

To test icons:
1. **Favicon**: Check browser tab - should show coffee cup icon
2. **Apple Touch Icon**: 
   - On iOS: Add to home screen, check the icon
   - On macOS Safari: View page source, check if icon loads
3. **Desktop**: Check bookmarks and browser tabs
