import { test, expect } from '@playwright/test';

test.describe('Catalog and cart', () => {
  test('Add a multi-quantity item and verify cart calculations', async ({ page }) => {
    // 1. Open the app from its base URL in a fresh browser context and inspect the first product and empty cart.
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/');
    const broccoli = page.locator('.product').filter({ hasText: 'Brocolli - 1 Kg' });
    const quantity = broccoli.locator('.quantity');
    await expect(quantity).toHaveValue('1');
    await expect(page.locator('.cart-info')).toContainText(/Items:0/);
    await expect(page.locator('.cart-info')).toContainText(/Price:0/);

    // 2. Increase Brocolli - 1 Kg quantity once.
    await broccoli.locator('.increment').click();
    await expect(quantity).toHaveValue('2');

    // 3. Add it to cart.
    await broccoli.getByRole('button', { name: 'ADD TO CART' }).click();
    await expect(page.locator('.cart-info')).toContainText(/Items:1/);
    await expect(page.locator('.cart-info')).toContainText(/Price:240/);

    // 4. Open the cart preview and proceed to the cart page.
    await page.locator('.cart-icon').click();
    await page.locator('.cart-preview .action-block button').click();
    await expect(page).toHaveURL(/#\/cart$/);
    const cartRow = page.locator('tbody tr').filter({ hasText: 'Brocolli - 1 Kg' });
    await expect(cartRow).toContainText('2');
    await expect(cartRow).toContainText('120');
    await expect(cartRow).toContainText('240');
    await expect(page.getByText('No. of Items : 1')).toBeVisible();
    await expect(page.getByText('Total Amount : 240')).toBeVisible();

    // 5. Return to a fresh catalog state and decrement the first product at quantity 1.
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/');
    const freshQuantity = page.locator('.product:first-child .quantity');
    await page.locator('.product:first-child .decrement').click();
    await expect(freshQuantity).toHaveValue('1');
    await expect(page.locator('.cart-info')).toContainText(/Items:0/);
  });
});
