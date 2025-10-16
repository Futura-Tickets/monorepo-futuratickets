# Scripts - FuturaTickets

Colección de scripts de utilidad para el monorepo de FuturaTickets.

## 📋 Índice

- [Git & Worktrees](#git--worktrees)
- [Deployment](#deployment)
- [Database](#database)
- [Utilities](#utilities)

---

## Git & Worktrees

### `git-status.sh`
Muestra un dashboard completo del estado de Git incluyendo branches, worktrees y commits recientes.

```bash
./scripts/git-status.sh
```

**Output:**
- Branch actual y directorio
- Estado del working directory
- Status de branches principales (main, staging, dev)
- Feature branches activos
- Worktrees activos
- Commits recientes
- Quick actions disponibles

---

### `worktree-create.sh`
Crea un nuevo worktree con auto-detección inteligente de base branch.

```bash
# Sintaxis
./scripts/worktree-create.sh <branch-name> [base-branch]

# Ejemplos con auto-detección
./scripts/worktree-create.sh feature/user-auth        # Auto: desde dev
./scripts/worktree-create.sh hotfix/critical-bug     # Auto: desde main
./scripts/worktree-create.sh release/v1.0.0          # Auto: desde staging

# Ejemplo con base explícita
./scripts/worktree-create.sh bugfix/issue-123 dev
```

**Auto-detección de base branch:**
- `feature/*` → branches desde `dev`
- `bugfix/*` → branches desde `dev`
- `hotfix/*` → branches desde `main`
- `release/*` → branches desde `staging`
- Otros → branches desde `dev` (default)

**Lo que hace:**
1. Crea el worktree en `../futuratickets-<branch-name>`
2. Crea un nuevo branch desde la base apropiada
3. Instala dependencias npm automáticamente en:
   - `futura-tickets-admin-api`
   - `futura-tickets-admin`
   - `futura-market-place-v2`
4. Muestra instrucciones de próximos pasos
5. Indica el merge target recomendado

---

### `worktree-cleanup.sh`
Limpia worktrees de branches ya mergeados a main.

```bash
# Dry-run (solo muestra qué haría)
./scripts/worktree-cleanup.sh

# Ejecutar limpieza real
./scripts/worktree-cleanup.sh --force
```

**Lo que hace:**
1. Lista todos los worktrees existentes
2. Identifica cuáles tienen branches mergeados a `main`
3. Protege branches principales (`main`, `master`, `development`)
4. En modo `--force`: elimina worktrees de branches mergeados
5. Ejecuta `git worktree prune` para limpiar referencias

**Opciones:**
- `--force`, `-f` - Ejecuta la limpieza (en lugar de dry-run)

---

### `sync-branches.sh`
Sincroniza todas las branches principales con el remote.

```bash
./scripts/sync-branches.sh
```

**Lo que hace:**
1. Hace `git fetch origin --prune`
2. Para cada branch principal (main, staging, dev):
   - Hace checkout
   - Pull con `--ff-only`
   - Muestra status
3. Vuelve al branch original
4. Muestra resumen de sincronización

**Útil para:**
- Actualizar todas las branches después de merges
- Sincronizar con el equipo
- Preparar branches para nuevos worktrees

---

## Deployment

### `deploy.sh`
Despliega la aplicación al entorno especificado.

```bash
./scripts/deploy.sh <environment>

# Ejemplos
./scripts/deploy.sh development
./scripts/deploy.sh staging
./scripts/deploy.sh production
```

**Environments:**
- `development` - Entorno de desarrollo
- `staging` - Pre-producción/QA
- `production` - Producción

---

### `rollback.sh`
Rollback a la versión anterior en el entorno especificado.

```bash
./scripts/rollback.sh <environment>
```

---

### `health-check.sh`
Verifica la salud de los servicios en el entorno especificado.

```bash
./scripts/health-check.sh <environment>
```

**Chequea:**
- API endpoints
- Database connectivity
- Service status
- Response times

---

### `validate-deployment.sh`
Valida que un deployment se haya completado correctamente.

```bash
./scripts/validate-deployment.sh
```

---

## Database

### `backup-mongodb.sh`
Crea un backup de MongoDB.

```bash
./scripts/backup-mongodb.sh
```

**Crea:**
- Backup timestamped de la base de datos
- Compresión automática
- Almacenamiento en directorio configurado

---

## Utilities

### `quick-start.sh`
Inicia todos los servicios necesarios para desarrollo.

```bash
./scripts/quick-start.sh
```

**Inicia:**
- MongoDB
- Backend API
- Admin Frontend
- Marketplace Frontend

---

### `setup-secrets.sh`
Configura secrets para Kubernetes.

```bash
./scripts/setup-secrets.sh <environment>
```

---

### `update-image.sh`
Actualiza la imagen de Docker en Kubernetes.

```bash
./scripts/update-image.sh <service> <tag>
```

---

### `apply-security-fixes.sh`
Aplica fixes de seguridad a todos los proyectos.

```bash
./scripts/apply-security-fixes.sh
```

**Lo que hace:**
- Ejecuta `npm audit fix` en todos los proyectos
- Actualiza dependencias vulnerables
- Genera reporte de cambios

---

## 🔧 Workflows Comunes

### Desarrollo de Nueva Feature

```bash
# 1. Ver estado actual
./scripts/git-status.sh

# 2. Crear worktree para feature
./scripts/worktree-create.sh feature/my-awesome-feature

# 3. Navegar al worktree
cd ../futuratickets-feature-my-awesome-feature

# 4. Iniciar desarrollo
npm run dev

# 5. Cuando termines, volver y limpiar
cd ~/monorepo-futuratickets
git worktree remove ../futuratickets-feature-my-awesome-feature
```

### Hotfix Urgente

```bash
# 1. Crear hotfix (no interrumpe tu trabajo actual)
./scripts/worktree-create.sh hotfix/critical-bug

# 2. Navegar y arreglar
cd ../futuratickets-hotfix-critical-bug
# ... fix ...
git add . && git commit -m "fix: critical bug"
git push -u origin hotfix/critical-bug

# 3. Después del merge a main, sincronizar
cd ~/monorepo-futuratickets
./scripts/sync-branches.sh
```

### Deployment a Staging

```bash
# 1. Asegurar que todo esté sincronizado
./scripts/sync-branches.sh

# 2. Hacer deployment
./scripts/deploy.sh staging

# 3. Validar
./scripts/health-check.sh staging
./scripts/validate-deployment.sh

# 4. Ver status
./scripts/git-status.sh
```

### Limpieza Periódica

```bash
# 1. Ver worktrees activos
./scripts/git-status.sh

# 2. Dry-run de limpieza
./scripts/worktree-cleanup.sh

# 3. Ejecutar limpieza
./scripts/worktree-cleanup.sh --force

# 4. Sincronizar branches
./scripts/sync-branches.sh
```

---

## 🎯 Tips

### Hacer Scripts Ejecutables

```bash
chmod +x scripts/*.sh
```

### Agregar al PATH (Opcional)

```bash
# Agregar a ~/.zshrc o ~/.bashrc
export PATH="$PATH:$HOME/monorepo-futuratickets/scripts"

# Ahora puedes ejecutar sin ./scripts/
git-status.sh
worktree-create.sh feature/my-feature
```

### Aliases Útiles (Opcional)

```bash
# Agregar a ~/.zshrc o ~/.bashrc
alias gs='./scripts/git-status.sh'
alias wt='./scripts/worktree-create.sh'
alias wtc='./scripts/worktree-cleanup.sh --force'
alias sync='./scripts/sync-branches.sh'
```

---

## 📚 Documentación Relacionada

- [Git Branching Strategy](../docs/GIT_BRANCHING_STRATEGY.md)
- [Git Worktrees Guide](../docs/GIT_WORKTREES_GUIDE.md)
- [GitHub Setup](../docs/GITHUB_SETUP.md)
- [Git Setup Summary](../docs/GIT_SETUP_SUMMARY.md)

---

## 🆘 Troubleshooting

### Script no ejecuta

```bash
# Dar permisos de ejecución
chmod +x scripts/nombre-script.sh
```

### Error en worktree-create.sh

```bash
# Verificar que estás en el directorio raíz del monorepo
pwd  # Debe ser .../monorepo-futuratickets

# Verificar que git está inicializado
git status
```

### Error en sync-branches.sh

```bash
# Asegurar que no hay cambios sin commitear
git status

# Si hay cambios, commit o stash primero
git stash
./scripts/sync-branches.sh
git stash pop
```

---

## 🔐 Seguridad

**IMPORTANTE:** Estos scripts pueden contener o interactuar con información sensible:

- ❌ NO commits secrets en los scripts
- ✅ Usa variables de entorno para secrets
- ✅ Usa archivos `.env` (en `.gitignore`)
- ✅ Usa GitHub Secrets para CI/CD
- ✅ Usa Kubernetes Secrets para deployment

---

## 📝 Convenciones

### Nomenclatura de Scripts

- `nombre-accion.sh` - Kebab-case
- Incluir comentarios de uso en el header
- Incluir validación de parámetros
- Incluir mensajes de error descriptivos
- Usar colores para mejor UX

### Estructura de Script

```bash
#!/bin/bash

# Script Name
# Description
# Usage: ./script.sh <param>

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parameters
PARAM1=$1

# Validation
if [ -z "$PARAM1" ]; then
    echo -e "${RED}Error: Parameter required${NC}"
    exit 1
fi

# Main logic
echo -e "${BLUE}Starting...${NC}"
# ...
echo -e "${GREEN}Done!${NC}"
```

---

**Última actualización**: 2025-10-16
**Mantenedor**: Futura-Tickets Team
