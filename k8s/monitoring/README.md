# FuturaTickets Production Monitoring

Complete monitoring stack for FuturaTickets production environment using Prometheus, Grafana, and AlertManager.

## Architecture

```
┌─────────────────┐
│  Applications   │
│  (API, Admin,   │
│   Marketplace)  │
└────────┬────────┘
         │ Metrics
         ↓
┌─────────────────┐      ┌──────────────┐
│   Prometheus    │─────→│ AlertManager │
│  (Metrics DB)   │      │  (Alerts)    │
└────────┬────────┘      └──────┬───────┘
         │                       │
         │ Query                 │ Notifications
         ↓                       ↓
┌─────────────────┐      ┌──────────────┐
│    Grafana      │      │    Slack     │
│  (Dashboards)   │      │   Discord    │
└─────────────────┘      └──────────────┘
```

## Components

### 1. Grafana Dashboard
**Location:** `k8s/grafana/dashboards/futuratickets-overview.json`

**11 Monitoring Panels:**
1. **HTTP Requests Rate** - Requests per second by service
2. **HTTP Response Time (p95)** - 95th percentile latency
3. **Pod CPU Usage** - CPU usage by pod
4. **Pod Memory Usage** - Memory consumption by pod
5. **HTTP Error Rate (5xx)** - Server errors with alerting
6. **Active Orders** - Orders created in last 5 minutes
7. **Payment Success Rate** - Percentage of successful payments
8. **Database Connections** - MongoDB connection pool status
9. **Redis Operations/sec** - Cache operations rate
10. **Active Tickets** - Total active tickets
11. **Sentry Errors** - Application errors in last hour

**Features:**
- Auto-refresh every 30 seconds
- Built-in alerting on error rates
- Color-coded thresholds
- Time range selector

### 2. Prometheus Alert Rules
**Location:** `k8s/prometheus/alert-rules.yaml`

**15 Production Alerts:**

#### Critical Severity
- **HighErrorRate**: >10 errors/sec for 5 minutes
- **LowPaymentSuccessRate**: <90% success rate for 10 minutes
- **PodDown**: Pod not running for 5 minutes
- **MongoDBConnectionIssues**: <10 available connections
- **RedisDown**: Redis not responding for 2 minutes
- **DeploymentRolloutStuck**: No progress for 15 minutes
- **TicketGenerationFailures**: >1 failure/sec for 5 minutes

#### Warning Severity
- **HighResponseTime**: p95 >2 seconds for 5 minutes
- **HighCPUUsage**: >80% CPU for 10 minutes
- **HighMemoryUsage**: >85% memory for 10 minutes
- **HighSentryErrorCount**: >50 errors/hour
- **SlowOrderProcessing**: p95 >10 seconds for 10 minutes
- **WebhookDeliveryFailures**: >0.5 failures/sec
- **DiskSpaceLow**: <15% available disk space
- **NoOrdersReceived**: Zero orders in last hour

### 3. AlertManager Configuration
**Location:** `k8s/alertmanager/alertmanager-config.yaml`

**Alert Routing:**
- **Critical alerts** → `#alerts-critical` (4h repeat)
- **Warning alerts** → `#alerts-warnings` (12h repeat)
- **Business alerts** → `#business-alerts` (24h repeat)
- **Payment alerts** → `#payments-alerts` (2h repeat)

**Features:**
- Smart grouping by alertname, cluster, service
- Inhibit rules to prevent alert spam
- Color-coded Slack messages
- Auto-resolve notifications
- Runbook and dashboard links

## Deployment

### Prerequisites

1. **Kubernetes cluster** with monitoring namespace:
```bash
kubectl create namespace futuratickets
```

2. **Environment variables** for Slack/Discord webhooks:
```bash
# Add to your deployment secrets
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Install Monitoring Stack

#### 1. Deploy Prometheus with Alert Rules
```bash
# Apply alert rules
kubectl apply -f k8s/prometheus/alert-rules.yaml

# Verify alert rules loaded
kubectl get configmap prometheus-alert-rules -n futuratickets
```

#### 2. Deploy AlertManager
```bash
# Apply AlertManager configuration
kubectl apply -f k8s/alertmanager/alertmanager-config.yaml

# Verify AlertManager running
kubectl get pods -n futuratickets -l app=alertmanager
```

#### 3. Deploy Grafana Dashboard
```bash
# Apply dashboard ConfigMap
kubectl apply -f k8s/grafana/dashboard-configmap.yaml

# Restart Grafana to load dashboard
kubectl rollout restart deployment/grafana -n futuratickets

# Verify dashboard loaded
kubectl logs -f deployment/grafana -n futuratickets | grep "dashboard"
```

### Verify Installation

```bash
# Check all monitoring components
kubectl get pods,svc,configmaps -n futuratickets -l component=monitoring

# Check Prometheus targets
kubectl port-forward svc/prometheus 9090:9090 -n futuratickets
# Open: http://localhost:9090/targets

# Check AlertManager
kubectl port-forward svc/alertmanager 9093:9093 -n futuratickets
# Open: http://localhost:9093

# Check Grafana
kubectl port-forward svc/grafana 3000:3000 -n futuratickets
# Open: http://localhost:3000
# Default credentials: admin/admin
```

## Usage

### Accessing Dashboards

**Production URLs:**
- Grafana: https://grafana.futuratickets.com
- Prometheus: https://prometheus.futuratickets.com
- AlertManager: https://alertmanager.futuratickets.com

**Local Development:**
```bash
# Grafana
kubectl port-forward svc/grafana 3000:3000 -n futuratickets

# Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n futuratickets

# AlertManager
kubectl port-forward svc/alertmanager 9093:9093 -n futuratickets
```

### Viewing the Dashboard

1. Open Grafana: https://grafana.futuratickets.com
2. Navigate to: **Dashboards** → **FuturaTickets - Production Overview**
3. Select time range (default: Last 6 hours)
4. Click refresh or enable auto-refresh

### Testing Alerts

```bash
# Trigger high error rate alert
kubectl run test-errors --image=busybox -n futuratickets -- \
  sh -c 'while true; do wget -O- http://api:3000/nonexistent; done'

# Check alert fired
kubectl port-forward svc/alertmanager 9093:9093 -n futuratickets
# Open: http://localhost:9093/#/alerts

# Cleanup
kubectl delete pod test-errors -n futuratickets
```

### Silencing Alerts

```bash
# Silence alert during maintenance window
kubectl port-forward svc/alertmanager 9093:9093 -n futuratickets

# Then use AlertManager UI to create silence:
# - Select alert
# - Click "Silence"
# - Set duration (e.g., 2h for maintenance)
# - Add comment: "Planned maintenance"
```

## Metrics Reference

### Application Metrics

Applications should expose these metrics for monitoring:

```typescript
// HTTP metrics
http_requests_total{method,path,status}
http_request_duration_seconds_bucket{method,path,le}

// Business metrics
orders_created_total
payment_total
payment_success_total
tickets_active_total
ticket_generation_failures_total

// Integration metrics
stripe_webhook_failures_total
sentry_errors_total

// Performance metrics
order_processing_duration_seconds_bucket{le}
```

### Example: Instrumenting NestJS Application

```typescript
// src/metrics/metrics.service.ts
import { Counter, Histogram, register } from 'prom-client';

export class MetricsService {
  private httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'path', 'status'],
  });

  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'path'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  private ordersCreated = new Counter({
    name: 'orders_created_total',
    help: 'Total orders created',
  });

  private paymentSuccess = new Counter({
    name: 'payment_success_total',
    help: 'Successful payments',
  });

  recordRequest(method: string, path: string, status: number, duration: number) {
    this.httpRequestsTotal.inc({ method, path, status });
    this.httpRequestDuration.observe({ method, path }, duration);
  }

  recordOrderCreated() {
    this.ordersCreated.inc();
  }

  recordPaymentSuccess() {
    this.paymentSuccess.inc();
  }

  getMetrics() {
    return register.metrics();
  }
}

// src/metrics/metrics.controller.ts
@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}
```

## Alert Runbooks

### HighErrorRate

**Symptom:** More than 10 errors per second

**Investigation:**
```bash
# Check recent errors
kubectl logs -f deployment/api -n futuratickets --tail=100 | grep ERROR

# Check Sentry for error details
# https://sentry.io/organizations/futuratickets

# Check pod health
kubectl get pods -n futuratickets
kubectl describe pod <pod-name> -n futuratickets
```

**Resolution:**
1. Identify error pattern in logs/Sentry
2. If deployment-related, rollback: `./scripts/rollback-auto.sh api "High error rate"`
3. If infrastructure issue, scale up: `kubectl scale deployment/api --replicas=5 -n futuratickets`
4. Fix root cause and redeploy

### LowPaymentSuccessRate

**Symptom:** Less than 90% payment success rate

**Investigation:**
```bash
# Check Stripe dashboard
# https://dashboard.stripe.com

# Check payment logs
kubectl logs -f deployment/api -n futuratickets | grep -i "payment\|stripe"

# Check webhook delivery
kubectl logs -f deployment/api -n futuratickets | grep "webhook"
```

**Resolution:**
1. Verify Stripe API status: https://status.stripe.com
2. Check webhook endpoint health: `curl https://api.futuratickets.com/stripe/webhook`
3. Review recent payment errors in Sentry
4. Contact Stripe support if needed

### PodDown

**Symptom:** Pod not in Running state

**Investigation:**
```bash
# Check pod status
kubectl get pods -n futuratickets

# Describe pod for events
kubectl describe pod <pod-name> -n futuratickets

# Check recent logs
kubectl logs <pod-name> -n futuratickets --previous
```

**Resolution:**
1. Check pod events for crash/OOM/ImagePullBackOff
2. If OOMKilled, increase memory limit
3. If CrashLoopBackOff, check application logs
4. Delete pod to force restart: `kubectl delete pod <pod-name> -n futuratickets`

## Maintenance

### Updating Dashboards

```bash
# Edit dashboard JSON
vim k8s/grafana/dashboards/futuratickets-overview.json

# Apply changes
kubectl apply -f k8s/grafana/dashboard-configmap.yaml

# Restart Grafana
kubectl rollout restart deployment/grafana -n futuratickets
```

### Updating Alert Rules

```bash
# Edit alert rules
vim k8s/prometheus/alert-rules.yaml

# Apply changes
kubectl apply -f k8s/prometheus/alert-rules.yaml

# Reload Prometheus config
kubectl exec -it deployment/prometheus -n futuratickets -- \
  curl -X POST http://localhost:9090/-/reload
```

### Backup Monitoring Configuration

```bash
# Backup all monitoring configs
kubectl get configmaps -n futuratickets \
  -l component=monitoring \
  -o yaml > monitoring-backup-$(date +%Y%m%d).yaml

# Restore from backup
kubectl apply -f monitoring-backup-YYYYMMDD.yaml
```

## Troubleshooting

### Metrics Not Showing in Grafana

**Check Prometheus targets:**
```bash
kubectl port-forward svc/prometheus 9090:9090 -n futuratickets
# Open: http://localhost:9090/targets
# Verify all targets are UP
```

**Check application metrics endpoint:**
```bash
kubectl port-forward deployment/api 3000:3000 -n futuratickets
curl http://localhost:3000/metrics
```

### Alerts Not Firing

**Check AlertManager configuration:**
```bash
kubectl logs deployment/alertmanager -n futuratickets
```

**Test alert manually:**
```bash
kubectl port-forward svc/alertmanager 9093:9093 -n futuratickets

# Send test alert
curl -X POST http://localhost:9093/api/v1/alerts -d '[{
  "labels": {"alertname": "TestAlert", "severity": "warning"},
  "annotations": {"summary": "Test alert"}
}]'
```

### Slack Notifications Not Working

**Verify webhook URL:**
```bash
# Check secret
kubectl get secret alertmanager-config -n futuratickets -o yaml

# Test webhook manually
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test notification from FuturaTickets monitoring"}'
```

## Best Practices

1. **Alert Tuning**
   - Review alert thresholds monthly
   - Adjust based on actual traffic patterns
   - Remove noisy alerts

2. **Dashboard Organization**
   - Group related metrics
   - Use consistent color schemes
   - Add annotations for deployments

3. **Runbook Maintenance**
   - Keep runbooks up-to-date
   - Document recent incidents
   - Include actual resolution steps

4. **Regular Testing**
   - Test alerts quarterly
   - Verify notification channels
   - Practice incident response

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [AlertManager Guide](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [FuturaTickets Production Readiness](../../PRODUCTION_READINESS.md)
- [Deployment Scripts](../../scripts/)
