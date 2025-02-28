// Global state variables
let lastUpdated = ["ratio"]; // Track the order of updates

// Timer State Management
const timerState = {
  isRunning: false,
  currentTime: 0,
  currentStep: 0,
  steps: [], // Will contain {duration: number, description: string}
  intervalId: null,
};

// Get DOM elements
const waterInput = document.getElementById("water");
const coffeeInput = document.getElementById("coffee");
const ratioSelect = document.getElementById("ratio");

// Timer Control Elements
const playPauseBtn = document.getElementById("play-pause");
const prevStepBtn = document.getElementById("prev-step");
const nextStepBtn = document.getElementById("next-step");
const resetTimerBtn = document.getElementById("reset-timer");
const currentTimerDisplay = document.getElementById("current-timer");
const stepIndicator = document.getElementById("step-indicator");

// Debug logging function
function logTimerState(action) {
  console.log(`Timer Action: ${action}`);
  console.log("Timer State:", {
    isRunning: timerState.isRunning,
    currentTime: timerState.currentTime,
    currentStep: timerState.currentStep,
    totalSteps: timerState.steps.length,
    steps: timerState.steps,
  });
}

// Populate ratio options (1:1 to 100:1) with 16:1 as default
function populateRatioOptions() {
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
}

// Calculator functions
function updateLastTouched(inputType) {
  lastUpdated = lastUpdated.filter((item) => item !== inputType);
  lastUpdated.push(inputType);
  if (lastUpdated.length > 2) {
    lastUpdated.shift();
  }
  calculateBasedOnLastUpdates();
}

function calculateBasedOnLastUpdates() {
  const water = parseFloat(waterInput.value);
  const coffee = parseFloat(coffeeInput.value);
  const ratio = parseInt(ratioSelect.value);

  if (lastUpdated.length < 2) return;

  const toCalculate = ["water", "coffee", "ratio"].find(
    (item) => !lastUpdated.includes(item)
  );

  switch (toCalculate) {
    case "water":
      if (!isNaN(coffee) && !isNaN(ratio)) {
        waterInput.value = (coffee * ratio).toFixed(0);
      }
      break;
    case "coffee":
      if (!isNaN(water) && !isNaN(ratio)) {
        coffeeInput.value = (water / ratio).toFixed(1);
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

// Timer functions
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function updateStepIndicator() {
  if (timerState.steps.length === 0) {
    stepIndicator.textContent = "No steps added";
    return;
  }
  stepIndicator.textContent = `Step ${timerState.currentStep + 1} of ${
    timerState.steps.length
  }`;
}

function togglePlayPause() {
  console.log("togglePlayPause called");

  if (timerState.steps.length === 0) {
    console.log("No steps available to start timer");
    return;
  }

  if (timerState.isRunning) {
    console.log("Pausing timer");
    clearInterval(timerState.intervalId);
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
          clearInterval(timerState.intervalId);
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

function updateStepButtons() {
  console.log("Updating step buttons");
  prevStepBtn.disabled = timerState.currentStep === 0;
  nextStepBtn.disabled = timerState.currentStep === timerState.steps.length - 1;
}

function previousStep() {
  console.log("Previous step called");
  if (timerState.currentStep > 0) {
    if (timerState.isRunning) {
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

function nextStep() {
  console.log("Next step called");
  if (timerState.currentStep < timerState.steps.length - 1) {
    if (timerState.isRunning) {
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

function resetTimer() {
  console.log("Reset timer called");
  clearInterval(timerState.intervalId);
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

function parseStepDuration(minutesInput, secondsInput) {
  const minutes = parseInt(minutesInput.value || "0");
  const seconds = parseInt(secondsInput.value || "0");
  const totalSeconds = minutes * 60 + seconds;
  console.log("Parsed step duration:", { minutes, seconds, totalSeconds });
  return totalSeconds;
}

// Recipe step functions
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

  // Time container
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

  // Add time change listeners
  const updateTimerState = () => {
    const duration = parseStepDuration(minutesInput, secondsInput);
    const stepIndex = Array.from(stepsContainer.children).indexOf(stepElement);
    if (stepIndex !== -1 && stepIndex < timerState.steps.length) {
      timerState.steps[stepIndex].duration = duration;
      if (stepIndex === timerState.currentStep && !timerState.isRunning) {
        timerState.currentTime = duration;
        currentTimerDisplay.textContent = formatTime(duration);
      }
      console.log("Updated step duration:", { stepIndex, duration });
    }
  };

  minutesInput.addEventListener("change", updateTimerState);
  secondsInput.addEventListener("change", updateTimerState);
  descriptionInput.addEventListener("change", () => {
    const stepIndex = Array.from(stepsContainer.children).indexOf(stepElement);
    if (stepIndex !== -1 && stepIndex < timerState.steps.length) {
      timerState.steps[stepIndex].description = descriptionInput.value;
    }
  });

  // Assemble time container
  timeContainer.appendChild(minutesInput);
  timeContainer.appendChild(timeSeparator);
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
  });

  // Assemble step
  stepElement.appendChild(waterInput);
  stepElement.appendChild(descriptionInput);
  stepElement.appendChild(timeContainer);
  stepElement.appendChild(removeButton);

  stepsContainer.appendChild(stepElement);

  // Add to timer state
  const duration = parseStepDuration(minutesInput, secondsInput);
  const description =
    descriptionInput.value || `Step ${timerState.steps.length + 1}`;
  timerState.steps.push({ duration, description });

  if (timerState.steps.length === 1) {
    timerState.currentTime = duration;
    currentTimerDisplay.textContent = formatTime(duration);
  }

  updateStepIndicator();
  updateStepButtons();
  logTimerState("Add Step");
}

// Theme handling
function initTheme() {
  const toggleSwitch = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    toggleSwitch.checked = savedTheme === "dark";
  } else if (prefersDark) {
    document.documentElement.setAttribute("data-theme", "dark");
    toggleSwitch.checked = true;
  }

  toggleSwitch.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });
}

// URL sharing and loading
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
        minutes: step.querySelector(".minutes").value || "0",
        seconds: step.querySelector(".seconds").value || "0",
      })
    ),
  };

  const jsonString = JSON.stringify(recipeData);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  return (
    window.location.origin + window.location.pathname + "?data=" + compressed
  );
}

function generateRecipeMarkdown() {
  const water = waterInput.value;
  const coffee = coffeeInput.value;
  const ratio = ratioSelect.value;
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
    if (navigator.share && window.isSecureContext) {
      navigator
        .share({
          title: "Coffee Calc",
          text: "Check out this coffee ratio calculator!",
          url: baseUrl,
        })
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

  const shareableUrl = buildUrlWithValues();
  const recipeText = generateRecipeMarkdown();

  if (navigator.share && window.isSecureContext) {
    navigator
      .share({
        title: "Coffee Recipe",
        text: recipeText,
        url: shareableUrl,
      })
      .catch((error) => {
        console.log("Share failed:", error);
        fallbackToClipboard(shareableUrl, recipeText);
      });
  } else {
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

function loadSharedRecipe() {
  const urlParams = new URLSearchParams(window.location.search);
  const compressedData = urlParams.get("data");

  if (!compressedData) return;

  try {
    const jsonString =
      LZString.decompressFromEncodedURIComponent(compressedData);
    const recipeData = JSON.parse(jsonString);

    // Set calculator values
    if (recipeData.calculator) {
      if (recipeData.calculator.water)
        waterInput.value = recipeData.calculator.water;
      if (recipeData.calculator.coffee)
        coffeeInput.value = recipeData.calculator.coffee;
      if (recipeData.calculator.ratio)
        ratioSelect.value = recipeData.calculator.ratio;
    }

    // Set metadata values
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

// Event listeners for calculator
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

// Add event listeners for timer controls
playPauseBtn.addEventListener("click", togglePlayPause);
prevStepBtn.addEventListener("click", previousStep);
nextStepBtn.addEventListener("click", nextStep);
resetTimerBtn.addEventListener("click", resetTimer);

// Add event listener for add step button
document
  .getElementById("add-step")
  .addEventListener("click", () => addRecipeStep());

// Add event listener for share button
document.getElementById("shareBtn").addEventListener("click", shareRecipe);

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  populateRatioOptions();
  loadSharedRecipe();
  initTheme();
  updateStepIndicator();
  updateStepButtons();
});
