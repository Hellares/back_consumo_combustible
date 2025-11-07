# 🚀 Instrucciones para Aplicar la Migración de Refresh Tokens

## ⚠️ IMPORTANTE: Drift Detectado

Se ha detectado que la base de datos tiene cambios que no están sincronizados con las migraciones. Antes de aplicar la nueva migración de refresh tokens, debes resolver este problema.

## 📋 Opciones para Aplicar la Migración

### Opción 1: Crear Migración sin Aplicar (Recomendado para Producción)

Si estás en un entorno de producción o no quieres perder datos:

```bash
# 1. Crear la migración sin aplicarla
npx prisma migrate dev --create-only --name add_refresh_tokens_system

# 2. Revisar el archivo SQL generado en prisma/migrations/

# 3. Aplicar manualmente en la base de datos o usar:
npx prisma migrate deploy
```

### Opción 2: Resolver el Drift Primero

```bash
# 1. Crear una migración baseline con el estado actual
npx prisma migrate resolve --applied "nombre_migracion_drift"

# 2. Luego crear la migración de refresh tokens
npx prisma migrate dev --name add_refresh_tokens_system
```

### Opción 3: Reset de Base de Datos (Solo Desarrollo)

⚠️ **ADVERTENCIA: Esto eliminará TODOS los datos**

```bash
# Solo usar en desarrollo
npx prisma migrate reset
npx prisma migrate dev --name add_refresh_tokens_system
```

## 📝 SQL Manual para Crear la Tabla

Si prefieres aplicar manualmente, ejecuta este SQL en tu base de datos:

```sql
-- Crear tabla refresh_tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" SERIAL PRIMARY KEY,
    "token" VARCHAR(500) UNIQUE NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "dispositivo_id" VARCHAR(100),
    "user_agent" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "expires_at" TIMESTAMP NOT NULL,
    "revocado" BOOLEAN DEFAULT false NOT NULL,
    "fecha_revocado" TIMESTAMP,
    "motivo_revocado" VARCHAR(200),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT "refresh_tokens_usuario_id_fkey" 
        FOREIGN KEY ("usuario_id") 
        REFERENCES "usuarios"("id") 
        ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX "refresh_tokens_usuario_id_revocado_idx" 
    ON "refresh_tokens"("usuario_id", "revocado");

CREATE INDEX "refresh_tokens_token_idx" 
    ON "refresh_tokens"("token");

CREATE INDEX "refresh_tokens_expires_at_idx" 
    ON "refresh_tokens"("expires_at");

-- Agregar columna refreshTokens a usuarios (relación virtual, no requiere SQL)
-- Esta relación se maneja en Prisma, no en la base de datos
```

## ✅ Verificar la Migración

Después de aplicar la migración, verifica que todo esté correcto:

```bash
# Verificar el estado de las migraciones
npx prisma migrate status

# Generar el cliente de Prisma
npx prisma generate

# Verificar que la tabla existe
npx prisma studio
```

## 🔧 Configurar Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env`:

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
```

## 🧪 Probar el Sistema

Una vez aplicada la migración, prueba los endpoints:

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"dni":"12345678","password":"password123"}'

# 2. Refresh
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"TOKEN_AQUI"}'

# 3. Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"TOKEN_AQUI"}'
```

## 📚 Documentación Completa

Para más detalles sobre el sistema de refresh tokens, consulta:
- `src/auth/README_REFRESH_TOKENS.md`

## 🆘 Soporte

Si encuentras problemas:
1. Verifica que Prisma Client esté actualizado: `npx prisma generate`
2. Revisa los logs del servidor
3. Verifica que las variables de entorno estén configuradas
4. Consulta la documentación en `src/auth/README_REFRESH_TOKENS.md`