# Development Workflow - FuturaTickets

Esta guía describe el workflow completo de desarrollo para el monorepo de FuturaTickets, desde la configuración inicial hasta el deployment en producción.

## Tabla de Contenidos

1. [Setup Inicial](#setup-inicial)
2. [Git Workflow](#git-workflow)
3. [Desarrollo con Git Worktrees](#desarrollo-con-git-worktrees)
4. [Code Quality](#code-quality)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Setup Inicial

### Primera Vez en el Proyecto

1. **Clonar el repositorio**:
```bash
git clone https://github.com/your-org/monorepo-futuratickets.git
cd monorepo-futuratickets
```

2. **Ejecutar Quick Start**:
```bash
./scripts/quick-start.sh
```

Este script:
- Verifica prerrequisitos (Node.js, npm, Git)
- Instala dependencias en todos los proyectos
- Crea archivos `.env` de ejemplo
- Configura Git hooks (si está habilitado)
- Muestra instrucciones para continuar

3. **Configurar variables de entorno**:
```bash
# Backend API
cd futura-tickets-admin-api
cp .env.example .env
# Editar .env con tus valores

# Frontend Admin
cd ../futura-tickets-admin
cp .env.example .env.local
# Editar .env.local

# Frontend Marketplace
cd ../futura-market-place-v2
cp .env.example .env.local
# Editar .env.local
```

4. **Verificar instalación**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
npm run type-check  # En cada proyecto
```

### Configuración de Editor

#### VSCode (Recomendado)

1. **Instalar extensiones recomendadas**:
   - Abrir VSCode
   - Ir a Extensions
   - Buscar "@recommended"
   - Instalar todas las recomendadas

2. **Verificar configuración**:
   - `.vscode/settings.json` ya está configurado en el repo
   - Format on save está activado
   - ESLint auto-fix al guardar

#### Otros Editores

El proyecto usa **EditorConfig** para mantener consistencia en cualquier editor:
- IntelliJ IDEA: Soporte nativo
- Sublime Text: Instalar plugin EditorConfig
- Vim: Instalar plugin editorconfig-vim

## Git Workflow

### Branch Strategy

El proyecto usa **Git Flow** simplificado:

```
main           # Producción - protegida
  ├─ develop   # Pre-producción - opcional
  ├─ feature/* # Nuevas funcionalidades
  ├─ fix/*     # Bug fixes
  └─ hotfix/*  # Fixes urgentes en producción
```

### Convenciones de Nombres

#### Branches

```bash
# Nuevas features
feature/ticket-validation
feature/admin-dashboard

# Bug fixes
fix/login-error
fix/payment-calculation

# Hotfixes
hotfix/security-patch
hotfix/critical-bug
```

#### Commits

Usar **Conventional Commits**:

```bash
# Formato
<type>(<scope>): <subject>

# Ejemplos
feat(api): add ticket validation endpoint
fix(admin): resolve login redirect issue
docs(readme): update deployment instructions
refactor(marketplace): simplify payment flow
test(api): add integration tests for orders
chore(deps): upgrade nestjs to v10
```

**Types**:
- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `docs`: Cambios en documentación
- `refactor`: Refactorización sin cambio funcional
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento
- `perf`: Mejoras de performance
- `style`: Formateo (no confundir con CSS)

**Scopes** (opcional):
- `api`: Backend API
- `admin`: Frontend Admin
- `marketplace`: Frontend Marketplace
- `contracts`: Smart Contracts
- `k8s`: Kubernetes configs
- `ci`: CI/CD

### Workflow de Desarrollo

#### 1. Crear nueva branch

```bash
# Desde main
git checkout main
git pull origin main

# Crear feature branch
git checkout -b feature/mi-feature
```

#### 2. Desarrollo

```bash
# Hacer cambios
# ...

# Verificar estado
git status

# Stage cambios
git add .

# Commit (el mensaje sigue Conventional Commits)
git commit -m "feat(api): add user authentication"
```

#### 3. Push y Pull Request

```bash
# Push a remote
git push -u origin feature/mi-feature

# Crear PR desde GitHub UI o CLI
gh pr create --title "Add user authentication" \
  --body "Implements JWT authentication for API endpoints"
```

#### 4. Code Review

Antes de que tu PR sea merged:
- ✅ Todos los CI checks deben pasar (lint, tests, build)
- ✅ Al menos 1 aprovación de reviewer
- ✅ Conflictos resueltos
- ✅ Branch actualizada con main

```bash
# Actualizar branch con main
git checkout main
git pull origin main
git checkout feature/mi-feature
git rebase main

# O usando merge (si hay conflictos complejos)
git merge main

# Push force (si usaste rebase)
git push --force-with-lease
```

#### 5. Merge

Una vez aprobada, el PR puede ser merged:
- **Squash and Merge**: Recomendado para features con muchos commits
- **Merge Commit**: Para mantener historia detallada
- **Rebase and Merge**: Para historia linear

```bash
# Después del merge, limpiar branch local
git checkout main
git pull origin main
git branch -d feature/mi-feature
```

## Desarrollo con Git Worktrees

### ¿Cuándo Usar Worktrees?

Los **Git Worktrees** son útiles para:

1. **Desarrollo en paralelo**: Trabajar en 2+ features simultáneamente
2. **Code review**: Revisar PRs sin hacer stash de tu trabajo actual
3. **Hotfixes urgentes**: Arreglar bugs sin interrumpir tu feature
4. **Testing**: Probar diferentes branches en paralelo
5. **Claude Sessions**: Múltiples sesiones de Claude Code en diferentes branches

### Crear Worktree

```bash
# Usando el script automatizado
./scripts/worktree-create.sh feature/nueva-feature main

# Esto crea:
# - Nuevo directorio: ~/Workspace/futuratickets-feature-nueva-feature
# - Nueva branch: feature/nueva-feature (basada en main)
# - Instala dependencias automáticamente en todos los proyectos
```

### Workflow con Worktrees

#### Ejemplo 1: Feature + Hotfix Urgente

```bash
# Estás trabajando en una feature
cd ~/Workspace/monorepo-futuratickets
# ... trabajando en feature/payment-integration

# Llega un bug crítico en producción
# Crear worktree para hotfix
./scripts/worktree-create.sh hotfix/critical-bug main

# Cambiar al worktree
cd ~/Workspace/futuratickets-hotfix-critical-bug

# Arreglar bug, commit, push
git add .
git commit -m "hotfix(api): fix payment validation"
git push -u origin hotfix/critical-bug

# Crear PR y esperar merge
gh pr create --title "Fix critical payment bug"

# Volver a tu feature original
cd ~/Workspace/monorepo-futuratickets
# Continuar trabajando sin haber perdido contexto
```

#### Ejemplo 2: Code Review

```bash
# Necesitas revisar PR #123
./scripts/worktree-create.sh review-pr-123 main

cd ~/Workspace/futuratickets-review-pr-123

# Checkout al branch del PR
git fetch origin
git checkout feature/user-dashboard

# Revisar código, ejecutar tests
cd futura-tickets-admin
npm run dev
# Probar cambios en el navegador

# Dejar comentarios en GitHub
gh pr review 123 --comment -b "LGTM! Just minor suggestion..."

# Volver a tu trabajo
cd ~/Workspace/monorepo-futuratickets
```

#### Ejemplo 3: Múltiples Sesiones de Claude

```bash
# Session 1: Feature principal
cd ~/Workspace/monorepo-futuratickets
# Claude trabajando en feature/payment-system

# Session 2: Testing en paralelo
./scripts/worktree-create.sh testing/payment-tests main
cd ~/Workspace/futuratickets-testing-payment-tests
# Claude escribiendo tests para payment-system

# Session 3: Documentación
./scripts/worktree-create.sh docs/payment-guide main
cd ~/Workspace/futuratickets-docs-payment-guide
# Claude escribiendo documentación
```

### Limpiar Worktrees

```bash
# Ver todos los worktrees
git worktree list

# Limpiar worktrees merged (dry-run primero)
./scripts/worktree-cleanup.sh --dry-run

# Limpiar de verdad
./scripts/worktree-cleanup.sh

# Limpiar worktree específico
./scripts/worktree-cleanup.sh --force feature/completed-feature
```

### Best Practices con Worktrees

1. **Naming**: Usa nombres descriptivos que reflejen el propósito
2. **Cleanup**: Limpia worktrees regularmente después de merge
3. **Dependencies**: El script instala deps automáticamente, pero revisa después de merge de main
4. **Environment**: Cada worktree puede tener su propio `.env` si es necesario
5. **Disk Space**: Cada worktree usa espacio, monitorea tu disco

## Code Quality

### Linting y Formatting

El proyecto usa **ESLint** + **Prettier** + **EditorConfig**.

#### Pre-commit (Manual)

Antes de cada commit, ejecuta:

```bash
# En cada proyecto donde hiciste cambios
cd futura-tickets-admin-api

# Lint y auto-fix
npm run lint:fix

# Format
npm run format

# Type check
npm run type-check
```

#### Pre-commit (Automático con Husky)

Si quieres automatizar esto:

```bash
# En el root
npm install -D husky lint-staged

# Inicializar
npx husky install

# Crear pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

Añadir a `package.json` del root:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

#### Durante Desarrollo

Si VSCode está configurado correctamente:
- **Format on save** formatea automáticamente
- **ESLint auto-fix** corrige problemas al guardar

Verifica tu `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### Code Review Checklist

Antes de pedir review de tu PR:

- [ ] ✅ Código linted y formateado
- [ ] ✅ Type checking pasa sin errores
- [ ] ✅ Tests escritos para nueva funcionalidad
- [ ] ✅ Tests existentes pasan
- [ ] ✅ No hay `console.log` olvidados
- [ ] ✅ Variables de entorno documentadas
- [ ] ✅ Documentación actualizada si es necesario
- [ ] ✅ Commit messages siguen Conventional Commits
- [ ] ✅ PR description explica cambios y motivación

## Testing

### Niveles de Testing

#### 1. Unit Tests

```bash
# Backend API
cd futura-tickets-admin-api
npm run test

# Ver coverage
npm run test:cov

# Watch mode durante desarrollo
npm run test:watch
```

#### 2. Integration Tests

```bash
# Backend API
cd futura-tickets-admin-api
npm run test:e2e
```

#### 3. Smoke Tests

Verifican que la app arranca y endpoints básicos responden:

```bash
# Desde el root
./k8s/tests/smoke-test.sh
```

Este script verifica:
- Pods están corriendo
- Services responden
- Health checks pasan
- Endpoints principales responden correctamente

#### 4. Load Tests

Verifican performance bajo carga:

```bash
# Desde el root
./k8s/tests/load-test.sh
```

Usa k6 para simular usuarios concurrentes y medir:
- Response time
- Throughput
- Error rate
- Resource usage

### Testing Workflow

#### Durante Desarrollo

```bash
# 1. Escribir test primero (TDD)
cd futura-tickets-admin-api/src/tickets
# Editar tickets.service.spec.ts

# 2. Ejecutar en watch mode
npm run test:watch tickets.service

# 3. Implementar funcionalidad
# Editar tickets.service.ts

# 4. Verificar que pasa
# Tests se re-ejecutan automáticamente
```

#### Antes de Push

```bash
# Ejecutar todos los tests
npm run test

# Verificar coverage
npm run test:cov

# Si coverage baja mucho, añade más tests
```

#### En CI/CD

GitHub Actions ejecuta automáticamente:
1. Lint
2. Type check
3. Unit tests
4. Build
5. (Opcional) E2E tests
6. (Opcional) Smoke tests después de deploy

Ver `.github/workflows/ci.yml` para detalles.

## Deployment

### Pre-Deployment Checklist

Antes de hacer deployment a staging/producción:

```bash
# 1. Validar setup completo
./scripts/validate-deployment.sh

# 2. Verificar que todos los checks pasan
# El script verifica:
# - kubectl y cluster connectivity
# - Secrets existen y son válidos
# - Manifests de Kubernetes son válidos
# - Docker está disponible
# - Variables de entorno están configuradas
# - Sentry está configurado
# - CI/CD workflows son válidos
```

### Deployment Manual

#### 1. Build de Imágenes

```bash
# Backend API
cd futura-tickets-admin-api
docker build -t ghcr.io/your-org/futura-tickets-admin-api:v1.0.0 .
docker push ghcr.io/your-org/futura-tickets-admin-api:v1.0.0

# Frontend Admin
cd ../futura-tickets-admin
docker build -t ghcr.io/your-org/futura-tickets-admin:v1.0.0 .
docker push ghcr.io/your-org/futura-tickets-admin:v1.0.0

# Frontend Marketplace
cd ../futura-market-place-v2
docker build -t ghcr.io/your-org/futura-market-place-v2:v1.0.0 .
docker push ghcr.io/your-org/futura-market-place-v2:v1.0.0
```

#### 2. Actualizar Manifests

Editar `k8s/apps/*/deployment.yml` para usar el nuevo tag:

```yaml
spec:
  containers:
  - name: api
    image: ghcr.io/your-org/futura-tickets-admin-api:v1.0.0  # ← Actualizar
```

#### 3. Apply a Kubernetes

```bash
# Apply todos los manifests
kubectl apply -f k8s/namespace/
kubectl apply -f k8s/apps/backend-api/
kubectl apply -f k8s/apps/frontend-admin/
kubectl apply -f k8s/apps/frontend-marketplace/
kubectl apply -f k8s/monitoring/
```

#### 4. Verificar Deployment

```bash
# Ver pods
kubectl get pods -n futuratickets

# Ver logs
kubectl logs -f deployment/api -n futuratickets

# Smoke tests
./k8s/tests/smoke-test.sh
```

### Deployment Automático (CI/CD)

Cuando haces merge a `main`, GitHub Actions automáticamente:

1. **Build & Test** (`.github/workflows/ci.yml`):
   - Lint
   - Type check
   - Tests
   - Build

2. **Build Images** (`.github/workflows/deploy.yml`):
   - Build Docker images
   - Tag con commit SHA
   - Push a GitHub Container Registry

3. **Deploy** (`.github/workflows/deploy.yml`):
   - Actualizar manifests con nuevo tag
   - Apply a Kubernetes
   - Ejecutar smoke tests
   - Notificar a Sentry el nuevo release

4. **Rollback** (si smoke tests fallan):
   - Automáticamente rollback al deployment anterior
   - Notificar en Slack/email

Ver guía completa en `SETUP_GUIDE.md`.

### Deployment Strategies

#### Rolling Update (Default)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

- Zero downtime
- Gradual rollout
- Puede rollback fácilmente

#### Blue-Green

```bash
# 1. Deploy nueva versión con label diferente
kubectl apply -f k8s/apps/backend-api/deployment-green.yml

# 2. Verificar que funciona
kubectl get pods -l version=green

# 3. Cambiar service para apuntar a green
kubectl patch service api -p '{"spec":{"selector":{"version":"green"}}}'

# 4. Eliminar versión blue después de verificar
kubectl delete -f k8s/apps/backend-api/deployment-blue.yml
```

### Rollback

```bash
# Ver historial de deployments
kubectl rollout history deployment/api -n futuratickets

# Rollback al anterior
kubectl rollout undo deployment/api -n futuratickets

# Rollback a revisión específica
kubectl rollout undo deployment/api --to-revision=3 -n futuratickets

# Verificar status
kubectl rollout status deployment/api -n futuratickets
```

## Monitoring

### Herramientas de Monitoring

El stack de monitoring incluye:

1. **Grafana**: Dashboards y visualización
2. **Prometheus**: Métricas y alertas
3. **AlertManager**: Gestión de alertas
4. **Sentry**: Error tracking
5. **Kubernetes Dashboard**: Vista del cluster

### Acceder a Grafana

```bash
# Port forward
kubectl port-forward -n futuratickets svc/grafana 3000:3000

# Abrir en navegador
open http://localhost:3000

# Credentials (si no cambiaste el secret)
# User: admin
# Pass: (obtener de secret)
kubectl get secret grafana-secret -n futuratickets -o jsonpath='{.data.admin-password}' | base64 -d
```

#### Dashboards Principales

1. **Cluster Overview**:
   - CPU/Memory por namespace
   - Pods status
   - Network I/O

2. **API Metrics**:
   - Request rate
   - Response time (p50, p95, p99)
   - Error rate
   - Active connections

3. **Database Metrics**:
   - MongoDB operations/sec
   - Connection pool
   - Replication lag

4. **Frontend Metrics**:
   - Page load time
   - Time to interactive
   - Core Web Vitals

### Acceder a Sentry

```bash
# URL configurada en .env
# Ejemplo: https://sentry.io/organizations/your-org/projects/futuratickets-api/
```

#### Issues en Sentry

Sentry captura automáticamente:
- Uncaught exceptions
- Promise rejections
- HTTP errors (4xx, 5xx)
- Custom errors que logues con Sentry SDK

```typescript
// Ejemplo en código
import * as Sentry from '@sentry/node';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'payment' },
    extra: { userId: user.id },
  });
  throw error;
}
```

### Logs

#### Ver logs de pods

```bash
# Logs en tiempo real
kubectl logs -f deployment/api -n futuratickets

# Logs de todos los containers en un pod
kubectl logs -f pod/api-7d8b9c5f6-abc12 --all-containers -n futuratickets

# Logs previos (si el pod crasheó)
kubectl logs pod/api-7d8b9c5f6-abc12 --previous -n futuratickets

# Logs con timestamps
kubectl logs deployment/api --timestamps -n futuratickets

# Últimas 100 líneas
kubectl logs deployment/api --tail=100 -n futuratickets
```

#### Logs estructurados

El código usa logging estructurado (JSON):

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User login successful",
  "userId": "abc123",
  "ip": "192.168.1.1",
  "context": "AuthController"
}
```

Esto permite buscar/filtrar en herramientas como:
- Grafana Loki
- ELK Stack
- CloudWatch Logs

### Alertas

#### AlertManager

Configurado en `k8s/monitoring/alertmanager-config.yml`:

```yaml
route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-notifications'

receivers:
- name: 'slack-notifications'
  slack_configs:
  - channel: '#alerts'
    api_url: 'YOUR_SLACK_WEBHOOK_URL'
```

#### Alertas Comunes

1. **HighErrorRate**:
   - Condición: Error rate > 5% por 5 minutos
   - Acción: Verificar logs, Sentry

2. **PodCrashLooping**:
   - Condición: Pod reinicia > 3 veces en 10 minutos
   - Acción: Ver logs previos, verificar resources

3. **HighMemoryUsage**:
   - Condición: Memory > 90% por 10 minutos
   - Acción: Verificar memory leaks, aumentar resources

4. **DatabaseConnectionFailure**:
   - Condición: No puede conectar a MongoDB
   - Acción: Verificar MongoDB pod, network policies

#### Recibir Alertas

```bash
# Port forward AlertManager
kubectl port-forward -n futuratickets svc/alertmanager 9093:9093

# Abrir UI
open http://localhost:9093
```

Configurar notificaciones en:
- Slack
- Email
- PagerDuty
- Opsgenie

## Troubleshooting

### Problemas Comunes

#### 1. Pod no arranca

**Síntoma**: Pod en estado `CrashLoopBackOff` o `Error`

```bash
# Ver estado detallado
kubectl describe pod/api-xxx -n futuratickets

# Ver logs
kubectl logs pod/api-xxx --previous -n futuratickets

# Verificar imagen
kubectl get pod/api-xxx -n futuratickets -o jsonpath='{.spec.containers[0].image}'
```

**Posibles causas**:
- Imagen no existe o no es accesible
- Variables de entorno faltantes
- Health check falla demasiado rápido
- Recursos insuficientes (CPU/Memory)

**Solución**:
```bash
# Si es problema de imagen
docker pull ghcr.io/your-org/futura-tickets-admin-api:latest

# Si es problema de secrets
kubectl get secrets -n futuratickets
kubectl describe secret api-secret -n futuratickets

# Si es problema de resources
kubectl top pods -n futuratickets
# Aumentar limits en deployment.yml
```

#### 2. Service no responde

**Síntoma**: `curl` al service timeout o connection refused

```bash
# Verificar service
kubectl get svc -n futuratickets
kubectl describe svc api -n futuratickets

# Verificar endpoints
kubectl get endpoints api -n futuratickets

# Port forward para probar directamente
kubectl port-forward svc/api 8080:8080 -n futuratickets
curl http://localhost:8080/health
```

**Posibles causas**:
- Selector no coincide con labels del pod
- Puerto incorrecto en service
- Network policies bloqueando tráfico

**Solución**:
```bash
# Verificar labels
kubectl get pods -n futuratickets --show-labels
kubectl get svc api -n futuratickets -o yaml | grep selector -A 5

# Verificar network policies
kubectl get networkpolicies -n futuratickets
```

#### 3. Database connection error

**Síntoma**: API no puede conectar a MongoDB

```bash
# Verificar MongoDB pod
kubectl get pods -l app=mongodb -n futuratickets

# Verificar service
kubectl get svc mongodb -n futuratickets

# Test connection desde API pod
kubectl exec -it deployment/api -n futuratickets -- sh
apk add mongodb-tools  # Alpine
mongosh mongodb://mongodb:27017 -u $MONGO_USER -p $MONGO_PASSWORD
```

**Posibles causas**:
- MongoDB pod no está ready
- Credenciales incorrectas
- Connection string mal formateada

**Solución**:
```bash
# Verificar secret
kubectl get secret mongodb-secret -n futuratickets -o jsonpath='{.data.mongodb-root-password}' | base64 -d

# Verificar connection string en api deployment
kubectl get deployment api -n futuratickets -o yaml | grep MONGO
```

#### 4. Build falla en CI

**Síntoma**: GitHub Actions workflow falla en step de build

```bash
# Ver logs del workflow en GitHub UI
# O usando CLI
gh run list --workflow=ci.yml
gh run view <run-id>
```

**Posibles causas**:
- Dependency installation falla
- Type errors
- Lint errors
- Tests fallan

**Solución**:
```bash
# Reproducir localmente
npm install
npm run lint
npm run type-check
npm run test
npm run build
```

#### 5. Sentry no captura errores

**Síntoma**: Errores no aparecen en Sentry dashboard

**Verificar configuración**:

```typescript
// main.ts o _app.tsx
import * as Sentry from '@sentry/node';  // o @sentry/nextjs

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Test manualmente
Sentry.captureMessage('Test from development');
```

**Posibles causas**:
- DSN incorrecto o faltante
- Environment no configurado
- Sentry deshabilitado en development

#### 6. High memory usage

**Síntoma**: Pod usa mucha memoria y es killed por OOM

```bash
# Ver uso actual
kubectl top pods -n futuratickets

# Ver events de OOM
kubectl get events -n futuratickets --sort-by='.lastTimestamp' | grep OOM

# Ver limits configurados
kubectl get pod/api-xxx -n futuratickets -o jsonpath='{.spec.containers[0].resources}'
```

**Solución**:
```bash
# Aumentar memory limit en deployment.yml
resources:
  limits:
    memory: "1Gi"  # Era 512Mi
  requests:
    memory: "512Mi"

# O investigar memory leak
# Port forward para profiling
kubectl port-forward pod/api-xxx 9229:9229 -n futuratickets
# Usar Chrome DevTools o clinic.js
```

### Debug Tips

#### 1. Shell interactivo en pod

```bash
# Entrar a container
kubectl exec -it deployment/api -n futuratickets -- sh

# Ver variables de entorno
env | grep -i mongo

# Ver filesystem
ls -la /app

# Test network
apk add curl
curl http://mongodb:27017
```

#### 2. Copy archivos desde/hacia pod

```bash
# Desde pod a local
kubectl cp futuratickets/api-xxx:/app/logs/error.log ./error.log

# Desde local a pod
kubectl cp ./config.json futuratickets/api-xxx:/app/config.json
```

#### 3. Ver recursos del cluster

```bash
# Nodes
kubectl get nodes
kubectl top nodes

# Todos los recursos
kubectl get all -n futuratickets

# Persistente volumes
kubectl get pv
kubectl get pvc -n futuratickets
```

#### 4. Eventos del cluster

```bash
# Ver últimos eventos
kubectl get events -n futuratickets --sort-by='.lastTimestamp'

# Watch events en tiempo real
kubectl get events -n futuratickets --watch
```

## Best Practices

### 1. Commits Frecuentes y Pequeños

❌ **Mal**:
```bash
# Un commit gigante después de 3 días
git commit -m "feat: implement entire payment system"
```

✅ **Bien**:
```bash
git commit -m "feat(api): add payment validation endpoint"
git commit -m "feat(api): integrate stripe payment gateway"
git commit -m "test(api): add payment validation tests"
git commit -m "docs(api): document payment api endpoints"
```

### 2. Branch Actualizado con Main

Mantén tu feature branch actualizado con main regularmente:

```bash
# Cada 1-2 días
git checkout main
git pull origin main
git checkout feature/mi-feature
git rebase main  # o merge main

# Push (force-with-lease es más seguro que force)
git push --force-with-lease
```

### 3. Tests Antes de Push

Siempre ejecuta tests antes de push:

```bash
# Crea alias para facilitar
alias pre-push="npm run lint:fix && npm run type-check && npm run test && npm run build"

# Ejecutar
pre-push
```

### 4. Environment Variables

Nunca commitear secrets:

❌ **Mal**:
```typescript
const apiKey = 'sk_live_abc123def456';  // ¡NO!
```

✅ **Bien**:
```typescript
const apiKey = process.env.STRIPE_API_KEY;
if (!apiKey) {
  throw new Error('STRIPE_API_KEY is required');
}
```

### 5. Error Handling

Siempre loguear errores y capturar en Sentry:

❌ **Mal**:
```typescript
try {
  await payment.process();
} catch (error) {
  console.log('Error:', error);  // Se pierde en logs
}
```

✅ **Bien**:
```typescript
try {
  await payment.process();
} catch (error) {
  this.logger.error('Payment processing failed', {
    error,
    userId: user.id,
    amount: payment.amount,
  });
  Sentry.captureException(error, {
    tags: { operation: 'payment' },
    extra: { userId: user.id },
  });
  throw error;  // Re-throw para que caller maneje
}
```

### 6. Code Review

Al revisar PRs:

- ✅ Lee el código cuidadosamente, no solo los diffs
- ✅ Ejecuta el código localmente si es cambio grande
- ✅ Verifica tests cubren casos edge
- ✅ Verifica documentación actualizada
- ✅ Da feedback constructivo y específico
- ✅ Aprueba cuando realmente estés conforme

### 7. Documentation

Documenta decisiones importantes:

```typescript
/**
 * Calcula el precio total incluyendo impuestos.
 *
 * NOTA: El IVA se calcula basado en el país del usuario.
 * Para España (ES), el IVA es 21%.
 * Para eventos exentos de IVA, usar calculatePriceWithoutTax().
 *
 * @param basePrice - Precio base sin impuestos
 * @param country - Código de país ISO-3166-1 alpha-2
 * @returns Precio total con impuestos incluidos
 *
 * @example
 * calculateTotalPrice(100, 'ES') // 121 (100 + 21% IVA)
 * calculateTotalPrice(100, 'US') // 100 (sin IVA)
 */
function calculateTotalPrice(basePrice: number, country: string): number {
  // Implementation...
}
```

### 8. Performance

Monitorea performance desde el inicio:

```typescript
// Backend: Añade tracing
import * as Sentry from '@sentry/node';

const transaction = Sentry.startTransaction({
  op: 'payment',
  name: 'Process Payment',
});

try {
  await payment.process();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}

// Frontend: Monitorea Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 9. Security

Checklist de seguridad:

- [ ] Nunca commitear secrets (.env en .gitignore)
- [ ] Validar input del usuario (usar class-validator)
- [ ] Sanitizar output (prevenir XSS)
- [ ] Usar HTTPS en producción
- [ ] Rate limiting en APIs
- [ ] Authentication en todos los endpoints sensibles
- [ ] CORS configurado correctamente
- [ ] Dependencies actualizadas (npm audit)
- [ ] SQL/NoSQL injection prevention (usar ORMs/ODMs)
- [ ] CSRF protection en forms

### 10. Escalabilidad

Diseña pensando en escala:

```typescript
// ❌ Mal: Cargar todos los tickets en memoria
async getAllTickets() {
  return await this.ticketModel.find().exec();  // Si hay 1M tickets? 💥
}

// ✅ Bien: Pagination
async getAllTickets(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;
  const tickets = await this.ticketModel
    .find()
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await this.ticketModel.countDocuments();
  return {
    data: tickets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

## Recursos Adicionales

### Documentación del Proyecto

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: Setup completo de deployment
- **[LINTING_SETUP.md](./LINTING_SETUP.md)**: Configuración de ESLint y Prettier
- **[GIT_WORKTREES_GUIDE.md](./GIT_WORKTREES_GUIDE.md)**: Guía detallada de Git Worktrees
- **[k8s/README.md](../k8s/README.md)**: Documentación de Kubernetes manifests
- **[k8s/tests/README.md](../k8s/tests/README.md)**: Documentación de tests
- **[k8s/monitoring/README.md](../k8s/monitoring/README.md)**: Documentación de monitoring

### Scripts Útiles

- `./scripts/quick-start.sh` - Setup inicial para nuevos desarrolladores
- `./scripts/validate-deployment.sh` - Validar setup antes de deployment
- `./scripts/worktree-create.sh` - Crear Git Worktree con deps instaladas
- `./scripts/worktree-cleanup.sh` - Limpiar worktrees mergeados
- `./start-all.sh` - Iniciar todos los servicios en desarrollo
- `./stop-all.sh` - Detener todos los servicios
- `./k8s/tests/smoke-test.sh` - Smoke tests después de deployment
- `./k8s/tests/load-test.sh` - Load tests con k6

### Comandos Útiles

#### Desarrollo

```bash
# Instalar deps en todos los proyectos
for dir in futura-tickets-admin-api futura-tickets-admin futura-market-place-v2; do
  (cd $dir && npm install)
done

# Lint todos los proyectos
for dir in futura-tickets-admin-api futura-tickets-admin futura-market-place-v2; do
  (cd $dir && npm run lint:fix)
done

# Type check todos los proyectos
for dir in futura-tickets-admin-api futura-tickets-admin futura-market-place-v2; do
  (cd $dir && npm run type-check)
done
```

#### Kubernetes

```bash
# Ver todo en el namespace
kubectl get all -n futuratickets

# Logs de todos los pods
kubectl logs -f -l app=api -n futuratickets --all-containers=true

# Port forward múltiples servicios
kubectl port-forward svc/api 8080:8080 -n futuratickets &
kubectl port-forward svc/grafana 3000:3000 -n futuratickets &
kubectl port-forward svc/admin 3001:3000 -n futuratickets &

# Restart deployment
kubectl rollout restart deployment/api -n futuratickets

# Scale deployment
kubectl scale deployment/api --replicas=5 -n futuratickets
```

#### Git

```bash
# Ver branches merged a main
git branch --merged main

# Limpiar branches mergeadas localmente
git branch --merged main | grep -v "^\*\|main" | xargs -n 1 git branch -d

# Ver commits desde último tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Cherry pick commit a otro branch
git cherry-pick <commit-hash>

# Stash con mensaje
git stash push -m "WIP: payment integration"

# Ver stash list
git stash list
```

### External Resources

- **NestJS**: https://docs.nestjs.com
- **Next.js**: https://nextjs.org/docs
- **Kubernetes**: https://kubernetes.io/docs
- **Docker**: https://docs.docker.com
- **Sentry**: https://docs.sentry.io
- **Prometheus**: https://prometheus.io/docs
- **Grafana**: https://grafana.com/docs
- **MongoDB**: https://docs.mongodb.com
- **Redis**: https://redis.io/documentation

---

**¡Happy Coding!** 🚀

Para preguntas o problemas, abre un issue en GitHub o contacta al equipo en Slack.
