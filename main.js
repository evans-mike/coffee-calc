// Get DOM elements
const waterInput = document.getElementById('water');
const coffeeInput = document.getElementById('coffee');
const ratioSelect = document.getElementById('ratio');
const resultDiv = document.getElementById('result');

function calculateMissingValue() {
    const water = parseFloat(waterInput.value);
    const coffee = parseFloat(coffeeInput.value);
    const ratio = parseInt(ratioSelect.value);

    // Clear previous result
    resultDiv.textContent = '';

    // Case 1: Calculate coffee from water and ratio
    if (!isNaN(water) && !isNaN(ratio) && coffeeInput.value === '') {
        const calculatedCoffee = water / ratio;
        coffeeInput.value = calculatedCoffee.toFixed(1);
        resultDiv.textContent = `${water}g water ÷ ${ratio}:1 ratio = ${calculatedCoffee.toFixed(1)}g coffee`;
    }
    // Case 2: Calculate water from coffee and ratio
    else if (!isNaN(coffee) && !isNaN(ratio) && waterInput.value === '') {
        const calculatedWater = coffee * ratio;
        waterInput.value = calculatedWater.toFixed(0);
        resultDiv.textContent = `${coffee}g coffee × ${ratio}:1 ratio = ${calculatedWater.toFixed(0)}g water`;
    }
    // Case 3: Calculate ratio from water and coffee
    else if (!isNaN(water) && !isNaN(coffee) && ratioSelect.value === '') {
        const calculatedRatio = Math.round(water / coffee);
        if (calculatedRatio >= 14 && calculatedRatio <= 18) {
            ratioSelect.value = calculatedRatio;
            resultDiv.textContent = `${water}g water ÷ ${coffee}g coffee = ${calculatedRatio}:1 ratio`;
        } else {
            resultDiv.textContent = 'Calculated ratio is outside the supported range (14:1 to 18:1)';
        }
    }
}

// Add event listeners
waterInput.addEventListener('input', function() {
    if (this.value === '') {
        resultDiv.textContent = '';
    } else {
        calculateMissingValue();
    }
});

coffeeInput.addEventListener('input', function() {
    if (this.value === '') {
        resultDiv.textContent = '';
    } else {
        calculateMissingValue();
    }
});

ratioSelect.addEventListener('change', calculateMissingValue);