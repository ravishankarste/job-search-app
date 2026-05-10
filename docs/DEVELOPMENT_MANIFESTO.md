# 📜 The Development Manifesto: Udyog Marg

This document defines the "Laws of the Code" for the Udyog Marg ecosystem. Adherence to these protocols is non-negotiable to ensure the platform remains "Sticky," professional, and stable.

## 🏛️ 1. The Sovereign Implementation Workflow
Every technical task MUST follow these 5 phases in order. Skipping any phase is a **PROTOCOL VIOLATION**.

1.  **Plan and Understand**: 
    *   **Sovereign Audit**: Check **`docs/KnowledgeLog.md`** for similar past issues or "Basics" patterns.
    *   Draft a **Planning Artifact** (modalities, logic, edge cases).
    *   Present the plan to the User.
    *   Wait for the **"Proceed"** command.
2.  **Build the Foundation**: 
    *   Review `index.css` and design tokens.
    *   Ensure all new styles align with the "Strava-inspired" dark theme.
3.  **Create Components & Logic**: 
    *   Build modular, reusable UI pieces using predefined tokens.
    *   **Unit Testing**: If new logic is introduced (services/hooks), add or update Vitest unit tests to prove correctness.
4.  **Assemble Pages**: 
    *   Integrate components into the application flow.
    *   Update routing and state management.
5.  **Polish and Optimize**: 
    *   Add micro-animations and hover effects.
    *   Review performance and accessibility.
6.  **Local Validation & Deployment**:
    *   Run `npm run build` locally to catch TypeScript or environment errors.
    *   Perform a **Localhost Browser Check** to verify UI integrity.
    *   ONLY push to GitHub once the local environment is confirmed stable.
7.  **User Acceptance Testing (UAT)**:
    *   Ask the User to manually verify the feature on their local environment.
    *   The task is ONLY considered complete once the User provides explicit confirmation: **"UAT Passed."**

## 🛡️ 2. Protocol Violation Rules
*   **Definition**: Any attempt to write code without a confirmed Step 1 Plan or without an explicit foundation check.
*   **The User's Right**: The User has the right to issue a **"Protocol Violation Reset"**.
*   **The Model's Duty**: If a Protocol Violation is identified, the model must immediately stop, apologize, and revert to Phase 1 (Planning).

## 📖 3. Linguistic Discipline
*   Refer to **[The Dictionary](./PROJECT_DICTIONARY.md)** for all feature names and logic concepts.
*   "The Pipeline" is the Pipeline. "The Accelerator" is the Accelerator. Precision matters.

## 🔄 4. GTM Alignment
*   No "Feature Bloat." Every new feature must pass the **"Sticky Strategy"** test: *Does this make the user more likely to stay and optimize their search?*
*   If a feature is not "Absolutely Necessary" in the **MASTER_ROADMAP.md**, it must be challenged.

---
**Signed by the AI Architect.** 🛡️⚖️🏛️

### 🛡️ Persistence Protocol: The Hydration Shield
Any feature that writes state to the local filesystem (e.g., via a Vite server plugin) MUST implement the **Hydration Shield**.
1. **Initial State**: Always start with a baseline placeholder.
2. **Latch**: Maintain an `isHydrated` boolean state (default: false).
3. **Hydrate**: Perform an asynchronous fetch on mount to load data from disk. Set `isHydrated(true)` only after success.
4. **Shield**: Wrap all `saveToDisk` triggers in an `if (isHydrated)` condition. 
**NEVER allow a disk write to occur before the initial load is confirmed.**
