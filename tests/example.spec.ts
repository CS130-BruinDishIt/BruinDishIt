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


// Test signing in with incorrent user/pswd
test('signin error for invalid credentials', async ({ page }) => {
  await page.goto('/signin');

  // fill out form with wrong credentials
  await page.getByLabel('Username').fill('fakeuser');
  await page.getByLabel('Password', { exact: true }).fill('testpassword'); // eye icon also has password label...
  await page.getByRole('button', { name: /sign in/i }).click();

  // error message should pop up
  await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  await expect(page).toHaveURL('/signin'); // should stay on signin page
});


// Test password mismatch error on signup
test('signup error when passwords do not match', async ({ page }) => {
  await page.goto('/signup');

  // fill out form with mismatched passwords
  await page.getByLabel('Username').fill(`testuser`);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByLabel('Confirm Password').fill('differentpassword');
  await page.getByRole('button', { name: /create account/i }).click();

  // error message should pop up
  await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  await expect(page).toHaveURL('/signup');
});