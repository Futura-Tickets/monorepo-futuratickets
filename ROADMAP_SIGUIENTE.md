# 🚀 ROADMAP - PRÓXIMOS PASOS FUTURA TICKETS

**Fecha**: 15 de Octubre 2025
**Estado Actual**: Sistema funcional en desarrollo local
**Versión**: 1.0.0-dev

---

## ✅ ESTADO ACTUAL - CONFIRMADO Y FUNCIONANDO

### **Servicios Activos**

| Servicio | Puerto | Estado | Health Check |
|----------|--------|--------|--------------|
| **Admin API** | 3001 | ✅ Running | http://localhost:3001/health |
| **Admin Panel** | 3003 | ✅ Running | http://localhost:3003 |
| **Marketplace** | 3000 | ✅ Running | http://localhost:3000 |
| **Redis** | 6379 | ✅ Connected | v8.2.2 |
| **MongoDB Atlas** | - | ✅ Connected | futura-prod |

### **Funcionalidades Testeadas**

- ✅ Admin API health endpoint
- ✅ Admin API info endpoint (sistema, memoria, CPU, Redis)
- ✅ Login de usuario ADMIN (admin@futuratickets.com)
- ✅ Login de usuario PROMOTER (promotor@futuratickets.com)
- ✅ Login de usuario CLIENT (cliente@futuratickets.com)
- ✅ Admin Panel API Route proxy funcionando
- ✅ Marketplace página principal accesible
- ✅ JWT tokens generándose correctamente (289 caracteres)
- ✅ Error handling y mensajes visibles en UI

### **Usuarios Disponibles**

```
ADMIN:    admin@futuratickets.com / admin2025
PROMOTER: promotor@futuratickets.com / promoter2025
CLIENT:   cliente@futuratickets.com / cliente2025
```

---

## 🎯 PRIORIDAD 1 - CRÍTICO (SIGUIENTE SEMANA)

### **1.1 Seguridad y Producción**

#### **Mover tokens a httpOnly cookies**
- **Actual**: Tokens en localStorage (vulnerable a XSS)
- **Objetivo**: Cookies httpOnly + sameSite=strict
- **Archivos a modificar**:
  - `futura-tickets-admin/shared/services.tsx`
  - `futura-tickets-admin/components/Login/Login.tsx`
  - `futura-tickets-admin-api/src/Auth/jwt.strategy.ts`
- **Tiempo estimado**: 4 horas

#### **Habilitar CORS whitelist**
- **Actual**: `app.enableCors()` permite cualquier origen
- **Objetivo**: Lista blanca de dominios permitidos
- **Archivo**: `futura-tickets-admin-api/src/main.ts` (líneas 15-26 ya existen, solo descomentar)
- **Dominios a permitir**:
  ```typescript
  const whitelist = [
    'http://localhost:3000',  // Marketplace
    'http://localhost:3003',  // Admin Panel
    'https://admin.futuratickets.com',
    'https://marketplace.futuratickets.com'
  ];
  ```
- **Tiempo estimado**: 1 hora

#### **Activar CronJob de expiración de eventos**
- **Actual**: Línea comentada en `cron-jobs.service.ts:31`
- **Objetivo**: Eventos se cierren automáticamente al finalizar
- **Archivo**: `futura-tickets-admin-api/src/CronJobs/cron-jobs.service.ts`
- **Descomentar**: `await this.checkEventExpireDate(event._id, event.dateTime.endDate);`
- **Tiempo estimado**: 30 minutos

#### **Variables de entorno seguras**
- **Crear**: `.env.example` en cada proyecto
- **Validar**: Que todas las variables necesarias estén configuradas
- **Documentar**: README con variables obligatorias
- **Implementar**: Validación en startup (fail-fast si faltan vars críticas)
- **Tiempo estimado**: 2 horas

---

## 🎯 PRIORIDAD 2 - ALTO (PRÓXIMAS 2 SEMANAS)

### **2.1 Testing y Calidad**

#### **Implementar tests unitarios básicos**
- **Framework**: Jest + React Testing Library
- **Cobertura mínima**: 60%
- **Módulos a testear**:
  - `Login.tsx` (formulario, validación, errores)
  - `services.tsx` (loginAccount, API calls)
  - `account.service.ts` (backend login, JWT)
- **Comandos a agregar**:
  ```json
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
  ```
- **Tiempo estimado**: 16 horas (2 días)

#### **Implementar tests E2E**
- **Framework**: Playwright o Cypress
- **Escenarios críticos**:
  1. Login completo (admin, promoter, cliente)
  2. Crear evento (como PROMOTER)
  3. Comprar ticket (como CLIENTE)
  4. Ver analytics (como ADMIN)
- **Tiempo estimado**: 12 horas

#### **Error Boundaries en React**
- **Implementar**: Error boundaries en páginas críticas
- **Agregar**: Logging de errores (Sentry)
- **Páginas**: `/events`, `/events/create`, `/payments`, `/analytics`
- **Tiempo estimado**: 4 horas

---

### **2.2 Refactoring y Arquitectura**

#### **Dividir `services.tsx` (28,142 líneas)**
- **Estructura propuesta**:
  ```
  services/
  ├── auth.service.ts       (login, register, token)
  ├── events.service.ts     (CRUD eventos)
  ├── sales.service.ts      (ventas, tickets)
  ├── orders.service.ts     (órdenes)
  ├── payments.service.ts   (pagos, withdrawals)
  ├── analytics.service.ts  (estadísticas)
  ├── clients.service.ts    (clientes)
  └── index.ts              (exports centralizados)
  ```
- **Ventajas**: Mantenibilidad, tree-shaking, separación de responsabilidades
- **Tiempo estimado**: 8 horas

#### **Dividir `interfaces.tsx` (9,690 líneas)**
- **Estructura propuesta**:
  ```
  interfaces/
  ├── auth.interface.ts
  ├── event.interface.ts
  ├── sale.interface.ts
  ├── order.interface.ts
  ├── payment.interface.ts
  └── index.ts
  ```
- **Tiempo estimado**: 4 horas

#### **Refactorizar `admin-event.service.ts` (35,424 líneas)**
- **Dividir en**:
  - `event.service.ts` (lógica core)
  - `event-tickets.service.ts` (gestión tickets/lotes)
  - `event-resale.service.ts` (lógica reventa)
  - `event-analytics.service.ts` (estadísticas)
- **Tiempo estimado**: 16 horas (2 días)

---

### **2.3 Validación y Experiencia de Usuario**

#### **Implementar validación de formularios**
- **Librería**: Zod + React Hook Form
- **Formularios a validar**:
  1. Login (`email`, `password`)
  2. Register (`email`, `password`, `confirmPassword`, `name`, `lastName`)
  3. Create Event (validación completa de todos los campos)
  4. Payment Request (amount, method)
- **Ejemplo**:
  ```typescript
  const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres')
  });
  ```
- **Tiempo estimado**: 8 horas

#### **Mejorar mensajes de error**
- **Implementar**: Toast notifications (ya hay Sonner en Marketplace)
- **Agregar**: Error codes específicos desde backend
- **Internacionalizar**: ES/EN
- **Tiempo estimado**: 4 horas

---

## 🎯 PRIORIDAD 3 - MEDIO (PRÓXIMO MES)

### **3.1 Documentación**

#### **Actualizar READMEs**
- **Admin Panel README** (actualmente genérico de Next.js)
  - Descripción del proyecto
  - Requisitos (Node 18+, MongoDB, Redis)
  - Variables de entorno
  - Instalación y setup
  - Scripts disponibles
  - Arquitectura de carpetas
  - Guía de contribución
- **Admin API README** (actualmente genérico de NestJS)
  - Endpoints principales
  - Autenticación JWT
  - Rate limiting
  - CronJobs configurados
  - Integración Stripe
- **Tiempo estimado**: 6 horas

#### **Documentar APIs con Swagger**
- **Admin API**: Ya tiene Swagger en http://localhost:3001/api/docs
- **Mejorar**: Agregar ejemplos de request/response
- **Agregar**: Decoradores `@ApiOperation`, `@ApiResponse` en todos los endpoints
- **Tiempo estimado**: 8 horas

#### **Crear guías de despliegue**
- **Docker Compose**: Para desarrollo local completo
- **AWS/Azure**: Guía de deployment a producción
- **CI/CD**: GitHub Actions para tests + deploy automático
- **Tiempo estimado**: 12 horas

---

### **3.2 Performance y Optimización**

#### **Code splitting en Admin Panel**
- **Implementar**: Lazy loading de componentes pesados
  ```typescript
  const Analytics = lazy(() => import('@/components/Analytics'));
  const Events = lazy(() => import('@/components/Events'));
  ```
- **Resultado esperado**: Reducir bundle inicial de ~2MB a <500KB
- **Tiempo estimado**: 4 horas

#### **Optimizar imágenes**
- **Cambiar**: `<img>` por `<Image>` de Next.js
- **Configurar**: Image optimization en `next.config.ts`
- **Agregar**: Lazy loading en event cards
- **Tiempo estimado**: 4 horas

#### **Implementar caché en Redis**
- **Cachear**:
  - Lista de eventos (TTL: 5 min)
  - Analytics de promotor (TTL: 15 min)
  - Ventas de evento (TTL: 1 min)
- **Invalidar**: Al crear/editar/eliminar
- **Tiempo estimado**: 8 horas

---

### **3.3 Observabilidad y Monitoring**

#### **Implementar logging estructurado**
- **Backend**: Winston ya está configurado
- **Mejorar**: Logs con contexto (requestId, userId, eventId)
- **Formato**: JSON para fácil parseo
- **Tiempo estimado**: 4 horas

#### **Integrar Sentry**
- **Frontend**: Error tracking en Admin Panel y Marketplace
- **Backend**: Error tracking en Admin API
- **Configurar**: Source maps para debugging
- **Tiempo estimado**: 4 horas

#### **Health checks avanzados**
- **Actual**: `/health` devuelve OK
- **Agregar**:
  - `/health/ready` (listo para recibir tráfico)
  - `/health/live` (proceso vivo)
  - Checks de MongoDB, Redis, Stripe
- **Tiempo estimado**: 2 horas

---

## 🎯 PRIORIDAD 4 - BAJO (FUTURO)

### **4.1 Nuevas Funcionalidades**

#### **Sistema de notificaciones en tiempo real**
- **Actual**: Socket.IO está deshabilitado
- **Habilitar**: WebSockets para notificaciones
- **Eventos**: Nueva venta, nuevo evento, pago recibido
- **UI**: Badge en icono de notificaciones
- **Tiempo estimado**: 12 horas

#### **Completar integración Blockchain**
- **Actual**: Código comentado/incompleto
- **Implementar**: Deploy automático de contratos NFT
- **Integrar**: Ethers.js para interacción con smart contracts
- **UI**: Toggle para habilitar/deshabilitar blockchain por evento
- **Tiempo estimado**: 40 horas (1 semana)

#### **Sistema de reportes**
- **Exportar a PDF**: Reportes de ventas, analytics
- **Exportar a CSV**: Ya existe para eventos
- **Agregar**: Filtros por fecha, evento, promotor
- **Librería**: jsPDF o Puppeteer
- **Tiempo estimado**: 16 horas

#### **Marketplace: Sistema de wishlist**
- **Frontend**: Ya existe `WishlistContext`
- **Backend**: Crear endpoints para persistir wishlist
- **Notificaciones**: Email cuando evento tiene descuento
- **Tiempo estimado**: 12 horas

---

### **4.2 Internacionalización**

#### **Soporte multi-idioma**
- **Librería**: next-intl o i18next
- **Idiomas**: ES (default), EN, FR
- **Traducir**: UI strings, emails, validaciones
- **Tiempo estimado**: 24 horas

---

### **4.3 Accesibilidad y UX**

#### **Mejoras de accesibilidad**
- **ARIA labels**: En todos los formularios
- **Keyboard navigation**: Tab index correcto
- **Screen reader**: Etiquetas descriptivas
- **Contrast ratio**: AA compliance
- **Tiempo estimado**: 12 horas

#### **PWA (Progressive Web App)**
- **Service worker**: Para uso offline
- **Manifest**: Icono, colores, nombre
- **Push notifications**: Para eventos favoritos
- **Tiempo estimado**: 16 horas

---

## 📊 RESUMEN DE TIEMPOS ESTIMADOS

| Prioridad | Categoría | Tiempo Total | Semanas |
|-----------|-----------|--------------|---------|
| **P1 - Crítico** | Seguridad y Producción | 7.5 horas | 1 día |
| **P2 - Alto** | Testing, Refactoring, Validación | 72 horas | 9 días |
| **P3 - Medio** | Documentación, Performance, Monitoring | 56 horas | 7 días |
| **P4 - Bajo** | Nuevas Features, i18n, PWA | 132 horas | 16.5 días |
| **TOTAL** | | **267.5 horas** | **~6 semanas** |

*Basado en 1 developer full-time*

---

## 🔄 METODOLOGÍA RECOMENDADA

### **Sprint 1 (Semana 1-2): Fundamentos**
- ✅ Seguridad (CORS, cookies, variables env)
- ✅ Tests unitarios básicos
- ✅ Dividir services.tsx e interfaces.tsx
- ✅ Validación de formularios con Zod

### **Sprint 2 (Semana 3-4): Refactoring y Calidad**
- ✅ Refactorizar admin-event.service.ts
- ✅ Tests E2E con Playwright
- ✅ Error boundaries
- ✅ Documentación (READMEs, Swagger)

### **Sprint 3 (Semana 5-6): Performance y Monitoring**
- ✅ Code splitting y optimización de imágenes
- ✅ Caché en Redis
- ✅ Sentry y logging mejorado
- ✅ Guías de despliegue y CI/CD

### **Sprint 4+ (Futuro): Features Nuevas**
- Notificaciones real-time
- Blockchain completo
- Sistema de reportes
- PWA y accesibilidad

---

## 🚨 ISSUES CONOCIDOS (RESOLVER ANTES DE PRODUCCIÓN)

### **Críticos**
- ❌ CORS completamente abierto (permite cualquier origen)
- ❌ Tokens en localStorage (vulnerable a XSS)
- ❌ CronJob de expiración deshabilitado (eventos no se cierran)
- ❌ 0% test coverage

### **Altos**
- ⚠️ `admin-event.service.ts` tiene 35,424 líneas (imposible de mantener)
- ⚠️ `services.tsx` tiene 28,142 líneas (bundle size enorme)
- ⚠️ No hay validación de formularios
- ⚠️ Error handling básico (solo console.log en muchos lugares)

### **Medios**
- ⚠️ READMEs genéricos (no documentan el proyecto)
- ⚠️ No hay logging estructurado
- ⚠️ No hay monitoring/alerting
- ⚠️ Socket.IO deshabilitado (notificaciones no funcionan)

### **Bajos**
- 📝 Swagger incompleto (falta documentación de responses)
- 📝 No hay internacionalización
- 📝 Blockchain integration incompleta
- 📝 No hay PWA

---

## 📞 CONTACTO Y RECURSOS

### **Documentación Actual**
- Admin API Swagger: http://localhost:3001/api/docs
- Admin API Health: http://localhost:3001/health/info
- CLAUDE.md files en cada proyecto con análisis técnico completo

### **Repositorios**
```
monorepo-futuratickets/
├── futura-tickets-admin/          (Frontend Admin Panel)
├── futura-tickets-admin-api/      (Backend API)
└── futura-market-place-v2/        (Frontend Marketplace)
```

### **Scripts Útiles**
```bash
# Iniciar todo el sistema
cd futura-tickets-admin-api && npm run start:dev &
cd futura-tickets-admin && npm run dev &
cd futura-market-place-v2 && npm run dev &

# Health checks
curl http://localhost:3001/health | jq '.'
curl http://localhost:3003
curl http://localhost:3000

# Test login
curl -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futuratickets.com","password":"admin2025"}' | jq '.'
```

---

## ✅ CHECKLIST PARA IR A PRODUCCIÓN

### **Seguridad**
- [ ] Tokens movidos a httpOnly cookies
- [ ] CORS whitelist configurado
- [ ] Variables de entorno validadas al inicio
- [ ] Secrets rotados (JWT_SECRET, MongoDB password)
- [ ] Rate limiting configurado por ruta
- [ ] Helmet.js habilitado (security headers)

### **Testing**
- [ ] Tests unitarios >60% coverage
- [ ] Tests E2E para flujos críticos
- [ ] Load testing (Artillery, k6)
- [ ] Security audit (npm audit, Snyk)

### **Monitoring**
- [ ] Sentry configurado
- [ ] Logs centralizados (CloudWatch, Datadog)
- [ ] Alertas configuradas (uptime, errors, performance)
- [ ] Health checks implementados

### **Documentación**
- [ ] READMEs actualizados
- [ ] Swagger completo
- [ ] Runbook de incidentes
- [ ] Guía de deployment

### **Performance**
- [ ] Bundle size <500KB
- [ ] Images optimizadas
- [ ] Caché en Redis
- [ ] CDN para assets estáticos

### **Backup y Recuperación**
- [ ] MongoDB backups automáticos
- [ ] Plan de disaster recovery
- [ ] Tested restore procedure

---

**Última actualización**: 15 Octubre 2025
**Próxima revisión**: Inicio de Sprint 1

---

## 🎯 ACCIÓN INMEDIATA RECOMENDADA

**Empezar hoy con:**

1. **Habilitar CORS whitelist** (1 hora)
   - Archivo: `futura-tickets-admin-api/src/main.ts`
   - Descomentar líneas 15-26
   - Agregar dominios a whitelist

2. **Activar CronJob de expiración** (30 min)
   - Archivo: `futura-tickets-admin-api/src/CronJobs/cron-jobs.service.ts`
   - Descomentar línea 31

3. **Crear .env.example** (30 min)
   - En cada proyecto
   - Documentar todas las variables necesarias

**Total: 2 horas** - Mejoras críticas de seguridad sin riesgo de romper funcionalidad existente.
