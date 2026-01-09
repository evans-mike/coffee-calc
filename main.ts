// Type definitions
type CalculatorField = "water" | "coffee" | "ratio";

interface RecipeStep {
  timestamp: number; // Total seconds from start (e.g., 0, 30, 45, 65, 90, 120)
  description: string;
  water?: string;
}

interface StepInitialValues {
  water: string;
  description: string;
  timestampMinutes: string;
  timestampSeconds: string;
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
  steps: StepInitialValues[];
}

// Global state variables
let lastUpdated: CalculatorField[] = []; // Track the order of user updates (not including default values)

// Timer State Management
interface TimerState {
  isRunning: boolean;
  currentTime: number;
  currentStep: number;
  steps: RecipeStep[];
  intervalId: ReturnType<typeof setInterval> | null;
}

const timerState: TimerState = {
  isRunning: false,
  currentTime: 0, // Elapsed time in seconds (counts up from 0:00)
  currentStep: 0,
  steps: [], // Will contain {timestamp: number, description: string, water?: string}
  intervalId: null,
};

// Get DOM elements with type assertions
// Using non-null assertion (!) since these elements are required in the HTML
const waterInput = document.getElementById("water")! as HTMLInputElement;
const coffeeInput = document.getElementById("coffee")! as HTMLInputElement;
const ratioSelect = document.getElementById("ratio")! as HTMLSelectElement;

// Timer Control Elements
const playPauseBtn = document.getElementById("play-pause")! as HTMLButtonElement;
const prevStepBtn = document.getElementById("prev-step")! as HTMLButtonElement;
const nextStepBtn = document.getElementById("next-step")! as HTMLButtonElement;
const resetTimerBtn = document.getElementById("reset-timer")! as HTMLButtonElement;
const currentTimerDisplay = document.getElementById("current-timer")! as HTMLDivElement;
const stepIndicator = document.getElementById("step-indicator")! as HTMLDivElement;
const stepDetails = document.getElementById("step-details") as HTMLDivElement | null;

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
  const ratio = parseInt(ratioSelect.value, 10);

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
  const timerControls = document.querySelector(".timer-controls") as HTMLElement | null;
  if (!timerControls) return;
  
  if (timerState.steps.length === 0) {
    stepIndicator.textContent = "No steps added";
    if (stepDetails) stepDetails.textContent = "";
    timerControls.style.display = "none"; // Hide timer controls
    return;
  }
  
  const currentStep = timerState.steps[timerState.currentStep];
  if (currentStep && currentStep.description) {
    stepIndicator.textContent = `Step ${timerState.currentStep + 1} of ${
      timerState.steps.length
    } - ${currentStep.description}`;
  } else {
    stepIndicator.textContent = `Step ${timerState.currentStep + 1} of ${
      timerState.steps.length
    }`;
  }
  
  if (stepDetails && currentStep && currentStep.water) {
    stepDetails.textContent = `Step ${timerState.currentStep + 1} - Add ${currentStep.water}g of water to ${currentStep.description} at ${formatTime(currentStep.timestamp)}`;
  }
  timerControls.style.display = "flex"; // Show timer controls
}

function startTimer(): void {
  // Clear any existing interval
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
  }
  
  // Timer starts from currentTime and counts up
  timerState.intervalId = setInterval(() => {
    timerState.currentTime++;
    currentTimerDisplay.textContent = formatTime(timerState.currentTime);
    console.log("Timer tick:", timerState.currentTime);
    
    // Update current step based on elapsed time
    updateCurrentStepFromTime();
  }, 1000);
  timerState.isRunning = true;
  playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
}

function togglePlayPause(): void {
  console.log("togglePlayPause called");

  if (timerState.steps.length === 0) {
    console.log("No steps available to start timer");
    return;
  }

  if (timerState.isRunning) {
    console.log("Pausing timer");
    if (timerState.intervalId !== null) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
    timerState.isRunning = false;
    playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  } else {
    console.log("Starting timer");
    startTimer();
  }
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
    // Save the current running state
    const wasRunning = timerState.isRunning;
    
    // Stop the current timer interval if running
    if (timerState.isRunning && timerState.intervalId !== null) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
    
    timerState.currentStep--;
    const step = timerState.steps[timerState.currentStep];
    if (step) {
      timerState.currentTime = step.timestamp;
      currentTimerDisplay.textContent = formatTime(timerState.currentTime);
      console.log("Moved to previous step:", {
        currentStep: timerState.currentStep,
        timestamp: step.timestamp,
        description: step.description,
      });
      updateStepIndicator();
      updateStepButtons();
      
      // If timer was running, restart it on the new step
      if (wasRunning) {
        startTimer();
      } else {
        // Keep paused state
        timerState.isRunning = false;
        playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
      }
    }
  }
}

function nextStep(): void {
  console.log("Next step called");
  if (timerState.currentStep < timerState.steps.length - 1) {
    // Save the current running state
    const wasRunning = timerState.isRunning;
    
    // Stop the current timer interval if running
    if (timerState.isRunning && timerState.intervalId !== null) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
    
    timerState.currentStep++;
    const step = timerState.steps[timerState.currentStep];
    if (step) {
      timerState.currentTime = step.timestamp;
      currentTimerDisplay.textContent = formatTime(timerState.currentTime);
      console.log("Moved to next step:", {
        currentStep: timerState.currentStep,
        timestamp: step.timestamp,
        description: step.description,
      });
      updateStepIndicator();
      updateStepButtons();
      
      // If timer was running, restart it on the new step
      if (wasRunning) {
        startTimer();
      } else {
        // Keep paused state
        timerState.isRunning = false;
        playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
      }
    }
  }
}

function resetTimer(): void {
  console.log("Reset timer called");
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
  }
  timerState.isRunning = false;
  timerState.currentStep = 0;
  timerState.currentTime = 0; // Reset to 0:00
  currentTimerDisplay.textContent = "00:00";
  playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  updateStepIndicator();
  updateStepButtons();
  logTimerState("Reset Timer");
}

function parseStepTimestamp(minutesInput: HTMLInputElement, secondsInput: HTMLInputElement): number {
  const minutes = parseInt(minutesInput.value || "0", 10);
  const seconds = parseInt(secondsInput.value || "0", 10);
  const totalSeconds = minutes * 60 + seconds;
  console.log("Parsed step timestamp:", { minutes, seconds, totalSeconds });
  return totalSeconds;
}

// Recipe step functions
function addRecipeStep(initialValues: StepInitialValues | null = null): void {
  const stepsContainer = document.getElementById("recipe-steps");
  if (!stepsContainer) return;
  
  const stepElement = document.createElement("div");
  stepElement.className = "recipe-step";

  // Time container (timestamp picker) - NEW ORDER: First
  const timeContainer = document.createElement("div");
  timeContainer.className = "time-container";

  // Minutes input for timestamp
  const minutesSpan = document.createElement("span");
  minutesSpan.className = "editable timestamp-minutes";
  minutesSpan.setAttribute("data-placeholder", "0");
  const minutesInput = document.createElement("input");
  minutesInput.type = "number";
  minutesInput.className = "time-input timestamp-minutes";
  minutesInput.min = "0";
  minutesInput.max = "59";
  minutesInput.step = "1";
  minutesInput.inputMode = "numeric";
  minutesInput.pattern = "[0-9]*";
  minutesInput.placeholder = "0";
  minutesInput.style.display = "none";
  if (initialValues) {
    minutesInput.value = initialValues.timestampMinutes;
    const mins = parseInt(initialValues.timestampMinutes || "0", 10);
    const secs = parseInt(initialValues.timestampSeconds || "0", 10);
    const isEmpty = mins === 0 && secs === 0;
    const displayValue = initialValues.timestampMinutes.padStart(2, "0");
    minutesSpan.innerHTML = isEmpty ? '<i class="fa-regular fa-pen-to-square"></i> ' + displayValue : displayValue;
  } else {
    minutesSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> 00';
  }

  // Time separator
  const timeSeparator = document.createElement("span");
  timeSeparator.textContent = ":";
  timeSeparator.className = "time-separator";

  // Seconds input for timestamp
  const secondsSpan = document.createElement("span");
  secondsSpan.className = "editable timestamp-seconds";
  secondsSpan.setAttribute("data-placeholder", "0");
  const secondsInput = document.createElement("input");
  secondsInput.type = "number";
  secondsInput.className = "time-input timestamp-seconds";
  secondsInput.min = "0";
  secondsInput.max = "59";
  secondsInput.step = "1";
  secondsInput.inputMode = "numeric";
  secondsInput.pattern = "[0-9]*";
  secondsInput.placeholder = "0";
  secondsInput.style.display = "none";
  if (initialValues) {
    secondsInput.value = initialValues.timestampSeconds;
    const displayValue = initialValues.timestampSeconds.padStart(2, "0");
    secondsSpan.innerHTML = displayValue;
  } else {
    secondsSpan.innerHTML = "00";
  }

  // Update timestamp display helper - only show icon if empty (0:00)
  const updateTimestampDisplay = (): void => {
    const mins = minutesInput.value || "0";
    const secs = secondsInput.value || "0";
    const totalSeconds = parseInt(mins, 10) * 60 + parseInt(secs, 10);
    const isEmpty = totalSeconds === 0;
    
    if (isEmpty) {
      minutesSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> 00';
    } else {
      minutesSpan.innerHTML = mins.padStart(2, "0");
    }
    secondsSpan.innerHTML = secs.padStart(2, "0");
  };
  
  // Add click listeners for timestamp spans to make them editable
  minutesSpan.addEventListener("click", () => {
    minutesSpan.style.display = "none";
    minutesInput.style.display = "inline";
    minutesInput.focus();
    minutesInput.select();
  });
  
  secondsSpan.addEventListener("click", () => {
    secondsSpan.style.display = "none";
    secondsInput.style.display = "inline";
    secondsInput.focus();
    secondsInput.select();
  });

  // Step description input - NEW ORDER: Second
  const descriptionSpan = document.createElement("span");
  descriptionSpan.className = "editable";
  descriptionSpan.setAttribute("data-placeholder", "Step description");
  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.placeholder = "Step description";
  descriptionInput.style.display = "none";
  // Helper function to format description display - only show icon if empty
  const formatDescriptionDisplay = (value: string): string => {
    if (!value || value === "") {
      return '<i class="fa-regular fa-pen-to-square"></i> ' + descriptionSpan.getAttribute("data-placeholder");
    }
    return value;
  };

  if (initialValues) {
    descriptionInput.value = initialValues.description;
    descriptionSpan.innerHTML = formatDescriptionDisplay(initialValues.description);
  } else {
    descriptionSpan.innerHTML = formatDescriptionDisplay("");
  }

  // Water amount input - NEW ORDER: Third
  const waterSpan = document.createElement("span");
  waterSpan.className = "editable";
  waterSpan.setAttribute("data-placeholder", "Water (g)");
  const stepWaterInput = document.createElement("input");
  stepWaterInput.type = "number";
  stepWaterInput.min = "0";
  stepWaterInput.step = "1";
  stepWaterInput.inputMode = "numeric";
  stepWaterInput.pattern = "[0-9]*";
  stepWaterInput.placeholder = "Water (g)";
  stepWaterInput.style.display = "none";
  // Helper function to format water display with "g" suffix - only show icon if empty
  const formatWaterDisplay = (value: string): string => {
    if (!value || value === "") {
      return '<i class="fa-regular fa-pen-to-square"></i> ' + waterSpan.getAttribute("data-placeholder");
    }
    return value + 'g';
  };

  if (initialValues) {
    // Strip "g" suffix if present in initialValues
    const waterValue = initialValues.water.replace(/g$/, "");
    stepWaterInput.value = waterValue;
    waterSpan.innerHTML = formatWaterDisplay(waterValue);
  } else {
    waterSpan.innerHTML = formatWaterDisplay("");
  }

  // Add timestamp change listeners
  const updateTimerState = (): void => {
    const timestamp = parseStepTimestamp(minutesInput, secondsInput);
    
    // Find the step by matching description and water (more reliable than index)
    const stepDesc = descriptionInput.value;
    const stepWater = stepWaterInput.value || undefined;
    const stepToUpdate = timerState.steps.find(step => 
      step.description === stepDesc && step.water === stepWater
    );
    
    if (stepToUpdate) {
      // Check if this is the current step before updating
      const wasCurrentStepIndex = timerState.steps.indexOf(stepToUpdate);
      const wasCurrentStep = wasCurrentStepIndex === timerState.currentStep;
      
      // Update the timestamp
      stepToUpdate.timestamp = timestamp;
      
      // Sort steps by timestamp to maintain order
      timerState.steps.sort((a, b) => a.timestamp - b.timestamp);
      // Re-render steps in sorted order
      reorderStepsInDOM();
      
      // Update current step if timer is not running
      if (!timerState.isRunning) {
        // If this was the current step, update the timer time to the new timestamp
        if (wasCurrentStep) {
          timerState.currentTime = timestamp;
          currentTimerDisplay.textContent = formatTime(timestamp);
        }
        
        // Recalculate which step should be current based on elapsed time
        updateCurrentStepFromTime();
        
        // Check if the updated step is still the current step
        const newStepIndex = timerState.steps.indexOf(stepToUpdate);
        const isCurrentStep = newStepIndex === timerState.currentStep;
        
        // If this step is still the current step and timer is paused, update display
        if (isCurrentStep) {
          updateStepIndicator();
        }
      }
      
      console.log("Updated step timestamp:", { wasCurrentStepIndex, newStepIndex: timerState.steps.indexOf(stepToUpdate), timestamp, wasCurrentStep });
      updateUrlInBrowser();
    }
    updateTimestampDisplay();
  };

  minutesInput.addEventListener("blur", () => {
    updateTimerState();
    updateTimestampDisplay();
    minutesInput.style.display = "none";
    minutesSpan.style.display = "inline";
  });
  minutesInput.addEventListener("change", () => {
    updateTimerState();
    updateTimestampDisplay();
  });
  secondsInput.addEventListener("blur", () => {
    updateTimerState();
    updateTimestampDisplay();
    secondsInput.style.display = "none";
    secondsSpan.style.display = "inline";
  });
  secondsInput.addEventListener("change", () => {
    updateTimerState();
    updateTimestampDisplay();
  });

  descriptionInput.addEventListener("blur", () => {
    // Find the step in timerState.steps by matching timestamp
    const timestamp = parseStepTimestamp(minutesInput, secondsInput);
    const stepInState = timerState.steps.find(step => step.timestamp === timestamp);
    if (stepInState) {
      const stepIndex = timerState.steps.indexOf(stepInState);
      const isCurrentStep = stepIndex === timerState.currentStep;
      
      stepInState.description = descriptionInput.value;
      
      // If this is the current step and timer is paused, update display
      if (isCurrentStep && !timerState.isRunning) {
        updateStepIndicator();
      }
    }
    descriptionSpan.innerHTML = formatDescriptionDisplay(descriptionInput.value);
    descriptionInput.style.display = "none";
    descriptionSpan.style.display = "inline";
    updateUrlInBrowser();
  });

  descriptionInput.addEventListener("change", () => {
    // Find the step in timerState.steps by matching timestamp
    const timestamp = parseStepTimestamp(minutesInput, secondsInput);
    const stepInState = timerState.steps.find(step => step.timestamp === timestamp);
    if (stepInState) {
      const stepIndex = timerState.steps.indexOf(stepInState);
      const isCurrentStep = stepIndex === timerState.currentStep;
      
      stepInState.description = descriptionInput.value;
      
      // If this is the current step and timer is paused, update display
      if (isCurrentStep && !timerState.isRunning) {
        updateStepIndicator();
      }
      updateUrlInBrowser();
    }
  });
  
  // Add click listener for description span
  descriptionSpan.addEventListener("click", () => {
    descriptionSpan.style.display = "none";
    descriptionInput.style.display = "inline";
    descriptionInput.focus();
    descriptionInput.select();
  });

  stepWaterInput.addEventListener("blur", () => {
    // Find the step in timerState.steps by matching timestamp
    const timestamp = parseStepTimestamp(minutesInput, secondsInput);
    const stepInState = timerState.steps.find(step => step.timestamp === timestamp);
    if (stepInState) {
      const stepIndex = timerState.steps.indexOf(stepInState);
      const isCurrentStep = stepIndex === timerState.currentStep;
      
      stepInState.water = stepWaterInput.value || undefined;
      
      // If this is the current step and timer is paused, update display
      if (isCurrentStep && !timerState.isRunning) {
        updateStepIndicator();
      }
    }
    waterSpan.innerHTML = formatWaterDisplay(stepWaterInput.value);
    stepWaterInput.style.display = "none";
    waterSpan.style.display = "inline";
    updateUrlInBrowser();
  });

  stepWaterInput.addEventListener("change", () => {
    // Find the step in timerState.steps by matching timestamp
    const timestamp = parseStepTimestamp(minutesInput, secondsInput);
    const stepInState = timerState.steps.find(step => step.timestamp === timestamp);
    if (stepInState) {
      const stepIndex = timerState.steps.indexOf(stepInState);
      const isCurrentStep = stepIndex === timerState.currentStep;
      
      stepInState.water = stepWaterInput.value || undefined;
      
      // If this is the current step and timer is paused, update display
      if (isCurrentStep && !timerState.isRunning) {
        updateStepIndicator();
      }
      updateUrlInBrowser();
    }
  });
  
  // Add click listener for water span
  waterSpan.addEventListener("click", () => {
    waterSpan.style.display = "none";
    stepWaterInput.style.display = "inline";
    stepWaterInput.focus();
    stepWaterInput.select();
  });

  // Helper function to handle TAB navigation within recipe steps
  const setupStepTabNavigation = (input: HTMLInputElement, nextInputInStep: HTMLInputElement | null) => {
    input.addEventListener("keydown", (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Enter") {
        input.blur();
      } else if (keyboardEvent.key === "Tab" && !keyboardEvent.shiftKey) {
        if (nextInputInStep) {
          event.preventDefault();
          const nextSpan = nextInputInStep.previousElementSibling as HTMLElement;
          if (nextSpan && nextSpan.classList.contains("editable")) {
            nextSpan.style.display = "none";
            nextInputInStep.style.display = "inline";
          }
          nextInputInStep.focus();
        } else {
          // Last input in step - check for next step
          const nextStep = stepElement.nextElementSibling;
          if (nextStep) {
            const nextStepTime = nextStep.querySelector('.timestamp-minutes') as HTMLInputElement;
            if (nextStepTime) {
              event.preventDefault();
              const nextStepTimeSpan = nextStepTime.previousElementSibling as HTMLElement;
              if (nextStepTimeSpan && nextStepTimeSpan.classList.contains("editable")) {
                nextStepTimeSpan.style.display = "none";
                nextStepTime.style.display = "inline";
              }
              nextStepTime.focus();
            }
          }
        }
      }
    });
  };

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
  removeButton.tabIndex = -1;
  removeButton.addEventListener("click", () => {
    const stepIndex = Array.from(stepsContainer.children).indexOf(stepElement);
    timerState.steps.splice(stepIndex, 1);
    stepElement.remove();
    if (timerState.steps.length === 0) {
      timerState.currentTime = 0;
      timerState.currentStep = 0;
      currentTimerDisplay.textContent = "00:00";
      const timerControls = document.querySelector(".timer-controls") as HTMLElement;
      if (timerControls) timerControls.style.display = "none";
    } else {
      updateCurrentStepFromTime();
    }
    updateStepIndicator();
    updateStepButtons();
    updateUrlInBrowser();
  });

  // Assemble step in NEW ORDER: timestamp → description → water → remove
  stepElement.appendChild(timeContainer);
  stepElement.appendChild(descriptionSpan);
  stepElement.appendChild(descriptionInput);
  stepElement.appendChild(waterSpan);
  stepElement.appendChild(stepWaterInput);
  stepElement.appendChild(removeButton);

  stepsContainer.appendChild(stepElement);

  // Add to timer state
  const timestamp = parseStepTimestamp(minutesInput, secondsInput);
  const description = descriptionInput.value || `Step ${timerState.steps.length + 1}`;
  timerState.steps.push({ timestamp, description, water: stepWaterInput.value || undefined });
  
  // Sort steps by timestamp
  timerState.steps.sort((a, b) => a.timestamp - b.timestamp);
  reorderStepsInDOM();

  if (timerState.steps.length === 1) {
    timerState.currentTime = 0;
    timerState.currentStep = 0;
    currentTimerDisplay.textContent = "00:00";
    const timerControls = document.querySelector(".timer-controls") as HTMLElement;
    if (timerControls) timerControls.style.display = "flex";
  }

  updateStepIndicator();
  updateStepButtons();
  logTimerState("Add Step");

  // Attach event listeners
  attachEditableListeners(stepElement);
  
  // Set up TAB navigation: timestamp minutes → seconds → description → water → next step
  setupStepTabNavigation(minutesInput, secondsInput);
  setupStepTabNavigation(secondsInput, descriptionInput);
  setupStepTabNavigation(descriptionInput, stepWaterInput);
  setupStepTabNavigation(stepWaterInput, null);
  
  updateTimestampDisplay();
  updateUrlInBrowser();
}

// Helper function to reorder steps in DOM based on timestamp order
function reorderStepsInDOM(): void {
  const stepsContainer = document.getElementById("recipe-steps");
  if (!stepsContainer) return;
  
  // Get all step elements and extract their timestamps
  const stepElements = Array.from(stepsContainer.children);
  
  // Create array with step elements and their timestamps
  const stepData = stepElements.map(step => {
    const minutesInput = step.querySelector(".timestamp-minutes") as HTMLInputElement;
    const secondsInput = step.querySelector(".timestamp-seconds") as HTMLInputElement;
    const minutes = parseInt(minutesInput?.value || "0", 10);
    const seconds = parseInt(secondsInput?.value || "0", 10);
    const timestamp = minutes * 60 + seconds;
    return { element: step, timestamp };
  });
  
  // Sort by timestamp
  stepData.sort((a, b) => a.timestamp - b.timestamp);
  
  // Remove all elements first (preserves event listeners)
  stepElements.forEach(element => {
    stepsContainer.removeChild(element);
  });
  
  // Re-append in sorted order (event listeners are preserved)
  stepData.forEach(({ element }) => {
    stepsContainer.appendChild(element);
  });
}

// Helper function to find and update current step based on elapsed time
function updateCurrentStepFromTime(): void {
  if (timerState.steps.length === 0) {
    timerState.currentStep = 0;
    return;
  }
  
  // Find the current step: the last step whose timestamp <= currentTime
  let newStepIndex = 0;
  for (let i = 0; i < timerState.steps.length; i++) {
    if (timerState.steps[i].timestamp <= timerState.currentTime) {
      newStepIndex = i;
    } else {
      break;
    }
  }
  
  timerState.currentStep = newStepIndex;
  updateStepIndicator();
  updateStepButtons();
}

// Attach event listeners to editable spans and inputs
function attachEditableListeners(stepElement: Element): void {
  const editableSpans = stepElement.querySelectorAll(".editable");
  const isRecipeStep = stepElement.classList.contains("recipe-step");

  editableSpans.forEach((span) => {
    // Skip timestamp fields, description, and water fields in recipe steps - they are handled separately in addRecipeStep
    if (span.classList.contains("timestamp-minutes") || span.classList.contains("timestamp-seconds")) {
      return;
    }
    
    // Skip description and water fields in recipe steps - they're handled separately
    const input = span.nextElementSibling as HTMLInputElement | HTMLTextAreaElement;
    if (!input) return;
    
    // Check if this is a description input in a recipe step
    if (isRecipeStep && input.type === "text") {
      return; // Skip description input - handled separately
    }
    
    // Check if this is a water input in a recipe step by checking if it's a number input that's not a time input
    if (isRecipeStep && input.type === "number" && !input.classList.contains("time-input")) {
      return; // Skip water input - handled separately
    }
    
    // For non-recipe-step fields, show icon only if empty
    const value = input.value || "";
    const placeholder = span.getAttribute("data-placeholder") || "";
    if (!value || value === "") {
      span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + placeholder;
    } else {
      span.innerHTML = value;
    }
    input.style.display = "none";

    span.addEventListener("click", () => {
      (span as HTMLElement).style.display = "none";
      input.style.display = "inline";
      input.focus();
    });

    input.addEventListener("blur", () => {
      // Show icon only if empty
      const value = input.value || "";
      const placeholder = span.getAttribute("data-placeholder") || "";
      if (!value || value === "") {
        span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + placeholder;
      } else {
        span.innerHTML = value;
      }
      input.style.display = "none";
      (span as HTMLElement).style.display = "inline";
      // Update URL when recipe step fields are edited
      updateUrlInBrowser();
    });

    // Only add basic keydown handler if not a recipe step (recipe steps get TAB navigation separately)
    if (!isRecipeStep) {
      input.addEventListener("keydown", (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === "Enter") {
          input.blur();
        }
      });
    }
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
      grindSize: (document.getElementById("grind-size") as HTMLInputElement)?.value || "",
      waterTemp: (document.getElementById("water-temp") as HTMLInputElement)?.value || "",
      notes: (document.getElementById("additional-notes") as HTMLTextAreaElement)?.value || "",
    },
    steps: Array.from(document.querySelectorAll(".recipe-step")).map(
      (step) => ({
        water: (step.querySelector('input[type="number"]:not(.time-input)') as HTMLInputElement)?.value || "",
        description: (step.querySelector('input[type="text"]') as HTMLInputElement)?.value || "",
        timestampMinutes: (step.querySelector(".timestamp-minutes") as HTMLInputElement)?.value || "0",
        timestampSeconds: (step.querySelector(".timestamp-seconds") as HTMLInputElement)?.value || "0",
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
  if (updateUrlTimeout !== null) {
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
  const grindSize = (document.getElementById("grind-size") as HTMLInputElement)?.value || "";
  const waterTemp = (document.getElementById("water-temp") as HTMLInputElement)?.value || "";
  const notes = (document.getElementById("additional-notes") as HTMLTextAreaElement)?.value || "";
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
    const water = (step.querySelector('input[type="number"]:not(.time-input)') as HTMLInputElement)?.value || "";
    const description = (step.querySelector('input[type="text"]') as HTMLInputElement)?.value || "";
    const minutes = (step.querySelector(".timestamp-minutes") as HTMLInputElement)?.value || "0";
    const seconds = (step.querySelector(".timestamp-seconds") as HTMLInputElement)?.value || "0";

    markdown += `${minutes}:${seconds.padStart(2, "0")} - ${description}${water ? ` - ${water}g` : ""}\n`;
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
      throw new Error("Failed to decompress recipe data");
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
      const notesTextarea = document.getElementById("additional-notes") as HTMLTextAreaElement;
      const grindSizeSpan = document.getElementById("grind-size-span");
      const waterTempSpan = document.getElementById("water-temp-span");
      const notesSpan = document.getElementById("additional-notes-span");
      
      if (grindSizeInput && recipeData.metadata.grindSize !== undefined && recipeData.metadata.grindSize !== null && recipeData.metadata.grindSize !== "") {
        grindSizeInput.value = recipeData.metadata.grindSize;
        if (grindSizeSpan) {
          grindSizeSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + recipeData.metadata.grindSize;
        }
      }
      if (waterTempInput && recipeData.metadata.waterTemp !== undefined && recipeData.metadata.waterTemp !== null && recipeData.metadata.waterTemp !== "") {
        waterTempInput.value = recipeData.metadata.waterTemp;
        if (waterTempSpan) {
          waterTempSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + recipeData.metadata.waterTemp;
        }
      }
      if (notesTextarea && recipeData.metadata.notes !== undefined && recipeData.metadata.notes !== null) {
        notesTextarea.value = recipeData.metadata.notes;
        if (notesSpan) {
          // Show notes if present, otherwise show placeholder (matches blur handler logic)
          notesSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + (recipeData.metadata.notes || notesSpan.getAttribute("data-placeholder") || "");
        }
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
  if (waterSpan) (waterSpan as HTMLElement).style.display = "inline";
  removeCalculatedIndicator("water"); // Remove calculated indicator when user edits
  if (waterInput.value !== "") {
    updateLastTouched("water");
  }
  updateUrlInBrowser();
});

waterInput.addEventListener("keydown", (event: Event) => {
  const keyboardEvent = event as KeyboardEvent;
  if (keyboardEvent.key === "Enter") {
    waterInput.blur();
  } else if (keyboardEvent.key === "Tab" && !keyboardEvent.shiftKey) {
    // Move to coffee input
    event.preventDefault();
    coffeeInput.style.display = "inline";
    if (coffeeSpan) (coffeeSpan as HTMLElement).style.display = "none";
    coffeeInput.focus();
  }
});

coffeeInput.addEventListener("blur", () => {
  updateCalculatorSpanDisplay("coffee", coffeeInput.value);
  coffeeInput.style.display = "none";
  if (coffeeSpan) (coffeeSpan as HTMLElement).style.display = "inline";
  removeCalculatedIndicator("coffee"); // Remove calculated indicator when user edits
  if (coffeeInput.value !== "") {
    updateLastTouched("coffee");
  }
  updateUrlInBrowser();
});

coffeeInput.addEventListener("keydown", (event: Event) => {
  const keyboardEvent = event as KeyboardEvent;
  if (keyboardEvent.key === "Enter") {
    coffeeInput.blur();
  } else if (keyboardEvent.key === "Tab" && !keyboardEvent.shiftKey) {
    // Move to ratio select
    event.preventDefault();
    ratioSelect.style.display = "inline";
    if (ratioSpan) (ratioSpan as HTMLElement).style.display = "none";
    ratioSelect.focus();
  }
});

ratioSelect.addEventListener("change", () => {
  updateCalculatorSpanDisplay("ratio", ratioSelect.value);
  ratioSelect.style.display = "none";
  if (ratioSpan) (ratioSpan as HTMLElement).style.display = "inline";
  removeCalculatedIndicator("ratio"); // Remove calculated indicator when user edits
  if (ratioSelect.value !== "") {
    updateLastTouched("ratio");
  }
  updateUrlInBrowser();
});

ratioSelect.addEventListener("blur", () => {
  ratioSelect.style.display = "none";
  if (ratioSpan) (ratioSpan as HTMLElement).style.display = "inline";
});

ratioSelect.addEventListener("keydown", (event: Event) => {
  const keyboardEvent = event as KeyboardEvent;
  if (keyboardEvent.key === "Tab" && !keyboardEvent.shiftKey) {
    // Move to grind-size input
    event.preventDefault();
    const grindSizeInput = document.getElementById("grind-size") as HTMLInputElement;
    const grindSizeSpan = document.getElementById("grind-size-span");
    if (grindSizeInput && grindSizeSpan) {
      (grindSizeSpan as HTMLElement).style.display = "none";
      grindSizeInput.style.display = "inline";
      grindSizeInput.focus();
    }
  }
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
    const input = span.nextElementSibling as HTMLInputElement | HTMLTextAreaElement;
    if (!input) return;
    
    // Skip calculator fields - they will be handled separately
    if ((span as HTMLElement).id === "water-span" || (span as HTMLElement).id === "coffee-span" || (span as HTMLElement).id === "ratio-span") {
      return;
    }
    span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + (input.value || span.getAttribute("data-placeholder"));
    input.style.display = "none";

    span.addEventListener("click", () => {
      (span as HTMLElement).style.display = "none";
      input.style.display = "inline";
      input.focus();
    });

    input.addEventListener("blur", () => {
      span.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ' + (input.value || span.getAttribute("data-placeholder"));
      input.style.display = "none";
      (span as HTMLElement).style.display = "inline";
      // Update URL for metadata fields
      if (input.id === "grind-size" || input.id === "water-temp" || input.id === "additional-notes") {
        updateUrlInBrowser();
      }
    });

    input.addEventListener("keydown", (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Enter") {
        input.blur();
      } else if (keyboardEvent.key === "Tab" && !keyboardEvent.shiftKey) {
        // Handle TAB navigation for metadata fields
        event.preventDefault();
        
        if (input.id === "grind-size") {
          // Move to water-temp
          const waterTempInput = document.getElementById("water-temp") as HTMLInputElement;
          const waterTempSpan = document.getElementById("water-temp-span");
          if (waterTempInput && waterTempSpan) {
            (waterTempSpan as HTMLElement).style.display = "none";
            waterTempInput.style.display = "inline";
            waterTempInput.focus();
          }
        } else if (input.id === "water-temp") {
          // Move to notes
          const notesInput = document.getElementById("additional-notes") as HTMLTextAreaElement;
          const notesSpan = document.getElementById("additional-notes-span");
          if (notesInput && notesSpan) {
            (notesSpan as HTMLElement).style.display = "none";
            notesInput.style.display = "inline";
            notesInput.focus();
          }
        } else if (input.id === "additional-notes") {
          // Move to first recipe step water input (if exists)
          const firstStep = document.querySelector('.recipe-step');
          if (firstStep) {
            const firstStepWater = firstStep.querySelector('input[type="number"]:not(.time-input)') as HTMLInputElement;
            if (firstStepWater) {
              const firstStepWaterSpan = firstStepWater.previousElementSibling as HTMLElement;
              if (firstStepWaterSpan && firstStepWaterSpan.classList.contains("editable")) {
                firstStepWaterSpan.style.display = "none";
                firstStepWater.style.display = "inline";
              }
              firstStepWater.focus();
            }
          }
          // Otherwise let default tab behavior continue
        }
      }
    });
  });

  // Initialize calculator spans and add click handlers
  if (waterSpan) {
    waterSpan.addEventListener("click", () => {
      waterSpan.style.display = "none";
      waterInput.style.display = "inline";
      waterInput.focus();
    });
  }
  
  if (coffeeSpan) {
    coffeeSpan.addEventListener("click", () => {
      coffeeSpan.style.display = "none";
      coffeeInput.style.display = "inline";
      coffeeInput.focus();
    });
  }
  
  if (ratioSpan) {
    ratioSpan.addEventListener("click", () => {
      ratioSpan.style.display = "none";
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
  const resetBtn = document.getElementById("reset-button");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllInputs);
  }
});
