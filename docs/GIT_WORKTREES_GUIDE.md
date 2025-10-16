# Git Worktrees Guide - FuturaTickets

Esta guía explica cómo usar Git Worktrees para trabajar en múltiples features simultáneamente con Claude Code o cualquier editor.

## ¿Qué son Git Worktrees?

Git Worktrees te permiten tener **múltiples directorios de trabajo del mismo repositorio** al mismo tiempo, cada uno en un branch diferente.

### Beneficios

- ✅ **Desarrollo Paralelo**: Trabaja en múltiples features sin cambiar de branch
- ✅ **Testing Rápido**: Prueba diferentes versions simultáneamente
- ✅ **Code Review**: Revisa PRs mientras sigues desarrollando
- ✅ **Hotfixes**: Crea hotfixes urgentes sin interrumpir tu trabajo actual
- ✅ **Claude Sessions**: Corre múltiples sesiones de Claude Code en diferentes branches
- ✅ **Sin Stash**: No necesitas hacer `git stash` constantemente
- ✅ **Espacio Eficiente**: Comparten el mismo .git repository

## Estructura Típica

```
~/Projects/
├── futuratickets/              # Main worktree (branch: main)
├── futuratickets-feature-auth/ # Worktree para feature/authentication
├── futuratickets-bugfix-123/   # Worktree para bugfix/issue-123
└── futuratickets-hotfix/       # Worktree para hotfix/critical-bug
```

## Comandos Básicos

### Crear un Worktree

```bash
# Crear worktree para un nuevo branch
git worktree add ../futuratickets-feature-auth -b feature/authentication

# Crear worktree desde un branch existente
git worktree add ../futuratickets-bugfix-123 bugfix/issue-123

# Crear worktree desde un branch remoto
git worktree add ../futuratickets-dev origin/development
```

### Listar Worktrees

```bash
git worktree list
```

Salida ejemplo:
```
/Users/user/futuratickets              abc1234 [main]
/Users/user/futuratickets-feature-auth def5678 [feature/authentication]
/Users/user/futuratickets-bugfix-123   ghi9012 [bugfix/issue-123]
```

### Eliminar un Worktree

```bash
# Opción 1: Eliminar directorio y luego limpiar
rm -rf ../futuratickets-feature-auth
git worktree prune

# Opción 2: Usando git worktree remove
git worktree remove ../futuratickets-feature-auth

# Forzar eliminación (incluso con cambios sin commitear)
git worktree remove --force ../futuratickets-feature-auth
```

### Moverse entre Worktrees

```bash
# Simplemente usa cd
cd ../futuratickets-feature-auth

# O abre en un nuevo editor
code ../futuratickets-feature-auth
```

## Workflows Comunes

### 1. Feature Development

```bash
# En el worktree principal
cd ~/futuratickets

# Crear worktree para nueva feature
git worktree add ../futuratickets-nft-integration -b feature/nft-integration

# Trabajar en el nuevo worktree
cd ../futuratickets-nft-integration

# Instalar dependencias (si es necesario)
npm install

# Desarrollar...
# ...

# Commit y push
git add .
git commit -m "feat: implement NFT integration"
git push -u origin feature/nft-integration

# Volver al worktree principal
cd ~/futuratickets

# Continuar con tu trabajo original sin interrupciones
```

### 2. Code Review

```bash
# Crear worktree temporal para revisar un PR
git worktree add ../futuratickets-review-pr-45 origin/feature/user-dashboard

cd ../futuratickets-review-pr-45

# Instalar dependencias y revisar
npm install
npm run dev

# Hacer comentarios, etc.
# ...

# Cuando termines, eliminar el worktree
cd ~/futuratickets
git worktree remove ../futuratickets-review-pr-45
```

### 3. Hotfix Urgente

```bash
# Crear worktree desde main para hotfix
git worktree add ../futuratickets-hotfix -b hotfix/critical-payment-bug main

cd ../futuratickets-hotfix

# Arreglar el bug
# ...

git add .
git commit -m "fix: critical payment processing bug"
git push -u origin hotfix/critical-payment-bug

# Crear PR y mergear rápidamente
# ...

# Volver a tu trabajo original
cd ~/futuratickets
git worktree remove ../futuratickets-hotfix
```

### 4. Multiple Claude Sessions

```bash
# Session 1: Backend API development
cd ~/futuratickets
claude

# Session 2 (en otra terminal): Frontend development
git worktree add ../futuratickets-frontend -b feature/dashboard-ui
cd ../futuratickets-frontend
npm install
claude

# Session 3 (en otra terminal): Testing
git worktree add ../futuratickets-testing origin/development
cd ../futuratickets-testing
npm install
npm test
```

## Scripts Útiles

### Script: `scripts/worktree-create.sh`

```bash
#!/bin/bash
# Usage: ./scripts/worktree-create.sh <branch-name> [base-branch]

BRANCH_NAME=$1
BASE_BRANCH=${2:-main}
WORKTREE_DIR="../futuratickets-${BRANCH_NAME}"

if [ -z "$BRANCH_NAME" ]; then
    echo "Usage: ./scripts/worktree-create.sh <branch-name> [base-branch]"
    exit 1
fi

# Create worktree
git worktree add "$WORKTREE_DIR" -b "$BRANCH_NAME" "$BASE_BRANCH"

# Install dependencies
cd "$WORKTREE_DIR"
echo "Installing dependencies in all projects..."

for dir in futura-tickets-admin-api futura-tickets-admin futura-market-place-v2; do
    if [ -d "$dir" ]; then
        echo "Installing in $dir..."
        cd "$dir"
        npm install
        cd ..
    fi
done

echo "Worktree created at: $WORKTREE_DIR"
```

### Script: `scripts/worktree-cleanup.sh`

```bash
#!/bin/bash
# Cleanup all merged worktrees

echo "Finding merged branches..."

# Get list of worktrees
git worktree list | while read -r line; do
    WORKTREE_PATH=$(echo "$line" | awk '{print $1}')
    BRANCH=$(echo "$line" | awk '{print $3}' | tr -d '[]')

    # Skip main worktree
    if [ "$BRANCH" == "main" ]; then
        continue
    fi

    # Check if branch is merged
    if git branch --merged main | grep -q "$BRANCH"; then
        echo "Removing merged worktree: $WORKTREE_PATH ($BRANCH)"
        git worktree remove "$WORKTREE_PATH"
    fi
done

# Prune any leftover references
git worktree prune

echo "Cleanup complete!"
```

## Best Practices

### 1. Naming Convention

Use prefijos descriptivos para tus worktrees:

```bash
futuratickets-feature-<name>   # Para features
futuratickets-bugfix-<id>      # Para bugfixes
futuratickets-hotfix-<name>    # Para hotfixes urgentes
futuratickets-review-pr-<id>   # Para code reviews
futuratickets-experiment-<name> # Para experimentos
```

### 2. Gestión de Dependencias

Cada worktree puede tener diferentes `node_modules`:

```bash
# Instalar dependencias en worktree nuevo
cd ../futuratickets-feature-auth
npm install  # Instala solo las necesarias para este branch
```

### 3. Limpieza Regular

Elimina worktrees que ya no necesites:

```bash
# Lista worktrees
git worktree list

# Elimina los que no uses
git worktree remove ../futuratickets-old-feature

# Limpia referencias
git worktree prune
```

### 4. No Compartas Git Objects Mutables

Evita hacer `git checkout` en múltiples worktrees simultáneamente. Cada worktree debe estar en un branch único.

### 5. Backup antes de Eliminar

```bash
# Si no estás seguro, haz backup
cp -r ../futuratickets-feature-auth ../backup-feature-auth
git worktree remove ../futuratickets-feature-auth
```

## Uso con Claude Code

### Workflow Recomendado

1. **Worktree Principal**: Mantén tu main worktree para navegación general
2. **Feature Worktrees**: Crea worktrees específicos para cada feature que Claude esté desarrollando
3. **Testing Worktree**: Mantén un worktree separado para pruebas automáticas

### Ejemplo: Desarrollo Paralelo

```bash
# Terminal 1: Claude desarrollando backend
cd ~/futuratickets-backend-api
claude code
# Pide a Claude: "Implement user authentication endpoint"

# Terminal 2: Claude desarrollando frontend (simultáneamente)
cd ~/futuratickets-frontend-ui
claude code
# Pide a Claude: "Create login form component"

# Terminal 3: Tests corriendo
cd ~/futuratickets-testing
npm test -- --watch
```

### Ventajas con Claude

- ✅ **Context Separation**: Cada sesión de Claude tiene contexto separado
- ✅ **No Conflicts**: No hay conflictos de archivos entre sesiones
- ✅ **Parallel Development**: Desarrolla backend y frontend simultáneamente
- ✅ **Independent Testing**: Prueba diferentes implementaciones en paralelo

## Troubleshooting

### Error: "fatal: '<path>' already exists"

**Problema**: Intentas crear un worktree en una ubicación que ya existe.

**Solución**:
```bash
# Elimina el directorio primero
rm -rf ../futuratickets-feature-auth

# O usa una ubicación diferente
git worktree add ../futuratickets-feature-auth-v2 -b feature/authentication
```

### Error: "fatal: '<branch>' is already checked out"

**Problema**: El branch ya está siendo usado en otro worktree.

**Solución**:
```bash
# Lista worktrees para ver dónde está el branch
git worktree list

# Usa otro branch o elimina el worktree existente
git worktree remove ../existing-worktree
```

### Worktree listado pero directorio no existe

**Problema**: Eliminaste un worktree manualmente sin usar `git worktree remove`.

**Solución**:
```bash
# Limpia referencias huérfanas
git worktree prune

# Verifica
git worktree list
```

### node_modules muy grande

**Problema**: Cada worktree tiene su propio `node_modules` ocupando espacio.

**Solución**:
```bash
# Usa links simbólicos para node_modules (con cuidado)
# O simplemente elimina node_modules de worktrees inactivos
cd ../futuratickets-old-feature
rm -rf */node_modules
```

## Alternativas

Si los worktrees no funcionan para ti, considera:

1. **Git Stash**: Guarda cambios temporalmente
2. **Branches**: Cambio rápido de branches con `git checkout`
3. **Multiple Clones**: Clona el repo múltiples veces (usa más espacio)
4. **Docker Volumes**: Monta diferentes branches en containers

## Referencias

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Pro Git Book - Git Worktrees](https://git-scm.com/book/en/v2)

---

## Quick Reference

```bash
# Crear
git worktree add <path> -b <branch>
git worktree add <path> <existing-branch>

# Listar
git worktree list

# Eliminar
git worktree remove <path>
git worktree prune

# Info
git worktree list --porcelain
```

**Happy parallel coding! 🚀**
