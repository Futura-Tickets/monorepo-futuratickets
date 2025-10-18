# FuturaTickets Monorepo

> Sistema completo de venta y gestión de tickets con blockchain, pagos Stripe y control de acceso.

[![Test & Coverage](https://github.com/Futura-Tickets/monorepo-futuratickets/actions/workflows/test-coverage.yml/badge.svg)](https://github.com/Futura-Tickets/monorepo-futuratickets/actions/workflows/test-coverage.yml)
[![codecov](https://codecov.io/gh/Futura-Tickets/monorepo-futuratickets/branch/main/graph/badge.svg)](https://codecov.io/gh/Futura-Tickets/monorepo-futuratickets)

## 📊 Test Coverage

| API | Tests | Coverage | Status |
|-----|-------|----------|--------|
| **Admin API** | 58 | ~25% | [![codecov](https://codecov.io/gh/Futura-Tickets/monorepo-futuratickets/branch/main/graph/badge.svg?flag=admin-api)](https://codecov.io/gh/Futura-Tickets/monorepo-futuratickets?flags[]=admin-api) |
| **Marketplace API** | 100 | ~55% | [![codecov](https://codecov.io/gh/Futura-Tickets/monorepo-futuratickets/branch/main/graph/badge.svg?flag=marketplace-api)](https://codecov.io/gh/Futura-Tickets/monorepo-futuratickets?flags[]=marketplace-api) |
| **Access API** | 24 | ~40% | [![codecov](https://codecov.io/gh/Futura-Tickets/monorepo-futuratickets/branch/main/graph/badge.svg?flag=access-api)](https://codecov.io/gh/Futura-Tickets/monorepo-futuratickets?flags[]=access-api) |
| **TOTAL** | **182** | **~40%** | 🎯 Target: 70% |

> **Próximo paso**: Sigue la [Guía de Activación de Codecov](./docs/CODECOV_ACTIVATION_GUIDE.md) para completar la configuración (30 min).

## 🚀 Quick Start

```bash
# 1. Setup automático
./scripts/utilities/setup-dev-environment.sh

# 2. Configurar .env files (copiar .env.example)

# 3. Arrancar todo
./start-all.sh

# 4. Verificar
./scripts/utilities/smoke-tests.sh
```

## 📦 Servicios

| Servicio | Puerto | Stack | Descripción |
|----------|--------|-------|-------------|
| **Marketplace Web** | 3000 | Next.js 15 | Compra de tickets |
| **Admin Panel** | 3001 | Next.js | Gestión de eventos |
| **Admin API** | 3002 | NestJS | Backend administración |
| **Marketplace API** | 3004 | NestJS | Backend marketplace |
| **Access API** | 3005 | NestJS | Control de acceso |
| **Access Web** | 3007 | Next.js | App validación |
| **Ganache** | 8545 | Hardhat | Blockchain local |

## 🛠️ Scripts Útiles

```bash
# Monitoreo continuo
./scripts/utilities/continuous-health-check.sh

# Verificar .env
./scripts/utilities/check-env-vars.sh

# Tests de humo
./scripts/utilities/smoke-tests.sh

# Backup encriptado de .env
./scripts/utilities/backup-env-files.sh password

# Limpiar procesos
./scripts/utilities/cleanup-processes.sh
```

## 📚 Documentación

### General
- [Quick Start](./QUICK_START.md)
- [Dev Guide](./DEV_GUIDE.md) - Guía completa de desarrollo (15 páginas)
- [Scripts Reference](./SCRIPTS_REFERENCE.md) - Referencia de 16 scripts
- [Troubleshooting](./TROUBLESHOOTING.md) - Solución de problemas comunes
- [Changelog](./CHANGELOG.md) - Historial de cambios
- [Contributing](./CONTRIBUTING.md)

### Testing & Quality
- [Testing Audit](./TESTING_AUDIT.md) - Análisis completo de testing (800+ líneas)
- [Testing Summary](./PHASE_4_TESTING_SUMMARY.md) - Resumen de Phase 4 (182 tests)
- [Codecov Setup](./CODECOV_SETUP.md) - Referencia técnica de Codecov
- [Codecov Activation](./docs/CODECOV_ACTIVATION_GUIDE.md) - Guía paso a paso de activación (30 min)

## 🧪 Testing

### Quick Test Commands

```bash
# Run all tests with coverage
npm run test:cov

# Run specific API tests
cd futura-tickets-admin-api && npm test
cd futura-market-place-api && npm test
cd futura-access-api && npm test

# Watch mode (desarrollo)
npm run test:watch

# Smoke tests (servicios completos)
./scripts/utilities/smoke-tests.sh

# E2E tests (requiere servicios corriendo)
npm run test:e2e
```

### Coverage Reports

```bash
# Generar reporte de coverage local
npm run test:cov

# Ver reporte HTML
open coverage/lcov-report/index.html

# Coverage reports se suben automáticamente a Codecov en CI/CD
```

### Test Infrastructure

- **Jest**: Framework de testing principal
- **Supertest**: Testing de endpoints HTTP
- **MongoDB Memory Server**: Base de datos en memoria para tests
- **Codecov**: Tracking de coverage en CI/CD
- **GitHub Actions**: Ejecución automática de tests

Ver [TESTING_AUDIT.md](./TESTING_AUDIT.md) para detalles completos del testing strategy.
Ver [CODECOV_ACTIVATION_GUIDE.md](./docs/CODECOV_ACTIVATION_GUIDE.md) para activar Codecov paso a paso.

## 🔒 Seguridad

- ❌ **NUNCA** commitear archivos `.env`
- ❌ **NUNCA** commitear API keys o secrets
- ✅ Usar `.env.example` como template
- ✅ Pre-commit hooks automáticos
- ✅ CI/CD security scans

## 📋 Requisitos

- Node.js 18+
- npm 9+
- MongoDB Atlas o local
- Stripe account (test mode)
- Docker (opcional)

## 🏗️ Arquitectura

```
┌─────────────────────────────────────┐
│         Frontend Layer              │
│  Marketplace | Admin | Access       │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│          API Layer                  │
│  Admin API | Marketplace | Access   │
└──────────────┬──────────────────────┘
               │ Mongoose
┌──────────────▼──────────────────────┐
│        MongoDB Atlas                │
└─────────────────────────────────────┘
```

## 🤝 Contributing

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para workflow y guidelines.

## 📝 License

Propiet

ario - FuturaTickets © 2025

---

**Estado del Sistema**: ✅ 100% Operacional (7/7 servicios)

**Última actualización**: 2025-10-17
