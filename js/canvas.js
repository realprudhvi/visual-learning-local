import { state } from './state.js';

export function updateTransform() {
    if (!state.dom.pzContainer) return;
    state.dom.pzContainer.style.transform = `translate(${state.pointX}px, ${state.pointY}px) scale(${state.scale})`;
}

export function resetZoom() {
    state.scale = 1;
    state.pointX = 0;
    state.pointY = 0;
    updateTransform();
}

export function initCanvas() {
    const visualArea = state.dom.visualArea;

    visualArea.addEventListener('mousedown', (e) => {
        state.pPanning = true;
        state.startX = e.clientX - state.pointX;
        state.startY = e.clientY - state.pointY;
    });

    visualArea.addEventListener('mousemove', (e) => {
        if (!state.pPanning) return;
        e.preventDefault();
        state.pointX = e.clientX - state.startX;
        state.pointY = e.clientY - state.startY;
        updateTransform();
    });

    visualArea.addEventListener('mouseup', () => { state.pPanning = false; });
    visualArea.addEventListener('mouseleave', () => { state.pPanning = false; });

    visualArea.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = visualArea.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - state.pointX) / state.scale;
        const worldY = (mouseY - state.pointY) / state.scale;

        const delta = -Math.sign(e.deltaY);
        const zoomFactor = 1 + state.zoomSensitivity; // Use configurable sensitivity
        const newScale = (delta > 0) ? (state.scale * zoomFactor) : (state.scale / zoomFactor);

        if (newScale > 0.1 && newScale < 5) {
            state.pointX = mouseX - worldX * newScale;
            state.pointY = mouseY - worldY * newScale;
            state.scale = newScale;
            updateTransform();
        }
    });
}
