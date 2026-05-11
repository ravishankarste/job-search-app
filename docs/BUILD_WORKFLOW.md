# 🏛️ Sovereign Build Workflow

This protocol governs all code contributions to the Udyog Marg platform. To maintain our status as a "Hardened Fortress," every push to GitHub must pass the following sequence.

## 🛡️ The Mandatory Sequence

### 1. 🏗️ Production Build (`npm run build`)
- **Action**: Runs `tsc` (TypeScript) and `vite build`.
- **Purpose**: Ensures 100% type safety and bundle integrity.
- **Critical Lesson**: Strict TypeScript settings will fail the build on unused imports. Clean code is mandatory for deployment.

### 2. 🧪 Logic Validation (`npm test`)
- **Action**: Runs the Vitest suite.
- **Purpose**: Verifies that the core algorithms (Matching, Analysis, Sentiment) are mathematically sound and regression-free.

### 3. 🏃‍♂️ Sanity Decathlon (`npm run test:sanity`)
- **Action**: Runs the Playwright E2E suite.
- **Purpose**: Navigates the 10 critical "Gates" of the user journey. Verifies that UI changes haven't broken the user experience.

### 4. 📤 Secure Push (`git push`)
- **Condition**: Only executed if steps 1-3 return **EXIT CODE 0**.

---

## ⚖️ Why We Do This
As an early-stage platform, we move fast. **Hardening** ensures that our velocity doesn't become our liability. Stable `data-testid` attributes and a strict build workflow allow us to scale the feature set without breaking the foundation.

> "A fortress is only as strong as its weakest link. We do not deploy weak links."
