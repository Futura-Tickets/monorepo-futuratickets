# 🐳 FuturaTickets - Docker Compose Local Development

Complete local development environment for the FuturaTickets ecosystem.

## 📋 Services Included

### Backend APIs (NestJS)
- **admin-api** (Port 3001) - Event management, analytics
- **marketplace-api** (Port 3002) - Payments, orders, emails
- **access-api** (Port 3004) - Ticket validation, check-in

### Frontend Apps (Next.js 15)
- **marketplace-web** (Port 3000) - Public marketplace
- **admin-web** (Port 3003) - Admin panel

### Infrastructure
- **MongoDB** (Port 27017) - Database
- **Redis** (Port 6379) - Cache & queues
- **MinIO** (Ports 9000, 9001) - Local S3 storage
- **Mongo Express** (Port 8081) - DB admin UI

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose V2
- 8GB RAM minimum
- 10GB free disk space

### Start All Services

```bash
# Clone and navigate to monorepo
cd monorepo-futuratickets

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Start Individual Services

```bash
# Start only infrastructure
docker-compose up -d mongodb redis minio

# Start only backend APIs
docker-compose up -d admin-api marketplace-api access-api

# Start only frontends
docker-compose up -d marketplace-web admin-web
```

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Marketplace Web** | http://localhost:3000 | - |
| **Admin Panel** | http://localhost:3003 | - |
| **Admin API** | http://localhost:3001 | JWT token required |
| **Marketplace API** | http://localhost:3002 | JWT token required |
| **Access API** | http://localhost:3004 | JWT token required |
| **Mongo Express** | http://localhost:8081 | admin / admin123 |
| **MinIO Console** | http://localhost:9001 | futuraadmin / futurapass123 |
| **MinIO S3** | http://localhost:9000 | futuraadmin / futurapass123 |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLIC_KEY=pk_test_your_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
```

### MongoDB Connection

From your local machine:
```
mongodb://futuraadmin:futurapass123@localhost:27017/futuratickets?authSource=admin
```

From Docker containers:
```
mongodb://futuraadmin:futurapass123@mongodb:27017/futuratickets?authSource=admin
```

### Redis Connection

From your local machine:
```
redis://localhost:6379
Password: futurapass123
```

From Docker containers:
```
redis://redis:6379
Password: futurapass123
```

## 📊 Development Workflow

### 1. Initial Setup

```bash
# Start infrastructure
docker-compose up -d mongodb redis minio

# Wait for services to be healthy
docker-compose ps

# Initialize MinIO bucket
docker exec -it futura-minio mc alias set local http://localhost:9000 futuraadmin futurapass123
docker exec -it futura-minio mc mb local/images
docker exec -it futura-minio mc anonymous set public local/images
```

### 2. Start Development

```bash
# Start all services
docker-compose up -d

# Watch logs
docker-compose logs -f marketplace-web admin-web
```

### 3. Rebuild After Changes

```bash
# Rebuild specific service
docker-compose up -d --build admin-api

# Rebuild all services
docker-compose up -d --build
```

### 4. Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes
docker volume rm monorepo-futuratickets_mongodb_data

# Start fresh
docker-compose up -d
```

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check service status
docker-compose ps

# View logs for specific service
docker-compose logs admin-api

# Restart specific service
docker-compose restart admin-api
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3005:3000"  # Use port 3005 instead
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Test connection
docker exec -it futura-mongodb mongosh -u futuraadmin -p futurapass123 --authenticationDatabase admin

# View MongoDB logs
docker-compose logs mongodb
```

### Hot Reload Not Working

```bash
# Ensure volumes are correctly mounted
docker-compose config

# Restart with rebuild
docker-compose up -d --build marketplace-web
```

## 📦 Data Persistence

All data is persisted in Docker volumes:

- `mongodb_data` - MongoDB database
- `redis_data` - Redis cache
- `minio_data` - File storage

### Backup Data

```bash
# Backup MongoDB
docker exec futura-mongodb mongodump --out=/backup
docker cp futura-mongodb:/backup ./backup

# Backup MinIO
docker exec futura-minio mc mirror local/images ./minio-backup
```

### Restore Data

```bash
# Restore MongoDB
docker cp ./backup futura-mongodb:/backup
docker exec futura-mongodb mongorestore /backup

# Restore MinIO
docker exec futura-minio mc mirror ./minio-backup local/images
```

## 🔒 Security Notes

⚠️ **This is a DEVELOPMENT environment only!**

- Default credentials are NOT secure
- CORS is open to localhost
- SSL/TLS is disabled
- Secrets are in plaintext

**Never use these settings in production!**

## 🧪 Testing

### API Testing

```bash
# Test admin-api health
curl http://localhost:3001/health

# Test marketplace-api
curl http://localhost:3002/api/events

# Test access-api
curl http://localhost:3004/health
```

### Frontend Testing

```bash
# Open marketplace
open http://localhost:3000

# Open admin panel
open http://localhost:3003
```

## 🎯 Next Steps

1. **Setup Stripe**: Add your Stripe test keys to `.env`
2. **Seed Data**: Create test events in admin panel
3. **Test Checkout**: Try buying tickets in marketplace
4. **Test Access Control**: Validate tickets via access-api

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker](https://hub.docker.com/_/mongo)
- [Redis Docker](https://hub.docker.com/_/redis)
- [MinIO Documentation](https://min.io/docs/minio/container/index.html)

## 🆘 Getting Help

If you encounter issues:

1. Check service logs: `docker-compose logs <service-name>`
2. Verify network: `docker network inspect monorepo-futuratickets_futura-network`
3. Check volumes: `docker volume ls`
4. Restart services: `docker-compose restart`
5. Full reset: `docker-compose down -v && docker-compose up -d`

---

**Happy Coding! 🚀**
