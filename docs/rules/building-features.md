# Workflow: Building New Features

Follow these steps when adding any new code or UI elements.

### Step 1: Plain English Only
- Use simple, direct English for all buttons, labels, and messages.
- Avoid technical jargon or "fancy" marketing words.
- Example: Use "Upload Resume" instead of "Ingest Professional Artifact."

### Step 2: Automation Hardening (Mandatory)
- Every new button MUST have a `data-testid`.
- Every new input field MUST have a `data-testid`.
- Every new page container MUST have a `data-testid`.
- Format: `data-testid="[context]-[action]-[type]"` (e.g., `login-submit-btn`).

### Step 3: Design Alignment
- Use the established brand colors (Orange: `#FC6100`).
- Use the 40px spacing standard where applicable.
- Make sure components look good in the Dark Mode system.

### Step 4: Documentation Update
- If you find a better way to do something, add it to the `docs/LESSONS_LEARNED.md` file.
- If the workflow needs to change, update this document.
