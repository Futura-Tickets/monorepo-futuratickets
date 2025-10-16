# FuturaTickets - Setup Guide

Esta guía te llevará paso a paso por la configuración completa del proyecto FuturaTickets para deployment en producción.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Sentry](#configuración-de-sentry)
3. [Configuración de Kubernetes](#configuración-de-kubernetes)
4. [Configuración de GitHub Actions](#configuración-de-github-actions)
5. [Configuración de Secrets](#configuración-de-secrets)
6. [Configuración de Monitoring](#configuración-de-monitoring)
7. [Validación Pre-Deployment](#validación-pre-deployment)
8. [Primer Deployment](#primer-deployment)

---

## Requisitos Previos

### Software Necesario

```bash
# Verificar versiones instaladas
kubectl version --client
docker --version
node --version
npm --version
git --version
```

Versiones mínimas:
- **kubectl**: v1.28+
- **Docker**: v24.0+
- **Node.js**: v20+
- **npm**: v10+
- **Git**: v2.40+

### Acceso a Servicios

Necesitarás cuentas y acceso a:
- ✅ **Sentry.io** - Error tracking
- ✅ **GitHub** - Source control y CI/CD
- ✅ **Kubernetes Cluster** - Orchestration (Azure AKS, AWS EKS, GCP GKE, o local)
- ✅ **Stripe** - Payment processing
- ✅ **Azure Storage** - File storage
- ✅ **Slack** (opcional) - Alertas
- ✅ **PagerDuty** (opcional) - Alertas críticas

---

## Configuración de Sentry

### 1. Crear Proyectos en Sentry

Necesitas crear **3 proyectos** en Sentry:

1. **Backend API** (Node.js/NestJS)
   - Platform: Node.js
   - Nombre sugerido: `futuratickets-api`

2. **Admin Frontend** (Next.js)
   - Platform: Next.js
   - Nombre sugerido: `futuratickets-admin`

3. **Marketplace Frontend** (Next.js)
   - Platform: Next.js
   - Nombre sugerido: `futuratickets-marketplace`

### 2. Obtener DSN de cada proyecto

Para cada proyecto en Sentry:
1. Ve a **Settings** → **Projects** → [Nombre del proyecto]
2. Ve a **Client Keys (DSN)**
3. Copia el **DSN** (formato: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### 3. Crear Auth Token para CI/CD

1. Ve a **Settings** → **Account** → **API** → **Auth Tokens**
2. Crea un nuevo token con permisos:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Guarda el token de forma segura

### 4. Configurar Variables de Entorno Locales

#### Backend API (`futura-tickets-admin-api/.env`)

```bash
# Sentry
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0

# MongoDB
MONGODB_URI=mongodb://localhost:27017/futura-tickets

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=xxx;AccountKey=xxx;EndpointSuffix=core.windows.net

# Server
PORT=3001
NODE_ENV=development
```

#### Admin Frontend (`futura-tickets-admin/.env.local`)

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=futuratickets-admin
SENTRY_AUTH_TOKEN=xxxxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Google Auth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

#### Marketplace Frontend (`futura-market-place-v2/.env.local`)

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=futuratickets-marketplace
SENTRY_AUTH_TOKEN=xxxxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx (opcional, si usas Mapbox)
```

---

## Configuración de Kubernetes

### 1. Conectar a tu Cluster

```bash
# Azure AKS
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

# AWS EKS
aws eks update-kubeconfig --region us-east-1 --name myEKSCluster

# GCP GKE
gcloud container clusters get-credentials myGKECluster --zone us-central1-a

# Local (Minikube/Kind)
kubectl config use-context minikube
# o
kubectl config use-context kind-kind
```

### 2. Crear Namespace

```bash
kubectl create namespace futuratickets
kubectl config set-context --current --namespace=futuratickets
```

### 3. Verificar Acceso

```bash
kubectl get nodes
kubectl get namespaces
```

---

## Configuración de GitHub Actions

### 1. Secrets de GitHub

Ve a tu repositorio en GitHub: **Settings** → **Secrets and variables** → **Actions**

Crea los siguientes secrets:

#### Registry Secrets
```
REGISTRY_USERNAME=your-github-username
REGISTRY_TOKEN=ghp_xxxxx (Personal Access Token con permisos de packages)
```

#### Sentry Secrets
```
SENTRY_AUTH_TOKEN=xxxxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT_API=futuratickets-api
SENTRY_PROJECT_ADMIN=futuratickets-admin
SENTRY_PROJECT_MARKETPLACE=futuratickets-marketplace
```

#### Kubernetes Secrets
```
KUBE_CONFIG=<contenido-base64-de-tu-kubeconfig>
```

Para obtener KUBE_CONFIG:
```bash
cat ~/.kube/config | base64
```

### 2. Variables de GitHub

Crea las siguientes variables:

```
REGISTRY=ghcr.io
REGISTRY_NAMESPACE=your-github-username
KUBE_NAMESPACE=futuratickets
```

---

## Configuración de Secrets

### Método 1: Script Interactivo (Recomendado)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./scripts/setup-secrets.sh production
```

El script te pedirá interactivamente:
- MongoDB credentials
- Redis password
- JWT secret
- Stripe keys
- Azure Storage connection string
- Sentry DSN
- Google Client ID
- Grafana credentials
- GitHub Container Registry credentials

### Método 2: Manual

#### MongoDB Secret

```bash
kubectl create secret generic mongodb-secret \
  --namespace=futuratickets \
  --from-literal=username=admin \
  --from-literal=password=YOUR_STRONG_PASSWORD
```

#### Redis Secret

```bash
kubectl create secret generic redis-secret \
  --namespace=futuratickets \
  --from-literal=password=YOUR_REDIS_PASSWORD
```

#### API Secret

```bash
MONGO_URL="mongodb://admin:YOUR_STRONG_PASSWORD@mongodb:27017/futura-tickets?authSource=admin"

kubectl create secret generic api-secret \
  --namespace=futuratickets \
  --from-literal=mongo-url="${MONGO_URL}" \
  --from-literal=jwt-secret="YOUR_JWT_SECRET" \
  --from-literal=stripe-secret-key="sk_live_xxxxx" \
  --from-literal=stripe-public-key="pk_live_xxxxx" \
  --from-literal=stripe-webhook-secret="whsec_xxxxx" \
  --from-literal=azure-storage-connection="YOUR_CONNECTION_STRING" \
  --from-literal=sentry-dsn="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

#### Admin Secret

```bash
kubectl create secret generic admin-secret \
  --namespace=futuratickets \
  --from-literal=google-client-id="xxxxx.apps.googleusercontent.com"
```

#### Grafana Secret

```bash
kubectl create secret generic grafana-secret \
  --namespace=futuratickets \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=YOUR_GRAFANA_PASSWORD
```

#### GitHub Container Registry Secret

```bash
kubectl create secret docker-registry ghcr-secret \
  --namespace=futuratickets \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_PAT \
  --docker-email=your.email@example.com
```

### Verificar Secrets

```bash
kubectl get secrets -n futuratickets
```

Deberías ver:
- mongodb-secret
- redis-secret
- api-secret
- admin-secret
- grafana-secret
- ghcr-secret

---

## Configuración de Monitoring

### 1. Configurar Slack Webhooks (Opcional pero recomendado)

1. Ve a tu workspace de Slack
2. Crea una app en https://api.slack.com/apps
3. Activa **Incoming Webhooks**
4. Crea un webhook para el canal deseado (ej: `#alerts`)
5. Copia la URL del webhook

### 2. Actualizar AlertManager Config

Edita `k8s/alertmanager/configmap.yml`:

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
```

### 3. Configurar PagerDuty (Opcional)

1. Crea una cuenta en PagerDuty
2. Crea un servicio para FuturaTickets
3. Genera una Integration Key
4. Actualiza `k8s/alertmanager/configmap.yml`:

```yaml
receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_INTEGRATION_KEY'
```

### 4. Configurar Email Notifications (Opcional)

Actualiza `k8s/alertmanager/configmap.yml`:

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@futuratickets.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-app-password'

receivers:
  - name: 'database-team'
    email_configs:
      - to: 'database-team@company.com'
```

---

## Validación Pre-Deployment

### 1. Ejecutar Script de Validación

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./scripts/validate-deployment.sh
```

Este script verificará:
- ✅ Conectividad a Kubernetes
- ✅ Namespace existe
- ✅ Todos los secrets están creados
- ✅ Archivos de configuración son válidos
- ✅ Variables de entorno necesarias están definidas

### 2. Tests Locales

#### Backend API

```bash
cd futura-tickets-admin-api
npm run test
npm run test:e2e
```

#### Admin Frontend

```bash
cd futura-tickets-admin
npm run build
npm run test
```

#### Marketplace Frontend

```bash
cd futura-market-place-v2
npm run build
npm run test
```

### 3. Smoke Tests

```bash
# Asegúrate de que todos los servicios estén corriendo localmente
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./tests/smoke-test.sh http://localhost:3000
```

---

## Primer Deployment

### Paso 1: Deploy Infraestructura

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets

# Deploy MongoDB y Redis primero
./scripts/deploy.sh production infra
```

Espera a que MongoDB y Redis estén listos:
```bash
kubectl get pods -n futuratickets -w
```

### Paso 2: Deploy Monitoring

```bash
./scripts/deploy.sh production monitoring
```

Verifica que Prometheus, Grafana y AlertManager estén corriendo:
```bash
kubectl get pods -n futuratickets | grep -E "prometheus|grafana|alertmanager"
```

### Paso 3: Deploy Aplicaciones

```bash
./scripts/deploy.sh production apps
```

Verifica el estado:
```bash
kubectl get pods -n futuratickets
kubectl get svc -n futuratickets
kubectl get ingress -n futuratickets
```

### Paso 4: Verificar Health

```bash
./scripts/health-check.sh
```

### Paso 5: Acceder a los Servicios

#### API
```bash
# Port forward para testing local
kubectl port-forward svc/api 3001:3001 -n futuratickets

# Test
curl http://localhost:3001/health
```

#### Admin Frontend
```bash
kubectl port-forward svc/admin 3000:3000 -n futuratickets
# Abre http://localhost:3000 en tu navegador
```

#### Marketplace Frontend
```bash
kubectl port-forward svc/marketplace 3002:3000 -n futuratickets
# Abre http://localhost:3002 en tu navegador
```

#### Grafana
```bash
kubectl port-forward svc/grafana 3003:3000 -n futuratickets
# Abre http://localhost:3003 en tu navegador
# Usuario: admin
# Password: (el que configuraste en grafana-secret)
```

#### Prometheus
```bash
kubectl port-forward svc/prometheus 9090:9090 -n futuratickets
# Abre http://localhost:9090 en tu navegador
```

---

## Post-Deployment

### 1. Configurar DNS

Apunta tus dominios a la IP del Load Balancer:

```bash
kubectl get ingress -n futuratickets
```

Configuración DNS sugerida:
- `api.futuratickets.com` → API
- `admin.futuratickets.com` → Admin Frontend
- `futuratickets.com` / `www.futuratickets.com` → Marketplace

### 2. Configurar SSL/TLS

El ingress controller con cert-manager configurará automáticamente los certificados SSL de Let's Encrypt.

Verifica:
```bash
kubectl get certificate -n futuratickets
```

### 3. Configurar Webhooks

#### Stripe Webhooks
1. Ve a Stripe Dashboard → Developers → Webhooks
2. Añade endpoint: `https://api.futuratickets.com/webhooks/stripe`
3. Eventos a escuchar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copia el Webhook Secret y actualiza el secret de Kubernetes:

```bash
kubectl patch secret api-secret -n futuratickets \
  -p '{"data":{"stripe-webhook-secret":"'$(echo -n "whsec_xxxxx" | base64)'"}}'
```

### 4. Backup Inicial

```bash
./scripts/backup-mongodb.sh ./backups
```

### 5. Configurar Backups Automáticos

Crea un CronJob para backups diarios:

```yaml
# k8s/cronjobs/backup-mongodb.yml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mongodb-backup
  namespace: futuratickets
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mongo:7.0
            command:
            - /bin/sh
            - -c
            - |
              mongodump --host=mongodb --username=$MONGO_USER --password=$MONGO_PASSWORD \
              --authenticationDatabase=admin --out=/backup/$(date +%Y%m%d-%H%M%S)
            env:
            - name: MONGO_USER
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: username
            - name: MONGO_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: mongodb-backup-pvc
          restartPolicy: OnFailure
```

```bash
kubectl apply -f k8s/cronjobs/backup-mongodb.yml
```

---

## Troubleshooting

### Pods no inician

```bash
# Ver logs del pod
kubectl logs <pod-name> -n futuratickets

# Ver eventos
kubectl describe pod <pod-name> -n futuratickets

# Ver eventos del namespace
kubectl get events -n futuratickets --sort-by='.lastTimestamp'
```

### Errores de ImagePullBackOff

```bash
# Verificar secret de registry
kubectl get secret ghcr-secret -n futuratickets -o yaml

# Recrear secret si es necesario
kubectl delete secret ghcr-secret -n futuratickets
./scripts/setup-secrets.sh production
```

### Base de datos no conecta

```bash
# Verificar MongoDB está corriendo
kubectl get pods -l app=mongodb -n futuratickets

# Ver logs de MongoDB
kubectl logs -l app=mongodb -n futuratickets

# Verificar secret
kubectl get secret mongodb-secret -n futuratickets -o jsonpath='{.data.username}' | base64 -d
```

### Sentry no recibe errores

```bash
# Verificar variables de entorno en el pod
kubectl exec -it <api-pod-name> -n futuratickets -- env | grep SENTRY

# Test manual de Sentry
kubectl exec -it <api-pod-name> -n futuratickets -- node -e "
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
Sentry.captureMessage('Test from kubectl');
setTimeout(() => process.exit(0), 2000);
"
```

---

## Checklist de Producción

Antes de ir a producción, verifica:

### Seguridad
- [ ] Todos los secrets están configurados con valores de producción
- [ ] JWT secret es fuerte y único
- [ ] Contraseñas de MongoDB/Redis son fuertes
- [ ] Stripe keys son de producción (no test)
- [ ] Variables de entorno no contienen secrets en plain text
- [ ] Network Policies están configuradas (si aplica)
- [ ] Pod Security Policies están configuradas (si aplica)
- [ ] SSL/TLS está activo en todos los servicios públicos

### Monitoring
- [ ] Sentry está recibiendo eventos correctamente
- [ ] Prometheus está scrapeando todas las métricas
- [ ] Grafana dashboards muestran datos
- [ ] AlertManager está enviando alertas de prueba
- [ ] Slack/PagerDuty están configurados

### Performance
- [ ] HPA está configurado y respondiendo a carga
- [ ] Resource limits están configurados en todos los pods
- [ ] PVCs tienen suficiente espacio
- [ ] Load tests han pasado exitosamente

### Backups
- [ ] Backup manual ejecutado exitosamente
- [ ] CronJob de backups automáticos está configurado
- [ ] Restore process ha sido probado
- [ ] Backups se están almacenando en ubicación segura

### CI/CD
- [ ] Pipeline de GitHub Actions está funcionando
- [ ] Tests automáticos están pasando
- [ ] Deployment automático funciona correctamente
- [ ] Rollback ha sido probado

### Funcionalidad
- [ ] Smoke tests pasan en producción
- [ ] Todas las features críticas funcionan
- [ ] Pagos con Stripe funcionan correctamente
- [ ] Autenticación/Autorización funciona
- [ ] Upload de archivos a Azure Storage funciona

---

## Soporte y Recursos

- **Documentación**: Ver `DEPLOYMENT_COMPLETE.md` para guía operacional completa
- **Scripts**: Todos los scripts operacionales están en `/scripts`
- **Logs**: `kubectl logs -f deployment/<component> -n futuratickets`
- **Monitoring**: Accede a Grafana para visualizar métricas
- **Sentry**: https://sentry.io → Tu organización → Proyectos

---

## Contacto

Para soporte o preguntas sobre el deployment, contacta al equipo de DevOps.

**¡Deployment exitoso! 🚀**
