
import { state } from '../state.js';
import { drawLine } from '../utils.js';

// Constants
const INITIAL_BUCKETS = 7;

// Internal State
let hashTable = {
    buckets: [],
    size: 0,
    capacity: INITIAL_BUCKETS,
    mode: 'hashmap', // hashmap, hashset, linkedhashmap
    // LinkedHashMap specific
    head: null,
    tail: null
};

// TreeMap State
let treeMapRoot = null;

export function initHash(vals, mode) {
    state.currentMode = mode;

    // Reset Internal State
    if (mode === 'treemap') {
        treeMapRoot = null;
        // If vals provided, insert them
        // vals are expected to be numbers for simple initialization
        // For maps, maybe we just use val as key and value?
        vals.forEach(v => putTreeMap(v, v)); // Default key=val
        renderTreeMap();
    } else {
        hashTable = {
            buckets: Array(INITIAL_BUCKETS).fill(null).map(() => []),
            size: 0,
            capacity: INITIAL_BUCKETS,
            mode: mode,
            head: null,
            tail: null
        };

        vals.forEach(v => putHash(v, v));
        renderHash();
    }
}

export function putHash(key, value) {
    if (state.currentMode === 'treemap') {
        putTreeMap(key, value);
        return;
    }

    const { buckets, mode } = hashTable;
    const bucketIdx = hash(key, hashTable.capacity);
    const bucket = buckets[bucketIdx];

    // Check if key exists
    let existing = bucket.find(item => item.key === key);

    if (existing) {
        existing.value = value;
        // If LinkedHashMap, moving to end? usually access order vs insertion order. 
        // Standard LinkedHashMap maintains insertion order, so update doesn't change order.
    } else {
        const newNode = { key, value, id: crypto.randomUUID() };
        bucket.push(newNode);
        hashTable.size++;

        // LinkedHashMap Logic
        if (mode === 'linkedhashmap') {
            if (!hashTable.tail) {
                hashTable.head = newNode;
                hashTable.tail = newNode;
            } else {
                hashTable.tail.next = newNode;
                newNode.prev = hashTable.tail;
                hashTable.tail = newNode;
            }
        }
    }

    renderHash();
    updateHashInfo();
}

export function getHash(key) {
    if (state.currentMode === 'treemap') {
        // Highlight logic for TreeMap?
        // Reuse searchBST logic?
        return;
    }

    const bucketIdx = hash(key, hashTable.capacity);
    const bucket = hashTable.buckets[bucketIdx];
    const item = bucket.find(i => i.key === key);

    // Visual feedback
    highlightBucket(bucketIdx, item ? '#10b981' : '#ef4444');
    if (item) highlightNode(item.id, '#10b981');
}

export function removeHash(key) {
    if (state.currentMode === 'treemap') {
        removeTreeMap(key);
        return;
    }

    const idx = hash(key, hashTable.capacity);
    const bucket = hashTable.buckets[idx];
    const itemIdx = bucket.findIndex(i => i.key === key);

    if (itemIdx !== -1) {
        const item = bucket[itemIdx];
        bucket.splice(itemIdx, 1);
        hashTable.size--;

        // LinkedHashMap Logic
        if (hashTable.mode === 'linkedhashmap') {
            if (item.prev) item.prev.next = item.next;
            if (item.next) item.next.prev = item.prev;
            if (item === hashTable.head) hashTable.head = item.next;
            if (item === hashTable.tail) hashTable.tail = item.prev;
        }
    }

    renderHash();
    updateHashInfo();
}

export function clearHash() {
    initHash([], state.currentMode);
}

// --- TreeMap Logic (Simplified BST) ---
function putTreeMap(key, value) {
    const Node = (k, v) => ({ id: crypto.randomUUID(), key: k, value: v, left: null, right: null });

    // Convert key to number for proper numeric comparison
    const numKey = Number(key);

    if (!treeMapRoot) {
        treeMapRoot = Node(numKey, value);
    } else {
        let curr = treeMapRoot;
        while (true) {
            if (numKey === curr.key) {
                curr.value = value;
                break;
            } else if (numKey < curr.key) {
                if (!curr.left) { curr.left = Node(numKey, value); break; }
                curr = curr.left;
            } else {
                if (!curr.right) { curr.right = Node(numKey, value); break; }
                curr = curr.right;
            }
        }
    }
    renderTreeMap();
}

function removeTreeMap(key) {
    // Standard BST deletion
    treeMapRoot = deleteNode(treeMapRoot, key);
    renderTreeMap();
}

function deleteNode(root, key) {
    if (!root) return null;
    const numKey = Number(key);
    if (numKey < root.key) {
        root.left = deleteNode(root.left, numKey);
    } else if (numKey > root.key) {
        root.right = deleteNode(root.right, numKey);
    } else {
        // Found
        if (!root.left) return root.right;
        if (!root.right) return root.left;

        let min = root.right;
        while (min.left) min = min.left;
        root.key = min.key;
        root.value = min.value;
        root.right = deleteNode(root.right, min.key);
    }
    return root;
}

// --- Rendering ---

function hash(key, capacity) {
    let strKey = String(key);
    let hashVal = 0;
    for (let i = 0; i < strKey.length; i++) {
        hashVal = (hashVal << 5) - hashVal + strKey.charCodeAt(i);
        hashVal |= 0; // Convert to 32bit integer
    }
    return Math.abs(hashVal) % capacity;
}

function renderHash() {
    const { buckets, mode, capacity } = hashTable;
    const stage = state.dom.stage;
    stage.innerHTML = ''; // Start clean

    // Use simple render for hashmap-simple mode
    if (state.currentMode === 'hashmap-simple') {
        renderHashSimple();
        return;
    }

    // Layout Constants
    const startX = 100;
    const startY = 100;
    const bucketHeight = 60;
    const bucketWidth = 80;
    const serverGap = 20;

    // Draw Buckets (Vertical Array)
    buckets.forEach((bucket, i) => {
        const y = startY + i * (bucketHeight + 10);

        // Bucket Index Label
        const idxLabel = document.createElement('div');
        idxLabel.className = 'bucket-label';
        idxLabel.innerText = i;
        idxLabel.style.left = (startX - 40) + 'px';
        idxLabel.style.top = (y + 15) + 'px';
        idxLabel.style.position = 'absolute';
        idxLabel.style.color = 'var(--text-sub)';
        idxLabel.style.fontFamily = 'monospace';
        stage.appendChild(idxLabel);

        // Bucket Box
        const box = document.createElement('div');
        box.className = 'hash-bucket';
        box.id = `bucket-${i}`;
        box.style.left = startX + 'px';
        box.style.top = y + 'px';
        box.style.width = bucketWidth + 'px';
        box.style.height = bucketHeight + 'px';
        box.style.border = '2px solid var(--border)';
        box.style.borderRadius = '8px';
        box.style.position = 'absolute';
        box.style.background = 'var(--card-bg)';
        stage.appendChild(box);

        // Chain Items
        bucket.forEach((item, j) => {
            const itemX = startX + bucketWidth + 30 + j * 90;

            // Draw Arrow from prev
            const prevX = j === 0 ? startX + bucketWidth : startX + bucketWidth + 30 + (j - 1) * 90 + 60; // 60 is width of item roughly
            // Actually let's just draw lines after placing

            const node = document.createElement('div');
            node.className = 'hash-node';
            node.id = item.id;
            node.style.left = itemX + 'px';
            node.style.top = (y + 10) + 'px'; // Center vertically relative to bucket
            node.style.position = 'absolute';
            node.style.padding = '5px 10px';
            node.style.background = '#3b82f6';
            node.style.borderRadius = '20px'; // Pill shape
            node.style.color = '#fff';
            node.style.minWidth = '60px'; // Fixed width
            node.style.textAlign = 'center';
            node.style.fontSize = '0.9rem';

            if (mode === 'hashset') {
                node.innerText = item.key;
            } else {
                node.innerText = `${item.key}:${item.value}`;
            }
            stage.appendChild(node);
        });
    });

    // Draw Links (Chain)
    setTimeout(() => {
        // Bucket to First Item
        buckets.forEach((bucket, i) => {
            const bucketEl = document.getElementById(`bucket-${i}`);
            if (bucket.length > 0) {
                drawLine(bucketEl.id, bucket[0].id, true);
            }
            // Item to Item
            for (let j = 0; j < bucket.length - 1; j++) {
                drawLine(bucket[j].id, bucket[j + 1].id, true);
            }
        });

        // LinkedHashMap Order Links (Red dashed)
        if (mode === 'linkedhashmap' && hashTable.head) {
            let curr = hashTable.head;
            while (curr && curr.next) {
                drawLine(curr.id, curr.next.id, true, '#ec4899', 2, true); // Dashed pink line
                curr = curr.next;
            }
        }
    }, 50);
}

// Simple HashMap Rendering - Clean Key-Value Table
function renderHashSimple() {
    const { buckets } = hashTable;
    const stage = state.dom.stage;
    stage.innerHTML = '';

    // Collect all key-value pairs
    const allItems = [];
    buckets.forEach(bucket => {
        bucket.forEach(item => {
            allItems.push(item);
        });
    });

    if (allItems.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: var(--text-sub);
            font-size: 1rem;
            font-style: italic;
        `;
        emptyMsg.innerText = 'HashMap is empty. Use Put to add entries.';
        stage.appendChild(emptyMsg);
        return;
    }

    // Create a clean table-like display
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        top: 80px;
        left: 100px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-family: 'Fira Code', monospace;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        display: grid;
        grid-template-columns: 120px 150px;
        gap: 2px;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--border);
    `;

    const keyHeader = document.createElement('div');
    keyHeader.innerText = 'Key';
    keyHeader.style.cssText = `
        color: #94a3b8;
        font-weight: bold;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 8px 12px;
    `;

    const valueHeader = document.createElement('div');
    valueHeader.innerText = 'Value';
    valueHeader.style.cssText = `
        color: #94a3b8;
        font-weight: bold;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 8px 12px;
    `;

    header.appendChild(keyHeader);
    header.appendChild(valueHeader);
    container.appendChild(header);

    // Sort by key for a cleaner display
    allItems.sort((a, b) => {
        if (typeof a.key === 'number' && typeof b.key === 'number') {
            return a.key - b.key;
        }
        return String(a.key).localeCompare(String(b.key));
    });

    // Render each entry
    allItems.forEach((item, idx) => {
        const row = document.createElement('div');
        row.id = item.id;
        row.style.cssText = `
            display: grid;
            grid-template-columns: 120px 150px;
            gap: 2px;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        `;
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'scale(1.02)';
            row.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'scale(1)';
            row.style.boxShadow = 'none';
        });

        const keyCell = document.createElement('div');
        keyCell.innerText = item.key;
        keyCell.style.cssText = `
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
        `;

        const valueCell = document.createElement('div');
        valueCell.innerText = item.value;
        valueCell.style.cssText = `
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
        `;

        row.appendChild(keyCell);
        row.appendChild(valueCell);
        container.appendChild(row);
    });

    stage.appendChild(container);
}

function renderTreeMap() {
    // Reuse Tree Logic but with custom node rendering?
    // Or just copy paste a simple version.
    // Let's copy paste a simple version for now to avoid dependency hell on tree.js internals.
    // But better: map our TreeMap nodes to structure expected by tree.js renderTree if possible.
    // tree.js renderTree expects objects with {id, val, left, right}.
    // Our nodes have {id, key, value, left, right}.
    // We can map 'key:value' to 'val' for display.

    if (!treeMapRoot) {
        state.dom.stage.innerHTML = '';
        state.dom.svgLayer.innerHTML = ''; // Clear lines too
        return;
    }

    const mapNode = (n) => {
        if (!n) return null;
        return {
            id: n.id,
            val: `${n.key}:${n.value}`,
            left: mapNode(n.left),
            right: mapNode(n.right)
        };
    };

    const visualRoot = mapNode(treeMapRoot);

    // We need to call renderTree from tree.js
    // Dynamic import to avoid circular dependency issues at top level if any?
    // Or just import at top. Circular deps in ES modules are okay-ish but tricky.
    // Let's import { renderTree } from './tree.js' at top.
    // WAIT: renderTree uses state.dom.stage directly.

    import('./tree.js').then(mod => {
        state.dom.stage.innerHTML = ''; // Clear previous tree nodes
        state.dom.svgLayer.innerHTML = ''; // Clear previous lines
        mod.renderTree(visualRoot);
    });
}

function updateHashInfo() {
    if (!state.dom.hashInfo) return;
    if (state.currentMode === 'treemap') {
        state.dom.hashInfo.innerText = "Sorted by Key";
        return;
    }
    const load = (hashTable.size / hashTable.capacity).toFixed(2);
    state.dom.hashInfo.innerText = `Size: ${hashTable.size} | Capacity: ${hashTable.capacity} | Load Factor: ${load}`;
}

// Helpers
function highlightBucket(idx, color) {
    const el = document.getElementById(`bucket-${idx}`);
    if (el) {
        el.style.borderColor = color;
        setTimeout(() => el.style.borderColor = 'var(--border)', 1000);
    }
}

function highlightNode(id, color) {
    const el = document.getElementById(id);
    if (el) {
        el.style.backgroundColor = color;
        setTimeout(() => el.style.backgroundColor = '#3b82f6', 1000);
    }
}
