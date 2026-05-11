# Workflow: Saving Data Safely

Follow this when building any feature that saves data to a file or a database.

### Step 1: Start with a Placeholder
- Always start with an empty or "loading" state. 
- Do not let the app save anything yet.

### Step 2: Load the Real Data
- Fetch the data from the database or disk as soon as the component starts.

### Step 3: Set the "Loaded" Switch
- Use a switch (like `isLoaded`) and set it to `true` ONLY after the data has successfully arrived.

### Step 4: Block the Auto-Save
- Never let the app save data if `isLoaded` is `false`.
- This prevents the app from accidentally saving an "empty" state over your real data.
