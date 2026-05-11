
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
