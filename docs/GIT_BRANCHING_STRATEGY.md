# Git Branching Strategy - FuturaTickets

Esta documentación define la estrategia de branching para el monorepo de FuturaTickets, optimizada para desarrollo paralelo, testing y despliegues seguros.

## Índice

1. [Estructura de Ramas](#estructura-de-ramas)
2. [Workflows](#workflows)
3. [Convenciones de Nombrado](#convenciones-de-nombrado)
4. [Uso con Git Worktrees](#uso-con-git-worktrees)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Branch Protection Rules](#branch-protection-rules)
7. [Casos de Uso Comunes](#casos-de-uso-comunes)

---

## Estructura de Ramas

### Ramas Permanentes

#### `main` (Producción)
- **Propósito**: Código en producción, 100% estable
- **Protección**: ✅ Protected branch
- **Deploy**: Automático a producción
- **Merge desde**: `staging` únicamente
- **Tags**: Cada merge crea un release tag (v1.0.0, v1.1.0, etc.)
- **Reglas**:
  - Solo merges mediante Pull Request
  - Requiere aprobación de 2+ reviewers
  - Todos los tests deben pasar
  - No commits directos

#### `staging` (Pre-producción/QA)
- **Propósito**: Testing de QA y validación pre-producción
- **Protección**: ✅ Protected branch
- **Deploy**: Automático a entorno staging
- **Merge desde**: `dev` y `hotfix/*`
- **Testing**: Testing de integración, pruebas de usuario, smoke tests
- **Reglas**:
  - Requiere aprobación de 1+ reviewer
  - Tests de integración deben pasar
  - No commits directos (solo merges)

#### `dev` (Desarrollo)
- **Propósito**: Integración continua de features en desarrollo
- **Protección**: ⚠️ Semi-protected
- **Deploy**: Automático a entorno de desarrollo
- **Merge desde**: `feature/*`, `bugfix/*`
- **Testing**: Unit tests, linting, tests básicos
- **Reglas**:
  - Requiere PR (puede ser auto-aprobado)
  - Tests unitarios deben pasar
  - Linting debe pasar

### Ramas Temporales

#### `feature/*` (Nuevas Funcionalidades)
- **Formato**: `feature/<nombre-descriptivo>`
- **Branch desde**: `dev`
- **Merge hacia**: `dev`
- **Ciclo de vida**: Se elimina después del merge
- **Ejemplos**:
  ```
  feature/marketplace-checkout
  feature/admin-dashboard
  feature/nft-integration
  feature/payment-gateway
  feature/access-control-sync
  ```

#### `bugfix/*` (Corrección de Bugs)
- **Formato**: `bugfix/<nombre-o-issue-id>`
- **Branch desde**: `dev`
- **Merge hacia**: `dev`
- **Ciclo de vida**: Se elimina después del merge
- **Ejemplos**:
  ```
  bugfix/issue-123
  bugfix/login-timeout
  bugfix/ticket-validation
  ```

#### `hotfix/*` (Correcciones Urgentes en Producción)
- **Formato**: `hotfix/<nombre-critico>`
- **Branch desde**: `main`
- **Merge hacia**: `main` Y `staging` Y `dev`
- **Deploy**: Inmediato a producción
- **Prioridad**: 🔴 CRÍTICA
- **Ejemplos**:
  ```
  hotfix/payment-processing
  hotfix/security-vulnerability
  hotfix/critical-crash
  ```

#### `release/*` (Preparación de Releases)
- **Formato**: `release/v<version>`
- **Branch desde**: `staging`
- **Merge hacia**: `main`
- **Uso**: Preparar releases, últimos ajustes, documentación
- **Ejemplos**:
  ```
  release/v1.0.0
  release/v2.1.0
  ```

---

## Workflows

### 1. Feature Development (Desarrollo Normal)

```bash
# 1. Crear feature branch desde dev
git checkout dev
git pull origin dev
git checkout -b feature/marketplace-checkout

# O usando worktree (recomendado)
./scripts/worktree-create.sh feature/marketplace-checkout dev

# 2. Desarrollar y commitear
git add .
git commit -m "feat: implement checkout flow"

# 3. Push a remote
git push -u origin feature/marketplace-checkout

# 4. Crear Pull Request a dev
gh pr create --base dev --title "Implement marketplace checkout" --body "..."

# 5. Después del merge, limpiar
git checkout dev
git pull origin dev
git branch -d feature/marketplace-checkout
```

### 2. Testing y Staging

```bash
# Después de varios features mergeados a dev

# 1. Mergear dev a staging para QA
git checkout staging
git pull origin staging
git merge dev
git push origin staging

# 2. Deploy automático a staging ocurre

# 3. QA team valida en staging

# 4. Si todo OK, preparar release
```

### 3. Production Release

```bash
# 1. Crear release branch desde staging
git checkout staging
git pull origin staging
git checkout -b release/v1.5.0

# 2. Ajustes finales, actualizar versiones
# Actualizar package.json, CHANGELOG.md, etc.
git commit -m "chore: prepare release v1.5.0"

# 3. Merge a main
git checkout main
git merge release/v1.5.0
git tag -a v1.5.0 -m "Release v1.5.0"
git push origin main --tags

# 4. Mergear cambios de release de vuelta a dev/staging
git checkout staging
git merge release/v1.5.0
git checkout dev
git merge release/v1.5.0

# 5. Limpiar
git branch -d release/v1.5.0
```

### 4. Hotfix Workflow (Emergencia)

```bash
# 1. Crear hotfix desde main
git checkout main
git pull origin main
git checkout -b hotfix/payment-timeout

# O con worktree para no interrumpir tu trabajo
./scripts/worktree-create.sh hotfix/payment-timeout main

# 2. Fix rápido
git add .
git commit -m "fix: resolve payment timeout issue"

# 3. Merge a main (producción)
git checkout main
git merge hotfix/payment-timeout
git tag -a v1.5.1 -m "Hotfix: payment timeout"
git push origin main --tags

# 4. Merge a staging y dev para mantener sincronía
git checkout staging
git merge hotfix/payment-timeout
git push origin staging

git checkout dev
git merge hotfix/payment-timeout
git push origin dev

# 5. Limpiar
git branch -d hotfix/payment-timeout
```

---

## Convenciones de Nombrado

### Branch Names

**Formato General**: `<tipo>/<descripcion-kebab-case>`

#### Tipos válidos:
- `feature/` - Nueva funcionalidad
- `bugfix/` - Corrección de bug
- `hotfix/` - Fix urgente en producción
- `release/` - Preparación de release
- `experiment/` - Experimentos temporales
- `refactor/` - Refactoring sin cambio de funcionalidad
- `docs/` - Solo cambios en documentación
- `test/` - Agregar o modificar tests

#### Ejemplos buenos:
```
✅ feature/user-authentication
✅ bugfix/issue-456
✅ hotfix/critical-payment-bug
✅ release/v2.0.0
✅ refactor/payment-service
✅ docs/api-documentation
```

#### Ejemplos malos:
```
❌ new-feature (sin tipo)
❌ feature/My_New_Feature (camelCase/snake_case)
❌ fix (muy genérico)
❌ john-working (no descriptivo)
```

### Commit Messages

Sigue [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Tipos:
- `feat:` - Nueva feature
- `fix:` - Bug fix
- `docs:` - Documentación
- `style:` - Formato (no afecta código)
- `refactor:` - Refactoring
- `test:` - Tests
- `chore:` - Mantenimiento
- `perf:` - Performance
- `ci:` - CI/CD

#### Ejemplos:
```bash
git commit -m "feat(marketplace): add checkout flow"
git commit -m "fix(admin): resolve user permissions bug"
git commit -m "docs: update API documentation"
git commit -m "refactor(payment): simplify payment processing logic"
```

---

## Uso con Git Worktrees

### Estructura Recomendada

```
~/Projects/
├── monorepo-futuratickets/                    # Main worktree (main)
├── futuratickets-dev/                          # Dev worktree
├── futuratickets-staging/                      # Staging worktree
├── futuratickets-feature-checkout/             # Feature worktree
└── futuratickets-hotfix-payment/               # Hotfix worktree
```

### Setup de Worktrees Permanentes

```bash
# Worktree para desarrollo activo
git worktree add ../futuratickets-dev dev

# Worktree para testing en staging
git worktree add ../futuratickets-staging staging
```

### Crear Feature con Worktree

```bash
# Usa el script automatizado
./scripts/worktree-create.sh feature/marketplace-checkout dev

# O manualmente
git worktree add ../futuratickets-feature-checkout -b feature/marketplace-checkout dev
cd ../futuratickets-feature-checkout
npm install
```

### Ventajas de Worktrees para esta Estrategia

1. **Desarrollo Paralelo**:
   ```bash
   # Terminal 1: Desarrollo de feature
   cd ~/futuratickets-feature-checkout
   npm run dev

   # Terminal 2: Testing en staging
   cd ~/futuratickets-staging
   npm test

   # Terminal 3: Hotfix urgente
   cd ~/futuratickets-hotfix-payment
   ```

2. **Cambio Rápido de Contexto**:
   - No necesitas hacer `git stash`
   - Cada worktree mantiene su propio estado
   - node_modules separados por worktree

3. **Testing en Múltiples Branches**:
   ```bash
   # Comparar comportamiento
   cd ~/futuratickets-dev && npm run test
   cd ~/futuratickets-staging && npm run test
   ```

---

## CI/CD Pipeline

### Pipelines por Branch

#### `main` (Production)
```yaml
on:
  push:
    branches: [main]

jobs:
  - lint
  - test-unit
  - test-integration
  - test-e2e
  - security-scan
  - build-production
  - deploy-production
  - create-release-tag
  - notify-team
```

#### `staging` (QA)
```yaml
on:
  push:
    branches: [staging]

jobs:
  - lint
  - test-unit
  - test-integration
  - build-staging
  - deploy-staging
  - smoke-tests
  - notify-qa-team
```

#### `dev` (Development)
```yaml
on:
  push:
    branches: [dev]

jobs:
  - lint
  - test-unit
  - build-dev
  - deploy-dev
```

#### Feature Branches
```yaml
on:
  pull_request:
    branches: [dev]

jobs:
  - lint
  - test-unit
  - build-check
  - preview-deploy (optional)
```

### Deployment Environments

| Branch    | Environment | URL                                    | Auto Deploy |
|-----------|-------------|----------------------------------------|-------------|
| `main`    | Production  | https://futuratickets.com              | ✅ Yes      |
| `staging` | Staging     | https://staging.futuratickets.com      | ✅ Yes      |
| `dev`     | Development | https://dev.futuratickets.com          | ✅ Yes      |
| `feature/*` | Preview   | https://<branch>.preview.futuratickets.com | ⚠️ Optional |

---

## Branch Protection Rules

### `main` Branch

**GitHub Settings**:
```json
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "lint",
      "test-unit",
      "test-integration",
      "test-e2e",
      "security-scan",
      "build"
    ]
  },
  "enforce_admins": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_signatures": true
}
```

### `staging` Branch

```json
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "required_status_checks": {
    "strict": true,
    "contexts": ["lint", "test-unit", "test-integration", "build"]
  },
  "enforce_admins": true,
  "allow_force_pushes": false
}
```

### `dev` Branch

```json
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "required_status_checks": {
    "contexts": ["lint", "test-unit"]
  },
  "allow_force_pushes": false
}
```

---

## Casos de Uso Comunes

### Caso 1: Desarrollar Nueva Feature

```bash
# Crear worktree para feature
./scripts/worktree-create.sh feature/user-dashboard dev

cd ../futuratickets-feature-user-dashboard

# Desarrollar
npm run dev
# ... código ...

# Commit
git add .
git commit -m "feat(admin): implement user dashboard"

# Push y crear PR
git push -u origin feature/user-dashboard
gh pr create --base dev --title "Implement user dashboard"

# Después del merge
cd ~/monorepo-futuratickets
git worktree remove ../futuratickets-feature-user-dashboard
```

### Caso 2: Testing en Staging

```bash
# Mergear features completadas a staging
git checkout staging
git merge dev
git push origin staging

# Auto-deploy a staging ocurre

# QA tester puede usar worktree
git worktree add ../futuratickets-qa staging
cd ../futuratickets-qa
npm install
npm run test:e2e
```

### Caso 3: Hotfix Urgente

```bash
# Crear hotfix sin interrumpir trabajo actual
./scripts/worktree-create.sh hotfix/critical-payment-bug main

cd ../futuratickets-hotfix-critical-payment-bug

# Fix rápido
# ... código ...

git add .
git commit -m "fix(payment): resolve critical timeout issue"

# Merge a main
git push -u origin hotfix/critical-payment-bug
gh pr create --base main --title "HOTFIX: Critical payment bug"

# Después del merge a main, mergear a staging y dev
git checkout staging
git merge main
git push origin staging

git checkout dev
git merge main
git push origin dev
```

### Caso 4: Desarrollo Paralelo

```bash
# Trabaja en múltiples features simultáneamente

# Feature 1: Backend
./scripts/worktree-create.sh feature/api-improvements dev
cd ../futuratickets-feature-api-improvements
code .

# Feature 2: Frontend (terminal diferente)
./scripts/worktree-create.sh feature/ui-redesign dev
cd ../futuratickets-feature-ui-redesign
code .

# Ambos desarrollos avanzan en paralelo
# Sin conflictos, sin stash, sin interrupciones
```

### Caso 5: Release Planning

```bash
# 1. Verificar que staging está estable
cd ~/futuratickets-staging
npm run test:all

# 2. Crear release branch
git checkout staging
git pull origin staging
git checkout -b release/v2.0.0

# 3. Actualizar versiones y changelog
# Editar package.json, CHANGELOG.md
git commit -m "chore: prepare release v2.0.0"

# 4. Merge a main
git checkout main
git merge release/v2.0.0
git tag -a v2.0.0 -m "Release v2.0.0 - Major platform update"
git push origin main --tags

# 5. Sincronizar con otras ramas
git checkout staging && git merge release/v2.0.0 && git push
git checkout dev && git merge release/v2.0.0 && git push
```

---

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT FLOW                         │
└─────────────────────────────────────────────────────────────────┘

feature/a ──┐
            ├──> dev ──> staging ──> release/vX.X.X ──> main (PROD)
feature/b ──┘       ▲                                      │
                    │                                      │
bugfix/x ───────────┘                                      │
                                                           │
hotfix/critical ───────────────────────────────────────────┘
      │
      └──> staging ──> dev (sync back)


┌─────────────┬─────────────┬─────────────┬─────────────┐
│   feature   │     dev     │   staging   │    main     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Development │ Integration │ QA Testing  │ Production  │
│ Active work │ CI tests    │ Manual test │ Live users  │
│ No deploy   │ Dev server  │ Staging srv │ Prod server │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## Scripts de Ayuda

### Crear Feature Branch con Worktree

```bash
./scripts/worktree-create.sh feature/my-feature dev
```

### Limpiar Branches Mergeadas

```bash
# Dry run (solo muestra)
./scripts/worktree-cleanup.sh

# Ejecutar limpieza
./scripts/worktree-cleanup.sh --force
```

### Sync All Branches

```bash
# Crear script para sincronizar
./scripts/sync-branches.sh
```

---

## Checklist de Pull Request

### Para merge a `dev`:
- [ ] Código sigue style guide
- [ ] Tests unitarios pasan
- [ ] Linting pasa
- [ ] Sin conflictos con dev
- [ ] Descripción clara del cambio

### Para merge a `staging`:
- [ ] Todos los checks de dev ✅
- [ ] Tests de integración pasan
- [ ] Features completas (no a medias)
- [ ] Documentación actualizada

### Para merge a `main`:
- [ ] Todos los checks de staging ✅
- [ ] QA aprobado
- [ ] Tests E2E pasan
- [ ] Security scan limpio
- [ ] 2+ reviewers aprobaron
- [ ] Release notes preparadas
- [ ] CHANGELOG.md actualizado

---

## Troubleshooting

### Branch está desactualizado

```bash
# Actualizar feature branch con cambios de dev
git checkout feature/my-feature
git fetch origin
git merge origin/dev
# Resolver conflictos si hay
git push
```

### Merge conflict en staging

```bash
git checkout staging
git fetch origin
git merge origin/dev
# Resolver conflictos
git mergetool  # o resolver manualmente
git commit
git push origin staging
```

### Hotfix debe aplicarse a múltiples branches

```bash
# Después de merge a main
for branch in staging dev; do
  git checkout $branch
  git merge main
  git push origin $branch
done
```

---

## Referencias

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Worktrees Guide](./GIT_WORKTREES_GUIDE.md)

---

## Resumen Rápido

```bash
# Ramas permanentes
main     → Producción (protected)
staging  → QA/Pre-producción (protected)
dev      → Desarrollo activo (semi-protected)

# Ramas temporales
feature/* → Nuevas funcionalidades (desde dev)
bugfix/*  → Corrección de bugs (desde dev)
hotfix/*  → Fixes urgentes (desde main)
release/* → Preparación de releases (desde staging)

# Flujo normal
feature → dev → staging → release → main

# Flujo hotfix
hotfix → main → staging → dev

# Comandos útiles
./scripts/worktree-create.sh <branch-name> <base-branch>
./scripts/worktree-cleanup.sh --force
gh pr create --base dev
git worktree list
```

---

**Última actualización**: 2025-10-16
**Versión**: 1.0.0
