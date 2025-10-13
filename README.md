# 🎫 FuturaTickets - Ecosystem

> Plataforma completa de gestión y venta de tickets para eventos con tecnología blockchain (NFT Tickets), procesamiento de pagos (Stripe), sistema de reventa y control de acceso en tiempo real.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.25-363636)](https://soliditylang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## 📚 Documentación Principal

| Documento | Descripción |
|-----------|-------------|
| **[ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)** | Arquitectura completa del ecosistema (16 repositorios) |
| **[PLAN_DE_SPRINTS.md](./PLAN_DE_SPRINTS.md)** | Plan de desarrollo (14 sprints, 28 semanas) |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                     FUTURATICKETS ECOSYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

USUARIOS                    FRONTEND                    BACKEND
━━━━━━━                     ━━━━━━━━                    ━━━━━━━

Compradores ──────────► marketplace-v2 ──────────► marketplace-api
                        (Next.js 15)               (NestJS 10)
                                                        │
Promotores ───────────► tickets-admin ───────────► admin-api
                        (Next.js 15)               (NestJS 10)
                                                        │
Personal ACCESS ───────► access-app ─────────────► access-api
                        (Expo 52)                  (NestJS 11)
                                                        │
                                                        ▼
                                                   MongoDB Atlas
                                                   (Shared DB)

                        BLOCKCHAIN
                        ━━━━━━━━━━

                        contracts-v2
                        (Solidity 0.8.25)
                        ERC-721 NFT Tickets
```

---

## 📦 Repositorios

### Frontend Web (Next.js)

| Repositorio | Propósito | Tech Stack | Estado |
|-------------|-----------|------------|--------|
| **futura-market-place-v2** | Marketplace de tickets (compradores) | Next.js 15 + Radix UI + Tailwind | ✅ Activo |
| **futura-tickets-admin** | Panel de administración (promotores) | Next.js 15 + Ant Design | ✅ Activo |
| **futura-tickets-event** | Venta de evento único | Next.js 15 + Stripe | ✅ Activo |
| **futura-paginator** | Landing page institucional | Next.js 15 + Tailwind | ✅ Activo |
| ~~landingpage~~ | Landing page v1 | React 18 + CRA | ❌ Deprecado |
| ~~futura-tickets~~ | Marketplace v1 | React 18 + CRA | ❌ Deprecado |

### Apps Móviles (React Native)

| Repositorio | Propósito | Tech Stack | Estado |
|-------------|-----------|------------|--------|
| **futura-access-app** | Control de acceso (scanner QR) | Expo 52 + React Native 0.76 | ✅ Activo |
| **futura-tickets-access-app** | Control de acceso v2 | Expo 52 + React Native 0.76 | ✅ Activo |

### Backend APIs (NestJS)

| Repositorio | Propósito | Tech Stack | Puerto | Estado |
|-------------|-----------|------------|--------|--------|
| **futura-tickets-admin-api** | CRUD eventos, Analytics, CronJobs | NestJS 10 + MongoDB + Stripe | 3000 | ✅ Activo |
| **futura-market-place-api** | Pagos, Órdenes, Emails | NestJS 10 + MongoDB + Stripe | 3000 | ✅ Activo |
| **futura-access-api** | Validación tickets, Check-in | NestJS 11 + MongoDB + WebSocket | 3000 | ✅ Activo |
| **futura-tickets-rest-api** | API REST genérica | NestJS + MongoDB | 3000 | ⚠️ Verificar uso |

### Blockchain (Solidity)

| Repositorio | Propósito | Tech Stack | Estado |
|-------------|-----------|------------|--------|
| **futura-tickets-contracts-v2** | NFT Tickets ERC-721 + Factory Pattern | Solidity 0.8.25 + Hardhat | ⚠️ No integrado |
| **futura-tickets-smartcontracts** | Smart contracts legacy | Solidity | 🚧 Clarificar uso |

### Utilidades

| Repositorio | Propósito | Tech Stack | Estado |
|-------------|-----------|------------|--------|
| **integrations-scripts** | Scripts de migración, CSV parsing | TypeScript | ✅ Activo |

---

## 🚀 Quick Start

### Prerrequisitos

- Node.js 18+ / 20+
- npm / yarn / pnpm
- Docker (opcional)
- MongoDB (local o Atlas)
- Redis (para Bull queues)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/futuratickets/FuturaTickets_Full_Repo.git
cd FuturaTickets_Full_Repo

# Instalar dependencias de un proyecto específico
cd futura-market-place-v2
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

### Docker Compose (Desarrollo Local)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - React framework con App Router
- **React 19** - UI library
- **TypeScript 5** - Lenguaje tipado
- **Tailwind CSS** - CSS framework
- **Ant Design / Radix UI** - Component libraries
- **Stripe Elements** - Payment UI

### Backend
- **NestJS 10/11** - Node.js framework enterprise-grade
- **MongoDB + Mongoose** - Base de datos NoSQL
- **Stripe API** - Procesamiento de pagos
- **Bull + Redis** - Job queues
- **Socket.IO** - WebSockets en tiempo real
- **JWT + Passport** - Autenticación

### Blockchain
- **Solidity 0.8.25** - Smart contracts
- **Hardhat** - Development environment
- **OpenZeppelin** - Contract libraries (ERC-721)
- **ethers.js / viem** - Ethereum libraries

### DevOps
- **Docker** - Containerización
- **MongoDB Atlas** - Base de datos en cloud
- **Azure Blob Storage** - Almacenamiento de imágenes
- **Azure Web PubSub** - WebSocket escalable

---

## 📖 Funcionalidades Principales

### ✅ Para Compradores (Marketplace)
- Búsqueda y filtrado de eventos
- Compra de tickets con Stripe
- Sistema de reventa (mercado secundario)
- Transferencia de tickets
- Wallet de tickets con QR codes
- Integración Web3 (MetaMask)

### ✅ Para Promotores (Admin Panel)
- CRUD completo de eventos
- Gestión de tickets e inventario
- Analytics y estadísticas en tiempo real
- Gestión de clientes y ventas
- Campañas de marketing (promo codes, coupons)
- Sistema de notificaciones
- Gestión de pagos y comisiones

### ✅ Para Personal de Acceso (Mobile App)
- Validación de tickets mediante QR
- Check-in en tiempo real
- Modo offline con sincronización
- Historial de accesos
- Dashboard de accesos en vivo

### ✅ Blockchain (NFT Tickets)
- Tickets como NFTs ERC-721
- Factory Pattern (1 contrato por evento)
- Sistema de royalties en reventa
- Validación de ownership on-chain
- Metadata en IPFS

---

## 🔗 Flujo de Datos Principal

```
1. COMPRA
   Usuario → Marketplace Web → marketplace-api → Stripe Payment Intent
      ↓
   Pago exitoso → Webhook → admin-api → Crear Sales (tickets)
      ↓
   Generar QR codes → Email (Bull queue) → Usuario recibe tickets

2. CHECK-IN
   Personal ACCESS → Escanea QR → access-api → Validar ticket
      ↓
   OPEN → GRANTED (permitir acceso) → Update status CLOSED
      ↓
   WebSocket → Admin Panel (notificación en tiempo real)

3. REVENTA
   Usuario → Pone ticket en venta → marketplace-api
      ↓
   Comprador → Compra ticket reventa → Stripe → Webhook
      ↓
   Transfer ownership → Nuevo ticket para comprador
```

---

## 📊 Estado del Proyecto

| Aspecto | Estado | Comentario |
|---------|--------|------------|
| **Arquitectura** | ✅ Completa | Bien diseñada, modular, escalable |
| **Backend APIs** | ✅ Funcional | Operativas en producción |
| **Frontend Apps** | ✅ Funcional | Operativas en producción |
| **Blockchain** | ⚠️ Parcial | Contratos desarrollados, NO integrados |
| **Testing** | ❌ Pendiente | 0% coverage - PRIORITARIO |
| **CI/CD** | ❌ Pendiente | No configurado |
| **Documentación** | ✅ Completa | CLAUDE.md + ARCHITECTURE_OVERVIEW.md |
| **Seguridad** | ⚠️ Mejoras | CORS abierto, tokens en localStorage |

---

## 🚨 Issues Conocidos (Prioritarios)

### 🔴 Críticos (Seguridad)
- [ ] CORS completamente abierto en admin-api
- [ ] Tokens JWT en localStorage (vulnerable a XSS)
- [ ] Secrets hardcoded en código
- [ ] Password en emails en plaintext

### 🟡 Altos (Funcionalidad)
- [ ] CronJob de expiración de eventos deshabilitado
- [ ] Integración blockchain NO activa (ethers/viem instalados pero no usados)
- [ ] Archivos enormes (+35k líneas en admin-event.service.ts)
- [ ] 0% test coverage en todos los repositorios

### 🟢 Medios (Mejoras)
- [ ] Swagger no configurado en APIs
- [ ] Health checks no implementados
- [ ] Logging estructurado no implementado
- [ ] Caching con Redis no implementado

Ver [Recomendaciones Técnicas](./ARCHITECTURE_OVERVIEW.md#8-recomendaciones-técnicas) completas.

---

## 🗓️ Roadmap

| Fase | Duración | Objetivos |
|------|----------|-----------|
| **Fase 1: Seguridad** | 2-3 semanas | CORS, httpOnly cookies, secrets en env |
| **Fase 2: Blockchain** | 3-4 semanas | Integración activa de contratos NFT |
| **Fase 3: Refactoring** | 3-4 semanas | Dividir archivos grandes, optimizar código |
| **Fase 4: DevOps** | 2 semanas | CI/CD, monitoreo, health checks |

**Total estimado:** 10-13 semanas con 2-3 developers

Ver [PLAN_DE_SPRINTS.md](./PLAN_DE_SPRINTS.md) completo.

---

## 🤝 Contribuir

Por favor lee [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

### Workflow de Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, punto y coma faltante, etc.
refactor: refactorización de código
test: agregar tests
chore: actualizar dependencias, etc.
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 👥 Equipo

🚧 TODO: Agregar contactos del equipo

---

## 📞 Soporte

- **Documentación:** [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
- **Issues:** [GitHub Issues](https://github.com/futuratickets/FuturaTickets_Full_Repo/issues)
- **Email:** support@futuratickets.com

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [Stripe](https://stripe.com/)
- [OpenZeppelin](https://openzeppelin.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

**Última actualización:** 2025-10-13

**Versión:** 1.0.0
