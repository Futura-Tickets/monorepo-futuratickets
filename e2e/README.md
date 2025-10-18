# E2E Testing - FuturaTickets

Comprehensive end-to-end testing suite using Playwright for the FuturaTickets monorepo.

## 📋 Overview

This E2E testing infrastructure tests the complete user journeys across all three applications:
- **Marketplace Web** (Port 3000): User ticket purchasing flow
- **Admin Panel** (Port 3001): Event creation and management
- **Access App** (Port 3007): Ticket validation and access control

## 🚀 Quick Start

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (recommended for development)
npm run test:e2e:ui

# Run tests with browser visible
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug
```

## 📁 Test Structure

```
e2e/
├── marketplace/              # Marketplace web tests
│   └── purchase-flow.spec.ts    # Complete ticket purchase journey
├── admin/                    # Admin panel tests
│   └── event-creation.spec.ts   # Event CRUD operations
├── access/                   # Access app tests
│   └── ticket-validation.spec.ts # QR scanning & validation
└── shared/                   # Shared utilities
    ├── test-helpers.ts          # Helper functions
    └── fixtures.ts              # Playwright fixtures
```

## 🧪 Test Scenarios

### Marketplace Tests (`e2e/marketplace/`)

#### `purchase-flow.spec.ts`
1. **Complete ticket purchase flow** (Critical Path)
   - Browse available events
   - Select an event and view details
   - Select ticket quantity
   - Fill contact information
   - Complete Stripe payment
   - Verify order confirmation
   - Check tickets in user account

2. **Payment failure handling**
   - Test declined card scenario
   - Verify error messages
   - Ensure user can retry

3. **Form validation**
   - Required fields validation
   - Email format validation
   - Phone number validation

4. **Dynamic pricing**
   - Verify total updates with quantity
   - Test commission calculations

### Admin Tests (`e2e/admin/`)

#### `event-creation.spec.ts`
1. **Create new event**
   - Fill all event details
   - Configure ticket lots
   - Upload event image
   - Set location and datetime
   - Submit and verify creation

2. **Form validation**
   - Required fields
   - Date validation
   - Capacity limits

3. **Draft saving**
   - Save incomplete event as draft
   - Resume editing draft

4. **Edit existing event**
   - Modify event details
   - Update ticket prices
   - Change event status

5. **Delete event**
   - Delete event
   - Verify deletion

### Access Tests (`e2e/access/`)

#### `ticket-validation.spec.ts`
1. **Valid ticket scanning**
   - Scan QR code
   - Verify validation success
   - Display ticket information

2. **Invalid ticket rejection**
   - Test invalid ticket ID
   - Verify error message

3. **Duplicate scan prevention**
   - Scan same ticket twice
   - Verify second scan is rejected

4. **Validation history**
   - View past validations
   - Filter by event

5. **Offline mode**
   - Test offline validation
   - Verify sync when back online

6. **Real-time statistics**
   - View scanned/granted/denied counts
   - Filter by event

## 🛠️ Configuration

### Environment Variables

Create `.env.test` file:

```env
PLAYWRIGHT_BASE_URL=http://localhost:3000
TEST_ADMIN_EMAIL=admin@futuratickets.com
TEST_ADMIN_PASSWORD=Admin123!
TEST_USER_EMAIL=test@futuratickets.com
TEST_USER_PASSWORD=Test123!
```

### Playwright Config

See `playwright.config.ts` for configuration:
- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:3000` (configurable)
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 13
- **Reporters**: HTML, JSON, JUnit
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

## 📊 Running Tests

### Local Development

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/marketplace/purchase-flow.spec.ts

# Run specific test by name
npx playwright test -g "should complete full ticket purchase"

# Run tests for specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Run tests for specific app
npm run test:e2e:marketplace
npm run test:e2e:admin
npm run test:e2e:access

# Interactive mode (best for development)
npm run test:e2e:ui

# Debug mode (step through)
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

### CI/CD

Tests run automatically on:
- Push to `main` or `dev` branches
- Pull requests to `main` or `dev`
- Manual workflow dispatch

See `.github/workflows/e2e-tests.yml` for CI configuration.

## 🔧 Helper Functions

### `test-helpers.ts`

```typescript
// Login helpers
await loginAsUser(page);
await loginAsAdmin(page);

// Stripe payment
await fillStripeCardDetails(page);

// Navigation
await waitForPageLoad(page);
await waitForAPIResponse(page, '/api/events');

// Validation
await checkElementReady(page, '[data-testid="button"]');

// Screenshots
await takeTimestampedScreenshot(page, 'error-state');

// Test data
TEST_USER = { email, password, name, phone }
TEST_ADMIN = { email, password, name }
STRIPE_TEST_CARD = { number, expiry, cvc, zip }
```

### Custom Fixtures

```typescript
import { test, expect } from '../shared/fixtures';

test('my test', async ({ authenticatedPage }) => {
  // Page is already logged in as user
});

test('admin test', async ({ adminPage }) => {
  // Page is already logged in as admin
});
```

## 📝 Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';
import { waitForPageLoad, TEST_USER } from '../shared/test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
    await page.goto('http://localhost:3000');
    await waitForPageLoad(page);
  });

  test('should do something', async ({ page }) => {
    await test.step('Step 1 description', async () => {
      // Test code
      await page.click('[data-testid="button"]');
      await expect(page.locator('h1')).toBeVisible();
    });

    await test.step('Step 2 description', async () => {
      // More test code
    });
  });
});
```

### Best Practices

1. **Use data-testid attributes** for stable selectors
   ```html
   <button data-testid="submit-button">Submit</button>
   ```

2. **Use test.step()** for better reporting
   ```typescript
   await test.step('Login', async () => { ... });
   ```

3. **Wait for specific conditions**
   ```typescript
   await page.waitForURL(/success/);
   await waitForAPIResponse(page, '/api/orders');
   ```

4. **Handle flakiness**
   ```typescript
   await expect(element).toBeVisible({ timeout: 10000 });
   ```

5. **Clean up after tests**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Delete test data
   });
   ```

## 🐛 Debugging

### View Trace

```bash
# Generate trace on failure (automatic)
npm run test:e2e

# View trace
npx playwright show-trace test-results/.../trace.zip
```

### Screenshots

Screenshots are automatically taken on failure:
```
test-results/
  feature-name-chromium/
    test-failed-1.png
```

### Videos

Videos are recorded on failure:
```
test-results/
  feature-name-chromium/
    video.webm
```

### Debug Mode

```bash
# Run with debugger
npm run test:e2e:debug

# Debug specific test
npx playwright test --debug e2e/marketplace/purchase-flow.spec.ts
```

## 📈 Test Reports

### HTML Report

```bash
# View report
npm run test:e2e:report
```

Report includes:
- Test results by browser
- Screenshots on failure
- Video recordings
- Trace files
- Test duration
- Retry information

### CI Reports

GitHub Actions generates:
- HTML report (artifact)
- JSON results (artifact)
- JUnit XML (for integrations)
- PR comment with summary

## 🔍 Selectors Guide

### Priority Order

1. **data-testid** (most stable)
   ```typescript
   page.locator('[data-testid="submit-button"]')
   ```

2. **Role + Name** (semantic)
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   ```

3. **Label** (for forms)
   ```typescript
   page.getByLabel('Email')
   ```

4. **Placeholder**
   ```typescript
   page.getByPlaceholder('Enter email')
   ```

5. **Text content** (last resort)
   ```typescript
   page.getByText('Submit')
   ```

## 🚨 Common Issues

### Services not running
```bash
# Ensure all services are started
npm run start:all

# Verify health
./scripts/utilities/smoke-tests.sh
```

### Port conflicts
```bash
# Check ports
lsof -i :3000
lsof -i :3001
lsof -i :3007

# Kill processes
./scripts/utilities/cleanup-processes.sh
```

### Browser install fails
```bash
# Install with dependencies
npx playwright install --with-deps chromium
```

### Timeout issues
```typescript
// Increase timeout for slow operations
await page.waitForSelector('[data-testid="button"]', { timeout: 30000 });
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Selector Strategies](https://playwright.dev/docs/selectors)
- [CI/CD with Playwright](https://playwright.dev/docs/ci)

## 🎯 Coverage Goals

- **Critical paths**: 100% coverage
  - Ticket purchase flow
  - Event creation
  - Ticket validation

- **Happy paths**: 90% coverage
  - All major features tested

- **Edge cases**: 70% coverage
  - Error scenarios
  - Validation flows

## 🔄 Maintenance

### Updating Playwright

```bash
# Update to latest version
npm install -D @playwright/test@latest

# Update browsers
npx playwright install
```

### Adding New Tests

1. Create test file in appropriate directory
2. Import helpers from `../shared/test-helpers`
3. Add data-testid to components being tested
4. Run test locally before committing
5. Verify CI passes

## 📞 Support

For issues or questions:
1. Check existing test files for examples
2. Review Playwright documentation
3. Ask in team chat
4. Create issue in repository
