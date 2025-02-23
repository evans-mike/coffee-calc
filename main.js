// Get DOM elements
const waterInput = document.getElementById('water');
const coffeeInput = document.getElementById('coffee');
const ratioSelect = document.getElementById('ratio');

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

function calculateMissingValue() {
    const water = parseFloat(waterInput.value);
    const coffee = parseFloat(coffeeInput.value);
    const ratio = parseInt(ratioSelect.value);

    // Calculate coffee if water and ratio are provided
    if (!isNaN(water) && !isNaN(ratio) && (isNaN(coffee) || coffeeInput.value === '')) {
        const calculatedCoffee = water / ratio;
        coffeeInput.value = calculatedCoffee.toFixed(1);
    }
    // Calculate water if coffee and ratio are provided
    else if (!isNaN(coffee) && !isNaN(ratio) && (isNaN(water) || waterInput.value === '')) {
        const calculatedWater = coffee * ratio;
        waterInput.value = calculatedWater.toFixed(0);
    }
    // Calculate ratio if water and coffee are provided
    else if (!isNaN(water) && !isNaN(coffee) && (isNaN(ratio) || ratioSelect.value === '')) {
        const calculatedRatio = Math.round(water / coffee);
        if (calculatedRatio >= 1 && calculatedRatio <= 100) {
            ratioSelect.value = calculatedRatio;
        }
    }
}

// Add event listeners - changed from 'input' to 'blur'
waterInput.addEventListener('blur', calculateMissingValue);
coffeeInput.addEventListener('blur', calculateMissingValue);
// Keep 'change' for select as it makes more sense for dropdowns
ratioSelect.addEventListener('change', calculateMissingValue);