import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/BruinDishIt/);
});

test('clicking a dining location navigates to dining page', async ({ page }) => {
  await page.goto('/');

  // click first dining button (adjust name if needed)
  const button = page.locator('button.circle-button').first();
  await button.click();

  // should go to /dining/:id
  await expect(page).toHaveURL(/\/dining\//);

  // verify page actually loaded
  await expect(page.locator('body')).not.toBeEmpty();
});

test('navbar home button navigates to home', async ({ page }) => {
  await page.goto('/signin');

  await page.locator('.home-button').click();

  await expect(page).toHaveURL('/');
});

test('signin button navigates to signin page', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /sign in/i }).click();

  await expect(page).toHaveURL('/signin');
});
