#!/bin/bash

# ============================================
# Script de Despliegue Rápido
# ============================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de Combustible API..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Error: No se encuentra package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Verificar que existe .env
if [ ! -f ".env" ]; then
    print_error "Error: No se encuentra el archivo .env"
    print_warning "Copia .env.production.example a .env y configúralo:"
    echo "  cp .env.production.example .env"
    echo "  nano .env"
    exit 1
fi

print_message "Archivo .env encontrado"

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi

print_message "Docker está instalado"

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    exit 1
fi

print_message "Docker Compose está instalado"

# Verificar que la red existe
if ! docker network ls | grep -q "elastika-network"; then
    print_warning "La red elastika-network no existe. Creándola..."
    docker network create elastika-network
    print_message "Red elastika-network creada"
else
    print_message "Red elastika-network existe"
fi

# Detener contenedores existentes
print_message "Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || true

# Limpiar imágenes antiguas (opcional)
read -p "¿Deseas limpiar imágenes antiguas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_message "Limpiando imágenes antiguas..."
    docker system prune -f
fi

# Construir imagen
print_message "Construyendo imagen Docker..."
docker-compose build --no-cache

# Iniciar servicios
print_message "Iniciando servicios..."
docker-compose up -d

# Esperar a que el contenedor esté listo
print_message "Esperando a que el contenedor esté listo..."
sleep 10

# Verificar que el contenedor está corriendo
if docker ps | grep -q "combustible-api"; then
    print_message "Contenedor combustible-api está corriendo"
else
    print_error "El contenedor no está corriendo. Verificando logs..."
    docker-compose logs --tail=50 combustible-api
    exit 1
fi

# Ejecutar migraciones
print_message "Ejecutando migraciones de base de datos..."
docker exec combustible-api npx prisma migrate deploy

# Verificar health check
print_message "Verificando health check..."
sleep 5

if curl -f http://localhost:3080/api > /dev/null 2>&1; then
    print_message "API está respondiendo correctamente"
else
    print_warning "La API no responde en el puerto 3080"
    print_warning "Verifica los logs con: docker-compose logs -f combustible-api"
fi

# Mostrar logs
echo ""
echo "============================================"
echo "🎉 Despliegue completado exitosamente"
echo "============================================"
echo ""
echo "📊 Información del despliegue:"
echo "  - Contenedor: combustible-api"
echo "  - Puerto: 3080"
echo "  - API: http://localhost:3080/api"
echo "  - Docs: http://localhost:3080/api/docs"
echo ""
echo "📝 Comandos útiles:"
echo "  - Ver logs: docker-compose logs -f combustible-api"
echo "  - Detener: docker-compose down"
echo "  - Reiniciar: docker-compose restart combustible-api"
echo "  - Ver estado: docker ps | grep combustible-api"
echo ""

# Preguntar si desea ver los logs
read -p "¿Deseas ver los logs en tiempo real? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose logs -f combustible-api
fi