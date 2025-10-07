# Guía de Solución de Errores de Conexión PostgreSQL

## Error 10054: "Se ha forzado la interrupción de una conexión existente por el host remoto"

Este error ocurre cuando la conexión con PostgreSQL se interrumpe inesperadamente. Hemos implementado varias soluciones para manejarlo.

## Soluciones Implementadas

### 1. **Configuración Optimizada del Connection Pool**

En tu archivo `.env`, asegúrate de tener estos parámetros en la `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name?connection_limit=20&pool_timeout=30&connect_timeout=10&statement_timeout=60000&idle_in_transaction_session_timeout=60000
```

**Parámetros explicados:**
- `connection_limit=20`: Máximo 20 conexiones simultáneas en el pool
- `pool_timeout=30`: Espera hasta 30 segundos para obtener una conexión del pool
- `connect_timeout=10`: Espera hasta 10 segundos para establecer la conexión inicial
- `statement_timeout=60000`: Las queries tienen máximo 60 segundos para ejecutarse
- `idle_in_transaction_session_timeout=60000`: Las transacciones idle se cierran después de 60 segundos

### 2. **Sistema de Reconexión Automática**

El [`PrismaService`](src/database/prisma.service.ts) ahora incluye:

- **Reconexión automática**: Hasta 5 intentos de reconexión con backoff exponencial
- **Health check periódico**: Verifica la conexión cada 30 segundos
- **Retry automático**: El método `executeWithRetry()` reintenta operaciones fallidas

### 3. **Uso del Método `executeWithRetry()`**

Para operaciones críticas, usa este método en tus servicios:

```typescript
// Ejemplo en un servicio
async findAll() {
  return this.prisma.executeWithRetry(async () => {
    return this.prisma.licenciasConducir.findMany({
      include: { usuario: true }
    });
  });
}
```

### 4. **Configuración de PostgreSQL**

En tu servidor PostgreSQL, ajusta estos parámetros en `postgresql.conf`:

```conf
# Conexiones
max_connections = 100
superuser_reserved_connections = 3

# Timeouts
tcp_keepalives_idle = 60        # Segundos antes de enviar keepalive
tcp_keepalives_interval = 10    # Intervalo entre keepalives
tcp_keepalives_count = 6        # Número de keepalives antes de cerrar

# Statement timeout
statement_timeout = 60000       # 60 segundos

# Idle in transaction
idle_in_transaction_session_timeout = 60000  # 60 segundos
```

Después de modificar, reinicia PostgreSQL:
```bash
# Windows
net stop postgresql-x64-14
net start postgresql-x64-14

# Linux
sudo systemctl restart postgresql
```

## Causas Comunes del Error

### 1. **Connection Pool Agotado**
- **Síntoma**: Muchas queries simultáneas
- **Solución**: Aumentar `connection_limit` en DATABASE_URL

### 2. **Queries Lentas**
- **Síntoma**: Queries que tardan mucho tiempo
- **Solución**: Optimizar queries, agregar índices, aumentar `statement_timeout`

### 3. **Conexiones Idle**
- **Síntoma**: Conexiones que no se usan por mucho tiempo
- **Solución**: El health check mantiene las conexiones activas

### 4. **Firewall o Antivirus**
- **Síntoma**: Conexiones bloqueadas intermitentemente
- **Solución**: Agregar excepciones para PostgreSQL (puerto 5432)

### 5. **Recursos del Servidor**
- **Síntoma**: Servidor PostgreSQL con poca memoria/CPU
- **Solución**: Aumentar recursos o optimizar configuración

## Monitoreo y Debugging

### Ver Conexiones Activas en PostgreSQL

```sql
-- Ver todas las conexiones activas
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query,
  state_change
FROM pg_stat_activity
WHERE datname = 'tu_base_de_datos';

-- Contar conexiones por estado
SELECT state, COUNT(*) 
FROM pg_stat_activity 
WHERE datname = 'tu_base_de_datos'
GROUP BY state;
```

### Logs de Prisma

Los logs ahora incluyen información detallada:
- Errores de conexión
- Intentos de reconexión
- Duración de queries (en modo desarrollo)

### Variables de Entorno para Debugging

```env
# Activar logs detallados de Prisma
DEBUG=prisma:*

# Modo desarrollo para ver queries
NODE_ENV=development
```

## Mejores Prácticas

### ✅ DO (Hacer)

1. **Usar transacciones para operaciones múltiples**
   ```typescript
   await this.prisma.$transaction(async (tx) => {
     await tx.table1.create({ data: ... });
     await tx.table2.update({ where: ..., data: ... });
   });
   ```

2. **Cerrar conexiones en tests**
   ```typescript
   afterAll(async () => {
     await prisma.$disconnect();
   });
   ```

3. **Usar índices en columnas frecuentemente consultadas**
   ```prisma
   @@index([usuarioId, fecha])
   ```

4. **Limitar resultados con paginación**
   ```typescript
   const results = await prisma.table.findMany({
     take: 10,
     skip: page * 10
   });
   ```

### ❌ DON'T (No hacer)

1. **No crear múltiples instancias de PrismaClient**
   - Usar siempre el servicio inyectado

2. **No hacer queries en loops**
   ```typescript
   // ❌ MAL
   for (const id of ids) {
     await prisma.table.findUnique({ where: { id } });
   }
   
   // ✅ BIEN
   await prisma.table.findMany({ where: { id: { in: ids } } });
   ```

3. **No olvidar manejar errores**
   ```typescript
   try {
     await prisma.table.create({ data });
   } catch (error) {
     // Manejar error apropiadamente
   }
   ```

## Verificación de la Solución

Después de implementar estos cambios:

1. **Reinicia tu aplicación**
   ```bash
   npm run start:dev
   ```

2. **Verifica los logs**
   - Deberías ver: "Database connected successfully"
   - No deberías ver errores de conexión frecuentes

3. **Monitorea el comportamiento**
   - Las reconexiones automáticas deberían resolver errores temporales
   - El health check mantiene la conexión activa

## Soporte Adicional

Si el problema persiste:

1. Verifica que PostgreSQL esté corriendo
2. Revisa los logs de PostgreSQL
3. Verifica la configuración de red/firewall
4. Considera usar un connection pooler como PgBouncer para producción

## Referencias

- [Prisma Connection Management](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [NestJS Prisma Integration](https://docs.nestjs.com/recipes/prisma)