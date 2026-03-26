
import { state } from '../state.js';
import { drawLine } from '../utils.js';

// ============ UNION FIND DATA STRUCTURE ============

// Representation:
// We use an array of objects for visual nodes.
// Each object has { id, parent, rank, x, y }

export function initUF(size) {
    size = Math.max(1, Math.min(size, 15)); // Clamp 1-15
    state.ufData = [];

    // Initialize Disjoint Sets
    for (let i = 0; i < size; i++) {
        state.ufData.push({
            val: i,
            parent: i,
            rank: 0,
            x: 0,
            y: 0,
            id: `uf-${i}`
        });
    }
    renderUF();
}

export function findUF(i) {
    if (i < 0 || i >= state.ufData.length) return -1;

    // Path Compression Logic with Visual Highlight
    // For static view, we just show result of find.
    // If we want animation, we need steps.
    // Let's do standard find with path compression.

    const path = [];
    let curr = i;
    while (state.ufData[curr].parent !== curr) {
        path.push(curr);
        curr = state.ufData[curr].parent;
    }

    // Compress
    for (const nodeIdx of path) {
        state.ufData[nodeIdx].parent = curr;
    }

    // Highlight root
    highlightUFNode(curr, '#10b981'); // Green root

    // Highlight search path
    path.forEach(idx => highlightUFNode(idx, '#3b82f6'));

    setTimeout(renderUF, 1000); // Re-render to show new edges after compression
    return curr;
}

export function unionUF(i, j) {
    const rootI = findUF(i);
    const rootJ = findUF(j);

    if (rootI !== -1 && rootJ !== -1 && rootI !== rootJ) {
        // Union by Rank
        const nodeI = state.ufData[rootI];
        const nodeJ = state.ufData[rootJ];

        if (nodeI.rank < nodeJ.rank) {
            nodeI.parent = rootJ;
        } else if (nodeI.rank > nodeJ.rank) {
            nodeJ.parent = rootI;
        } else {
            nodeJ.parent = rootI;
            nodeI.rank++;
        }

        // Highlight logic
        highlightUFNode(rootI, '#f59e0b');
        highlightUFNode(rootJ, '#f59e0b');

        renderUF();
    }
}

// ============ RENDERING ============

function calculateForestLayout() {
    // Group by roots
    const roots = {};
    state.ufData.forEach(node => {
        let r = node;
        while (r.parent !== r.val) {
            r = state.ufData[r.parent];
        }
        if (!roots[r.val]) roots[r.val] = [];
        roots[r.val].push(node);
    });

    const rootKeys = Object.keys(roots);
    const widthPerTree = 800 / Math.max(1, rootKeys.length);

    rootKeys.forEach((rootKey, i) => {
        const root = state.ufData[rootKey];
        const treeNodes = roots[rootKey];
        const centerX = (i * widthPerTree) + (widthPerTree / 2) - 400; // Centered around 0
        const startY = -150;

        // Simple tree layout: Root at top
        // Children below
        root.x = centerX;
        root.y = startY;

        // Find children of root (direct)
        const directChildren = treeNodes.filter(n => n.parent === root.val && n.val !== root.val);

        assignSubtree(root, directChildren, centerX, startY + 80, widthPerTree);
    });
}

function assignSubtree(parent, children, x, y, width) {
    if (children.length === 0) return;
    const slice = width / children.length;
    let startX = x - width / 2 + slice / 2;

    children.forEach((child, i) => {
        child.x = startX + i * slice;
        child.y = y;

        // Grandchildren
        const grandChildren = state.ufData.filter(n => n.parent === child.val && n.val !== child.val);
        assignSubtree(child, grandChildren, child.x, y + 80, slice);
    });
}

export function renderUF() {
    const stage = state.dom.stage;
    const svg = state.dom.svgLayer;
    if (!stage || !svg || !state.ufData) return;

    stage.innerHTML = '';
    svg.innerHTML = '';

    calculateForestLayout();

    state.ufData.forEach(node => {
        // Draw Node
        const div = document.createElement('div');
        div.className = 'tree-node'; // Reuse
        div.id = node.id;
        div.style.left = `calc(50% + ${node.x}px)`;
        div.style.top = `calc(50% + ${node.y}px)`;
        div.textContent = node.val;

        // Tooltip for Rank
        div.title = `Rank: ${node.rank}`;

        stage.appendChild(div);

        // Draw Edge to Parent (if not root)
        if (node.parent !== node.val) {
            const parentNode = state.ufData[node.parent];
            drawLine(node.id, parentNode.id, true); // Directed arrow
        } else {
            // Self loop? or just simpler visual.
            // Maybe a small crown illustration for root?
            div.style.borderColor = '#8b5cf6'; // Purple for roots
            div.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.3)';
        }
    });
}

function highlightUFNode(idx, color) {
    if (idx < 0 || idx >= state.ufData.length) return;
    const id = state.ufData[idx].id;
    const el = document.getElementById(id);
    if (el) {
        el.style.background = color;
        el.style.color = '#fff';
        setTimeout(() => {
            el.style.background = '';
            el.style.color = '';
        }, 1000);
    }
}
