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

## Developer Setup & Compilation

This project uses **TypeScript**, which is JavaScript with type annotations. If you're familiar with JavaScript, TypeScript will feel familiar—it's just JavaScript with extra features that help catch errors before runtime.

### Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) - Used to install dependencies

You can check if you have these installed by running in your terminal:
```bash
node --version
npm --version
```

### Understanding TypeScript vs JavaScript

- **`main.ts`** - This is the TypeScript source file you edit
- **`main.js`** - This is the compiled JavaScript file that runs in the browser
- TypeScript adds types (like `string`, `number`, `boolean`) to help catch errors
- The browser can't run TypeScript directly, so it must be compiled to JavaScript first

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd coffee-calc
   ```

2. **Install dependencies** (this installs TypeScript and other development tools):
   ```bash
   npm install
   ```
   
   This reads `package.json` and installs TypeScript in the `node_modules` folder.

### Building the Project

After making changes to `main.ts`, you need to compile it to JavaScript:

**One-time build**:
```bash
npm run build
```

This compiles `main.ts` → `main.js`, which the browser can run.

**Watch mode** (recommended for development):
```bash
npm run watch
```

This automatically recompiles whenever you save changes to `main.ts`. Leave this running in a terminal while you develop.

**Type checking only** (check for errors without compiling):
```bash
npm run type-check
```

### Development Workflow

1. **Edit `main.ts`** - Make your changes in the TypeScript file
2. **Build** - Run `npm run build` or use `npm run watch` for auto-rebuild
3. **Test** - Open `index.html` in your browser to see your changes
4. **Repeat** - Make changes, build, test, repeat!

### Understanding the TypeScript Files

- **`main.ts`** - Your main source code (edit this file)
- **`tsconfig.json`** - TypeScript configuration (defines how TypeScript compiles)
- **`package.json`** - Project metadata and build scripts
- **`lz-string.d.ts`** - Type definitions for the LZ-String library (tells TypeScript what types this library uses)

### Common TypeScript Concepts You'll See

**Type annotations** (adding types to variables):
```typescript
// JavaScript (no types)
let name = "Coffee";

// TypeScript (with types)
let name: string = "Coffee";
let count: number = 5;
let isReady: boolean = true;
```

**Interfaces** (defining the shape of objects):
```typescript
// Defines what properties a recipe step should have
interface RecipeStep {
  duration: number;
  description: string;
  water?: string;  // The ? means this property is optional
}
```

**Type assertions** (telling TypeScript you know the type):
```typescript
// TypeScript doesn't know what getElementById returns
const input = document.getElementById("water") as HTMLInputElement;
// The "as HTMLInputElement" tells TypeScript it's an input element
```

**Union types** (a value can be one of several types):
```typescript
// CalculatorField can only be "water", "coffee", or "ratio"
type CalculatorField = "water" | "coffee" | "ratio";
```

### Troubleshooting

**"Cannot find module 'typescript'" error**:
- Run `npm install` to install dependencies

**"main.js is outdated" or changes not showing**:
- Run `npm run build` to recompile
- Make sure you're editing `main.ts`, not `main.js` directly

**Type errors when building**:
- TypeScript found something that might cause a bug
- Read the error message - it usually tells you exactly what's wrong
- Common issues:
  - Using a variable that might be `null` or `undefined`
  - Passing the wrong type to a function
  - Missing a required property on an object

**Browser shows old code**:
- Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows/Linux)
- Make sure `main.js` was actually updated (check the file timestamp)

### Quick Reference

| Command | What it does |
|---------|--------------|
| `npm install` | Install dependencies (do this first) |
| `npm run build` | Compile TypeScript to JavaScript (one time) |
| `npm run watch` | Auto-compile on file changes (use while developing) |
| `npm run type-check` | Check for errors without compiling |

### Tips for JavaScript Developers

- **You can use JavaScript syntax** - All valid JavaScript is valid TypeScript
- **Types are optional** - TypeScript can infer types automatically in many cases
- **Start simple** - Add types gradually as you learn
- **Read the errors** - TypeScript errors usually have helpful messages
- **Use your IDE** - Most editors (VS Code, WebStorm, etc.) show TypeScript errors as you type

## Technical Details

### File Structure
- `index.html`: Main HTML structure and layout
- `styles.css`: Complete styling including theme variables, responsive design, and animations
- `main.ts`: TypeScript source file (edit this)
- `main.js`: Compiled JavaScript file (generated from `main.ts`, runs in browser)
- `tsconfig.json`: TypeScript compiler configuration
- `package.json`: Project metadata and npm scripts
- `lz-string.d.ts`: Type definitions for LZ-String library

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
