# GreenKart Selenium Practise Test Plan

## Application Overview

Functional test coverage for the GreenKart app at https://rahulshettyacademy.com/seleniumPractise/#/, including catalog search and quantity controls, cart calculations and promotions, the country/terms order flow, the policy destination, and the Top Deals offers table and date picker. Run each test independently from a fresh browser context and empty cart; do not rely on records retained by another test. Offers data and the default delivery date can vary, so validate behavior and ordering rather than hard-coded product prices or dates.

## Test Scenarios

### 1. Catalog and cart

**Seed:** `tests\seed.spec.ts`

#### 1.1. Search catalog for matching and non-matching products

**File:** `tests\catalog-and-cart\catalog-search.spec.ts`

**Steps:**
  1. Open the app from its base URL in a fresh browser context and confirm the catalog loads with product cards and an empty-cart item/price summary.
    - expect: The catalog displays product names, prices, quantity steppers, and Add to Cart actions.
  2. Enter a known partial term such as "apple" in the catalog search field.
    - expect: Matching product cards are filtered without reloading the app; the Apple product is visible.
  3. Replace the query with a unique unmatched term, such as "zzzz-no-match".
    - expect: No product card is shown and a no-matching-products message is displayed.
  4. Clear the search query.
    - expect: The full catalog is restored and the search field is empty.

#### 1.2. Add a multi-quantity item and verify cart calculations

**File:** `tests\catalog-and-cart\quantity-and-cart-calculations.spec.ts`

**Steps:**
  1. From an empty cart, locate Brocolli - 1 Kg and note its displayed unit price.
    - expect: Its quantity starts at 1 and the cart summary shows zero items and zero price.
  2. Click the product's increment control once, then add it to the cart.
    - expect: The displayed quantity becomes 2 before it is added.
  3. Open the cart preview and proceed to the cart page.
    - expect: The cart contains one Brocolli line with quantity 2, the correct unit price, and a line total equal to quantity times unit price. The item count and total amount agree with the line item.
  4. Return to a fresh catalog state, click the decrement control while the quantity is 1, and inspect the quantity.
    - expect: The quantity does not fall below 1.

#### 1.3. Verify empty-cart messaging and checkout gating

**File:** `tests\catalog-and-cart\empty-cart.spec.ts`

**Steps:**
  1. Open the app in a fresh browser context and open the cart preview without adding any products.
    - expect: The cart preview displays the empty-cart message and the cart summary remains at zero items and zero price.
  2. Inspect the Proceed to Checkout control and attempt to continue if the interface presents it as available.
    - expect: The empty state is clear and the user cannot proceed to a meaningful checkout with no items.

#### 1.4. Reject an invalid promo code without changing totals

**File:** `tests\catalog-and-cart\promo-code.spec.ts`

**Steps:**
  1. Add one catalog product to the cart and open the cart page.
    - expect: The cart page shows the product line and a promo-code field with an Apply control.
  2. Enter an invalid promo code and select Apply; wait for the application response to finish.
    - expect: An invalid-code message is displayed.
  3. Compare cart item count, original amount, discount, and final amount with their values before applying the code.
    - expect: The rejected code does not change the cart contents or totals; the discount remains zero.

#### 1.5. Complete an order with a country and terms consent

**File:** `tests\catalog-and-cart\order-checkout.spec.ts`

**Steps:**
  1. Add at least one product, open the cart, and select Place Order.
    - expect: The country step opens and provides a country selector, an unchecked Terms & Conditions checkbox, and a Proceed control.
  2. Attempt to proceed with no country selected and no consent.
    - expect: The order does not complete or leave the country step.
  3. Select a country but leave consent unchecked, then attempt to proceed.
    - expect: The order does not complete until Terms & Conditions is accepted.
  4. Open the Terms & Conditions link and use its Home link to return to the app; repeat the cart-to-country flow if needed, select a country, check consent, and select Proceed.
    - expect: The policy route displays its terms page and provides a Home link. With a country selected and consent checked, the order completes and returns to the catalog. The cart is cleared after completion.

#### 1.6. Search, sort, and paginate Top Deals

**File:** `tests\catalog-and-cart\offers-table.spec.ts`

**Steps:**
  1. From a fresh browser context, open Top Deals from the catalog header and switch to the offers page opened by the app.
    - expect: The offers page displays a searchable table with vegetable/fruit name, price, and discount price columns, a page-size selector, and pagination.
  2. Click the name column header once, then again.
    - expect: The sort indicator/status changes between ascending and descending; visible names are in the indicated order on each toggle.
  3. Search for "Apple" in the offers search field.
    - expect: Rows are filtered by the search term; partial matches such as Apple and Pineapple may both be present.
  4. Clear the search, select a page size of 10, and navigate to the next page if available.
    - expect: The selected page size is applied to the table; pagination changes the active page and displays a different set of rows. A final page may contain fewer than 10 rows.
  5. Search for a term that cannot match an offer.
    - expect: The table shows no matching data rows and does not retain unrelated results.

#### 1.7. Select a delivery date from the Top Deals date picker

**File:** `tests\catalog-and-cart\offers-delivery-date.spec.ts`

**Steps:**
  1. Open Top Deals and locate the Delivery Date control.
    - expect: A date field and calendar control are available.
  2. Open the calendar and select an available day in the displayed month.
    - expect: The calendar closes after selection and the date field reflects the selected calendar date in its date value.
  3. Clear the selected date using the date picker's clear control, if present.
    - expect: The date field is cleared and no prior date remains selected.
