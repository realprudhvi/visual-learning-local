
import { state } from '../state.js';
import { drawLine } from '../utils.js';

// ============ TRIE DATA STRUCTURE ============

class TrieNode {
    constructor(char = '') {
        this.children = {};
        this.isWord = false;
        this.char = char;
        this.id = crypto.randomUUID();
        this.x = 0;
        this.y = 0;
    }
}

export function initTrie() {
    state.trieRoot = new TrieNode();
    renderTrie();
}

export function insertTrie(word) {
    if (!word) return;
    word = word.toLowerCase();
    let node = state.trieRoot;

    // Simple visual feedback: Highlight path
    // We'll just render final state for now, animation requires step controller which we can add later if requested.

    for (const char of word) {
        if (!node.children[char]) {
            node.children[char] = new TrieNode(char);
        }
        node = node.children[char];
    }
    node.isWord = true;
    renderTrie();
}

export function searchTrie(word) {
    if (!word) return false;
    word = word.toLowerCase();
    let node = state.trieRoot;
    for (const char of word) {
        if (!node.children[char]) {
            highlightNode(state.trieRoot.id, '#ef4444'); // Red if fail
            return false;
        }
        node = node.children[char];
    }

    if (node.isWord) {
        highlightNode(node.id, '#10b981'); // Green if found
        return true;
    } else {
        highlightNode(node.id, '#f59e0b'); // Orange if prefix but not word
        return false;
    }
}

export function startsWithTrie(prefix) {
    if (!prefix) return false;
    prefix = prefix.toLowerCase();
    let node = state.trieRoot;
    for (const char of prefix) {
        if (!node.children[char]) return false;
        node = node.children[char];
    }
    highlightNode(node.id, '#3b82f6'); // Blue for prefix match
    return true;
}

// ============ RENDERING ============

function getTreeDepth(node) {
    if (!node) return 0;
    let max = 0;
    for (const key in node.children) {
        max = Math.max(max, getTreeDepth(node.children[key]));
    }
    return 1 + max;
}

function assignPositions(node, x, y, availableWidth, level) {
    node.x = x;
    node.y = y;

    const keys = Object.keys(node.children).sort();
    const childrenCount = keys.length;
    if (childrenCount === 0) return;

    // Divide width among children
    const slice = availableWidth / childrenCount;
    let startX = x - availableWidth / 2 + slice / 2;

    keys.forEach((key, i) => {
        const child = node.children[key];
        assignPositions(child, startX + i * slice, y + 80, slice, level + 1);
    });
}

// Reingold-Tilford is better but complex. Let's use a simpler level-based layout for now.
// We'll calculate subtree widths.
function calculateSubtreeWidth(node) {
    const keys = Object.keys(node.children);
    if (keys.length === 0) return 60; // Leaf width
    let width = 0;
    for (const key of keys) {
        width += calculateSubtreeWidth(node.children[key]);
    }
    return width;
}

function assignPositionsSmart(node, x, y) {
    node.x = x;
    node.y = y;

    const keys = Object.keys(node.children).sort();
    let currentX = x - calculateSubtreeWidth(node) / 2;

    for (const key of keys) {
        const child = node.children[key];
        const childWidth = calculateSubtreeWidth(child);
        assignPositionsSmart(child, currentX + childWidth / 2, y + 80);
        currentX += childWidth;
    }
}


export function renderTrie() {
    const stage = state.dom.stage;
    const svg = state.dom.svgLayer;
    if (!stage || !svg || !state.trieRoot) return;

    stage.innerHTML = '';
    svg.innerHTML = '';

    // 1. Calculate Positions
    // Root at center top
    // Scale logic similar to Tree
    assignPositionsSmart(state.trieRoot, 0, -200); // Start higher up

    // 2. Render Nodes & Edges
    // We need to traverse to render
    const queue = [state.trieRoot];

    // Helper to add node
    const createNodeDOM = (n) => {
        const div = document.createElement('div');
        div.className = 'tree-node'; // Reuse tree style
        div.id = n.id;
        div.style.left = `calc(50% + ${n.x}px)`;
        div.style.top = `calc(50% + ${n.y}px)`;
        div.textContent = n.char || '*'; // Root is *

        if (n.isWord) {
            div.style.borderColor = '#10b981'; // Green border for words
            div.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.3)';
        }

        stage.appendChild(div);
    };

    createNodeDOM(state.trieRoot);

    while (queue.length) {
        const parent = queue.shift();
        for (const key in parent.children) {
            const child = parent.children[key];
            createNodeDOM(child);

            // Draw Edge
            drawLine(parent.id, child.id);

            // Draw Edge Label (The Character)
            // We can reuse the node char, but usually label is on edge. 
            // Here node already contains char.

            queue.push(child);
        }
    }
}

function highlightNode(id, color) {
    const el = document.getElementById(id);
    if (el) {
        const oldBg = el.style.background;
        const oldColor = el.style.color;

        el.style.background = color;
        el.style.color = 'white';
        el.style.transform = 'scale(1.2)';

        setTimeout(() => {
            el.style.background = oldBg || '';
            el.style.color = oldColor || '';
            el.style.transform = '';
        }, 1000);
    }
}
