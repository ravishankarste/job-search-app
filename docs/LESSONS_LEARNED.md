
## 🧠 Persistence & Data Sovereignty (2026-05-10)
- **Insight**: Persistence without Hydration is a Data Deletion engine.
- **Problem**: React auto-save effects trigger on mount. If the initial state is a baseline/empty, and the hydration (load from disk) is asynchronous, the app will overwrite the real data with the baseline before the load completes.
- **Solution (The Hydration Shield)**: Always implement an `isHydrated` state. Explicitly block all disk-write operations (`saveToDisk`) until `isHydrated` is true.
- **Criticality**: Level 5 (Data Loss Prevention).
