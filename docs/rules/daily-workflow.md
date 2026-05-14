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

### Step 3: Sprint Definition
- Define exactly 2-3 tasks for the session.
- Once defined, do not deviate until they are complete or a "Strategic Pivot" is agreed upon.

### Step 3.5: Founder Verification (SAFETY VALVE)
- Before Step 4, the AI MUST start the local server (`npm run dev`).
- The AI MUST ask the Founder to visually verify the changes on `localhost:5174`.
- The AI MUST wait for a verbal "Go Ahead" or "Push" from the Founder before moving to the production push.

### Step 4: The Build & Push (Standard Workflow)
- Follow `docs/rules/pushing-code.md` for the final delivery.

### Step 5: Synchronize Strategic State (MANDATORY)
- Before ending the session, the AI MUST update `docs/tasks/state.json`.
- Add all [COMPLETED] tasks from the session with accurate timestamps.
- Update the North Star Roadmap status.
- This ensures the Founder's "Imperial Memory" is always up to date.
