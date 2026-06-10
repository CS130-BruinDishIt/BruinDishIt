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

const password = 'testpassword';

// Test creating account and signing in
test('creating account and signing in', async ({ page }) => {
  // vars for test account
  const username = `testuser_${Date.now()}`; // unique username using date

  // go to signup page
  await page.goto('/signup');

  // fill out create account form
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password); // use exact match for password label since two fields contain 'password'
  await page.getByLabel('Confirm Password').fill(password);
  await page.getByRole('button', { name: /create account/i }).click(); // click create account button

  // should redirect to signin page
  await expect(page).toHaveURL('/signin');
  await expect(page.getByText(/account created successfully/i)).toBeVisible(); //ignore caps and that phrase has to be part of message shown

  // sign in with new account
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password); // eye icon also has password label...
  await page.getByRole('button', { name: /sign in/i }).click(); // click sign in button

  // should redirect to home page
  await expect(page).toHaveURL('/');

  // Navbar should now show logged-in user profile button instead of SIGN IN
  await page.locator('.profile-button').click(); // click profile button to open menu using locator
  await expect(page.getByText(username)).toBeVisible(); // check that username is displayed in menu dropdown
  await expect(page.getByText(/profile/i)).toBeVisible(); // check that profile is displayed in menu dropdown
  await expect(page.getByText(/sign out/i)).toBeVisible(); // check that sign out is displayed in menu dropdown

  // sign out
  await page.getByText(/sign out/i).click(); // sign out from dropdown
  await expect(page).toHaveURL('/signin'); // should redirect to signin page
  await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible(); // navbar should show SIGN IN again
})


// Test creating account and signing in with incorrent user/pswd
test('signin error for invalid credentials', async ({ page }) => {
  const username = 'fakeuser';
  await page.goto('/signin');

  // fill out form with wrong credentials
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password); // eye icon also has password label...
  await page.getByRole('button', { name: /sign in/i }).click();

  // error message should pop up
  await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  await expect(page).toHaveURL('/signin'); // should stay on signin page
});


// Test password mismatch error on signup
test('signup error when passwords do not match', async ({ page }) => {
  await page.goto('/signup');

  // fill out form with mismatched passwords
  await page.getByLabel('Username').fill(`testuser_${Date.now()}`);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByLabel('Confirm Password').fill('differentpassword');
  await page.getByRole('button', { name: /create account/i }).click();

  // error message should pop up
  await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  await expect(page).toHaveURL('/signup');
});