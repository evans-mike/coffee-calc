// Original calculator code remains the same at the top...

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