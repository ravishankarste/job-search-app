# 🏛️ Workflow: The Daily Sovereign Ritual

Follow these steps at the start of EVERY session. No exceptions.

---

### Step 1: The WhatsApp Handshake (MANDATORY)
The AI MUST start the conversation by asking: 
> **"Founder, check your WhatsApp. What 'Live Intelligence' or tasks did you capture today?"**

- The AI will then wait for the user to dump their notes.
- The AI will sort these notes into:
    - 🔴 **[BUG]**: Something is broken.
    - 🔵 **[FEATURE]**: A new idea for the product.
    - 🟢 **[GTM]**: Growth, marketing, or outreach tasks.

### Step 2: The Roadmap Alignment
- The AI will check the `docs/ROADMAP.md`.
- The AI will ask: **"Do any of these new items change our priority for the week, or should they go to the Backlog?"**
- The Roadmap Guardian (AI) will push back if the user tries to start a "Random Feature" that doesn't align with the North Star.

### Step 3: Sprint Definition & Psychology Audit
- Define exactly 2-3 tasks for the session.
- **UX Manifesto Audit**: For each task, the AI MUST verify:
    - Does this solve for the `confused_user` or `anxious_user`?
    - Is there **One Clear Next Step**?
    - Does it handle **Non-Linear Recovery** (Refresh/Abandon)?
- Once defined, do not deviate until they are complete or a "Strategic Pivot" is agreed upon.

### Step 3.5: Founder Verification (SOVEREIGN PORT 5174)
- Before Step 4, the AI MUST start the local server explicitly on port 5174 (`npm run dev -- --port 5174`).
- **Standard Port Enforcement**: The dev environment MUST always be on `localhost:5174`. If Vite auto-increments the port (e.g., 5175, 5180), the AI MUST kill the conflicting processes and restart on 5174.
- The AI MUST ask the Founder to visually verify the changes on `localhost:5174`.
- The AI MUST wait for a verbal "Go Ahead" or "Push" from the Founder before moving to the production push.

### Step 4: The Build & Push (Standard Workflow)
- Follow `docs/rules/pushing-code.md` for the final delivery.

### Step 5: Synchronize Strategic State (MANDATORY)
- Before ending the session, the AI MUST update `docs/tasks/state.json`.
- Add all [COMPLETED] tasks from the session with accurate timestamps.
- Update the North Star Roadmap status.
- This ensures the Founder's "Imperial Memory" is always up to date.
