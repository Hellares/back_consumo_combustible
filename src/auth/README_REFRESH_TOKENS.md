# Sistema de Refresh Tokens - Documentación

## 📋 Descripción General

Se ha implementado un sistema completo de autenticación con **Dual Token** (Access Token + Refresh Token) para mejorar la seguridad y experiencia del usuario.

## 🔑 Características Implementadas

### 1. **Dual Token System**
- **Access Token**: Duración corta (15 minutos por defecto)
- **Refresh Token**: Duración larga (7 días por defecto)
- **Rotación automática**: Los refresh tokens se rotan en cada renovación

### 2. **Seguridad Mejorada**
- ✅ Tokens de corta duración reducen ventana de vulnerabilidad
- ✅ Revocación inmediata de tokens
- ✅ Control de sesiones múltiples (máximo 5 dispositivos)
- ✅ Metadata de sesión (IP, User-Agent, Device ID)
- ✅ Limpieza automática de tokens expirados

### 3. **Gestión de Sesiones**
- Logout individual (cierra sesión actual)
- Logout masivo (cierra todas las sesiones del usuario)
- Rastreo de dispositivos y ubicaciones
- Límite de sesiones activas por usuario

## 🚀 Endpoints Disponibles

### POST `/auth/login`
Inicia sesión y retorna access token + refresh token.

**Request:**
```json
{
  "dni": "12345678",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

### POST `/auth/refresh`
Renueva los tokens usando un refresh token válido.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens renovados exitosamente",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

### POST `/auth/logout`
Cierra la sesión actual revocando el refresh token.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### POST `/auth/logout-all`
Cierra todas las sesiones activas del usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Todas las sesiones han sido cerradas exitosamente"
}
```

### POST `/auth/register`
Registra un nuevo usuario (endpoint público).

## 🔧 Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_EXPIRY="15m"    # Duración del access token
JWT_REFRESH_EXPIRY="7d"    # Duración del refresh token
```

### Formatos de Expiración Soportados
- `s` - segundos (ej: `30s`)
- `m` - minutos (ej: `15m`)
- `h` - horas (ej: `2h`)
- `d` - días (ej: `7d`)

## 📊 Base de Datos

### Tabla `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(500) UNIQUE NOT NULL,
  usuario_id INTEGER NOT NULL,
  dispositivo_id VARCHAR(100),
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  revocado BOOLEAN DEFAULT false,
  fecha_revocado TIMESTAMP,
  motivo_revocado VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

### Migración

Ejecutar la migración de Prisma:

```bash
npx prisma migrate dev --name add_refresh_tokens
```

## 🔄 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. LOGIN                                               │
│     POST /auth/login                                    │
│     ├─ Valida credenciales                             │
│     ├─ Genera Access Token (15 min)                    │
│     ├─ Genera Refresh Token (7 días)                   │
│     ├─ Guarda Refresh Token en BD                      │
│     └─ Retorna ambos tokens                            │
│                                                         │
│  2. REQUESTS NORMALES                                   │
│     GET /api/resource                                   │
│     └─ Header: Authorization: Bearer {accessToken}     │
│                                                         │
│  3. ACCESS TOKEN EXPIRA                                 │
│     POST /auth/refresh                                  │
│     ├─ Valida Refresh Token en BD                      │
│     ├─ Revoca Refresh Token actual                     │
│     ├─ Genera nuevo Access Token                       │
│     ├─ Genera nuevo Refresh Token                      │
│     └─ Retorna nuevos tokens                           │
│                                                         │
│  4. LOGOUT                                              │
│     POST /auth/logout                                   │
│     └─ Revoca Refresh Token en BD                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🛡️ Seguridad

### Límite de Sesiones
- Máximo 5 sesiones activas por usuario
- Al exceder el límite, se revoca la sesión más antigua

### Limpieza Automática
- Se ejecuta diariamente a las 3:00 AM
- Elimina tokens expirados
- Elimina tokens revocados con más de 30 días

### Metadata de Sesión
Cada refresh token almacena:
- IP Address
- User Agent
- Device ID (opcional, enviado en header `X-Device-Id`)

## 📱 Integración Frontend

### Ejemplo con Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

// Interceptor para agregar token
api.interceptors.request.use(config => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor para renovar token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post('/auth/refresh', {
          refreshToken
        });

        accessToken = data.data.accessToken;
        refreshToken = data.data.refreshToken;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token inválido, redirigir a login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## 🧪 Testing

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"dni":"12345678","password":"password123"}'
```

### Refresh
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGc..."}'
```

### Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGc..."}'
```

## 📈 Mejoras Futuras

- [ ] Notificaciones de nuevas sesiones
- [ ] Dashboard de sesiones activas
- [ ] Geolocalización de sesiones
- [ ] Detección de actividad sospechosa
- [ ] Refresh token de un solo uso (one-time use)
- [ ] Fingerprinting de dispositivos

## 🐛 Troubleshooting

### Error: "Refresh token inválido"
- Verificar que el token no haya expirado
- Verificar que el token no haya sido revocado
- Verificar que el usuario esté activo

### Error: "Límite de sesiones excedido"
- El usuario tiene más de 5 sesiones activas
- Se revocó automáticamente la sesión más antigua
- Usar `/auth/logout-all` para limpiar todas las sesiones

### Tokens no se limpian automáticamente
- Verificar que `@nestjs/schedule` esté instalado
- Verificar que `ScheduleModule` esté importado en `AuthModule`
- Verificar logs del servidor a las 3:00 AM

## 📚 Referencias

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NestJS JWT](https://docs.nestjs.com/security/authentication)