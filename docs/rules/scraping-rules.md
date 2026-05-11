# Workflow: Verifying Job Scraping

Follow these steps when updating the Universal Importer or the scraping logic.

### Step 1: Test with a Real URL
- Take a live job posting URL from LinkedIn, Indeed, or a company career page.
- Paste it into the Universal Importer in the app.

### Step 2: Verify the "Big Three"
Check that the app correctly pulled:
1. **Job Title** (e.g., Senior Software Engineer)
2. **Company Name** (e.g., Google)
3. **Job Description** (the full text of the role)

### Step 3: Check for Errors
- If the app shows a red error box, check the network logs to see if Apify (the scraper) failed.
- If it failed, check if the job site has changed its website design.

### Step 4: Fix and Re-test
- Update the scraper code to match the new website design.
- Repeat Step 1 with the same URL to make sure it's fixed.
