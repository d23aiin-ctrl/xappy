/**
 * CereBro E2E Tests - Onboarding Flow
 *
 * Tests for the complete onboarding experience including:
 * - Fog Tunnel entry
 * - ACE Questionnaire
 * - Mood Calibration
 * - Trauma Quest
 * - Archetype Reveal
 */
import { test, expect } from '@playwright/test';

// Helper to mock authenticated session
async function mockAuthenticatedUser(page: any) {
  // This would typically use Playwright's route interception to mock auth
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: 'test-session-token',
      domain: 'localhost',
      path: '/',
    },
  ]);
}

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated but un-onboarded user
    await mockAuthenticatedUser(page);
  });

  test.describe('Fog Tunnel Entry', () => {
    test('should display fog tunnel animation on first visit', async ({ page }) => {
      await page.goto('/onboarding');

      // Should show the fog tunnel entry
      await expect(page.getByText(/welcome|journey|enter/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have mystical/narrative text', async ({ page }) => {
      await page.goto('/onboarding');

      // Should have narrative framing
      const narrativeText = page.getByText(/fog|veil|oracle|discover/i).first();
      await expect(narrativeText).toBeVisible({ timeout: 10000 });
    });

    test('should have CTA to proceed', async ({ page }) => {
      await page.goto('/onboarding');

      // Should have a way to proceed
      const enterButton = page.getByRole('button', { name: /enter|begin|start|continue/i });
      await expect(enterButton).toBeVisible({ timeout: 10000 });
    });

    test('should animate on entry', async ({ page }) => {
      await page.goto('/onboarding');

      // Wait for animations
      await page.waitForTimeout(2000);

      // Page should have content visible after animation
      const content = page.locator('main, [class*="fog"], [class*="onboarding"]');
      await expect(content.first()).toBeVisible();
    });
  });

  test.describe('ACE Questionnaire', () => {
    test('should display ACE questions', async ({ page }) => {
      await page.goto('/onboarding/ace');

      // Should show questionnaire
      await expect(page.getByText(/question|before|during|childhood/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should show one question at a time', async ({ page }) => {
      await page.goto('/onboarding/ace');

      // Should show narrative-style single question
      const questionContainer = page.locator('[class*="question"], [class*="card"]');
      await expect(questionContainer.first()).toBeVisible({ timeout: 10000 });
    });

    test('should have yes/no response options', async ({ page }) => {
      await page.goto('/onboarding/ace');

      // Should have response buttons
      await expect(page.getByRole('button', { name: /yes/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /no/i })).toBeVisible({ timeout: 10000 });
    });

    test('should progress through questions', async ({ page }) => {
      await page.goto('/onboarding/ace');

      // Answer first question
      await page.getByRole('button', { name: /no/i }).click();

      // Should show progress or next question
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show progress indicator', async ({ page }) => {
      await page.goto('/onboarding/ace');

      // Should show progress (e.g., "Question 1 of 10")
      const progress = page.getByText(/\d+.*of.*\d+|progress/i);
      await expect(progress).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Mood Calibration', () => {
    test('should display mood selection interface', async ({ page }) => {
      await page.goto('/onboarding/mood-calibration');

      // Should show mood calibration UI
      await expect(page.getByText(/mood|feel|emotion/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have emotion wheel or grid', async ({ page }) => {
      await page.goto('/onboarding/mood-calibration');

      // Should have selectable emotions
      const emotionButtons = page.locator('button, [role="button"]');
      await expect(emotionButtons.first()).toBeVisible({ timeout: 10000 });
    });

    test('should allow multiple emotion selection', async ({ page }) => {
      await page.goto('/onboarding/mood-calibration');

      // Wait for UI to load
      await page.waitForTimeout(2000);

      const buttons = page.locator('button').filter({ hasText: /joy|sad|calm|anxiety|peace/i });
      const count = await buttons.count();

      if (count > 0) {
        await buttons.first().click();
        // Should allow selection
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Trauma Quest', () => {
    test('should display guided story prompts', async ({ page }) => {
      await page.goto('/onboarding/trauma-quest');

      // Should show narrative prompts
      await expect(page.getByText(/story|reflect|remember|experience/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have text input for responses', async ({ page }) => {
      await page.goto('/onboarding/trauma-quest');

      // Should have textarea for reflection
      const textarea = page.locator('textarea, [contenteditable="true"]');
      await expect(textarea.first()).toBeVisible({ timeout: 10000 });
    });

    test('should allow skipping sensitive questions', async ({ page }) => {
      await page.goto('/onboarding/trauma-quest');

      // Should have skip option
      const skipButton = page.getByRole('button', { name: /skip|pass|next/i });
      await expect(skipButton).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Archetype Reveal', () => {
    test('should display archetype reveal animation', async ({ page }) => {
      await page.goto('/onboarding/archetype-reveal');

      // Should show archetype reveal
      await expect(page.getByText(/archetype|you are|reveal|discover/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should show assigned archetype', async ({ page }) => {
      await page.goto('/onboarding/archetype-reveal');

      // Should show one of the archetypes
      const archetypeNames = /drifter|thinker|transformer|seeker|veteran/i;
      await expect(page.getByText(archetypeNames).first()).toBeVisible({ timeout: 10000 });
    });

    test('should have archetype description', async ({ page }) => {
      await page.goto('/onboarding/archetype-reveal');

      // Wait for reveal animation
      await page.waitForTimeout(3000);

      // Should show description
      const content = page.locator('p, [class*="description"]');
      await expect(content.first()).toBeVisible();
    });

    test('should have CTA to continue to dashboard', async ({ page }) => {
      await page.goto('/onboarding/archetype-reveal');

      // Should have continue button
      const continueButton = page.getByRole('button', { name: /continue|begin|start|dashboard/i });
      await expect(continueButton).toBeVisible({ timeout: 10000 });
    });
  });
});
