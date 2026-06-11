import { test, expect } from '@playwright/test';
import path from 'path';


test('should sign in, navigate to Rende, view all items, review a Chicken Quesadilla, edit it, and then delete it', async ({ page }) => {
  await page.goto('/signin');

  await page.locator('div:has-text("Username") > input').fill('ShaneSong');
  await page.locator('input[type="password"]').fill('00000000');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByRole('button', { name: 'rende', exact: false }).click();

  const viewAllButton = page.getByRole('button', { name: 'View All-Time Menu Items', exact: false });
  await viewAllButton.waitFor({ state: 'visible' });
  await viewAllButton.click({ force: true });

  await page.waitForTimeout(500);

  const quesadillaButton = page.getByRole('button', { name: '• Chicken Quesadilla', exact: true });
  await quesadillaButton.waitFor({ state: 'visible' });
  await quesadillaButton.click({ force: true });

  const dropDown = page.locator('[data-testid="ArrowDropDownCircleIcon"]');
  await dropDown.waitFor({ state: 'visible' });
  await dropDown.click();

  await page.locator('textarea[placeholder="Share your thoughts"]').fill('testing with playwright');

  await page.waitForTimeout(500);

  const ratingDropdown = page.locator('[aria-labelledby="rating-label"]');
  await ratingDropdown.scrollIntoViewIfNeeded();
  await ratingDropdown.click();

  await page.getByRole('option', { name: '4', exact: true }).click({ force: true });

  const firstImagePath = path.join(__dirname, 'testImage.png');
  await page.setInputFiles('input[type="file"]', firstImagePath);

  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'POST REVIEW', exact: false }).click({ force: true });

  const editButtonText = page.locator('span:has-text("Edit")');
  await editButtonText.waitFor({ state: 'visible' });
  await editButtonText.click({ force: true });

  await page.locator('textarea[placeholder="Share your thoughts"]').fill('edited review');

  await page.waitForTimeout(500);

  const editRatingDropdown = page.locator('[aria-labelledby="rating-label"]');
  await editRatingDropdown.scrollIntoViewIfNeeded();
  await editRatingDropdown.click();

  await page.getByRole('option', { name: '5', exact: true }).click({ force: true });
  
  const secondImagePath = path.join(__dirname, 'testImage2.png');
  await page.setInputFiles('input[type="file"]', secondImagePath);

  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'UPDATE REVIEW', exact: false }).click({ force: true });

  await page.waitForTimeout(1000);

  // Set up a listener for the native browser dialog before clicking delete
  page.once('dialog', async dialog => {
    await dialog.accept(); // This automatically clicks "OK"/"Yes" on the host prompt
  });

  const deleteButtonText = page.locator('span:has-text("Delete")');
  await deleteButtonText.waitFor({ state: 'visible' });
  await deleteButtonText.click({ force: true });
});