# Quick Start - FuturaTickets Monorepo

## Requisitos Previos

- Node.js 18+
- npm 9+
- MongoDB Atlas account (o MongoDB local)
- Stripe account (test mode)

## Setup Rápido

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd monorepo-futuratickets
./scripts/utilities/setup-dev-environment.sh
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` en cada servicio y configurar:

```bash
# En cada directorio de servicio
cp .env.example .env
```

Variables críticas:
- `MONGO_URL`: Connection string de MongoDB
- `JWT_SECRET`: Secret para tokens JWT
- `STRIPE_*`: Keys de Stripe
- `PORT`: Puerto del servicio

### 3. Arrancar todos los servicios

```bash
./start-all.sh
```

Esto arranca:
- 3 APIs backend (puertos 3002, 3004, 3005)
- 3 frontends (puertos 3000, 3001, 3007)
- Ganache blockchain (puerto 8545)

### 4. Verificar que todo funciona

```bash
./scripts/utilities/smoke-tests.sh
```

Debería mostrar 9/10 o 10/10 tests pasando.

## URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Marketplace** | http://localhost:3000 | Compra de tickets |
| **Admin Panel** | http://localhost:3001 | Gestión de eventos |
| **Admin API** | http://localhost:3002 | API de administración |
| **Marketplace API** | http://localhost:3004 | API de marketplace |
| **Access API** | http://localhost:3005 | API de control de acceso |
| **Access Web** | http://localhost:3007 | App de validación |
| **Ganache** | http://localhost:8545 | Blockchain local |

## Swagger Docs

- Admin API: http://localhost:3002/api/docs
- Access API: http://localhost:3005/api/docs

## Scripts Útiles

```bash
# Verificar servicios continuamente
./scripts/utilities/continuous-health-check.sh

# Verificar variables .env
./scripts/utilities/check-env-vars.sh

# Limpiar procesos duplicados
./scripts/utilities/cleanup-processes.sh

# Detener todos los servicios
./stop-all.sh
```

## Troubleshooting

### Puerto ocupado

```bash
# Buscar proceso usando puerto
lsof -ti:3000

# Matar proceso
kill $(lsof -ti:3000)
```

### Dependencias rotas

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### MongoDB no conecta

Verificar que `MONGO_URL` en `.env` sea correcto y que MongoDB esté corriendo.

## Próximos Pasos

1. Lee la documentación en `/docs`
2. Revisa la arquitectura en `/docs/architecture`
3. Consulta troubleshooting en `/docs/troubleshooting`

---

**Última actualización**: 2025-10-17
