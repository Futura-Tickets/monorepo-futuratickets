# 🎫 FUTURA TICKETS - Monorepo Master Guide

> Guía maestra para desarrolladores - Todo lo que necesitas saber para trabajar con el stack completo

---

## 🚀 Quick Start (30 segundos)

```bash
# 1. Verificar estado de servicios
./check-all-services.sh

# 2. Iniciar TODO el stack con tmux
./start-all-stack.sh

# 3. Detener todo cuando termines
./stop-all-stack.sh
```

---

## 📊 Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                      FUTURA TICKETS ECOSYSTEM                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TERMINAL 3: FRONTEND (Next.js)                          │    │
│  │  ✓ Marketplace (3000) - Compra de tickets               │    │
│  │  ✓ Admin Panel (3001) - Gestión de eventos              │    │
│  │  ✓ Access Web (3007) - Validación de accesos            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼ HTTP/REST                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TERMINAL 1: BACKEND APIs (NestJS)                       │    │
│  │  ✓ Admin API (3002) - Gestión eventos/ventas            │    │
│  │  ✓ Marketplace API (3004) - Pagos/emails                │    │
│  │  ✓ Access API (3005) - Control acceso                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼ Web3                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TERMINAL 2: BLOCKCHAIN (Hardhat)                        │    │
│  │  ✓ Hardhat Node (8545) - Ethereum local                 │    │
│  │  ✓ Smart Contracts - Tickets NFT                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Monorepo

```
monorepo-futuratickets/
│
├── TERMINAL 1: BACKEND APIs
│   ├── futura-tickets-admin-api/     (NestJS, Puerto 3002)
│   ├── futura-market-place-api/      (NestJS, Puerto 3004)
│   └── futura-access-api/            (NestJS, Puerto 3005)
│
├── TERMINAL 2: BLOCKCHAIN
│   └── futura-tickets-contracts-v2/  (Hardhat, Puerto 8545)
│
├── TERMINAL 3: FRONTEND
│   ├── futura-market-place-v2/       (Next.js, Puerto 3000)
│   ├── futura-tickets-admin/         (Next.js, Puerto 3001)
│   └── futura-tickets-web-access-app/(Next.js, Puerto 3007)
│
└── SCRIPTS Y DOCUMENTACIÓN
    ├── PORT_MAP.md                   ← Mapa completo de puertos
    ├── FRONTEND_INDEX.md             ← Guía de frontends
    ├── TERMINAL_3_FRONTENDS.md       ← Docs Terminal 3
    ├── TERMINAL_3_RESUMEN.md         ← Resumen ejecutivo
    │
    ├── start-all-stack.sh            ← Iniciar TODO (tmux)
    ├── start-all-backends.sh         ← Terminal 1
    ├── start-blockchain.sh           ← Terminal 2
    ├── start-all-frontends.sh        ← Terminal 3
    │
    ├── stop-all-stack.sh             ← Detener todo
    ├── stop-all-frontends.sh         ← Detener frontends
    │
    ├── check-all-services.sh         ← Health check completo
    ├── check-frontends-health.sh     ← Health check frontends
    │
    ├── Makefile.frontends            ← Make commands para frontends
    └── .aliases-frontends            ← Aliases bash/zsh
```

---

## 🎯 Scripts Disponibles

### Control del Stack Completo
| Script | Descripción | Uso |
|--------|-------------|-----|
| `./start-all-stack.sh` | Inicia TODO en tmux | Desarrollo completo |
| `./stop-all-stack.sh` | Detiene todos los servicios | Cleanup |
| `./check-all-services.sh` | Health check de 7 servicios | Diagnóstico |

### Por Terminal
| Script | Terminal | Servicios |
|--------|----------|-----------|
| `./start-all-backends.sh` | 1 | 3 APIs NestJS |
| `./start-blockchain.sh` | 2 | Hardhat Node |
| `./start-all-frontends.sh` | 3 | 3 Apps Next.js |

### Makefile (Recomendado para Frontends)
```bash
make -f Makefile.frontends help      # Ver todos los comandos
make -f Makefile.frontends start     # Iniciar frontends
make -f Makefile.frontends health    # Health check
make -f Makefile.frontends stop      # Detener frontends
```

---

## 🗺️ Mapa de Puertos

| Puerto | Servicio | Stack | Estado |
|--------|----------|-------|--------|
| 3000 | Marketplace Frontend | Next.js | ✅ Operativo |
| 3001 | Admin Panel | Next.js | ✅ Operativo |
| 3002 | Admin API | NestJS | ✅ Operativo |
| 3004 | Marketplace API | NestJS | ✅ Operativo |
| 3005 | Access API | NestJS | ⚠️ Por iniciar |
| 3007 | Access Web | Next.js | ✅ Operativo |
| 8545 | Hardhat Node | Blockchain | ✅ Operativo |

**Detalles**: Ver `PORT_MAP.md`

---

## 🔥 Flujos de Trabajo Típicos

### Desarrollo de Feature Nueva

```bash
# 1. Asegurarse de que todo está actualizado
git pull origin dev

# 2. Crear branch de feature
git checkout -b feature/nombre-feature

# 3. Iniciar los servicios necesarios
# Opción A: Solo frontends
./start-all-frontends.sh

# Opción B: Stack completo
./start-all-stack.sh  # Usa tmux

# 4. Desarrollar y probar

# 5. Health check antes de commit
./check-all-services.sh

# 6. Commit y push
git add .
git commit -m "feat: descripción de la feature"
git push origin feature/nombre-feature
```

### Debugging de Problema

```bash
# 1. Health check para ver qué falla
./check-all-services.sh

# 2. Si algo no corre, revisar puertos
lsof -i :3000,:3001,:3002,:3004,:3005,:3007,:8545

# 3. Matar procesos zombies
./stop-all-stack.sh

# 4. Limpiar e intentar de nuevo
./start-all-stack.sh
```

### Testing E2E

```bash
# 1. Asegurar que todo corre
./start-all-stack.sh

# 2. Esperar a que todo inicie (20-30 seg)
sleep 30

# 3. Health check
./check-all-services.sh

# 4. Ejecutar tests (cuando estén implementados)
# npm run test:e2e --workspace=futura-market-place-v2
```

---

## 📚 Documentación Detallada

### Arquitectura y Código
- **Admin API**: `futura-tickets-admin-api/CLAUDE.md` (9,485 líneas)
- **Marketplace API**: `futura-market-place-api/CLAUDE.md` (completo)
- **Access API**: `futura-access-api/CLAUDE.md` (exhaustivo)
- **Admin Frontend**: `futura-tickets-admin/CLAUDE.md` (11,343 líneas)
- **Marketplace Frontend**: `futura-market-place-v2/CLAUDE.md` (3,818 líneas)

### Guías de Usuario
- **Frontends**: `FRONTEND_INDEX.md` - Hub de documentación frontend
- **Terminal 3**: `TERMINAL_3_FRONTENDS.md` - Guía completa
- **Puertos**: `PORT_MAP.md` - Mapa completo del sistema

### Resúmenes Ejecutivos
- **Frontend Setup**: `TERMINAL_3_RESUMEN.md` - Lo que se hizo y por qué

---

## 🛠️ Comandos Útiles

### Health Checks
```bash
# Todos los servicios
./check-all-services.sh

# Solo frontends
./check-frontends-health.sh

# Verificar puertos manualmente
lsof -i :3000,:3001,:3002,:3004,:3005,:3007,:8545
```

### Gestión de Procesos
```bash
# Matar servicios específicos
kill -9 $(lsof -ti:3000)  # Marketplace frontend
kill -9 $(lsof -ti:3002)  # Admin API
kill -9 $(lsof -ti:8545)  # Hardhat

# Matar todo
./stop-all-stack.sh
```

### tmux Management
```bash
# Listar sesiones
tmux ls

# Attach a sesión
tmux attach -t futura-stack

# Navegar entre ventanas
Ctrl+B luego 0/1/2/3

# Detach (mantener corriendo)
Ctrl+B luego D

# Matar sesión
tmux kill-session -t futura-stack
```

---

## 🔧 Troubleshooting Común

### "Port already in use"
```bash
# Identifica qué proceso usa el puerto
lsof -i :3000

# Mátalo
kill -9 <PID>

# O mata todos los puertos
./stop-all-stack.sh
```

### "Cannot find module"
```bash
# Reinstalar dependencias
cd nombre-del-proyecto
rm -rf node_modules package-lock.json
npm install
```

### "Hardhat not running"
```bash
# Verificar
curl http://localhost:8545

# Si no responde, iniciar
./start-blockchain.sh
```

### "MongoDB connection failed"
```bash
# Verificar que MongoDB está corriendo (local o Atlas)
# Verificar variables de entorno .env
```

---

## 🧪 Testing (Estado Actual)

### Coverage Actual
- **Backend APIs**: 0% (❌ Sin tests implementados)
- **Frontends**: 0% (❌ Sin tests implementados)
- **Smart Contracts**: ⚠️ Por verificar

### Próximos Pasos
1. Implementar tests unitarios en APIs (Jest)
2. Tests E2E de frontends (Playwright/Cypress)
3. Tests de integración entre servicios

---

## 🚦 Estado del Proyecto

### ✅ Completado y Funcional
- [x] 3 Frontends Next.js corriendo
- [x] Scripts de gestión completos
- [x] Health checks automatizados
- [x] Documentación exhaustiva
- [x] Mapa de puertos definido
- [x] Hardhat node operativo

### ⚠️ En Progreso
- [ ] Access API por iniciar
- [ ] Tests E2E
- [ ] CI/CD pipeline
- [ ] Docker Compose alternativo

### ❌ Pendiente
- [ ] Tests unitarios (0% coverage)
- [ ] Documentación de API (Swagger)
- [ ] Monitoring (Sentry, Datadog)
- [ ] Performance optimization

---

## 💡 Mejores Prácticas

### Al Desarrollar
1. ✅ **Siempre hacer health check** antes de commit
2. ✅ **Usar tmux** para gestionar múltiples servicios
3. ✅ **Documentar cambios** en CLAUDE.md de cada repo
4. ✅ **Seguir convenciones** de cada stack (NestJS, Next.js)

### Al Hacer Commit
```bash
# 1. Health check
./check-all-services.sh

# 2. Verificar que todo funciona
# Probar manualmente los endpoints/páginas afectados

# 3. Commit con mensaje descriptivo
git commit -m "feat(admin-api): add new endpoint for analytics"

# 4. Push y crear PR
git push origin feature-branch
```

### Al Hacer Code Review
1. ✅ Verificar que el código compile
2. ✅ Verificar que no rompe funcionalidad existente
3. ✅ Verificar que sigue las convenciones del proyecto
4. ✅ Sugerir tests si no hay

---

## 🎓 Recursos Adicionales

### Documentación Oficial
- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Hardhat Docs](https://hardhat.org/docs)
- [Stripe API](https://stripe.com/docs/api)

### Stack Específico
- **MongoDB**: [Mongoose Docs](https://mongoosejs.com/docs/)
- **Redis**: Para Bull queues
- **Socket.IO**: [Docs](https://socket.io/docs/v4/)
- **Azure**: Web PubSub

---

## 📞 Soporte y Contacto

### Problemas Técnicos
1. Revisar `check-all-services.sh`
2. Consultar documentación en CLAUDE.md
3. Verificar logs de cada servicio
4. Crear issue en GitHub (cuando esté configurado)

### Contribuir
1. Fork del repositorio
2. Crear branch de feature
3. Seguir guía de desarrollo
4. Crear Pull Request
5. Esperar code review

---

**Última actualización**: 2025-10-17
**Mantenido por**: Tech Lead
**Estado del sistema**: ✅ Operativo (6/7 servicios corriendo)

---

**Happy Coding! 🚀**
