# Sistema de Autenticación y Autorización

Este proyecto implementa un sistema completo de autenticación y autorización basado en JWT con soporte para roles y permisos granulares.

## Estructura del Sistema

### 1. Roles y Permisos

Los roles se definen en la base de datos con una estructura de permisos JSON que especifica qué acciones puede realizar cada rol sobre qué recursos.

**Ejemplo de estructura de permisos en un rol:**
```json
{
  "usuarios": ["create", "read", "update", "delete"],
  "unidades": ["read", "update"],
  "abastecimientos": ["create", "read", "approve"],
  "reportes": ["read", "export"]
}
```

### 2. Guards Disponibles

#### JwtAuthGuard
- Verifica la autenticación del usuario mediante JWT
- Uso: `@UseGuards(JwtAuthGuard)`

#### JwtRolesGuard
- Verifica que el usuario tenga al menos uno de los roles especificados
- Uso: `@UseGuards(JwtAuthGuard, JwtRolesGuard)`
- Decorador: `@HasRoles(JwtRole.ADMIN, JwtRole.SUPERVISOR)`

#### JwtPermissionsGuard
- Verifica que el usuario tenga permisos específicos para acciones sobre recursos
- Uso: `@UseGuards(JwtAuthGuard, JwtPermissionsGuard)`
- Decorador: `@Permissions({ resource: 'usuarios', actions: ['create', 'read'] })`

### 3. Decoradores

#### @Permissions()
Define los permisos requeridos para acceder a un endpoint.

```typescript
@Permissions(
  { resource: 'usuarios', actions: ['create', 'read'] },
  { resource: 'reportes', actions: ['export'] }
)
```

**Parámetros:**
- `resource`: El recurso sobre el cual se requiere permiso (usuarios, unidades, abastecimientos, etc.)
- `actions`: Array de acciones permitidas (create, read, update, delete, approve, export)

### 4. Tipos de Permisos

#### Recursos disponibles:
- `usuarios`: Gestión de usuarios
- `unidades`: Gestión de unidades de transporte
- `abastecimientos`: Control de abastecimientos
- `reportes`: Reportes y estadísticas
- `configuracion`: Configuración del sistema
- `mantenimientos`: Gestión de mantenimientos
- `fallas`: Gestión de fallas
- `inspecciones`: Inspecciones de unidades

#### Acciones disponibles:
- `create`: Crear nuevos registros
- `read`: Leer/ver información
- `update`: Actualizar/modificar
- `delete`: Eliminar
- `approve`: Aprobar/rechazar
- `export`: Exportar datos

## Ejemplos de Uso

### 1. Endpoint con protección de roles
```typescript
@UseGuards(JwtAuthGuard, JwtRolesGuard)
@HasRoles(JwtRole.ADMIN, JwtRole.SUPERVISOR)
@Get('admin/users')
async getAllUsers() {
  // Solo usuarios con rol ADMIN o SUPERVISOR pueden acceder
}
```

### 2. Endpoint con protección de permisos
```typescript
@UseGuards(JwtAuthGuard, JwtPermissionsGuard)
@Permissions({ resource: 'usuarios', actions: ['delete'] })
@Delete(':id')
async deleteUser(@Param('id') id: number) {
  // Solo usuarios con permiso 'delete' sobre 'usuarios' pueden acceder
}
```

### 3. Endpoint con múltiples requisitos de permisos
```typescript
@UseGuards(JwtAuthGuard, JwtPermissionsGuard)
@Permissions(
  { resource: 'usuarios', actions: ['create', 'read'] },
  { resource: 'reportes', actions: ['export'] }
)
@Post('admin/bulk-create')
async bulkCreateUsers() {
  // El usuario debe tener permisos de 'create' O 'read' en 'usuarios'
  // Y permisos de 'export' en 'reportes'
}
```

### 4. Combinación de roles y permisos
```typescript
@UseGuards(JwtAuthGuard, JwtRolesGuard, JwtPermissionsGuard)
@HasRoles(JwtRole.ADMIN)
@Permissions({ resource: 'usuarios', actions: ['delete'] })
@Delete('admin/users/:id')
async adminDeleteUser(@Param('id') id: number) {
  // Requiere ser ADMIN Y tener permiso específico de delete en usuarios
}
```

## Configuración en la Base de Datos

Los permisos se configuran en el campo `permisos` de la tabla `roles`:

```sql
UPDATE roles SET permisos = '{
  "usuarios": ["create", "read", "update", "delete"],
  "unidades": ["read", "update"],
  "abastecimientos": ["create", "read", "approve"],
  "reportes": ["read", "export"],
  "configuracion": ["read", "update"]
}' WHERE nombre = 'ADMIN';
```

## Flujo de Autenticación

1. **Login**: El usuario se autentica con DNI y contraseña
2. **Token Generation**: Se genera un JWT con:
   - Información del usuario (id, dni, nombres)
   - Roles del usuario con sus permisos
   - Permisos consolidados para acceso rápido
3. **Request**: Cada request incluye el token en el header Authorization
4. **Validation**: Los guards verifican roles y permisos según los decoradores
5. **Access**: Si todo es válido, se permite el acceso al endpoint

## Mejores Prácticas

1. **Principio de menor privilegio**: Asignar solo los permisos necesarios
2. **Separación de concerns**: Usar roles para acceso general y permisos para acciones específicas
3. **Validación en múltiples capas**: Combinar roles y permisos cuando sea necesario
4. **Auditoría**: Mantener logs de acciones críticas
5. **Revisión periódica**: Revisar y actualizar permisos regularmente