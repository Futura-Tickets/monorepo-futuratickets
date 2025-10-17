# Monitoring & Error Tracking

This directory contains monitoring and observability integrations for the Futura Marketplace API.

## Sentry Integration

### Overview
Sentry is integrated for real-time error tracking, performance monitoring, and application health insights.

### Features
- **Error Tracking**: Automatic capture of all unhandled exceptions
- **Performance Monitoring**: 10% sampling rate in production for performance tracing
- **Context Enrichment**: Request data, user info, and custom tags
- **Security**: Sensitive data (passwords, tokens, auth headers) automatically redacted
- **Alerting**: Configure alerts in Sentry dashboard

### Configuration

#### Environment Variables
```bash
# Required for Sentry
SENTRY_DSN=https://xxxxx@yyy.ingest.sentry.io/zzzzz
NODE_ENV=production
```

#### How it Works
1. **Initialization** (`main.ts`): Sentry is initialized early in the bootstrap process
2. **Interceptor** (`sentry.interceptor.ts`): Global interceptor captures all errors
3. **Configuration** (`config/sentry.config.ts`): Custom configuration with data sanitization

### Testing Sentry Integration

To test error capture in development:

```typescript
// In any controller or service
throw new Error('Test Sentry integration');
```

Check the Sentry dashboard to see the error with full context.

### Data Sanitization

The following data is automatically redacted before sending to Sentry:
- Authorization headers
- Cookies
- Password fields
- Token parameters
- API keys
- Credit card information

### Performance Monitoring

- **Trace Sampling**: 10% in production, 100% in development
- **Profile Sampling**: 10% in production for CPU profiling
- **Custom Transactions**: Can be added for specific operations

### Best Practices

1. **Add Context for Critical Operations**:
```typescript
import * as Sentry from '@sentry/node';

Sentry.setContext('order', {
  orderId: order._id,
  amount: order.total,
  items: order.items.length
});
```

2. **Tag Important Events**:
```typescript
Sentry.setTag('payment_provider', 'stripe');
Sentry.setTag('event_id', eventId);
```

3. **Capture Custom Messages**:
```typescript
Sentry.captureMessage('Payment processing started', 'info');
```

4. **Set User Context**:
```typescript
Sentry.setUser({
  id: user._id,
  email: user.email,
  username: user.name
});
```

### Ignored Errors

The following error types are ignored to reduce noise:
- `ResizeObserver loop limit exceeded`
- `Non-Error promise rejection captured`
- `Network request failed`
- `Failed to fetch`

### Production Considerations

- **DSN**: Must be configured in production environment
- **Sampling**: Configured for 10% to control costs
- **Alerts**: Configure in Sentry dashboard for critical errors
- **Release Tracking**: Automatically tagged with version from package.json
- **Environment**: Automatically tagged with NODE_ENV

### Monitoring Dashboard

Access your Sentry dashboard at:
```
https://sentry.io/organizations/your-org/projects/futura-marketplace-api/
```

### Troubleshooting

**Sentry not capturing errors?**
1. Check SENTRY_DSN is set correctly
2. Verify initialization logs: "✅ Sentry initialized for environment: production"
3. Check Sentry project settings match your DSN
4. Verify network connectivity to sentry.io

**Too many events?**
1. Adjust sample rates in `config/sentry.config.ts`
2. Add more patterns to `ignoreErrors`
3. Configure rate limiting in Sentry dashboard

**Missing context?**
1. Ensure interceptor is registered globally in main.ts
2. Add custom context in critical code paths
3. Check beforeSend hook for over-redaction
