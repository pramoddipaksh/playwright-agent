import { test, expect } from '@playwright/test';

test.describe('Catalog and cart', () => {
  test('Search catalog for matching and non-matching products', async ({ page }) => {
    // 1. Open the app from its base URL in a fresh browser context and confirm the catalog loads with product cards and an empty-cart item/price summary.
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/');
    const productCards = page.locator('.product').filter({ has: page.locator('.product-name') });
    await expect(productCards.first().locator('.product-name')).toHaveText('Brocolli - 1 Kg');
    await expect(productCards.first().locator('.product-price')).toHaveText('120');
    await expect(productCards.first().locator('.quantity')).toHaveValue('1');
    await expect(productCards.first().getByRole('button', { name: 'ADD TO CART' })).toBeVisible();
    await expect(page.locator('.cart-info')).toContainText(/Items:0/);
    await expect(page.locator('.cart-info')).toContainText(/Price:0/);

    // 2. Enter a known partial term such as "apple" in the catalog search field.
    const searchField = page.locator('input.search-keyword');
    await searchField.fill('apple');
    await expect(page.locator('.product-name').filter({ hasText: 'Apple - 1 Kg' })).toBeVisible();

    // 3. Replace the query with a unique unmatched term, such as "zzzz-no-match".
    await searchField.fill('zzzz-no-match');
    await expect(page.getByText('Sorry, no products matched your search!')).toBeVisible();

    // 4. Clear the search query.
    await searchField.fill('');
    await expect(searchField).toHaveValue('');
    await expect(productCards).toHaveCount(30);
    await expect(page.locator('.cart-info')).toContainText(/Items:0/);
    await expect(page.locator('.cart-info')).toContainText(/Price:0/);
  });
});
