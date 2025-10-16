# FuturaTickets - Production Deployment Infrastructure

Infraestructura completa de deployment, monitoring y error tracking para FuturaTickets.

## 📋 Resumen de Implementación

### ✅ Completado

1. **Sentry Error Tracking** - Backend + 2 Frontends
2. **CI/CD Pipeline** - GitHub Actions con testing y deployment
3. **Testing Infrastructure** - Smoke tests + Load testing (Artillery)
4. **Kubernetes Manifests** - Deployment completo con HPA y SSL
5. **Monitoring Stack** - Prometheus + Grafana + AlertManager
6. **Deployment Scripts** - Scripts automatizados para deployment y operaciones

---

## 🏗️ Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         NGINX Ingress + Let's Encrypt SSL            │  │
│  │  api.*.com │ admin.*.com │ futuratickets.com        │  │
│  └──────────────────────────────────────────────────────┘  │
│         │              │                  │                  │
│         ▼              ▼                  ▼                  │
│  ┌──────────┐   ┌──────────┐    ┌─────────────┐           │
│  │   API    │   │  Admin   │    │ Marketplace │           │
│  │ (3 pods) │   │ (2 pods) │    │  (2 pods)   │           │
│  │ + HPA    │   │          │    │             │           │
│  └──────────┘   └──────────┘    └─────────────┘           │
│         │              │                  │                  │
│         └──────────────┴──────────────────┘                 │
│                        │                                     │
│         ┌──────────────┴──────────────┐                    │
│         │                              │                     │
│    ┌─────────┐                  ┌──────────┐               │
│    │ MongoDB │                  │  Redis   │               │
│    │ (7.0)   │                  │ (7-alpine)│               │
│    │ + PVC   │                  │ + PVC    │               │
│    └─────────┘                  └──────────┘               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MONITORING STACK                         │  │
│  │  ┌────────────┐ ┌──────────┐ ┌─────────────┐       │  │
│  │  │ Prometheus │→│ Grafana  │←│AlertManager │       │  │
│  │  │  (Metrics) │ │(Dashboard)│ │  (Alerts)   │       │  │
│  │  └────────────┘ └──────────┘ └─────────────┘       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             ERROR TRACKING (Sentry)                   │  │
│  │  Backend + Admin Frontend + Marketplace Frontend     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
monorepo-futuratickets/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # ✅ CI/CD pipeline completo
│
├── futura-tickets-admin-api/
│   └── src/
│       ├── Sentry/
│       │   ├── sentry.config.ts      # ✅ Configuración Sentry backend
│       │   └── sentry.filter.ts      # ✅ Global exception filter
│       └── main.ts                   # ✅ Integrado con Sentry
│
├── futura-tickets-admin/
│   ├── sentry.client.config.ts       # ✅ Sentry client-side
│   ├── sentry.server.config.ts       # ✅ Sentry server-side
│   ├── sentry.edge.config.ts         # ✅ Sentry edge runtime
│   ├── instrumentation.ts            # ✅ Instrumentation hook
│   ├── next.config.ts                # ✅ Configurado con Sentry
│   ├── components/
│   │   └── error-boundary.tsx        # ✅ Integrado con Sentry
│   └── .env.local.example            # ✅ Variables documentadas
│
├── futura-market-place-v2/
│   ├── sentry.client.config.ts       # ✅ Sentry client-side
│   ├── sentry.server.config.ts       # ✅ Sentry server-side
│   ├── sentry.edge.config.ts         # ✅ Sentry edge runtime
│   ├── instrumentation.ts            # ✅ Instrumentation hook
│   ├── next.config.mjs               # ✅ Configurado con Sentry
│   └── .env.local.example            # ✅ Variables documentadas
│
├── k8s/                              # ✅ Kubernetes manifests
│   ├── namespace.yml
│   ├── README.md                     # Documentación completa
│   │
│   ├── mongodb/                      # MongoDB (7.0)
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   ├── pvc.yml                   # 20Gi storage
│   │   └── secret.yml
│   │
│   ├── redis/                        # Redis (7-alpine)
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   ├── pvc.yml                   # 5Gi storage
│   │   └── secret.yml
│   │
│   ├── api/                          # Backend API
│   │   ├── deployment.yml            # 3 replicas
│   │   ├── service.yml
│   │   ├── secret.yml                # Todas las env vars
│   │   └── hpa.yml                   # 3-10 pods autoscaling
│   │
│   ├── admin/                        # Admin Panel
│   │   ├── deployment.yml            # 2 replicas
│   │   ├── service.yml
│   │   └── secret.yml
│   │
│   ├── marketplace/                  # Public Marketplace
│   │   ├── deployment.yml            # 2 replicas
│   │   └── service.yml
│   │
│   ├── ingress/                      # NGINX + SSL
│   │   ├── ingress.yml               # Routes + SSL
│   │   └── certificate.yml           # Let's Encrypt
│   │
│   ├── prometheus/                   # Metrics collection
│   │   ├── configmap.yml             # Config + alert rules
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   ├── pvc.yml                   # 50Gi storage
│   │   └── rbac.yml                  # Permissions
│   │
│   ├── grafana/                      # Dashboards
│   │   ├── configmap.yml             # Datasources + dashboards
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   ├── pvc.yml                   # 10Gi storage
│   │   └── secret.yml
│   │
│   └── alertmanager/                 # Alerting
│       ├── configmap.yml             # Alert routing
│       ├── deployment.yml
│       ├── service.yml
│       └── pvc.yml                   # 5Gi storage
│
├── tests/
│   ├── smoke-test.sh                 # ✅ Health checks
│   └── load-test.yml                 # ✅ Artillery config (8 escenarios)
│
└── scripts/                          # ✅ Deployment automation
    ├── deploy.sh                     # Deploy all/component
    ├── rollback.sh                   # Rollback deployment
    ├── update-image.sh               # Update container image
    ├── health-check.sh               # Check cluster health
    ├── backup-mongodb.sh             # Backup MongoDB
    └── setup-secrets.sh              # Configure secrets
```

---

## 🚀 Deployment Quickstart

### 1. Prerequisites

```bash
# Install kubectl
brew install kubectl

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager (for SSL)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Install Metrics Server (for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 2. Setup Secrets

```bash
cd /path/to/monorepo-futuratickets
./scripts/setup-secrets.sh production
```

Este script te pedirá todas las credenciales necesarias:
- MongoDB username/password
- Redis password
- JWT secret
- Stripe keys (secret, public, webhook)
- Azure Storage connection string
- Sentry DSN
- Google OAuth Client ID
- Grafana admin credentials
- GitHub Container Registry token

### 3. Deploy Infrastructure

```bash
# Deploy database layer
./scripts/deploy.sh production infra

# Deploy application layer
./scripts/deploy.sh production apps

# Deploy monitoring stack
./scripts/deploy.sh production monitoring

# Deploy ingress
./scripts/deploy.sh production ingress

# Or deploy everything at once
./scripts/deploy.sh production all
```

### 4. Verify Deployment

```bash
# Check health
./scripts/health-check.sh

# Check specific component
kubectl get pods -n futuratickets
kubectl get svc -n futuratickets
kubectl get ingress -n futuratickets

# View logs
kubectl logs -f deployment/api -n futuratickets
```

---

## 📊 Monitoring & Alerting

### Prometheus

**URL**: `https://prometheus.futuratickets.com`

**Métricas monitorizadas**:
- HTTP request rate & error rate
- API latency (P95, P99)
- Pod CPU & memory usage
- MongoDB connections
- Redis clients
- Kubernetes cluster health

### Grafana

**URL**: `https://grafana.futuratickets.com`
**Credentials**: Ver secret `grafana-secret`

**Dashboards incluidos**:
1. **FuturaTickets Overview**
   - Request rate & error rate
   - P95 latency
   - Active pods
   - CPU & memory por pod
   - MongoDB & Redis connections

2. **Kubernetes Cluster**
   - Cluster CPU & memory usage
   - Pod count by status
   - Pod restarts

### AlertManager

**URL**: `https://alertmanager.futuratickets.com`

**Alertas configuradas**:
- **Critical**:
  - High error rate (>5%)
  - Low availability (<99%)
  - MongoDB/Redis down
  - Pod crash looping
  - High memory usage (>90%)

- **Warning**:
  - High latency (P95 >1s)
  - High MongoDB connections (>800)
  - Pod restarting often
  - High CPU usage (>80%)

**Routing**:
- Critical → PagerDuty + Slack
- Warning → Slack
- Database issues → Database team email + Slack
- API issues → API team Slack

---

## 🔧 Common Operations

### Update Image

```bash
# Update API to new version
./scripts/update-image.sh api main-abc123

# Update Admin
./scripts/update-image.sh admin v1.2.3
```

### Rollback

```bash
# Rollback to previous version
./scripts/rollback.sh api

# Rollback to specific revision
./scripts/rollback.sh api 3
```

### Backup MongoDB

```bash
# Create backup
./scripts/backup-mongodb.sh ./backups

# Backup will be saved to: ./backups/mongodb-backup-TIMESTAMP/
```

### Scale Manually

```bash
# Scale API to 5 replicas
kubectl scale deployment/api --replicas=5 -n futuratickets

# HPA will override manual scaling if CPU/memory triggers
```

### View Logs

```bash
# Real-time logs
kubectl logs -f deployment/api -n futuratickets
kubectl logs -f deployment/admin -n futuratickets
kubectl logs -f deployment/marketplace -n futuratickets

# Logs from specific pod
kubectl logs api-abc123-xyz -n futuratickets

# Previous logs (if pod restarted)
kubectl logs api-abc123-xyz -n futuratickets --previous
```

---

## 🧪 Testing

### Smoke Tests

```bash
# Test local
./tests/smoke-test.sh http://localhost:3000

# Test staging
./tests/smoke-test.sh https://api-staging.futuratickets.com

# Test production
./tests/smoke-test.sh https://api.futuratickets.com
```

### Load Tests

```bash
# Install Artillery
npm install -g artillery

# Run load test on local
artillery run -e local tests/load-test.yml

# Run on staging
artillery run -e staging tests/load-test.yml

# Run on production (CAREFUL!)
artillery run -e production tests/load-test.yml
```

**Escenarios incluidos**:
1. Health checks (baseline)
2. Browse events (anonymous users)
3. Authenticated user journey
4. Promoter creating events
5. Purchase tickets flow
6. API documentation access
7. Sales & resale management
8. Promoter analytics

---

## 🔒 Security Checklist

### Secrets Management

- ✅ Todos los secrets en Kubernetes Secrets
- ✅ No hay secrets hardcodeados en código
- ✅ `.env.local.example` documentado
- ⚠️ Actualizar `CHANGE_ME` en production

### Network Security

- ✅ CORS configurado con whitelist
- ✅ SSL/TLS con Let's Encrypt
- ✅ Ingress con security headers
- ✅ Rate limiting en ingress (100 rps)
- ⚠️ Configurar Network Policies (TODO)

### Application Security

- ✅ JWT authentication
- ✅ Input validation con Zod
- ✅ Sentry filtra datos sensibles
- ⚠️ Mover auth tokens a httpOnly cookies (TODO)

---

## 📈 Performance & Scaling

### Horizontal Pod Autoscaling (HPA)

**API**:
- Min: 3 replicas
- Max: 10 replicas
- Triggers: CPU >70% OR Memory >80%

### Resource Limits

| Component | Requests | Limits |
|-----------|----------|--------|
| API | 512Mi / 500m | 1Gi / 1000m |
| Admin | 256Mi / 250m | 512Mi / 500m |
| Marketplace | 256Mi / 250m | 512Mi / 500m |
| MongoDB | 512Mi / 500m | 2Gi / 1000m |
| Redis | 256Mi / 250m | 512Mi / 500m |
| Prometheus | 512Mi / 500m | 2Gi / 1000m |
| Grafana | 256Mi / 250m | 512Mi / 500m |

### Storage

| Component | Size | Retention |
|-----------|------|-----------|
| MongoDB | 20Gi | Permanent |
| Redis | 5Gi | Ephemeral |
| Prometheus | 50Gi | 30 days |
| Grafana | 10Gi | Permanent |
| AlertManager | 5Gi | 7 days |

---

## 🛠️ Troubleshooting

### Pod CrashLoopBackOff

```bash
# Check logs
kubectl logs -f <pod-name> -n futuratickets --previous

# Describe pod
kubectl describe pod <pod-name> -n futuratickets

# Check events
kubectl get events -n futuratickets --sort-by='.lastTimestamp'
```

### Database Connection Issues

```bash
# Test MongoDB
kubectl run mongodb-test --image=mongo:7.0 --rm -it \
  -n futuratickets -- \
  mongosh mongodb://admin:PASSWORD@mongodb:27017/futura-tickets?authSource=admin

# Test Redis
kubectl run redis-test --image=redis:7-alpine --rm -it \
  -n futuratickets -- \
  redis-cli -h redis -a PASSWORD ping
```

### SSL Certificate Issues

```bash
# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Check certificate status
kubectl describe certificate -n futuratickets

# Check challenges
kubectl get challenges -n futuratickets

# Force renewal
kubectl delete certificate api-tls-cert -n futuratickets
# Ingress will auto-request new certificate
```

---

## 📞 Support & Documentation

- **Kubernetes Docs**: [k8s/README.md](k8s/README.md)
- **Sentry Setup**: Backend ya configurado, añadir DSN en secrets
- **CI/CD**: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)
- **Monitoring**: Ver dashboards en Grafana

---

## ✅ Production Readiness Checklist

### Pre-Deployment

- [ ] Actualizar todos los `CHANGE_ME` en secrets
- [ ] Configurar DNS apuntando a ingress load balancer
- [ ] Probar SSL certificates con staging issuer
- [ ] Ejecutar smoke tests en staging
- [ ] Ejecutar load tests en staging
- [ ] Revisar resource limits basado en load tests
- [ ] Configurar Slack webhook en AlertManager
- [ ] Configurar PagerDuty key para alertas críticas
- [ ] Configurar backups automáticos MongoDB (CronJob)
- [ ] Documentar runbooks para incidentes comunes

### Post-Deployment

- [ ] Verificar que todos los pods están Running
- [ ] Verificar SSL certificates emitidos
- [ ] Verificar métricas en Prometheus
- [ ] Verificar dashboards en Grafana
- [ ] Verificar alertas en AlertManager
- [ ] Configurar monitoreo externo (uptimerobot, pingdom)
- [ ] Ejecutar smoke tests en producción
- [ ] Probar rollback procedure
- [ ] Documentar procedimientos de emergency

---

## 🎯 Next Steps

### Mejoras Inmediatas (P1)

1. **Network Policies**: Aislar pods por tier
2. **Pod Security Policies**: Enforcar security standards
3. **Automated Backups**: CronJob para MongoDB backups
4. **External Monitoring**: Uptime monitoring (UptimeRobot)
5. **CDN**: CloudFlare para static assets

### Mejoras Futuras (P2)

1. **Service Mesh**: Istio para advanced traffic management
2. **Distributed Tracing**: Jaeger integration
3. **Log Aggregation**: ELK stack o Loki
4. **Chaos Engineering**: Chaos Monkey for resilience testing
5. **Multi-region**: Deploy en múltiples regiones

---

## 📄 License

Proprietary - FuturaTickets Platform

---

**Última actualización**: 2025-10-16
**Versión**: 1.0.0
**Mantenedor**: DevOps Team
