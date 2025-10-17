# Codecov Setup Guide

Este documento explica cómo configurar Codecov para el reporting de coverage en el monorepo de FuturaTickets.

## 📋 Requisitos Previos

1. Cuenta en [Codecov.io](https://codecov.io)
2. Repositorio conectado a Codecov
3. Token de Codecov configurado en GitHub Secrets

---

## 🔧 Configuración Inicial

### Paso 1: Conectar el Repositorio a Codecov

1. Ve a [Codecov.io](https://codecov.io) e inicia sesión con tu cuenta de GitHub
2. Autoriza Codecov para acceder a tu organización/repositorio
3. Busca el repositorio `monorepo-futuratickets` en la lista
4. Haz clic en "Setup repo" para activar Codecov

### Paso 2: Obtener el Token de Codecov

1. En el dashboard de Codecov, selecciona tu repositorio
2. Ve a **Settings > General**
3. Copia el **Upload Token** (empieza con `codecov_token_...`)

### Paso 3: Configurar GitHub Secret

1. Ve a tu repositorio en GitHub
2. Navega a **Settings > Secrets and variables > Actions**
3. Haz clic en **New repository secret**
4. Nombre: `CODECOV_TOKEN`
5. Valor: Pega el token copiado de Codecov
6. Haz clic en **Add secret**

---

## ✅ Verificación

### Comprobar que el Workflow Está Activo

```bash
# Ver workflows activos
cat .github/workflows/test-coverage.yml

# El workflow debe ejecutarse en:
# - Push a main, dev, staging
# - Pull requests a main, dev
```

### Ejecutar Tests Localmente con Coverage

```bash
# Admin API
cd futura-tickets-admin-api
npm run test:cov

# Marketplace API
cd futura-market-place-api
npm run test:cov

# Access API
cd futura-access-api
npm run test:cov
```

### Verificar Archivos de Coverage Generados

```bash
# Deberías ver carpetas coverage/ en cada API con archivos lcov.info
ls -la futura-tickets-admin-api/coverage/lcov.info
ls -la futura-market-place-api/coverage/lcov.info
ls -la futura-access-api/coverage/lcov.info
```

---

## 📊 Coverage Badges

Una vez configurado Codecov, puedes agregar badges a los README de cada API:

### Admin API

```markdown
[![codecov](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg?flag=admin-api)](https://codecov.io/gh/OWNER/REPO?flags[]=admin-api)
```

### Marketplace API

```markdown
[![codecov](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg?flag=marketplace-api)](https://codecov.io/gh/OWNER/REPO?flags[]=marketplace-api)
```

### Access API

```markdown
[![codecov](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg?flag=access-api)](https://codecov.io/gh/OWNER/REPO?flags[]=access-api)
```

> **Nota**: Reemplaza `OWNER/REPO` con tu usuario/organización y nombre del repositorio.

---

## 🎯 Targets de Coverage Configurados

Según `codecov.yml`:

| Tipo | Target | Threshold | Descripción |
|------|--------|-----------|-------------|
| **Project** | 40% | ±5% | Coverage total del proyecto |
| **Patch** | 50% | ±10% | Coverage de nuevos cambios |

### Flags por API

- `admin-api`: Coverage del Admin API
- `marketplace-api`: Coverage del Marketplace API
- `access-api`: Coverage del Access API

---

## 🔍 Ver Reports de Coverage

### En Codecov Dashboard

1. Ve a https://codecov.io/gh/OWNER/REPO
2. Selecciona el branch (main, dev, etc.)
3. Ver reports por:
   - **Project**: Coverage total
   - **Flags**: Coverage por API
   - **Files**: Coverage por archivo
   - **Commits**: Histórico de coverage

### En Pull Requests

Codecov automáticamente:
- ✅ Comenta en PRs con el report de coverage
- ✅ Muestra diff de coverage (archivos modificados)
- ✅ Indica si el coverage aumentó o disminuyó
- ✅ Bloquea merge si coverage cae por debajo del threshold

---

## 📈 Estado Actual de Tests

Según PHASE_4_TESTING_SUMMARY.md:

```
┌─────────────────────────────────────────────────────────────┐
│                  TEST COVERAGE SUMMARY                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Admin API:        58 tests ✅  (~25% coverage)            │
│  Access API:       24 tests ✅  (~40% coverage)            │
│  Marketplace API: 100 tests ✅  (~55% coverage)            │
│                                                             │
│  TOTAL:           182 tests     (~40% coverage)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos

1. ✅ Configurar Codecov (este documento)
2. ⏳ Agregar coverage badges a READMEs
3. ⏳ Configurar coverage thresholds en CI/CD
4. ⏳ Implementar pre-commit hooks para coverage mínimo
5. ⏳ Documentar best practices para tests

---

## 🆘 Troubleshooting

### Error: "Codecov token not found"

**Solución**: Verifica que el secret `CODECOV_TOKEN` está configurado en GitHub Actions.

```bash
# En Settings > Secrets > Actions
# Debe existir: CODECOV_TOKEN
```

### Error: "Coverage file not found"

**Solución**: Verifica que los tests generan el archivo `lcov.info`:

```bash
cd futura-market-place-api
npm run test:cov
ls -la coverage/lcov.info  # Debe existir
```

### Workflow No Se Ejecuta

**Solución**: Verifica que el workflow tiene los triggers correctos:

```yaml
on:
  push:
    branches: [main, dev, staging]
  pull_request:
    branches: [main, dev]
```

### Coverage No Aparece en Codecov

**Solución**:
1. Verifica que el upload step se ejecutó correctamente en GitHub Actions
2. Revisa los logs del step "Upload coverage to Codecov"
3. Verifica que el token es correcto
4. Espera unos minutos - Codecov puede tardar en procesar

---

## 📚 Recursos

- [Codecov Documentation](https://docs.codecov.com)
- [GitHub Actions Integration](https://docs.codecov.com/docs/github-actions-integration)
- [Codecov Flags](https://docs.codecov.com/docs/flags)
- [Coverage Configuration](https://docs.codecov.com/docs/codecov-yaml)

---

**Documento**: CODECOV_SETUP.md
**Actualizado**: 2025-10-17
**Autor**: Tech Lead
