# Visually Learning - Project Overview

**Visually Learning** is a universal engine designed to visualize data structures and algorithms in an interactive and educational manner. It provides a rich set of tools to explore linear, hierarchical, graph, and hash-based data structures, allowing users to understand their inner workings through dynamic animations and step-by-step execution.

##  Key Capabilities

The project is categorized into several domains of data structures, each with specific interactive capabilities:

### 1. Linear Structures
*   **Arrays**: Visualize index-based access, insertion, deletion, and updates.
*   **Stacks**: Demonstrate LIFO (Last-In-First-Out) operations (`push`, `pop`, `peek`).
*   **Queues**: Demonstrate FIFO (First-In-First-Out) operations (`enqueue`, `dequeue`, `peek`).
*   **Monotonic Queue**: Visualizes a queue that maintains elements in either increasing or decreasing order.
*   **Grid**: 2D array visualization for matrix-based algorithms (e.g., Number of Islands).

### 2. Memory & Pointers (Linked Lists)
*   **Singly Linked List (SLL)**: Visualizes nodes with a single pointer to the next node.
*   **Doubly Linked List (DLL)**: Visualizes nodes with pointers to both next and previous nodes.
*   **Operations**: Supports `Append`, `Prepend`, `Remove Value`, `Search`, `Pop Head`, and `Pop Tail`.

### 3. Hierarchical Structures
*   **Binary Tree**: Generic binary tree visualization with standard traversals.
*   **Binary Search Tree (BST)**:
    *   **Operations**: Insert, Search.
    *   **Traversals**: BFS, Preorder, Inorder, Postorder.
*   **Heaps (Min Heap & Max Heap)**:
    *   **Operations**: Insert, Poll (Extract), Peek.
    *   **Visualization**: Shows the tree structure maintaining the heap property.
*   **Trie (Prefix Tree)**: Visualizes word insertion and prefix searching dynamically.
*   **Union Find (Disjoint Set)**: Visualizes connected components with path compression and rank-based weighting.

### 4. Graph Structures
A robust interactive Graph Builder and visualizer:
*   **Graph Builder**:
    *   Add/Delete Nodes.
    *   Add Directed/Undirected Edges.
    *   **Interactive Tweaks**: Drag nodes to reposition, with improved zoom and pan controls.
*   **Algorithms**:
    *   **BFS (Breadth-First Search)**: Visualizes layer-by-layer traversal.
    *   **DFS (Depth-First Search)**: Visualizes depth-based traversal.
*   **Visual Elements**: Dynamic edges (lines/arrows) and node positioning.

### 5. Hash Data Structures
Comprehensive support for hashing concepts:
*   **HashMap**: Visualizes key-value pairs with collision handling (chaining/probing visualization implied).
*   **HashMap (Simple)**: Simplified view for educational purposes.
*   **HashSet**: Visualizes unique element storage using hash-based lookups.
*   **TreeMap**: Visualizes key-value pairs sorted by keys (Red-Black Tree backend).
*   **LinkedHashMap**: Maintains insertion order alongside hashing, combining properties of a HashMap and Linked List.
*   **Operations**: `Put`, `Get`, `Remove`, `Clear`.

## Core Features

*   **Interactive Controls**:
    *   **Pan & Zoom**: Standard canvas controls to navigate large structures.
    *   **Speed Control**: Adjust the animation speed for step-by-step visualization.
    *   **Auto-Play**: Automatically step through algorithms.
    *   **Step-by-Step**: Manual `Next` and `Previous` controls for granular analysis.

*   **Auxiliary Views** (`aux-panel`):
    *   **Traversal Output**: Displays the sequence of nodes visited.
    *   **Visited Array**: Shows which nodes have been processed.
    *   **Queue/Stack Visuals**: Shows the internal state of auxiliary data structures during algorithm execution.
    *   **Call Stack**: Visualizes recursion depth and function calls pushed/popped during execution.
    *   **Recursion Tree**: Dynamically plots a state-space tree as recursive algorithms branch, highlighting caches and dead-ends for DP and Backtracking.

*   **Enhanced Visuals**:
    *   **Resized Slots**: Optimized visual dimensions for stack and array slots.
    *   **Reduced Clutter**: Improved spacing and layout for clearer visualization.

*   **Playground**:
    *   A sandbox environment (`playground/test.html`) for testing new features.
    *   **Enhanced Prompt**: Supports natural language queries that map to complex data structure operations.
    *   **API Support**: Extended support for generating problems involving Grids, Queues, and HashMaps.
    *   Supports loading problems from `examples/*.json`.

## Technical Architecture

The project is built using **Vanilla JavaScript**, **HTML5**, and **CSS3**, focusing on performance and zero dependencies.

### Directory Structure
*   **`index.html`**: The main entry point containing the UI layout, control panels, and visualization stage.
*   **`js/`**: Core logic.
    *   **`main.js`**: Application controller, event listeners, and UI state management.
    *   **`canvas.js`**: Handles SVG/Canvas drawing logic.
    *   **`state.js`**: Manages global application state (current structure, settings).
    *   **`utils.js`**: Helper functions.
    *   **`ds/`**: Specific implementations for data structures:
        *   `linear.js`: Arrays, Stacks, Queues.
        *   `list.js`: Linked Lists logic.
        *   `tree.js`: Binary Trees, BSTs.
        *   `heap.js`: Heap logic.
        *   `graph.js`: Graph modeling and traversal algorithms.
        *   `hash.js`: Hashing logic and visualization.
*   **`css/`**: Styling (Dark theme, responsive layout).
*   **`examples/`**: JSON files defining specific algorithmic problems (e.g., Two Sum, Prefix Sum) for the playground/demos.

## UI/UX Design

*   **Dark Theme**: Modern, developer-friendly dark interface.
*   **Responsive Layout**: Sidebar for controls, main area for visualization, and adjustable auxiliary panels.
*   **Visual Feedback**: Color-coded nodes (visited, active, queued) and smooth transitions.