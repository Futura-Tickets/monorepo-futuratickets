# Team Onboarding - Git Workflow

Guía de onboarding para el equipo sobre el nuevo workflow de Git con branching strategy y worktrees.

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Setup Inicial](#setup-inicial)
3. [Workflow Diario](#workflow-diario)
4. [Comandos Esenciales](#comandos-esenciales)
5. [Casos de Uso](#casos-de-uso)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Resumen Ejecutivo

Hemos implementado un workflow profesional de Git que incluye:

- **3 branches principales**: `main` (producción), `staging` (QA), `dev` (desarrollo)
- **Git Worktrees**: Trabajo en múltiples features simultáneamente
- **CI/CD automatizado**: GitHub Actions ejecuta tests en cada push/PR
- **Branch protection**: Reglas de protección para garantizar calidad

### Beneficios

- ✅ Desarrollo paralelo sin conflictos
- ✅ No más `git stash` constante
- ✅ Hotfixes sin interrumpir tu trabajo
- ✅ CI/CD automático verifica calidad
- ✅ PRs con template y checklists

---

## Setup Inicial

### 1. Actualizar tu repositorio local

```bash
# Ve al directorio del monorepo
cd ~/monorepo-futuratickets

# Sincroniza todas las branches
./scripts/sync-branches.sh

# Verifica el estado
./scripts/git-status.sh
```

### 2. Configurar Git (opcional pero recomendado)

```bash
# Tu nombre y email (si no está configurado)
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@futuratickets.com"

# Configurar editor por defecto
git config --global core.editor "code --wait"  # VSCode
# O: git config --global core.editor "nano"    # Nano

# Habilitar colores
git config --global color.ui auto
```

### 3. Instalar GitHub CLI (si no lo tienes)

```bash
# macOS
brew install gh

# Login
gh auth login
```

### 4. Leer documentación

- **Quick Start**: `docs/GIT_SETUP_SUMMARY.md`
- **Estrategia completa**: `docs/GIT_BRANCHING_STRATEGY.md`
- **Worktrees**: `docs/GIT_WORKTREES_GUIDE.md`

---

## Workflow Diario

### Desarrollo de Nueva Feature

```bash
# 1. Ver estado actual
./scripts/git-status.sh

# 2. Crear worktree para tu feature
./scripts/worktree-create.sh feature/mi-feature

# 3. Navegar al worktree
cd ../futuratickets-feature-mi-feature

# 4. Desarrollar
npm run dev
# ... escribir código ...

# 5. Commit frecuentes
git add .
git commit -m "feat(modulo): descripción del cambio"

# 6. Push a remote
git push -u origin feature/mi-feature

# 7. Crear PR cuando esté listo
gh pr create --base dev --title "Título descriptivo"

# 8. Después del merge, limpiar
cd ~/monorepo-futuratickets
git worktree remove ../futuratickets-feature-mi-feature
```

### Revisar PR de un compañero

```bash
# Opción 1: Crear worktree temporal
./scripts/worktree-create.sh review/pr-123 dev
cd ../futuratickets-review-pr-123
gh pr checkout 123
npm install && npm run dev

# Revisar código...

# Limpiar
cd ~/monorepo-futuratickets
git worktree remove ../futuratickets-review-pr-123
```

### Hotfix Urgente

```bash
# 1. Crear hotfix (NO interrumpe tu trabajo actual)
./scripts/worktree-create.sh hotfix/bug-critico

# 2. Navegar y fix
cd ../futuratickets-hotfix-bug-critico
# ... fix rápido ...

# 3. Commit y PR a main
git add .
git commit -m "fix: bug crítico en pagos"
git push -u origin hotfix/bug-critico
gh pr create --base main --title "HOTFIX: Bug crítico"

# 4. Después del merge, sincronizar
cd ~/monorepo-futuratickets
./scripts/sync-branches.sh
```

---

## Comandos Esenciales

### Ver Estado

```bash
# Dashboard completo de Git
./scripts/git-status.sh

# Ver branches
git branch -a

# Ver worktrees activos
git worktree list

# Ver PRs abiertas
gh pr list
```

### Worktrees

```bash
# Crear worktree (auto-detecta base branch)
./scripts/worktree-create.sh feature/nombre

# Crear con base explícita
./scripts/worktree-create.sh feature/nombre dev

# Listar worktrees
git worktree list

# Eliminar worktree
git worktree remove ../futuratickets-feature-nombre

# Limpiar worktrees mergeados
./scripts/worktree-cleanup.sh --force
```

### Branches

```bash
# Sincronizar todas las branches
./scripts/sync-branches.sh

# Cambiar de branch
git checkout dev
git checkout staging
git checkout main

# Ver diferencias entre branches
git diff dev..staging
```

### Pull Requests

```bash
# Crear PR
gh pr create --base dev --title "Título"

# Ver PRs
gh pr list
gh pr status

# Ver detalles de un PR
gh pr view 123

# Checkout de un PR
gh pr checkout 123

# Mergear PR (requiere aprobaciones)
gh pr merge 123 --squash
```

---

## Casos de Uso

### Caso 1: Feature Nueva

**Situación**: Necesitas desarrollar una nueva funcionalidad de checkout.

```bash
# Crear worktree
./scripts/worktree-create.sh feature/checkout-flow

# Navegar
cd ../futuratickets-feature-checkout-flow

# Desarrollar en futura-market-place-v2
cd futura-market-place-v2
npm run dev

# Commits frecuentes
git add .
git commit -m "feat(checkout): add step 1 - cart review"
# ... más desarrollo ...
git commit -m "feat(checkout): add step 2 - payment"

# Push y PR
git push -u origin feature/checkout-flow
gh pr create --base dev

# Limpiar después del merge
cd ~/monorepo-futuratickets
git worktree remove ../futuratickets-feature-checkout-flow
```

### Caso 2: Bug en Staging

**Situación**: QA reportó un bug en staging.

```bash
# Crear bugfix
./scripts/worktree-create.sh bugfix/validation-error

cd ../futuratickets-bugfix-validation-error

# Fix el bug
# ... código ...

git add .
git commit -m "fix(admin): validation error on event creation"
git push -u origin bugfix/validation-error

# PR a dev
gh pr create --base dev
```

### Caso 3: Trabajar en Múltiples Features

**Situación**: Trabajas en backend y frontend simultáneamente.

```bash
# Terminal 1: Backend
./scripts/worktree-create.sh feature/api-improvements
cd ../futuratickets-feature-api-improvements
cd futura-tickets-admin-api
npm run dev

# Terminal 2: Frontend (en paralelo)
./scripts/worktree-create.sh feature/ui-redesign
cd ../futuratickets-feature-ui-redesign
cd futura-tickets-admin
npm run dev

# Ambos desarrollos avanzan sin conflictos
```

### Caso 4: Emergency Hotfix

**Situación**: Bug crítico en producción, necesitas fix AHORA.

```bash
# Crear hotfix desde main
./scripts/worktree-create.sh hotfix/payment-timeout

cd ../futuratickets-hotfix-payment-timeout

# Fix rápido
cd futura-tickets-admin-api
# ... fix ...

git add .
git commit -m "fix: resolve payment gateway timeout"
git push -u origin hotfix/payment-timeout

# PR a main (urgente)
gh pr create --base main --title "🚨 HOTFIX: Payment timeout"

# Después del merge, sincronizar otras branches
cd ~/monorepo-futuratickets
./scripts/sync-branches.sh
```

---

## Troubleshooting

### Error: "Branch is already checked out"

**Problema**: Intentas hacer checkout de una branch que ya está en otro worktree.

**Solución**:
```bash
# Ver dónde está la branch
git worktree list

# Si no la necesitas, elimina el worktree
git worktree remove /path/to/worktree
```

### Error: "Cannot delete branch used by worktree"

**Problema**: Intentas eliminar una branch que está en uso por un worktree.

**Solución**:
```bash
# Primero elimina el worktree
git worktree list  # Ver ubicación
git worktree remove /path/to/worktree

# Luego elimina la branch
git branch -d nombre-branch
```

### Worktree no lista pero directorio existe

**Problema**: Eliminaste un worktree manualmente.

**Solución**:
```bash
# Limpiar referencias
git worktree prune

# Eliminar directorio si aún existe
rm -rf /path/to/worktree
```

### CI/CD falla en tu PR

**Problema**: Los tests o linting fallan en tu PR.

**Solución**:
```bash
# Ejecutar tests localmente
cd proyecto-afectado
npm run lint
npm run test

# Fix los errores
# ...

# Commit y push
git add .
git commit -m "fix: resolve linting issues"
git push
```

### No puedes mergear tu PR

**Problema**: GitHub dice "Not mergeable" o "Branch protection".

**Solución**:
1. **Falta aprobación**: Pide a un compañero que revise tu PR
2. **Tests fallan**: Fix los tests (ver arriba)
3. **Conflictos**: Actualiza tu branch:
   ```bash
   git checkout feature/mi-feature
   git fetch origin
   git merge origin/dev
   # Resolver conflictos
   git push
   ```

---

## FAQ

### ¿Qué es un worktree?

Un worktree es un directorio de trabajo adicional del mismo repositorio. Te permite tener múltiples branches activas al mismo tiempo en diferentes carpetas.

### ¿Cuándo usar worktrees?

- Trabajar en múltiples features simultáneamente
- Hacer hotfix urgente sin interrumpir tu trabajo
- Code review de PRs sin cambiar de branch
- Testing en diferentes branches

### ¿Cuándo NO usar worktrees?

- Para trabajo simple en una sola feature
- Si prefieres el workflow tradicional de `git checkout`

### ¿A qué branch hago PR?

- **Features/Bugfixes** → `dev`
- **Hotfixes** → `main` (luego se sincroniza a dev/staging)
- **Releases** → De `staging` a `main`

### ¿Cuántas aprobaciones necesito?

- **PR a main**: 2 aprobaciones mínimo
- **PR a staging**: 1 aprobación mínimo
- **PR a dev**: 1 aprobación mínimo

### ¿Qué pasa si hago push directo a main/staging/dev?

No puedes. Las branches están protegidas. Todos los cambios deben ir vía Pull Request (excepto admins con override).

### ¿Cómo actualizo mi feature branch con cambios de dev?

```bash
cd futuratickets-feature-mi-feature
git fetch origin
git merge origin/dev
# Resolver conflictos si hay
git push
```

### ¿Puedo tener múltiples worktrees de la misma branch?

No. Git no permite tener la misma branch checked out en múltiples worktrees.

### ¿Los worktrees comparten dependencias npm?

No. Cada worktree tiene su propio `node_modules`. Esto asegura aislamiento pero usa más espacio.

### ¿Cómo limpio worktrees viejos?

```bash
# Ver worktrees activos
git worktree list

# Limpiar worktrees mergeados
./scripts/worktree-cleanup.sh --force

# O eliminar uno específico
git worktree remove /path/to/worktree
```

---

## Convenciones de Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Tipos:
- `feat:` - Nueva funcionalidad
- `fix:` - Bug fix
- `docs:` - Documentación
- `style:` - Formato (no afecta código)
- `refactor:` - Refactoring
- `test:` - Tests
- `chore:` - Mantenimiento

### Ejemplos:
```bash
git commit -m "feat(marketplace): add filters to event list"
git commit -m "fix(admin): resolve permissions issue"
git commit -m "docs: update API documentation"
git commit -m "test(auth): add authentication tests"
```

---

## Convenciones de Branch Names

```
<type>/<description-kebab-case>
```

### Ejemplos:
```
✅ feature/user-authentication
✅ bugfix/payment-validation
✅ hotfix/critical-security-bug
✅ release/v2.0.0

❌ new-feature (sin tipo)
❌ Feature/My_Feature (mayúsculas/snake_case)
```

---

## Recursos

### Documentación
- [Git Setup Summary](./GIT_SETUP_SUMMARY.md) - Quick reference
- [Git Branching Strategy](./GIT_BRANCHING_STRATEGY.md) - Estrategia completa
- [Git Worktrees Guide](./GIT_WORKTREES_GUIDE.md) - Guía de worktrees
- [GitHub Setup](./GITHUB_SETUP.md) - Configuración de GitHub
- [Scripts README](../scripts/README.md) - Documentación de scripts

### Scripts útiles
```bash
./scripts/git-status.sh         # Ver estado completo
./scripts/worktree-create.sh    # Crear worktree
./scripts/worktree-cleanup.sh   # Limpiar worktrees
./scripts/sync-branches.sh      # Sincronizar branches
```

### Ayuda
- **Issues técnicos**: Abre un issue en GitHub
- **Dudas de workflow**: Pregunta en el canal de #dev
- **Documentación oficial**: [Git Docs](https://git-scm.com/doc)

---

## Checklist de Onboarding

- [ ] Actualizar repositorio local (`./scripts/sync-branches.sh`)
- [ ] Instalar GitHub CLI (`brew install gh` + `gh auth login`)
- [ ] Leer `docs/GIT_SETUP_SUMMARY.md`
- [ ] Crear tu primer worktree de prueba
- [ ] Hacer un commit de prueba
- [ ] Crear un PR de prueba
- [ ] Familiarizarte con `./scripts/git-status.sh`
- [ ] Revisar el PR template
- [ ] Entender las convenciones de commits
- [ ] Pregunta dudas al equipo

---

**Bienvenido al nuevo workflow! 🚀**

Si tienes dudas, pregunta al equipo o consulta la documentación.

**Última actualización**: 2025-10-16
