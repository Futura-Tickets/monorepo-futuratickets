# 🚀 Crear Repositorios en GitHub - Guía Rápida

## ⚠️ IMPORTANTE: Encontramos un Secret de Stripe

Antes de subir, necesitas **eliminar** el secret de Stripe de `futura-market-place-api/claude.md`:

```bash
cd /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo/futura-market-place-api
nano claude.md
# Buscar: STRIPE_PRIVATE_KEY=sk_live_
# Cambiar a: STRIPE_PRIVATE_KEY=sk_live_XXXXXXXXXXXXX (ocultar)
```

---

## 📋 Opción 1: Crear con API de GitHub (Recomendado)

Copia y pega este comando en tu terminal:

```bash
# Reemplazar YOUR_GITHUB_TOKEN con tu token personal
# Crear token en: https://github.com/settings/tokens/new
# Scopes necesarios: repo, admin:org

TOKEN="YOUR_GITHUB_TOKEN"

for repo in futura-market-place-v2 futura-tickets-admin futura-tickets-admin-api futura-market-place-api futura-access-api futura-access-app futura-tickets-access-app futura-tickets-event futura-paginator futura-tickets-contracts-v2 futura-tickets-smartcontracts futura-tickets-rest-api integrations-scripts landingpage futura-tickets; do
  curl -H "Authorization: token $TOKEN" \
       -H "Accept: application/vnd.github.v3+json" \
       https://api.github.com/orgs/futuratickets/repos \
       -d "{\"name\":\"$repo\",\"private\":true}"
  echo "✅ Created $repo"
done
```

---

## 📋 Opción 2: Crear Manualmente (15 minutos)

Ve a: **https://github.com/organizations/futuratickets/repositories/new**

Crear estos 16 repositorios (todos **Private**, sin README ni .gitignore):

### Repositorios Activos (13):
1. ✅ futura-market-place-v2
2. ✅ futura-tickets-admin
3. ✅ futura-tickets-admin-api
4. ✅ futura-market-place-api
5. ✅ futura-access-api
6. ✅ futura-access-app
7. ✅ futura-tickets-access-app
8. ✅ futura-tickets-event
9. ✅ futura-paginator
10. ✅ futura-tickets-contracts-v2
11. ✅ futura-tickets-smartcontracts
12. ✅ futura-tickets-rest-api
13. ✅ integrations-scripts

### Repositorios Deprecados (2):
14. ✅ landingpage
15. ✅ futura-tickets

**Configuración para cada repo:**
- Owner: `futuratickets`
- Repository name: (copiar nombre exacto de la lista)
- Visibility: **Private** ✅
- ❌ NO marcar "Add a README file"
- ❌ NO agregar .gitignore
- ❌ NO agregar license

---

## 🎯 Después de Crear los Repositorios

Una vez creados todos los repositorios, ejecuta de nuevo el script:

```bash
cd /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo
./push-all-repos.sh
```

El script ahora:
- ✅ Ya NO está en DRY_RUN mode
- ✅ Detecta automáticamente su ubicación
- ✅ Maneja remotes existentes correctamente
- ✅ Pushea todos los repos de una vez

---

## 🔧 Si Necesitas GitHub CLI (Opcional)

Para futuras operaciones más rápidas:

```bash
# macOS
brew install gh

# Autenticar
gh auth login

# Crear todos los repos con un comando
gh repo create futuratickets/futura-market-place-v2 --private
gh repo create futuratickets/futura-tickets-admin --private
# ... (etc.)
```

---

## 📞 ¿Problemas?

**"No tengo permisos para crear repos en la org"**
- Verifica que eres owner/admin de la organización
- O crea la organización primero: https://github.com/organizations/new

**"No tengo la organización futuratickets"**
1. Ve a: https://github.com/organizations/new
2. Organization name: **futuratickets**
3. Plan: **Free**
4. Crear organización

---

**Última actualización:** 2025-10-13
