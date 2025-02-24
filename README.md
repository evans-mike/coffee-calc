# Coffee Calculator

A simple, intuitive calculator for coffee brewing ratios with recipe steps functionality and brewing timer.

## Features

### Core Functionality
- Water to coffee ratio calculator
- Ratio range from 1:1 to 100:1
- Default ratio set to 16:1 (standard pour-over coffee ratio)
- Automatic calculation of the third value based on any two inputs

### User Interface
- Clean, minimal interface with light/dark theme support
- Core calculator inputs:
  - Water (in grams)
  - Coffee (in grams)
  - Ratio (water:coffee)
- Metadata fields:
  - Grind Size (µm)
  - Water Temperature (°F)
  - Additional Notes
- Mobile-friendly numeric inputs
- Smart calculation behavior:
  - Calculations occur when clicking away from input fields (on blur)
  - No premature calculations while typing
  - Dropdown menu for ratio selection

### Recipe Steps
- Add multiple steps to your coffee recipe
- Each step includes:
  - Water amount (in grams)
  - Step description
  - Time duration (MM:SS format)
- Built-in timer functionality:
  - Start/Pause/Reset timer controls
  - Visual step tracking
  - Step completion indicators
- Ability to remove individual steps
- Optional: steps can be added after basic ratio calculation

### Recipe Sharing
- Share complete recipes with others
- Recipes include:
  - Water/coffee amounts and ratio
  - Grind size and water temperature
  - All recipe steps with timings
  - Additional notes
- Share via:
  - Web Share API (on supported devices)
  - Clipboard fallback with markdown formatting

### Smart Calculation Logic
- Tracks the last two modified values to determine what to calculate
- Always calculates based on the most recently updated values
- Initial state starts with 16:1 ratio as one of the values
- Example flow:
  1. Start with default 16:1 ratio
  2. Enter water amount → Calculates coffee
  3. Change ratio → Recalculates coffee (since water was last manual entry)
  4. Update coffee → Calculates water (since ratio was last manual entry)

### Precision & Measurements
- Water measurements rounded to whole grams
- Coffee measurements precise to 0.1 grams
- Ratios displayed as whole numbers (e.g., 16:1)
- Grind size in micrometers (µm)
- Water temperature in Fahrenheit (°F)

## Usage

1. Set your preferred theme (light/dark)
2. The calculator starts with a default ratio of 16:1
3. Enter either water or coffee amount
4. The third value will automatically calculate
5. Add recipe steps with the "+" button
6. For each step:
   - Enter water amount
   - Add step description
   - Set timer duration
7. Use the timer controls to track your brewing process
8. Share your recipe when complete

## File Structure
- `index.html`: Main HTML structure
- `styles.css`: All styling rules including theme support
- `main.js`: Calculator, timer, and sharing logic

## Browser Support
- Modern browsers with ES6+ support
- Web Share API support for native sharing (falls back to clipboard)
- Local storage for theme preference

---
Last updated: 2025-02-24