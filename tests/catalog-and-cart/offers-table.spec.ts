import { test, expect } from '@playwright/test';

test.describe('Catalog and cart', () => {
  test('Search, sort, and paginate Top Deals', async ({ page }) => {
    // 1. Open the app and navigate to Top Deals offers page.
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/offers');
    const headers = page.locator('table thead th');
    await expect(headers).toHaveText(['Veg/fruit name', 'Price', 'Discount price']);
    const nameHeader = page.locator('th').filter({ hasText: 'Veg/fruit name' });
    const offerRows = page.locator('tbody tr');

    // 2. Toggle the name sort twice.
    await nameHeader.click();
    await expect(page.getByText('Sorted by name: ascending order')).toBeVisible();
    const ascendingNames = (await page.locator('tbody tr td:first-child').allTextContents()).map(name => name.trim());
    expect(ascendingNames).toEqual([...ascendingNames].sort((a, b) => a.localeCompare(b)));
    await nameHeader.click();
    await expect(page.getByText('Sorted by name: descending order')).toBeVisible();
    const descendingNames = (await page.locator('tbody tr td:first-child').allTextContents()).map(name => name.trim());
    expect(descendingNames).toEqual([...descendingNames].sort((a, b) => b.localeCompare(a)));

    // 3. Search for Apple.
    const searchField = page.locator('#search-field');
    await searchField.fill('Apple');
    await expect(offerRows.filter({ hasText: 'Apple' })).toHaveCount(2);
    await expect(offerRows.filter({ hasText: 'Pineapple' })).toHaveCount(1);

    // 4. Clear search, select page size 10, navigate to page two.
    await searchField.fill('');
    await page.locator('select').selectOption('10');
    await expect(offerRows).toHaveCount(10);
    const pageOneFirstRow = await offerRows.first().innerText();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(page.getByRole('button', { name: '2 (current)' })).toBeVisible();
    await expect(offerRows.first()).not.toHaveText(pageOneFirstRow);

    // 5. Search for an impossible term.
    await searchField.fill('no-such-vegetable-987');
    await expect(page.getByText('No data')).toBeVisible();
  });
});
