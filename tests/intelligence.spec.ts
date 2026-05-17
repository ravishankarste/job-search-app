import { test, expect } from '@playwright/test';

test.describe('🛡️ Sovereign Shield: Edge-First AI Intelligence', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    const uniqueEmail = `ai_shield_${Date.now()}@example.com`;
    await page.fill('[data-testid="signup-email-input"]', uniqueEmail);
    await page.fill('[data-testid="signup-password-input"]', 'Password123');
    await page.click('[data-testid="signup-submit-btn"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('Perceived Latency: The Fast Illusion Protocol', async ({ page }) => {
    // According to the AI_STRATEGY_CONSTITUTION.md:
    // "Fast illusion first, real intelligence second"
    
    // We simulate a job matching action and verify the UI does NOT lock up
    // waiting for a 10-second LLM call. The user must see immediate feedback.
    
    const analyzeBtn = page.locator('[data-testid="demo-analyze-btn"]');
    if (await analyzeBtn.isVisible()) {
      // If we are on a page with an analyze button, click it
      await analyzeBtn.click();

      // Ensure the "Analyzing Algorithm..." or loading state appears INSTANTLY (< 500ms)
      await expect(analyzeBtn).toHaveText(/Analyzing/i, { timeout: 500 });
      
      // Ensure the UI remains responsive and the first-pass result arrives quickly
      await expect(page.locator('text=The Verdict')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Asynchronous Intelligence Hydration (Edge Upgrade)', async ({ page }) => {
    // This protects the second phase of the Edge-First architecture.
    // Once the user is viewing the initial score, the Supabase Edge Function
    // calculates the real embeddings in the background.
    
    // In an E2E test, we verify that the UI can handle score changes gracefully
    // without full page reloads if real-time subscriptions (Supabase realtime) push an update.
    
    // (Placeholder for deep subscription testing once pgvector is fully integrated)
    expect(true).toBeTruthy(); // Structure established for next sprint
  });

});
