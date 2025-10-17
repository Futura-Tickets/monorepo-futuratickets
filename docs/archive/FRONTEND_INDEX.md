# 🎨 FRONTEND Apps - Índice Completo

## 📚 Documentación Disponible

| Documento | Descripción | Cuando Usar |
|-----------|-------------|-------------|
| **[TERMINAL_3_FRONTENDS.md](./TERMINAL_3_FRONTENDS.md)** | Guía de uso completa y comandos | Referencia diaria |
| **[TERMINAL_3_RESUMEN.md](./TERMINAL_3_RESUMEN.md)** | Resumen ejecutivo de configuración | Onboarding o troubleshooting |
| **[.aliases-frontends](./.aliases-frontends)** | Aliases de terminal | Configuración inicial |

---

## ⚡ Quick Start (3 comandos)

```bash
# 1. Iniciar servicios
./start-all-frontends.sh

# 2. Verificar estado
./check-frontends-health.sh

# 3. Abrir en navegador
open http://localhost:3000 http://localhost:3001 http://localhost:3007
```

---

## 🛠️ Scripts Disponibles

### Gestión de Servicios
- `./start-all-frontends.sh` - Inicia los 3 frontends
- `./stop-all-frontends.sh` - Detiene los 3 frontends
- `./check-frontends-health.sh` - Health check con colores

### Makefile (Más Potente)
```bash
make -f Makefile.frontends help          # Ver todos los comandos
make -f Makefile.frontends start         # = start script
make -f Makefile.frontends stop          # = stop script
make -f Makefile.frontends restart       # Reiniciar
make -f Makefile.frontends health        # = health script
make -f Makefile.frontends check-deps    # Ver versiones Next.js
make -f Makefile.frontends install-deps  # npm install en los 3
make -f Makefile.frontends clean-install # Limpiar + instalar
make -f Makefile.frontends logs          # Ver procesos activos
```

---

## 🌐 URLs de Acceso

| App | Puerto | URL | Descripción |
|-----|--------|-----|-------------|
| **Marketplace** | 3000 | http://localhost:3000 | Compra de tickets |
| **Admin Panel** | 3001 | http://localhost:3001 | Gestión de eventos |
| **Access Web** | 3007 | http://localhost:3007 | Validador de accesos |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│         FRONTEND Apps (Terminal 3)      │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────┐  Next.js 15.2.2     │
│  │ Marketplace   │  React 19           │
│  │ Port 3000     │  Stripe             │
│  └───────────────┘  Tailwind + Radix  │
│                                         │
│  ┌───────────────┐  Next.js 15.0.3     │
│  │ Admin Panel   │  React 18           │
│  │ Port 3001     │  Ant Design         │
│  └───────────────┘  Socket.IO          │
│                                         │
│  ┌───────────────┐  Next.js            │
│  │ Access Web    │  React              │
│  │ Port 3007     │  QR Scanner         │
│  └───────────────┘                     │
│                                         │
└─────────────────────────────────────────┘
              │
              ▼
    Backend APIs (Terminal 1 & 2)
```

---

## 🔧 Troubleshooting

### Problema: Servicios no inician

```bash
# 1. Verificar puertos ocupados
lsof -i :3000,:3001,:3007

# 2. Matar procesos si hay conflicto
./stop-all-frontends.sh

# 3. Intentar de nuevo
./start-all-frontends.sh
```

### Problema: Errores de módulos faltantes

```bash
# Limpiar e instalar
make -f Makefile.frontends clean-install

# O manualmente:
cd futura-market-place-v2
rm -rf node_modules package-lock.json
npm install
```

### Problema: Puerto en uso por otro proceso

```bash
# Identificar proceso
lsof -i :3000  # Cambiar puerto según necesidad

# Matar específicamente
kill -9 <PID>
```

---

## 💡 Tips de Productividad

### 1. Usar Aliases
```bash
# Agregar a ~/.bashrc o ~/.zshrc:
source /path/to/.aliases-frontends

# Luego puedes usar:
ft-start        # Iniciar servicios
ft-health       # Health check
ft-open-all     # Abrir las 3 URLs
```

### 2. Usar tmux para ver logs en paralelo
```bash
tmux new-session -s frontends \; \
  send-keys 'cd futura-market-place-v2 && npm run dev' C-m \; \
  split-window -h \; \
  send-keys 'cd futura-tickets-admin && npm run dev' C-m \; \
  split-window -h \; \
  send-keys 'cd futura-tickets-web-access-app && npm run dev' C-m \; \
  select-layout even-horizontal
```

### 3. Watch mode para health check
```bash
watch -n 5 ./check-frontends-health.sh
```

---

## 📊 Estado del Sistema

Ejecuta para ver estado actual:
```bash
./check-frontends-health.sh
```

Salida esperada:
```
========================================
  FRONTEND Health Check
========================================

Marketplace (port 3000): ✓ Running (HTTP 200)
Admin Panel (port 3001): ✓ Running (HTTP 200)
Access Web (port 3007): ✓ Running (HTTP 200)

Health check complete
```

---

## 🚀 Comandos Esenciales Memorizables

| Comando | Descripción |
|---------|-------------|
| `./start-all-frontends.sh` | 🟢 Start |
| `./stop-all-frontends.sh` | 🔴 Stop |
| `./check-frontends-health.sh` | 💚 Health |
| `make -f Makefile.frontends help` | ❓ Help |

---

## 📝 Notas Importantes

1. **Puertos reservados**: 3000, 3001, 3007
2. **Dependencias**: Cada app necesita `npm install` individual
3. **Hot Reload**: Next.js auto-recarga al cambiar código
4. **Build**: No es necesario buildar para desarrollo local

---

## 🔗 Enlaces Relacionados

- [Documentación Next.js](https://nextjs.org/docs)
- [Stripe Integration](https://stripe.com/docs/payments/accept-a-payment)
- [Ant Design](https://ant.design/)
- [Radix UI](https://www.radix-ui.com/)

---

**Última actualización**: 2025-10-17
**Mantenido por**: Tech Lead
**Estado**: ✅ Operativo
