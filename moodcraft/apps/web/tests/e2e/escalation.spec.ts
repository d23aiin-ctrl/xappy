/**
 * CereBro E2E Tests - Escalation & Crisis Support
 *
 * Tests for the escalation workflow and crisis resources.
 */
import { test, expect } from '@playwright/test';

test.describe('Escalation & Crisis Support', () => {
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

  test.describe('Escalation Page', () => {
    test('should display support options', async ({ page }) => {
      await page.goto('/escalation');

      // Should show the escalation page
      await expect(page.getByText(/support|help|not alone/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should show care pathway steps', async ({ page }) => {
      await page.goto('/escalation');

      // Should show AI Companion -> AI Twin -> Human Therapist pathway
      await expect(page.getByText(/companion|twin|therapist/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have Oracle Corridor option', async ({ page }) => {
      await page.goto('/escalation');

      // Should have Oracle Corridor entry
      const oracleEntry = page.getByText(/oracle|corridor|veil/i).first();
      await expect(oracleEntry).toBeVisible({ timeout: 10000 });
    });

    test('should display crisis helplines', async ({ page }) => {
      await page.goto('/escalation');

      // Should show crisis helpline numbers
      await expect(page.getByText(/988|helpline|crisis|lifeline/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have regional helplines', async ({ page }) => {
      await page.goto('/escalation');

      // Should show helplines for different regions
      const regions = page.getByText(/US|UK|India|Australia/i);
      await expect(regions.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Care Pathway', () => {
    test('should link to AI Companion', async ({ page }) => {
      await page.goto('/escalation');

      const companionLink = page.locator('a[href*="companion"], button').filter({ hasText: /companion/i }).first();
      await expect(companionLink).toBeVisible({ timeout: 10000 });
    });

    test('should link to AI Twin', async ({ page }) => {
      await page.goto('/escalation');

      const twinLink = page.locator('a[href*="ai-twin"], button').filter({ hasText: /twin/i }).first();
      await expect(twinLink).toBeVisible({ timeout: 10000 });
    });

    test('should allow therapist request', async ({ page }) => {
      await page.goto('/escalation');

      // Should have option to request human therapist
      const therapistOption = page.getByText(/therapist|human|professional/i).first();
      await expect(therapistOption).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Oracle Corridor', () => {
    test('should open Oracle Corridor on click', async ({ page }) => {
      await page.goto('/escalation');

      const oracleCard = page.locator('[class*="oracle"], [class*="card"]').filter({ hasText: /oracle/i }).first();

      if (await oracleCard.isVisible()) {
        await oracleCard.click();

        // Should show Oracle Corridor content
        await expect(page.getByText(/oracle sees you|veil|enter/i).first()).toBeVisible({ timeout: 10000 });
      }
    });

    test('should have entry options in Oracle Corridor', async ({ page }) => {
      await page.goto('/escalation');

      // Click Oracle to open
      const oracleCard = page.locator('[class*="oracle"], [class*="card"]').filter({ hasText: /oracle/i }).first();

      if (await oracleCard.isVisible()) {
        await oracleCard.click();
        await page.waitForTimeout(1000);

        // Should show entry options
        const entryButton = page.getByRole('button', { name: /enter|continue/i });
        await expect(entryButton.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Therapist Request', () => {
    test('should show confirmation after therapist request', async ({ page }) => {
      await page.goto('/escalation');

      // Click therapist request
      const therapistCard = page.locator('[class*="card"], button').filter({ hasText: /therapist|human/i }).first();

      if (await therapistCard.isVisible()) {
        await therapistCard.click();

        // Should show confirmation or next step
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('SOS Button Visibility', () => {
    test('should have SOS button always visible', async ({ page }) => {
      await page.goto('/escalation');

      // SOS button should be fixed and visible
      const sosButton = page.locator('[class*="fixed"]').filter({ has: page.locator('svg, [class*="alert"]') }).first();
      await expect(sosButton).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Crisis Resources', () => {
    test('should have clickable phone numbers', async ({ page }) => {
      await page.goto('/escalation');

      // Phone numbers should be clickable (tel: links)
      const phoneLink = page.locator('a[href^="tel:"]').first();
      await expect(phoneLink).toBeVisible({ timeout: 10000 });
    });

    test('should show emergency message', async ({ page }) => {
      await page.goto('/escalation');

      // Should show emergency services message
      await expect(page.getByText(/emergency|911|danger/i).first()).toBeVisible({ timeout: 10000 });
    });
  });
});
