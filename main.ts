// Type definitions
declare const LZString: {
  compressToEncodedURIComponent: (data: string) => string;
  decompressFromEncodedURIComponent: (data: string) => string | null;
};

type CalculatorField = "water" | "coffee" | "ratio";

interface StepData {
  duration: number;
  description: string;
  water?: number;
}

interface RecipeStepInitialValues {
  water: string;
  description: string;
  minutes: string;
  seconds: string;
}

interface RecipeData {
  calculator: {
    water: string;
    coffee: string;
    ratio: string;
  };
  metadata: {
    grindSize: string;
    waterTemp: string;
    notes: string;
  };
  steps: RecipeStepInitialValues[];
}

interface TimerState {
  isRunning: boolean;
  currentTime: number;
  currentStep: number;
  steps: StepData[];
  intervalId: ReturnType<typeof setInterval> | null;
}

// Global state variables
let lastUpdated: CalculatorField[] = []; // Track the order of user updates (not including default values)

// Timer State Management
const timerState: TimerState = {
  isRunning: false,
  currentTime: 0,
  currentStep: 0,
  steps: [], // Will contain {duration: number, description: string}
  intervalId: null,
};

// Get DOM elements
const waterInput = document.getElementById("water") as HTMLInputElement;
const coffeeInput = document.getElementById("coffee") as HTMLInputElement;
const ratioSelect = document.getElementById("ratio") as HTMLSelectElement;

// Timer Control Elements
const playPauseBtn = document.getElementById("play-pause") as HTMLButtonElement;
const prevStepBtn = document.getElementById("prev-step") as HTMLButtonElement;
const nextStepBtn = document.getElementById("next-step") as HTMLButtonElement;
const resetTimerBtn = document.getElementById("reset-timer") as HTMLButtonElement;
const currentTimerDisplay = document.getElementById("current-timer") as HTMLElement;
const stepIndicator = document.getElementById("step-indicator") as HTMLElement;
const stepDetails = document.getElementById("step-details") as HTMLElement | null;

// Reset all inputs and reload the page
function resetAllInputs(): void {
  console.log("Reset button clicked");
  // Clear URL parameters
  const baseUrl = window.location.origin + window.location.pathname;
  window.location.href = baseUrl;
}

// Debug logging function
function logTimerState(action: string): void {
  console.log(`Timer Action: ${action}`);
  console.log("Timer State:", {
    isRunning: timerState.isRunning,
    currentTime: timerState.currentTime,
    currentStep: timerState.currentStep,
    totalSteps: timerState.steps.length,
    steps: timerState.steps,
  });
}

// Populate ratio options (1:1 to 100:1) with 18:1 as default
function populateRatioOptions(): void {
  const defaultRatio = "18";
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
  
  // Update the ratio span to show the default value
  if (defaultRatio) {
    updateCalculatorSpanDisplay("ratio", defaultRatio);
  }
}

// Calculator functions
function updateCalculatorSpanDisplay(fieldName: CalculatorField, value: string): void {
  const span = document.getElementById(`${fieldName}-span`);
  if (!span) return;
  
  if (value && value !== "") {
    if (fieldName === "ratio") {
      span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + `${value}:1`;
    } else {
      span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + value;
    }
  } else {
    const placeholder = span.getAttribute("data-placeholder") || "";
    span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + placeholder;
  }
}

function markFieldAsCalculated(fieldName: CalculatorField): void {
  const span = document.getElementById(`${fieldName}-span`);
  if (span) {
    span.classList.add("calculated");
  }
}

function removeCalculatedIndicator(fieldName: CalculatorField): void {
  const span = document.getElementById(`${fieldName}-span`);
  if (span) {
    span.classList.remove("calculated");
  }
}

function updateLastTouched(inputType: CalculatorField): void {
  lastUpdated = lastUpdated.filter((item) => item !== inputType);
  lastUpdated.push(inputType);
  if (lastUpdated.length > 2) {
    lastUpdated.shift();
  }
  calculateBasedOnLastUpdates();
}

function calculateBasedOnLastUpdates(): void {
  const water = parseFloat(waterInput.value);
  const coffee = parseFloat(coffeeInput.value);
  const ratio = parseInt(ratioSelect.value);

  // Determine which fields have values (including defaults)
  const fieldsWithValues: CalculatorField[] = [];
  if (!isNaN(water) && waterInput.value !== "") fieldsWithValues.push("water");
  if (!isNaN(coffee) && coffeeInput.value !== "") fieldsWithValues.push("coffee");
  if (!isNaN(ratio) && ratioSelect.value !== "") fieldsWithValues.push("ratio");

  // Need at least 2 fields with values to calculate the third
  if (fieldsWithValues.length < 2) return;

  // Determine which field to calculate based on the last 2 user-updated fields
  let toCalculate: CalculatorField | undefined;
  
  if (lastUpdated.length >= 2) {
    // User has updated 2+ fields - calculate the one not in the last 2 updated
    // lastUpdated keeps only the last 2, so find what's missing
    toCalculate = (["water", "coffee", "ratio"] as CalculatorField[]).find(
      (item) => !lastUpdated.includes(item)
    );
  } else if (lastUpdated.length === 1) {
    // User has updated 1 field, and we have 2 fields with values total
    // The other field with a value is likely a default (e.g., ratio)
    // Calculate the third field that doesn't have a value
    toCalculate = (["water", "coffee", "ratio"] as CalculatorField[]).find(
      (item) => !fieldsWithValues.includes(item)
    );
  } else {
    // No user updates yet - can't determine what to calculate
    return;
  }

  if (!toCalculate) return;

  switch (toCalculate) {
    case "water":
      if (!isNaN(coffee) && !isNaN(ratio)) {
        const calculatedValue = (coffee * ratio).toFixed(0);
        waterInput.value = calculatedValue;
        updateCalculatorSpanDisplay("water", calculatedValue);
        markFieldAsCalculated("water");
        updateUrlInBrowser();
      }
      break;
    case "coffee":
      if (!isNaN(water) && !isNaN(ratio)) {
        const calculatedValue = (water / ratio).toFixed(1);
        coffeeInput.value = calculatedValue;
        updateCalculatorSpanDisplay("coffee", calculatedValue);
        markFieldAsCalculated("coffee");
        updateUrlInBrowser();
      }
      break;
    case "ratio":
      if (!isNaN(water) && !isNaN(coffee)) {
        const calculatedRatio = Math.round(water / coffee);
        if (calculatedRatio >= 1 && calculatedRatio <= 100) {
          ratioSelect.value = calculatedRatio.toString();
          updateCalculatorSpanDisplay("ratio", calculatedRatio.toString());
          markFieldAsCalculated("ratio");
          updateUrlInBrowser();
        }
      }
      break;
  }
}

// Timer functions
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function updateStepIndicator(): void {
  const timerControls = document.querySelector(".timer-controls") as HTMLElement;
  if (!timerControls) return;
  
  if (timerState.steps.length === 0) {
    stepIndicator.textContent = "No steps added";
    if (stepDetails) stepDetails.textContent = "";
    timerControls.style.display = "none"; // Hide timer controls
    return;
  }
  stepIndicator.textContent = `Step ${timerState.currentStep + 1} of ${
    timerState.steps.length
  }`;
  
  const currentStep = timerState.steps[timerState.currentStep];
  if (stepDetails && currentStep) {
    stepDetails.textContent = `Step ${timerState.currentStep + 1} - Add ${currentStep.water || 0}g of water to ${currentStep.description} for ${formatTime(currentStep.duration)}`;
  }
  timerControls.style.display = "flex"; // Show timer controls
}

function togglePlayPause(): void {
  console.log("togglePlayPause called");

  if (timerState.steps.length === 0) {
    console.log("No steps available to start timer");
    return;
  }

  if (timerState.isRunning) {
    console.log("Pausing timer");
    if (timerState.intervalId) {
      clearInterval(timerState.intervalId);
    }
    playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  } else {
    console.log("Starting timer");
    if (!timerState.currentTime && timerState.steps[timerState.currentStep]) {
      timerState.currentTime =
        timerState.steps[timerState.currentStep].duration;
    }
    timerState.intervalId = setInterval(() => {
      if (timerState.currentTime > 0) {
        timerState.currentTime--;
        currentTimerDisplay.textContent = formatTime(timerState.currentTime);
        console.log("Timer tick:", timerState.currentTime);
      } else {
        console.log("Step completed");
        if (timerState.currentStep < timerState.steps.length - 1) {
          nextStep();
        } else {
          console.log("All steps completed");
          if (timerState.intervalId) {
            clearInterval(timerState.intervalId);
          }
          timerState.isRunning = false;
          playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
        }
      }
    }, 1000);
    playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
  }
  timerState.isRunning = !timerState.isRunning;
  logTimerState("Toggle Play/Pause");
}

function updateStepButtons(): void {
  console.log("Updating step buttons");
  prevStepBtn.disabled = timerState.currentStep === 0;
  nextStepBtn.disabled = timerState.currentStep === timerState.steps.length - 1;
}

function previousStep(): void {
  console.log("Previous step called");
  if (timerState.currentStep > 0) {
    if (timerState.isRunning && timerState.intervalId) {
      clearInterval(timerState.intervalId);
      timerState.isRunning = false;
      playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
    timerState.currentStep--;
    const step = timerState.steps[timerState.currentStep];
    timerState.currentTime = step.duration;
    currentTimerDisplay.textContent = formatTime(timerState.currentTime);
    console.log("Moved to previous step:", {
      currentStep: timerState.currentStep,
      duration: step.duration,
      description: step.description,
    });
    updateStepIndicator();
    updateStepButtons();
  }
}

function nextStep(): void {
  console.log("Next step called");
  if (timerState.currentStep < timerState.steps.length - 1) {
    if (timerState.isRunning && timerState.intervalId) {
      clearInterval(timerState.intervalId);
      timerState.isRunning = false;
      playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
    timerState.currentStep++;
    const step = timerState.steps[timerState.currentStep];
    timerState.currentTime = step.duration;
    currentTimerDisplay.textContent = formatTime(timerState.currentTime);
    console.log("Moved to next step:", {
      currentStep: timerState.currentStep,
      duration: step.duration,
      description: step.description,
    });
    updateStepIndicator();
    updateStepButtons();
  }
}

function resetTimer(): void {
  console.log("Reset timer called");
  if (timerState.intervalId) {
    clearInterval(timerState.intervalId);
  }
  timerState.isRunning = false;
  timerState.currentStep = 0;
  if (timerState.steps.length > 0) {
    timerState.currentTime = timerState.steps[0].duration;
    currentTimerDisplay.textContent = formatTime(timerState.currentTime);
  } else {
    timerState.currentTime = 0;
    currentTimerDisplay.textContent = "00:00";
  }
  playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  updateStepIndicator();
  updateStepButtons();
  logTimerState("Reset Timer");
}

function parseStepDuration(minutesInput: HTMLInputElement, secondsInput: HTMLInputElement): number {
  const minutes = parseInt(minutesInput.value || "0", 10);
  const seconds = parseInt(secondsInput.value || "0", 10);
  const totalSeconds = minutes * 60 + seconds;
  console.log("Parsed step duration:", { minutes, seconds, totalSeconds });
  return totalSeconds;
}

// Recipe step functions
function addRecipeStep(initialValues: RecipeStepInitialValues | null = null): void {
  const stepsContainer = document.getElementById("recipe-steps");
  if (!stepsContainer) return;
  
  const stepElement = document.createElement("div");
  stepElement.className = "recipe-step";

  // Water amount input
  const waterSpan = document.createElement("span");
  waterSpan.className = "editable";
  waterSpan.setAttribute("data-placeholder", "Water (g)");
  const waterInput = document.createElement("input");
  waterInput.type = "number";
  waterInput.min = "0";
  waterInput.step = "1";
  waterInput.inputMode = "numeric";
  waterInput.pattern = "[0-9]*";
  waterInput.placeholder = "Water (g)";
  waterInput.style.display = "none";
  if (initialValues) {
    waterInput.value = initialValues.water;
    waterSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + initialValues.water;
  } else {
    waterSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + waterSpan.getAttribute("data-placeholder");
  }

  // Step description input
  const descriptionSpan = document.createElement("span");
  descriptionSpan.className = "editable";
  descriptionSpan.setAttribute("data-placeholder", "Step description");
  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.placeholder = "Step description";
  descriptionInput.style.display = "none";
  if (initialValues) {
    descriptionInput.value = initialValues.description;
    descriptionSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + initialValues.description;
  } else {
    descriptionSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + descriptionSpan.getAttribute("data-placeholder");
  }

  // Time container
  const timeContainer = document.createElement("div");
  timeContainer.className = "time-container";

  // Minutes input
  const minutesSpan = document.createElement("span");
  minutesSpan.className = "editable";
  minutesSpan.setAttribute("data-placeholder", "MM");
  const minutesInput = document.createElement("input");
  minutesInput.type = "number";
  minutesInput.className = "time-input minutes";
  minutesInput.min = "0";
  minutesInput.max = "59";
  minutesInput.step = "1";
  minutesInput.inputMode = "numeric";
  minutesInput.pattern = "[0-9]*";
  minutesInput.placeholder = "MM";
  minutesInput.style.display = "none";
  if (initialValues) {
    minutesInput.value = initialValues.minutes;
    minutesSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + initialValues.minutes;
  } else {
    minutesSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + minutesSpan.getAttribute("data-placeholder");
  }

  // Time separator
  const timeSeparator = document.createElement("span");
  timeSeparator.textContent = ":";
  timeSeparator.className = "time-separator";

  // Seconds input
  const secondsSpan = document.createElement("span");
  secondsSpan.className = "editable";
  secondsSpan.setAttribute("data-placeholder", "SS");
  const secondsInput = document.createElement("input");
  secondsInput.type = "number";
  secondsInput.className = "time-input seconds";
  secondsInput.min = "0";
  secondsInput.max = "59";
  secondsInput.step = "1";
  secondsInput.inputMode = "numeric";
  secondsInput.pattern = "[0-9]*";
  secondsInput.placeholder = "SS";
  secondsInput.style.display = "none";
  if (initialValues) {
    secondsInput.value = initialValues.seconds;
    secondsSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + initialValues.seconds;
  } else {
    secondsSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + secondsSpan.getAttribute("data-placeholder");
  }

  // Add time change listeners
  const updateTimerState = (): void => {
    const duration = parseStepDuration(minutesInput, secondsInput);
    const stepIndex = Array.from(stepsContainer.children).indexOf(stepElement);
    if (stepIndex !== -1 && stepIndex < timerState.steps.length) {
      timerState.steps[stepIndex].duration = duration;
      if (stepIndex === timerState.currentStep && !timerState.isRunning) {
        timerState.currentTime = duration;
        currentTimerDisplay.textContent = formatTime(duration);
      }
      console.log("Updated step duration:", { stepIndex, duration });
      updateUrlInBrowser();
    }
  };

  minutesInput.addEventListener("change", updateTimerState);
  secondsInput.addEventListener("change", updateTimerState);
  descriptionInput.addEventListener("change", () => {
    const stepIndex = Array.from(stepsContainer.children).indexOf(stepElement);
    if (stepIndex !== -1 && stepIndex < timerState.steps.length) {
      timerState.steps[stepIndex].description = descriptionInput.value;
      updateUrlInBrowser();
    }
  });

  // Assemble time container
  timeContainer.appendChild(minutesSpan);
  timeContainer.appendChild(minutesInput);
  timeContainer.appendChild(timeSeparator);
  timeContainer.appendChild(secondsSpan);
  timeContainer.appendChild(secondsInput);

  // Remove button
  const removeButton = document.createElement("button");
  removeButton.className = "remove-step";
  removeButton.innerHTML = '<i class="fa-solid fa-times"></i>';
  removeButton.addEventListener("click", () => {
    const stepIndex = Array.from(stepsContainer.children).indexOf(stepElement);
    timerState.steps.splice(stepIndex, 1);
    stepElement.remove();
    if (timerState.currentStep >= stepIndex) {
      timerState.currentStep = Math.max(0, timerState.currentStep - 1);
    }
    if (timerState.steps.length === 0) {
      timerState.currentTime = 0;
      currentTimerDisplay.textContent = "00:00";
    } else if (!timerState.isRunning) {
      timerState.currentTime =
        timerState.steps[timerState.currentStep].duration;
      currentTimerDisplay.textContent = formatTime(timerState.currentTime);
    }
    updateStepIndicator();
    updateStepButtons();
    updateUrlInBrowser();
  });

  // Assemble step
  stepElement.appendChild(waterSpan);
  stepElement.appendChild(waterInput);
  stepElement.appendChild(descriptionSpan);
  stepElement.appendChild(descriptionInput);
  stepElement.appendChild(timeContainer);
  stepElement.appendChild(removeButton);

  stepsContainer.appendChild(stepElement);

  // Add to timer state
  const duration = parseStepDuration(minutesInput, secondsInput);
  const description =
    descriptionInput.value || `Step ${timerState.steps.length + 1}`;
  const stepWater = parseInt(waterInput.value || "0", 10);
  timerState.steps.push({ duration, description, water: stepWater });

  const timerControls = document.querySelector(".timer-controls") as HTMLElement;
  if (timerState.steps.length === 1 && timerControls) {
    timerState.currentTime = duration;
    currentTimerDisplay.textContent = formatTime(duration);
    timerControls.style.display = "flex"; // Show timer controls
  }

  updateStepIndicator();
  updateStepButtons();
  logTimerState("Add Step");

  // Attach event listeners to the new step's span and input elements
  attachEditableListeners(stepElement);
  
  updateUrlInBrowser();
}

// Attach event listeners to editable spans and inputs
function attachEditableListeners(stepElement: HTMLElement): void {
  const editableSpans = stepElement.querySelectorAll(".editable");

  editableSpans.forEach((span) => {
    const input = span.nextElementSibling as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!input) return;
    
    span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + (input.value || span.getAttribute("data-placeholder"));
    input.style.display = "none";

    span.addEventListener("click", function () {
      this.style.display = "none";
      input.style.display = "inline";
      if (input.focus) input.focus();
    });

    input.addEventListener("blur", function () {
      span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + (this.value || span.getAttribute("data-placeholder"));
      this.style.display = "none";
      span.style.display = "inline";
      // Update URL when recipe step fields are edited
      updateUrlInBrowser();
    });

    input.addEventListener("keydown", function (event: KeyboardEvent) {
      if (event.key === "Enter") {
        this.blur();
      }
    });
  });
}

// Theme handling
function initTheme(): void {
  const toggleSwitch = document.getElementById("theme-toggle") as HTMLInputElement;
  if (!toggleSwitch) return;
  
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    toggleSwitch.checked = savedTheme === "dark";
  } else if (prefersDark) {
    document.documentElement.setAttribute("data-theme", "dark");
    toggleSwitch.checked = true;
  }

  toggleSwitch.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    const theme = target.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });
}

// URL sharing and loading
function buildUrlWithValues(): string {
  const recipeData: RecipeData = {
    calculator: {
      water: waterInput.value,
      coffee: coffeeInput.value,
      ratio: ratioSelect.value,
    },
    metadata: {
      grindSize: (document.getElementById("grind-size") as HTMLInputElement).value,
      waterTemp: (document.getElementById("water-temp") as HTMLInputElement).value,
      notes: (document.getElementById("additional-notes") as HTMLTextAreaElement).value,
    },
    steps: Array.from(document.querySelectorAll(".recipe-step")).map(
      (step) => ({
        water: (step.querySelector('input[type="number"]') as HTMLInputElement).value,
        description: (step.querySelector('input[type="text"]') as HTMLInputElement).value,
        minutes: (step.querySelector(".minutes") as HTMLInputElement)?.value || "0",
        seconds: (step.querySelector(".seconds") as HTMLInputElement)?.value || "0",
      })
    ),
  };

  const jsonString = JSON.stringify(recipeData);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  return (
    window.location.origin + window.location.pathname + "?data=" + compressed
  );
}

// Flag to prevent URL updates during initial load
let isUpdatingFromUrl = false;

// Debounced function to update URL with current values
let updateUrlTimeout: ReturnType<typeof setTimeout> | null = null;
function updateUrlInBrowser(): void {
  // Clear any pending update
  if (updateUrlTimeout) {
    clearTimeout(updateUrlTimeout);
  }
  
  // Debounce: wait 300ms after last change before updating URL
  updateUrlTimeout = setTimeout(() => {
    if (!isUpdatingFromUrl) {
      const newUrl = buildUrlWithValues();
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  }, 300);
}

function generateRecipeMarkdown(): string {
  const water = waterInput.value;
  const coffee = coffeeInput.value;
  const ratio = ratioSelect.value;
  const grindSize = (document.getElementById("grind-size") as HTMLInputElement).value;
  const waterTemp = (document.getElementById("water-temp") as HTMLInputElement).value;
  const notes = (document.getElementById("additional-notes") as HTMLTextAreaElement).value;
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
    const stepWater = (step.querySelector('input[type="number"]') as HTMLInputElement).value;
    const description = (step.querySelector('input[type="text"]') as HTMLInputElement).value;
    const minutes = (step.querySelector(".minutes") as HTMLInputElement)?.value || "0";
    const seconds = (step.querySelector(".seconds") as HTMLInputElement)?.value || "0";

    markdown += `${
      index + 1
    }. Pour ${stepWater}g - ${description} (${minutes}:${seconds.padStart(
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

function shareRecipe(): void {
  const hasWater = waterInput.value.trim() !== "";
  const hasCoffee = coffeeInput.value.trim() !== "";

  // If no coffee or water inputs, just share the base URL
  if (!hasWater && !hasCoffee) {
    const baseUrl = window.location.origin + window.location.pathname;
    if (navigator.share && window.isSecureContext) {
      navigator
        .share({
          title: "Coffee Calc",
          text: "Check out this coffee ratio calculator!",
          url: baseUrl,
        })
        .catch((error: Error) => {
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

  const shareableUrl = buildUrlWithValues();
  const recipeText = generateRecipeMarkdown();

  if (navigator.share && window.isSecureContext) {
    navigator
      .share({
        title: "Coffee Recipe",
        text: recipeText,
        url: shareableUrl,
      })
      .catch((error: Error) => {
        console.log("Share failed:", error);
        fallbackToClipboard(shareableUrl, recipeText);
      });
  } else {
    fallbackToClipboard(shareableUrl, recipeText);
  }
}

function fallbackToClipboard(url: string, markdown: string): void {
  const textToCopy = `${markdown}\n\nRecipe URL: ${url}`;
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      console.log("Successfully copied to clipboard");
      alert("Recipe copied to clipboard!");
    })
    .catch((err: Error) => {
      console.error("Clipboard error:", err);
      alert("Error copying recipe: " + err);
    });
}

function loadSharedRecipe(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const compressedData = urlParams.get("data");

  if (!compressedData) return;

  isUpdatingFromUrl = true; // Prevent URL updates during load
  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(compressedData);
    if (!jsonString) {
      throw new Error("Failed to decompress data");
    }
    const recipeData: RecipeData = JSON.parse(jsonString);

    // Set calculator values
    if (recipeData.calculator) {
      if (recipeData.calculator.water) {
        waterInput.value = recipeData.calculator.water;
        updateCalculatorSpanDisplay("water", recipeData.calculator.water);
      }
      if (recipeData.calculator.coffee) {
        coffeeInput.value = recipeData.calculator.coffee;
        updateCalculatorSpanDisplay("coffee", recipeData.calculator.coffee);
      }
      if (recipeData.calculator.ratio) {
        ratioSelect.value = recipeData.calculator.ratio;
        updateCalculatorSpanDisplay("ratio", recipeData.calculator.ratio);
      }
    }

    // Set metadata values
    if (recipeData.metadata) {
      const grindSizeInput = document.getElementById("grind-size") as HTMLInputElement;
      const waterTempInput = document.getElementById("water-temp") as HTMLInputElement;
      const notesInput = document.getElementById("additional-notes") as HTMLTextAreaElement;
      
      if (recipeData.metadata.grindSize && grindSizeInput) {
        grindSizeInput.value = recipeData.metadata.grindSize;
      }
      if (recipeData.metadata.waterTemp && waterTempInput) {
        waterTempInput.value = recipeData.metadata.waterTemp;
      }
      if (recipeData.metadata.notes && notesInput) {
        notesInput.value = recipeData.metadata.notes;
      }
    }

    // Clear existing steps
    const stepsContainer = document.getElementById("recipe-steps");
    if (stepsContainer) {
      stepsContainer.innerHTML = "";
    }

    // Add shared steps
    if (recipeData.steps && Array.isArray(recipeData.steps)) {
      recipeData.steps.forEach((step) => {
        addRecipeStep(step);
      });
    }

    // Show timer controls if there are steps
    const timerControls = document.querySelector(".timer-controls") as HTMLElement;
    if (timerControls) {
      if (recipeData.steps && recipeData.steps.length > 0) {
        timerControls.style.display = "flex";
      } else {
        timerControls.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error loading shared recipe:", error);
    alert("Invalid recipe data in URL");
  } finally {
    // Re-enable URL updates after load completes
    setTimeout(() => {
      isUpdatingFromUrl = false;
    }, 100);
  }
}

// Event listeners for calculator
const waterSpan = document.getElementById("water-span");
const coffeeSpan = document.getElementById("coffee-span");
const ratioSpan = document.getElementById("ratio-span");

waterInput.addEventListener("blur", () => {
  updateCalculatorSpanDisplay("water", waterInput.value);
  waterInput.style.display = "none";
  if (waterSpan) waterSpan.style.display = "inline";
  removeCalculatedIndicator("water"); // Remove calculated indicator when user edits
  if (waterInput.value !== "") {
    updateLastTouched("water");
  }
  updateUrlInBrowser();
});

waterInput.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    waterInput.blur();
  }
});

coffeeInput.addEventListener("blur", () => {
  updateCalculatorSpanDisplay("coffee", coffeeInput.value);
  coffeeInput.style.display = "none";
  if (coffeeSpan) coffeeSpan.style.display = "inline";
  removeCalculatedIndicator("coffee"); // Remove calculated indicator when user edits
  if (coffeeInput.value !== "") {
    updateLastTouched("coffee");
  }
  updateUrlInBrowser();
});

coffeeInput.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    coffeeInput.blur();
  }
});

ratioSelect.addEventListener("change", () => {
  updateCalculatorSpanDisplay("ratio", ratioSelect.value);
  ratioSelect.style.display = "none";
  if (ratioSpan) ratioSpan.style.display = "inline";
  removeCalculatedIndicator("ratio"); // Remove calculated indicator when user edits
  if (ratioSelect.value !== "") {
    updateLastTouched("ratio");
  }
  updateUrlInBrowser();
});

ratioSelect.addEventListener("blur", () => {
  ratioSelect.style.display = "none";
  if (ratioSpan) ratioSpan.style.display = "inline";
});

// Add event listeners for timer controls
playPauseBtn.addEventListener("click", togglePlayPause);
prevStepBtn.addEventListener("click", previousStep);
nextStepBtn.addEventListener("click", nextStep);
resetTimerBtn.addEventListener("click", resetTimer);

// Add event listener for add step button
const addStepBtn = document.getElementById("add-step");
if (addStepBtn) {
  addStepBtn.addEventListener("click", () => addRecipeStep());
}

// Add event listener for share button
const shareBtn = document.getElementById("shareBtn");
if (shareBtn) {
  shareBtn.addEventListener("click", shareRecipe);
}

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  // First, initialize all editable spans with their current values or placeholders
  const editableSpans = document.querySelectorAll(".editable");

  editableSpans.forEach((span) => {
    const input = span.nextElementSibling as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!input) return;
    
    // Skip calculator fields - they will be handled separately
    if (span.id === "water-span" || span.id === "coffee-span" || span.id === "ratio-span") {
      return;
    }
    span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + (input.value || span.getAttribute("data-placeholder"));
    input.style.display = "none";

    span.addEventListener("click", function () {
      this.style.display = "none";
      input.style.display = "inline";
      if (input.focus) input.focus();
    });

    input.addEventListener("blur", function () {
      span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + (this.value || span.getAttribute("data-placeholder"));
      this.style.display = "none";
      span.style.display = "inline";
      // Update URL for metadata fields
      if (this.id === "grind-size" || this.id === "water-temp" || this.id === "additional-notes") {
        updateUrlInBrowser();
      }
    });

    input.addEventListener("keydown", function (event: KeyboardEvent) {
      if (event.key === "Enter") {
        this.blur();
      }
    });
  });

  // Initialize calculator spans and add click handlers
  if (waterSpan) {
    waterSpan.addEventListener("click", function () {
      this.style.display = "none";
      waterInput.style.display = "inline";
      waterInput.focus();
    });
  }
  
  if (coffeeSpan) {
    coffeeSpan.addEventListener("click", function () {
      this.style.display = "none";
      coffeeInput.style.display = "inline";
      coffeeInput.focus();
    });
  }
  
  if (ratioSpan) {
    ratioSpan.addEventListener("click", function () {
      this.style.display = "none";
      ratioSelect.style.display = "inline";
      ratioSelect.focus();
    });
  }
  
  // Initialize calculator-specific functionality
  populateRatioOptions();
  loadSharedRecipe();
  
  // Initialize calculator spans after values are set (this will format them correctly)
  updateCalculatorSpanDisplay("water", waterInput.value);
  updateCalculatorSpanDisplay("coffee", coffeeInput.value);
  updateCalculatorSpanDisplay("ratio", ratioSelect.value);
  
  initTheme();
  updateStepIndicator();
  updateStepButtons();
  // Add event listener for reset button
  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", resetAllInputs);
  }
});
