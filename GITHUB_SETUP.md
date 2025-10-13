# 🚀 Guía de Configuración en GitHub

Esta guía te ayudará a subir correctamente los 16 repositorios de FuturaTickets a tu organización de GitHub.

---

## 📋 IMPORTANTE: Estructura de Repositorios

Actualmente tienes una carpeta con **16 subdirectorios** (cada uno es un repositorio):

```
FuturaTickets_Full_Repo/
├── futura-market-place-v2/
├── futura-tickets-admin/
├── futura-access-api/
├── futura-market-place-api/
├── ... (12 más)
└── [archivos de documentación]
```

## 🎯 Dos Opciones de Configuración

### Opción 1: Monorepo (Recomendada para Documentación)

**Mantener esta carpeta como un solo repositorio de documentación y links:**

✅ **Ventajas:**
- Toda la documentación en un lugar
- ARCHITECTURE_OVERVIEW.md y PLAN_DE_SPRINTS.md centralizados
- Fácil de navegar para nuevos desarrolladores

❌ **Desventajas:**
- Los subdirectorios NO serán repositorios Git independientes
- No puedes tener CI/CD por repositorio
- No puedes configurar permisos granulares

**Pasos:**
```bash
cd /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo

# Inicializar Git
git init
git add .
git commit -m "docs: initial commit with ecosystem documentation"

# Crear repo en GitHub (Organization)
# https://github.com/organizations/futuratickets/repositories/new
# Nombre: FuturaTickets_Docs o FuturaTickets_Ecosystem

# Push
git remote add origin https://github.com/futuratickets/FuturaTickets_Docs.git
git branch -M main
git push -u origin main
```

---

### Opción 2: Repositorios Separados (Recomendada para Producción)

**Crear 16 repositorios independientes + 1 de documentación:**

✅ **Ventajas:**
- Cada repo tiene su propio CI/CD
- Permisos granulares por team
- Deploy independiente por servicio
- Historial de commits limpio por proyecto

❌ **Desventajas:**
- Más trabajo inicial de configuración
- Necesitas script para actualizar documentación en todos

**Estructura ideal:**
```
Organization: futuratickets
├── futura-market-place-v2          (repo independiente)
├── futura-tickets-admin            (repo independiente)
├── futura-tickets-admin-api        (repo independiente)
├── futura-market-place-api         (repo independiente)
├── futura-access-api               (repo independiente)
├── futura-access-app               (repo independiente)
├── futura-tickets-access-app       (repo independiente)
├── futura-tickets-event            (repo independiente)
├── futura-paginator                (repo independiente)
├── futura-tickets-contracts-v2     (repo independiente)
├── futura-tickets-smartcontracts   (repo independiente)
├── futura-tickets-rest-api         (repo independiente)
├── integrations-scripts            (repo independiente)
├── landingpage                     (repo independiente - deprecado)
├── futura-tickets                  (repo independiente - deprecado)
└── FuturaTickets_Docs              (repo de documentación)
    ├── ARCHITECTURE_OVERVIEW.md
    ├── PLAN_DE_SPRINTS.md
    ├── README.md (con links a todos los repos)
    └── ...
```

---

## 🛠️ IMPLEMENTACIÓN RECOMENDADA

### Paso 1: Crear Repositorio de Documentación

Este repositorio contendrá la documentación general del ecosistema:

```bash
# Crear una nueva carpeta para documentación
mkdir /Users/alejandrogarciacestero/Downloads/FuturaTickets_Docs
cd /Users/alejandrogarciacestero/Downloads/FuturaTickets_Docs

# Copiar archivos de documentación
cp /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/README.md .
cp /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/ARCHITECTURE_OVERVIEW.md .
cp /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/PLAN_DE_SPRINTS.md .
cp /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/CONTRIBUTING.md .
cp /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/LICENSE .
cp /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/SECURITY.md .
cp -r /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/.github .

# Inicializar Git
git init
git add .
git commit -m "docs: initial documentation commit"

# Crear repo en GitHub
# https://github.com/organizations/futuratickets/repositories/new
# Nombre: FuturaTickets_Docs
# Visibilidad: Private

# Push
git remote add origin https://github.com/futuratickets/FuturaTickets_Docs.git
git branch -M main
git push -u origin main
```

### Paso 2: Subir Cada Repositorio Individualmente

Para cada uno de los 16 repositorios:

```bash
# Ejemplo con futura-market-place-v2
cd /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/futura-market-place-v2

# Verificar si ya tiene .git (si lo tiene, omitir git init)
ls -la | grep .git

# Si NO tiene .git, inicializar
git init

# Copiar .gitignore del root (si no tiene uno)
cp ../.gitignore .

# Agregar archivos
git add .
git commit -m "chore: initial commit"

# Crear repo en GitHub
# https://github.com/organizations/futuratickets/repositories/new
# Nombre: futura-market-place-v2
# Visibilidad: Private

# Push
git remote add origin https://github.com/futuratickets/futura-market-place-v2.git
git branch -M main
git push -u origin main
```

**Repetir para cada repositorio:**
1. futura-market-place-v2
2. futura-tickets-admin
3. futura-tickets-admin-api
4. futura-market-place-api
5. futura-access-api
6. futura-access-app
7. futura-tickets-access-app
8. futura-tickets-event
9. futura-paginator
10. futura-tickets-contracts-v2
11. futura-tickets-smartcontracts
12. futura-tickets-rest-api
13. integrations-scripts
14. landingpage (marcar como archived)
15. futura-tickets (marcar como archived)

---

## 🤖 SCRIPT AUTOMATIZADO

He creado un script para automatizar el proceso:

```bash
#!/bin/bash
# push-all-repos.sh

REPOS=(
  "futura-market-place-v2"
  "futura-tickets-admin"
  "futura-tickets-admin-api"
  "futura-market-place-api"
  "futura-access-api"
  "futura-access-app"
  "futura-tickets-access-app"
  "futura-tickets-event"
  "futura-paginator"
  "futura-tickets-contracts-v2"
  "futura-tickets-smartcontracts"
  "futura-tickets-rest-api"
  "integrations-scripts"
)

BASE_DIR="/Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo"
ORG="futuratickets"

for repo in "${REPOS[@]}"; do
  echo "Processing $repo..."
  cd "$BASE_DIR/$repo"

  # Inicializar Git si no existe
  if [ ! -d ".git" ]; then
    git init
  fi

  # Copiar .gitignore si no existe
  if [ ! -f ".gitignore" ]; then
    cp "$BASE_DIR/.gitignore" .
  fi

  # Add y commit
  git add .
  git commit -m "chore: initial commit from ecosystem migration"

  # Agregar remote (puede fallar si ya existe, ignorar error)
  git remote add origin "https://github.com/$ORG/$repo.git" 2>/dev/null

  # Push (comentado para seguridad, descomentar cuando repos estén creados en GitHub)
  # git branch -M main
  # git push -u origin main

  echo "✅ $repo prepared"
  echo ""
done

echo "🎉 All repositories prepared!"
echo "⚠️  Remember to:"
echo "1. Create all repositories in GitHub Organization"
echo "2. Uncomment push lines in script"
echo "3. Run script again to push"
```

**Uso:**
```bash
chmod +x push-all-repos.sh
./push-all-repos.sh
```

---

## 🔧 Configuración Post-Push

### 1. Crear Teams en GitHub

Ve a: `https://github.com/orgs/futuratickets/teams`

Crear estos teams:
- `core-team`
- `frontend-team`
- `backend-team`
- `blockchain-team`
- `devops-team`
- `documentation-team`

### 2. Asignar Permisos por Team

Para cada team, ir a:
`https://github.com/orgs/futuratickets/teams/[team-name]/repositories`

**Frontend Team:**
- Agregar: futura-market-place-v2, futura-tickets-admin, futura-tickets-event, futura-paginator, futura-access-app, futura-tickets-access-app
- Rol: Write

**Backend Team:**
- Agregar: futura-tickets-admin-api, futura-market-place-api, futura-access-api, futura-tickets-rest-api
- Rol: Write

**Blockchain Team:**
- Agregar: futura-tickets-contracts-v2, futura-tickets-smartcontracts
- Rol: Write

**DevOps Team:**
- Agregar: Todos los repos
- Rol: Write

**Documentation Team:**
- Agregar: FuturaTickets_Docs
- Rol: Write

**Core Team:**
- Agregar: Todos los repos
- Rol: Admin

### 3. Configurar Branch Protection

Para cada repositorio, ir a:
`Settings > Branches > Add rule`

**Branch name pattern:** `main`

**Configuración:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require review from Code Owners
- ✅ Require status checks to pass (cuando configures CI/CD)
- ✅ Include administrators

### 4. Archivar Repositorios Deprecados

Para `landingpage` y `futura-tickets`:

1. Ir a: `Settings > General`
2. Scroll hasta "Danger Zone"
3. Click "Archive this repository"
4. Confirmar

---

## 📊 Resultado Final

Tendrás una organización con:

```
https://github.com/futuratickets
├── 📖 FuturaTickets_Docs (documentación general)
├── 🖥️  futura-market-place-v2
├── 🖥️  futura-tickets-admin
├── ⚙️  futura-tickets-admin-api
├── ⚙️  futura-market-place-api
├── ⚙️  futura-access-api
├── 📱 futura-access-app
├── 📱 futura-tickets-access-app
├── 🖥️  futura-tickets-event
├── 🖥️  futura-paginator
├── 🔗 futura-tickets-contracts-v2
├── 🔗 futura-tickets-smartcontracts
├── ⚙️  futura-tickets-rest-api
├── 🛠️  integrations-scripts
├── 📦 landingpage (archived)
└── 📦 futura-tickets (archived)
```

---

## ✅ Checklist Final

### Antes de Push
- [ ] Verificar NO hay secrets en código (`grep -r "sk_live" .`)
- [ ] Verificar NO hay .env con passwords
- [ ] Cada repo tiene .gitignore apropiado
- [ ] CLAUDE.md existe en cada repo (si aplica)

### Durante Setup
- [ ] Crear organización `futuratickets` en GitHub
- [ ] Crear todos los repositorios (Private)
- [ ] Crear teams (core, frontend, backend, blockchain, devops, docs)
- [ ] Asignar miembros a teams

### Después de Push
- [ ] Configurar branch protection en `main`
- [ ] Asignar teams a repositorios
- [ ] Verificar CODEOWNERS funciona
- [ ] Archivar repos deprecados
- [ ] Actualizar README.md de FuturaTickets_Docs con links a todos los repos

---

## 🆘 Troubleshooting

**Error: "remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/futuratickets/[repo-name].git
```

**Error: "authentication failed"**
```bash
# Usar GitHub CLI (recomendado)
gh auth login

# O usar token personal
# Settings > Developer settings > Personal access tokens > Generate new token
# Scopes: repo, admin:org
```

**Error: "repository not found"**
- Verificar que el repositorio existe en GitHub
- Verificar permisos de tu cuenta
- Verificar nombre del repo (case-sensitive)

---

## 📞 Soporte

Si tienes problemas:
- Email: support@futuratickets.com
- Revisar: [GitHub Docs - Creating a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)

---

**Última actualización:** 2025-10-13
