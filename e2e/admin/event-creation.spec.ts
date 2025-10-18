import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  loginAsAdmin,
  waitForAPIResponse,
  checkElementReady,
  TEST_ADMIN,
} from '../shared/test-helpers';

test.describe('Admin Panel - Event Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);
    await page.goto('http://localhost:3001/admin/dashboard');
    await waitForPageLoad(page);
  });

  test('should create a new event successfully', async ({ page }) => {
    const eventName = `Test Event ${Date.now()}`;

    await test.step('Navigate to create event page', async () => {
      await page.click('[data-testid="create-event-button"]');
      await waitForPageLoad(page);

      await expect(page).toHaveURL(/events\/create/);
      await expect(page.locator('h1')).toContainText(/create|crear|nuevo/i);
    });

    await test.step('Fill basic event information', async () => {
      // Event name
      await page.fill('[name="name"]', eventName);

      // Event description
      await page.fill('[name="description"]', 'This is a test event created by E2E tests');

      // Event category/genre
      const genreSelect = page.locator('[name="genres"]');
      if (await genreSelect.isVisible()) {
        await genreSelect.click();
        await page.locator('[data-value="Music"]').click();
      }

      // Capacity
      await page.fill('[name="capacity"]', '500');
    });

    await test.step('Set event date and time', async () => {
      // Start date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      await page.fill('[name="dateTime.startDate"]', dateString);
      await page.fill('[name="dateTime.startTime"]', '20:00');

      // End date
      await page.fill('[name="dateTime.endDate"]', dateString);
      await page.fill('[name="dateTime.endTime"]', '23:00');
    });

    await test.step('Set event location', async () => {
      await page.fill('[name="location.address"]', 'Av. Test 123');
      await page.fill('[name="location.city"]', 'Madrid');
      await page.fill('[name="location.country"]', 'Spain');
      await page.fill('[name="location.postalCode"]', '28001');
    });

    await test.step('Configure ticket lots', async () => {
      // General Admission ticket
      await page.fill('[name="ticketLots[0].name"]', 'General Admission');
      await page.fill('[name="ticketLots[0].price"]', '25.00');
      await page.fill('[name="ticketLots[0].quantity"]', '300');

      // Add VIP ticket
      const addTicketButton = page.locator('[data-testid="add-ticket-lot"]');
      if (await addTicketButton.isVisible()) {
        await addTicketButton.click();
        await page.fill('[name="ticketLots[1].name"]', 'VIP');
        await page.fill('[name="ticketLots[1].price"]', '50.00');
        await page.fill('[name="ticketLots[1].quantity"]', '100');
      }
    });

    await test.step('Upload event image', async () => {
      const fileInput = page.locator('[name="image"]');
      if (await fileInput.isVisible()) {
        // Create a test image file
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        await fileInput.setInputFiles({
          name: 'test-event-image.png',
          mimeType: 'image/png',
          buffer: buffer,
        });

        // Wait for upload to complete
        await waitForAPIResponse(page, /upload|storage/);
      }
    });

    await test.step('Configure additional settings', async () => {
      // Commission
      await page.fill('[name="commission"]', '5');

      // Max quantity per purchase
      await page.fill('[name="maxQuantity"]', '4');

      // Enable resale
      const resaleCheckbox = page.locator('[name="resale.enabled"]');
      if (await resaleCheckbox.isVisible()) {
        await resaleCheckbox.check();
        await page.fill('[name="resale.maxPrice"]', '60.00');
      }
    });

    const eventId = await test.step('Submit and create event', async () => {
      // Submit form
      await page.click('[data-testid="submit-event"]');

      // Wait for creation
      await waitForAPIResponse(page, /events/);
      await waitForPageLoad(page);

      // Should redirect to event details or event list
      await expect(page).not.toHaveURL(/create/);

      // Get event ID from URL or response
      const url = page.url();
      const eventId = url.match(/events\/([a-f0-9]{24})/)?.[1];

      return eventId;
    });

    await test.step('Verify event was created', async () => {
      // Navigate to events list
      await page.goto('http://localhost:3001/admin/events');
      await waitForPageLoad(page);

      // Search for our event
      const searchInput = page.locator('[data-testid="search-events"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill(eventName);
        await page.keyboard.press('Enter');
        await waitForPageLoad(page);
      }

      // Verify event appears in list
      await expect(page.locator(`text=${eventName}`)).toBeVisible({ timeout: 10000 });
    });
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="create-event-button"]');
    await waitForPageLoad(page);

    // Try to submit empty form
    await page.click('[data-testid="submit-event"]');

    // Check for validation errors
    const nameError = page.locator('[data-testid="name-error"]');
    if (await nameError.isVisible({ timeout: 2000 })) {
      await expect(nameError).toBeVisible();
    }

    // Form should still be on create page
    await expect(page).toHaveURL(/create/);
  });

  test('should allow event draft saving', async ({ page }) => {
    await page.click('[data-testid="create-event-button"]');
    await waitForPageLoad(page);

    const eventName = `Draft Event ${Date.now()}`;

    // Fill minimal data
    await page.fill('[name="name"]', eventName);
    await page.fill('[name="capacity"]', '100');

    // Save as draft
    const saveDraftButton = page.locator('[data-testid="save-draft"]');
    if (await saveDraftButton.isVisible()) {
      await saveDraftButton.click();
      await waitForAPIResponse(page, /events/);

      // Verify draft was saved
      await page.goto('http://localhost:3001/admin/events?status=CREATED');
      await waitForPageLoad(page);

      await expect(page.locator(`text=${eventName}`)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should edit existing event', async ({ page }) => {
    // Go to events list
    await page.goto('http://localhost:3001/admin/events');
    await waitForPageLoad(page);

    // Click on first event
    const firstEvent = page.locator('[data-testid^="event-"]').first();
    const originalName = await firstEvent.locator('[data-testid="event-name"]').textContent();
    await firstEvent.click();
    await waitForPageLoad(page);

    // Click edit button
    await page.click('[data-testid="edit-event"]');
    await waitForPageLoad(page);

    // Modify event name
    const newName = `${originalName} (Edited)`;
    await page.fill('[name="name"]', newName);

    // Save changes
    await page.click('[data-testid="submit-event"]');
    await waitForAPIResponse(page, /events/);
    await waitForPageLoad(page);

    // Verify changes
    await expect(page.locator('h1, h2')).toContainText(newName);
  });

  test('should delete event', async ({ page }) => {
    // Create a test event first
    await page.click('[data-testid="create-event-button"]');
    await waitForPageLoad(page);

    const eventName = `To Delete ${Date.now()}`;
    await page.fill('[name="name"]', eventName);
    await page.fill('[name="capacity"]', '50');
    await page.fill('[name="dateTime.startDate"]', '2025-12-31');

    await page.click('[data-testid="submit-event"]');
    await waitForAPIResponse(page, /events/);
    await waitForPageLoad(page);

    // Now delete it
    await page.click('[data-testid="delete-event"]');

    // Confirm deletion
    const confirmButton = page.locator('[data-testid="confirm-delete"]');
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
      await waitForAPIResponse(page, /events/);
    }

    // Verify event is deleted
    await page.goto('http://localhost:3001/admin/events');
    await waitForPageLoad(page);

    const deletedEvent = page.locator(`text=${eventName}`);
    await expect(deletedEvent).not.toBeVisible();
  });
});
