# 🚀 Subir Todos los Repositorios a GitHub

## ⚡ Resumen Ultra-Rápido

```bash
# 1. Obtener token de GitHub
# https://github.com/settings/tokens/new
# Scopes: repo, admin:org

# 2. Configurar token
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 3. Crear todos los repositorios (5 min)
./create-all-repos.sh

# 4. Subir todo el código (5-10 min)
./push-all-repos.sh
```

**Total: 10-15 minutos** ⏱️

---

## 📋 Estado Actual

### ✅ Listo
- Script de creación de repos (`create-all-repos.sh`)
- Script de push (`push-all-repos.sh`)
- Todos los repositorios con git inicializado
- .gitignore en cada repo
- Remotes configurados

### ⚠️ Falta
- Crear los 16 repositorios en GitHub
- Hacer push del código

---

## 🎯 Paso 1: Obtener Token de GitHub

### Opción A: Interfaz Web

1. Ve a: https://github.com/settings/tokens/new

2. Configuración del token:
   ```
   Note: futuratickets-repos-setup
   Expiration: 7 days

   Scopes:
   ✅ repo (Full control of repositories)
   ✅ admin:org (Full control of orgs and teams)
   ```

3. Click **"Generate token"**

4. **COPIAR el token** (solo se muestra una vez)
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Opción B: GitHub CLI

```bash
# Instalar GitHub CLI
brew install gh

# Autenticar
gh auth login

# El token se guarda automáticamente
```

---

## 🎯 Paso 2: Crear Repositorios

```bash
cd /Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo

# Configurar token
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Ejecutar script de creación
./create-all-repos.sh
```

### Output Esperado

```
╔════════════════════════════════════════════════════════╗
║  FuturaTickets - GitHub Repositories Creation Script  ║
╚════════════════════════════════════════════════════════╝

🔑 Token configurado: ghp_xxxx...xxxx
📦 Organización: futuratickets
📊 Repositorios a crear: 16

🔍 Verificando organización...
✅ Organización encontrada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Creando: futura-market-place-v2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Repositorio creado exitosamente
   URL: https://github.com/futuratickets/futura-market-place-v2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Creando: futura-tickets-admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Repositorio creado exitosamente
   URL: https://github.com/futuratickets/futura-tickets-admin

... (14 más)

╔════════════════════════════════════════════════════════╗
║                     RESUMEN                            ║
╚════════════════════════════════════════════════════════╝

Total repositorios: 16
✅ Creados: 16
⚠️  Ya existían: 0
❌ Fallidos: 0

🎉 ¡Perfecto! Todos los repositorios están listos

📋 Próximo paso:

./push-all-repos.sh

Esto subirá el código de los 16 repositorios a GitHub.

✨ Done!
```

---

## 🎯 Paso 3: Subir Código

```bash
# Ejecutar script de push (tarda 5-10 minutos)
./push-all-repos.sh
```

### Output Esperado

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
💾 Creando commit...
[main a1b2c3d] chore: initial commit from ecosystem migration
 324 files changed, 45678 insertions(+)
🔗 Configurando remote: https://github.com/futuratickets/futura-market-place-v2.git
🔄 Actualizando remote existente...
🚀 Pushing a GitHub...
Enumerating objects: 1234, done.
Counting objects: 100% (1234/1234), done.
Delta compression using up to 8 threads
Compressing objects: 100% (987/987), done.
Writing objects: 100% (1234/1234), 5.67 MiB | 2.34 MiB/s, done.
Total 1234 (delta 234), reused 0 (delta 0)
remote: Resolving deltas: 100% (234/234), done.
To https://github.com/futuratickets/futura-market-place-v2.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
✅ Push exitoso: futura-market-place-v2

... (15 repos más)

╔════════════════════════════════════════════════════════╗
║                     RESUMEN                            ║
╚════════════════════════════════════════════════════════╝

Total repositorios: 16
✅ Exitosos: 16
❌ Fallidos: 0

🎉 Push completado!

📋 Próximos pasos:
1. Configurar teams en GitHub:
   https://github.com/orgs/futuratickets/teams

2. Asignar permisos por team (ver GITHUB_SETUP.md)

3. Configurar branch protection en main

4. Archivar repos deprecados (landingpage, futura-tickets):
   Settings > General > Archive this repository

✨ Done!
```

---

## 🔧 Troubleshooting

### Error: "GITHUB_TOKEN no está configurado"

**Solución:**
```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

### Error: "Organización 'futuratickets' no existe"

**Solución:** Crear organización primero

1. Ve a: https://github.com/organizations/new
2. Organization name: **futuratickets**
3. Contact email: support@futuratickets.com
4. Plan: **Free**
5. Click **"Create organization"**

---

### Error: "No tienes permisos para crear repos"

**Solución:** Ser owner/admin de la organización

1. Ve a: https://github.com/orgs/futuratickets/people
2. Asegúrate de tener rol **"Owner"**

---

### Error: "Authentication failed" durante push

**Solución:** Configurar credenciales de Git

**Opción A: GitHub CLI**
```bash
brew install gh
gh auth login
```

**Opción B: Usar token como password**
```bash
# Username: tu-usuario-github
# Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### ⚠️ Advertencia sobre futura-market-place-api

Durante el push, el script detectará un secret de Stripe y preguntará:

```
./claude.md:STRIPE_PRIVATE_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
⚠️  ADVERTENCIA: Posibles secrets encontrados (sk_live_)

¿Continuar de todos modos? (y/n)
```

**Responder:** `y` (el secret ya está ofuscado con xxx)

---

## 📊 Estructura Final en GitHub

Después del push tendrás:

```
https://github.com/futuratickets
├── 📦 futura-market-place-v2        (Private)
├── 📦 futura-tickets-admin          (Private)
├── 📦 futura-tickets-admin-api      (Private)
├── 📦 futura-market-place-api       (Private)
├── 📦 futura-access-api             (Private)
├── 📦 futura-access-app             (Private)
├── 📦 futura-tickets-access-app     (Private)
├── 📦 futura-tickets-event          (Private)
├── 📦 futura-paginator              (Private)
├── 📦 futura-tickets-contracts-v2   (Private)
├── 📦 futura-tickets-smartcontracts (Private)
├── 📦 futura-tickets-rest-api       (Private)
├── 📦 integrations-scripts          (Private)
├── 📦 landingpage                   (Private - deprecado)
└── 📦 futura-tickets                (Private - deprecado)
```

---

## ✅ Checklist

```
□ Token de GitHub obtenido
□ Token configurado (export GITHUB_TOKEN=...)
□ Script de creación ejecutado (./create-all-repos.sh)
□ 16 repositorios creados en GitHub
□ Script de push ejecutado (./push-all-repos.sh)
□ Todos los repos subidos exitosamente
```

---

## 📋 Próximos Pasos

Después del push:

1. **Crear teams** (5 min)
   - Ver: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md#3️⃣-crear-teams-5-min)

2. **Asignar permisos** (10 min)
   - Ver: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md#7️⃣-configurar-permisos-de-teams-10-min)

3. **Branch protection** (5 min)
   - Ver: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md#8️⃣-configurar-branch-protection-5-min-por-repo)

4. **Archivar deprecados** (2 min)
   - landingpage
   - futura-tickets

---

## 📞 Ayuda

- **Documentación completa:** [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)
- **Guía paso a paso:** [PASO_A_PASO.md](./PASO_A_PASO.md)
- **Guía de GitHub:** [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Inicio rápido:** [QUICK_START.md](./QUICK_START.md)

---

**Última actualización:** 2025-10-13
