import { test, expect } from '@playwright/test';

test.describe('Udyog Marg - Golden Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    // We assume the user is already logged in or we handle auth
    // For now, we just navigate to the dashboard
    await page.goto('http://localhost:5173/dashboard');
  });

  test('Journey 1: Smart Job Discovery', async ({ page }) => {
    // 1. Enter a URL in the discovery box
    const discoveryInput = page.locator('input[placeholder*="Paste a LinkedIn"]');
    await discoveryInput.fill('https://www.linkedin.com/jobs/view/123456789');
    
    // 2. Click Analyze
    await page.click('button:has-text("Analyze Link")');
    
    // 3. Verify the "Smart Assistant" starts (Look for the pulse animation)
    await expect(page.locator('.animate-pulse')).toBeVisible();
    
    // 4. Wait for the modal to open (Manual fallback or success)
    await expect(page.locator('h2:has-text("Add Application")')).toBeVisible({ timeout: 20000 });
  });

  test('Journey 2: ATS Resume Analysis', async ({ page }) => {
    // 1. Navigate to Resumes
    await page.click('nav >> text=Resumes');
    
    // 2. Verify Resume list is visible
    await expect(page.locator('h1:has-text("Your Resumes")')).toBeVisible();
    
    // 3. Go back to Pipeline
    await page.click('nav >> text=Job Pipeline');
    
    // 4. Open a Job Detail
    await page.locator('.clean-card').first().click();
    
    // 5. Verify Match Score is visible
    await expect(page.locator('h3:has-text("ATS Match Score")')).toBeVisible();
  });

  test('Journey 3: Interview Coaching', async ({ page }) => {
    // 1. Open a Job Detail (Assuming first card)
    await page.goto('http://localhost:5173/jobs');
    await page.locator('.clean-card').first().click();
    
    // 2. Generate Prep Guide
    const generateBtn = page.locator('button:has-text("Generate Prep Guide")');
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      
      // 3. Verify coaching tips appear
      await expect(page.locator('text=Pro Tip:')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Your 30-Second Intro')).toBeVisible();
    }
  });

});
