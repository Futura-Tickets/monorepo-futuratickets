# Scripts de Utilidad - FuturaTickets

## Utilities

### check-env-vars.sh
Verifica variables de entorno críticas en servicios backend.

Uso: `./scripts/utilities/check-env-vars.sh`

### smoke-tests.sh
Ejecuta smoke tests en 10 endpoints principales.

Uso: `./scripts/utilities/smoke-tests.sh`

### continuous-health-check.sh  
Monitoreo continuo cada N segundos (default: 30s).

Uso: `./scripts/utilities/continuous-health-check.sh [interval]`

### cleanup-processes.sh
Limpia procesos duplicados de start-all scripts.

Uso: `./scripts/utilities/cleanup-processes.sh`

## Convenciones
- Todos los scripts requieren `chmod +x`
- Ejecutar desde root del monorepo
- Exit code 0 = success, 1 = error
