import { test as base } from '@playwright/test';

/**
 * Custom fixtures for FuturaTickets E2E tests
 */

type FuturaTicketsFixtures = {
  authenticatedPage: any;
  adminPage: any;
};

/**
 * Extend base test with custom fixtures
 */
export const test = base.extend<FuturaTicketsFixtures>({
  // Authenticated user page
  authenticatedPage: async ({ page }, use) => {
    // Setup: login as user
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('[name="email"]', 'test@futuratickets.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');

    await use(page);

    // Teardown: logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout"]');
  },

  // Authenticated admin page
  adminPage: async ({ page }, use) => {
    // Setup: login as admin
    await page.goto('http://localhost:3001/admin/login');
    await page.fill('[name="email"]', 'admin@futuratickets.com');
    await page.fill('[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3001/admin/dashboard');

    await use(page);

    // Teardown: logout
    await page.click('[data-testid="admin-menu"]');
    await page.click('[data-testid="logout"]');
  },
});

export { expect } from '@playwright/test';
