# Coffee Calculator

A simple, intuitive calculator for coffee brewing ratios with recipe steps functionality.

## Features

### Core Functionality
- Water to coffee ratio calculator
- Ratio range from 1:1 to 100:1
- Default ratio set to 16:1 (standard pour-over coffee ratio)
- Automatic calculation of the third value based on any two inputs

### User Interface
- Clean, minimal interface with three main inputs:
  - Water (in grams)
  - Coffee (in grams)
  - Ratio (water:coffee)
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
- Ability to remove individual steps
- Optional: steps can be added after basic ratio calculation

### Smart Calculation Logic
- Tracks the last two modified values to determine what to calculate
- Always calculates based on the most recently updated values
- Initial state starts with 16:1 ratio as one of the values
- Example flow:
  1. Start with default 16:1 ratio
  2. Enter water amount → Calculates coffee
  3. Change ratio → Recalculates coffee (since water was last manual entry)
  4. Update coffee → Calculates water (since ratio was last manual entry)

### Precision
- Water measurements rounded to whole grams
- Coffee measurements precise to 0.1 grams
- Ratios displayed as whole numbers (e.g., 16:1)

## Usage

1. The calculator starts with a default ratio of 16:1
2. Enter either water or coffee amount
3. The third value will automatically calculate
4. Adjust any value to automatically recalculate based on the last two modified inputs
5. Optionally add recipe steps with specific water amounts and timings

## File Structure
- `index.html`: Main HTML structure
- `styles.css`: All styling rules
- `main.js`: Calculator and recipe step logic

---
Last updated: 2025-02-24