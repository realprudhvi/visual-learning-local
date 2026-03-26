import { state } from '../state.js';
import { renderTree } from './tree.js';

export function initHeap(vals, type) {
    // Build heap from input array
    state.dsData = [...vals];
    // Heapify entire array
    for (let i = Math.floor(state.dsData.length / 2) - 1; i >= 0; i--) {
        heapifyDown(state.dsData, i, state.dsData.length, type);
    }
    renderHeap(state.dsData);
}

function renderHeap(vals) {
    if (vals.length === 0) {
        state.dom.stage.innerHTML = '';
        state.dom.svgLayer.innerHTML = '';
        return;
    }
    // Convert array to tree nodes for renderTree
    const nodes = vals.map(v => ({ id: crypto.randomUUID(), val: v, left: null, right: null }));
    for (let i = 0; i < nodes.length; i++) {
        let leftIdx = 2 * i + 1;
        let rightIdx = 2 * i + 2;
        if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
        if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
    }

    // Clear stage before re-rendering
    state.dom.stage.innerHTML = '';
    const defs = state.dom.svgLayer.querySelector('defs');
    state.dom.svgLayer.innerHTML = '';
    if (defs) state.dom.svgLayer.appendChild(defs);

    renderTree(nodes[0]);
}

export function insertHeap(val) {
    const type = state.currentMode;
    state.dsData.push(val);
    heapifyUp(state.dsData, state.dsData.length - 1, type);
    renderHeap(state.dsData);
}

export function extractHeap() {
    const type = state.currentMode;
    if (state.dsData.length === 0) {
        alert("Heap is empty!");
        return;
    }
    // Swap root with last
    const last = state.dsData.pop();
    if (state.dsData.length > 0) {
        state.dsData[0] = last;
        heapifyDown(state.dsData, 0, state.dsData.length, type);
    }
    renderHeap(state.dsData);
}

export function peekHeap() {
    if (state.dsData.length === 0) {
        alert("Heap is empty!");
        return;
    }
    // Root is always at index 0
    // Visual feedback: find the root node (first node rendered usually?)
    // renderTree renders nodes with IDs. We can just highlight the Node at index 0
    // But since renderTree is generic, we can try to find the Root div.
    // Usually renderTree appends root first? Or by position. 
    // Actually, distinct IDs are generated each render in `initHeap`/`renderHeap` here (crypto.randomUUID).
    // So finding the exact DOM element is tricky unless we tracked IDs.
    // However, the root is always top-most.

    // Simple hack: highlight the highest node (smallest 'top' value)
    const nodes = Array.from(state.dom.stage.querySelectorAll('.node-wrapper'));
    if (nodes.length > 0) {
        // Sort by top position
        nodes.sort((a, b) => parseFloat(a.style.top) - parseFloat(b.style.top));
        const rootNode = nodes[0].querySelector('.circle-node');
        if (rootNode) {
            rootNode.style.backgroundColor = '#ec4899';
            rootNode.style.transform = 'scale(1.1)';
            setTimeout(() => {
                rootNode.style.backgroundColor = '';
                rootNode.style.transform = '';
            }, 1000);
        }
    }
}

// Helpers
function heapifyUp(arr, idx, type) {
    if (idx === 0) return;
    const parentIdx = Math.floor((idx - 1) / 2);
    if (compare(arr[idx], arr[parentIdx], type)) {
        [arr[idx], arr[parentIdx]] = [arr[parentIdx], arr[idx]];
        heapifyUp(arr, parentIdx, type);
    }
}

function heapifyDown(arr, idx, len, type) {
    let largest = idx;
    const left = 2 * idx + 1;
    const right = 2 * idx + 2;

    if (left < len && compare(arr[left], arr[largest], type)) {
        largest = left;
    }
    if (right < len && compare(arr[right], arr[largest], type)) {
        largest = right;
    }

    if (largest !== idx) {
        [arr[idx], arr[largest]] = [arr[largest], arr[idx]];
        heapifyDown(arr, largest, len, type);
    }
}

function compare(a, b, type) {
    if (type === 'minheap') return a < b; // Child < Parent ?
    return a > b; // Child > Parent (MaxHeap) ?
}
