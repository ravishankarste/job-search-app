
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
