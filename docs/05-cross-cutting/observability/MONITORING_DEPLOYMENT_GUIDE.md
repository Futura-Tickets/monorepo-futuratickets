# Guía de Despliegue del Stack de Monitoreo

**Última actualización:** 2025-10-18

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Prerequisitos](#prerequisitos)
3. [Arquitectura del Stack](#arquitectura-del-stack)
4. [Paso 1: Preparación](#paso-1-preparación)
5. [Paso 2: Configurar Slack Webhooks](#paso-2-configurar-slack-webhooks)
6. [Paso 3: Desplegar el Stack](#paso-3-desplegar-el-stack)
7. [Paso 4: Verificación](#paso-4-verificación)
8. [Paso 5: Testing de Alertas](#paso-5-testing-de-alertas)
9. [Troubleshooting](#troubleshooting)
10. [Mantenimiento](#mantenimiento)

---

## Resumen Ejecutivo

Esta guía describe cómo desplegar el stack completo de monitoreo y observabilidad para FuturaTickets en un cluster de Kubernetes en producción.

### Stack de Monitoreo

- **Grafana** 11.0.0 - Dashboards y visualización
- **Prometheus** 2.53.0 - Métricas y alertas
- **AlertManager** 0.27.0 - Gestión y routing de alertas

### Componentes Creados

```
📁 k8s/
├── 📁 grafana/
│   ├── dashboard-configmap.yaml     (11 dashboards)
│   ├── deployment.yaml
│   └── service.yaml
├── 📁 prometheus/
│   ├── alert-rules.yaml             (15 reglas)
│   ├── deployment.yaml
│   ├── service.yaml
│   └── config.yaml
├── 📁 alertmanager/
│   ├── alertmanager-config.yaml     (4 canales Slack)
│   ├── deployment.yaml
│   └── service.yaml
└── 📁 monitoring/
    └── README.md                    (400+ líneas doc)
```

### Scripts Disponibles

- `scripts/configure-slack-webhook.sh` - Configurar webhooks de Slack
- `scripts/deploy-monitoring.sh` - Desplegar stack completo
- `scripts/deploy-production.sh` - Despliegue de aplicaciones

---

## Prerequisitos

### 1. Cluster de Kubernetes

**Opciones recomendadas:**

#### Desarrollo/Testing
- **Minikube** - Local Kubernetes
  ```bash
  brew install minikube
  minikube start --cpus=4 --memory=8192
  ```

- **Kind** - Kubernetes in Docker
  ```bash
  brew install kind
  kind create cluster --name futuratickets
  ```

- **Docker Desktop** - Kubernetes integrado
  ```bash
  # Habilitar Kubernetes en Docker Desktop settings
  ```

#### Producción
- **Google Kubernetes Engine (GKE)**
  ```bash
  gcloud container clusters create futuratickets \
    --zone europe-west1-b \
    --num-nodes 3 \
    --machine-type n1-standard-2
  ```

- **Azure Kubernetes Service (AKS)**
  ```bash
  az aks create \
    --resource-group futuratickets-rg \
    --name futuratickets-cluster \
    --node-count 3 \
    --enable-addons monitoring
  ```

- **Amazon EKS**
  ```bash
  eksctl create cluster \
    --name futuratickets \
    --region eu-west-1 \
    --nodegroup-name standard-workers \
    --node-type t3.medium \
    --nodes 3
  ```

### 2. Herramientas CLI

```bash
# kubectl - Kubernetes CLI
brew install kubectl

# Helm (opcional) - package manager for K8s
brew install helm

# Verificar instalación
kubectl version --client
```

### 3. Acceso al Cluster

```bash
# Verificar conectividad
kubectl cluster-info

# Verificar nodos
kubectl get nodes

# Debería mostrar:
# NAME       STATUS   ROLES    AGE   VERSION
# node-1     Ready    master   5m    v1.28.0
# node-2     Ready    <none>   4m    v1.28.0
# node-3     Ready    <none>   4m    v1.28.0
```

### 4. Slack Workspace

- Crear una cuenta en Slack
- Tener permisos de administrador para crear apps
- Crear 4 canales:
  - `#alerts-critical`
  - `#alerts-warnings`
  - `#business-alerts`
  - `#payments-alerts`

---

## Paso 1: Preparación

### 1.1 Crear Namespace

```bash
kubectl create namespace futuratickets

# Verificar
kubectl get namespaces
```

### 1.2 Configurar Contexto (Opcional)

```bash
# Establecer namespace por defecto
kubectl config set-context --current --namespace=futuratickets

# Verificar
kubectl config view --minify | grep namespace
```

### 1.3 Verificar Archivos de Configuración

```bash
# Desde la raíz del proyecto
ls -la k8s/grafana/
ls -la k8s/prometheus/
ls -la k8s/alertmanager/

# Debería ver todos los archivos YAML
```

---

## Paso 2: Configurar Slack Webhooks

### 2.1 Crear Slack App

1. Ve a https://api.slack.com/apps
2. Click en "Create New App"
3. Selecciona "From scratch"
4. Nombre: "FuturaTickets Monitoring"
5. Workspace: Tu workspace de Slack

### 2.2 Habilitar Incoming Webhooks

1. En el menú lateral, click en "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" a ON
3. Click en "Add New Webhook to Workspace"
4. Selecciona el canal `#alerts-critical`
5. Click en "Allow"
6. **Copia la Webhook URL** (formato: `https://hooks.slack.com/services/T.../B.../...`)

### 2.3 Configurar Webhook en Kubernetes

#### Opción A: Script Automático (Recomendado)

```bash
./scripts/configure-slack-webhook.sh
```

El script te pedirá la webhook URL y:
- Creará el Kubernetes Secret
- Validará el formato
- Reiniciará AlertManager si existe

#### Opción B: Manual

```bash
# Reemplazar YOUR_WEBHOOK_URL con tu URL real
kubectl create secret generic alertmanager-slack-webhook \
  --from-literal=webhook-url="https://hooks.slack.com/services/T.../B.../..." \
  --namespace=futuratickets

# Verificar
kubectl get secret alertmanager-slack-webhook -n futuratickets
```

### 2.4 Verificar Secret

```bash
# Ver el secret (base64 encoded)
kubectl get secret alertmanager-slack-webhook -n futuratickets -o yaml

# Decodificar y verificar (¡no compartir!)
kubectl get secret alertmanager-slack-webhook -n futuratickets \
  -o jsonpath='{.data.webhook-url}' | base64 --decode
```

---

## Paso 3: Desplegar el Stack

### 3.1 Opción A: Script Automático (Recomendado)

```bash
./scripts/deploy-monitoring.sh
```

Este script:
1. ✅ Verifica prerequisitos
2. ✅ Crea namespace si no existe
3. ✅ Despliega Grafana (ConfigMap + Deployment + Service)
4. ✅ Despliega Prometheus (Config + Alerts + Deployment + Service)
5. ✅ Despliega AlertManager (Config + Deployment + Service)
6. ✅ Espera a que los pods estén ready
7. ✅ Muestra información de acceso

### 3.2 Opción B: Despliegue Manual

#### 3.2.1 Desplegar Grafana

```bash
# ConfigMap con dashboards
kubectl apply -f k8s/grafana/dashboard-configmap.yaml

# Deployment y Service
kubectl apply -f k8s/grafana/deployment.yaml
kubectl apply -f k8s/grafana/service.yaml

# Esperar a que esté listo
kubectl wait --for=condition=ready pod \
  -l app=grafana -n futuratickets --timeout=300s
```

#### 3.2.2 Desplegar Prometheus

```bash
# Configuración
kubectl apply -f k8s/prometheus/config.yaml

# Reglas de alertas
kubectl apply -f k8s/prometheus/alert-rules.yaml

# Deployment y Service
kubectl apply -f k8s/prometheus/deployment.yaml
kubectl apply -f k8s/prometheus/service.yaml

# Esperar
kubectl wait --for=condition=ready pod \
  -l app=prometheus -n futuratickets --timeout=300s
```

#### 3.2.3 Desplegar AlertManager

```bash
# Configuración (incluye routing a Slack)
kubectl apply -f k8s/alertmanager/alertmanager-config.yaml

# Deployment y Service
kubectl apply -f k8s/alertmanager/deployment.yaml
kubectl apply -f k8s/alertmanager/service.yaml

# Esperar
kubectl wait --for=condition=ready pod \
  -l app=alertmanager -n futuratickets --timeout=300s
```

### 3.3 Verificar Despliegue

```bash
# Ver todos los pods
kubectl get pods -n futuratickets

# Debería mostrar:
# NAME                            READY   STATUS    RESTARTS   AGE
# grafana-xxxxx                   1/1     Running   0          2m
# prometheus-xxxxx                1/1     Running   0          2m
# alertmanager-xxxxx              1/1     Running   0          2m

# Ver servicios
kubectl get svc -n futuratickets

# Debería mostrar:
# NAME           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
# grafana        ClusterIP   10.x.x.x        <none>        3000/TCP   2m
# prometheus     ClusterIP   10.x.x.x        <none>        9090/TCP   2m
# alertmanager   ClusterIP   10.x.x.x        <none>        9093/TCP   2m
```

---

## Paso 4: Verificación

### 4.1 Acceder a Grafana

#### Opción A: Port Forward (Desarrollo)

```bash
kubectl port-forward svc/grafana -n futuratickets 3000:3000
```

Abre http://localhost:3000

**Credenciales por defecto:**
- Usuario: `admin`
- Password: `admin` (cambiar en primer login)

#### Opción B: Exponer con LoadBalancer (Producción)

```bash
# Modificar service type en k8s/grafana/service.yaml
# type: ClusterIP -> type: LoadBalancer

kubectl apply -f k8s/grafana/service.yaml

# Obtener IP externa
kubectl get svc grafana -n futuratickets

# Esperar a que aparezca EXTERNAL-IP
# NAME      TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)
# grafana   LoadBalancer   10.x.x.x       35.x.x.x        3000:xxxxx/TCP
```

#### Opción C: Ingress (Producción con HTTPS)

```yaml
# k8s/grafana/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana
  namespace: futuratickets
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - grafana.futuratickets.com
    secretName: grafana-tls
  rules:
  - host: grafana.futuratickets.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: grafana
            port:
              number: 3000
```

```bash
kubectl apply -f k8s/grafana/ingress.yaml
```

### 4.2 Verificar Dashboards en Grafana

1. Login en Grafana
2. Click en "Dashboards" (icono cuadrado en sidebar)
3. Deberías ver 11 dashboards:
   - System Overview
   - Application Performance
   - API Gateway Metrics
   - Database Performance
   - Business Metrics
   - Payment Processing
   - Error Tracking
   - User Activity
   - Infrastructure Health
   - Security Monitoring
   - Cost Optimization

### 4.3 Acceder a Prometheus

```bash
kubectl port-forward svc/prometheus -n futuratickets 9090:9090
```

Abre http://localhost:9090

**Verificar:**
1. Status → Targets - Todos los targets deben estar "UP"
2. Alerts - Ver las 15 reglas de alertas configuradas
3. Graph - Ejecutar query de prueba: `up`

### 4.4 Acceder a AlertManager

```bash
kubectl port-forward svc/alertmanager -n futuratickets 9093:9093
```

Abre http://localhost:9093

**Verificar:**
1. Status - Ver configuración cargada
2. Silences - Panel vacío inicialmente
3. Alerts - Panel vacío hasta que se dispare alguna alerta

---

## Paso 5: Testing de Alertas

### 5.1 Generar Alerta de Prueba

#### Método 1: Crear Pod de Alta CPU

```bash
# Crear pod que consume CPU
kubectl run cpu-stress -n futuratickets \
  --image=polinux/stress \
  --restart=Never \
  -- stress --cpu 1

# Esperar 5 minutos
# La alerta "HighCPUUsage" debería dispararse

# Cleanup
kubectl delete pod cpu-stress -n futuratickets
```

#### Método 2: Simular Pod Down

```bash
# Escalar a 0 replicas
kubectl scale deployment grafana -n futuratickets --replicas=0

# Esperar 1 minuto
# La alerta "PodDown" debería dispararse

# Recuperar
kubectl scale deployment grafana -n futuratickets --replicas=1
```

#### Método 3: Enviar Alerta Manual

```bash
# Crear alerta de prueba
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: alert-test
  namespace: futuratickets
  labels:
    severity: critical
    component: test
spec:
  containers:
  - name: busybox
    image: busybox
    command: ['sh', '-c', 'exit 1']
  restartPolicy: Never
EOF

# Esta alerta debería llegar a #alerts-critical en Slack
```

### 5.2 Verificar en Slack

1. Ve a tu canal `#alerts-critical`
2. Deberías ver un mensaje con formato:
   ```
   🚨 CRITICAL ALERT 🚨
   Alert: [Nombre de la alerta]
   Description: [Descripción]
   Severity: critical
   Component: test
   ```

### 5.3 Silenciar Alertas (Opcional)

```bash
# Abrir AlertManager
kubectl port-forward svc/alertmanager -n futuratickets 9093:9093

# En la UI:
# 1. Click en "New Silence"
# 2. Matcher: alertname = "HighCPUUsage"
# 3. Duration: 2h
# 4. Creator: tu@email.com
# 5. Comment: "Mantenimiento programado"
# 6. Create
```

---

## Troubleshooting

### Problema: Pods no están Ready

```bash
# Ver estado detallado
kubectl describe pod <pod-name> -n futuratickets

# Ver logs
kubectl logs <pod-name> -n futuratickets

# Causas comunes:
# - Recursos insuficientes (CPU/Memory)
# - ConfigMap/Secret no existe
# - Imagen no disponible
```

**Solución:**
```bash
# Aumentar recursos en deployment
kubectl edit deployment <name> -n futuratickets

# Verificar ConfigMaps
kubectl get configmap -n futuratickets

# Verificar Secrets
kubectl get secret -n futuratickets
```

### Problema: No llegan alertas a Slack

```bash
# 1. Verificar secret de webhook
kubectl get secret alertmanager-slack-webhook -n futuratickets -o yaml

# 2. Ver logs de AlertManager
kubectl logs -l app=alertmanager -n futuratickets

# 3. Ver configuración de AlertManager
kubectl get configmap alertmanager-config -n futuratickets -o yaml

# 4. Probar webhook manualmente
curl -X POST YOUR_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test message from AlertManager"}'
```

### Problema: Grafana no muestra dashboards

```bash
# 1. Verificar ConfigMap
kubectl get configmap grafana-dashboards -n futuratickets -o yaml

# 2. Logs de Grafana
kubectl logs -l app=grafana -n futuratickets

# 3. Reiniciar Grafana
kubectl rollout restart deployment/grafana -n futuratickets
```

### Problema: Prometheus no encuentra targets

```bash
# 1. Ver configuración de Prometheus
kubectl get configmap prometheus-config -n futuratickets -o yaml

# 2. Verificar ServiceMonitors (si usas Prometheus Operator)
kubectl get servicemonitor -n futuratickets

# 3. Logs de Prometheus
kubectl logs -l app=prometheus -n futuratickets
```

---

## Mantenimiento

### Actualizar Configuración

```bash
# Modificar ConfigMap
kubectl edit configmap <name> -n futuratickets

# O aplicar archivo modificado
kubectl apply -f k8s/grafana/dashboard-configmap.yaml

# Reiniciar pod para cargar nueva configuración
kubectl rollout restart deployment/<name> -n futuratickets
```

### Backups

#### Grafana Dashboards

```bash
# Exportar todos los dashboards
kubectl exec -it <grafana-pod> -n futuratickets -- \
  grafana-cli admin export-dashboard --all > dashboards-backup.json
```

#### Prometheus Data

```bash
# Snapshot de volumen persistente (si está configurado)
kubectl get pvc -n futuratickets

# O usar Velero para backups completos
velero backup create monitoring-backup --include-namespaces futuratickets
```

#### AlertManager Config

```bash
# Backup de configuración
kubectl get configmap alertmanager-config -n futuratickets -o yaml \
  > alertmanager-config-backup.yaml
```

### Escalado

```bash
# Escalar Prometheus (más recursos para más métricas)
kubectl scale deployment prometheus -n futuratickets --replicas=2

# Escalar Grafana (alta disponibilidad)
kubectl scale deployment grafana -n futuratickets --replicas=2
```

### Actualización de Versiones

```bash
# Actualizar imagen de Grafana
kubectl set image deployment/grafana \
  grafana=grafana/grafana:11.1.0 \
  -n futuratickets

# Rollout con zero-downtime
kubectl rollout status deployment/grafana -n futuratickets

# Rollback si hay problemas
kubectl rollout undo deployment/grafana -n futuratickets
```

### Monitoreo del Monitoreo

```bash
# Recursos consumidos por el stack
kubectl top pods -n futuratickets

# Eventos recientes
kubectl get events -n futuratickets --sort-by='.lastTimestamp'

# Estado de salud
kubectl get pods -n futuratickets -o wide
```

---

## Recursos Adicionales

### Documentación

- **Grafana**: https://grafana.com/docs/
- **Prometheus**: https://prometheus.io/docs/
- **AlertManager**: https://prometheus.io/docs/alerting/latest/alertmanager/
- **Slack API**: https://api.slack.com/

### Scripts Útiles

Todos los scripts están en `/scripts`:

```bash
# Configuración
./scripts/configure-slack-webhook.sh

# Despliegue
./scripts/deploy-monitoring.sh
./scripts/deploy-production.sh

# Health checks
./scripts/health-check-all.sh
```

### Dashboards Incluidos

Los 11 dashboards creados cubren:

1. **System Overview** - Vista general del sistema
2. **Application Performance** - APM de aplicaciones
3. **API Gateway Metrics** - Métricas de API
4. **Database Performance** - MongoDB performance
5. **Business Metrics** - KPIs de negocio
6. **Payment Processing** - Monitoreo de pagos
7. **Error Tracking** - Tracking de errores
8. **User Activity** - Actividad de usuarios
9. **Infrastructure Health** - Salud de infraestructura
10. **Security Monitoring** - Eventos de seguridad
11. **Cost Optimization** - Optimización de costos

### Alertas Configuradas

Las 15 reglas de alertas cubren:

**Critical (5)**
- PodDown
- HighErrorRate
- DatabaseDown
- APIGatewayDown
- HighMemoryUsage

**Warning (7)**
- HighCPUUsage
- DiskSpaceLow
- SlowAPIResponse
- HighRequestLatency
- CertificateExpiringSoon
- DatabaseSlowQueries
- HighDatabaseConnections

**Business (3)**
- LowSalesConversion
- HighCartAbandonment
- PaymentFailureSpike

---

## Próximos Pasos

Una vez desplegado el stack de monitoreo:

1. ✅ **Configurar Métricas de Aplicación**
   - Instrumentar APIs con Prometheus client
   - Agregar custom metrics de negocio
   - Configurar distributed tracing

2. ✅ **Refinar Alertas**
   - Ajustar thresholds basado en métricas reales
   - Crear alertas específicas por servicio
   - Configurar escalado automático basado en métricas

3. ✅ **Dashboards Personalizados**
   - Crear dashboards por equipo
   - Dashboards de SLIs/SLOs
   - Business intelligence dashboards

4. ✅ **Integración CI/CD**
   - Deployment metrics
   - Test coverage trends
   - Build performance

5. ✅ **Log Aggregation** (futuro)
   - ELK Stack o Loki
   - Correlación logs-metrics-traces
   - Log-based alerting

---

**Preparado por:** Claude AI
**Fecha:** 2025-10-18
**Versión:** 1.0.0
**Estado:** Production Ready ✅
