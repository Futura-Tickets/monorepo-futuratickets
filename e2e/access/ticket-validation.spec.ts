import { test, expect } from '@playwright/test';
import { waitForPageLoad, waitForAPIResponse } from '../shared/test-helpers';

test.describe('Access App - Ticket Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to access app
    await page.goto('http://localhost:3007');
    await waitForPageLoad(page);
  });

  test('should scan and validate a valid ticket', async ({ page }) => {
    await test.step('Navigate to scanner', async () => {
      await expect(page.locator('h1')).toContainText(/access|acceso|validar/i);

      // Check scanner is ready
      const scannerElement = page.locator('[data-testid="qr-scanner"]');
      await expect(scannerElement).toBeVisible({ timeout: 10000 });
    });

    await test.step('Scan valid QR code', async () => {
      // Simulate scanning a valid QR code
      // In real scenario, this would use camera
      // For testing, we can trigger validation directly

      const validTicketId = '507f1f77bcf86cd799439011'; // Mock ticket ID

      // Trigger manual validation
      const manualInput = page.locator('[data-testid="manual-ticket-input"]');
      if (await manualInput.isVisible({ timeout: 2000 })) {
        await manualInput.fill(validTicketId);
        await page.click('[data-testid="validate-ticket"]');
      } else {
        // Simulate QR scan result
        await page.evaluate((ticketId) => {
          window.dispatchEvent(
            new CustomEvent('qr-scanned', { detail: { ticketId } })
          );
        }, validTicketId);
      }

      // Wait for validation response
      await waitForAPIResponse(page, /validate|tickets/);
    });

    await test.step('Verify validation success', async () => {
      // Check for success message
      const successMessage = page.locator('[data-testid="validation-success"]');
      await expect(successMessage).toBeVisible({ timeout: 5000 });

      // Verify success state
      await expect(successMessage).toContainText(/valid|granted|permitido/i);

      // Check for green/success indicator
      const successIndicator = page.locator('[data-testid="success-indicator"]');
      if (await successIndicator.isVisible({ timeout: 2000 })) {
        await expect(successIndicator).toHaveClass(/success|green|valid/);
      }
    });

    await test.step('Display ticket information', async () => {
      // Event name should be displayed
      const eventInfo = page.locator('[data-testid="event-name"]');
      if (await eventInfo.isVisible({ timeout: 2000 })) {
        await expect(eventInfo).not.toBeEmpty();
      }

      // Ticket type
      const ticketType = page.locator('[data-testid="ticket-type"]');
      if (await ticketType.isVisible({ timeout: 2000 })) {
        await expect(ticketType).not.toBeEmpty();
      }

      // Owner name
      const ownerName = page.locator('[data-testid="ticket-owner"]');
      if (await ownerName.isVisible({ timeout: 2000 })) {
        await expect(ownerName).not.toBeEmpty();
      }
    });
  });

  test('should reject invalid ticket', async ({ page }) => {
    const invalidTicketId = 'invalid-ticket-id-123';

    // Try to validate invalid ticket
    const manualInput = page.locator('[data-testid="manual-ticket-input"]');
    if (await manualInput.isVisible({ timeout: 2000 })) {
      await manualInput.fill(invalidTicketId);
      await page.click('[data-testid="validate-ticket"]');
    } else {
      await page.evaluate((ticketId) => {
        window.dispatchEvent(
          new CustomEvent('qr-scanned', { detail: { ticketId } })
        );
      }, invalidTicketId);
    }

    // Wait for validation response
    await waitForAPIResponse(page, /validate|tickets/);

    // Verify rejection
    const errorMessage = page.locator('[data-testid="validation-error"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText(/invalid|denied|no válido/i);

    // Check for red/error indicator
    const errorIndicator = page.locator('[data-testid="error-indicator"]');
    if (await errorIndicator.isVisible({ timeout: 2000 })) {
      await expect(errorIndicator).toHaveClass(/error|red|invalid/);
    }
  });

  test('should reject already used ticket', async ({ page }) => {
    const usedTicketId = '507f1f77bcf86cd799439012'; // Mock used ticket

    // Validate ticket first time (should succeed)
    const manualInput = page.locator('[data-testid="manual-ticket-input"]');
    if (await manualInput.isVisible({ timeout: 2000 })) {
      await manualInput.fill(usedTicketId);
      await page.click('[data-testid="validate-ticket"]');
      await waitForAPIResponse(page, /validate|tickets/);

      // Verify first validation succeeded
      await expect(page.locator('[data-testid="validation-success"]')).toBeVisible({
        timeout: 5000,
      });

      // Wait a moment
      await page.waitForTimeout(1000);

      // Try to validate again
      await manualInput.fill(usedTicketId);
      await page.click('[data-testid="validate-ticket"]');
      await waitForAPIResponse(page, /validate|tickets/);

      // Verify second validation fails
      const errorMessage = page.locator('[data-testid="validation-error"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      await expect(errorMessage).toContainText(/used|already|ya utilizado/i);
    }
  });

  test('should display validation history', async ({ page }) => {
    // Navigate to history page
    const historyButton = page.locator('[data-testid="view-history"]');
    if (await historyButton.isVisible({ timeout: 2000 })) {
      await historyButton.click();
      await waitForPageLoad(page);

      // Verify history page loaded
      await expect(page).toHaveURL(/history|historial/);

      // Check for history entries
      const historyEntries = page.locator('[data-testid^="history-entry-"]');
      const count = await historyEntries.count();

      if (count > 0) {
        // Verify first entry has required info
        const firstEntry = historyEntries.first();
        await expect(firstEntry.locator('[data-testid="timestamp"]')).toBeVisible();
        await expect(firstEntry.locator('[data-testid="ticket-id"]')).toBeVisible();
        await expect(firstEntry.locator('[data-testid="status"]')).toBeVisible();
      }
    }
  });

  test('should handle offline mode', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    // Try to validate a ticket
    const ticketId = '507f1f77bcf86cd799439013';

    const manualInput = page.locator('[data-testid="manual-ticket-input"]');
    if (await manualInput.isVisible({ timeout: 2000 })) {
      await manualInput.fill(ticketId);
      await page.click('[data-testid="validate-ticket"]');

      // Check for offline message
      const offlineMessage = page.locator('[data-testid="offline-message"]');
      await expect(offlineMessage).toBeVisible({ timeout: 5000 });
    }

    // Go back online
    await context.setOffline(false);

    // Verify sync functionality
    const syncButton = page.locator('[data-testid="sync-offline-validations"]');
    if (await syncButton.isVisible({ timeout: 2000 })) {
      await syncButton.click();
      await waitForAPIResponse(page, /sync|validations/);

      // Check for success
      await expect(page.locator('[data-testid="sync-success"]')).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should filter validations by event', async ({ page }) => {
    // Navigate to scanner or dashboard
    await waitForPageLoad(page);

    // Look for event filter
    const eventFilter = page.locator('[data-testid="event-filter"]');
    if (await eventFilter.isVisible({ timeout: 2000 })) {
      await eventFilter.click();

      // Select an event
      const eventOption = page.locator('[data-testid="event-option"]').first();
      const eventName = await eventOption.textContent();
      await eventOption.click();

      await waitForPageLoad(page);

      // Verify filter is applied
      await expect(page.locator('[data-testid="selected-event"]')).toContainText(
        eventName || ''
      );
    }
  });

  test('should display real-time statistics', async ({ page }) => {
    // Navigate to stats dashboard
    const statsButton = page.locator('[data-testid="view-stats"]');
    if (await statsButton.isVisible({ timeout: 2000 })) {
      await statsButton.click();
      await waitForPageLoad(page);

      // Check for statistics widgets
      const totalScanned = page.locator('[data-testid="total-scanned"]');
      const totalGranted = page.locator('[data-testid="total-granted"]');
      const totalDenied = page.locator('[data-testid="total-denied"]');

      if (await totalScanned.isVisible({ timeout: 2000 })) {
        await expect(totalScanned).not.toBeEmpty();
      }

      if (await totalGranted.isVisible({ timeout: 2000 })) {
        await expect(totalGranted).not.toBeEmpty();
      }

      if (await totalDenied.isVisible({ timeout: 2000 })) {
        await expect(totalDenied).not.toBeEmpty();
      }
    }
  });
});
