/**
 * CereBro E2E Tests - Authentication
 *
 * Tests for login, registration, and session management.
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login');

      // Should show login form elements
      await expect(page.getByRole('heading', { name: /sign in|login|welcome/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/auth/login');

      // Try to submit without entering anything
      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Should show validation errors
      await expect(page.getByText(/required|enter|invalid/i)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');

      await page.getByLabel(/email/i).fill('invalid@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Should show error message
      await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible({ timeout: 10000 });
    });

    test('should have link to registration', async ({ page }) => {
      await page.goto('/auth/login');

      const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });
      await expect(registerLink).toBeVisible();
    });

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/auth/login');

      const forgotLink = page.getByRole('link', { name: /forgot|reset/i });
      await expect(forgotLink).toBeVisible();
    });
  });

  test.describe('Registration Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/auth/register');

      await expect(page.getByRole('heading', { name: /sign up|register|create/i })).toBeVisible();
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/register');

      await page.getByLabel(/email/i).fill('notanemail');
      await page.getByLabel(/password/i).first().click(); // Blur email field

      await expect(page.getByText(/valid email|invalid/i)).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/auth/register');

      await page.getByLabel(/password/i).first().fill('123');
      await page.getByLabel(/name/i).click(); // Blur password field

      // Should show password requirements
      await expect(page.getByText(/characters|strong|weak/i)).toBeVisible();
    });

    test('should have link to login', async ({ page }) => {
      await page.goto('/auth/register');

      const loginLink = page.getByRole('link', { name: /sign in|login|already have/i });
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should redirect from onboarding without auth', async ({ page }) => {
      await page.goto('/onboarding');

      await expect(page).toHaveURL(/.*login/);
    });
  });
});
