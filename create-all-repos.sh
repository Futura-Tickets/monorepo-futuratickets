#!/bin/bash

# ============================================
# Script para crear todos los repositorios de FuturaTickets en GitHub
# ============================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
ORG="futuratickets"
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

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  FuturaTickets - GitHub Repositories Creation Script  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que GITHUB_TOKEN está configurado
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}❌ Error: GITHUB_TOKEN no está configurado${NC}"
  echo ""
  echo "Por favor, configura tu token personal de GitHub:"
  echo ""
  echo -e "${YELLOW}1. Ve a: https://github.com/settings/tokens/new${NC}"
  echo -e "${YELLOW}2. Scopes necesarios: repo, admin:org${NC}"
  echo -e "${YELLOW}3. Genera el token y cópialo${NC}"
  echo ""
  echo "Luego ejecuta:"
  echo -e "${BLUE}export GITHUB_TOKEN=\"ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\"${NC}"
  echo -e "${BLUE}./create-all-repos.sh${NC}"
  echo ""
  exit 1
fi

echo -e "${BLUE}🔑 Token configurado: ${GITHUB_TOKEN:0:7}...${GITHUB_TOKEN: -4}${NC}"
echo -e "${BLUE}📦 Organización: $ORG${NC}"
echo -e "${BLUE}📊 Repositorios a crear: ${#REPOS[@]}${NC}"
echo ""

# Verificar que la organización existe
echo -e "${YELLOW}🔍 Verificando organización...${NC}"
ORG_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/orgs/$ORG")

if [ "$ORG_CHECK" != "200" ]; then
  echo -e "${RED}❌ Error: Organización '$ORG' no existe o no tienes permisos${NC}"
  echo ""
  echo "Opciones:"
  echo "1. Crear organización: https://github.com/organizations/new"
  echo "2. Verificar permisos en: https://github.com/orgs/$ORG/people"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ Organización encontrada${NC}"
echo ""

# Contador de éxitos
SUCCESS_COUNT=0
EXISTS_COUNT=0
FAIL_COUNT=0

# Crear cada repositorio
for repo in "${REPOS[@]}"; do
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}📦 Creando: $repo${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Crear repositorio
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/orgs/$ORG/repos \
    -d "{
      \"name\": \"$repo\",
      \"private\": true,
      \"auto_init\": false,
      \"description\": \"FuturaTickets - $repo\"
    }")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✅ Repositorio creado exitosamente${NC}"
    echo -e "${BLUE}   URL: https://github.com/$ORG/$repo${NC}"
    ((SUCCESS_COUNT++))
  elif [ "$http_code" = "422" ]; then
    error_message=$(echo "$body" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    if [[ "$error_message" == *"already exists"* ]]; then
      echo -e "${YELLOW}⚠️  El repositorio ya existe${NC}"
      echo -e "${BLUE}   URL: https://github.com/$ORG/$repo${NC}"
      ((EXISTS_COUNT++))
    else
      echo -e "${RED}❌ Error: $error_message${NC}"
      ((FAIL_COUNT++))
    fi
  elif [ "$http_code" = "401" ]; then
    echo -e "${RED}❌ Error de autenticación: Token inválido o expirado${NC}"
    ((FAIL_COUNT++))
  elif [ "$http_code" = "403" ]; then
    echo -e "${RED}❌ Error de permisos: No tienes acceso para crear repos en esta organización${NC}"
    ((FAIL_COUNT++))
  else
    echo -e "${RED}❌ Error HTTP $http_code${NC}"
    echo "$body" | head -c 200
    ((FAIL_COUNT++))
  fi

  echo ""
done

# Resumen final
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                     RESUMEN                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total repositorios: ${#REPOS[@]}"
echo -e "${GREEN}✅ Creados: $SUCCESS_COUNT${NC}"
echo -e "${YELLOW}⚠️  Ya existían: $EXISTS_COUNT${NC}"
echo -e "${RED}❌ Fallidos: $FAIL_COUNT${NC}"
echo ""

TOTAL_READY=$((SUCCESS_COUNT + EXISTS_COUNT))

if [ $TOTAL_READY -eq ${#REPOS[@]} ]; then
  echo -e "${GREEN}🎉 ¡Perfecto! Todos los repositorios están listos${NC}"
  echo ""
  echo "📋 Próximo paso:"
  echo ""
  echo -e "${BLUE}./push-all-repos.sh${NC}"
  echo ""
  echo "Esto subirá el código de los 16 repositorios a GitHub."
elif [ $FAIL_COUNT -gt 0 ]; then
  echo -e "${RED}⚠️  Hubo errores creando algunos repositorios${NC}"
  echo ""
  echo "Verifica:"
  echo "1. Que tu token tenga los permisos correctos (repo, admin:org)"
  echo "2. Que seas owner/admin de la organización"
  echo "3. Los mensajes de error arriba"
else
  echo -e "${GREEN}✅ Repositorios listos (algunos ya existían)${NC}"
  echo ""
  echo "📋 Próximo paso:"
  echo ""
  echo -e "${BLUE}./push-all-repos.sh${NC}"
fi

echo ""
echo -e "${GREEN}✨ Done!${NC}"
