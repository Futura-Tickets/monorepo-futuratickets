# 🎨 TERMINAL 3: FRONTEND Apps

## Aplicaciones Frontend (3 Next.js Apps)

### 🚀 Opción A: Script Unificado (Recomendado)

```bash
./start-all-frontends.sh
```

Este script inicia las 3 aplicaciones en paralelo con logs diferenciados por colores.

### 📊 Opción B: tmux con 3 panes

```bash
tmux new-session -s frontends \; \
  send-keys 'cd futura-market-place-v2 && npm run dev' C-m \; \
  split-window -h \; \
  send-keys 'cd futura-tickets-admin && npm run dev' C-m \; \
  split-window -h \; \
  send-keys 'cd futura-tickets-web-access-app && npm run dev' C-m \; \
  select-layout even-horizontal
```

Para salir de tmux: `Ctrl+B` luego `D` (detach) o `Ctrl+C` en cada pane.

---

## 🌐 URLs de Acceso

| Aplicación | Puerto | URL | Función |
|-----------|--------|-----|---------|
| **Marketplace** | 3000 | http://localhost:3000 | Compra de tickets |
| **Admin Panel** | 3001 | http://localhost:3001 | Gestión de eventos |
| **Access Web** | 3007 | http://localhost:3007 | Validador de accesos |

---

## 📦 Estructura

```
futura-market-place-v2/       → Next.js (Marketplace)
futura-tickets-admin/         → Next.js (Admin)
futura-tickets-web-access-app/ → Next.js (Access)
```

---

## 🛠️ Comandos Útiles

### ✅ Health Check (Verificar estado de servicios)
```bash
./check-frontends-health.sh
```

Este script verifica:
- Si los puertos están escuchando
- Si las apps responden HTTP 200
- Muestra el estado de cada servicio con colores

### 🛑 Detener Todos los Servicios
```bash
./stop-all-frontends.sh
```

Detiene limpiamente las 3 aplicaciones frontend.

### 🔍 Verificar puertos en uso
```bash
lsof -i :3000,:3001,:3007
```

### ⚡ Reiniciar Servicios
```bash
./stop-all-frontends.sh && ./start-all-frontends.sh
```

### 🔧 Verificar dependencias instaladas
```bash
cd futura-market-place-v2 && npm list next
cd ../futura-tickets-admin && npm list next
cd ../futura-tickets-web-access-app && npm list next
```

### 🧹 Limpiar y reinstalar dependencias (si hay problemas)
```bash
cd futura-market-place-v2 && rm -rf node_modules package-lock.json && npm install
cd ../futura-tickets-admin && rm -rf node_modules package-lock.json && npm install
cd ../futura-tickets-web-access-app && rm -rf node_modules package-lock.json && npm install
```

---

## 🚀 Quick Start (Inicio Rápido)

```bash
# 1. Verificar que los puertos están libres
./check-frontends-health.sh

# 2. Si hay servicios corriendo, detenerlos
./stop-all-frontends.sh

# 3. Iniciar todos los frontends
./start-all-frontends.sh

# 4. Verificar que todo está corriendo
./check-frontends-health.sh
```
