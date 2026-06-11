import { test, expect } from '@playwright/test';
import { diningLocations } from '../frontend/src/data/diningLocations';

// Preliminary testing
test('Site has title', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    // Verify title 
    await expect(page).toHaveTitle(/BruinDishIt/);
});

// Navbar testing: home
test('Navbar home button navigates to /home', async ({ page }) => {
    // Go to signin page
    await page.goto('/signin');
    // Click home button
    await page.locator('.home-button').click();
    // Verify redirect to homepage
    await expect(page).toHaveURL('/');
});

// Navbar testing: signin
test('Navbar signin button navigates to /signin', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    // Click signin button
    await page.locator('.profile-button').click();
    // Verify redirect to signin page
    await expect(page).toHaveURL('/signin');
});

// Homepage testing: dining hall pages
// For each dining location defined,
for (const location of diningLocations) {
    test(`${location.shortname} shows correct hall name`, async ({ page }) => {
        // Go to homepage
        await page.goto('/');
        // Wait for the button to render
        const button = page.getByRole('button', { name: location.shortname });
        await expect(button).toBeVisible();
        // Click the button
        await button.click();
        // Verify navigation happens
        await expect(page).toHaveURL(new RegExp(`/dining/${location.id}`));
        // Verify correct dining hall is rendered
        await expect(page.locator('h3', { hasText: location.name })).toBeVisible();
    });
}

// Dining page testing: menu history
test('Navigate to menu history page from dining page', async ({ page }) => {
    // Open a dining hall page
    await page.goto('/dining/bruin-cafe');
    // Find button for menu history and wait for it to render
    const btn = page.getByRole('button', { name: /all-time menu items/i });
    await expect(btn).toBeVisible();
    // Click the button
    await btn.click();
    // Verify navigation
    await expect(page).toHaveURL(/\/items$/);
});

// Dining page testing: go to buttons
test('Each Go To button scrolls to its meal section', async ({ page }) => {
    // Open a dining hall page
    await page.goto('/dining/bruin-cafe');
    // Select all meal navigation buttons and wait for them to render
    const buttons = page.locator('[data-testid^="meal-button-"]');
    await expect(buttons.first()).toBeVisible();
    // Get the number of meal buttons
    const count = await buttons.count();
    // Test each meal button
    for (let i = 0; i < count; i++) {
        // Get button by index and wait for it to render
        const btn = buttons.nth(i);
        await expect(btn).toBeVisible();
        // Click the go to button
        await btn.click();
        // Verify that the meal header is visible now
        await expect(page.locator('h4').first()).toBeVisible();
    }
});

// Dining page testing: back to top button
test('BackToTop appears after scrolling and returns to top', async ({ page }) => {
    // Open a dining hall page
    await page.goto('/dining/bruin-cafe');
    // Get the back-to-top button and wait for the page to finish rendering
    const fab = page.getByTestId('back-to-top');
    await page.waitForLoadState('networkidle');
    // Button should initially not be visible
    await expect(fab).toBeHidden();
    // Scroll down page
    await page.mouse.wheel(0, 3000);
    // Button should now be visible
    await expect(fab).toBeVisible({ timeout: 10000 });
    // Click back-to-top button
    await fab.click();
    // Wait for page to scroll back to the top
    await page.waitForFunction(() => window.scrollY === 0);
    // Verify back-to-top button is invisible again
    await expect(fab).toBeHidden();
});

// Dining page testing: hall reviews
test('Open hall review drawer', async ({ page }) => {
    // Open a dining hall page
    await page.goto('/dining/bruin-cafe');
    // Find location reviews button and wait for it to render
    const reviewButton = page.getByRole('button', { name: /view location reviews/i });
    await expect(reviewButton).toBeVisible();
    // Click the button
    await reviewButton.click();
    // Drawer should open -- verify it renders
    const drawer = page.locator('.MuiDrawer-root');
    await expect(drawer).toBeVisible();
    // Verify header
    await expect(drawer.getByRole('heading', { name: /reviews/i })).toBeVisible();
    await expect(drawer.getByText(/no reviews yet/i)).toBeVisible(); // optional but safe single assertion
});

// Dining page testing: menu item reviews
test('Open menu item review drawer', async ({ page }) => {
    // Open a dining hall page
    await page.goto('/dining/bruin-cafe');
    // Find first menu item's button (leave a review before testing) and verify it renders
    const firstItem = page.locator('button', { hasText: '•' }).first();
    await expect(firstItem).toBeVisible();
    // Click the button
    await firstItem.click();
    // Drawer should open -- verify it renders
    const drawer = page.locator('.MuiDrawer-root');
    await expect(drawer).toBeVisible();
});

// Comment drawer testing: liking as guest
test('Liking a review redirects to /signin as guest', async ({ page }) => {
    // Open a dining hall page
    await page.goto('/dining/bruin-cafe');
    // Find first menu item's button (leave a review before testing) and verify it renders
    const firstItem = page.locator('button', { hasText: '•' }).first();
    await expect(firstItem).toBeVisible();
    // Click the button
    await firstItem.click();
    // Drawer should open -- verify it renders
    const drawer = page.locator('.MuiDrawer-root');
    await expect(drawer).toBeVisible();
    // Find like button and verify it renders
    const likeButton = drawer.getByRole('button', { name: /like review/i }).first();
    await expect(likeButton).toBeVisible();
    // Click the button
    await likeButton.click();
    // Verify it redirect to the signin page due to guest mode
    await expect(page).toHaveURL(/\/signin/);
});

// Comment drawer testing: disliking as guest
test('Disliking a review redirects to /signin as guest', async ({ page }) => {
    // Open a dining hall page
    await page.goto('/dining/bruin-cafe');
    // Find first menu item's button (leave a review before testing) and verify it renders
    const firstItem = page.locator('button', { hasText: '•' }).first();
    await expect(firstItem).toBeVisible();
    // Click the button
    await firstItem.click();
    // Drawer should open -- verify it renders
    const drawer = page.locator('.MuiDrawer-root');
    await expect(drawer).toBeVisible();
    // Find dislike button and verify it renders
    const dislikeButton = drawer.getByRole('button', { name: /dislike review/i }).first();
    await expect(dislikeButton).toBeVisible();
    // Click the button
    await dislikeButton.click();
    // Verify it redirect to the signin page due to guest mode
    await expect(page).toHaveURL(/\/signin/);
});

// Comment drawer testing: clicking images
test('Lightbox opens and closes for every image in drawer', async ({ page }) => {
    // Go to a review drawer with images
    await page.goto('/dining/epicuria-at-covel/items#6a0c0665f0ae055e029fb9ec');
    // Get all images inside gallery and reviews -- verify they render
    const images = page.locator('img.gallery-image, img.review-photo');
    await expect(images.first()).toBeVisible();
    // Get count of images
    const count = await images.count();
    // For each image
    for (let i = 0; i < count; i++) {
        // Get image by index and verify it renders
        const img = images.nth(i);
        await expect(img).toBeVisible();
        // Click on the image
        await img.click();
        // Verify lightbox opens
        const dialog = page.locator('.MuiDialog-root');
        await expect(dialog).toBeVisible();
        const dialogImage = dialog.locator('img');
        await expect(dialogImage).toBeVisible();
        // Click backdrop to close
        await page.mouse.click(10, 10);
        // Verify lightbox closes
        await expect(dialog).toBeHidden();
    }
});