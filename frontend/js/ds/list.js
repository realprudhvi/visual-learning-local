import { state } from '../state.js';
import { getAddr, drawStraightArrow, drawCLLReturnArrow } from '../utils.js';

// Re-export initList but modify to sync state.dsData
export function initList(vals, type) {
    // If vals provided is different ref from state (initial load), sync it
    if (vals !== state.dsData) {
        state.dsData = [...vals];
    }

    // We render from state.dsData primarily, but the arg `vals` is reused logic
    const data = state.dsData;
    const nodes = data.map(v => ({ id: crypto.randomUUID(), val: v, addr: getAddr() }));

    // IMPORTANT: Clear stage and SVG lines to prevent overlaps "boom"
    state.dom.stage.innerHTML = '';
    state.dom.svgLayer.innerHTML = '';
    // Restore defs if necessary (arrow marker)
    state.dom.svgLayer.innerHTML = `
        <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
        </defs>`;

    let gap = (type === 'dll') ? 350 : 250;
    const totalW = (nodes.length * gap);
    let startX = (state.dom.visualArea.offsetWidth - totalW) / 2;
    if (startX < 50) startX = 50;
    let startY = 300;

    nodes.forEach((node, i) => {
        const nextAddr = (i < nodes.length - 1) ? nodes[i + 1].addr : (type === 'cll' ? nodes[0].addr : "NULL");
        const prevAddr = (i > 0) ? nodes[i - 1].addr : (type === 'cll' ? nodes[nodes.length - 1].addr : "NULL");

        const el = document.createElement('div');
        el.className = 'node-wrapper';
        el.id = node.id;
        el.style.left = (startX + i * gap) + 'px';
        el.style.top = startY + 'px';

        if (type === 'dll') {
            el.innerHTML = `
                <div class="mem-addr">${node.addr}</div>
                <div class="ll-box" id="box-${node.id}">
                    <div class="ll-ptr" id="prev-${node.id}">
                        <span class="ptr-label">PREV</span>
                        ${prevAddr}
                    </div>
                    <div class="ll-data">${node.val}</div>
                    <div class="ll-ptr" id="next-${node.id}">
                        <span class="ptr-label">NEXT</span>
                        ${nextAddr}
                    </div>
                </div>`;
        } else {
            el.innerHTML = `
                <div class="mem-addr">${node.addr}</div>
                <div class="ll-box" id="box-${node.id}">
                    <div class="ll-data">${node.val}</div>
                    <div class="ll-ptr" id="next-${node.id}">
                        <span class="ptr-label">NEXT</span>
                        ${nextAddr}
                    </div>
                </div>`;
        }
        state.dom.stage.appendChild(el);
    });

    setTimeout(() => {
        nodes.forEach((node, i) => {
            const isLast = i === nodes.length - 1;

            if (!isLast) {
                if (type === 'dll') {
                    drawStraightArrow(`next-${node.id}`, `box-${nodes[i + 1].id}`, -12);
                } else {
                    drawStraightArrow(`next-${node.id}`, `box-${nodes[i + 1].id}`);
                }
            } else if (type === 'cll' && nodes.length > 1) {
                drawCLLReturnArrow(`next-${node.id}`, `box-${nodes[0].id}`);
            }

            if (type === 'dll' && i > 0) {
                drawStraightArrow(`prev-${node.id}`, `box-${nodes[i - 1].id}`, 12);
            }
        });
    }, 50);
}

export function appendList(val) {
    state.dsData.push(val);
    initList(state.dsData, state.currentMode);
}

export function prependList(val) {
    state.dsData.unshift(val);
    initList(state.dsData, state.currentMode);
}

export async function removeListVal(val) {
    const nodes = state.dsData;
    const wrappers = state.dom.stage.querySelectorAll('.node-wrapper');
    if (wrappers.length !== nodes.length) return; // Sync check

    let foundIdx = -1;

    for (let i = 0; i < wrappers.length; i++) {
        const wrapper = wrappers[i];
        const box = wrapper.querySelector('.ll-box');

        // Highlight traversal
        if (box) box.style.borderColor = '#3b82f6';

        await new Promise(r => setTimeout(r, 500));

        if (nodes[i] == val) {
            foundIdx = i;
            // Found: Highlight 'deleting' state
            if (box) {
                box.style.backgroundColor = '#ef4444'; // Red for deletion
                box.style.transform = 'scale(0.9)';
                box.style.opacity = '0.7';
            }
            break;
        } else {
            if (box) box.style.borderColor = '';
        }
    }

    if (foundIdx !== -1) {
        await new Promise(r => setTimeout(r, 600)); // Pause to show deletion
        state.dsData.splice(foundIdx, 1);
        initList(state.dsData, state.currentMode);
    } else {
        alert("Value not found");
    }
}

export function popListHead() {
    if (state.dsData.length === 0) return;
    state.dsData.shift();
    initList(state.dsData, state.currentMode);
}

export function popListTail() {
    if (state.dsData.length === 0) return;
    state.dsData.pop();
    initList(state.dsData, state.currentMode);
}

export async function searchList(val) {
    const nodes = state.dsData;
    // We need to access DOM elements. IDs were generated in `initList`. 
    // `initList` re-generates IDs every time it runs. INVALIDATING old references?
    // Actually `initList` IS called on every update, so the current DOM corresponds to `state.dsData`.
    // But we need the IDs. We didn't store them in `state.dsData`.
    // We can just query by order since the rendering order matches `state.dsData` order.

    // Select all node wrappers
    const wrappers = state.dom.stage.querySelectorAll('.node-wrapper');
    if (wrappers.length !== nodes.length) {
        // Fallback or error if out of sync
        return;
    }

    let foundIdx = -1;
    for (let i = 0; i < wrappers.length; i++) {
        const wrapper = wrappers[i];
        const box = wrapper.querySelector('.ll-box'); // The visible box

        // Highlight traversal
        if (box) box.style.borderColor = '#3b82f6';

        await new Promise(r => setTimeout(r, 500));

        if (nodes[i] == val) { // use == for loose comparison (string vs number)
            foundIdx = i;
            if (box) {
                box.style.backgroundColor = '#ec4899';
                box.style.transform = 'scale(1.1)';
            }
            break;
        } else {
            if (box) box.style.borderColor = '';
        }
    }

    if (foundIdx === -1) {
        alert("Value not found!");
    } else {
        setTimeout(() => {
            // Reset style of found item after a bit
            const wrapper = wrappers[foundIdx];
            const box = wrapper && wrapper.querySelector('.ll-box');
            if (box) {
                box.style.backgroundColor = '';
                box.style.transform = '';
                box.style.borderColor = '';
            }
        }, 1500);
    }
}
