# New Relic APM Setup Guide

## Overview

New Relic Application Performance Monitoring (APM) is configured across all three backend APIs to provide real-time performance monitoring, error tracking, and distributed tracing.

## Services Monitored

| Service | App Name | Port | Purpose |
|---------|----------|------|---------|
| Admin API | FuturaTickets-Admin-API | 3002 | Event management, admin operations |
| Marketplace API | FuturaTickets-Marketplace-API | 3004 | Orders, payments, sales |
| Access API | FuturaTickets-Access-API | 3005 | Ticket validation, access control |

## Configuration Files

Each API has its own New Relic configuration file:

```
futura-tickets-admin-api/newrelic.js
futura-market-place-api/newrelic.js
futura-access-api/newrelic.js
```

## Environment Variables

Add these variables to each API's `.env` file:

```bash
# New Relic APM
NEW_RELIC_LICENSE_KEY=your-new-relic-license-key-here
ENABLE_NEW_RELIC=true          # Set to 'true' to enable in development
NODE_ENV=production            # Automatically enables in production
NEW_RELIC_LOG_LEVEL=info      # Options: fatal, error, warn, info, debug, trace
```

## Getting Started

### 1. Get Your New Relic License Key

1. Sign up for New Relic at https://newrelic.com (free tier available)
2. Go to https://one.newrelic.com/launcher/api-keys-ui.api-keys-launcher
3. Create or copy your **Ingest - License** key
4. Add it to your `.env` files

### 2. Enable New Relic

#### Production (Automatic)
New Relic is automatically enabled when `NODE_ENV=production`

#### Development (Manual)
Add to your `.env` file:
```bash
ENABLE_NEW_RELIC=true
```

### 3. Start Your Application

```bash
# Start individual service
cd futura-tickets-admin-api
npm run start:dev

# Start all services
./start-all.sh
```

### 4. Verify Integration

Check your terminal output for:
```
{"v":0,"level":30,"name":"newrelic","msg":"Reporting to: https://rpm.newrelic.com/accounts/..."}
{"v":0,"level":30,"name":"newrelic","msg":"Connected to...
"}
```

Then visit New Relic dashboard at: https://one.newrelic.com

## Features Enabled

### ✅ Automatic Transaction Tracking
- HTTP requests (GET, POST, PUT, PATCH, DELETE)
- MongoDB queries
- External API calls
- WebSocket connections

### ✅ Error Tracking
- Uncaught exceptions
- HTTP errors (500, 400, etc.)
- Custom error messages
- Ignored errors: 404 status codes

### ✅ Distributed Tracing
- Cross-service request tracking
- Visualize request flow between Admin → Marketplace → Access APIs
- Identify bottlenecks across services

### ✅ Database Monitoring
- MongoDB query performance
- Slow query detection
- Database connection pooling
- Collection-level metrics

### ✅ Custom Attributes
All transactions tagged with:
```javascript
{
  environment: 'production' | 'development',
  service: 'admin-api' | 'marketplace-api' | 'access-api',
  team: 'futuratickets'
}
```

### ✅ Application Logging
- Log forwarding to New Relic
- Correlation between logs and transactions
- Search logs by transaction ID

## Custom Instrumentation

### Recording Custom Metrics

```typescript
import * as newrelic from 'newrelic';

// Record custom metric
newrelic.recordMetric('Custom/TicketsSold', 150);

// Record custom event
newrelic.recordCustomEvent('TicketPurchase', {
  eventId: 'event-123',
  quantity: 2,
  amount: 100.00,
  userId: 'user-456'
});
```

### Custom Transactions

```typescript
import * as newrelic from 'newrelic';

// Start custom transaction
newrelic.startWebTransaction('ProcessBulkOrders', async function() {
  // Your business logic here
  await processOrders();

  // Transaction automatically ends
});
```

### Adding Custom Attributes to Transactions

```typescript
import * as newrelic from 'newrelic';

@Injectable()
export class OrdersService {
  async createOrder(createOrderDto: CreateOrderDto) {
    // Add custom attributes
    newrelic.addCustomAttributes({
      eventId: createOrderDto.eventId,
      itemCount: createOrderDto.items.length,
      promoterId: createOrderDto.promoter
    });

    // Your logic
    return await this.ordersModel.create(createOrderDto);
  }
}
```

### Tracking External Services

```typescript
import * as newrelic from 'newrelic';

async function callStripeAPI() {
  return newrelic.startSegment('External/Stripe/CreatePayment', true, async () => {
    const payment = await stripe.paymentIntents.create({...});
    return payment;
  });
}
```

## Monitoring Dashboards

### Key Metrics to Monitor

1. **Response Time**
   - Average: < 200ms target
   - 95th percentile: < 500ms
   - 99th percentile: < 1s

2. **Error Rate**
   - Target: < 1%
   - Alert on: > 5% errors

3. **Throughput**
   - Requests per minute
   - Peak load capacity

4. **Apdex Score**
   - Target: > 0.95
   - Threshold: 0.5s

### Critical Endpoints to Watch

#### Admin API
- `POST /admin-event` - Event creation
- `PATCH /admin-event/:id` - Event updates
- `POST /orders` - Order creation

#### Marketplace API
- `POST /stripe/payment-intent` - Payment processing
- `GET /events` - Event listing
- `POST /orders/create` - Order creation

#### Access API
- `PATCH /events/access` - Ticket validation
- `GET /events/attendants/:event` - Attendant list

## Alerting

### Recommended Alerts

1. **High Error Rate**
   - Condition: Error rate > 5% for 5 minutes
   - Notification: Slack, Email

2. **Slow Response Time**
   - Condition: 95th percentile > 1 second for 10 minutes
   - Notification: Slack

3. **Service Down**
   - Condition: No data reporting for 5 minutes
   - Notification: PagerDuty, SMS

4. **Database Slow Queries**
   - Condition: MongoDB query > 1 second
   - Notification: Email

### Create Alert in New Relic

1. Go to **Alerts & AI** → **Alert conditions (policies)**
2. Create new policy: **FuturaTickets Production Alerts**
3. Add condition:
   - Name: High Error Rate
   - Metric: Error rate
   - Threshold: Above 5% for at least 5 minutes
4. Add notification channels

## Performance Optimization

### Identifying Bottlenecks

1. **Slow Transactions**
   - Navigate to APM → Transactions
   - Sort by "Most time consuming"
   - Analyze trace details

2. **Slow Databases Queries**
   - Navigate to APM → Databases
   - Identify queries > 100ms
   - Add indexes to MongoDB

3. **External Service Latency**
   - Check External Services tab
   - Optimize API calls (caching, batching)

### Optimization Tips

```typescript
// ❌ Bad: Sequential database calls
const event = await this.eventModel.findById(id);
const orders = await this.orderModel.find({ event: id });
const sales = await this.salesModel.find({ event: id });

// ✅ Good: Parallel database calls
const [event, orders, sales] = await Promise.all([
  this.eventModel.findById(id),
  this.orderModel.find({ event: id }),
  this.salesModel.find({ event: id })
]);
```

## Security Considerations

### ⚠️ Data Privacy

New Relic config automatically excludes sensitive data:

```javascript
attributes: {
  exclude: [
    'request.headers.cookie',
    'request.headers.authorization',
    'request.headers.x-api-key',
    'request.headers.stripe-signature',
  ]
}
```

### Additional Exclusions

To exclude sensitive request parameters:

```javascript
// In newrelic.js
attributes: {
  exclude: [
    'request.parameters.password',
    'request.parameters.card_number',
    'request.parameters.cvv'
  ]
}
```

## Troubleshooting

### New Relic Not Reporting Data

1. **Check License Key**
   ```bash
   echo $NEW_RELIC_LICENSE_KEY
   # Should be 40-character string
   ```

2. **Check Logs**
   ```bash
   tail -f logs/newrelic_agent.log
   ```

3. **Verify Agent Loaded**
   ```bash
   grep "newrelic" logs/application.log
   # Should see "Connected to..." message
   ```

4. **Network Issues**
   - Ensure firewall allows HTTPS to `collector.newrelic.com`
   - Check proxy settings if behind corporate firewall

### High Memory Usage

If New Relic agent consumes too much memory:

```javascript
// In newrelic.js
transaction_tracer: {
  record_sql: 'off',  // Disable SQL recording
},
slow_sql: {
  enabled: false  // Disable slow SQL
}
```

### Missing Transactions

If some endpoints aren't showing:

```typescript
// Manually name transaction
import * as newrelic from 'newrelic';

@Get('/custom-endpoint')
async customEndpoint() {
  newrelic.setTransactionName('CustomEndpoint');
  // Your logic
}
```

## Best Practices

### ✅ Do's

- **Label environments** with clear names (production, staging, dev)
- **Use custom attributes** to add business context
- **Set Apdex thresholds** based on user expectations
- **Create dashboards** for business KPIs
- **Monitor trends** over time, not just current values
- **Alert on business metrics** (failed payments, ticket validation errors)

### ❌ Don'ts

- **Don't log sensitive data** (passwords, tokens, card numbers)
- **Don't ignore high error rates** - investigate immediately
- **Don't over-instrument** - focus on critical paths
- **Don't forget to test** alert notifications
- **Don't rely only on averages** - check percentiles (p95, p99)

## Cost Optimization

### Free Tier Limits
- 100GB data ingestion/month
- 1 user
- 8 days data retention

### Reducing Data Ingestion

```javascript
// Sample transactions (send 10% of data)
transaction_tracer: {
  record_sql: 'obfuscated',
  enabled: true,
},
// Only in high-traffic environments
```

### Disable in Development

```javascript
// In newrelic.js
if (process.env.NODE_ENV !== 'production') {
  exports.config.agent_enabled = false;
}
```

## Resources

- [New Relic Docs](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/)
- [Node.js Agent API](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/api-guides/nodejs-agent-api/)
- [Best Practices Guide](https://docs.newrelic.com/docs/new-relic-solutions/best-practices-guides/full-stack-observability/apm-best-practices-guide/)
- [Alert Conditions](https://docs.newrelic.com/docs/alerts-applied-intelligence/new-relic-alerts/alert-conditions/create-alert-conditions/)

## Support

For issues or questions:
1. Check [New Relic Documentation](https://docs.newrelic.com)
2. Review agent logs: `logs/newrelic_agent.log`
3. Contact New Relic Support (if paid plan)
4. Check GitHub issues: [newrelic/node-newrelic](https://github.com/newrelic/node-newrelic)

---

Last updated: 2025-10-18
