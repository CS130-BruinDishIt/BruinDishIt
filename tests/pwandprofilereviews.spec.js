import { test, expect } from '@playwright/test';

test.describe.serial('Change Password', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
    await page.getByLabel('Username').fill('pwchangetest');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456789');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/', { timeout: 10000 });

    await page.goto('/user/6a29e3bdd64aa8d7c2151168');
  });

  test('shows error when current password is wrong', async ({ page }) => {
    await page.getByLabel('Current Password').fill('wrongPassword');
    await page.getByLabel('New Password', { exact: true }).fill('newPassword456');
    await page.getByLabel('Confirm New Password').fill('newPassword456');
    await page.getByRole('button', { name: 'Update Password' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.getByLabel('Current Password').fill('123456789');
    await page.getByLabel('New Password', { exact: true }).fill('newPassword456');
    await page.getByLabel('Confirm New Password').fill('differentPassword');
    await page.getByRole('button', { name: 'Update Password' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('successfully changes password and reverts it', async ({ page }) => {
    await page.getByLabel('Current Password').fill('123456789');
    await page.getByLabel('New Password', { exact: true }).fill('newPassword456');
    await page.getByLabel('Confirm New Password').fill('newPassword456');
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByRole('alert')).toContainText(/success/i);

    await page.reload();
    await page.getByLabel('Current Password').fill('newPassword456');
    await page.getByLabel('New Password', { exact: true }).fill('123456789');
    await page.getByLabel('Confirm New Password').fill('123456789');
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByRole('alert')).toContainText(/success/i);
  });

});

test.describe.serial('Navigate to a user review', () => {

  test('navigates to a user review', async ({ page }) => {
    await page.goto('/signin');
    await page.getByLabel('Username').fill('rakilkim');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456789');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/', { timeout: 10000 });
    await page.goto('/user/6a2003cf35032a2a4cc1167c');
    await page.getByRole('tab', { name: 'Reviews' }).click();
    await page.getByText('Lychee Custard').click();
    await expect(page).toHaveURL(/.*\/dining\/.*\/items#.*/);
  });
});