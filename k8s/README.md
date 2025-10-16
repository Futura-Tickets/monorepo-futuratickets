# FuturaTickets - Kubernetes Deployment

Complete Kubernetes manifests for deploying the FuturaTickets platform.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  NGINX Ingress Controller                │
│  ┌────────────┬────────────────┬──────────────────┐    │
│  │ api.*.com  │ admin.*.com    │ futuratickets.com│    │
└──┴────────────┴────────────────┴──────────────────┴────┘
        │              │                    │
        ▼              ▼                    ▼
   ┌─────────┐   ┌─────────┐        ┌─────────────┐
   │   API   │   │  Admin  │        │ Marketplace │
   │ (3 pods)│   │ (2 pods)│        │  (2 pods)   │
   └─────────┘   └─────────┘        └─────────────┘
        │              │                    │
        └──────────────┴────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                              │
   ┌─────────┐                  ┌──────────┐
   │ MongoDB │                  │  Redis   │
   │(1 pod)  │                  │ (1 pod)  │
   └─────────┘                  └──────────┘
        │                              │
   ┌─────────┐                  ┌──────────┐
   │   PVC   │                  │   PVC    │
   │  20Gi   │                  │   5Gi    │
   └─────────┘                  └──────────┘
```

## Prerequisites

1. **Kubernetes Cluster** (v1.24+)
   - GKE, EKS, AKS, or any managed Kubernetes
   - `kubectl` configured to access your cluster

2. **NGINX Ingress Controller**
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   ```

3. **cert-manager** (for SSL/TLS certificates)
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

4. **Metrics Server** (for HPA)
   ```bash
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   ```

5. **Container Registry Access** (GitHub Container Registry)
   ```bash
   kubectl create secret docker-registry ghcr-secret \
     --namespace=futuratickets \
     --docker-server=ghcr.io \
     --docker-username=YOUR_GITHUB_USERNAME \
     --docker-password=YOUR_GITHUB_TOKEN \
     --docker-email=YOUR_EMAIL
   ```

## Directory Structure

```
k8s/
├── namespace.yml              # FuturaTickets namespace
├── README.md                  # This file
│
├── mongodb/                   # MongoDB database
│   ├── deployment.yml         # MongoDB deployment
│   ├── service.yml            # MongoDB service
│   ├── pvc.yml                # Persistent volume claim (20Gi)
│   └── secret.yml             # MongoDB credentials
│
├── redis/                     # Redis cache
│   ├── deployment.yml         # Redis deployment
│   ├── service.yml            # Redis service
│   ├── pvc.yml                # Persistent volume claim (5Gi)
│   └── secret.yml             # Redis password
│
├── api/                       # Backend API
│   ├── deployment.yml         # API deployment (3 replicas)
│   ├── service.yml            # API service
│   ├── secret.yml             # API secrets (env vars)
│   └── hpa.yml                # Horizontal Pod Autoscaler
│
├── admin/                     # Admin Panel
│   ├── deployment.yml         # Admin deployment (2 replicas)
│   ├── service.yml            # Admin service
│   └── secret.yml             # Admin secrets
│
├── marketplace/               # Marketplace Frontend
│   ├── deployment.yml         # Marketplace deployment (2 replicas)
│   └── service.yml            # Marketplace service
│
└── ingress/                   # Ingress & SSL
    ├── ingress.yml            # NGINX Ingress rules
    └── certificate.yml        # Let's Encrypt ClusterIssuer
```

## Deployment Steps

### 1. Create Namespace

```bash
kubectl apply -f namespace.yml
```

### 2. Update Secrets

**IMPORTANT**: Replace all `CHANGE_ME` values in secret files with production credentials.

```bash
# MongoDB credentials
kubectl create secret generic mongodb-secret \
  --namespace=futuratickets \
  --from-literal=username=admin \
  --from-literal=password=YOUR_STRONG_PASSWORD

# Redis password
kubectl create secret generic redis-secret \
  --namespace=futuratickets \
  --from-literal=password=YOUR_REDIS_PASSWORD

# API secrets
kubectl create secret generic api-secret \
  --namespace=futuratickets \
  --from-literal=mongo-url="mongodb://admin:YOUR_PASSWORD@mongodb:27017/futura-tickets?authSource=admin" \
  --from-literal=jwt-secret="YOUR_JWT_SECRET" \
  --from-literal=stripe-secret-key="sk_live_YOUR_KEY" \
  --from-literal=stripe-public-key="pk_live_YOUR_KEY" \
  --from-literal=stripe-webhook-secret="whsec_YOUR_SECRET" \
  --from-literal=azure-storage-connection="YOUR_AZURE_CONNECTION_STRING" \
  --from-literal=sentry-dsn="YOUR_SENTRY_DSN"

# Admin secrets
kubectl create secret generic admin-secret \
  --namespace=futuratickets \
  --from-literal=google-client-id="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

### 3. Deploy Database Layer

```bash
# MongoDB
kubectl apply -f mongodb/pvc.yml
kubectl apply -f mongodb/deployment.yml
kubectl apply -f mongodb/service.yml

# Redis
kubectl apply -f redis/pvc.yml
kubectl apply -f redis/deployment.yml
kubectl apply -f redis/service.yml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n futuratickets --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n futuratickets --timeout=300s
```

### 4. Deploy Application Layer

```bash
# API Backend
kubectl apply -f api/deployment.yml
kubectl apply -f api/service.yml
kubectl apply -f api/hpa.yml

# Admin Panel
kubectl apply -f admin/deployment.yml
kubectl apply -f admin/service.yml

# Marketplace
kubectl apply -f marketplace/deployment.yml
kubectl apply -f marketplace/service.yml

# Wait for apps to be ready
kubectl wait --for=condition=ready pod -l app=api -n futuratickets --timeout=300s
kubectl wait --for=condition=ready pod -l app=admin -n futuratickets --timeout=300s
kubectl wait --for=condition=ready pod -l app=marketplace -n futuratickets --timeout=300s
```

### 5. Deploy Ingress & SSL

```bash
# Create ClusterIssuer for Let's Encrypt
kubectl apply -f ingress/certificate.yml

# Create Ingress
kubectl apply -f ingress/ingress.yml

# Wait for certificate to be issued (may take 1-2 minutes)
kubectl get certificate -n futuratickets --watch
```

### 6. Verify Deployment

```bash
# Check all pods
kubectl get pods -n futuratickets

# Check services
kubectl get svc -n futuratickets

# Check ingress
kubectl get ingress -n futuratickets

# Check certificates
kubectl get certificate -n futuratickets

# Check HPA
kubectl get hpa -n futuratickets

# View logs
kubectl logs -f deployment/api -n futuratickets
kubectl logs -f deployment/admin -n futuratickets
kubectl logs -f deployment/marketplace -n futuratickets
```

## Update Image Versions

When GitHub Actions builds new images, update them:

```bash
# Update API
kubectl set image deployment/api \
  api=ghcr.io/OWNER/REPO-api:main-abc123 \
  -n futuratickets

# Update Admin
kubectl set image deployment/admin \
  admin=ghcr.io/OWNER/REPO-admin:main-abc123 \
  -n futuratickets

# Update Marketplace
kubectl set image deployment/marketplace \
  marketplace=ghcr.io/OWNER/REPO-marketplace:main-abc123 \
  -n futuratickets

# Or rollout restart to pull latest
kubectl rollout restart deployment/api -n futuratickets
kubectl rollout restart deployment/admin -n futuratickets
kubectl rollout restart deployment/marketplace -n futuratickets
```

## Scaling

### Manual Scaling

```bash
# Scale API to 5 replicas
kubectl scale deployment/api --replicas=5 -n futuratickets

# Scale Admin to 3 replicas
kubectl scale deployment/admin --replicas=3 -n futuratickets
```

### Auto-scaling (HPA)

The API has Horizontal Pod Autoscaler configured:
- Min: 3 replicas
- Max: 10 replicas
- Triggers: CPU > 70%, Memory > 80%

```bash
# Check HPA status
kubectl get hpa -n futuratickets

# Watch HPA in real-time
kubectl get hpa -n futuratickets --watch

# Edit HPA
kubectl edit hpa api-hpa -n futuratickets
```

## Monitoring

```bash
# Resource usage
kubectl top pods -n futuratickets
kubectl top nodes

# Describe pod for detailed info
kubectl describe pod <pod-name> -n futuratickets

# Get events
kubectl get events -n futuratickets --sort-by='.lastTimestamp'

# Port-forward for local access
kubectl port-forward svc/api 3000:3000 -n futuratickets
kubectl port-forward svc/admin 3001:3001 -n futuratickets
kubectl port-forward svc/marketplace 3002:3002 -n futuratickets
kubectl port-forward svc/mongodb 27017:27017 -n futuratickets
```

## Backup & Restore

### MongoDB Backup

```bash
# Create backup job
kubectl run mongodb-backup --image=mongo:7.0 \
  --namespace=futuratickets \
  --restart=Never \
  --command -- /bin/sh -c \
  "mongodump --host=mongodb --username=admin --password=YOUR_PASSWORD --authenticationDatabase=admin --out=/backup/$(date +%Y%m%d-%H%M%S)"

# Copy backup to local
kubectl cp futuratickets/mongodb-backup:/backup ./backup
```

### MongoDB Restore

```bash
# Copy backup to pod
kubectl cp ./backup futuratickets/mongodb-restore:/backup

# Restore
kubectl exec -it mongodb-restore -n futuratickets -- \
  mongorestore --host=mongodb --username=admin --password=YOUR_PASSWORD \
  --authenticationDatabase=admin /backup/20250101-120000
```

## Rollback

```bash
# View rollout history
kubectl rollout history deployment/api -n futuratickets

# Rollback to previous version
kubectl rollout undo deployment/api -n futuratickets

# Rollback to specific revision
kubectl rollout undo deployment/api --to-revision=2 -n futuratickets

# Check rollout status
kubectl rollout status deployment/api -n futuratickets
```

## Troubleshooting

### Pod CrashLoopBackOff

```bash
# Check logs
kubectl logs -f <pod-name> -n futuratickets --previous

# Describe pod for events
kubectl describe pod <pod-name> -n futuratickets

# Get pod YAML
kubectl get pod <pod-name> -n futuratickets -o yaml
```

### Database Connection Issues

```bash
# Test MongoDB connection
kubectl run mongodb-test --image=mongo:7.0 --rm -it \
  --namespace=futuratickets -- \
  mongosh mongodb://admin:PASSWORD@mongodb:27017/futura-tickets?authSource=admin

# Test Redis connection
kubectl run redis-test --image=redis:7-alpine --rm -it \
  --namespace=futuratickets -- \
  redis-cli -h redis -a PASSWORD ping
```

### Ingress Not Working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress events
kubectl describe ingress futuratickets-ingress -n futuratickets

# Check certificate status
kubectl describe certificate -n futuratickets

# Test DNS
nslookup api.futuratickets.com
```

### SSL Certificate Issues

```bash
# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Check certificate request
kubectl get certificaterequest -n futuratickets

# Check ACME challenge
kubectl get challenges -n futuratickets

# Delete and recreate certificate
kubectl delete certificate api-tls-cert -n futuratickets
kubectl delete secret api-tls-cert -n futuratickets
# Ingress will auto-request new certificate
```

## Clean Up

```bash
# Delete entire namespace (removes all resources)
kubectl delete namespace futuratickets

# Or delete resources individually
kubectl delete -f ingress/
kubectl delete -f api/
kubectl delete -f admin/
kubectl delete -f marketplace/
kubectl delete -f mongodb/
kubectl delete -f redis/
kubectl delete -f namespace.yml
```

## Production Checklist

- [ ] Update all `CHANGE_ME` values in secrets
- [ ] Update image references to your registry (`ghcr.io/OWNER/REPO`)
- [ ] Configure DNS to point to ingress load balancer IP
- [ ] Test SSL certificates with staging issuer first
- [ ] Configure PVC storage class for your cloud provider
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Set up log aggregation (ELK, Loki)
- [ ] Configure backup strategy for MongoDB
- [ ] Test disaster recovery procedures
- [ ] Configure resource limits based on load testing
- [ ] Set up alerts for critical metrics
- [ ] Document runbooks for common issues
- [ ] Set up CI/CD for automated deployments
- [ ] Configure network policies for security
- [ ] Enable pod security policies
- [ ] Set up RBAC for team access

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
