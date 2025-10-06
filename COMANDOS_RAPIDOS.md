# ⚡ Comandos Rápidos - Combustible API

## 🚀 Despliegue Inicial

```bash
# 1. Clonar/subir proyecto a VPS
cd /opt
git clone <tu-repo> combustible-api
cd combustible-api

# 2. Configurar variables de entorno
cp .env.production.example .env
nano .env  # Editar con tus valores

# 3. Dar permisos al script de despliegue
chmod +x deploy.sh

# 4. Ejecutar despliegue automático
./deploy.sh
```

## 🐳 Docker - Comandos Básicos

```bash
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores
docker ps -a

# Ver logs en tiempo real
docker logs -f combustible-api

# Ver últimas 100 líneas de logs
docker logs --tail=100 combustible-api

# Entrar al contenedor
docker exec -it combustible-api sh

# Reiniciar contenedor
docker restart combustible-api

# Detener contenedor
docker stop combustible-api

# Iniciar contenedor
docker start combustible-api

# Ver uso de recursos
docker stats combustible-api
```

## 📦 Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir y reiniciar
docker-compose up -d --build

# Detener y eliminar volúmenes
docker-compose down -v

# Ver estado de servicios
docker-compose ps
```

## 🗄️ Base de Datos - Prisma

```bash
# Ejecutar migraciones
docker exec combustible-api npx prisma migrate deploy

# Ver estado de migraciones
docker exec combustible-api npx prisma migrate status

# Generar cliente Prisma
docker exec combustible-api npx prisma generate

# Abrir Prisma Studio (solo desarrollo)
docker exec -it combustible-api npx prisma studio

# Ejecutar seeds
docker exec combustible-api npx prisma db seed

# Crear nueva migración (desarrollo)
docker exec -it combustible-api npx prisma migrate dev --name nombre_migracion
```

## 🔄 Actualización de la Aplicación

```bash
# Método 1: Con script automático
./deploy.sh

# Método 2: Manual
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker exec combustible-api npx prisma migrate deploy

# Método 3: Sin reconstruir (solo código)
git pull
docker-compose restart combustible-api
```

## 🔍 Diagnóstico y Troubleshooting

```bash
# Ver logs de errores
docker logs combustible-api 2>&1 | grep -i error

# Ver health check
docker inspect combustible-api | grep -A 10 Health

# Verificar conectividad a base de datos
docker exec combustible-api nc -zv postgres 5432

# Ver variables de entorno del contenedor
docker exec combustible-api env

# Verificar que la API responde
curl http://localhost:3080/api

# Ver procesos dentro del contenedor
docker exec combustible-api ps aux

# Ver espacio en disco
df -h
docker system df
```

## 🧹 Limpieza y Mantenimiento

```bash
# Limpiar contenedores detenidos
docker container prune -f

# Limpiar imágenes sin usar
docker image prune -a -f

# Limpiar volúmenes sin usar
docker volume prune -f

# Limpiar todo (cuidado!)
docker system prune -a --volumes -f

# Ver espacio usado por Docker
docker system df -v
```

## 📊 Monitoreo

```bash
# Ver uso de CPU y memoria en tiempo real
docker stats

# Ver logs de Nginx (si está configurado)
sudo tail -f /var/log/nginx/combustible-api-access.log
sudo tail -f /var/log/nginx/combustible-api-error.log

# Ver logs del sistema
journalctl -u docker -f

# Verificar puertos abiertos
netstat -tulpn | grep 3080
```

## 🔐 Seguridad

```bash
# Generar nuevo JWT secret
openssl rand -base64 64

# Ver certificados SSL
sudo certbot certificates

# Renovar certificados SSL
sudo certbot renew

# Verificar permisos de archivos
ls -la logs uploads
```

## 🌐 Nginx

```bash
# Verificar configuración
sudo nginx -t

# Recargar configuración
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

## 📦 Backup

```bash
# Backup de base de datos
docker exec postgres pg_dump -U postgres control_combustible_v4 > backup_$(date +%Y%m%d).sql

# Backup de volúmenes
docker run --rm -v combustible-api_logs:/data -v $(pwd):/backup alpine tar czf /backup/logs_backup.tar.gz /data

# Restaurar base de datos
docker exec -i postgres psql -U postgres control_combustible_v4 < backup_20250106.sql
```

## 🔄 Portainer

```bash
# Acceder a Portainer
https://tu-vps:9443

# Reiniciar Portainer
docker restart portainer

# Ver logs de Portainer
docker logs -f portainer
```

## 🚨 Comandos de Emergencia

```bash
# Detener todo inmediatamente
docker-compose down

# Reiniciar Docker
sudo systemctl restart docker

# Ver todos los procesos de Docker
docker ps -a

# Matar proceso específico
docker kill combustible-api

# Eliminar contenedor forzadamente
docker rm -f combustible-api

# Reiniciar VPS (último recurso)
sudo reboot
```

## 📝 Verificación Post-Despliegue

```bash
# 1. Verificar que el contenedor está corriendo
docker ps | grep combustible-api

# 2. Verificar logs (no debe haber errores)
docker logs --tail=50 combustible-api

# 3. Verificar que la API responde
curl http://localhost:3080/api

# 4. Verificar Swagger
curl http://localhost:3080/api/docs

# 5. Verificar health check
curl http://localhost:3080/api/health

# 6. Verificar conexión a base de datos
docker exec combustible-api npx prisma db pull --print
```

## 🎯 Comandos Útiles Específicos del Proyecto

```bash
# Ver tickets pendientes (ejemplo de query)
docker exec -it postgres psql -U postgres -d control_combustible_v4 -c "SELECT COUNT(*) FROM tickets_abastecimiento WHERE estado_id = 1;"

# Ver usuarios activos
docker exec -it postgres psql -U postgres -d control_combustible_v4 -c "SELECT COUNT(*) FROM usuarios WHERE activo = true;"

# Ver última migración aplicada
docker exec combustible-api npx prisma migrate status
```

## 📞 Soporte Rápido

```bash
# Exportar logs para soporte
docker logs combustible-api > logs_error_$(date +%Y%m%d_%H%M%S).txt

# Exportar configuración
docker inspect combustible-api > config_$(date +%Y%m%d).json

# Ver versión de la imagen
docker images | grep combustible-api
```

---

**Tip**: Guarda este archivo en tu VPS para acceso rápido:
```bash
cat COMANDOS_RAPIDOS.md