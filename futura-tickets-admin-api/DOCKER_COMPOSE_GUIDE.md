# 🐳 Guía de Docker Compose

Esta guía explica cómo usar Docker Compose para levantar toda la infraestructura local de desarrollo.

## 📦 Servicios Incluidos

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **MongoDB** | 27017 | Base de datos principal |
| **Redis** | 6379 | Cache y colas (Bull) |
| **Mailhog** | 1025 (SMTP), 8025 (UI) | Testing de emails |
| **Admin API** | 3004 | API de administración |

## 🚀 Inicio Rápido

### 1. Iniciar todos los servicios

```bash
docker-compose up -d
```

Esto levantará:
- ✅ MongoDB (con usuario admin/futurapass123)
- ✅ Redis (para Bull queues)
- ✅ Mailhog (para testing de emails)
- ✅ Admin API (en modo desarrollo)

### 2. Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio específico
docker-compose logs -f admin-api
docker-compose logs -f mongodb
docker-compose logs -f redis
```

### 3. Verificar estado

```bash
docker-compose ps
```

### 4. Detener servicios

```bash
# Detener pero mantener volúmenes (datos persisten)
docker-compose down

# Detener y eliminar volúmenes (datos se borran)
docker-compose down -v
```

## 🔧 Configuración

### Variables de Entorno

Puedes crear un archivo `.env.docker` para sobrescribir variables:

```bash
# .env.docker
STRIPE_PUBLIC_KEY=pk_test_tu_key_real
STRIPE_SECRET_KEY=sk_test_tu_key_real
GCS_PROJECT_ID=tu-proyecto-gcp
```

Luego ejecutar:
```bash
docker-compose --env-file .env.docker up -d
```

### Conexión a MongoDB desde fuera de Docker

```bash
# Connection string
mongodb://admin:futurapass123@localhost:27017/futuratickets?authSource=admin

# Usando mongosh
mongosh "mongodb://admin:futurapass123@localhost:27017/futuratickets?authSource=admin"
```

### Acceder a Mailhog UI

Abre en tu navegador: http://localhost:8025

Aquí verás todos los emails que la aplicación envíe.

## 📊 Volúmenes Persistentes

Los datos se guardan en volúmenes Docker:
- `mongodb_data` - Datos de MongoDB
- `mongodb_config` - Configuración de MongoDB
- `redis_data` - Datos de Redis

Para limpiar todos los datos:
```bash
docker-compose down -v
```

## 🛠️ Comandos Útiles

### Reiniciar un servicio específico

```bash
docker-compose restart admin-api
```

### Reconstruir la imagen del API

```bash
docker-compose build admin-api
docker-compose up -d admin-api
```

### Ejecutar comando dentro del contenedor

```bash
# Entrar a bash del API
docker-compose exec admin-api sh

# Ejecutar npm install
docker-compose exec admin-api npm install

# Ejecutar tests
docker-compose exec admin-api npm test
```

### Ver uso de recursos

```bash
docker stats
```

## 🔍 Troubleshooting

### El API no arranca

```bash
# Ver logs detallados
docker-compose logs admin-api

# Verificar que MongoDB y Redis están saludables
docker-compose ps
```

### MongoDB no acepta conexiones

```bash
# Verificar health check
docker-compose ps mongodb

# Ver logs de MongoDB
docker-compose logs mongodb

# Reiniciar MongoDB
docker-compose restart mongodb
```

### Limpiar todo y empezar de cero

```bash
# Detener y eliminar contenedores, redes, volúmenes
docker-compose down -v

# Eliminar imágenes construidas
docker rmi futura-admin-api

# Levantar de nuevo
docker-compose up -d --build
```

## 🎯 Flujo de Trabajo Recomendado

### Desarrollo Local con Hot Reload

El servicio `admin-api` está configurado con volúmenes para hot reload:

```yaml
volumes:
  - .:/app              # Sincroniza código fuente
  - /app/node_modules   # node_modules del contenedor
```

**Flujo:**
1. Haz cambios en el código
2. El API se reinicia automáticamente (nodemon)
3. Ver logs: `docker-compose logs -f admin-api`

### Testing de Emails

1. Ejecuta cualquier flujo que envíe email
2. Ve a http://localhost:8025
3. Verás el email en la interfaz de Mailhog

### Ejecutar Migraciones

```bash
docker-compose exec admin-api npm run migration:run
```

## 🚀 Optimizaciones de Producción

Para producción, modifica el `docker-compose.yml`:

1. Cambiar `target: development` a `target: production`
2. Usar variables de entorno reales
3. Eliminar volúmenes de código fuente
4. Usar secrets de Docker para credenciales
5. Configurar restart policies

```yaml
# docker-compose.prod.yml
services:
  admin-api:
    build:
      target: production
    restart: always
    environment:
      NODE_ENV: production
      MONGO_URL: ${MONGO_URL}  # Desde variables de entorno
```

## 📝 Notas Importantes

- **Health Checks**: Todos los servicios tienen health checks configurados
- **Depends On**: El API espera a que MongoDB y Redis estén saludables
- **Redes**: Todos los servicios están en la red `futura-network`
- **Persistencia**: Los datos persisten entre reinicios (volúmenes)

## 🔗 Integraciones Externas

Algunos servicios necesitan configuración externa:

### Google Cloud Storage
```bash
# Montar el archivo de credenciales
volumes:
  - ./config/gcs-service-account-key.json:/app/config/gcs-service-account-key.json
```

### Stripe Webhooks
Para probar webhooks localmente, usa Stripe CLI:
```bash
stripe listen --forward-to localhost:3004/admin/events/webhook
```

## ✅ Checklist de Setup

- [ ] Docker y Docker Compose instalados
- [ ] Archivo `.env` configurado (opcional)
- [ ] Puerto 3004, 27017, 6379, 8025 disponibles
- [ ] Ejecutar `docker-compose up -d`
- [ ] Verificar con `docker-compose ps`
- [ ] Acceder a http://localhost:3004
- [ ] Ver Swagger en http://localhost:3004/api/docs
- [ ] Ver Mailhog en http://localhost:8025

## 🆘 Ayuda

Si tienes problemas, revisa:
1. Logs: `docker-compose logs`
2. Estado: `docker-compose ps`
3. Salud: `docker inspect <container-name>`
4. Recursos: `docker stats`

Para más ayuda, consulta la documentación oficial de Docker Compose:
https://docs.docker.com/compose/
