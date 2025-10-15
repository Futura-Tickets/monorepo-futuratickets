#!/bin/bash

# ==============================================================================
# FuturaTickets - Script de Inicio de Todos los Servicios
# ==============================================================================
#
# Este script inicia todos los servicios del ecosistema FuturaTickets:
# - 2 APIs Backend (NestJS)
# - 3 Aplicaciones Frontend (Next.js)
#
# Uso:
#   chmod +x start-all-services.sh
#   ./start-all-services.sh
#
# Para detener todos los servicios:
#   ./start-all-services.sh stop
#
# ==============================================================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base del monorepo
MONOREPO_DIR="/Users/alejandrogarciacestero/Workspace/monorepo-futuratickets"

# Directorio de logs
LOG_DIR="/tmp"

# ==============================================================================
# Función para imprimir con color
# ==============================================================================
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ==============================================================================
# Función para detener todos los servicios
# ==============================================================================
stop_services() {
    print_header "Deteniendo todos los servicios..."

    # Buscar procesos Node.js en los puertos específicos y detenerlos
    for PORT in 3001 3004 3000 3003 3007; do
        PID=$(lsof -ti:$PORT 2>/dev/null || true)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            print_success "Detenido proceso en puerto $PORT (PID: $PID)"
        fi
    done

    print_success "Todos los servicios han sido detenidos"
    exit 0
}

# ==============================================================================
# Función para verificar si un puerto está disponible
# ==============================================================================
check_port() {
    local PORT=$1
    local SERVICE=$2

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_error "Puerto $PORT ya está en uso (requerido para $SERVICE)"
        PID=$(lsof -ti:$PORT)
        print_info "Proceso usando el puerto: PID $PID"
        print_warning "Ejecuta './start-all-services.sh stop' para detener todos los servicios"
        return 1
    fi
    return 0
}

# ==============================================================================
# Función para iniciar un servicio
# ==============================================================================
start_service() {
    local NAME=$1
    local DIR=$2
    local PORT=$3
    local LOG_FILE=$4
    local CMD=$5

    print_info "Iniciando $NAME en puerto $PORT..."

    # Verificar que el directorio existe
    if [ ! -d "$DIR" ]; then
        print_error "Directorio no encontrado: $DIR"
        return 1
    fi

    # Cambiar al directorio e iniciar el servicio en background
    (cd "$DIR" && eval "$CMD" > "$LOG_FILE" 2>&1 &)

    # Esperar un momento para que inicie
    sleep 2

    # Verificar que el proceso se inició
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_success "$NAME iniciado correctamente"
        return 0
    else
        print_error "$NAME falló al iniciar. Revisa el log: $LOG_FILE"
        return 1
    fi
}

# ==============================================================================
# MAIN
# ==============================================================================

# Verificar si se pidió detener
if [ "$1" == "stop" ]; then
    stop_services
fi

print_header "FuturaTickets - Inicio de Servicios"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "$MONOREPO_DIR" ]; then
    print_error "Directorio del monorepo no encontrado: $MONOREPO_DIR"
    print_info "Edita la variable MONOREPO_DIR en este script"
    exit 1
fi

# ==============================================================================
# Verificar puertos disponibles
# ==============================================================================
print_header "Verificando puertos disponibles..."
echo ""

PORTS_OK=true
check_port 3001 "Admin API" || PORTS_OK=false
check_port 3004 "Access API" || PORTS_OK=false
check_port 3000 "Marketplace" || PORTS_OK=false
check_port 3003 "Admin Panel" || PORTS_OK=false
check_port 3007 "Access App" || PORTS_OK=false

if [ "$PORTS_OK" = false ]; then
    echo ""
    print_error "Algunos puertos no están disponibles"
    print_info "Ejecuta './start-all-services.sh stop' para liberar los puertos"
    exit 1
fi

print_success "Todos los puertos están disponibles"
echo ""

# ==============================================================================
# Iniciar servicios
# ==============================================================================
print_header "Iniciando servicios..."
echo ""

# 1. Admin API (Backend NestJS - Puerto 3001)
start_service \
    "Admin API" \
    "$MONOREPO_DIR/futura-tickets-admin-api" \
    3001 \
    "$LOG_DIR/admin-api.log" \
    "npm run start:dev"

# 2. Access API (Backend NestJS - Puerto 3004)
start_service \
    "Access API" \
    "$MONOREPO_DIR/futura-access-api" \
    3004 \
    "$LOG_DIR/access-api.log" \
    "npm run start:dev"

# 3. Marketplace (Frontend Next.js - Puerto 3000)
start_service \
    "Marketplace" \
    "$MONOREPO_DIR/futura-market-place-v2" \
    3000 \
    "$LOG_DIR/marketplace.log" \
    "npm run dev"

# 4. Admin Panel (Frontend Next.js - Puerto 3003)
start_service \
    "Admin Panel" \
    "$MONOREPO_DIR/futura-tickets-admin" \
    3003 \
    "$LOG_DIR/admin-panel.log" \
    "npm run dev"

# 5. Access App (Frontend Next.js - Puerto 3007)
start_service \
    "Access App" \
    "$MONOREPO_DIR/futura-tickets-web-access-app" \
    3007 \
    "$LOG_DIR/access-app.log" \
    "npm run dev"

# ==============================================================================
# Resumen
# ==============================================================================
echo ""
print_header "✨ Todos los servicios iniciados correctamente"
echo ""
echo "📊 SERVICIOS ACTIVOS:"
echo ""
echo "┌─────────────────────┬────────┬─────────────────────────────────┐"
echo "│ Servicio            │ Puerto │ URL                             │"
echo "├─────────────────────┼────────┼─────────────────────────────────┤"
echo "│ Admin API           │  3001  │ http://localhost:3001           │"
echo "│ Access API          │  3004  │ http://localhost:3004           │"
echo "│ Marketplace         │  3000  │ http://localhost:3000           │"
echo "│ Admin Panel         │  3003  │ http://localhost:3003           │"
echo "│ Access App          │  3007  │ http://localhost:3007           │"
echo "└─────────────────────┴────────┴─────────────────────────────────┘"
echo ""
echo "📋 LOGS:"
echo "  Admin API:    tail -f $LOG_DIR/admin-api.log"
echo "  Access API:   tail -f $LOG_DIR/access-api.log"
echo "  Marketplace:  tail -f $LOG_DIR/marketplace.log"
echo "  Admin Panel:  tail -f $LOG_DIR/admin-panel.log"
echo "  Access App:   tail -f $LOG_DIR/access-app.log"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "  ./start-all-services.sh stop"
echo ""
print_success "¡Listo para trabajar!"
