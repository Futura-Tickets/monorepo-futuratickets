# Model Context Protocol (MCP) Servers Configuration

**Última actualización**: 2025-10-14

Este documento describe todos los MCP servers instalados y configurados para el proyecto FuturaTickets.

---

## 📋 Resumen

**Total de MCPs instalados**: 16
- ✅ **Completamente configurados**: 5 (MongoDB, filesystem, git, fetch, docker)
- ⚙️ **Requieren API Keys**: 11 (GitHub, Stripe, Google Cloud, Jira, etc.)

**Archivo de configuración**: `~/.config/claude-code/mcp_servers.json`

---

## 🗄️ Database MCPs

### 1. MongoDB MCP Server
**Package**: `@mongodb-js/mongodb-mcp-server`
**Status**: ✅ Completamente configurado
**Descripción**: Permite interactuar con bases de datos MongoDB

**Configuración actual**:
```json
{
  "command": "npx",
  "args": ["-y", "@mongodb-js/mongodb-mcp-server"],
  "env": {
    "MONGODB_URI": "mongodb+srv://admin:***@futura.bkbwc.mongodb.net/futura-prod"
  }
}
```

**Capacidades**:
- Ejecutar queries MongoDB
- Leer colecciones
- Insertar/actualizar documentos
- Agregaciones
- Gestión de índices

---

### 2. PostgreSQL MCP Server
**Package**: `@modelcontextprotocol/server-postgres`
**Status**: ⚠️ Requiere configuración (no usado actualmente)
**Descripción**: Acceso a base de datos PostgreSQL

**Configuración**:
```json
{
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://localhost/futuratickets"
  ]
}
```

**Nota**: FuturaTickets usa MongoDB, por lo que este MCP es opcional.

---

### 3. SQLite MCP Server
**Package**: `@modelcontextprotocol/server-sqlite`
**Status**: ⚠️ Opcional
**Descripción**: Acceso a bases de datos SQLite locales

---

## 💳 Payment & Cloud MCPs

### 4. Stripe MCP Server ⭐ NUEVO
**Package**: `@stripe/mcp`
**Status**: ⚠️ Requiere API Key
**Descripción**: Interactuar con Stripe API para pagos, clientes, suscripciones

**Configuración**:
```json
{
  "command": "npx",
  "args": ["-y", "@stripe/mcp", "--tools=all"],
  "env": {
    "STRIPE_SECRET_KEY": ""
  }
}
```

**Capacidades**:
- Crear Payment Intents
- Gestionar clientes
- Ver transacciones
- Gestionar suscripciones
- Consultar webhooks
- Buscar en documentación Stripe

**Cómo obtener la API Key**:
1. Ir a https://dashboard.stripe.com/apikeys
2. Copiar la "Secret key" (comienza con `sk_test_` o `sk_live_`)
3. Agregar al archivo de configuración

**Uso recomendado**:
```bash
# Para testing
STRIPE_SECRET_KEY=sk_test_xxxxx

# Para producción
STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

### 5. Google Cloud MCP ⭐ NUEVO
**Package**: `@google-cloud/gcloud-mcp`
**Status**: ✅ Listo para usar (usa gcloud CLI)
**Descripción**: Interactuar con recursos de Google Cloud Platform usando lenguaje natural

**Configuración**:
```json
{
  "command": "npx",
  "args": ["-y", "@google-cloud/gcloud-mcp"]
}
```

**Capacidades**:
- Listar proyectos GCP
- Gestionar Cloud Run services
- Ver logs de Stackdriver
- Gestionar Cloud Storage buckets
- Consultar BigQuery
- Administrar Compute Engine instances

**Prerequisito**:
```bash
# Instalar gcloud CLI
brew install google-cloud-sdk

# Autenticar
gcloud auth login
gcloud config set project futura-tickets-project
```

---

## 🔧 Development MCPs

### 6. Filesystem MCP
**Package**: `@modelcontextprotocol/server-filesystem`
**Status**: ✅ Completamente configurado
**Descripción**: Acceso al sistema de archivos

**Configuración**:
```json
{
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/Users/alejandrogarciacestero/Workspace/monorepo-futuratickets"
  ]
}
```

---

### 7. Git MCP
**Package**: `@modelcontextprotocol/server-git`
**Status**: ✅ Completamente configurado
**Descripción**: Operaciones Git (commit, branch, status, etc.)

---

### 8. GitHub MCP
**Package**: `@modelcontextprotocol/server-github`
**Status**: ⚠️ Requiere Personal Access Token
**Descripción**: Interactuar con repos, issues, PRs de GitHub

**Cómo configurar**:
1. Ir a https://github.com/settings/tokens
2. Generar nuevo token (classic) con scopes: `repo`, `read:org`
3. Agregar a configuración:
```json
{
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxx"
  }
}
```

---

### 9. Docker MCP
**Package**: `docker-mcp`
**Status**: ✅ Listo (requiere Docker Desktop instalado)
**Descripción**: Listar containers, ejecutar comandos, ver logs

**Capacidades**:
- `docker ps` - Listar containers
- `docker logs` - Ver logs
- `docker exec` - Ejecutar comandos en containers
- `docker-compose up/down` - Gestionar servicios

---

## 🎫 Project Management MCPs

### 10. Jira MCP ⭐ NUEVO
**Package**: `@aashari/mcp-server-atlassian-jira`
**Status**: ⚠️ Requiere configuración de Atlassian
**Descripción**: Listar proyectos, buscar issues con JQL, ver info de desarrollo

**Configuración**:
```json
{
  "command": "npx",
  "args": ["-y", "@aashari/mcp-server-atlassian-jira"],
  "env": {
    "JIRA_URL": "",
    "JIRA_EMAIL": "",
    "JIRA_API_TOKEN": ""
  }
}
```

**Capacidades**:
- Listar proyectos
- Buscar issues con JQL
- Crear/actualizar issues
- Ver commits y PRs asociados
- Transiciones de workflow

**Cómo obtener credenciales**:
1. **JIRA_URL**: Tu dominio de Jira Cloud (ej: `https://futuratickets.atlassian.net`)
2. **JIRA_EMAIL**: Tu email de cuenta Atlassian
3. **JIRA_API_TOKEN**:
   - Ir a https://id.atlassian.com/manage-profile/security/api-tokens
   - Crear nuevo API token
   - Copiar y guardar

**Ejemplo de uso**:
```bash
JIRA_URL=https://futuratickets.atlassian.net
JIRA_EMAIL=dev@futuratickets.com
JIRA_API_TOKEN=ATATxxxxxxxxxxxxxxxx
```

---

## 🌐 Web & API MCPs

### 11. Fetch MCP
**Package**: `@modelcontextprotocol/server-fetch`
**Status**: ✅ Listo
**Descripción**: Realizar HTTP requests, testear APIs, descargar archivos

---

### 12. Puppeteer MCP
**Package**: `@modelcontextprotocol/server-puppeteer`
**Status**: ✅ Listo
**Descripción**: Browser automation para E2E testing

**Capacidades**:
- Ejecutar tests E2E
- Tomar screenshots
- Generar PDFs
- Web scraping

---

### 13. Brave Search MCP
**Package**: `@modelcontextprotocol/server-brave-search`
**Status**: ⚠️ Requiere API Key
**Descripción**: Capacidades de búsqueda web

**Cómo obtener API Key**:
1. Ir a https://brave.com/search/api/
2. Registrarse para API key
3. Agregar a configuración

---

## 🗺️ Maps & Location MCPs

### 14. Google Maps MCP
**Package**: `@modelcontextprotocol/server-google-maps`
**Status**: ⚠️ Requiere API Key
**Descripción**: Acceso a Google Maps API (útil para features de ubicación)

**Capacidades**:
- Geocoding
- Reverse geocoding
- Direcciones
- Places API
- Distance Matrix

**Cómo obtener API Key**:
1. Ir a https://console.cloud.google.com/apis/credentials
2. Crear API key
3. Habilitar APIs necesarias:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Agregar a configuración

---

## 💬 Communication MCPs

### 15. Slack MCP
**Package**: `@modelcontextprotocol/server-slack`
**Status**: ⚠️ Requiere Bot Token
**Descripción**: Enviar mensajes, leer canales de Slack

**Cómo configurar**:
1. Ir a https://api.slack.com/apps
2. Crear nueva app
3. Agregar Bot Token Scopes: `chat:write`, `channels:read`, `channels:history`
4. Instalar app en workspace
5. Copiar Bot User OAuth Token
6. Agregar a configuración:
```json
{
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-xxxxxxxxxxxxx",
    "SLACK_TEAM_ID": "T0XXXXXXXXX"
  }
}
```

---

## ☁️ Cloud Provider MCPs

### 16. AWS MCP
**Package**: `@modelcontextprotocol/server-aws-kb-retrieval`
**Status**: ⚠️ Requiere credenciales AWS
**Descripción**: AWS Knowledge Base retrieval

**Configuración**:
```json
{
  "env": {
    "AWS_ACCESS_KEY_ID": "",
    "AWS_SECRET_ACCESS_KEY": "",
    "AWS_REGION": "us-east-1"
  }
}
```

---

## 📝 Guía de Configuración Rápida

### MCPs Prioritarios para FuturaTickets

#### 1. Stripe MCP (ALTA PRIORIDAD)
```bash
# Obtener de: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_51xxxxx
```

#### 2. Google Cloud MCP (MEDIA PRIORIDAD)
```bash
# Prerequisito
brew install google-cloud-sdk
gcloud auth login
```

#### 3. GitHub MCP (MEDIA PRIORIDAD)
```bash
# Obtener de: https://github.com/settings/tokens
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxx
```

#### 4. Jira MCP (BAJA PRIORIDAD - si se usa Jira)
```bash
JIRA_URL=https://futuratickets.atlassian.net
JIRA_EMAIL=dev@futuratickets.com
JIRA_API_TOKEN=ATATxxxxx
```

---

## 🔒 Seguridad y Mejores Prácticas

### ⚠️ IMPORTANTE: Manejo de API Keys

1. **Nunca commitear API keys** al repositorio
2. **Usar variables de entorno** para producción
3. **Rotar keys regularmente**
4. **Usar keys de test** para desarrollo
5. **Restringir permisos** de API keys al mínimo necesario

### Ejemplo de uso seguro con Stripe:
```json
{
  "stripe": {
    "env": {
      "STRIPE_SECRET_KEY": "${STRIPE_TEST_KEY}"
    }
  }
}
```

Luego en tu shell:
```bash
export STRIPE_TEST_KEY=sk_test_xxxxx
```

---

## 🚀 Activación de MCPs

Para activar los MCPs configurados:

1. **Reiniciar Claude Code** - Los cambios en `mcp_servers.json` requieren reinicio
2. **Verificar conexión**: Los MCPs aparecerán disponibles en la lista de herramientas
3. **Probar funcionalidad**: Hacer una query simple para verificar

### Comandos de verificación:

```bash
# Verificar archivo de configuración
cat ~/.config/claude-code/mcp_servers.json

# Verificar que npx funciona
npx -y @stripe/mcp --help

# Verificar gcloud
gcloud version
```

---

## 📊 Estado de Configuración

| MCP | Status | API Key Requerida | Prioridad |
|-----|--------|-------------------|-----------|
| MongoDB | ✅ Configurado | ✅ Configurada | Alta |
| Filesystem | ✅ Configurado | No | Alta |
| Git | ✅ Configurado | No | Alta |
| Docker | ✅ Configurado | No | Alta |
| Fetch | ✅ Configurado | No | Media |
| **Stripe** | ⚠️ Falta key | ❌ Requerida | **Alta** |
| **Google Cloud** | ✅ Listo | No (usa gcloud) | Media |
| GitHub | ⚠️ Falta key | ❌ Requerida | Media |
| **Jira** | ⚠️ Falta config | ❌ Requerida | Baja |
| Google Maps | ⚠️ Falta key | ❌ Requerida | Baja |
| Slack | ⚠️ Falta key | ❌ Requerida | Baja |
| Brave Search | ⚠️ Falta key | ❌ Requerida | Baja |
| Puppeteer | ✅ Listo | No | Media |
| PostgreSQL | ⚠️ No usado | No | N/A |
| SQLite | ⚠️ No usado | No | N/A |
| AWS | ⚠️ Falta config | ❌ Requerida | Baja |

---

## 🎯 Próximos Pasos Recomendados

### Inmediato (esta sesión):
1. ✅ Instalar Stripe MCP
2. ✅ Instalar Google Cloud MCP
3. ✅ Instalar Jira MCP
4. ⏳ Configurar API keys de Stripe (TEST)

### Corto plazo (próximas sesiones):
1. Configurar GitHub Personal Access Token
2. Instalar y configurar gcloud CLI
3. Configurar Jira si el equipo lo usa
4. Documentar proceso de obtención de keys

### Largo plazo:
1. Configurar MCPs de producción con keys reales
2. Automatizar rotación de API keys
3. Configurar monitoreo de uso de APIs
4. Documentar procedimientos de seguridad

---

## 📚 Referencias

- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [Stripe MCP Documentation](https://docs.stripe.com/mcp)
- [Google Cloud MCP](https://cloud.google.com/run/docs/host-mcp-servers)
- [Jira MCP Server](https://github.com/aashari/mcp-server-atlassian-jira)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol/servers)

---

## 🆘 Troubleshooting

### Error: "npx command not found"
```bash
# Instalar Node.js
brew install node
```

### Error: "Permission denied"
```bash
# Verificar permisos del archivo de configuración
chmod 644 ~/.config/claude-code/mcp_servers.json
```

### Error: "API key invalid"
```bash
# Verificar que la key esté correctamente copiada
# Verificar que no haya espacios extra
# Verificar que la key no haya expirado
```

### MCP no aparece en Claude Code
```bash
# 1. Verificar sintaxis JSON
cat ~/.config/claude-code/mcp_servers.json | jq .

# 2. Reiniciar Claude Code completamente
# 3. Verificar logs de error
```

---

**Mantenido por**: Equipo de Desarrollo FuturaTickets
**Última revisión**: 2025-10-14
**Versión**: 2.0
