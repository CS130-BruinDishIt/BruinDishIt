# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\guest-view.spec.ts >> BackToTop appears after scrolling and returns to top
- Location: tests\guest-view.spec.ts:57:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByTestId('back-to-top')
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByTestId('back-to-top')
    19 × locator resolved to <button tabindex="0" type="button" data-testid="back-to-top" class="MuiButtonBase-root MuiFab-root MuiFab-circular MuiFab-sizeMedium MuiFab-default css-xdo8q7-MuiButtonBase-root-MuiFab-root">…</button>
       - unexpected value "hidden"

```

```yaml
- banner:
  - link "Home":
    - /url: /
    - img "Home"
  - link "BruinDishIt":
    - /url: /
  - link "SIGN IN Profile":
    - /url: /signin
    - text: SIGN IN
    - img "Profile"
- heading "Bruin Cafe" [level=3]
- paragraph: Wednesday, June 10, 2026 at 12:08:59 PM
- text: Overall Rating
- heading "4.5" [level=5]
- button "View Location Reviews"
- button "View All-Time Menu Items"
- heading "Go To" [level=6]
- button "☀️ All Day"
- heading "All Day" [level=4]
- heading "DAILY SPECIALS" [level=6]
- separator
- button "• Plain Chicken Wings"
- button
- paragraph: "--"
- button "• Frank's RedHot® Chicken Wings"
- button
- paragraph: "--"
- button "• Lemon Pepper Chicken Wings"
- button
- paragraph: "--"
- button "• BBQ Chicken Wings"
- button
- paragraph: "--"
- button "• Wedge Cut Fries"
- button
- paragraph: "--"
- heading "TOASTED SANDWICHES" [level=6]
- separator
- button "• Ham & Swiss Sandwich"
- button
- paragraph: "--"
- button "• Roasted Turkey & Provolone Sandwich"
- button
- paragraph: "--"
- button "• Smoky BBQ Sandwich"
- button
- paragraph: "--"
- button "• BBQ Beef Brisket Sandwich"
- button
- paragraph: "--"
- button "• Chicken Ranch & Swiss Sandwich"
- button
- paragraph: "--"
- button "• The Cuban Sandwich"
- button
- paragraph: "--"
- button "• Chipotle BBQ Turkey Sandwich"
- button
- paragraph: "--"
- button "• Chicken Caesar Sandwich"
- button
- paragraph: "--"
- button "• Roasted Salmon Sandwich"
- button
- paragraph: "--"
- button "• Pastrami & Swiss Sandwich"
- button
- paragraph: "--"
- button "• Chicken Pesto Sandwich"
- button
- paragraph: "--"
- button "• Roasted Portobello Mushroom Sandwich"
- button
- paragraph: "--"
- button "• Buffalo Chicken Sandwich"
- button
- paragraph: "--"
- button "• Cheesesteak"
- button
- paragraph: "--"
- button "• Vegan Chicken Caesar Sandwich"
- button
- paragraph: "--"
- button "• Chipotle BBQ Sandwich"
- button
- paragraph: "--"
- button "• Havana Press Sandwich"
- button
- paragraph: "--"
- button "• Roasted Garden \"Salmon\" Sandwich"
- button
- paragraph: "--"
- button "• Vegetarian Chicken Ranch & Swiss Sandwich"
- button
- paragraph: "--"
- button "• Vegetarian Pastrami & Swiss Sandwich"
- button
- paragraph: "4.5"
- button "• Vegetarian Ham & Swiss Sandwich"
- button
- paragraph: "--"
- button "• Chicken Parmesan Sandwich"
- button
- paragraph: "--"
- heading "ENTREE SALADS" [level=6]
- separator
- button "• Vegetarian Cobb Salad"
- button
- paragraph: "--"
- button "• Mixed Green Salad"
- button
- paragraph: "--"
- button "• Asian Wonton Salad"
- button
- paragraph: "--"
- button "• Caesar Salad"
- button
- paragraph: "--"
- button "• Chopped Mediterranean Salad"
- button
- paragraph: "--"
- heading "ENTREE SOUPS" [level=6]
- separator
- button "• Chicken Noodle Soup"
- button
- paragraph: "--"
- button "• Creamy Tomato Basil Soup"
- button
- paragraph: "--"
- heading "GRAB & GO SANDWICHES" [level=6]
- separator
- button "• Peanut Butter & Strawberry Preserves Sandwich"
- button
- paragraph: "--"
- button "• Avocado BLT Sandwich"
- button
- paragraph: "--"
- button "• Tuna Salad Croissant Sandwich"
- button
- paragraph: "--"
- button "• Turkey & Provolone Sandwich"
- button
- paragraph: "--"
- button "• Ham & Swiss Sandwich"
- button
- paragraph: "--"
- button "• Italian Sandwich"
- button
- paragraph: "--"
- button "• Gluten Free Turkey & Provolone Sandwich"
- button
- paragraph: "--"
- button "• Gluten Free Italian Sandwich"
- button
- paragraph: "--"
- button "• Gluten Free Avocado BLT Sandwich"
- button
- paragraph: "--"
- button "• 1/2 Turkey & Provolone Sandwich"
- button
- paragraph: "--"
- button "• 1/2 Ham & Swiss Sandwich"
- button
- paragraph: "--"
- heading "GRAB & GO SALADS" [level=6]
- separator
- button "• Chicken Caesar Salad"
- button
- paragraph: "--"
- button "• Vegetarian Cobb Salad"
- button
- paragraph: "--"
- button "• Caesar Salad"
- button
- paragraph: "--"
- button "• Asian Chicken Salad"
- button
- paragraph: "--"
- button "• Asian Wonton Salad"
- button
- paragraph: "--"
- button "• Nut Free Asian Wonton Salad"
- button
- paragraph: "--"
- button "• BBQ Chicken Salad"
- button
- paragraph: "--"
- button "• Mixed Green Salad"
- button
- paragraph: "--"
- button "• Forbidden Rice Grain Bowl with Shrimp"
- button
- paragraph: "--"
- button "• Quinoa Grain Bowl with Chicken"
- button
- paragraph: "--"
- button "• Peanut Butter and Egg Protein Box"
- button
- paragraph: "--"
- button "• Crudite Box"
- button
- paragraph: "--"
- button "• Caesar Wrap"
- button
- paragraph: "--"
- button "• Chicken Caesar Wrap"
- button
- paragraph: "--"
- button "• Roasted Vegetable & Ricotta Cheese Wrap"
- button
- paragraph: "--"
- heading "BRUIN CAFE DRESSINGS" [level=6]
- separator
- button "• Vegan Caesar Dressing"
- button
- paragraph: "--"
- button "• Ranch Dressing"
- button
- paragraph: "--"
- button "• Balsamic Vinaigrette"
- button
- paragraph: "--"
- button "• Red Wine Vinaigrette"
- button
- paragraph: "--"
- button "• Asian Salad Dressing"
- button
- paragraph: "--"
- heading "ACAI BOWLS & FRESH FRUIT SMOOTHIES" [level=6]
- separator
- button "• Build Your Own Acai Bowl"
- button
- paragraph: "--"
- button "• Dragon Fruit Acai Bowl"
- button
- paragraph: "--"
- button "• Dole Whip Bowl"
- button
- paragraph: "--"
- button "• Strawberry Sensation Smoothie"
- button
- paragraph: "--"
- button "• Mango Madness Smoothie"
- button
- paragraph: "--"
- button "• Caribbean Island Smoothie"
- button
- paragraph: "--"
- button "• Bruin Fresh Smoothie"
- button
- paragraph: "--"
- 'button "• Smoothie #15: Chocolate Banana"'
- button
- paragraph: "--"
- 'button "• Smoothie #06: Alooooha"'
- button
- paragraph: "--"
- heading "FAIR TRADE COFFEE & TEA" [level=6]
- separator
- button "• Café Latte"
- button
- paragraph: "--"
- button "• Vanilla Latte"
- button
- paragraph: "--"
- button "• Mocha Latte"
- button
- paragraph: "--"
- button "• Caramel Latte"
- button
- paragraph: "--"
- button "• Chai Tea Latte"
- button
- paragraph: "--"
- button "• Brewed Coffee"
- button
- paragraph: "--"
- button "• Espresso"
- button
- paragraph: "--"
- button "• Café Caramel"
- button
- paragraph: "--"
- button "• Café Mocha"
- button
- paragraph: "--"
- button "• Café Vanilla"
- button
- paragraph: "--"
- button "• Brewed Tea"
- button
- paragraph: "--"
- button "• White Chocolate Latte"
- button
- paragraph: "--"
- button "• Cappuccino"
- button
- paragraph: "--"
- button "• Hot Chocolate"
- button
- paragraph: "--"
- button "• Hot Vanilla"
- button
- paragraph: "--"
- button "• Horchata Latte"
- button
- paragraph: "--"
- button "• Tea Latte"
- button
- paragraph: "--"
- button "• Americano"
- button
- paragraph: "--"
- heading "PASTRIES" [level=6]
- separator
- button "• Oatmeal Raisin Cookie"
- button
- paragraph: "--"
- button "• Chocolate Chip Cookie"
- button
- paragraph: "--"
- button "• Chocolate Croissant"
- button
- paragraph: "--"
- button "• Butter Croissant"
- button
- paragraph: "--"
- button "• Apple Turnover"
- button
- paragraph: "--"
- button "• Cheese Danish"
- button
- paragraph: "--"
- button "• Funfetti Butter Cream Cupcake"
- button
- paragraph: "--"
- button "• Red Velvet Cake"
- button
- paragraph: "--"
- button "• Banana Walnut Muffin"
- button
- paragraph: "--"
- button "• Mocha Muffin"
- button
- paragraph: "--"
- button "• Blueberry Muffin"
- button
- paragraph: "--"
- button "• Mango Chia Pudding with Yogurt Mousse"
- button
- paragraph: "--"
- button "• Eclair"
- button
- paragraph: "--"
- button "• White Chocolate Strawberry Tart"
- button
- paragraph: "--"
- button "• Cinnamon Roll with Cream Cheese"
- button
- paragraph: "--"
- button "• Cinnamon Raisin Bagel"
- button
- paragraph: "--"
- button "• Plain Bagel"
- button
- paragraph: "--"
- button "• Onion Bagel"
- button
- paragraph: "--"
- button "• Everything Bagels"
- button
- paragraph: "--"
- button "• Whole Wheat Bagel"
- button
- paragraph: "--"
- heading "Parfaits / Fruit Cups" [level=6]
- separator
- button "• Fresh Fruit Cup"
- button
- paragraph: "--"
- button "• Parfait Fresh Berry"
- button
- paragraph: "--"
- button "• Parfait Oatmeal Blueberry & Apple"
- button
- paragraph: "--"
- heading "Sides" [level=6]
- separator
- button "• Oatmeal Raisin Cookie"
- button
- paragraph: "--"
- button "• Chocolate Chip Cookie"
- button
- paragraph: "--"
- button "• Banana"
- button
- paragraph: "--"
- button "• Fuji Apple"
- button
- paragraph: "--"
- button "• Granny Smith Apple"
- button
- paragraph: "--"
- button "• Oranges"
- button
- paragraph: "--"
- button "• BBQ Kettle Chips"
- button
- paragraph: "--"
- button "• Sea Salt Kettle Chips"
- button
- paragraph: "--"
- button "• Smartfood White Cheddar Popcorn"
- button
- paragraph: "--"
- button "• Original Lays Baked Chips"
- button
- paragraph: "--"
- button "• Jalapeno Kettle Chips"
- button
- paragraph: "--"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { diningLocations } from '../frontend/src/data/diningLocations';
  3   | 
  4   | // Preliminary testing
  5   | test('Site has title', async ({ page }) => {
  6   |   await page.goto('/');
  7   |   await expect(page).toHaveTitle(/BruinDishIt/);
  8   | });
  9   | 
  10  | // Navbar testing: home
  11  | test('Navbar home button navigates to /home', async ({ page }) => {
  12  |   await page.goto('/signin');
  13  |   await page.locator('.home-button').click();
  14  |   await expect(page).toHaveURL('/');
  15  | });
  16  | 
  17  | // Navbar testing: signin
  18  | test('Navbar signin button navigates to /signin', async ({ page }) => {
  19  |   await page.goto('/');
  20  |   await page.locator('.profile-button').click();
  21  |   await expect(page).toHaveURL('/signin');
  22  | });
  23  | 
  24  | // Homepage testing: dining hall pages
  25  | for (const location of diningLocations) {
  26  |   test(`${location.shortname} shows correct hall name`, async ({ page }) => {
  27  |     await page.goto(`/dining/${location.id}`);
  28  |     await expect( page.locator('h3', { hasText: location.name }) ).toBeVisible();
  29  |   });
  30  | }
  31  | 
  32  | // Dining page testing: menu history
  33  | test('Navigate to menu history page from dining page', async ({ page }) => {
  34  |   await page.goto('/dining/bruin-cafe');
  35  |   const btn = page.getByRole('button', { name: /all-time menu items/i });
  36  |   await expect(btn).toBeVisible();
  37  |   await btn.click();
  38  |   await expect(page).toHaveURL(/\/items$/);
  39  | });
  40  | 
  41  | // Dining page testing: go to buttons
  42  | test('Each Go To button scrolls to its meal section', async ({ page }) => {
  43  |   await page.goto('/dining/bruin-cafe');
  44  |   const buttons = page.locator('[data-testid^="meal-button-"]');
  45  |   await expect(buttons.first()).toBeVisible();
  46  |   const count = await buttons.count();
  47  | 
  48  |   for (let i = 0; i < count; i++) {
  49  |     const btn = buttons.nth(i);
  50  |     await expect(btn).toBeVisible();
  51  |     await btn.click();
  52  |     await expect(page.locator('h4').first()).toBeVisible();
  53  |   }
  54  | });
  55  | 
  56  | // Dining page testing: back to top button
  57  | test('BackToTop appears after scrolling and returns to top', async ({ page }) => {
  58  |   await page.goto('/dining/bruin-cafe');
  59  | 
  60  |   const fab = page.getByTestId('back-to-top');
  61  | 
  62  |   await expect(fab).toBeHidden();
  63  | 
  64  |   // force real scroll (triggers React scroll listener properly)
  65  |   for (let i = 0; i < 10; i++) {
  66  |     await page.mouse.wheel(0, 500);
  67  |   }
  68  | 
  69  |   // wait for FAB to appear (fade animation needs time)
> 70  |   await expect(fab).toBeVisible({ timeout: 10000 });
      |                     ^ Error: expect(locator).toBeVisible() failed
  71  | 
  72  |   await fab.click();
  73  | 
  74  |   // wait for scroll reset
  75  |   await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  76  | });
  77  | 
  78  | // Dining page testing: hall reviews
  79  | test('Open hall review drawer', async ({ page }) => {
  80  |   await page.goto('/dining/bruin-cafe');
  81  |   const reviewButton = page.getByRole('button', { name: /view location reviews/i });
  82  |   await expect(reviewButton).toBeVisible();
  83  |   await reviewButton.click();
  84  |   const drawer = page.locator('.MuiDrawer-root');
  85  |   await expect(drawer).toBeVisible();
  86  |   await expect(drawer.getByRole('heading', { name: /reviews/i })).toBeVisible();
  87  |   await expect(drawer.getByText(/no reviews yet/i)).toBeVisible(); // optional but safe single assertion
  88  | });
  89  | 
  90  | // Dining page testing: menu item reviews
  91  | test('Open menu item review drawer', async ({ page }) => {
  92  |   await page.goto('/dining/bruin-cafe');
  93  |   const firstItem = page.locator('button', { hasText: '•' }).first();
  94  |   await expect(firstItem).toBeVisible();
  95  |   await firstItem.click();
  96  |   const drawer = page.locator('.MuiDrawer-root');
  97  |   await expect(drawer).toBeVisible();
  98  | });
  99  | 
  100 | // Comment drawer testing: liking as guest
  101 | test('Liking a review redirects to /signin as guest', async ({ page }) => {
  102 |   await page.goto('/dining/bruin-cafe');
  103 |   const reviewButton = page.getByRole('button', { name: /view location reviews/i });
  104 |   await reviewButton.click();
  105 |   const drawer = page.locator('.MuiDrawer-root');
  106 |   await expect(drawer).toBeVisible();
  107 |   const likeButton = drawer.getByRole('button', { name: /like review/i }).first();
  108 |   await expect(likeButton).toBeVisible();
  109 |   await likeButton.click();
  110 |   await expect(page).toHaveURL(/\/signin/);
  111 | });
  112 | 
  113 | // Comment drawer testing: disliking as guest
  114 | test('Disliking a review redirects to /signin as guest', async ({ page }) => {
  115 |   await page.goto('/dining/bruin-cafe');
  116 |   const reviewButton = page.getByRole('button', { name: /view location reviews/i });
  117 |   await reviewButton.click();
  118 |   const drawer = page.locator('.MuiDrawer-root');
  119 |   await expect(drawer).toBeVisible();
  120 |   const dislikeButton = drawer.getByRole('button', { name: /dislike review/i }).first();
  121 |   await expect(dislikeButton).toBeVisible();
  122 |   await dislikeButton.click();
  123 |   await expect(page).toHaveURL(/\/signin/);
  124 | });
  125 | 
  126 | // Comment drawer testing: clicking images
  127 | test('Lightbox opens and closes for every image in drawer', async ({ page }) => {
  128 |   await page.goto('/dining/epicuria-at-covel/items#6a0c0665f0ae055e029fb9ec');
  129 |   const images = page.locator('img.gallery-image, img.review-photo');
  130 |   await expect(images.first()).toBeVisible();
  131 |   const count = await images.count();
  132 |   for (let i = 0; i < count; i++) {
  133 |     const img = images.nth(i);
  134 |     await expect(img).toBeVisible();
  135 |     await img.click();
  136 |     const dialog = page.locator('.MuiDialog-root');
  137 |     await expect(dialog).toBeVisible();
  138 |     const dialogImage = dialog.locator('img');
  139 |     await expect(dialogImage).toBeVisible();
  140 |     await page.mouse.click(10, 10);
  141 |     await expect(dialog).toBeHidden();
  142 |   }
  143 | });
```