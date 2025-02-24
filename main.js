// Get DOM elements
const waterInput = document.getElementById("water");
const coffeeInput = document.getElementById("coffee");
const ratioSelect = document.getElementById("ratio");

// Track the order of updates (ratio starts as most recently updated due to default)
let lastUpdated = ["ratio"];

// Populate ratio options (1:1 to 100:1) with 16:1 as default
function populateRatioOptions() {
  const defaultRatio = 16;

  for (let i = 1; i <= 100; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}:1`;
    if (i === defaultRatio) {
      option.selected = true;
    }
    ratioSelect.appendChild(option);
  }
}

// Call this function when the page loads
populateRatioOptions();

function updateLastTouched(inputType) {
  // Remove the input type if it's already in the array
  lastUpdated = lastUpdated.filter((item) => item !== inputType);
  // Add it to the end (most recent)
  lastUpdated.push(inputType);
  // Keep only the last two updates
  if (lastUpdated.length > 2) {
    lastUpdated.shift();
  }
  calculateBasedOnLastUpdates();
}

function calculateBasedOnLastUpdates() {
  const water = parseFloat(waterInput.value);
  const coffee = parseFloat(coffeeInput.value);
  const ratio = parseInt(ratioSelect.value);

  // Don't calculate until we have at least two values
  if (lastUpdated.length < 2) return;

  // The value to calculate is the one NOT in lastUpdated
  const toCalculate = ["water", "coffee", "ratio"].find(
    (item) => !lastUpdated.includes(item)
  );

  switch (toCalculate) {
    case "water":
      if (!isNaN(coffee) && !isNaN(ratio)) {
        const calculatedWater = coffee * ratio;
        waterInput.value = calculatedWater.toFixed(0);
      }
      break;
    case "coffee":
      if (!isNaN(water) && !isNaN(ratio)) {
        const calculatedCoffee = water / ratio;
        coffeeInput.value = calculatedCoffee.toFixed(1);
      }
      break;
    case "ratio":
      if (!isNaN(water) && !isNaN(coffee)) {
        const calculatedRatio = Math.round(water / coffee);
        if (calculatedRatio >= 1 && calculatedRatio <= 100) {
          ratioSelect.value = calculatedRatio;
        }
      }
      break;
  }
}

// Add event listeners for calculator
waterInput.addEventListener("blur", () => {
  if (waterInput.value !== "") {
    updateLastTouched("water");
  }
});

coffeeInput.addEventListener("blur", () => {
  if (coffeeInput.value !== "") {
    updateLastTouched("coffee");
  }
});

ratioSelect.addEventListener("change", () => {
  if (ratioSelect.value !== "") {
    updateLastTouched("ratio");
  }
});

// Recipe Steps functionality
document.getElementById("add-step").addEventListener("click", addRecipeStep);

function addRecipeStep() {
  const stepsContainer = document.getElementById("recipe-steps");
  const stepElement = document.createElement("div");
  stepElement.className = "recipe-step";

  // Water amount input
  const waterInput = document.createElement("input");
  waterInput.type = "number";
  waterInput.min = "0";
  waterInput.step = "1";
  waterInput.inputMode = "numeric";
  waterInput.pattern = "[0-9]*";
  waterInput.placeholder = "Water (g)";

  // Step description input
  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.placeholder = "Step description";

  // Time input container
  const timeContainer = document.createElement("div");
  timeContainer.className = "time-container";

  // Minutes input
  const minutesInput = document.createElement("input");
  minutesInput.type = "number";
  minutesInput.className = "time-input minutes";
  minutesInput.min = "0";
  minutesInput.max = "59";
  minutesInput.step = "1";
  minutesInput.inputMode = "numeric";
  minutesInput.pattern = "[0-9]*";
  minutesInput.placeholder = "MM";

  // Time separator
  const timeSeparator = document.createElement("span");
  timeSeparator.textContent = ":";
  timeSeparator.className = "time-separator";

  // Seconds input
  const secondsInput = document.createElement("input");
  secondsInput.type = "number";
  secondsInput.className = "time-input seconds";
  secondsInput.min = "0";
  secondsInput.max = "59";
  secondsInput.step = "1";
  secondsInput.inputMode = "numeric";
  secondsInput.pattern = "[0-9]*";
  secondsInput.placeholder = "SS";

  // Add time components to container
  timeContainer.appendChild(minutesInput);
  timeContainer.appendChild(timeSeparator);
  timeContainer.appendChild(secondsInput);

  // Remove button
  const removeButton = document.createElement("button");
  removeButton.className = "remove-step";
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => stepElement.remove());

  // Add all elements to the step
  stepElement.appendChild(waterInput);
  stepElement.appendChild(descriptionInput);
  stepElement.appendChild(timeContainer);
  stepElement.appendChild(removeButton);

  stepsContainer.appendChild(stepElement);
}

// Timer functionality
let timerRunning = false;
let currentStepIndex = 0;
let timerInterval;
let isPaused = false;
let currentTimeLeft = 0;
let currentStepDescription = '';

function getTimeInSeconds(minutes, seconds) {
  return parseInt(minutes || "0") * 60 + parseInt(seconds || "0");
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function startTimers() {
    const startButton = document.getElementById('start-timer');
    const pauseButton = document.getElementById('pause-timer');
    const resetButton = document.getElementById('reset-timer');
    const currentTimerDisplay = document.getElementById('current-timer');
    const steps = document.querySelectorAll('.recipe-step');
    
    if (steps.length === 0) {
        alert('Add at least one step before starting the timer');
        return;
    }
    
    if (timerRunning && !isPaused) {
        return;
    }
    
    if (isPaused) {
        // Resume from paused state
        isPaused = false;
        pauseButton.textContent = 'Pause Timer';
        startButton.disabled = true;
    } else {
        // Start fresh
        timerRunning = true;
        currentStepIndex = 0;
        startButton.disabled = true;
        pauseButton.disabled = false;
        resetButton.disabled = false;
    }
    
    function startNextTimer() {
        if (currentStepIndex >= steps.length) {
            // All timers completed
            timerRunning = false;
            isPaused = false;
            startButton.disabled = false;
            pauseButton.disabled = true;
            resetButton.disabled = true;
            currentTimerDisplay.textContent = 'Complete!';
            return;
        }
        
        // Reset previous step styling if exists
        if (currentStepIndex > 0) {
            steps[currentStepIndex - 1].classList.remove('active');
            steps[currentStepIndex - 1].classList.add('completed');
        }
        
        const currentStep = steps[currentStepIndex];
        currentStep.classList.add('active');
        
        const minutesInput = currentStep.querySelector('.minutes');
        const secondsInput = currentStep.querySelector('.seconds');
        const stepDescription = currentStep.querySelector('input[type="text"]').value;
        
        currentTimeLeft = getTimeInSeconds(
            minutesInput.value || '0',
            secondsInput.value || '0'
        );
        currentStepDescription = stepDescription;
        
        if (currentTimeLeft <= 0) {
            currentStepIndex++;
            startNextTimer();
            return;
        }
        
        currentTimerDisplay.textContent = `${stepDescription}: ${formatTime(currentTimeLeft)}`;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isPaused) {
                currentTimeLeft--;
                currentTimerDisplay.textContent = `${stepDescription}: ${formatTime(currentTimeLeft)}`;
                
                if (currentTimeLeft <= 0) {
                    clearInterval(timerInterval);
                    currentStepIndex++;
                    startNextTimer();
                }
            }
        }, 1000);
    }
    
    startNextTimer();
}

// Add these new functions
function pauseTimer() {
    const pauseButton = document.getElementById('pause-timer');
    const startButton = document.getElementById('start-timer');
    
    if (timerRunning) {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume Timer' : 'Pause Timer';
        startButton.disabled = !isPaused;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    isPaused = false;
    currentStepIndex = 0;
    currentTimeLeft = 0;
    
    const startButton = document.getElementById('start-timer');
    const pauseButton = document.getElementById('pause-timer');
    const resetButton = document.getElementById('reset-timer');
    const currentTimerDisplay = document.getElementById('current-timer');
    const steps = document.querySelectorAll('.recipe-step');
    
    startButton.disabled = false;
    pauseButton.disabled = true;
    resetButton.disabled = true;
    currentTimerDisplay.textContent = '';
    
    // Clear step styling
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
}

// Add event listener for start button
document.getElementById("start-timer").addEventListener("click", startTimers);
document.getElementById('pause-timer').addEventListener('click', pauseTimer);
document.getElementById('reset-timer').addEventListener('click', resetTimer);

// Add these functions after your existing code

// Function to generate markdown for the recipe
function generateRecipeMarkdown() {
    const water = document.getElementById('water-input').value;
    const coffee = document.getElementById('coffee-input').value;
    const ratio = document.getElementById('ratio-select').value;
    const grindSize = document.getElementById('grind-size').value;
    const waterTemp = document.getElementById('water-temp').value;
    const notes = document.getElementById('additional-notes').value;
    const steps = Array.from(document.querySelectorAll('.recipe-step'));

    let markdown = `# Coffee Recipe\n\n`;
    markdown += `## Recipe Details\n`;
    markdown += `- Water: ${water}g\n`;
    markdown += `- Coffee: ${coffee}g\n`;
    markdown += `- Ratio: ${ratio}:1\n`;
    markdown += `- Grind Size: ${grindSize}µm\n`;
    markdown += `- Water Temperature: ${waterTemp}°F\n\n`;

    markdown += `## Steps\n`;
    steps.forEach((step, index) => {
        const water = step.querySelector('input[type="number"]').value;
        const description = step.querySelector('input[type="text"]').value;
        const minutes = step.querySelector('.minutes').value || '0';
        const seconds = step.querySelector('.seconds').value || '0';
        
        markdown += `${index + 1}. Pour ${water}g - ${description} (${minutes}:${seconds.padStart(2, '0')})\n`;
    });

    if (notes.trim()) {
        markdown += `\n## Additional Notes\n${notes}\n`;
    }

    markdown += `\nGenerated with Coffee Calc`;

    return markdown;
}


function shareRecipe() {
    const shareableUrl = buildUrlWithValues();
    const recipeText = generateRecipeMarkdown();
    
    // Add debug logging
    console.log('Web Share API available:', !!navigator.share);
    console.log('Running on secure context:', window.isSecureContext);
    
    // Check if Web Share API is available AND we're in a secure context
    if (navigator.share && window.isSecureContext) {
        console.log('Attempting to use Web Share API...');
        
        // Create share data object
        const shareData = {
            title: 'Coffee Recipe',
            text: recipeText,
            url: shareableUrl
        };
        
        // Log share data for debugging
        console.log('Share data:', shareData);
        
        navigator.share(shareData)
            .then(() => {
                console.log('Successfully shared');
            })
            .catch((error) => {
                console.log('Share failed:', error);
                fallbackToClipboard(shareableUrl, recipeText);
            });
    } else {
        // Log why Web Share API isn't available
        console.log('Web Share API not available:');
        console.log('- navigator.share exists:', !!navigator.share);
        console.log('- secure context:', window.isSecureContext);
        
        fallbackToClipboard(shareableUrl, recipeText);
    }
}

function fallbackToClipboard(url, markdown) {
    const textToCopy = `${markdown}\n\nRecipe URL: ${url}`;
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            console.log('Successfully copied to clipboard');
            alert('Recipe copied to clipboard!');
        })
        .catch(err => {
            console.error('Clipboard error:', err);
            alert('Error copying recipe: ' + err);
        });
}

function buildUrlWithValues() {
    const recipeData = {
        calculator: {
            water: waterInput.value,
            coffee: coffeeInput.value,
            ratio: ratioSelect.value
        },
        metadata: {
            grindSize: document.getElementById('grind-size').value,
            waterTemp: document.getElementById('water-temp').value,
            notes: document.getElementById('additional-notes').value
        },
        steps: Array.from(document.querySelectorAll('.recipe-step')).map(step => ({
            water: step.querySelector('input[type="number"]').value,
            description: step.querySelector('input[type="text"]').value,
            minutes: step.querySelector('.minutes').value,
            seconds: step.querySelector('.seconds').value
        }))
    };

    const jsonString = JSON.stringify(recipeData);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return window.location.origin + window.location.pathname + '?data=' + compressed;
}


function loadSharedRecipe() {
    const urlParams = new URLSearchParams(window.location.search);
    const compressedData = urlParams.get('data');
    
    if (!compressedData) return;
    
    try {
        const jsonString = LZString.decompressFromEncodedURIComponent(compressedData);
        const recipeData = JSON.parse(jsonString);
        
        // Set main calculator values
        if (recipeData.calculator) {
            if (recipeData.calculator.water) waterInput.value = recipeData.calculator.water;
            if (recipeData.calculator.coffee) coffeeInput.value = recipeData.calculator.coffee;
            if (recipeData.calculator.ratio) ratioSelect.value = recipeData.calculator.ratio;
        }
        if (recipeData.metadata) {
            if (recipeData.metadata.grindSize) document.getElementById('grind-size').value = recipeData.metadata.grindSize;
            if (recipeData.metadata.waterTemp) document.getElementById('water-temp').value = recipeData.metadata.waterTemp;
            if (recipeData.metadata.notes) document.getElementById('additional-notes').value = recipeData.metadata.notes;
        }
        
        // Clear existing steps
        document.getElementById('recipe-steps').innerHTML = '';
        
        // Add shared steps
        if (recipeData.steps && Array.isArray(recipeData.steps)) {
            recipeData.steps.forEach(step => {
                addRecipeStep(step);
            });
        }
    } catch (error) {
        console.error('Error loading shared recipe:', error);
        alert('Invalid recipe data in URL');
    }
}




// Modify your existing addRecipeStep function to accept initial values
function addRecipeStep(initialValues = null) {
    const stepsContainer = document.getElementById('recipe-steps');
    const stepElement = document.createElement('div');
    stepElement.className = 'recipe-step';
    
    // Water amount input
    const waterInput = document.createElement('input');
    waterInput.type = 'number';
    waterInput.min = '0';
    waterInput.step = '1';
    waterInput.inputMode = 'numeric';
    waterInput.pattern = '[0-9]*';
    waterInput.placeholder = 'Water (g)';
    if (initialValues) waterInput.value = initialValues.water;
    
    // Step description input
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.placeholder = 'Step description';
    if (initialValues) descriptionInput.value = initialValues.description;
    
    // Time input container
    const timeContainer = document.createElement('div');
    timeContainer.className = 'time-container';
    
    // Minutes input
    const minutesInput = document.createElement('input');
    minutesInput.type = 'number';
    minutesInput.className = 'time-input minutes';
    minutesInput.min = '0';
    minutesInput.max = '59';
    minutesInput.step = '1';
    minutesInput.inputMode = 'numeric';
    minutesInput.pattern = '[0-9]*';
    minutesInput.placeholder = 'MM';
    if (initialValues) minutesInput.value = initialValues.minutes;
    
    // Time separator
    const timeSeparator = document.createElement('span');
    timeSeparator.textContent = ':';
    timeSeparator.className = 'time-separator';
    
    // Seconds input
    const secondsInput = document.createElement('input');
    secondsInput.type = 'number';
    secondsInput.className = 'time-input seconds';
    secondsInput.min = '0';
    secondsInput.max = '59';
    secondsInput.step = '1';
    secondsInput.inputMode = 'numeric';
    secondsInput.pattern = '[0-9]*';
    secondsInput.placeholder = 'SS';
    if (initialValues) secondsInput.value = initialValues.seconds;
    
    // Add time components to container
    timeContainer.appendChild(minutesInput);
    timeContainer.appendChild(timeSeparator);
    timeContainer.appendChild(secondsInput);
    
    // Remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-step';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => stepElement.remove());
    
    // Add all elements to the step
    stepElement.appendChild(waterInput);
    stepElement.appendChild(descriptionInput);
    stepElement.appendChild(timeContainer);
    stepElement.appendChild(removeButton);
    
    stepsContainer.appendChild(stepElement);
}



// Update the reset function
function resetAllInputs() {
    // Clear URL parameters by refreshing to base URL
    window.location.href = window.location.pathname;
}

// Add event listener for reset button
document.getElementById('reset-button').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all inputs?')) {
        resetAllInputs();
    }
});

// Add this to your existing JavaScript

// Theme handling
function initTheme() {
    const toggleSwitch = document.getElementById('theme-toggle');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        toggleSwitch.checked = savedTheme === 'dark';
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleSwitch.checked = true;
    }
    
    // Theme switch handler
    toggleSwitch.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}


window.addEventListener('DOMContentLoaded', () => {
    loadSharedRecipe();
    initTheme();
    
    // Add share button event listener
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareRecipe);
    }
});