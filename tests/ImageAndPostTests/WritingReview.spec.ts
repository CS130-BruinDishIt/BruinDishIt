import { test, expect } from '@playwright/test';
import path from 'path';

test('should sign in, navigate to Bplate, select item, and post a review', async ({ page }) => {
  await page.goto('/signin');

  await page.locator('div:has-text("Username") > input').fill('ShaneSong');
  await page.locator('input[type="password"]').fill('00000000');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByRole('button', { name: 'Bplate', exact: false }).click();

  const oatmealButton = page.getByRole('button', { name: 'Savory Oatmeal w/Spinach, Mushrooms & Egg', exact: false });
  await oatmealButton.waitFor({ state: 'visible' });
  await oatmealButton.click({ force: true });

  const dropDown = page.locator('[data-testid="ArrowDropDownCircleIcon"]');
  await dropDown.waitFor({ state: 'visible' });
  await dropDown.click();

  await page.locator('textarea[placeholder="Share your thoughts"]').fill('testing with playwright');

  await page.waitForTimeout(500);

  const ratingDropdown = page.locator('[aria-labelledby="rating-label"]');
  await ratingDropdown.scrollIntoViewIfNeeded();
  await ratingDropdown.click();

  await page.getByRole('option', { name: '4', exact: true }).click({ force: true });

  await page.getByRole('button', { name: 'Upload image' }).click();

  const localImagePath = path.join(__dirname, 'testImage.png');
  await page.setInputFiles('input[type="file"]', localImagePath);

  await page.getByRole('button', { name: 'POST REVIEW', exact: false }).click({ force: true });
});
