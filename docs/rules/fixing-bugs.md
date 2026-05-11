# Workflow: Fixing Bugs

Follow these steps when something isn't working right.

### Step 1: Prove the Bug
- Don't guess. Look at the error message or the logs.
- Try to make the bug happen again so you know exactly what causes it.

### Step 2: Find the Root Cause
- Find the exact file and line of code that is failing.
- Explain why it is failing before you change anything.

### Step 3: Fix Only the Bug
- Write the simplest fix possible.
- Do not change other parts of the code while you are fixing the bug.
- If you find other things to improve, do that in a separate task.

### Step 4: Verify the Fix
- Make the bug happen again to prove it's gone.
- Run `npm run build` and `npm run test` to make sure you didn't break anything else.
