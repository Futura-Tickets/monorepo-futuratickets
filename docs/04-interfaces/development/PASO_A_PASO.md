# 🚀 Subir Todos los Repos a GitHub - PASO A PASO

## ✅ Estado Actual

El script `push-all-repos.sh` está **listo** y configurado:
- ✅ DRY_RUN=false (modo producción)
- ✅ Detecta automáticamente su ubicación
- ✅ Maneja remotes existentes correctamente
- ✅ Verifica secrets antes de subir
- ✅ Procesa 16 repositorios en una ejecución

## ⚠️ Lo Único Que Falta

**Los repositorios NO existen en GitHub todavía.**

Error actual:
```
remote: Repository not found.
fatal: repository 'https://github.com/futuratickets/futura-market-place-v2.git/' not found
```

---

## 🎯 Solución: Crear los Repositorios

### Opción 1: Con API de GitHub (5 minutos) ⭐ RECOMENDADO

#### Paso 1: Obtener Token Personal

1. Ve a: https://github.com/settings/tokens/new
2. Token name: `futuratickets-repos-setup`
3. Expiration: `7 days`
4. Scopes a seleccionar:
   - ✅ `repo` (Full control of repositories)
   - ✅ `admin:org` (Full control of orgs and teams)
5. Click **Generate token**
6. **COPIAR el token** (solo se muestra una vez)

#### Paso 2: Ejecutar Script de Creación

```bash
cd /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo

# Reemplazar YOUR_TOKEN con tu token
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Ejecutar script de creación
cat > create-all-repos.sh << 'EOF'
#!/bin/bash
TOKEN="$GITHUB_TOKEN"
ORG="futuratickets"

repos=(
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
  "landingpage"
  "futura-tickets"
)

echo "🚀 Creating ${#repos[@]} repositories in GitHub..."
echo ""

for repo in "${repos[@]}"; do
  echo "Creating: $repo"

  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/orgs/$ORG/repos \
    -d "{\"name\":\"$repo\",\"private\":true,\"auto_init\":false}")

  http_code=$(echo "$response" | tail -n1)

  if [ "$http_code" = "201" ]; then
    echo "✅ Created: $repo"
  elif [ "$http_code" = "422" ]; then
    echo "⚠️  Already exists: $repo"
  else
    echo "❌ Error creating $repo (HTTP $http_code)"
  fi
  echo ""
done

echo "✅ Done! All repositories created."
EOF

chmod +x create-all-repos.sh
./create-all-repos.sh
```

#### Paso 3: Verificar Creación

```bash
# Listar todos los repos de la organización
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/orgs/futuratickets/repos | grep '"name"'
```

Deberías ver:
```json
"name": "futura-market-place-v2",
"name": "futura-tickets-admin",
...
```

---

### Opción 2: Manual (15 minutos)

Si prefieres hacerlo manualmente:

1. Ve a: https://github.com/organizations/futuratickets/repositories/new

2. Para CADA repositorio de esta lista, crear uno con:
   - Owner: `futuratickets`
   - Repository name: (copiar exacto de la lista)
   - Visibility: **Private** ✅
   - ❌ **NO marcar** "Add a README file"
   - ❌ **NO agregar** .gitignore
   - ❌ **NO agregar** license

**Lista de 16 repositorios:**

```
□ futura-market-place-v2
□ futura-tickets-admin
□ futura-tickets-admin-api
□ futura-market-place-api
□ futura-access-api
□ futura-access-app
□ futura-tickets-access-app
□ futura-tickets-event
□ futura-paginator
□ futura-tickets-contracts-v2
□ futura-tickets-smartcontracts
□ futura-tickets-rest-api
□ integrations-scripts
□ landingpage
□ futura-tickets
```

---

## 🎉 Paso Final: Ejecutar Push

Una vez creados todos los repositorios:

```bash
cd /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo

# Ejecutar script (tarda ~5-10 minutos)
./push-all-repos.sh
```

**Qué va a pasar:**
1. ✅ Procesará los 16 repositorios uno por uno
2. ✅ Verificará que no hay secrets
3. ⚠️  En `futura-market-place-api` preguntará si continuar (responder `y`)
4. ✅ Hará commit si hay cambios
5. ✅ Configurará remote de GitHub
6. ✅ Hará push de cada repo

**Output esperado:**
```
╔════════════════════════════════════════════════════════╗
║  FuturaTickets - GitHub Repository Setup Script       ║
╚════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Procesando: futura-market-place-v2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Git ya inicializado
✅ .gitignore ya existe
🔍 Verificando secrets...
📦 Agregando archivos...
✅ No hay cambios nuevos para commitear
🔗 Configurando remote: https://github.com/futuratickets/futura-market-place-v2.git
🔄 Actualizando remote existente...
🚀 Pushing a GitHub...
Enumerating objects: 1234, done.
Counting objects: 100% (1234/1234), done.
Writing objects: 100% (1234/1234), 5.67 MiB | 2.34 MiB/s, done.
✅ Push exitoso: futura-market-place-v2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Procesando: futura-tickets-admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...

╔════════════════════════════════════════════════════════╗
║                     RESUMEN                            ║
╚════════════════════════════════════════════════════════╝

Total repositorios: 16
✅ Exitosos: 16
❌ Fallidos: 0

🎉 Push completado!

📋 Próximos pasos:
1. Configurar teams en GitHub
2. Asignar permisos por team
3. Configurar branch protection
4. Archivar repos deprecados
```

---

## 🔧 Troubleshooting

### Error: "No tengo permisos para crear repos"

**Solución:** Necesitas ser owner/admin de la organización `futuratickets`

1. Ve a: https://github.com/orgs/futuratickets/people
2. Tu usuario debe tener rol "Owner" o "Admin"

---

### Error: "Organization not found"

**Solución:** Primero crear la organización

1. Ve a: https://github.com/organizations/new
2. Organization name: **futuratickets**
3. Contact email: support@futuratickets.com
4. Plan: **Free** (o el que prefieras)
5. This organization belongs to: **My personal account**
6. Click **Next** y completar setup

---

### Error: "Authentication failed" al push

**Solución:** Configurar autenticación de Git

**Opción A: GitHub CLI (recomendado)**
```bash
brew install gh
gh auth login
# Seleccionar: GitHub.com > HTTPS > Yes (authenticate)
```

**Opción B: Token Personal**
```bash
git config --global credential.helper osxkeychain
# Al hacer push, usar:
# Username: tu-usuario-github
# Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (tu token)
```

**Opción C: SSH**
```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "support@futuratickets.com"

# Agregar a GitHub
cat ~/.ssh/id_ed25519.pub
# Copiar y pegar en: https://github.com/settings/ssh/new

# Cambiar URLs en script a SSH
# En push-all-repos.sh cambiar:
# REMOTE_URL="git@github.com:$ORG/$repo.git"
```

---

## 📊 Después del Push

### 1. Verificar Repositorios

```bash
# Listar repos
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/orgs/futuratickets/repos?per_page=100 | \
     jq -r '.[].name'
```

### 2. Crear Teams

Ver: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md#3️⃣-crear-teams-5-min)

### 3. Asignar Permisos

Ver: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md#7️⃣-configurar-permisos-de-teams-10-min)

---

## 🎯 Resumen

**Lo que tienes que hacer:**

1. ✅ Crear token personal en GitHub
2. ✅ Ejecutar `create-all-repos.sh` (O crear manualmente 16 repos)
3. ✅ Verificar que los repos existen
4. ✅ Ejecutar `./push-all-repos.sh`
5. ✅ Esperar 5-10 minutos
6. ✅ ¡Listo!

**Tiempo total:** ~15-20 minutos

---

**Última actualización:** 2025-10-13
