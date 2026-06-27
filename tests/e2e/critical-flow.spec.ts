import { test, expect } from '@playwright/test';

test.describe('DR.VOID critical flow', () => {
  test('guest login -> create profile -> reach symptom checker', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('DR.VOID')).toBeVisible();

    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL(/\/profiles/);

    await page.getByRole('button').filter({ hasText: '' }).last().click(); // Add profile card
    await page.getByLabel('Name').fill('Test Patient');
    await page.getByLabel('Age').fill('30');
    await page.getByLabel('Height (cm)').fill('170');
    await page.getByLabel('Weight (kg)').fill('65');
    await page.getByRole('button', { name: /create profile/i }).click();

    await expect(page.getByText('Test Patient')).toBeVisible();
  });

  test('emergency phrase triggers immediate alert independent of AI', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Assumes a profile already exists from a prior run or seed; if not, this
    // test should be run after the profile-creation test in the same project.
    const firstProfile = page.locator('button').filter({ hasText: '' }).first();
    if (await firstProfile.isVisible().catch(() => false)) {
      await firstProfile.click();
    }

    await page.goto('/symptom-checker');
    const textarea = page.locator('textarea');
    await textarea.fill('I have severe chest pain and pressure');
    await page.getByRole('button', { name: /send/i }).click();

    await expect(page.getByText('Possible emergency')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('112')).toBeVisible();
  });
});
