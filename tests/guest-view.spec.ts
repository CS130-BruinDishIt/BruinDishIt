import { test, expect } from '@playwright/test';
import { diningLocations } from '../frontend/src/data/diningLocations';

// Preliminary testing
test('Site has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BruinDishIt/);
});

// Navbar testing: home
test('Navbar home button navigates to /home', async ({ page }) => {
  await page.goto('/signin');
  await page.locator('.home-button').click();
  await expect(page).toHaveURL('/');
});

// Navbar testing: signin
test('Navbar signin button navigates to /signin', async ({ page }) => {
  await page.goto('/');
  await page.locator('.profile-button').click();
  await expect(page).toHaveURL('/signin');
});

// Homepage testing: dining hall pages
for (const location of diningLocations) {
  test(`${location.shortname} shows correct hall name`, async ({ page }) => {
    await page.goto(`/dining/${location.id}`);
    await expect( page.locator('h3', { hasText: location.name }) ).toBeVisible();
  });
}

// Dining page testing: menu history
test('Navigate to menu history page from dining page', async ({ page }) => {
  await page.goto('/dining/bruin-cafe');
  const btn = page.getByRole('button', { name: /all-time menu items/i });
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(page).toHaveURL(/\/items$/);
});

// Dining page testing: go to buttons
test('Each Go To button scrolls to its meal section', async ({ page }) => {
  await page.goto('/dining/bruin-cafe');
  const buttons = page.locator('[data-testid^="meal-button-"]');
  await expect(buttons.first()).toBeVisible();
  const count = await buttons.count();

  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator('h4').first()).toBeVisible();
  }
});

// Dining page testing: back to top button
// test('BackToTop appears after scrolling and returns to top', async ({ page }) => {
//   await page.goto('/dining/bruin-cafe');
//   const fab = page.getByTestId('back-to-top');
//   await expect(fab).toBeHidden();
//   for (let i = 0; i < 10; i++) {
//     await page.mouse.wheel(0, 500);
//   }
//   await expect(fab).toBeVisible({ timeout: 10000 });
//   await fab.click();
//   await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
// });

// Dining page testing: hall reviews
test('Open hall review drawer', async ({ page }) => {
  await page.goto('/dining/bruin-cafe');
  const reviewButton = page.getByRole('button', { name: /view location reviews/i });
  await expect(reviewButton).toBeVisible();
  await reviewButton.click();
  const drawer = page.locator('.MuiDrawer-root');
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('heading', { name: /reviews/i })).toBeVisible();
  await expect(drawer.getByText(/no reviews yet/i)).toBeVisible(); // optional but safe single assertion
});

// Dining page testing: menu item reviews
test('Open menu item review drawer', async ({ page }) => {
  await page.goto('/dining/bruin-cafe');
  const firstItem = page.locator('button', { hasText: '•' }).first();
  await expect(firstItem).toBeVisible();
  await firstItem.click();
  const drawer = page.locator('.MuiDrawer-root');
  await expect(drawer).toBeVisible();
});

// Comment drawer testing: liking as guest
test('Liking a review redirects to /signin as guest', async ({ page }) => {
  await page.goto('/dining/bruin-cafe');
  const reviewButton = page.getByRole('button', { name: /view location reviews/i });
  await reviewButton.click();
  const drawer = page.locator('.MuiDrawer-root');
  await expect(drawer).toBeVisible();
  const likeButton = drawer.getByRole('button', { name: /like review/i }).first();
  await expect(likeButton).toBeVisible();
  await likeButton.click();
  await expect(page).toHaveURL(/\/signin/);
});

// Comment drawer testing: disliking as guest
test('Disliking a review redirects to /signin as guest', async ({ page }) => {
  await page.goto('/dining/bruin-cafe');
  const reviewButton = page.getByRole('button', { name: /view location reviews/i });
  await reviewButton.click();
  const drawer = page.locator('.MuiDrawer-root');
  await expect(drawer).toBeVisible();
  const dislikeButton = drawer.getByRole('button', { name: /dislike review/i }).first();
  await expect(dislikeButton).toBeVisible();
  await dislikeButton.click();
  await expect(page).toHaveURL(/\/signin/);
});

// Comment drawer testing: clicking images
test('Lightbox opens and closes for every image in drawer', async ({ page }) => {
  await page.goto('/dining/epicuria-at-covel/items#6a0c0665f0ae055e029fb9ec');
  const images = page.locator('img.gallery-image, img.review-photo');
  await expect(images.first()).toBeVisible();
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    await expect(img).toBeVisible();
    await img.click();
    const dialog = page.locator('.MuiDialog-root');
    await expect(dialog).toBeVisible();
    const dialogImage = dialog.locator('img');
    await expect(dialogImage).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(dialog).toBeHidden();
  }
});