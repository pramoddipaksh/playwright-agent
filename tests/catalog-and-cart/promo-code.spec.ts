import { test, expect } from '@playwright/test';

test.describe('Catalog and cart', () => {
  test('Reject an invalid promo code without changing totals', async ({ page }) => {
    // 1. Open the app in a fresh browser context, add one product, and open the cart page.
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/');
    await page.locator('.product:first-child .product-action button').click();
    await page.locator('.cart-icon').click();
    await page.locator('.cart-preview .action-block button').click();
    await expect(page).toHaveURL(/#\/cart$/);
    const cartRow = page.locator('tbody tr').filter({ hasText: 'Brocolli - 1 Kg' });
    await expect(cartRow).toContainText('1');
    await expect(cartRow).toContainText('120');
    await expect(page.getByText('No. of Items : 1')).toBeVisible();
    await expect(page.getByText('Total Amount : 120')).toBeVisible();
    await expect(page.getByText('Discount : 0%')).toBeVisible();
    await expect(page.getByText('Total After Discount : 120')).toBeVisible();

    // 2. Enter an invalid promo code and Apply; wait until application finishes.
    await page.locator('input.promoCode').fill('INVALID-CODE');
    await page.locator('button.promoBtn').click();
    await expect(page.getByText('Invalid code ..!')).toBeVisible({ timeout: 15000 });

    // 3. Verify invalid-code feedback and compare the cart line/item amount, discount, and final amount to before application.
    await expect(cartRow).toContainText('Brocolli - 1 Kg');
    await expect(cartRow).toContainText('1');
    await expect(cartRow).toContainText('120');
    await expect(page.getByText('No. of Items : 1')).toBeVisible();
    await expect(page.getByText('Total Amount : 120')).toBeVisible();
    await expect(page.getByText('Discount : 0%')).toBeVisible();
    await expect(page.getByText('Total After Discount : 120')).toBeVisible();
  });
});
