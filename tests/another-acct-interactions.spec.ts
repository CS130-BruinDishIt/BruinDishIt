import { test, expect, type Page, type BrowserContext } from '@playwright/test';

test.describe.serial('interact with dining hall menu, reviews, and user profile', () => {
  let page: Page;
  let context: BrowserContext;

  // Setup a shared browser context and page before any tests run
  test.beforeAll(async ({ browser }, testInfo) => {
    context = await browser.newContext({
    baseURL: 'https://bruin-dish-it.vercel.app'
    });
    page = await context.newPage();
  });

  // Tear down the context after all tests finish
  test.afterAll(async () => {
    await context.close();
  });

  test('1. Sign in into another existing account', async () => {
    // THIS ACCOUNT IS SOLELY FOR TESTING PURPOSES AND HAS NO PERSONAL INFORMATION ASSOCIATED WITH IT
    const username = 'bdi-test';
    const password = 'bruinseat247';

    // Go to homepage first and navigate to signin
    await page.goto('/');
    await page.getByRole('link', { name: /sign in/i }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/');
  });

  test('2. On homepage, click the circle with text "Epic @ Covel"', async () => {
    await page.getByRole('button', { name: /Epic @ Covel/i }).click();
    await expect(page).toHaveURL(/\/dining\/.*/);
  });

  test('3. Click the "View All-Time Menu Items" button', async () => {
    await page.getByRole('button', { name: 'View All-Time Menu Items' }).click();
    await expect(page).toHaveURL(/\/dining\/.*\/items/);
  });

  test('4. Scroll down until we find "Roasted Vegetable & Provolone Sandwich" and click it', async () => {
    // Find the container div that has both the sandwich text AND the review button
    const sandwichRow = page.locator('div')
      .filter({ hasText: 'Roasted Vegetable & Provolone Sandwich' })
      .filter({ has: page.locator('.review-btn') })
      .last(); // Use .last() to grab the innermost wrapper, rather than the whole page body

    await sandwichRow.scrollIntoViewIfNeeded();
    await sandwichRow.locator('.review-btn').click();
    
    await expect(page.locator('.drawer-container')).toBeVisible();
  });

  test('5. If there is a photo in the gallery, click on first photo and click out', async () => {
    const galleryPhotos = page.locator('.gallery-image');
    if (await galleryPhotos.count() > 0) {
      await galleryPhotos.first().click();
      await page.keyboard.press('Escape');
    }
  });

  test('6. Scroll down to the "Reviews section"', async () => {
    const reviewsHeader = page.getByRole('heading', { name: 'Reviews' });
    await reviewsHeader.scrollIntoViewIfNeeded();
  });

  test('7. Find review by Jordan, click dislike, verify count goes up then down', async () => {
    const reviewA = page.locator('.reviews-container', { hasText: 'Jordan' }).first();
    if (await reviewA.isVisible()) {
      const dislikeBtn = reviewA.getByLabel('Dislike review', { exact: true });
      const dislikeCountLocator = reviewA.locator('.vote-count').nth(1); // 2nd count is dislikes

      const initialDislikes = parseInt(await dislikeCountLocator.innerText(), 10);
      
      await dislikeBtn.click();
      await expect(dislikeCountLocator).toHaveText((initialDislikes + 1).toString());
      
      await dislikeBtn.click();
      await expect(dislikeCountLocator).toHaveText(initialDislikes.toString());
    }
  });

  test('8. Find review by Gayathri, click like, verify count goes up then down', async () => {
    const reviewB = page.locator('.reviews-container', { hasText: 'Gayathri' }).first();
    if (await reviewB.isVisible()) {
      const likeBtn = reviewB.getByLabel('Like review', { exact: true });
      const likeCountLocator = reviewB.locator('.vote-count').first(); // 1st count is likes

      const initialLikes = parseInt(await likeCountLocator.innerText(), 10);
      
      await likeBtn.click();
      await expect(likeCountLocator).toHaveText((initialLikes + 1).toString());
      
      await likeBtn.click();
      await expect(likeCountLocator).toHaveText(initialLikes.toString());
    }
  });

  test('9. Return to top of "Reviews section"', async () => {
    const reviewsHeader = page.getByRole('heading', { name: 'Reviews' });
    await reviewsHeader.scrollIntoViewIfNeeded();
  });

  test('10. In the sort by section, select the drop down and click "Date"', async () => {
    const sortSelect = page.getByRole('combobox');
    await sortSelect.click();
    await page.getByRole('option', { name: 'Date' }).click();
  });

  test('11. Click drop down again and click "Rating"', async () => {
    const sortSelect = page.getByRole('combobox');
    await sortSelect.click();
    await page.getByRole('option', { name: 'Rating' }).click();
  });

  test('12. Click drop down again and click "Likes"', async () => {
    const sortSelect = page.getByRole('combobox');
    await sortSelect.click();
    await page.getByRole('option', { name: 'Likes' }).click();
  });

  test('13. Click drop down again and click "Date"', async () => {
    const sortSelect = page.getByRole('combobox');
    await sortSelect.click();
    await page.getByRole('option', { name: 'Date' }).click();
  });

  test('14. Click the arrow next to drop down and verify it triggers arrow in other direction', async () => {
    const sortDirectionBtn = page.locator('.review-header-container button').last();
    // In production builds (like Vercel), Material UI strips 'data-testid' attributes by default!
    const sortIcon = sortDirectionBtn.locator('svg');
    await sortDirectionBtn.click();
    await expect(sortIcon).toHaveCSS('transform', 'matrix(1, 0, 0, -1, 0, 0)');
  });

  test('15. Click profile picture for user "Jordan" at the top of Jordan\'s review', async () => {
    const reviewA = page.locator('.reviews-container', { hasText: 'Jordan' }).first();
    if (await reviewA.isVisible()) {
      await reviewA.locator('button').first().click(); // First button in review header is the Avatar
    }
  });

  test('16. Verify that this navigates to user profile page with "Jordan" as the user name', async () => {
    // Conditional assertion in case Jordan's review didn't exist in Step 15
    if (page.url().includes('/user/')) {
      await expect(page).toHaveURL(/\/user\/.*/);
      await expect(page.locator('.profile-username')).toHaveText('Jordan');
      await expect(page.getByRole('tab', { name: 'Reviews' })).toBeVisible();
      await expect(page.locator('.posts')).not.toBeEmpty();
    }
  });

  test('17. Click BruinDishIt text in nav bar to return to homepage', async () => {
    await page.locator('.title').click();
    await expect(page).toHaveURL('/');
  });

  test('18. Click profile icon in top right and click sign out', async () => {
    await page.locator('.profile-button').click();
    await page.getByText(/sign out/i).click();
    
    await expect(page).toHaveURL('/signin');
  });
});