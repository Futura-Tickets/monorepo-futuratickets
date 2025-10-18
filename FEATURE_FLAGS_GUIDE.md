# Feature Flags System - Complete Guide

## Overview

The Feature Flags system allows you to control feature availability dynamically without deploying code changes.

**Key Features:**
- ✅ Environment-specific toggles (dev, staging, production)
- ✅ User/role-based targeting
- ✅ Percentage rollouts (gradual releases)
- ✅ Scheduled releases (auto-enable/disable)
- ✅ Caching for performance
- ✅ Admin UI integration ready
- ✅ Real-time evaluation

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Application Layer                   │
│  @FeatureFlag('enable_resale') decorator        │
└────────────────┬────────────────────────────────┘
                 │
          ┌──────▼──────┐
          │FeatureFlagGuard│
          └──────┬──────┘
                 │
          ┌──────▼──────────┐
          │FeatureFlagsService│
          │  - Evaluation     │
          │  - Caching        │
          │  - Targeting      │
          └──────┬──────────┘
                 │
          ┌──────▼──────┐
          │  MongoDB     │
          │feature_flags │
          └──────────────┘
```

## Installation

### 1. Add Module to App

```typescript
// app.module.ts
import { FeatureFlagsModule } from './FeatureFlags/feature-flags.module';

@Module({
  imports: [
    // ... other modules
    FeatureFlagsModule,
  ],
})
export class AppModule {}
```

### 2. Verify MongoDB Connection

Feature flags are stored in the `feature_flags` collection.

## Usage

### Basic Usage - Protect an Endpoint

```typescript
import { FeatureFlag } from './FeatureFlags/feature-flag.decorator';

@Controller('events')
export class EventsController {
  // Only accessible if 'enable_resale_marketplace' is enabled
  @Get('/resale')
  @FeatureFlag('enable_resale_marketplace')
  async getResaleItems() {
    return this.resaleService.findAll();
  }
}
```

### Protect Entire Controller

```typescript
@Controller('admin/beta')
@FeatureFlag('enable_admin_beta_panel')
export class BetaFeaturesController {
  // All routes in this controller require the feature flag
  @Get('/analytics')
  async getBetaAnalytics() { ... }

  @Get('/reports')
  async getBetaReports() { ... }
}
```

### Check Feature Flag in Service

```typescript
import { FeatureFlagsService } from './FeatureFlags/feature-flags.service';

@Injectable()
export class OrdersService {
  constructor(
    private featureFlagsService: FeatureFlagsService,
  ) {}

  async createOrder(dto: CreateOrderDto, user: User) {
    // Check if blockchain integration is enabled
    const useBlockchain = await this.featureFlagsService.isEnabled(
      'enable_blockchain_tickets',
      {
        userId: user._id.toString(),
        userRole: user.role,
        environment: 'production',
      },
    );

    if (useBlockchain) {
      await this.mintNFT(dto);
    } else {
      await this.createTraditionalTicket(dto);
    }
  }
}
```

### Conditional Features in Frontend (via API)

```typescript
// GET /admin/feature-flags/enable_dark_mode/evaluate
const response = await fetch('/admin/feature-flags/enable_dark_mode/evaluate');
const { enabled } = await response.json();

if (enabled) {
  // Show dark mode toggle
}
```

## Creating Feature Flags

### Via API (Recommended)

```bash
POST /admin/feature-flags
Content-Type: application/json

{
  "key": "enable_resale_marketplace",
  "name": "Resale Marketplace",
  "description": "Allow users to resell their tickets",
  "tags": ["marketplace", "resale", "beta"],
  "createdBy": "admin_user_id",
  "development": {
    "enabled": true,
    "targeting": []
  },
  "staging": {
    "enabled": true,
    "targeting": []
  },
  "production": {
    "enabled": false,
    "targeting": [
      {
        "type": "percentage",
        "percentage": 10
      }
    ]
  }
}
```

### Via MongoDB (Development)

```javascript
db.feature_flags.insertOne({
  key: 'enable_dark_mode',
  name: 'Dark Mode',
  description: 'Dark theme UI',
  development: {
    enabled: true,
    targeting: []
  },
  staging: {
    enabled: true,
    targeting: []
  },
  production: {
    enabled: true,
    targeting: []
  },
  status: 'stable',
  tags: ['ui', 'theme'],
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## Targeting Rules

### Rule Types

1. **User-based** - Specific user IDs
2. **Role-based** - User roles (ADMIN, PROMOTER, USER)
3. **Email-based** - Specific email addresses
4. **Percentage-based** - Gradual rollouts (0-100%)

### Examples

#### 1. Enable for Specific Users

```json
{
  "production": {
    "enabled": true,
    "targeting": [
      {
        "type": "user",
        "values": ["user_id_1", "user_id_2", "user_id_3"]
      }
    ]
  }
}
```

#### 2. Enable for Admins Only

```json
{
  "production": {
    "enabled": true,
    "targeting": [
      {
        "type": "role",
        "values": ["ADMIN", "PROMOTER"]
      }
    ]
  }
}
```

#### 3. Beta Testers (Email List)

```json
{
  "production": {
    "enabled": true,
    "targeting": [
      {
        "type": "email",
        "values": [
          "beta@futuratickets.com",
          "tester@example.com"
        ]
      }
    ]
  }
}
```

#### 4. Gradual Rollout (10% of users)

```json
{
  "production": {
    "enabled": true,
    "targeting": [
      {
        "type": "percentage",
        "percentage": 10
      }
    ]
  }
}
```

**Note**: Percentage rollout is consistent - same user always gets same result.

#### 5. Combined Rules (Any match wins)

```json
{
  "production": {
    "enabled": true,
    "targeting": [
      {
        "type": "role",
        "values": ["ADMIN"]
      },
      {
        "type": "percentage",
        "percentage": 5
      }
    ]
  }
}
```

This enables the feature for:
- ALL admins, OR
- 5% of all users

## Scheduled Releases

### Auto-enable on Specific Date

```json
{
  "key": "black_friday_promotions",
  "name": "Black Friday Promotions",
  "scheduledEnableDate": "2025-11-29T00:00:00.000Z",
  "production": {
    "enabled": false
  }
}
```

Feature will automatically enable on Black Friday at midnight.

### Auto-disable After Date

```json
{
  "key": "christmas_theme",
  "name": "Christmas Theme",
  "scheduledEnableDate": "2025-12-01T00:00:00.000Z",
  "scheduledDisableDate": "2025-12-26T23:59:59.000Z",
  "production": {
    "enabled": false
  }
}
```

Feature will:
1. Enable on December 1st
2. Disable on December 26th

### Cron Job Processing

Scheduled flags are processed automatically every hour by the `@Cron` job in `FeatureFlagsService`.

```typescript
@Cron(CronExpression.EVERY_HOUR)
async processScheduledFlags(): Promise<void> {
  // Auto-enable/disable based on scheduled dates
}
```

## Feature Flag Lifecycle

### 1. Development Phase

```json
{
  "status": "development",
  "development": { "enabled": true },
  "staging": { "enabled": false },
  "production": { "enabled": false }
}
```

### 2. Beta Testing

```json
{
  "status": "beta",
  "development": { "enabled": true },
  "staging": { "enabled": true },
  "production": {
    "enabled": true,
    "targeting": [{ "type": "role", "values": ["ADMIN"] }]
  }
}
```

### 3. Gradual Rollout

```json
{
  "status": "beta",
  "production": {
    "enabled": true,
    "targeting": [{ "type": "percentage", "percentage": 10 }]
  }
}
```

Increase percentage: 10% → 25% → 50% → 100%

### 4. Full Release

```json
{
  "status": "stable",
  "production": {
    "enabled": true,
    "targeting": []
  }
}
```

### 5. Deprecation

```json
{
  "status": "deprecated",
  "active": false
}
```

## API Endpoints

### List All Feature Flags

```bash
GET /admin/feature-flags
```

**Response:**
```json
[
  {
    "_id": "...",
    "key": "enable_resale_marketplace",
    "name": "Resale Marketplace",
    "description": "...",
    "development": { "enabled": true },
    "staging": { "enabled": true },
    "production": { "enabled": false },
    "status": "beta",
    "tags": ["marketplace"],
    "evaluationCount": 1523,
    "lastEvaluatedAt": "2025-10-18T12:00:00.000Z"
  }
]
```

### Get Feature Flag

```bash
GET /admin/feature-flags/enable_resale_marketplace
```

### Create Feature Flag

```bash
POST /admin/feature-flags

{
  "key": "new_feature",
  "name": "New Feature",
  "description": "Description",
  "createdBy": "admin_id"
}
```

### Update Feature Flag

```bash
PUT /admin/feature-flags/enable_resale_marketplace

{
  "production": {
    "enabled": true,
    "targeting": [{ "type": "percentage", "percentage": 50 }]
  },
  "lastModifiedBy": "admin_id"
}
```

### Delete Feature Flag

```bash
DELETE /admin/feature-flags/old_feature
```

### Evaluate Feature Flag

```bash
GET /admin/feature-flags/enable_dark_mode/evaluate
```

**Response:**
```json
{
  "key": "enable_dark_mode",
  "enabled": true
}
```

### Clear Cache

```bash
POST /admin/feature-flags/cache/clear
```

## Caching Strategy

### How Caching Works

1. Feature flags are cached in-memory for **1 minute**
2. Cache is automatically invalidated on update/delete
3. Cache key: feature flag `key`

### Cache Benefits

- 🚀 **Fast**: No database query for cached flags
- 📉 **Reduced Load**: Less MongoDB queries
- ⚡ **Predictable**: 1-minute TTL ensures fresh data

### Clear Cache

```typescript
// In service
this.featureFlagsService.clearCache();

// Via API
POST /admin/feature-flags/cache/clear
```

## Best Practices

### ✅ Do's

1. **Use descriptive keys**
   - ✅ `enable_resale_marketplace`
   - ❌ `feature1`

2. **Add descriptions**
   - Helps team understand purpose
   - Documents business context

3. **Use tags for organization**
   - `['payment', 'beta']`
   - `['ui', 'experimental']`

4. **Start with low percentages**
   - Begin with 1-5% rollout
   - Monitor metrics before increasing

5. **Document targeting rules**
   - Who should see this feature?
   - Why these specific users?

6. **Clean up old flags**
   - Delete deprecated flags
   - Keep database clean

### ❌ Don'ts

1. **Don't use for configuration**
   - ❌ Feature flags for API keys
   - ❌ Feature flags for URLs
   - ✅ Use environment variables instead

2. **Don't create too many flags**
   - Max 20-30 active flags
   - Archive or delete unused flags

3. **Don't skip rollback testing**
   - Test disabling feature
   - Ensure app works without feature

4. **Don't hardcode user IDs in production**
   - Use roles or percentages instead
   - User-specific should be temporary

5. **Don't forget to remove code**
   - When flag reaches 100%, remove flag check
   - Clean up deprecated code branches

## Example Use Cases

### 1. Payment Provider Switch

```typescript
@Post('/create-payment')
async createPayment(@Body() dto: PaymentDto) {
  const useNewProvider = await this.featureFlagsService.isEnabled(
    'use_new_payment_provider'
  );

  if (useNewProvider) {
    return this.newPaymentProvider.create(dto);
  } else {
    return this.stripeService.create(dto);
  }
}
```

### 2. UI Component Toggle

```typescript
// In frontend
const showNewDashboard = await checkFeatureFlag('enable_new_dashboard');

if (showNewDashboard) {
  return <NewDashboard />;
} else {
  return <OldDashboard />;
}
```

### 3. Beta Feature Access

```typescript
@Controller('beta/analytics')
@FeatureFlag('enable_advanced_analytics')
export class AdvancedAnalyticsController {
  // All routes protected by feature flag
}
```

### 4. Maintenance Mode

```typescript
// Create flag: 'maintenance_mode'
// When enabled, reject all requests

@Injectable()
export class MaintenanceModeMiddleware implements NestMiddleware {
  constructor(private featureFlagsService: FeatureFlagsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const isMaintenanceMode = await this.featureFlagsService.isEnabled(
      'maintenance_mode'
    );

    if (isMaintenanceMode) {
      return res.status(503).json({
        error: 'Service temporarily unavailable for maintenance',
      });
    }

    next();
  }
}
```

### 5. A/B Testing

```typescript
// 50/50 split test
{
  "key": "ab_test_checkout_flow",
  "production": {
    "enabled": true,
    "targeting": [
      { "type": "percentage", "percentage": 50 }
    ]
  }
}

// In code
const useNewCheckout = await this.featureFlagsService.isEnabled(
  'ab_test_checkout_flow',
  { userId: user._id }
);

// Analytics
trackEvent('checkout_flow', {
  variant: useNewCheckout ? 'new' : 'old',
});
```

## Monitoring & Analytics

### Track Evaluation Count

```javascript
db.feature_flags.find(
  {},
  { key: 1, evaluationCount: 1, lastEvaluatedAt: 1 }
).sort({ evaluationCount: -1 });
```

Shows most-used feature flags.

### Monitor Scheduled Flags

```javascript
db.feature_flags.find({
  $or: [
    { scheduledEnableDate: { $exists: true } },
    { scheduledDisableDate: { $exists: true } }
  ]
});
```

### Find Deprecated Flags

```javascript
db.feature_flags.find({
  status: 'deprecated'
});
```

Clean these up!

## Troubleshooting

### Feature Not Enabling

1. **Check master switch**
   ```javascript
   db.feature_flags.findOne({ key: 'your_flag' }, { active: 1 });
   ```

2. **Check environment config**
   ```javascript
   db.feature_flags.findOne(
     { key: 'your_flag' },
     { production: 1 }
   );
   ```

3. **Check targeting rules**
   - Verify userId is correct
   - Check role matches
   - Percentage might exclude user

4. **Clear cache**
   ```bash
   POST /admin/feature-flags/cache/clear
   ```

### Flag Always Disabled

- Check `active: true` in database
- Verify environment is correct (dev/staging/prod)
- Check scheduled dates haven't expired
- Review targeting rules

### Slow Evaluation

- Cache is working (1-minute TTL)
- Check MongoDB indexes
- Monitor `evaluationCount`

## Security Considerations

### 🔒 Access Control

- ✅ Feature flags admin endpoints should require authentication
- ✅ Only admins should create/update flags
- ✅ Audit log changes (createdBy, lastModifiedBy)

### 🛡️ Fail-Safe Behavior

If feature flag evaluation fails:
```typescript
return false; // Feature is disabled by default
```

This prevents breaking the application.

### 📊 Audit Trail

Track all changes:
- `createdBy`: Who created
- `lastModifiedBy`: Who last updated
- `timestamps`: When created/updated
- `evaluationCount`: Usage statistics

## Resources

- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
- [LaunchDarkly Feature Flag Guide](https://docs.launchdarkly.com/)
- [Split.io Documentation](https://help.split.io/)

---

Last updated: 2025-10-18
