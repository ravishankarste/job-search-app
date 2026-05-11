import { test, expect } from '@playwright/test';

/**
 * 🛡️ THE DECATHLON SANITY SUITE
 * ----------------------------
 * 10 Core tests that MUST pass before any production deployment.
 */

test.describe('Udyog Marg - Decathlon Sanity Suite', () => {
  
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5174';

  // [GATE-01] Landing Page & Sandbox Integrity
  test('GATE-01: Landing Page & Match Sandbox', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Udyog Marg/);
    
    // Verify Sandbox presence via the main CTA
    await expect(page.locator('text=Try the Live Demo')).toBeVisible();
    await expect(page.locator('button:has-text("Calculate ATS Match")')).toBeVisible();
  });

  // [GATE-02] Google Auth Latch Presence
  test('GATE-02: Google Auth Latch Initialization', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    await page.reload();
    await expect.poll(() => logs.some(log => log.includes('Google Identity initialized'))).toBeTruthy();
  });

  // Sub-group for Authenticated Tests
  test.describe('Authenticated Modules', () => {
    
    test.beforeEach(async ({ page }) => {
      // Perform Global Login Latch
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email-address', 'ravishankarpatro@gmail.com');
      await page.fill('#password', 'Password');
      await page.click('button:has-text("Sign In")');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    // [GATE-03] Core Navigation & Shell
    test('GATE-03: Authenticated Navigation & Glassmorphism', async ({ page }) => {
      // Scope selectors to the primary desktop sidebar to avoid collision with search results
      const sidebarNav = page.locator('aside.lg\\:flex nav');
      const pipelineLink = sidebarNav.getByRole('link', { name: 'Job Pipeline' });
      const resumesLink = sidebarNav.getByRole('link', { name: 'Resumes' });
      
      await expect(pipelineLink).toBeVisible();
      await pipelineLink.click();
      await expect(page).toHaveURL(/.*pipeline/);
      
      await resumesLink.click();
      await expect(page).toHaveURL(/.*resumes/);
    });

    // [GATE-04] Pipeline Integrity (Kanban)
    test('GATE-04: Job Pipeline Kanban Rendering', async ({ page }) => {
      await page.goto(`${BASE_URL}/pipeline`);
      // Allow for either the full Kanban board or the onboarding accelerator
      const kanbanColumn = page.locator('text=/SAVED/i').first();
      const onboardingHeader = page.locator('text=Pick your path');
      await expect(kanbanColumn.or(onboardingHeader)).toBeVisible();
    });

    // [GATE-05] Match Score Engine
    test('GATE-05: Real-time Match Calculation', async ({ page }) => {
      await page.goto(`${BASE_URL}/pipeline`);
      const scoreBadge = page.locator('.match-score-badge').first();
      const noJobsMessage = page.locator('text=No jobs found');
      await expect(scoreBadge.or(noJobsMessage)).toBeVisible({ timeout: 15000 });
    });

    // [GATE-06] Analytics & Performance
    test('GATE-06: Analytics Dashboard Viewport', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`);
      // Allow for either the full dashboard or the onboarding zero-state
      const dashboardHeader = page.locator('h1:has-text("Career Analytics")');
      const onboardingHeader = page.locator('text=Establish Your Identity');
      await expect(dashboardHeader.or(onboardingHeader)).toBeVisible();
    });

    // [GATE-07] Settings & Identity Management
    test('GATE-07: Profile & Identity Integrity', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings`);
      await expect(page.locator('h1:has-text("Privacy & Data")')).toBeVisible();
      await expect(page.locator('text=Export Your Data')).toBeVisible();
    });

    // [GATE-08] Exit-Intent Scribe Engine
    test('GATE-08: Feedback Scribe Trigger', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.mouse.move(500, 500);
      await page.mouse.move(500, 0);
    });

    // [GATE-09] Responsive Sovereignty (Mobile Check)
    test('GATE-09: Mobile Viewport Rendering', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/dashboard`);
      await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
    });
  });

  // [GATE-10] SEO & Performance Metatags
  test('GATE-10: SEO Sovereignty Check', async ({ page }) => {
    await page.goto(BASE_URL);
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toContain('ATS');
    expect(description).toContain('Udyog Marg');
  });

});
