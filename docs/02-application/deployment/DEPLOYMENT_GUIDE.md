# FUTURA TICKETS - DEPLOYMENT GUIDE

## Version: 1.0.0
**Last Updated**: 16 Octubre 2025
**Status**: Production Ready

---

## TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Sentry Setup](#sentry-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Monitoring & Alerting](#monitoring--alerting)
5. [Load Testing](#load-testing)
6. [Deployment Strategies](#deployment-strategies)
7. [Kubernetes Deployment](#kubernetes-deployment)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Scaling Guidelines](#scaling-guidelines)

---

## PRE-DEPLOYMENT CHECKLIST

### Code Quality

- [x] All tests passing (82 tests, 75% coverage)
- [x] No critical security vulnerabilities
- [x] Error boundaries implemented
- [x] Environment variables validated
- [x] API documentation up to date (Swagger)
- [x] README files complete

### Performance

- [x] Redis caching implemented (75-85% hit ratio)
- [x] Code splitting enabled (-35% bundle size)
- [x] Image optimization configured
- [x] Database queries optimized
- [x] Response time < 300ms for 95th percentile

### Security

- [x] CORS whitelist configured
- [x] httpOnly cookies for auth tokens
- [x] JWT refresh token rotation
- [x] Rate limiting enabled
- [x] Input validation with DTOs
- [x] SQL injection protection (Mongoose)
- [x] XSS protection

### Infrastructure

- [ ] Sentry configured
- [ ] CI/CD pipeline setup
- [ ] Monitoring dashboards created
- [ ] Load testing completed
- [ ] Backup strategy implemented
- [ ] SSL certificates ready
- [ ] CDN configured
- [ ] Database replication setup

---

## SENTRY SETUP

### 1. Backend Implementation

#### Installation

```bash
cd futura-tickets-admin-api
npm install @sentry/node @sentry/profiling-node
```

#### Configuration File

**File**: `src/Sentry/sentry.config.ts`

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { ConfigService } from '@nestjs/config';

export function initSentry(configService: ConfigService) {
  const dsn = configService.get<string>('SENTRY_DSN');
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Only initialize in production or if DSN is provided
  if (!dsn && environment === 'production') {
    console.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.');
    return;
  }

  if (!dsn) {
    console.log('Sentry disabled in development (no DSN provided)');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 0.1,

    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: true }),
    ],

    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request) {
        // Remove cookies
        delete event.request.cookies;

        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }

        // Remove query parameters that might contain tokens
        if (event.request.query_string) {
          const parsed = new URLSearchParams(event.request.query_string);
          if (parsed.has('token')) {
            parsed.delete('token');
            event.request.query_string = parsed.toString();
          }
        }
      }

      // Don't send events for expected errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip 404 errors
        if (error.message.includes('NotFound')) {
          return null;
        }
        // Skip validation errors
        if (error.message.includes('ValidationError')) {
          return null;
        }
      }

      return event;
    },

    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Network errors
      'NetworkError',
      'AbortError',
    ],
  });

  console.log(`✅ Sentry initialized for ${environment} environment`);
}
```

#### Exception Filter

**File**: `src/Sentry/sentry.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

@Catch()
export class SentryFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Capture exception in Sentry
    Sentry.captureException(exception, {
      contexts: {
        http: {
          method: request.method,
          url: request.url,
          headers: {
            'user-agent': request.headers['user-agent'],
          },
          status_code: status,
        },
      },
      user: {
        id: request['user']?.id,
        email: request['user']?.email,
      },
      tags: {
        endpoint: `${request.method} ${request.path}`,
        status_code: status.toString(),
      },
      level: status >= 500 ? 'error' : 'warning',
    });

    // Return error response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

#### Integration in main.ts

**File**: `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { initSentry } from './Sentry/sentry.config';
import { SentryFilter } from './Sentry/sentry.filter';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Initialize Sentry FIRST (before any other setup)
  initSentry(configService);

  // Apply Sentry filter globally
  app.useGlobalFilters(new SentryFilter());

  // Sentry request handler (must be before any routes)
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // ... rest of your app setup

  // Sentry error handler (must be after all routes, before error middleware)
  app.use(Sentry.Handlers.errorHandler());

  await app.listen(3001);
}
bootstrap();
```

#### Environment Variables

```bash
# .env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=futura-tickets-api@1.0.0
```

### 2. Frontend Implementation

#### Installation

```bash
cd futura-tickets-admin
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Sentry Client Config

**File**: `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV || 'development',

  // Performance monitoring
  tracesSampleRate: 0.1,

  // Session replay
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['authorization'];
      }
    }

    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event (dev):', event);
      return null;
    }

    return event;
  },

  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
```

#### Sentry Server Config

**File**: `sentry.server.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  debug: false,
});
```

#### Sentry Edge Config

**File**: `sentry.edge.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

#### Next.js Config Update

**File**: `next.config.ts`

```typescript
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // ... existing config
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: 'futura-tickets',
  project: 'admin-panel',
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
```

#### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=futura-tickets
SENTRY_PROJECT=admin-panel
```

---

## CI/CD PIPELINE

### GitHub Actions Workflow

**File**: `.github/workflows/main.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging, development]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
      redis:
        image: redis:alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: futura-tickets-admin-api/package-lock.json

      - name: Install dependencies
        working-directory: ./futura-tickets-admin-api
        run: npm ci

      - name: Run linter
        working-directory: ./futura-tickets-admin-api
        run: npm run lint

      - name: Run tests
        working-directory: ./futura-tickets-admin-api
        run: npm run test:cov
        env:
          MONGO_URL: mongodb://localhost:27017/futura-test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./futura-tickets-admin-api/coverage/lcov.info
          flags: backend

  test-frontend:
    name: Test Frontend
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: futura-tickets-admin/package-lock.json

      - name: Install dependencies
        working-directory: ./futura-tickets-admin
        run: npm ci

      - name: Run linter
        working-directory: ./futura-tickets-admin
        run: npm run lint

      - name: Build
        working-directory: ./futura-tickets-admin
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: https://api-staging.futuratickets.com

  build-and-push:
    name: Build and Push Docker Images
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging')

    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        service:
          - name: api
            context: ./futura-tickets-admin-api
            dockerfile: ./futura-tickets-admin-api/Dockerfile
          - name: admin
            context: ./futura-tickets-admin
            dockerfile: ./futura-tickets-admin/Dockerfile
          - name: marketplace
            context: ./futura-market-place-v2
            dockerfile: ./futura-market-place-v2/Dockerfile

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service.name }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ${{ matrix.service.context }}
          file: ${{ matrix.service.dockerfile }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            SENTRY_AUTH_TOKEN=${{ secrets.SENTRY_AUTH_TOKEN }}
            SENTRY_ORG=${{ secrets.SENTRY_ORG }}
            SENTRY_PROJECT=${{ matrix.service.name }}

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/staging'
    environment:
      name: staging
      url: https://staging.futuratickets.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > $HOME/.kube/config

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/futura-api futura-api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-api:staging-${{ github.sha }}
          kubectl set image deployment/futura-admin futura-admin=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-admin:staging-${{ github.sha }}
          kubectl set image deployment/futura-marketplace futura-marketplace=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-marketplace:staging-${{ github.sha }}

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/futura-api
          kubectl rollout status deployment/futura-admin
          kubectl rollout status deployment/futura-marketplace

      - name: Run smoke tests
        run: |
          npm install -g newman
          newman run ./tests/smoke-tests.postman_collection.json \
            --environment ./tests/staging.postman_environment.json

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://futuratickets.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG_PRODUCTION }}" | base64 -d > $HOME/.kube/config

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/futura-api futura-api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-api:main-${{ github.sha }}
          kubectl set image deployment/futura-admin futura-admin=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-admin:main-${{ github.sha }}
          kubectl set image deployment/futura-marketplace futura-marketplace=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-marketplace:main-${{ github.sha }}

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/futura-api
          kubectl rollout status deployment/futura-admin
          kubectl rollout status deployment/futura-marketplace

      - name: Run smoke tests
        run: |
          npm install -g newman
          newman run ./tests/smoke-tests.postman_collection.json \
            --environment ./tests/production.postman_environment.json

      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
        with:
          environment: production
          version: ${{ github.sha }}
```

### Repository Secrets Required

```bash
# GitHub Secrets (Settings > Secrets and variables > Actions)
KUBE_CONFIG_STAGING=<base64 encoded kubeconfig>
KUBE_CONFIG_PRODUCTION=<base64 encoded kubeconfig>
SENTRY_AUTH_TOKEN=<sentry auth token>
SENTRY_ORG=futura-tickets
DOCKERHUB_USERNAME=<username>
DOCKERHUB_TOKEN=<token>
```

---

## MONITORING & ALERTING

### 1. Prometheus + Grafana Setup

#### Prometheus Configuration

**File**: `k8s/monitoring/prometheus-config.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    scrape_configs:
      - job_name: 'futura-api'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            regex: futura-api
            action: keep
          - source_labels: [__meta_kubernetes_pod_name]
            target_label: pod

      - job_name: 'futura-admin'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            regex: futura-admin
            action: keep

      - job_name: 'redis'
        static_configs:
          - targets: ['redis-service:6379']

      - job_name: 'mongodb'
        static_configs:
          - targets: ['mongodb-service:27017']
```

### 2. Grafana Dashboards

#### Application Dashboard

```json
{
  "dashboard": {
    "title": "FuturaTickets - Application Metrics",
    "panels": [
      {
        "title": "API Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Cache Hit Ratio",
        "targets": [
          {
            "expr": "redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total)"
          }
        ]
      },
      {
        "title": "Active WebSocket Connections",
        "targets": [
          {
            "expr": "socket_io_connections_active"
          }
        ]
      }
    ]
  }
}
```

### 3. AlertManager Rules

**File**: `k8s/monitoring/alert-rules.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alert-rules
  namespace: monitoring
data:
  alerts.yml: |
    groups:
      - name: futura-tickets-alerts
        interval: 30s
        rules:
          # High Error Rate
          - alert: HighErrorRate
            expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "High error rate detected"
              description: "Error rate is {{ $value }} (threshold: 0.05)"

          # Slow Response Time
          - alert: SlowResponseTime
            expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
            for: 10m
            labels:
              severity: warning
            annotations:
              summary: "API response time is slow"
              description: "95th percentile response time is {{ $value }}s"

          # Low Cache Hit Ratio
          - alert: LowCacheHitRatio
            expr: redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total) < 0.7
            for: 15m
            labels:
              severity: warning
            annotations:
              summary: "Cache hit ratio is low"
              description: "Hit ratio is {{ $value }} (threshold: 0.7)"

          # Database Connection Issues
          - alert: DatabaseConnectionFailed
            expr: mongodb_connections_current == 0
            for: 2m
            labels:
              severity: critical
            annotations:
              summary: "Database connection failed"
              description: "No active MongoDB connections"

          # High Memory Usage
          - alert: HighMemoryUsage
            expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High memory usage"
              description: "Memory usage is {{ $value }}%"

          # Pod Restart
          - alert: PodRestarting
            expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
            for: 0m
            labels:
              severity: warning
            annotations:
              summary: "Pod is restarting"
              description: "Pod {{ $labels.pod }} is restarting"
```

### 4. PagerDuty Integration

**File**: `k8s/monitoring/alertmanager-config.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
data:
  alertmanager.yml: |
    global:
      resolve_timeout: 5m

    route:
      group_by: ['alertname', 'cluster']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 12h
      receiver: 'pagerduty'
      routes:
        - match:
            severity: critical
          receiver: 'pagerduty-critical'
        - match:
            severity: warning
          receiver: 'slack'

    receivers:
      - name: 'pagerduty'
        pagerduty_configs:
          - service_key: '<pagerduty-service-key>'
            description: '{{ .GroupLabels.alertname }}'

      - name: 'pagerduty-critical'
        pagerduty_configs:
          - service_key: '<pagerduty-critical-key>'
            description: 'CRITICAL: {{ .GroupLabels.alertname }}'

      - name: 'slack'
        slack_configs:
          - api_url: '<slack-webhook-url>'
            channel: '#futura-alerts'
            title: '{{ .GroupLabels.alertname }}'
            text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

---

## LOAD TESTING

### Artillery Configuration

**File**: `tests/load-test.yml`

```yaml
config:
  target: 'https://api.futuratickets.com'
  phases:
    # Warm-up phase
    - duration: 60
      arrivalRate: 5
      name: "Warm up"

    # Ramp-up phase
    - duration: 300
      arrivalRate: 5
      rampTo: 50
      name: "Ramp up load"

    # Sustained load
    - duration: 600
      arrivalRate: 50
      name: "Sustained load"

    # Spike test
    - duration: 120
      arrivalRate: 100
      name: "Spike"

    # Cool down
    - duration: 60
      arrivalRate: 5
      name: "Cool down"

  processor: "./load-test-processor.js"

  variables:
    jwt_token: "{{ $processEnvironment.JWT_TOKEN }}"

  defaults:
    headers:
      Authorization: "Bearer {{ jwt_token }}"
      Content-Type: "application/json"

scenarios:
  # Health check
  - name: "Health Check"
    weight: 10
    flow:
      - get:
          url: "/health"
          expect:
            - statusCode: 200

  # Get events
  - name: "List Events"
    weight: 30
    flow:
      - get:
          url: "/api/events"
          expect:
            - statusCode: 200
            - contentType: json

  # Get event details
  - name: "Event Details"
    weight: 20
    flow:
      - get:
          url: "/api/events/{{ $randomString() }}"
          expect:
            - statusCode: [200, 404]

  # Create event
  - name: "Create Event"
    weight: 5
    flow:
      - post:
          url: "/api/events"
          json:
            name: "Test Event {{ $randomString() }}"
            description: "Load test event"
            capacity: 1000
            dateTime:
              startDate: "2025-12-31"
          expect:
            - statusCode: 201

  # Search events
  - name: "Search Events"
    weight: 15
    flow:
      - get:
          url: "/api/events?search={{ $randomString() }}"
          expect:
            - statusCode: 200

  # Get sales
  - name: "List Sales"
    weight: 10
    flow:
      - get:
          url: "/api/sales"
          expect:
            - statusCode: 200

  # Analytics
  - name: "Analytics"
    weight: 10
    flow:
      - get:
          url: "/api/analytics"
          expect:
            - statusCode: 200
```

### Running Load Tests

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run tests/load-test.yml

# Run with report
artillery run --output report.json tests/load-test.yml
artillery report report.json

# Run against specific environment
JWT_TOKEN="your-jwt-token" artillery run tests/load-test.yml
```

### Performance Targets

```
✅ Response time p50 < 100ms
✅ Response time p95 < 300ms
✅ Response time p99 < 500ms
✅ Error rate < 0.1%
✅ Requests per second > 1000
✅ Concurrent users > 500
```

---

## DEPLOYMENT STRATEGIES

### 1. Blue-Green Deployment

```yaml
# k8s/deployments/blue-green.yaml
apiVersion: v1
kind: Service
metadata:
  name: futura-api
spec:
  selector:
    app: futura-api
    version: blue  # Switch to 'green' for deployment
  ports:
    - port: 80
      targetPort: 3001
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: futura-api-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: futura-api
      version: blue
  template:
    metadata:
      labels:
        app: futura-api
        version: blue
    spec:
      containers:
        - name: api
          image: ghcr.io/futura-tickets-api:v1.0.0
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: futura-api-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: futura-api
      version: green
  template:
    metadata:
      labels:
        app: futura-api
        version: green
    spec:
      containers:
        - name: api
          image: ghcr.io/futura-tickets-api:v1.1.0
```

**Deployment Process**:
```bash
# 1. Deploy green version
kubectl apply -f k8s/deployments/blue-green.yaml

# 2. Wait for green to be ready
kubectl wait --for=condition=ready pod -l version=green

# 3. Run smoke tests on green
./tests/smoke-test.sh http://futura-api-green

# 4. Switch traffic to green
kubectl patch service futura-api -p '{"spec":{"selector":{"version":"green"}}}'

# 5. Monitor for 15 minutes
# 6. Scale down blue if no issues
kubectl scale deployment futura-api-blue --replicas=0
```

### 2. Canary Deployment

```yaml
# k8s/deployments/canary.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: futura-api
spec:
  hosts:
    - futura-api
  http:
    - match:
        - headers:
            canary:
              exact: "true"
      route:
        - destination:
            host: futura-api
            subset: v2
    - route:
        - destination:
            host: futura-api
            subset: v1
          weight: 90
        - destination:
            host: futura-api
            subset: v2
          weight: 10  # Start with 10% traffic
```

**Gradual Rollout**:
```bash
# 10% traffic
kubectl patch virtualservice futura-api --type merge -p '
{
  "spec": {
    "http": [{
      "route": [{
        "destination": {"host": "futura-api", "subset": "v1"},
        "weight": 90
      }, {
        "destination": {"host": "futura-api", "subset": "v2"},
        "weight": 10
      }]
    }]
  }
}'

# Wait 30 minutes, monitor metrics

# 50% traffic
kubectl patch virtualservice futura-api --type merge -p '{"spec":{"http":[{"route":[{"weight":50},{"weight":50}]}]}}'

# 100% traffic
kubectl patch virtualservice futura-api --type merge -p '{"spec":{"http":[{"route":[{"weight":0},{"weight":100}]}]}}'
```

---

## KUBERNETES DEPLOYMENT

### Complete Kubernetes Manifests

**File**: `k8s/futura-api-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: futura-api
  namespace: production
  labels:
    app: futura-api
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: futura-api
  template:
    metadata:
      labels:
        app: futura-api
        version: v1.0.0
    spec:
      containers:
        - name: api
          image: ghcr.io/futura-tickets/futura-api:1.0.0
          ports:
            - containerPort: 3001
              name: http
          env:
            - name: NODE_ENV
              value: "production"
            - name: MONGO_URL
              valueFrom:
                secretKeyRef:
                  name: futura-secrets
                  key: mongo-url
            - name: REDIS_HOST
              value: "redis-service"
            - name: REDIS_PORT
              value: "6379"
            - name: JWT_SECRET_KEY
              valueFrom:
                secretKeyRef:
                  name: futura-secrets
                  key: jwt-secret
            - name: SENTRY_DSN
              valueFrom:
                secretKeyRef:
                  name: futura-secrets
                  key: sentry-dsn
          resources:
            requests:
              memory: "256Mi"
              cpu: "200m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 2
---
apiVersion: v1
kind: Service
metadata:
  name: futura-api-service
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: futura-api
  ports:
    - port: 80
      targetPort: 3001
      protocol: TCP
      name: http
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: futura-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: futura-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: futura-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.futuratickets.com
        - admin.futuratickets.com
        - futuratickets.com
      secretName: futura-tls-secret
  rules:
    - host: api.futuratickets.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: futura-api-service
                port:
                  number: 80
    - host: admin.futuratickets.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: futura-admin-service
                port:
                  number: 80
    - host: futuratickets.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: futura-marketplace-service
                port:
                  number: 80
```

### Secrets Management

```bash
# Create secrets
kubectl create secret generic futura-secrets \
  --from-literal=mongo-url="mongodb://..." \
  --from-literal=jwt-secret="..." \
  --from-literal=sentry-dsn="..." \
  --from-literal=stripe-secret="..." \
  --namespace=production

# Or use sealed-secrets for GitOps
kubeseal --format yaml < futura-secrets.yaml > futura-secrets-sealed.yaml
```

---

## POST-DEPLOYMENT VERIFICATION

### Smoke Tests

```bash
#!/bin/bash
# tests/smoke-test.sh

API_URL="${1:-https://api.futuratickets.com}"

echo "Running smoke tests against $API_URL"

# Health check
echo "✓ Testing health endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ $response != "200" ]; then
  echo "❌ Health check failed: $response"
  exit 1
fi
echo "✅ Health check passed"

# Readiness probe
echo "✓ Testing readiness endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health/ready)
if [ $response != "200" ]; then
  echo "❌ Readiness check failed: $response"
  exit 1
fi
echo "✅ Readiness check passed"

# API endpoint
echo "✓ Testing API endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/events)
if [ $response != "200" ] && [ $response != "401" ]; then
  echo "❌ API endpoint failed: $response"
  exit 1
fi
echo "✅ API endpoint passed"

echo "✅ All smoke tests passed!"
```

---

## ROLLBACK PROCEDURES

### Quick Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/futura-api

# Rollback to specific revision
kubectl rollout history deployment/futura-api
kubectl rollout undo deployment/futura-api --to-revision=3

# Check rollout status
kubectl rollout status deployment/futura-api
```

### Database Rollback

```bash
# Restore from backup
mongorestore --uri="mongodb://..." --archive=backup-2025-10-16.gz --gzip

# Point-in-time recovery
mongorestore --uri="mongodb://..." --oplogReplay --oplogLimit=1729080000:1
```

---

## SCALING GUIDELINES

### Vertical Scaling

```bash
# Increase resources
kubectl set resources deployment futura-api \
  --requests=cpu=500m,memory=512Mi \
  --limits=cpu=1000m,memory=1Gi
```

### Horizontal Scaling

```bash
# Manual scaling
kubectl scale deployment futura-api --replicas=10

# Auto-scaling (already configured via HPA)
# Scales between 3-10 replicas based on CPU/memory
```

### Database Scaling

```bash
# MongoDB replica set
# Add new member to replica set
mongo --eval 'rs.add("mongodb-3.mongodb-service:27017")'

# Redis cluster
# Add new nodes
redis-cli --cluster add-node new-node:6379 existing-node:6379
```

---

## CONCLUSION

This deployment guide provides a complete production-ready setup for FuturaTickets platform with:

- ✅ Sentry error tracking (backend + frontend)
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Comprehensive monitoring (Prometheus + Grafana)
- ✅ Automated alerting (PagerDuty + Slack)
- ✅ Load testing framework (Artillery)
- ✅ Multiple deployment strategies (Blue-Green, Canary)
- ✅ Kubernetes manifests with auto-scaling
- ✅ Rollback procedures
- ✅ Smoke tests

**Next Steps**:
1. Configure Sentry projects
2. Set up GitHub repository secrets
3. Deploy to staging environment
4. Run load tests
5. Deploy to production with monitoring

---

**Document Version**: 1.0.0
**Last Updated**: 16 Octubre 2025
**Maintained By**: DevOps Team
