# Workflow: Pushing Code to GitHub

Follow these steps exactly before every push. Do not skip any step.

### Step 1: Batch Your Changes (Meaningful Chunks)
- DO NOT push after every single file edit.
- DO group related changes into one meaningful chunk (e.g., "UX Polish," "Security Hardening," or "Auth Fixes").
- Only push once you have reached a "Stable Plateau" where the feature or fix is complete.

### Step 2: Run the Production Build
Run this command to make sure there are no TypeScript errors or broken code:
`npm run build`
- **The Founder's Escalation**: If you cannot independently verify the build status or if you are unsure if the build succeeded, you MUST stop and ask the Founder: **"Is the build green on your end?"** Never proceed without a confirmed green state.

### Step 3: Run the Logic Tests
Run this command to make sure the core app math and logic still work:
`npm run test -- --run`

### Step 4: Run the Browser Tests (Sanity Decathlon)
Run this command to make sure the actual app screens work in the browser:
`npm run test:sanity`

### Step 4.1: The After-Action Cleanup (Resource Sovereignty)
- **Problem**: Test runners (like Playwright) often leave "Zombie Processes" that slow down the computer.
- **Action**: Immediately after Step 4, run a command to kill lingering test processes:
`pkill -f playwright || true`
- **Goal**: Maintain 100% workstation speed for the Founder.

### Step 5: The Human Confirmation Gate (MANDATORY)
- After all tests pass, the AI MUST NOT push automatically.
- The AI must present the test results and ask: **"Validation Success. Do you have anything to add, or shall I push this chunk now?"**
- ONLY push if the user gives explicit permission.

### Step 6: Push to GitHub
Only after the Human Confirmation Gate is passed, push the code:
`git add .`
`git commit -m "Your clear description"`
`git push`

### Step 7: Verify the Live Site
- Go to GitHub and wait for the "Build and Deploy" workflow to finish.
- Once it says "Success," open [upanita.com](https://upanita.com) and click around for 10 seconds.
- If everything looks good, the task is DONE.
