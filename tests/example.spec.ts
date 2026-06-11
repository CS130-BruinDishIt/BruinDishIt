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