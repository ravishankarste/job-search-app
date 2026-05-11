# Workflow: Pushing Code to GitHub

Follow these steps exactly before every push. Do not skip any step.

### Step 1: Run the Production Build
Run this command to make sure there are no TypeScript errors or broken code:
`npm run build`

### Step 2: Run the Logic Tests
Run this command to make sure the core app math and logic still work:
`npm run test`

### Step 3: Run the Browser Tests (Sanity Decathlon)
Run this command to make sure the actual app screens work in the browser:
`npm run test:sanity`

### Step 4: Check for Unused Code
Check the build output for any "unused import" errors (like `Sparkles`). If they exist, fix them and go back to Step 1.

### Step 5: Push to GitHub
Only after Steps 1, 2, and 3 have passed, push the code:
`git add .`
`git commit -m "Your clear description"`
`git push`
