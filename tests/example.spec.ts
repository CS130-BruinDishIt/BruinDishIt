import { test, expect } from '@playwright/test';
import { diningLocations } from '../frontend/src/data/diningLocations';

// Preliminary testing
test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BruinDishIt/);
});

// Navbar testing
test('Navbar home button navigates to home', async ({ page }) => {
  await page.goto('/signin');
  await page.locator('.home-button').click();
  await expect(page).toHaveURL('/');
});

test('Navbar signin button navigates to signin page', async ({ page }) => {
  await page.goto('/');
  await page.locator('.profile-button').click();
  await expect(page).toHaveURL('/signin');
});
