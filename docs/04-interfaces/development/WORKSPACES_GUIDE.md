# FuturaTickets - Guía de Workspaces (npm)

## Objetivo

Centralizar la instalación de dependencias y la ejecución de scripts comunes para todos los paquetes del monorepo usando **npm workspaces**.

## 📁 Estructura

El archivo `package.json` en la raíz declara los siguientes paquetes como workspaces:

- `futura-access-api`
- `futura-access-app`
- `futura-market-place-api`
- `futura-market-place-v2`
- `futura-paginator`
- `futura-tickets-access-app`
- `futura-tickets-admin`
- `futura-tickets-admin-api`
- `futura-tickets-contracts-v2`
- `futura-tickets-event`
- `futura-tickets-rest-api`
- `futura-tickets-web-access-app`
- `integrations-scripts`

## 🚀 Comandos Clave

```
# Instalar todas las dependencias
npm run bootstrap

# Ejecutar scripts globales (si existen en cada workspace)
npm run build --workspaces --if-present
npm run lint --workspaces --if-present
npm run test --workspaces --if-present

# Ejecutar un script en un workspace específico
npm run dev --workspace futura-tickets-admin
npm run start:dev --workspace futura-tickets-admin-api
```

> `--if-present` evita que npm falle si un workspace no define el script.

## 🔁 Flujo Recomendado

1. Ejecuta `npm run bootstrap` tras clonar el repositorio o cambiar de rama principal.
2. Usa los scripts globales (`build`, `lint`, `test`) antes de abrir un PR.
3. Para tareas específicas, ejecuta scripts apuntando al workspace que corresponde.

## 🔧 Próximos pasos posibles

- Agregar un script `clean` para borrar `node_modules`, `.next`, `dist` globalmente.
- Integrar herramientas como Turborepo o Nx reutilizando esta definición de workspace.
- Aprovechar `overrides`/`resolutions` en la raíz para alinear versiones críticas (React, NestJS, etc.).

## ❗ Requisitos

- Node.js ≥ 20.11
- npm ≥ 10.2
- Ejecutar los comandos desde la raíz del monorepo.

> Si el equipo prefiere `pnpm` o `yarn`, se puede añadir la configuración equivalente, pero el flujo oficial actual es con **npm workspaces**.
