/**
 * CereBro E2E Tests - Dashboard
 *
 * Tests for the main dashboard (MindMetro) and navigation.
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test.describe('MindMetro Dashboard', () => {
    test('should display dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show dashboard content
      await expect(page.locator('[class*="dashboard"], main').first()).toBeVisible({ timeout: 10000 });
    });

    test('should show user greeting', async ({ page }) => {
      await page.goto('/dashboard');

      // Should greet user
      await expect(page.getByText(/welcome|hello|good|hi/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should display progress visualization', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show MindMetro map or progress
      const progressElement = page.locator('[class*="progress"], [class*="metro"], svg, [class*="chart"]').first();
      await expect(progressElement).toBeVisible({ timeout: 10000 });
    });

    test('should show daily ritual cards', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show ritual/activity cards
      const ritualCards = page.locator('[class*="card"], [class*="ritual"]');
      await expect(ritualCards.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display streak tracker', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show streak information
      await expect(page.getByText(/streak|day|consecutive/i).first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Navigation', () => {
    test('should have navigation to mood mirror', async ({ page }) => {
      await page.goto('/dashboard');

      const moodLink = page.locator('a[href*="mood"], button').filter({ hasText: /mood|check.*in/i }).first();
      await expect(moodLink).toBeVisible({ timeout: 10000 });
    });

    test('should have navigation to journal', async ({ page }) => {
      await page.goto('/dashboard');

      const journalLink = page.locator('a[href*="journal"], button').filter({ hasText: /journal/i }).first();
      await expect(journalLink).toBeVisible({ timeout: 10000 });
    });

    test('should have navigation to breath loops', async ({ page }) => {
      await page.goto('/dashboard');

      const breathLink = page.locator('a[href*="breath"], button').filter({ hasText: /breath|calm/i }).first();
      await expect(breathLink).toBeVisible({ timeout: 10000 });
    });

    test('should have navigation to companion', async ({ page }) => {
      await page.goto('/dashboard');

      const companionLink = page.locator('a[href*="companion"], button').filter({ hasText: /companion|chat|talk/i }).first();
      await expect(companionLink).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Badges & Gamification', () => {
    test('should show badge showcase', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show badges section
      const badgeSection = page.locator('[class*="badge"], [class*="achievement"]');
      await expect(badgeSection.first()).toBeVisible({ timeout: 10000 });
    });
  });
});

test.describe('Breath Loops', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test.describe('Breath Loops Page', () => {
    test('should display breathing exercise options', async ({ page }) => {
      await page.goto('/breath-loops');

      // Should show breath exercises
      await expect(page.getByText(/breath|breathing|calm/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have multiple breath types', async ({ page }) => {
      await page.goto('/breath-loops');

      // Should show different breath types (Box, 4-7-8, etc.)
      const breathTypes = page.locator('[class*="card"], button').filter({ hasText: /box|4-7-8|paced/i });
      await expect(breathTypes.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show animated breath circle', async ({ page }) => {
      await page.goto('/breath-loops');

      // Click to start a breath exercise
      const startButton = page.getByRole('button', { name: /start|begin|try/i }).first();

      if (await startButton.isVisible()) {
        await startButton.click();

        // Should show breathing animation
        const breathCircle = page.locator('[class*="circle"], [class*="breath"], svg');
        await expect(breathCircle.first()).toBeVisible({ timeout: 10000 });
      }
    });

    test('should display breathing instructions', async ({ page }) => {
      await page.goto('/breath-loops');

      // Start exercise
      const startButton = page.getByRole('button', { name: /start|begin|try/i }).first();

      if (await startButton.isVisible()) {
        await startButton.click();

        // Should show inhale/exhale instructions
        await expect(page.getByText(/inhale|exhale|hold|breathe/i).first()).toBeVisible({ timeout: 10000 });
      }
    });

    test('should have session timer', async ({ page }) => {
      await page.goto('/breath-loops');

      // Should show timer or duration
      const timer = page.locator('[class*="timer"], [class*="duration"]');
      await expect(timer.first()).toBeVisible({ timeout: 10000 });
    });
  });
});

test.describe('Journal', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test.describe('Journal Page', () => {
    test('should display journal interface', async ({ page }) => {
      await page.goto('/journal');

      // Should show journal UI
      await expect(page.getByText(/journal|write|entry/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have text editor', async ({ page }) => {
      await page.goto('/journal');

      // Should have rich text editor or textarea
      const editor = page.locator('textarea, [contenteditable="true"], [class*="editor"]');
      await expect(editor.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show adaptive prompt', async ({ page }) => {
      await page.goto('/journal');

      // Should show journal prompt
      await expect(page.getByText(/prompt|reflect|explore|consider/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have save button', async ({ page }) => {
      await page.goto('/journal');

      const saveButton = page.getByRole('button', { name: /save|submit|done/i });
      await expect(saveButton.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show previous entries', async ({ page }) => {
      await page.goto('/journal');

      // Should show entry list or history
      const entriesList = page.locator('[class*="entry"], [class*="list"], [class*="history"]');
      await expect(entriesList.first()).toBeVisible({ timeout: 10000 });
    });
  });
});
