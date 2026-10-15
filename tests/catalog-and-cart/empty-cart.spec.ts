import { test, expect } from '@playwright/test';

test.describe('Catalog and cart', () => {
  test('Verify empty-cart messaging and checkout gating', async ({ page }) => {
    // 1. Open the app in a fresh browser context and open the cart preview without adding any products.
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/');
    await expect(page.locator('.cart-info')).toContainText(/Items:0/);
    await expect(page.locator('.cart-info')).toContainText(/Price:0/);
    await page.locator('.cart-icon').click();
    await expect(page.locator('.cart-preview')).toContainText('You cart is empty!');

    // 2. Inspect and attempt the Proceed to Checkout control if available.
    const checkoutButton = page.locator('.cart-preview .action-block button');
    await expect(checkoutButton).toHaveClass(/disabled/);
    await expect(page).not.toHaveURL(/#\/cart$/);
  });
});
