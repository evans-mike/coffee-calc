// Get DOM elements
const waterInput = document.getElementById('water');
const coffeeInput = document.getElementById('coffee');
const ratioSelect = document.getElementById('ratio');

// Track the order of updates (ratio starts as most recently updated due to default)
let lastUpdated = ['ratio'];

// Populate ratio options (1:1 to 100:1) with 16:1 as default
function populateRatioOptions() {
    const defaultRatio = 16;
    
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
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
    lastUpdated = lastUpdated.filter(item => item !== inputType);
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
    const toCalculate = ['water', 'coffee', 'ratio'].find(
        item => !lastUpdated.includes(item)
    );

    switch (toCalculate) {
        case 'water':
            if (!isNaN(coffee) && !isNaN(ratio)) {
                const calculatedWater = coffee * ratio;
                waterInput.value = calculatedWater.toFixed(0);
            }
            break;
        case 'coffee':
            if (!isNaN(water) && !isNaN(ratio)) {
                const calculatedCoffee = water / ratio;
                coffeeInput.value = calculatedCoffee.toFixed(1);
            }
            break;
        case 'ratio':
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
waterInput.addEventListener('blur', () => {
    if (waterInput.value !== '') {
        updateLastTouched('water');
    }
});

coffeeInput.addEventListener('blur', () => {
    if (coffeeInput.value !== '') {
        updateLastTouched('coffee');
    }
});

ratioSelect.addEventListener('change', () => {
    if (ratioSelect.value !== '') {
        updateLastTouched('ratio');
    }
});

// Recipe Steps functionality
document.getElementById('add-step').addEventListener('click', addRecipeStep);

function addRecipeStep() {
    const stepsContainer = document.getElementById('recipe-steps');
    const stepNumber = stepsContainer.children.length + 1;
    
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
    
    // Step description input
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.placeholder = 'Step description';
    
    // Time input (MM:SS)
    const timeInput = document.createElement('input');
    timeInput.type = 'text';
    timeInput.className = 'time-input';
    timeInput.placeholder = 'MM:SS';
    timeInput.pattern = '^[0-9]{1,2}:[0-9]{2}$';
    
    // Add time input formatting
    timeInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) {
            value = value.slice(0, 2) + ':' + value.slice(2);
        }
        e.target.value = value;
    });
    
    // Remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-step';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => stepElement.remove());
    
    // Add all elements to the step
    stepElement.appendChild(waterInput);
    stepElement.appendChild(descriptionInput);
    stepElement.appendChild(timeInput);
    stepElement.appendChild(removeButton);
    
    stepsContainer.appendChild(stepElement);
}