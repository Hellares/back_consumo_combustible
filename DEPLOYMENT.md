# 🚀 Guía de Despliegue en VPS con Portainer

## 📋 Requisitos Previos

### En tu VPS:
- ✅ Docker instalado
- ✅ Docker Compose instalado
- ✅ Portainer instalado y funcionando
- ✅ PostgreSQL (puede estar en Docker o instalado directamente)
- ✅ Red Docker `elastika-network` creada

### Verificar red Docker:
```bash
docker network ls | grep elastika-network
```

Si no existe, créala:
```bash
docker network create elastika-network
```

## 🔧 Paso 1: Preparar el Proyecto

### 1.1 Clonar o subir el proyecto a tu VPS

```bash
# Opción A: Clonar desde Git
cd /opt
git clone <tu-repositorio> combustible-api
cd combustible-api

# Opción B: Subir con SCP/SFTP
# Desde tu máquina local:
scp -r ./back_consumo_combustible usuario@tu-vps:/opt/combustible-api
```

### 1.2 Crear archivo .env de producción

```bash
cd /opt/combustible-api
cp .env.production.example .env
nano .env
```

**Configurar las siguientes variables:**

```env
NODE_ENV=production
APP_PORT=3080

# Tu base de datos PostgreSQL
DATABASE_URL=postgresql://postgres:TU_PASSWORD@postgres:5432/control_combustible_v4

# Generar JWT secret seguro
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=1d

DEFAULT_ROLE_NAME=USER

# Tus dominios
CORS_ORIGIN=https://tu-dominio.com,https://api.tu-dominio.com

# Tus credenciales de Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 1.3 Crear directorios necesarios

```bash
mkdir -p logs uploads
chmod 755 logs uploads
```

## 🗄️ Paso 2: Configurar PostgreSQL

### Opción A: PostgreSQL en Docker (Recomendado)

```bash
# Crear volumen para persistencia
docker volume create postgres_data

# Ejecutar PostgreSQL
docker run -d \
  --name postgres \
  --network elastika-network \
  -e POSTGRES_PASSWORD=TU_PASSWORD_SEGURO \
  -e POSTGRES_DB=control_combustible_v4 \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:14-alpine
```

### Opción B: PostgreSQL ya instalado en el VPS

Asegúrate de que PostgreSQL acepte conexiones desde Docker:

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf
# Cambiar: listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Agregar: host all all 172.16.0.0/12 md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

Crear la base de datos:
```bash
sudo -u postgres psql
CREATE DATABASE control_combustible_v4;
\q
```

## 🐳 Paso 3: Desplegar con Portainer

### Método 1: Stack desde Portainer UI (Recomendado)

1. **Acceder a Portainer**: `https://tu-vps:9443`

2. **Ir a Stacks → Add Stack**

3. **Configurar el Stack:**
   - **Name**: `combustible-api`
   - **Build method**: `Repository`
   - **Repository URL**: Tu repositorio Git (o usar "Web editor")
   - **Repository reference**: `main` o `master`
   - **Compose path**: `docker-compose.yml`

4. **Variables de Entorno** (en la sección Environment variables):
   ```
   NODE_ENV=production
   APP_PORT=3080
   DATABASE_URL=postgresql://postgres:PASSWORD@postgres:5432/control_combustible_v4
   JWT_SECRET=tu-secret-generado
   JWT_EXPIRES_IN=1d
   DEFAULT_ROLE_NAME=USER
   CORS_ORIGIN=https://tu-dominio.com
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

5. **Deploy the stack**

### Método 2: Desde línea de comandos

```bash
cd /opt/combustible-api

# Construir la imagen
docker-compose build

# Iniciar el servicio
docker-compose up -d

# Ver logs
docker-compose logs -f combustible-api
```

## 🔄 Paso 4: Ejecutar Migraciones de Base de Datos

```bash
# Entrar al contenedor
docker exec -it combustible-api sh

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Ejecutar seeds
npx prisma db seed

# Salir del contenedor
exit
```

## ✅ Paso 5: Verificar el Despliegue

### 5.1 Verificar que el contenedor está corriendo

```bash
docker ps | grep combustible-api
```

### 5.2 Ver logs

```bash
docker logs -f combustible-api
```

Deberías ver:
```
🚀 Aplicación ejecutándose en: http://localhost:3080
📚 Documentación API: http://localhost:3080/api/docs
```

### 5.3 Probar la API

```bash
# Health check
curl http://localhost:3080/api

# Documentación Swagger
curl http://localhost:3080/api/docs
```

### 5.4 Probar desde el navegador

Accede a: `http://tu-vps-ip:3080/api/docs`

## 🔒 Paso 6: Configurar Nginx Reverse Proxy (Opcional pero Recomendado)

### 6.1 Instalar Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 6.2 Configurar sitio

```bash
sudo nano /etc/nginx/sites-available/combustible-api
```

```nginx
server {
    listen 80;
    server_name api.tu-dominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tu-dominio.com;

    # Certificados SSL (usar Certbot)
    ssl_certificate /etc/letsencrypt/live/api.tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tu-dominio.com/privkey.pem;

    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logs
    access_log /var/log/nginx/combustible-api-access.log;
    error_log /var/log/nginx/combustible-api-error.log;

    # Proxy a la aplicación
    location / {
        proxy_pass http://localhost:3080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Límite de tamaño de archivos
    client_max_body_size 50M;
}
```

### 6.3 Habilitar sitio

```bash
sudo ln -s /etc/nginx/sites-available/combustible-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6.4 Obtener certificado SSL con Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.tu-dominio.com
```

## 🔄 Actualizar la Aplicación

### Desde Portainer:

1. Ir a **Stacks → combustible-api**
2. Click en **Pull and redeploy**

### Desde línea de comandos:

```bash
cd /opt/combustible-api

# Obtener últimos cambios
git pull

# Reconstruir y reiniciar
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ejecutar migraciones si hay cambios en la BD
docker exec -it combustible-api npx prisma migrate deploy
```

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
docker logs -f combustible-api
```

### Ver uso de recursos

```bash
docker stats combustible-api
```

### Verificar health check

```bash
docker inspect combustible-api | grep -A 10 Health
```

## 🐛 Solución de Problemas

### El contenedor no inicia

```bash
# Ver logs detallados
docker logs combustible-api

# Ver eventos del contenedor
docker events --filter container=combustible-api
```

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Probar conexión desde el contenedor
docker exec -it combustible-api sh
nc -zv postgres 5432
```

### Error de permisos en volúmenes

```bash
# Ajustar permisos
sudo chown -R 1001:1001 logs uploads
```

### Limpiar y reiniciar desde cero

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📝 Checklist de Despliegue

- [ ] VPS configurado con Docker y Portainer
- [ ] Red `elastika-network` creada
- [ ] PostgreSQL instalado y configurado
- [ ] Archivo `.env` creado con valores reales
- [ ] Directorios `logs` y `uploads` creados
- [ ] Stack desplegado en Portainer
- [ ] Migraciones ejecutadas
- [ ] API respondiendo en puerto 3080
- [ ] Nginx configurado (opcional)
- [ ] SSL configurado con Certbot (opcional)
- [ ] Health checks funcionando
- [ ] Logs monitoreados

## 🎉 ¡Listo!

Tu API debería estar funcionando en:
- **Local**: `http://localhost:3080/api/docs`
- **Con Nginx**: `https://api.tu-dominio.com/api/docs`

---

**Última actualización**: 2025-01-06