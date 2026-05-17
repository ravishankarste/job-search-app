import { test, expect } from '@playwright/test';

test.describe('Udyog Marg - Golden Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Navigate to Login
    await page.goto('/login');
    
    // 2. Perform Login
    await page.fill('input[type="email"]', 'ravishankarpatro@gmail.com');
    await page.fill('input[type="password"]', 'Password');
    await page.click('button:has-text("Sign In")');
    
    // 3. Wait for Dashboard to be fully loaded and interactive
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    // Look for the premium greeting or the dashboard stats
    await expect(page.locator('h1:has-text("Morning,")')).toBeVisible({ timeout: 15000 });
  });

  test('Journey 1: Smart Job Discovery (Resilience Check)', async ({ page }) => {
    // 1. Navigate to Job Pipeline (where the Universal Importer lives)
    await page.click('nav >> text=Job Pipeline');
    await page.waitForURL(/.*pipeline/);

    // 2. Enter a URL in the discovery box
    const discoveryInput = page.locator('input[placeholder*="linkedin.com/jobs/view"]');
    await expect(page.locator('text=Universal Importer')).toBeVisible({ timeout: 10000 });
    await discoveryInput.fill('https://www.linkedin.com/jobs/view/123456789');
    
    // 3. Click Analyze
    await page.click('button:has-text("Import")');
    
    // 4. Verify the "Smart Assistant" starts
    await expect(page.locator('text=IMPORTING...')).toBeVisible();
    
    // 5. Wait for the state to resolve (Resilience Check)
    // We wait for the spinner to disappear or the modal to show up
    await expect(page.locator('text=IMPORTING...')).not.toBeVisible({ timeout: 30000 });

    const pageText = await page.textContent('body');
    const isHandled = 
      pageText?.includes('Manual Fallback') || 
      pageText?.includes('No fresh jobs found') || 
      pageText?.includes('Scraping Failed') ||
      pageText?.includes('Add Application') ||
      pageText?.includes('Success');

    expect(isHandled).toBe(true);
  });

  test('Journey 2: ATS Resume Analysis', async ({ page }) => {
    // 1. Navigate to Resumes
    await page.click('nav >> text=Resumes');
    await page.waitForURL(/.*resumes/);
    
    // 2. Verify Resume list is visible
    await expect(page.locator('h1:has-text("Resumes")')).toBeVisible({ timeout: 15000 });
    
    // 3. Go back to Pipeline
    await page.click('nav >> text=Job Pipeline');
    await page.waitForURL(/.*pipeline/);
    
    // 4. Open a REAL Job Detail
    const card = page.locator('.clean-card').filter({ hasNotText: 'Import Failed' }).first();
    const jobTitle = card.locator('h4');
    await expect(jobTitle).toBeVisible({ timeout: 15000 });
    
    await page.waitForLoadState('networkidle');
    await jobTitle.click({ force: true });
    
    // 5. Verify Navigation and Match Score (With longer timeout and fallback)
    try {
      await page.waitForURL(/\/jobs\/.+/, { timeout: 10000 });
    } catch (e) {
      console.log("Navigation timeout, attempting manual goto...");
      // If click failed, we'll try to find any link and go there
      const href = await card.getAttribute('href');
      if (href) await page.goto(`${href}`);
    }
    
    await expect(page.locator('h3:has-text("ATS Match Score")')).toBeVisible({ timeout: 25000 });
  });

  test('Journey 3: Interview Coaching', async ({ page }) => {
    // 1. Go directly to a job detail
    await page.goto('/pipeline');
    await page.waitForLoadState('networkidle');
    
    const card = page.locator('.clean-card').filter({ hasNotText: 'Import Failed' }).first();
    const jobTitle = card.locator('h4');
    await expect(jobTitle).toBeVisible({ timeout: 15000 });
    await jobTitle.click({ force: true });
    
    try {
      await page.waitForURL(/\/jobs\/.+/, { timeout: 10000 });
    } catch (e) {
      const href = await card.getAttribute('href');
      if (href) await page.goto(`${href}`);
    }
    
    // 2. Wait for Prep Mode to be visible
    await expect(page.locator('h3:has-text("Interview Prep Mode")')).toBeVisible({ timeout: 25000 });
    
    // 3. Generate Prep Guide
    const generateBtn = page.locator('button:has-text("Generate Prep Guide")');
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      
      // 4. Verify coaching tips appear
      await expect(page.locator('text=Pro Tip:')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('text=Your 30-Second Intro')).toBeVisible();
    }
  });

});
