# Información Necesaria para Configurar MCPs 🔑

**Fecha**: 2025-10-14
**Propósito**: Lista completa de API keys y credenciales necesarias para activar todos los MCPs

---

## 📋 Resumen de MCPs

**Total MCPs instalados**: 16
- ✅ **Funcionando**: 5 (MongoDB, filesystem, git, docker, fetch)
- ⚠️ **Requieren configuración**: 11

---

## 🔴 ALTA PRIORIDAD (Usar en el proyecto)

### 1. Stripe MCP ⭐ CRÍTICO
**Package**: `@stripe/mcp`
**Uso**: Sistema de pagos de FuturaTickets

#### Información necesaria:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
```

#### ¿Dónde obtenerla?

1. **Ir a Stripe Dashboard**:
   - URL: https://dashboard.stripe.com/apikeys
   - Iniciar sesión con tu cuenta de Stripe

2. **Copiar Secret Key**:
   - En desarrollo: Usar "Test mode" → `sk_test_*`
   - En producción: Usar "Live mode" → `sk_live_*`

3. **Seguridad**:
   - ⚠️ NUNCA commitear esta key al repositorio
   - ✅ Usar keys de TEST para desarrollo
   - ✅ Rotar keys regularmente

#### Keys actuales en el proyecto:

**Admin API** (.env):
```bash
STRIPE_PUBLIC_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

**Marketplace API** (.env):
```bash
STRIPE_PUBLIC_KEY=pk_test_placeholder
STRIPE_PRIVATE_KEY=sk_test_placeholder
STRIPE_ENDPOINT_SECRET=whsec_placeholder
```

**⚠️ ACCIÓN**: Reemplazar los `placeholder` con keys reales de Stripe

#### Dónde actualizarlo:

**Para MCP**:
```json
// Archivo: ~/.config/claude-code/mcp_servers.json
{
  "stripe": {
    "env": {
      "STRIPE_SECRET_KEY": "sk_test_xxxxx"  // ← Pegar aquí
    }
  }
}
```

**Para las APIs**:
```bash
# futura-tickets-admin-api/.env
STRIPE_SECRET_KEY=sk_test_xxxxx

# futura-market-place-api/.env
STRIPE_PRIVATE_KEY=sk_test_xxxxx
```

---

### 2. Google Cloud MCP
**Package**: `@google-cloud/gcloud-mcp`
**Uso**: Gestión de Cloud Run, Storage, BigQuery

#### Información necesaria:

**NO requiere API key en el MCP**, pero necesitas:

```bash
# 1. Instalar gcloud CLI
brew install google-cloud-sdk

# 2. Autenticar
gcloud auth login
# Se abrirá browser para login

# 3. Configurar proyecto
gcloud config set project [PROJECT_ID]
```

#### ¿Cuál es tu PROJECT_ID?

Probablemente uno de estos:
- `futura-tickets`
- `futuratickets`
- `futura-tickets-prod`

**Para verificar proyectos disponibles**:
```bash
gcloud projects list
```

#### Variables de entorno actuales:

**Marketplace API** (.env):
```bash
FUTURA_MARKET_PLACE=http://localhost:3000
```

**Admin API** (.env):
```bash
# No tiene variables GCP actualmente
```

**⚠️ ACCIÓN**:
1. Instalar gcloud CLI
2. Hacer login
3. Configurar proyecto correcto

---

### 3. GitHub MCP
**Package**: `@modelcontextprotocol/server-github`
**Uso**: Gestionar repos, issues, PRs desde Claude

#### Información necesaria:

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

#### ¿Dónde obtenerla?

1. **Ir a GitHub Settings**:
   - URL: https://github.com/settings/tokens
   - Click "Generate new token (classic)"

2. **Configurar permisos**:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org and team membership)
   - ✅ `workflow` (Update GitHub Action workflows)

3. **Generar y copiar**:
   - Nombre: "Claude Code MCP"
   - Expiration: 90 days (renovar cada 3 meses)
   - Copiar el token **inmediatamente** (no se volverá a mostrar)

#### Dónde actualizarlo:

```json
// ~/.config/claude-code/mcp_servers.json
{
  "github": {
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxx"  // ← Pegar aquí
    }
  }
}
```

---

## 🟡 MEDIA PRIORIDAD (Opcional pero útil)

### 4. Jira MCP
**Package**: `@aashari/mcp-server-atlassian-jira`
**Uso**: Gestión de tickets y sprints

#### Información necesaria:

```bash
JIRA_URL=https://futuratickets.atlassian.net
JIRA_EMAIL=tu-email@futuratickets.com
JIRA_API_TOKEN=ATATxxxxxxxxxxxxxxxxxx
```

#### ¿Dónde obtenerla?

1. **JIRA_URL**:
   - Tu dominio de Jira Cloud
   - Formato: `https://[NOMBRE].atlassian.net`
   - Ejemplo: `https://futuratickets.atlassian.net`

2. **JIRA_EMAIL**:
   - Tu email de cuenta Atlassian
   - El mismo con el que te logueas

3. **JIRA_API_TOKEN**:
   - URL: https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"
   - Label: "Claude Code MCP"
   - Copiar token

#### Dónde actualizarlo:

```json
// ~/.config/claude-code/mcp_servers.json
{
  "jira": {
    "env": {
      "JIRA_URL": "https://futuratickets.atlassian.net",
      "JIRA_EMAIL": "dev@futuratickets.com",
      "JIRA_API_TOKEN": "ATATxxxxx"
    }
  }
}
```

---

### 5. Google Maps MCP
**Package**: `@modelcontextprotocol/server-google-maps`
**Uso**: Geocoding, direcciones (usado en eventos con ubicación)

#### Información necesaria:

```bash
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### ¿Dónde obtenerla?

1. **Ir a Google Cloud Console**:
   - URL: https://console.cloud.google.com/apis/credentials
   - Seleccionar proyecto (mismo que gcloud)

2. **Crear API Key**:
   - Click "Create Credentials" → "API Key"
   - Copiar la key

3. **Habilitar APIs necesarias**:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Directions API

4. **Restringir la key** (seguridad):
   - Application restrictions: HTTP referrers
   - Agregar: `localhost:*`, `*.futuratickets.com`

#### Dónde actualizarlo:

```json
// ~/.config/claude-code/mcp_servers.json
{
  "google-maps": {
    "env": {
      "GOOGLE_MAPS_API_KEY": "AIzaSyxxxxx"
    }
  }
}
```

---

## 🟢 BAJA PRIORIDAD (Nice to have)

### 6. Slack MCP
**Package**: `@modelcontextprotocol/server-slack`
**Uso**: Notificaciones y comunicación con el equipo

#### Información necesaria:

```bash
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxxxxxxxxxx
SLACK_TEAM_ID=T0XXXXXXXXX
```

#### ¿Dónde obtenerla?

1. **Crear Slack App**:
   - URL: https://api.slack.com/apps
   - Click "Create New App"
   - Nombre: "FuturaTickets Bot"
   - Workspace: Tu workspace

2. **Configurar Bot Token Scopes**:
   - OAuth & Permissions → Bot Token Scopes:
   - ✅ `chat:write` (Send messages)
   - ✅ `channels:read` (View channels)
   - ✅ `channels:history` (View messages)

3. **Instalar app en workspace**:
   - Click "Install to Workspace"
   - Autorizar permisos

4. **Copiar credenciales**:
   - **Bot User OAuth Token**: `xoxb-...`
   - **Team ID**: En Settings → Basic Information

#### Dónde actualizarlo:

```json
// ~/.config/claude-code/mcp_servers.json
{
  "slack": {
    "env": {
      "SLACK_BOT_TOKEN": "xoxb-xxxxx",
      "SLACK_TEAM_ID": "T0XXXXX"
    }
  }
}
```

---

### 7. Brave Search MCP
**Package**: `@modelcontextprotocol/server-brave-search`
**Uso**: Búsquedas web desde Claude

#### Información necesaria:

```bash
BRAVE_API_KEY=BSAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### ¿Dónde obtenerla?

1. **Registrarse en Brave Search API**:
   - URL: https://brave.com/search/api/
   - Sign up for free tier

2. **Generar API Key**:
   - Dashboard → API Keys → Create Key

3. **Límites free tier**:
   - 2,000 queries/mes gratis

#### Dónde actualizarlo:

```json
// ~/.config/claude-code/mcp_servers.json
{
  "brave-search": {
    "env": {
      "BRAVE_API_KEY": "BSAxxxxx"
    }
  }
}
```

---

### 8. AWS MCP
**Package**: `@modelcontextprotocol/server-aws-kb-retrieval`
**Uso**: AWS Knowledge Base (si usas AWS)

#### Información necesaria:

```bash
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
```

#### ¿Dónde obtenerla?

1. **AWS IAM Console**:
   - URL: https://console.aws.amazon.com/iam/
   - Users → Tu usuario → Security credentials

2. **Crear Access Key**:
   - "Create access key"
   - Use case: "Application running on AWS compute service"
   - Copiar ambas keys

3. **Permisos mínimos**:
   - Solo los servicios que necesites (S3, Lambda, etc.)

#### Dónde actualizarlo:

```json
// ~/.config/claude-code/mcp_servers.json
{
  "aws": {
    "env": {
      "AWS_ACCESS_KEY_ID": "AKIAxxxxx",
      "AWS_SECRET_ACCESS_KEY": "xxxxxxxxx",
      "AWS_REGION": "us-east-1"
    }
  }
}
```

---

## 📊 Resumen de Información Necesaria

### ✅ Ya Configurados (No requieren acción)

- [x] MongoDB URI (ya en .env y MCP)
- [x] Filesystem path (configurado)
- [x] Git (no requiere config)
- [x] Docker (solo requiere app abierta)
- [x] Fetch (no requiere config)
- [x] Puppeteer (no requiere config)
- [x] PostgreSQL (opcional, no se usa)
- [x] SQLite (opcional, no se usa)

### ⚠️ Requieren Configuración

| MCP | Prioridad | Info Necesaria | Tiempo | Dónde Obtener |
|-----|-----------|----------------|--------|---------------|
| **Stripe** | 🔴 Alta | Secret Key | 2 min | dashboard.stripe.com/apikeys |
| **Google Cloud** | 🔴 Alta | gcloud login | 5 min | console.cloud.google.com |
| **GitHub** | 🟡 Media | Personal Token | 3 min | github.com/settings/tokens |
| **Jira** | 🟡 Media | URL + API Token | 3 min | id.atlassian.com |
| **Google Maps** | 🟡 Media | API Key | 5 min | console.cloud.google.com |
| **Slack** | 🟢 Baja | Bot Token | 10 min | api.slack.com/apps |
| **Brave Search** | 🟢 Baja | API Key | 5 min | brave.com/search/api |
| **AWS** | 🟢 Baja | Access Keys | 5 min | console.aws.amazon.com |

**Tiempo total estimado**: ~40 minutos para configurar todos

---

## 🎯 Plan de Acción Recomendado

### Hoy (15 minutos):

1. ✅ **Stripe Secret Key** (2 min)
   - Ir a Stripe Dashboard
   - Copiar test key
   - Actualizar MCP y .env files

2. ✅ **Google Cloud CLI** (5 min)
   ```bash
   brew install google-cloud-sdk
   gcloud auth login
   gcloud config set project [TU_PROJECT_ID]
   ```

3. ✅ **GitHub Token** (3 min)
   - Generar en github.com/settings/tokens
   - Scopes: repo, read:org
   - Copiar a MCP config

4. ✅ **Reiniciar Claude Code** (5 min)
   - Para que cargue las nuevas configuraciones

### Esta Semana (25 minutos):

5. ⏳ **Jira API Token** (3 min) - Si usas Jira
6. ⏳ **Google Maps API** (5 min) - Para features de ubicación
7. ⏳ **Slack Bot** (10 min) - Para notificaciones
8. ⏳ **Brave Search** (5 min) - Para búsquedas
9. ⏳ **AWS Keys** (2 min) - Si usas AWS

---

## 🔒 Notas de Seguridad IMPORTANTES

### ⚠️ NUNCA HACER:

- ❌ Commitear API keys al repositorio
- ❌ Compartir keys en Slack/Discord públicos
- ❌ Usar keys de producción en desarrollo
- ❌ Hardcodear keys en código fuente
- ❌ Dejar keys en screenshots o videos

### ✅ SIEMPRE HACER:

- ✅ Usar variables de entorno
- ✅ Usar .env files (con .gitignore)
- ✅ Rotar keys cada 3-6 meses
- ✅ Usar keys de TEST para desarrollo
- ✅ Restringir permisos al mínimo necesario
- ✅ Revocar keys inmediatamente si se exponen
- ✅ Usar diferentes keys por ambiente (dev/staging/prod)

### 📝 Template de .env.local (NUNCA COMMITEAR):

```bash
# .env.local (gitignored)
# MCPs Configuration

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx

# GitHub
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxx

# Jira
JIRA_URL=https://futuratickets.atlassian.net
JIRA_EMAIL=dev@futuratickets.com
JIRA_API_TOKEN=ATATxxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyxxxxx

# Slack
SLACK_BOT_TOKEN=xoxb-xxxxx
SLACK_TEAM_ID=T0XXXXX

# Brave Search
BRAVE_API_KEY=BSAxxxxx

# AWS
AWS_ACCESS_KEY_ID=AKIAxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxx
AWS_REGION=us-east-1
```

---

## 📞 ¿Necesitas Ayuda?

### Si no tienes acceso a alguna cuenta:

- **Stripe**: Pedir al admin del equipo
- **Google Cloud**: Pedir al DevOps/admin GCP
- **GitHub**: Crear tu propio token
- **Jira**: Pedir al admin de Jira
- **Slack**: Pedir al workspace admin

### Si tienes problemas configurando:

1. Verificar sintaxis JSON del archivo MCP
2. Verificar que las keys no tengan espacios extra
3. Reiniciar Claude Code después de cambios
4. Verificar logs de error en Claude Code

---

## ✅ Checklist de Configuración

```markdown
### Configuración de MCPs

- [ ] Stripe Secret Key obtenida
- [ ] Stripe Secret Key en MCP config
- [ ] Stripe keys en .env de las 3 APIs
- [ ] gcloud CLI instalado
- [ ] gcloud autenticado
- [ ] gcloud proyecto configurado
- [ ] GitHub token generado
- [ ] GitHub token en MCP config
- [ ] Jira credentials obtenidas (si aplica)
- [ ] Jira credentials en MCP config (si aplica)
- [ ] Google Maps API key obtenida (si aplica)
- [ ] Claude Code reiniciado
- [ ] MCPs verificados funcionando
```

---

**Documento creado**: 2025-10-14
**Última actualización**: 2025-10-14 11:00 AM
**Versión**: 1.0

**Para completar configuración**: Seguir las instrucciones de "Plan de Acción Recomendado"
