
## 🧠 Persistence & Data Sovereignty (2026-05-10)
- **Insight**: Persistence without Hydration is a Data Deletion engine.
- **Problem**: React auto-save effects trigger on mount. If the initial state is a baseline/empty, and the hydration (load from disk) is asynchronous, the app will overwrite the real data with the baseline before the load completes.
- **Solution (The Hydration Shield)**: Always implement an `isHydrated` state. Explicitly block all disk-write operations (`saveToDisk`) until `isHydrated` is true.
- **Criticality**: Level 5 (Data Loss Prevention).

## 🛡️ Strict Build Protocol (2026-05-11)
- **Insight**: Strict Build settings are the Final Guardrail of GTM Quality.
- **Problem**: Unused imports (e.g., `Sparkles`) or minor type mismatches that pass in 'Dev Mode' will kill the production build.
- **Lesson**: Never assume 'npm run dev' success equals GTM readiness. The production build (`tsc -b && vite build`) is the only source of truth for deployment.
- **Solution**: Follow the **Sovereign Build Workflow** (`Build → Test → E2E → Push`) before every commit.
- **Criticality**: Level 4 (Deployment Blockers).

## 🎨 UX Sovereignty (2026-05-12)
- **Insight**: Native browser alerts (`window.confirm`) break the premium immersion.
- **Problem**: The Resume Deletion flow uses a browser alert which looks generic and unbranded.
- **Goal**: Replace all native alerts with a custom, high-fidelity Confirmation Modal that matches the dark theme.
- **Criticality**: Level 2 (Aesthetic Polish).

## 📊 Dual-Pulse Intelligence & Nexus (2026-05-12)
- **Insight**: Information friction is a productivity killer. Centralizing situational tools (Sheets, Make.com) in a 'Nexus Registry' is high-ROI architecture.
- **Problem**: Separating Guest (Sandbox) vs User (App) 'Aha!' moments is non-negotiable for founder intelligence. The '7 vs 0' signal today revealed a critical onboarding bottleneck.
- **Solution**: Implemented 'Dual-Pulse' dashboard and 'Nexus Command' portal in Persona OS.
- **Criticality**: Level 4 (Strategy & Growth).

## 🏛️ UI Sovereignty & Portal Teleportation (2026-05-14)
- **Insight**: Parent animations (transforms) create "CSS Traps" for fixed elements.
- **Problem**: The `fade-in-up` animation on the `ResumeDetailPage` trapped modals, shifting them to the top of the content area instead of the viewport center.
- **Solution**: Implement **React Portals** for all modals to teleport them to `document.body`, bypassing all parent stacking contexts.
- **Criticality**: Level 3 (Visual Stability).

## 🛡️ The Truncation Shield (2026-05-14)
- **Insight**: User trust is brittle; UI layout must be physically impossible to break.
- **Problem**: Messy or "Monster" data (entire paragraphs as titles) can expand cards vertically and destroy the grid.
- **Solution**: Always enforce **`line-clamp-1`** and **`block truncate`** on user-generated fields (Name, Role). This ensures "Sovereign Alignment" even if the underlying data is poisoned.
- **Criticality**: Level 4 (Grid Resiliency).

## ⚖️ Baseline Naming Sovereignty (2026-05-14)
- **Insight**: Predictability is a feature. Heuristic-based naming is high-risk.
- **Problem**: Attempting to "Intelligently" extract roles for naming caused noisy, unpredictable titles.
- **Lesson**: Default to the **Filename** (Ravi Shankar P) as the "Sovereign Baseline." It is 100% predictable and maintains user authority.
- **Criticality**: Level 3 (User Trust & Stability).

### 🏛️ Mission 0: "Aha!" Rescue & Spacial Sovereignty
- **The "Import Audit" Protocol**: Every icon or component added to JSX MUST be cross-referenced with the import block. Failure to do so results in `ReferenceError` fractures.
- **The "Tag Balance" Mandate**: When introducing new structural wrappers (like `section` for Airflow), verify the closing tags immediately. Mismatched tags break the Vite build pipeline.
- **The "Session Guard" Rule**: Milestone celebrations (Confetti) must use explicit state-change guards (e.g., `prevValue === false && newValue === true`) to prevent "Celebration Loops" on page refreshes or data hydration.
- **The "Nuclear Airflow" Rule**: For complex, overlapping components, use `flex flex-col` with explicit `gap-X` instead of `space-y-X`. Flex is more robust against layout-escaping children.
- **"Direct English" over "Fancy Language"**: "Materialize" and "Sovereign" are for architecture; "Upload" and "Import" are for users. Zero cognitive load is the requirement for the "Aha!" moment.

## 🗺️ Regional & Inclusive Discovery UX (2026-05-18)
*   **The "Strict Regional Separation" Mandate**: Mixing regions or displaying cross-contamination (e.g., Bengaluru jobs to a London user) completely breaks the credibility of a localized discovery feed. Always partition regional datasets (`LONDON_JOBS`, `HYDERABAD_JOBS`, `BENGALURU_JOBS`) mutually-exclusively.
*   **The "Forgot Pincode" Fallback**: Postcode/pincode API lookup is great, but forcing it creates high friction. Always build instant, client-side city-name matching (e.g. typing "Bengaluru" resolves immediately without hitting APIs) as a seamless exit-route when users forget their code.
*   **The "Universal Audience" Mandate**: A platform like Udyog Marg is for *everyone*, not just software engineers. A search system must accommodate any role (Sales, Chef, Teacher, Doctor) without dead-ends. A Dynamic Job Generator (our target tomorrow) ensures any query generates realistic local matches, keeping the demo 100% inclusive.

