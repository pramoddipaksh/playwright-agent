import { test, expect } from '@playwright/test';

test.describe('Catalog and cart', () => {
  test('Select a delivery date from the Top Deals date picker', async ({ page }) => {
    // 1. Open Top Deals and locate the Delivery Date control.
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/offers');
    const dateInput = page.locator('input[type="date"]');
    const calendarButton = page.locator('.react-date-picker__calendar-button');
    await expect(dateInput).toBeAttached();
    await expect(calendarButton).toBeVisible();

    // 2. Open the calendar and select an available day in the displayed month.
    await calendarButton.click();
    const calendar = page.locator('.react-calendar');
    await expect(calendar).toBeVisible();
    await calendar.locator('.react-calendar__tile--now').click();
    await expect(dateInput).toHaveValue(/\d{4}-\d{2}-\d{2}/);
    await expect(calendar).toBeHidden();

    // 3. Clear the selected date using the date picker's clear control, if present.
    await page.locator('.react-date-picker__clear-button').click();
    await expect(dateInput).toHaveValue('');
  });
});
