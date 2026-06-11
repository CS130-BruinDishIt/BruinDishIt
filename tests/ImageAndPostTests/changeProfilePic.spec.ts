import { test, expect } from '@playwright/test';
import path from 'path';



test('should sign in, navigate to user profile via menu, and upload a new image', async ({ page }) => {
  await page.goto('/signin');

  await page.locator('div:has-text("Username") > input').fill('ShaneSong');
  await page.locator('input[type="password"]').fill('00000000');

  await page.getByRole('button', { name: 'Sign In' }).click();

  const profileButton = page.locator('button.profile-button');
  await profileButton.waitFor({ state: 'visible' });
  await profileButton.click({ force: true });
  
  await page.locator('.profile-menu-item:has-text("Profile")').click();

  await page.getByRole('button', { name: 'CHOOSE IMAGE', exact: false }).click();

  const localImagePath = path.join(__dirname, 'testImage.png');
  await page.setInputFiles('input[type="file"]', localImagePath);

  const avatarImg = page.locator('.profile-pic img');

  await expect(avatarImg).toHaveAttribute('src', /.*ProfilePics.*/);
});