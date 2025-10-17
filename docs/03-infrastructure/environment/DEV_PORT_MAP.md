# FuturaTickets – Mapa de Puertos Locales

> Actualizado tras la reorganización de octubre 2025.

## APIs (NestJS)

| Servicio | Puerto | URL local | Notas |
|----------|-------:|-----------|-------|
| `futura-tickets-admin-api` | 4101 | http://localhost:4101 | Webhooks de Stripe, Swagger en `/api/docs` |
| `futura-market-place-api` | 4102 | http://localhost:4102 | Stripe Checkout, reventa y transferencias |
| `futura-access-api` | 4103 | http://localhost:4103 | Validación en puerta, WebSocket para escáneres |
| `futura-tickets-rest-api` (legacy) | 4104 | http://localhost:4104 | Usar solo para pruebas heredadas |

## Frontends (Next.js / Expo web)

| Servicio | Puerto | URL local | Notas |
|----------|-------:|-----------|-------|
| `futura-market-place-v2` | 3000 | http://localhost:3000 | Público: compra y reventa |
| `futura-tickets-admin` | 3003 | http://localhost:3003 | Promotores, panel administrativo |
| `futura-tickets-web-access-app` | 3007 | http://localhost:3007 | Control de acceso (versión web) |

## Scripts y herramientas

- `./start-all.sh` y `./start-all-services.sh` exportan automáticamente los puertos 4101 y 4103 cuando levantan las APIs.
- `stripe listen` debe reenviar a `localhost:4101/stripe/webhook`.
- `docker-compose.yml` expone los mismos puertos hacia los contenedores (`4101:4101`, `4102:4102`, `4103:4103`).
- Endpoints `/metrics` habilitados en `futura-tickets-admin-api` (4101) y `futura-market-place-api` (4102) para scraping de Prometheus o diagnóstico manual.

## Checklist al configurar un entorno nuevo

1. Copiar los `.env.example` actualizados y confirmar que `PORT` coincida con la tabla anterior.
2. Revisar variables `NEXT_PUBLIC_*` en los frontends para apuntar a `4101/4102`.
3. Actualizar cualquier script personalizado que invoque `curl` o `stripe listen` contra el puerto antiguo (`3001`).
4. Ejecutar `tests/smoke-test.sh` (por defecto usa `http://localhost:4101`) para validar salud del Admin API.

> Si algún servicio necesita usar un puerto distinto (QA, staging, múltiples instancias), documentarlo en este archivo con un subtítulo extra y avisar al equipo. 
