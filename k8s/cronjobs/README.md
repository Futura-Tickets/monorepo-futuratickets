# Kubernetes CronJobs

Este directorio contiene los CronJobs de Kubernetes para tareas programadas.

## MongoDB Backup CronJob

Backup automático diario de MongoDB.

### Archivos

- `mongodb-backup-pvc.yml` - PersistentVolumeClaim de 20Gi para almacenar backups
- `mongodb-backup-cronjob.yml` - CronJob que ejecuta backups diarios

### Características

- **Schedule**: Diario a las 2 AM UTC (`0 2 * * *`)
- **Retention**: Mantiene los últimos 30 días de backups
- **Storage**: 20Gi de almacenamiento persistente
- **Compression**: Backups comprimidos con gzip
- **Cleanup**: Elimina automáticamente backups mayores a 30 días

### Deployment

```bash
# Deploy PVC
kubectl apply -f k8s/cronjobs/mongodb-backup-pvc.yml

# Deploy CronJob
kubectl apply -f k8s/cronjobs/mongodb-backup-cronjob.yml
```

### Verificar Estado

```bash
# Ver CronJobs
kubectl get cronjobs -n futuratickets

# Ver jobs ejecutados
kubectl get jobs -n futuratickets

# Ver logs del último backup
kubectl logs -l app=mongodb-backup -n futuratickets --tail=100
```

### Ejecutar Backup Manual

```bash
# Crear un job manual desde el cronjob
kubectl create job --from=cronjob/mongodb-backup manual-backup-$(date +%Y%m%d-%H%M%S) -n futuratickets

# Ver progreso
kubectl logs -f job/manual-backup-YYYYMMDD-HHMMSS -n futuratickets
```

### Restaurar Backup

```bash
# 1. Port forward al MongoDB pod
kubectl port-forward svc/mongodb 27017:27017 -n futuratickets

# 2. Copiar backup desde el PVC a local (en otra terminal)
kubectl cp futuratickets/mongodb-backup-pod:/backup/20250116-020000 ./restore-backup

# 3. Restaurar usando mongorestore
mongorestore --host=localhost --port=27017 \
  --username=admin \
  --password=YOUR_PASSWORD \
  --authenticationDatabase=admin \
  --gzip \
  ./restore-backup

# Para obtener un backup desde el PVC, primero crea un pod temporal:
kubectl run mongodb-backup-viewer --image=mongo:7.0 \
  --command -- sleep infinity \
  -n futuratickets

# Luego copia el backup
kubectl cp futuratickets/mongodb-backup-viewer:/backup/BACKUP_DIR ./local-backup
```

### Troubleshooting

#### Ver backups disponibles

```bash
# Crear un pod temporal para ver los backups
kubectl run mongodb-backup-viewer --image=mongo:7.0 \
  --overrides='
{
  "spec": {
    "containers": [{
      "name": "viewer",
      "image": "mongo:7.0",
      "command": ["sleep", "infinity"],
      "volumeMounts": [{
        "name": "backup-storage",
        "mountPath": "/backup"
      }]
    }],
    "volumes": [{
      "name": "backup-storage",
      "persistentVolumeClaim": {
        "claimName": "mongodb-backup-pvc"
      }
    }]
  }
}' \
  -n futuratickets

# Listar backups
kubectl exec -it mongodb-backup-viewer -n futuratickets -- ls -lh /backup/

# Eliminar pod temporal
kubectl delete pod mongodb-backup-viewer -n futuratickets
```

#### CronJob no ejecuta

```bash
# Ver detalles del cronjob
kubectl describe cronjob/mongodb-backup -n futuratickets

# Ver eventos
kubectl get events -n futuratickets --sort-by='.lastTimestamp' | grep mongodb-backup
```

#### Job falla

```bash
# Ver logs del job fallido
kubectl get jobs -n futuratickets | grep mongodb-backup
kubectl logs job/mongodb-backup-XXXXXXXX -n futuratickets

# Ver detalles del job
kubectl describe job/mongodb-backup-XXXXXXXX -n futuratickets
```

### Configuración Avanzada

#### Cambiar frecuencia de backup

Edita el campo `schedule` en `mongodb-backup-cronjob.yml`:

```yaml
spec:
  # Ejemplos de schedules
  schedule: "0 2 * * *"     # Diario a las 2 AM
  schedule: "0 */6 * * *"   # Cada 6 horas
  schedule: "0 2 * * 0"     # Semanal (Domingos a las 2 AM)
  schedule: "0 2 1 * *"     # Mensual (día 1 a las 2 AM)
```

#### Cambiar retention

Edita la línea de cleanup en el comando del CronJob:

```bash
# Mantener últimos 30 días (actual)
find /backup -maxdepth 1 -type d -name "[0-9]*" -mtime +30 -exec rm -rf {} \;

# Mantener últimos 7 días
find /backup -maxdepth 1 -type d -name "[0-9]*" -mtime +7 -exec rm -rf {} \;

# Mantener últimos 90 días
find /backup -maxdepth 1 -type d -name "[0-9]*" -mtime +90 -exec rm -rf {} \;
```

#### Aumentar storage

Edita `mongodb-backup-pvc.yml`:

```yaml
spec:
  resources:
    requests:
      storage: 50Gi  # Incrementar de 20Gi a 50Gi
```

Luego aplica el cambio (nota: algunos proveedores de cloud permiten expandir PVCs sin downtime):

```bash
kubectl apply -f k8s/cronjobs/mongodb-backup-pvc.yml
```

### Monitoring

#### Crear alerta en Prometheus

Añade esta regla a `k8s/prometheus/configmap.yml`:

```yaml
- alert: MongoDBBackupFailed
  expr: kube_job_status_failed{job_name=~"mongodb-backup-.*"} > 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "MongoDB backup failed"
    description: "MongoDB backup job {{ $labels.job_name }} has failed."

- alert: MongoDBBackupMissing
  expr: time() - kube_cronjob_status_last_schedule_time{cronjob="mongodb-backup"} > 90000
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "MongoDB backup not running"
    description: "MongoDB backup hasn't run in the last 25 hours."
```

## Futuros CronJobs

Otros CronJobs que podrían ser útiles:

- **Redis Backup**: Backup de Redis (RDB snapshots)
- **Database Cleanup**: Eliminar datos antiguos (logs, sessions)
- **Certificate Renewal**: Renovar certificados SSL si no usas cert-manager
- **Report Generation**: Generar reportes periódicos
- **Data Sync**: Sincronizar datos con sistemas externos
