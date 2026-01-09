# Coffee Calc

A simple, intuitive calculator for coffee brewing ratios with recipe steps functionality and built-in brewing timer.

## Features

### Core Calculator
- **Water to Coffee Ratio Calculator**: Calculate any of the three values (water, coffee, or ratio) when you know the other two
- **Ratio Range**: 1:1 to 100:1
- **Default Ratio**: 18:1 (standard pour-over coffee ratio)
- **Smart Calculation Logic**: 
  - The last 2 fields you update determine which third value gets calculated
  - Example workflow:
    1. Start with default ratio (18:1) and enter water amount → Coffee is calculated
    2. Then update coffee → Ratio is recalculated
    3. Then update ratio → Water is recalculated
  - Calculated fields are marked with a green LED dot indicator (●) to show they were automatically computed

### User Interface
- **Clean, Minimal Design**: Modern interface with iOS-inspired styling
- **Light/Dark Theme Support**: 
  - Toggle between themes via the switch in the header
  - Theme preference saved to localStorage
  - Automatically respects system theme preference on first visit
- **Editable Display Fields**: 
  - Click any field to edit (water, coffee, ratio, grind size, temperature, notes)
  - Fields display values in a clean, readable format
  - Press Enter or click away to save changes

### Calculator Fields
- **Water** (grams): Enter total water amount
- **Coffee** (grams): Enter coffee grounds amount  
- **Ratio** (water:coffee): Select from dropdown (default: 18:1)
- **Grind Size** (µm): Enter grind size in micrometers (default: 650)
- **Water Temperature** (°F): Enter brewing temperature (default: 200°F)
- **Additional Notes**: Free-form text field for recipe notes

### Recipe Steps
- **Add Multiple Steps**: Build complex multi-step recipes
- **Step Components**:
  - Water amount per step (grams)
  - Step description (e.g., "Bloom", "First pour", "Final pour")
  - Timer duration (MM:SS format with separate minute and second inputs)
- **Timer Controls** (only visible when steps are added):
  - Start/Pause button to control timer
  - Previous/Next step navigation buttons
  - Reset timer button to restart from the beginning
  - Visual step indicator showing current step (e.g., "Step 2 of 4")
  - Current timer display showing remaining time for active step
- **Step Management**:
  - Remove individual steps with the × button
  - Steps are automatically added to the timer when created

### Recipe Sharing & URL Persistence
- **Automatic URL Updates**: 
  - The browser URL automatically updates with every field edit (no page refresh)
  - All calculator values, metadata, and recipe steps are encoded in the URL
  - Share the current URL to share your complete recipe
  - URL updates are debounced (300ms) for optimal performance
- **Share Button**: 
  - Share recipes via Web Share API (native sharing on mobile/desktop)
  - Falls back to clipboard copy with formatted markdown
  - Includes recipe details, steps with timings, and a shareable URL
- **Load from URL**: 
  - Paste a shared URL to instantly load all recipe data
  - Automatically restores all fields, steps, and timer configuration

### Reset Functionality
- **Reset Button**: Located in the header (↻ icon)
- Clears all inputs and reloads the page to a fresh state
- Removes all URL parameters

### Precision & Display
- **Water**: Rounded to whole grams
- **Coffee**: Precise to 0.1 grams (one decimal place)
- **Ratio**: Displayed as whole numbers (e.g., 18:1)
- **Grind Size**: Measured in micrometers (µm)
- **Water Temperature**: Fahrenheit (°F)
- **Time**: Minutes and seconds (MM:SS format)

## Usage Guide

### Basic Calculation
1. The calculator starts with a default ratio of 18:1
2. Click on the Water or Coffee field to enter a value
3. The missing value will automatically calculate and display with a green dot indicator
4. As you edit different fields, the calculation logic adapts based on the last 2 fields you updated

### Building a Recipe
1. Start by setting your water and coffee amounts (or let the calculator compute one)
2. Set your grind size and water temperature preferences
3. Click the "+" button to add recipe steps
4. For each step:
   - Enter the water amount for that pour
   - Add a descriptive label (e.g., "Bloom for 30s")
   - Set the timer duration in minutes and seconds
5. Timer controls will appear once you add your first step

### Using the Timer
1. Once steps are added, use the timer controls at the bottom
2. Click Play (▶) to start the timer for the current step
3. The timer counts down and automatically advances to the next step when complete
4. Use Previous (⏮) and Next (⏭) buttons to navigate between steps
5. Click Reset (↻) to restart from step 1
6. Pause at any time to adjust or check your progress

### Sharing Recipes
- **Via URL**: Simply copy and share the current browser URL - it contains all your recipe data
- **Via Share Button**: Click the share icon (📤) to use your device's native sharing or copy to clipboard
- **Loading Recipes**: Paste a shared URL or click a recipe link to instantly load all settings

### Theme Customization
- Toggle the theme switch in the header to switch between light and dark modes
- Your preference is automatically saved for future visits

## Technical Details

### File Structure
- `index.html`: Main HTML structure and layout
- `styles.css`: Complete styling including theme variables, responsive design, and animations
- `main.js`: All application logic including calculator, timer, URL management, and sharing

### Dependencies
- **LZ-String**: Used for URL compression (loaded via CDN)
- **Font Awesome**: Icons library (loaded via CDN)

### Browser Support
- Modern browsers with ES6+ support
- Web Share API support for native sharing (gracefully falls back to clipboard)
- Local Storage API for theme persistence
- History API for URL updates without page refresh

### Calculation Algorithm
The calculator uses a smart tracking system:
- Tracks the last 2 fields that were manually updated by the user
- Calculates the third field that wasn't in the last 2 updates
- Handles initial state where only the default ratio is set
- Visual indicator (green dot) shows which field was calculated vs. manually entered

## Keyboard Shortcuts
- **Enter**: Save and close an editable field
- **Click field**: Edit the field value
- **Click away (blur)**: Save changes and trigger calculations

---

*Last updated: January 2025*
