# Project Capabilities

## Data Structures
*   **Linear**: Arrays, Stacks, Queues
*   **Linked Lists**: Singly, Doubly, Circular
*   **Trees**: Binary Trees, BST, Heaps
*   **Graphs**: Construction, BFS, DFS
*   **Hashing**: HashMaps, HashSets

## STEM Visuals (AI Engine)
*   **Physics**: Mechanics, Optics, Circuits
*   **CS/Arch**: System Design, Flowcharts, Neural Nets

## DevOps Architecture & Pipeline

### 1. Source Code Management (SCM)
*   **Version Control**: Git-based workflow hosted on GitHub/GitLab.
*   **Branching Strategy**:
    *   `main`: Production-ready code.
    *   `dev`: Integration branch for ongoing development.
    *   `feature/*`: Isolated feature development branches.
*   **Code Governance**:
    *   **Pull Requests (PRs)**: Mandatory peer reviews for all changes.
    *   **Semantic Versioning**: Automated tagging and release management (v1.x.x).
    *   **Pre-commit Hooks**: Local linting and formatting checks (Husky/Pre-commit) to prevent bad commits.

### 2. Application Pipeline (CI)
*   **Frontend Processing**:
    *   **Linting**: ESLint and Prettier for code consistency.
    *   **Asset Optimization**: Image compression and CSS/JS minification for production builds.
    *   **Formatting Check**: Automated verification of HTML structure and indentation.
*   **Backend Build (Visually Engine)**:
    *   **Dependency Management**: `requirements.txt` / Poetry for Python package locking.
    *   **Dockerization**: Multi-stage Docker builds to create lightweight images for the API and Logic Core.
    *   **System Dependencies**: Automated installation of system-level binaries (e.g., `graphviz`, `latex`) within the container.

### 3. Test Strategy (Automated Testing)
*   **Unit Testing**:
    *   **Backend**: `pytest` suite for core logic, Pydantic models, and utility functions.
    *   **Frontend**: `Jest` or browser-based testing for data structure visualizers.
*   **Integration Testing**:
    *   **API Verification**: Automated checks of FastAPI endpoints (e.g., `/query`, `/render`).
    *   **Mocking**: Simulating Gemini API responses to test logic without consuming quota.
*   **Visual Regression Testing**:
    *   **Snapshot Comparison**: Automated diffing of generated Matplotlib/Graphviz plots against baseline reference images to detect rendering regressions.
*   **Security Scanning**:
    *   **SAST**: Static Application Security Testing for code vulnerabilities.
    *   **Dependency Audit**: Checking for known vulnerabilities in Python/JS libraries (e.g., `pip-audit`, `npm audit`).

### 4. Deployment & Operations (CD)
*   **Environments**:
    *   **Staging**: Mirror of production for final acceptance testing (UAT).
    *   **Production**: Live environment serving end-users.
*   **Infrastructure**:
    *   **Frontend**: Auto-deployed to high-performance CDN/Static Hosting (e.g., Vercel, Netlify, AWS S3+CloudFront).
    *   **Backend API**: Containerized services deployed to Serverless containers (e.g., AWS Fargate, Google Cloud Run) or K8s clusters.
*   **Observability**:
    *   **Logging**: Centralized logs for API requests and logic core execution.
    *   **Monitoring**: Real-time metrics on render times, API latency, and error rates.
