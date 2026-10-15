import { test, expect } from '@playwright/test';

test.describe('Catalog and cart', () => {
  test('Complete an order with a country and terms consent', async ({ page }) => {
    // 1. Add at least one product, open the cart, and select Place Order.
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/');
    await page.locator('.product:first-child .product-action button').click();
    await page.locator('.cart-icon').click();
    await page.locator('.cart-preview .action-block button').click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page).toHaveURL(/#\/country$/);
    const countrySelector = page.locator('select');
    const termsCheckbox = page.locator('.chkAgree');
    const proceedButton = page.getByRole('button', { name: 'Proceed' });

    // 2. Attempt to proceed with no country selected and no consent.
    await proceedButton.click();
    await expect(page).toHaveURL(/#\/country$/);
    await expect(countrySelector).toHaveValue('Select');
    await expect(termsCheckbox).not.toBeChecked();

    // 3. Select a country but leave consent unchecked, then attempt to proceed.
    await countrySelector.selectOption('India');
    await proceedButton.click();
    await expect(page).toHaveURL(/#\/country$/);
    await expect(countrySelector).toHaveValue('India');
    await expect(termsCheckbox).not.toBeChecked();

    // 4. Open Terms & Conditions, return using Home, repeat order flow, select a country, check consent, and proceed.
    const policyPagePromise = page.waitForEvent('popup');
    await page.locator('a[href="#/policy"]').click();
    const policyPage = await policyPagePromise;
    await expect(policyPage.getByText('Here the terms and condition page')).toBeVisible();
    await policyPage.getByRole('link', { name: 'Home' }).click();
    await expect(policyPage).toHaveURL(/#\/$/);
    await policyPage.close();

    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/');
    await page.locator('.product:first-child .product-action button').click();
    await page.locator('.cart-icon').click();
    await page.locator('.cart-preview .action-block button').click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(countrySelector).toHaveValue('Select');
    await countrySelector.selectOption('India');
    await termsCheckbox.click();
    await expect(termsCheckbox).toBeChecked();
    await proceedButton.click();
    await expect(page).toHaveURL(/#\/$/, { timeout: 10000 });
    await expect(page.locator('.cart-info')).toContainText(/Items:0/);
    await expect(page.locator('.cart-info')).toContainText(/Price:0/);
  });
});
