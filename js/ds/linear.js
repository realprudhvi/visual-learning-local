import { state } from '../state.js';

export function renderArray(vals) {
    const stage = state.dom.stage;
    const existing = stage.querySelector('.array-container');
    if (existing) stage.removeChild(existing);

    const cont = document.createElement('div');
    cont.className = 'array-container';
    vals.forEach((v, i) => {
        cont.innerHTML += `
            <div class="array-cell">
                <div class="array-box">${v}</div>
                <div class="array-idx">${i}</div>
            </div>`;
    });
    stage.appendChild(cont);
}

export function insertArray(idx, val) {
    if (state.currentMode !== 'array') return;
    state.dsData.splice(idx, 0, val);
    renderArray(state.dsData);
}

export function updateArray(idx, val) {
    if (state.currentMode !== 'array') return;
    if (idx < 0 || idx >= state.dsData.length) return;
    state.dsData[idx] = val;
    renderArray(state.dsData);
}

export function deleteArray(idx) {
    if (state.currentMode !== 'array') return;
    if (idx < 0 || idx >= state.dsData.length) return;
    state.dsData.splice(idx, 1);
    renderArray(state.dsData);
}

export function searchArray(val) {
    if (state.currentMode !== 'array') return;
    if (state.dsData.length === 0) return;

    // Reset any previous step state
    resetStepController();

    // Store search target
    state.stepController.searchTarget = val;

    // Generate steps: each step represents checking index i
    // Step 0: initial state (nothing highlighted)
    // Step 1 to N: checking each element
    // Final step: show result (found or not found)

    const steps = [];

    // Initial step - show starting state
    steps.push({ type: 'init', index: -1 });

    // Steps for each element check
    for (let i = 0; i < state.dsData.length; i++) {
        steps.push({ type: 'check', index: i });
        if (state.dsData[i] === val) {
            steps.push({ type: 'found', index: i });
            break;
        }
    }

    // If last step isn't 'found', add 'not-found' step
    if (steps[steps.length - 1].type !== 'found') {
        steps.push({ type: 'not-found', index: -1 });
    }

    state.stepController.steps = steps;
    state.stepController.currentStep = 0;
    state.stepController.isActive = true;

    // Show step controls
    state.dom.stepControls.classList.remove('hidden');

    // Render initial step
    renderArrayStep();
    updateStepButtons();
}

export function renderArrayStep() {
    const { steps, currentStep, searchTarget } = state.stepController;
    if (!steps.length) return;

    const step = steps[currentStep];
    const cells = state.dom.stage.querySelectorAll('.array-box');

    // Reset all cells first
    cells.forEach(cell => {
        cell.style.borderColor = '';
        cell.style.backgroundColor = '';
        cell.style.transform = '';
    });

    if (step.type === 'init') {
        // Initial state - nothing highlighted
        state.dom.stepIndicator.innerText = `Ready to search for ${searchTarget}`;
    } else if (step.type === 'check') {
        // Highlight current being checked
        if (cells[step.index]) {
            cells[step.index].style.borderColor = '#3b82f6'; // Blue border
            cells[step.index].style.transform = 'scale(1.05)';
        }
        // Also show previously checked cells as dimmed
        for (let i = 0; i < step.index; i++) {
            if (cells[i]) {
                cells[i].style.borderColor = 'rgba(100, 116, 139, 0.5)';
            }
        }
        state.dom.stepIndicator.innerText = `Checking index ${step.index}`;
    } else if (step.type === 'found') {
        // Found - highlight with success
        if (cells[step.index]) {
            cells[step.index].style.backgroundColor = '#10b981'; // Green
            cells[step.index].style.transform = 'scale(1.15)';
            cells[step.index].style.borderColor = '#34d399';
        }
        state.dom.stepIndicator.innerText = `Found at index ${step.index}!`;
    } else if (step.type === 'not-found') {
        // Not found - show all as checked
        cells.forEach(cell => {
            cell.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        });
        state.dom.stepIndicator.innerText = `Value ${searchTarget} not found`;
    }
}

export function nextStep() {
    if (!state.stepController.isActive) return;
    if (state.stepController.currentStep >= state.stepController.steps.length - 1) return;

    state.stepController.currentStep++;
    renderArrayStep();
    updateStepButtons();
}

export function prevStep() {
    if (!state.stepController.isActive) return;
    if (state.stepController.currentStep <= 0) return;

    state.stepController.currentStep--;
    renderArrayStep();
    updateStepButtons();
}

export function updateStepButtons() {
    const { steps, currentStep } = state.stepController;

    state.dom.btnPrevStep.disabled = currentStep <= 0;
    state.dom.btnNextStep.disabled = currentStep >= steps.length - 1;
}

export function resetStepController() {
    state.stepController.steps = [];
    state.stepController.currentStep = 0;
    state.stepController.isActive = false;
    state.stepController.searchTarget = null;

    // Hide step controls
    if (state.dom.stepControls) {
        state.dom.stepControls.classList.add('hidden');
    }

    // Reset array cell styles
    const cells = state.dom.stage.querySelectorAll('.array-box');
    cells.forEach(cell => {
        cell.style.borderColor = '';
        cell.style.backgroundColor = '';
        cell.style.transform = '';
    });
}

export function renderStack(vals, container = state.dom.stage, isEmbedded = false) {
    // Remove existing stack container if any
    const existing = container.querySelector('.stack-container');
    if (existing) container.removeChild(existing);

    const cont = document.createElement('div');
    cont.className = 'stack-container' + (isEmbedded ? ' embedded' : '');

    // Force inline style reset for embedded to ensure no absolute positioning override issues
    if (isEmbedded) {
        cont.style.position = 'static';
        cont.style.transform = 'none';
        cont.style.margin = '5px 0';
    }

    vals.forEach(v => {
        cont.innerHTML += `<div class="stack-item">${v}</div>`;
    });
    container.appendChild(cont);
}

export function pushToStack(val) {
    if (state.currentMode !== 'stack') return;
    state.dsData.push(val);
    renderStack(state.dsData);
}

export function popFromStack() {
    if (state.currentMode !== 'stack') return;
    if (state.dsData.length === 0) {
        alert("Stack is empty!");
        return;
    }
    state.dsData.pop();
    renderStack(state.dsData);
}

export function peekStack() {
    if (state.currentMode !== 'stack') return;
    if (state.dsData.length === 0) {
        alert("Stack is empty!");
        return;
    }
    const val = state.dsData[state.dsData.length - 1];

    // Visual feedback
    const items = state.dom.stage.querySelectorAll('.stack-item');
    if (items.length > 0) {
        const topItem = items[items.length - 1];
        topItem.style.backgroundColor = '#ec4899'; // Pink/Highlight
        topItem.style.transform = 'scale(1.1)';
        setTimeout(() => {
            topItem.style.backgroundColor = '';
            topItem.style.transform = '';
        }, 1000);
    }

    // Optional: Log to chat if we want text feedback too
    // console.log("Peek:", val);
}

export function renderQueue(vals, container = state.dom.stage, isEmbedded = false) {
    const existing = container.querySelector('.queue-container');
    if (existing) container.removeChild(existing);

    const cont = document.createElement('div');
    cont.className = 'queue-container' + (isEmbedded ? ' embedded' : '');

    // Force inline style reset for embedded to ensure no absolute positioning override issues
    if (isEmbedded) {
        cont.style.position = 'static';
        cont.style.transform = 'none';
        cont.style.margin = '5px 0';
    }

    vals.forEach(v => {
        cont.innerHTML += `<div class="queue-item">${v}</div>`;
    });
    container.appendChild(cont);
}

export function enqueueToQueue(val) {
    if (state.currentMode !== 'queue') return;
    state.dsData.push(val);
    renderQueue(state.dsData);
}

export function dequeueFromQueue() {
    if (state.currentMode !== 'queue') return;
    if (state.dsData.length === 0) {
        alert("Queue is empty!");
        return;
    }
    state.dsData.shift();
    renderQueue(state.dsData);
}

export function peekQueue() {
    if (state.currentMode !== 'queue') return;
    if (state.dsData.length === 0) {
        alert("Queue is empty!");
        return;
    }

    // Visual feedback - First item is front of queue
    const items = state.dom.stage.querySelectorAll('.queue-item');
    if (items.length > 0) {
        const frontItem = items[0];
        frontItem.style.backgroundColor = '#ec4899'; // Pink/Highlight
        frontItem.style.transform = 'scale(1.1)';
        setTimeout(() => {
            frontItem.style.backgroundColor = '';
            frontItem.style.transform = '';
        }, 1000);
    }
}
