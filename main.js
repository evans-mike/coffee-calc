// Global state variables
let lastUpdated = ["ratio"]; // Track the order of updates
let timerRunning = false;
let currentStepIndex = 0;
let timerInterval;
let isPaused = false;
let currentTimeLeft = 0;
let currentStepDescription = "";

// Get DOM elements
const waterInput = document.getElementById("water");
const coffeeInput = document.getElementById("coffee");
const ratioSelect = document.getElementById("ratio");

// Populate ratio options (1:1 to 100:1) with 16:1 as default
function populateRatioOptions() {
  const defaultRatio = "16";
  ratioSelect.innerHTML = ""; // Clear existing options

  // Add ratio options from 1:1 to 100:1
  for (let i = 1; i <= 100; i++) {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = `${i}:1`;
    if (i.toString() === defaultRatio) {
      option.selected = true;
    }
    ratioSelect.appendChild(option);
  }
}

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
  const startButton = document.getElementById("start-timer");
  const pauseButton = document.getElementById("pause-timer");
  const resetButton = document.getElementById("reset-timer");
  const currentTimerDisplay = document.getElementById("current-timer");
  const steps = document.querySelectorAll(".recipe-step");

  if (steps.length === 0) {
    alert("Add at least one step before starting the timer");
    return;
  }

  if (timerRunning && !isPaused) {
    return;
  }

  if (isPaused) {
    // Resume from paused state
    isPaused = false;
    pauseButton.textContent = "Pause Timer";
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
      currentTimerDisplay.textContent = "Complete!";
      return;
    }

    // Reset previous step styling if exists
    if (currentStepIndex > 0) {
      steps[currentStepIndex - 1].classList.remove("active");
      steps[currentStepIndex - 1].classList.add("completed");
    }

    const currentStep = steps[currentStepIndex];
    currentStep.classList.add("active");

    const minutesInput = currentStep.querySelector(".minutes");
    const secondsInput = currentStep.querySelector(".seconds");
    const stepDescription =
      currentStep.querySelector('input[type="text"]').value;

    currentTimeLeft = getTimeInSeconds(
      minutesInput.value || "0",
      secondsInput.value || "0"
    );
    currentStepDescription = stepDescription;

    if (currentTimeLeft <= 0) {
      currentStepIndex++;
      startNextTimer();
      return;
    }

    currentTimerDisplay.textContent = `${stepDescription}: ${formatTime(
      currentTimeLeft
    )}`;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isPaused) {
        currentTimeLeft--;
        currentTimerDisplay.textContent = `${stepDescription}: ${formatTime(
          currentTimeLeft
        )}`;

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
  const pauseButton = document.getElementById("pause-timer");
  const startButton = document.getElementById("start-timer");

  if (timerRunning) {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume Timer" : "Pause Timer";
    startButton.disabled = !isPaused;
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  isPaused = false;
  currentStepIndex = 0;
  currentTimeLeft = 0;

  const startButton = document.getElementById("start-timer");
  const pauseButton = document.getElementById("pause-timer");
  const resetButton = document.getElementById("reset-timer");
  const currentTimerDisplay = document.getElementById("current-timer");
  const steps = document.querySelectorAll(".recipe-step");

  startButton.disabled = false;
  pauseButton.disabled = true;
  resetButton.disabled = true;
  currentTimerDisplay.textContent = "";

  // Clear step styling
  steps.forEach((step) => {
    step.classList.remove("active", "completed");
  });
}

// Function to generate markdown for the recipe
function generateRecipeMarkdown() {
  const water = waterInput.value; // Use the global reference
  const coffee = coffeeInput.value; // Use the global reference
  const ratio = ratioSelect.value; // Use the global reference
  const grindSize = document.getElementById("grind-size").value;
  const waterTemp = document.getElementById("water-temp").value;
  const notes = document.getElementById("additional-notes").value;
  const steps = Array.from(document.querySelectorAll(".recipe-step"));

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
    const minutes = step.querySelector(".minutes").value || "0";
    const seconds = step.querySelector(".seconds").value || "0";

    markdown += `${
      index + 1
    }. Pour ${water}g - ${description} (${minutes}:${seconds.padStart(
      2,
      "0"
    )})\n`;
  });

  if (notes.trim()) {
    markdown += `\n## Additional Notes\n${notes}\n`;
  }

  markdown += `\nGenerated with Coffee Calc`;

  return markdown;
}

function shareRecipe() {
  const hasWater = waterInput.value.trim() !== "";
  const hasCoffee = coffeeInput.value.trim() !== "";

  // If no coffee or water inputs, just share the base URL
  if (!hasWater && !hasCoffee) {
    const baseUrl = window.location.origin + window.location.pathname;

    // Check if Web Share API is available AND we're in a secure context
    if (navigator.share && window.isSecureContext) {
      console.log("Attempting to use Web Share API with base URL...");

      const shareData = {
        title: "Coffee Calc",
        text: "Check out this coffee ratio calculator!",
        url: baseUrl,
      };

      navigator
        .share(shareData)
        .then(() => console.log("Successfully shared base URL"))
        .catch((error) => {
          console.log("Share failed:", error);
          fallbackToClipboard(
            baseUrl,
            "Check out this coffee ratio calculator!"
          );
        });
    } else {
      fallbackToClipboard(baseUrl, "Check out this coffee ratio calculator!");
    }
    return;
  }

  // Continue with normal share functionality if we have inputs
  const shareableUrl = buildUrlWithValues();
  const recipeText = generateRecipeMarkdown();

  console.log("Web Share API available:", !!navigator.share);
  console.log("Running on secure context:", window.isSecureContext);

  if (navigator.share && window.isSecureContext) {
    console.log("Attempting to use Web Share API...");

    const shareData = {
      title: "Coffee Recipe",
      text: recipeText,
      url: shareableUrl,
    };

    console.log("Share data:", shareData);

    navigator
      .share(shareData)
      .then(() => {
        console.log("Successfully shared");
      })
      .catch((error) => {
        console.log("Share failed:", error);
        fallbackToClipboard(shareableUrl, recipeText);
      });
  } else {
    console.log("Web Share API not available:");
    console.log("- navigator.share exists:", !!navigator.share);
    console.log("- secure context:", window.isSecureContext);

    fallbackToClipboard(shareableUrl, recipeText);
  }
}

function fallbackToClipboard(url, markdown) {
  const textToCopy = `${markdown}\n\nRecipe URL: ${url}`;

  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      console.log("Successfully copied to clipboard");
      alert("Recipe copied to clipboard!");
    })
    .catch((err) => {
      console.error("Clipboard error:", err);
      alert("Error copying recipe: " + err);
    });
}

function buildUrlWithValues() {
  const recipeData = {
    calculator: {
      water: waterInput.value,
      coffee: coffeeInput.value,
      ratio: ratioSelect.value,
    },
    metadata: {
      grindSize: document.getElementById("grind-size").value,
      waterTemp: document.getElementById("water-temp").value,
      notes: document.getElementById("additional-notes").value,
    },
    steps: Array.from(document.querySelectorAll(".recipe-step")).map(
      (step) => ({
        water: step.querySelector('input[type="number"]').value,
        description: step.querySelector('input[type="text"]').value,
        minutes: step.querySelector(".minutes").value,
        seconds: step.querySelector(".seconds").value,
      })
    ),
  };

  const jsonString = JSON.stringify(recipeData);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  return (
    window.location.origin + window.location.pathname + "?data=" + compressed
  );
}

function loadSharedRecipe() {
  const urlParams = new URLSearchParams(window.location.search);
  const compressedData = urlParams.get("data");

  if (!compressedData) return;

  try {
    const jsonString =
      LZString.decompressFromEncodedURIComponent(compressedData);
    const recipeData = JSON.parse(jsonString);

    // Set main calculator values
    if (recipeData.calculator) {
      if (recipeData.calculator.water)
        waterInput.value = recipeData.calculator.water;
      if (recipeData.calculator.coffee)
        coffeeInput.value = recipeData.calculator.coffee;
      if (recipeData.calculator.ratio)
        ratioSelect.value = recipeData.calculator.ratio;
    }
    if (recipeData.metadata) {
      if (recipeData.metadata.grindSize)
        document.getElementById("grind-size").value =
          recipeData.metadata.grindSize;
      if (recipeData.metadata.waterTemp)
        document.getElementById("water-temp").value =
          recipeData.metadata.waterTemp;
      if (recipeData.metadata.notes)
        document.getElementById("additional-notes").value =
          recipeData.metadata.notes;
    }

    // Clear existing steps
    document.getElementById("recipe-steps").innerHTML = "";

    // Add shared steps
    if (recipeData.steps && Array.isArray(recipeData.steps)) {
      recipeData.steps.forEach((step) => {
        addRecipeStep(step);
      });
    }
  } catch (error) {
    console.error("Error loading shared recipe:", error);
    alert("Invalid recipe data in URL");
  }
}

// Modify your existing addRecipeStep function to accept initial values
function addRecipeStep(initialValues = null) {
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
  if (initialValues) waterInput.value = initialValues.water;

  // Step description input
  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.placeholder = "Step description";
  if (initialValues) descriptionInput.value = initialValues.description;

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
  if (initialValues) minutesInput.value = initialValues.minutes;

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
  if (initialValues) secondsInput.value = initialValues.seconds;

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

// Update the reset function
function resetAllInputs() {
  // Reset calculator inputs
  waterInput.value = "";
  coffeeInput.value = "";
  ratioSelect.value = "16"; // Default ratio

  // Reset metadata inputs
  document.getElementById("grind-size").value = "650";
  document.getElementById("water-temp").value = "200";
  document.getElementById("additional-notes").value = "";

  // Clear recipe steps
  document.getElementById("recipe-steps").innerHTML = "";

  // Reset timer
  const currentTimerDisplay = document.getElementById("current-timer");
  if (currentTimerDisplay) {
    currentTimerDisplay.textContent = "";
  }

  // Reset timer buttons
  const startButton = document.getElementById("start-timer");
  const pauseButton = document.getElementById("pause-timer");
  const resetButton = document.getElementById("reset-timer");

  if (startButton) startButton.disabled = false;
  if (pauseButton) pauseButton.disabled = true;
  if (resetButton) resetButton.disabled = true;

  // Reset timer variables
  timerRunning = false;
  isPaused = false;
  currentStepIndex = 0;
  currentTimeLeft = 0;
  clearInterval(timerInterval);

  // Clear URL parameters but don't refresh the page
  window.history.pushState({}, "", window.location.pathname);
}

// Add event listener for reset button
document.getElementById("reset-button").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all inputs?")) {
    resetAllInputs();
  }
});

// Theme handling
function initTheme() {
  const toggleSwitch = document.getElementById("theme-toggle");

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");

  // Check if user prefers dark mode
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Set initial theme
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    toggleSwitch.checked = savedTheme === "dark";
  } else if (prefersDark) {
    document.documentElement.setAttribute("data-theme", "dark");
    toggleSwitch.checked = true;
  }

  // Theme switch handler
  toggleSwitch.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });
}



// Timer State Management
const timerState = {
  isRunning: false,
  currentTime: 0,
  currentStep: 0,
  steps: [], // Will contain {duration: number, description: string}
  intervalId: null
};

// Timer Control Elements
const playPauseBtn = document.getElementById('play-pause');
const prevStepBtn = document.getElementById('prev-step');
const nextStepBtn = document.getElementById('next-step');
const resetTimerBtn = document.getElementById('reset-timer');
const currentTimerDisplay = document.getElementById('current-timer');
const stepIndicator = document.getElementById('step-indicator');

// Format time as MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update step indicator
function updateStepIndicator() {
  if (timerState.steps.length === 0) {
      stepIndicator.textContent = 'No steps added';
      return;
  }
  stepIndicator.textContent = `Step ${timerState.currentStep + 1} of ${timerState.steps.length}`;
}

// Toggle play/pause
function togglePlayPause() {
  if (timerState.steps.length === 0) return;

  if (timerState.isRunning) {
      // Pause
      clearInterval(timerState.intervalId);
      playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  } else {
      // Play
      timerState.intervalId = setInterval(() => {
          if (timerState.currentTime > 0) {
              timerState.currentTime--;
              currentTimerDisplay.textContent = formatTime(timerState.currentTime);
          } else {
              // Auto-advance to next step if available
              if (timerState.currentStep < timerState.steps.length - 1) {
                  nextStep();
              } else {
                  clearInterval(timerState.intervalId);
                  timerState.isRunning = false;
                  playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
              }
          }
      }, 1000);
      playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
  }
  timerState.isRunning = !timerState.isRunning;
}

// Move to previous step
function previousStep() {
  if (timerState.currentStep > 0) {
      timerState.currentStep--;
      timerState.currentTime = timerState.steps[timerState.currentStep].duration;
      currentTimerDisplay.textContent = formatTime(timerState.currentTime);
      updateStepIndicator();
      updateStepButtons();
  }
}

// Move to next step
function nextStep() {
  if (timerState.currentStep < timerState.steps.length - 1) {
      timerState.currentStep++;
      timerState.currentTime = timerState.steps[timerState.currentStep].duration;
      currentTimerDisplay.textContent = formatTime(timerState.currentTime);
      updateStepIndicator();
      updateStepButtons();
  }
}

// Reset timer
function resetTimer() {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  timerState.currentStep = 0;
  timerState.currentTime = timerState.steps[0]?.duration || 0;
  currentTimerDisplay.textContent = formatTime(timerState.currentTime);
  playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  updateStepIndicator();
  updateStepButtons();
}

// Update step navigation buttons
function updateStepButtons() {
  prevStepBtn.disabled = timerState.currentStep === 0;
  nextStepBtn.disabled = timerState.currentStep === timerState.steps.length - 1;
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);
prevStepBtn.addEventListener('click', previousStep);
nextStepBtn.addEventListener('click', nextStep);
resetTimerBtn.addEventListener('click', resetTimer);

// When adding a new recipe step, update the timer state
function addStepToTimer(duration, description) {
  timerState.steps.push({ duration, description });
  if (timerState.steps.length === 1) {
      timerState.currentTime = duration;
      currentTimerDisplay.textContent = formatTime(duration);
  }
  updateStepIndicator();
  updateStepButtons();
}

// Update your initialization (around line 796-807)
document.addEventListener("DOMContentLoaded", () => {  // Changed from window to document
  populateRatioOptions();
  loadSharedRecipe();
  initTheme();

  // Add share button event listener
  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
      shareBtn.addEventListener("click", shareRecipe);
  }
});