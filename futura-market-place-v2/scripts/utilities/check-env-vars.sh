#!/bin/bash

echo "=== VERIFICACIÓN DE VARIABLES DE ENTORNO ==="
echo ""

check_service() {
    local service=$1
    local env_file=$2
    
    echo "🔍 $service"
    if [ -f "$env_file" ]; then
        echo "  ✅ .env existe"
        
        # Check critical vars
        [ -n "$(grep -E '^MONGO_URL=' $env_file 2>/dev/null | grep -v '^#')" ] && echo "  ✅ MONGO_URL configurado" || echo "  ⚠️  MONGO_URL falta"
        [ -n "$(grep -E '^JWT_SECRET' $env_file 2>/dev/null | grep -v '^#')" ] && echo "  ✅ JWT_SECRET configurado" || echo "  ⚠️  JWT_SECRET falta"
        [ -n "$(grep -E '^STRIPE.*KEY' $env_file 2>/dev/null | grep -v '^#')" ] && echo "  ✅ STRIPE_KEY configurado" || echo "  ⚠️  STRIPE_KEY falta"
        [ -n "$(grep -E '^PORT=' $env_file 2>/dev/null | grep -v '^#')" ] && echo "  ✅ PORT configurado" || echo "  ⚠️  PORT falta"
    else
        echo "  ❌ .env NO existe"
    fi
    echo ""
}

check_service "Admin API" "futura-tickets-admin-api/.env"
check_service "Marketplace API" "futura-market-place-api/.env"
check_service "Access API" "futura-access-api/.env"

