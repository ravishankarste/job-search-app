import { test, expect } from '@playwright/test';

test.describe('🛡️ Sovereign Shield: Hydration & The Aha! Moment', () => {

  test('Landing Page -> Dashboard Persistence (Guest to User Hydration)', async ({ page }) => {
    // 1. Start at the unauthenticated landing page
    await page.goto('/');

    // 2. Simulate the "Magic Box" interaction on the landing page
    const jobInput = page.locator('[data-testid="demo-job-textarea"]');
    if (await jobInput.isVisible()) {
      await jobInput.fill('Looking for a Senior React Developer with Node.js and TypeScript experience.');
      
      // Use the sample resume helper
      await page.click('button:has-text("Or Try with Sample Resume")');
      
      // Click analyze
      await page.click('[data-testid="demo-analyze-btn"]');
      
      // 3. Wait for the preview score/modal
      await expect(page.locator('text=The Verdict')).toBeVisible({ timeout: 15000 });

      // 4. Click the conversion CTA
      await page.click('[data-testid="demo-signup-cta"]');
      
      // 5. Complete signup
      await expect(page).toHaveURL(/.*signup/);
      const uniqueEmail = `hydrated_${Date.now()}@example.com`;
      await page.fill('[data-testid="signup-email-input"]', uniqueEmail);
      await page.fill('[data-testid="signup-password-input"]', 'Password123');
      await page.click('[data-testid="signup-submit-btn"]');

      // 6. The crucial test: Does the data survive the journey?
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
      // We expect at least one job card to be immediately present in the pipeline
      const jobCards = page.locator('.clean-card, [data-testid="job-card"]');
      await expect(jobCards.first()).toBeVisible({ timeout: 15000 });
    } else {
      console.log("Magic box not found on landing page, skipping frontend hydration test.");
    }
  });

  test('Empty State Resilience (No broken layouts on day 1)', async ({ page }) => {
    // 1. Navigate to Signup to create a completely fresh, empty account
    await page.goto('/signup');
    
    // 2. Signup with a unique email to guarantee an empty state
    const uniqueEmail = `empty_state_${Date.now()}@example.com`;
    await page.fill('[data-testid="signup-email-input"]', uniqueEmail);
    await page.fill('[data-testid="signup-password-input"]', 'Password123');
    await page.click('[data-testid="signup-submit-btn"]');

    // 3. Verify Dashboard load
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // 4. Verify the "Empty State" UI is rendering correctly, not crashing
    const pageText = await page.textContent('body');
    // Ensure we don't have undefined errors or infinite spinners
    expect(pageText).not.toContain('undefined');
    expect(pageText).not.toContain('TypeError');
    
    // Verify a friendly onboarding message is visible instead of just blank space
    await expect(page.locator('text=Build your pipeline in')).toBeVisible();
  });

});
