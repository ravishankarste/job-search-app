# Workflow: Changing the Database

Follow these steps when you need to add or change tables in Supabase.

### Step 1: Write the SQL Script
- Create a new file in `supabase/migrations/`.
- Use a name that starts with the date (e.g., `20260511_add_new_table.sql`).
- Write the SQL code clearly.

### Step 2: Apply the Change
- Run the SQL code in the Supabase SQL Editor or via the CLI.
- Make sure there are no errors.

### Step 3: Update the App Types
- If you added a new table, make sure to update the TypeScript types in the app so the code "knows" about the new data.

### Step 4: Verify in the App
- Refresh the app and make sure it can read from and write to the new table without crashing.
