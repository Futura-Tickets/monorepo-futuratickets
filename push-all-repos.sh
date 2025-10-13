#!/bin/bash

# ============================================
# Script para subir todos los repositorios de FuturaTickets a GitHub
# ============================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
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
  "landingpage"
  "futura-tickets"
)

BASE_DIR="/Users/alejandrogarciacestero/Downloads/FuturaTickets_Full_Repo"
ORG="futuratickets"
DRY_RUN=true  # Cambiar a false para push real

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  FuturaTickets - GitHub Repository Setup Script       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  DRY RUN MODE - No se hará push real${NC}"
  echo -e "${YELLOW}   Cambiar DRY_RUN=false en el script para push real${NC}"
  echo ""
fi

# Verificar que el directorio base existe
if [ ! -d "$BASE_DIR" ]; then
  echo -e "${RED}❌ Error: Directorio base no encontrado: $BASE_DIR${NC}"
  exit 1
fi

# Contador de éxitos
SUCCESS_COUNT=0
FAIL_COUNT=0

# Procesar cada repositorio
for repo in "${REPOS[@]}"; do
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}📦 Procesando: $repo${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  REPO_DIR="$BASE_DIR/$repo"

  # Verificar que el directorio existe
  if [ ! -d "$REPO_DIR" ]; then
    echo -e "${RED}❌ Directorio no encontrado: $REPO_DIR${NC}"
    ((FAIL_COUNT++))
    continue
  fi

  cd "$REPO_DIR"

  # 1. Inicializar Git si no existe
  if [ ! -d ".git" ]; then
    echo "🔧 Inicializando Git..."
    git init
  else
    echo "✅ Git ya inicializado"
  fi

  # 2. Copiar .gitignore si no existe
  if [ ! -f ".gitignore" ]; then
    echo "📝 Copiando .gitignore..."
    cp "$BASE_DIR/.gitignore" . 2>/dev/null || echo "⚠️  No se pudo copiar .gitignore"
  else
    echo "✅ .gitignore ya existe"
  fi

  # 3. Verificar que no hay secrets
  echo "🔍 Verificando secrets..."
  if grep -r "sk_live_" . 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
    echo -e "${RED}⚠️  ADVERTENCIA: Posibles secrets encontrados (sk_live_)${NC}"
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "❌ Abortando $repo"
      ((FAIL_COUNT++))
      continue
    fi
  fi

  if grep -r "sk_test_" . 2>/dev/null | grep -v ".git" | grep -v "node_modules" | grep -v "CLAUDE.md"; then
    echo -e "${YELLOW}⚠️  Secrets de test encontrados (sk_test_) - OK en desarrollo${NC}"
  fi

  # 4. Add y commit
  echo "📦 Agregando archivos..."
  git add .

  # Verificar si hay cambios
  if git diff --cached --quiet; then
    echo "✅ No hay cambios nuevos para commitear"
  else
    echo "💾 Creando commit..."
    git commit -m "chore: initial commit from ecosystem migration

- Migrated from FuturaTickets_Full_Repo
- Added .gitignore
- Ready for GitHub push

See: https://github.com/futuratickets/FuturaTickets_Docs for full documentation"
  fi

  # 5. Configurar remote
  REMOTE_URL="https://github.com/$ORG/$repo.git"
  echo "🔗 Configurando remote: $REMOTE_URL"

  # Remover remote anterior si existe
  git remote remove origin 2>/dev/null || true

  # Agregar nuevo remote
  git remote add origin "$REMOTE_URL"

  # 6. Configurar branch main
  CURRENT_BRANCH=$(git branch --show-current)
  if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔀 Cambiando a branch main..."
    git branch -M main
  fi

  # 7. Push (solo si no es dry run)
  if [ "$DRY_RUN" = false ]; then
    echo "🚀 Pushing a GitHub..."
    if git push -u origin main; then
      echo -e "${GREEN}✅ Push exitoso: $repo${NC}"
      ((SUCCESS_COUNT++))
    else
      echo -e "${RED}❌ Error en push: $repo${NC}"
      echo -e "${YELLOW}   Verifica que el repositorio existe en GitHub:${NC}"
      echo -e "${YELLOW}   https://github.com/$ORG/$repo${NC}"
      ((FAIL_COUNT++))
    fi
  else
    echo -e "${YELLOW}🔍 DRY RUN: Se haría push a $REMOTE_URL${NC}"
    ((SUCCESS_COUNT++))
  fi

  echo ""
done

# Resumen final
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                     RESUMEN                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total repositorios: ${#REPOS[@]}"
echo -e "${GREEN}✅ Exitosos: $SUCCESS_COUNT${NC}"
echo -e "${RED}❌ Fallidos: $FAIL_COUNT${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  Este fue un DRY RUN - No se hizo push real${NC}"
  echo ""
  echo "📋 Próximos pasos:"
  echo "1. Crear todos los repositorios en GitHub:"
  echo "   https://github.com/organizations/futuratickets/repositories/new"
  echo ""
  echo "2. Asegurarse que cada repo existe con estos nombres:"
  for repo in "${REPOS[@]}"; do
    echo "   - $repo"
  done
  echo ""
  echo "3. Cambiar DRY_RUN=false en este script"
  echo "4. Ejecutar nuevamente: ./push-all-repos.sh"
else
  echo -e "${GREEN}🎉 Push completado!${NC}"
  echo ""
  echo "📋 Próximos pasos:"
  echo "1. Configurar teams en GitHub:"
  echo "   https://github.com/orgs/futuratickets/teams"
  echo ""
  echo "2. Asignar permisos por team (ver GITHUB_SETUP.md)"
  echo ""
  echo "3. Configurar branch protection en main"
  echo ""
  echo "4. Archivar repos deprecados (landingpage, futura-tickets):"
  echo "   Settings > General > Archive this repository"
fi

echo ""
echo -e "${GREEN}✨ Done!${NC}"
