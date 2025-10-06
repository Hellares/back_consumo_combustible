# 🚛 Sistema de Gestión de Consumo de Combustible

Sistema backend desarrollado con NestJS para la gestión integral de consumo de combustible, mantenimiento y control de unidades de transporte.

## 📋 Características Principales

### 🔐 Autenticación y Autorización
- Sistema de autenticación JWT
- Control de acceso basado en roles y permisos
- Gestión de usuarios y licencias de conducir

### 🚗 Gestión de Unidades
- Control de flota vehicular
- Historial de estados y conductores
- Inspecciones y mantenimientos
- Sistema de alertas y fallas

### ⛽ Control de Abastecimiento
- Tickets de solicitud de combustible
- Validación de kilometraje secuencial
- Control de precintos únicos
- Aprobación y rechazo de solicitudes
- Gestión de archivos y comprobantes

### 🗺️ Sistema de Rutas e Itinerarios
- Gestión de rutas operativas
- Itinerarios programados
- Seguimiento GPS en tiempo real
- Detección de desvíos y alertas
- Registro de tramos y ejecuciones

### 📊 Reportes y Estadísticas
- Consumo por unidad y conductor
- Estadísticas de tickets
- Historial de mantenimientos
- Análisis de rendimiento

## 🛠️ Tecnologías

- **Framework**: NestJS 10.x
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT (Passport)
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Almacenamiento**: Cloudinary (archivos e imágenes)
- **Seguridad**: Helmet, CORS, bcrypt

## 📦 Instalación

### Prerrequisitos
- Node.js 18.x o superior
- PostgreSQL 14.x o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd back_consumo_combustible
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
# Ejecutar migraciones
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# (Opcional) Ejecutar seeds
npx prisma db seed
```

5. **Iniciar aplicación**
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🔧 Variables de Entorno

Consulta el archivo `.env.example` para ver todas las variables requeridas:

```env
# Application
NODE_ENV=development
APP_PORT=3080

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📚 Documentación API

Una vez iniciada la aplicación, accede a la documentación interactiva:

```
http://localhost:3080/api/docs
```

## 🐳 Docker

### Construcción y Ejecución

```bash
# Construir imagen
docker build -t combustible-api:1.0.0 .

# Ejecutar con docker-compose
docker-compose up -d
```

### Configuración Docker

El proyecto incluye:
- `Dockerfile` - Multi-stage build optimizado
- `docker-compose.yml` - Orquestación de servicios

## 📁 Estructura del Proyecto

```
src/
├── auth/                 # Autenticación y autorización
├── usuarios/             # Gestión de usuarios
├── roles/                # Sistema de roles
├── unidades/             # Gestión de unidades
├── tickets_abastecimiento/  # Control de combustible
├── archivos/             # Gestión de archivos
├── zonas/                # Zonas operativas
├── sedes/                # Sedes y grifos
├── grifos/               # Puntos de abastecimiento
├── turnos/               # Gestión de turnos
├── licencias_conducir/   # Licencias de conductores
├── common/               # Utilidades compartidas
│   ├── decorators/       # Decoradores personalizados
│   ├── dto/              # DTOs comunes
│   ├── filters/          # Filtros de excepciones
│   ├── guards/           # Guards de autorización
│   └── interceptors/     # Interceptores
├── config/               # Configuraciones
└── database/             # Prisma service

prisma/
├── schema.prisma         # Esquema de base de datos
├── migrations/           # Migraciones
└── seeds/                # Datos iniciales
```

## 🔑 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth` - Registrar usuario

### Tickets de Abastecimiento
- `GET /api/tickets-abastecimiento` - Listar tickets
- `POST /api/tickets-abastecimiento` - Crear ticket
- `GET /api/tickets-abastecimiento/:id` - Obtener ticket
- `PATCH /api/tickets-abastecimiento/:id` - Actualizar ticket
- `POST /api/tickets-abastecimiento/:id/aprobar` - Aprobar ticket
- `POST /api/tickets-abastecimiento/:id/rechazar` - Rechazar ticket

### Unidades
- `GET /api/unidades` - Listar unidades
- `POST /api/unidades` - Crear unidad
- `GET /api/unidades/:id` - Obtener unidad
- `PATCH /api/unidades/:id` - Actualizar unidad

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario con roles
- `POST /api/usuarios/:id/roles` - Asignar rol
- `DELETE /api/usuarios/:id/roles/:rolId` - Revocar rol

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Scripts Disponibles

```bash
npm run start          # Iniciar en modo normal
npm run start:dev      # Iniciar en modo desarrollo (watch)
npm run start:debug    # Iniciar en modo debug
npm run start:prod     # Iniciar en modo producción
npm run build          # Compilar proyecto
npm run format         # Formatear código con Prettier
npm run lint           # Ejecutar ESLint
```

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de datos con class-validator
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado
- ✅ Rate limiting (recomendado implementar)
- ✅ SQL injection protection (Prisma ORM)

## 🚀 Despliegue

### Consideraciones de Producción

1. **Variables de Entorno**: Usar secretos seguros
2. **Base de Datos**: Configurar backups automáticos
3. **Logs**: Implementar sistema de logging centralizado
4. **Monitoreo**: Configurar health checks
5. **SSL/TLS**: Usar certificados válidos
6. **Rate Limiting**: Implementar límites de peticiones

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo de Desarrollo

Desarrollado para la gestión de flota vehicular y control de combustible.

## 📞 Soporte

Para soporte técnico o consultas, contactar al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: 2025
