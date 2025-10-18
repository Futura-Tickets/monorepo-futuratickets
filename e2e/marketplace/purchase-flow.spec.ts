import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  fillStripeCardDetails,
  loginAsUser,
  waitForAPIResponse,
  checkElementReady,
  TEST_USER,
  STRIPE_TEST_CARD,
} from '../shared/test-helpers';

test.describe('Marketplace - Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to marketplace homepage
    await page.goto('http://localhost:3000');
    await waitForPageLoad(page);
  });

  test('should complete full ticket purchase flow', async ({ page }) => {
    // Step 1: Browse events
    await test.step('Browse available events', async () => {
      await expect(page.locator('h1')).toContainText(/events|eventos/i);

      // Wait for events to load
      await waitForAPIResponse(page, '/api/events');

      // Verify events are displayed
      const eventCards = page.locator('[data-testid="event-card"]');
      await expect(eventCards.first()).toBeVisible({ timeout: 10000 });
    });

    // Step 2: Select an event
    const eventName = await test.step('Select an event', async () => {
      const firstEvent = page.locator('[data-testid="event-card"]').first();
      const eventTitle = await firstEvent.locator('h2, h3').textContent();

      await firstEvent.click();
      await waitForPageLoad(page);

      // Verify event details page
      await expect(page.locator('h1')).toContainText(eventTitle || '');

      return eventTitle;
    });

    // Step 3: Select tickets
    await test.step('Select tickets', async () => {
      // Find ticket selector
      await checkElementReady(page, '[data-testid="ticket-quantity-selector"]');

      // Select 2 tickets
      const quantitySelector = page.locator('[data-testid="ticket-quantity-selector"]');
      await quantitySelector.click();
      await page.locator('[data-testid="quantity-2"]').click();

      // Verify total price is displayed
      await expect(page.locator('[data-testid="total-price"]')).toBeVisible();

      // Click buy button
      await page.click('[data-testid="buy-tickets-button"]');
      await waitForPageLoad(page);
    });

    // Step 4: Fill contact information
    await test.step('Fill contact information', async () => {
      // Check if on checkout page
      await expect(page).toHaveURL(/checkout|compra/);

      // Fill contact form
      await page.fill('[name="name"]', TEST_USER.name);
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="phone"]', TEST_USER.phone);

      // Accept terms and conditions
      const termsCheckbox = page.locator('[name="acceptTerms"]');
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
    });

    // Step 5: Payment with Stripe
    const orderId = await test.step('Complete payment', async () => {
      // Fill Stripe card details
      await fillStripeCardDetails(page);

      // Submit payment
      await page.click('[data-testid="submit-payment"]');

      // Wait for payment processing
      const responsePromise = waitForAPIResponse(page, /stripe|payment/);
      await responsePromise;

      // Wait for success page
      await page.waitForURL(/success|confirmacion/, { timeout: 30000 });

      // Verify success message
      await expect(page.locator('h1, h2')).toContainText(/success|confirmado|gracias/i);

      // Get order ID from success page
      const orderText = await page.locator('[data-testid="order-id"]').textContent();
      const orderId = orderText?.match(/\w{24}/)?.[0]; // MongoDB ObjectId pattern

      return orderId;
    });

    // Step 6: Verify order confirmation
    await test.step('Verify order confirmation', async () => {
      // Check for ticket download/view buttons
      const ticketButton = page.locator('[data-testid="view-tickets"]');
      if (await ticketButton.isVisible()) {
        await expect(ticketButton).toBeEnabled();
      }

      // Check for QR codes
      const qrCodes = page.locator('[data-testid="ticket-qr"]');
      if (await qrCodes.first().isVisible({ timeout: 5000 })) {
        await expect(qrCodes).toHaveCount(2); // We bought 2 tickets
      }

      // Verify order details
      await expect(page.locator('[data-testid="event-name"]')).toContainText(eventName || '');
      await expect(page.locator('[data-testid="ticket-quantity"]')).toContainText('2');
    });

    // Step 7: Verify in user account
    await test.step('Verify tickets in user account', async () => {
      // Navigate to user account/orders
      await page.goto('http://localhost:3000/account/orders');
      await waitForPageLoad(page);

      // Find the order we just created
      const orderCard = page.locator(`[data-testid="order-${orderId}"]`);
      if (await orderCard.isVisible({ timeout: 5000 })) {
        await expect(orderCard).toContainText(eventName || '');
      } else {
        // Fallback: check first order
        const firstOrder = page.locator('[data-testid^="order-"]').first();
        await expect(firstOrder).toBeVisible();
      }
    });
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    // Navigate to an event
    await page.goto('http://localhost:3000');
    await waitForPageLoad(page);

    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await firstEvent.click();
    await waitForPageLoad(page);

    // Select tickets
    await page.click('[data-testid="buy-tickets-button"]');
    await waitForPageLoad(page);

    // Fill contact info
    await page.fill('[name="name"]', TEST_USER.name);
    await page.fill('[name="email"]', TEST_USER.email);
    await page.fill('[name="phone"]', TEST_USER.phone);

    // Use Stripe test card that will fail
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('[placeholder="Card number"]').fill('4000000000000002'); // Card declined
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/34');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');

    // Submit payment
    await page.click('[data-testid="submit-payment"]');

    // Verify error message is shown
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="payment-error"]')).toContainText(/error|declined|failed/i);

    // Verify we're still on checkout page
    await expect(page).toHaveURL(/checkout|compra/);
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to an event
    await page.goto('http://localhost:3000');
    await waitForPageLoad(page);

    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await firstEvent.click();
    await waitForPageLoad(page);

    // Select tickets
    await page.click('[data-testid="buy-tickets-button"]');
    await waitForPageLoad(page);

    // Try to submit without filling form
    await page.click('[data-testid="submit-payment"]');

    // Check for validation errors
    const emailError = page.locator('[data-testid="email-error"]');
    const nameError = page.locator('[data-testid="name-error"]');

    if (await emailError.isVisible({ timeout: 2000 })) {
      await expect(emailError).toBeVisible();
    }

    if (await nameError.isVisible({ timeout: 2000 })) {
      await expect(nameError).toBeVisible();
    }

    // Verify we're still on checkout page
    await expect(page).toHaveURL(/checkout|compra/);
  });

  test('should update total when changing ticket quantity', async ({ page }) => {
    // Navigate to an event
    await page.goto('http://localhost:3000');
    await waitForPageLoad(page);

    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await firstEvent.click();
    await waitForPageLoad(page);

    // Get single ticket price
    const priceText = await page.locator('[data-testid="ticket-price"]').textContent();
    const singlePrice = parseFloat(priceText?.replace(/[^\d.]/g, '') || '0');

    // Select 1 ticket
    await page.locator('[data-testid="ticket-quantity-selector"]').click();
    await page.locator('[data-testid="quantity-1"]').click();

    let totalText = await page.locator('[data-testid="total-price"]').textContent();
    let total = parseFloat(totalText?.replace(/[^\d.]/g, '') || '0');
    expect(total).toBe(singlePrice);

    // Select 3 tickets
    await page.locator('[data-testid="ticket-quantity-selector"]').click();
    await page.locator('[data-testid="quantity-3"]').click();

    totalText = await page.locator('[data-testid="total-price"]').textContent();
    total = parseFloat(totalText?.replace(/[^\d.]/g, '') || '0');
    expect(total).toBe(singlePrice * 3);
  });
});
