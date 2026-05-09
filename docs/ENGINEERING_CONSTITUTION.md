# 🛡️ Udyog Marg: Engineering Constitution

This document defines the strict, structured workflow for all development, debugging, and architectural work on the Udyog Marg platform.

## 📜 Global Rules
1. **Never jump directly into coding.**
2. **Never assume requirements.**
3. **Never modify large sections unnecessarily.**
4. **Always reason step-by-step.**
5. **Always verify before concluding.**
6. **Always explain tradeoffs briefly.**
7. **Always prefer maintainable and production-safe solutions.**
8. **Always preserve existing working functionality.**
9. **Always minimize regressions.**
10. **If information is missing, ask focused clarification questions first.**

---

## 🚀 Master Execution Principle (For EVERY Task)
1. **Understand**
2. **Analyze**
3. **Plan**
4. **Execute**
5. **Verify**
6. **Improve**

---

## 🛠️ Detailed Workflows

### 💻 Coding Workflow
- **STEP 1 — Requirement Analysis**: Restate task, identify inputs/outputs, constraints, edge cases.
- **STEP 2 — Context Analysis**: Analyze existing architecture, patterns, and dependencies.
- **STEP 3 — Impact Analysis**: Predict breakage, regression risks, and performance/UI/API impact.
- **STEP 4 — Solution Planning**: Files to modify, logic changes, component changes.
- **STEP 5 — Implementation**: Clean modular code, follow patterns, descriptive naming.
- **STEP 6 — Self-Review**: Verify logic, syntax, imports, edge cases, type safety.
- **STEP 7 — Regression Analysis**: Analyze what may break and what should be retested.
- **STEP 8 — Testing Strategy**: Generate unit, integration, and user-flow tests.
- **STEP 9 — Final Validation**: Ensure requirement is solved and production-ready.

### 🐞 Debugging Workflow
- **STEP 1 — Define the Issue**: Identify expected vs. actual behavior and error messages.
- **STEP 2 — Gather Evidence**: Analyze logs, stack traces, and network requests.
- **STEP 3 — Isolate Root Cause**: Systematically narrow down possibilities.
- **STEP 4 — Form Hypotheses**: Rank potential causes by probability.
- **STEP 5 — Verify Hypotheses**: Test assumptions one-by-one.
- **STEP 6 — Minimal Fix**: Fix root cause only, avoid side effects.
- **STEP 7 — Validate Fix**: Confirm resolution and check for regressions.
- **STEP 8 — Prevent Future Issues**: Suggest logging, monitoring, and architecture improvements.

### 🎨 UI/UX Workflow
1. Understand user goal.
2. Analyze usability issues.
3. Improve hierarchy, accessibility, and responsiveness.
4. Validate real-world usability.

---

## 📑 Output Format Rules
For every technical task, provide:
1. **Analysis**
2. **Risks**
3. **Plan**
4. **Implementation**
5. **Validation**
6. **Regression Checks**
7. **Next Recommendations**

---
*Last Updated: 2026-05-09*
