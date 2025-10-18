import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

export const TEST_USER = {
  email: 'test@futuratickets.com',
  password: 'Test123!',
  name: 'Test User',
  phone: '+34600000000',
};

export const TEST_ADMIN = {
  email: 'admin@futuratickets.com',
  password: 'Admin123!',
  name: 'Admin User',
};

export const STRIPE_TEST_CARD = {
  number: '4242424242424242',
  expiry: '12/34',
  cvc: '123',
  zip: '12345',
};

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Fill in Stripe card details
 */
export async function fillStripeCardDetails(page: Page) {
  // Wait for Stripe iframe to load
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');

  await stripeFrame.locator('[placeholder="Card number"]').fill(STRIPE_TEST_CARD.number);
  await stripeFrame.locator('[placeholder="MM / YY"]').fill(STRIPE_TEST_CARD.expiry);
  await stripeFrame.locator('[placeholder="CVC"]').fill(STRIPE_TEST_CARD.cvc);
  await stripeFrame.locator('[placeholder="ZIP"]').fill(STRIPE_TEST_CARD.zip);
}

/**
 * Login as user in marketplace
 */
export async function loginAsUser(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/auth/login');
  await waitForPageLoad(page);

  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');

  await waitForPageLoad(page);

  // Verify login success
  await expect(page).not.toHaveURL(/login/);
}

/**
 * Login as admin
 */
export async function loginAsAdmin(page: Page, email = TEST_ADMIN.email, password = TEST_ADMIN.password) {
  await page.goto('/admin/login');
  await waitForPageLoad(page);

  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');

  await waitForPageLoad(page);

  // Verify login success
  await expect(page).not.toHaveURL(/login/);
}

/**
 * Create a test event (admin)
 */
export async function createTestEvent(page: Page, eventData: {
  name: string;
  date: string;
  capacity: number;
  ticketPrice: number;
}) {
  await page.goto('/admin/events/create');
  await waitForPageLoad(page);

  await page.fill('[name="name"]', eventData.name);
  await page.fill('[name="dateTime.startDate"]', eventData.date);
  await page.fill('[name="capacity"]', eventData.capacity.toString());
  await page.fill('[name="ticketLots[0].price"]', eventData.ticketPrice.toString());

  await page.click('button[type="submit"]');
  await waitForPageLoad(page);

  // Get event ID from URL
  const url = page.url();
  const eventId = url.match(/events\/([^/]+)/)?.[1];

  return eventId;
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `test-results/screenshots/${name}-${timestamp}.png`, fullPage: true });
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}

/**
 * Check if element is visible and enabled
 */
export async function checkElementReady(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toBeEnabled();
}
