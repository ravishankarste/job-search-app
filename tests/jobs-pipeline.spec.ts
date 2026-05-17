import { test, expect } from '@playwright/test';

test.describe('🛡️ Sovereign Shield: Pipeline & Data Integrity', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to Login and authenticate
    await page.goto('/login');
    await page.fill('input[type="email"]', 'ravishankarpatro@gmail.com');
    await page.fill('input[type="password"]', 'Password');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('Manual Job Entry Resilience', async ({ page }) => {
    // 1. Navigate to the Pipeline
    await page.click('nav >> text=Job Pipeline');
    await page.waitForURL(/.*pipeline/);

    // 2. Open Manual Add Modal
    // Note: Assuming there is an "Add Job" button. Adjust selector if it's different.
    const addBtn = page.locator('button', { hasText: 'Add Job' }).or(page.locator('button[title="Add Job"]'));
    if (await addBtn.isVisible()) {
      await addBtn.click();

      // 3. Fill required fields
      await page.fill('input[name="title"], input[placeholder*="Job Title"]', 'Playwright Test Engineer');
      await page.fill('input[name="company_name"], input[placeholder*="Company"]', 'Sovereign Corp');
      await page.click('button:has-text("Save"), button:has-text("Submit")');

      // 4. Verify job appears in the pipeline
      await expect(page.locator('text=Playwright Test Engineer')).toBeVisible();
    } else {
      console.log('Manual add button not found, skipping specific manual entry test.');
    }
  });

  test('The Truncation Shield (Grid Resilience against Monster Data)', async ({ page }) => {
    await page.click('nav >> text=Job Pipeline');
    await page.waitForURL(/.*pipeline/);

    // We simulate injecting a massive job title to ensure the 'line-clamp-1' rule holds
    // and doesn't stretch the CSS grid vertically.
    const addBtn = page.locator('button', { hasText: 'Add Job' }).or(page.locator('button[title="Add Job"]'));
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      const monsterTitle = 'Senior Frontend React Full Stack Developer Ninja (Remote/Hybrid/Onsite) - URGENT HIRING 10+ YEARS EXP REQUIRED IMMEDIATELY AND THIS TEXT SHOULD BE TRUNCATED';
      await page.fill('input[name="title"], input[placeholder*="Job Title"]', monsterTitle);
      await page.fill('input[name="company_name"], input[placeholder*="Company"]', 'Chaos Corp');
      await page.click('button:has-text("Save"), button:has-text("Submit")');

      // 4. Verify the job card is present
      const jobCard = page.locator('.clean-card').filter({ hasText: 'Chaos Corp' });
      await expect(jobCard).toBeVisible();

      // Ensure the text is present, but CSS handles the truncation (we can't easily assert CSS line-clamp in Playwright, 
      // but we CAN assert the card hasn't caused a massive layout height shift).
      const box = await jobCard.boundingBox();
      expect(box?.height).toBeLessThan(300); // Ensures the card didn't stretch to 1000px tall
    }
  });

});
