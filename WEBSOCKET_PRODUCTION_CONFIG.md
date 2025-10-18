# 🔌 Configuración de WebSocket para Producción

## 📋 Resumen

Este documento explica cómo configurar correctamente la URL del WebSocket para conectar tu aplicación en producción.

---

## 🎯 Configuración del Backend

### 1. Variables de Entorno (`.env`)

Crea o edita tu archivo `.env` en producción con las siguientes variables:

```bash
# ============================================
# CORS ORIGINS
# ============================================
# Incluye TODAS las URLs desde donde se conectará el frontend
# Separar con comas, sin espacios
CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com,https://app.tu-dominio.com

# ============================================
# WEBSOCKET CONFIGURATION
# ============================================
# URL del servidor WebSocket (opcional, solo para referencia)
WEBSOCKET_URL="https://combustible-api.syncronize.net.pe"
```

### 2. Configuración Automática

El WebSocket Gateway en [`src/gps/gps.gateway.ts`](src/gps/gps.gateway.ts:58) ya está configurado para usar automáticamente la variable `CORS_ORIGIN`:

```typescript
@WebSocketGateway({
  namespace: '/gps',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
```

---

## 📱 Configuración del Frontend/Cliente

### Opción 1: Flutter (Dart)

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  late IO.Socket socket;
  
  void connect(String token) {
    // URL de producción
    const String socketUrl = 'https://api.tu-dominio.com';
    
    socket = IO.io(
      socketUrl,
      IO.OptionBuilder()
        .setTransports(['websocket', 'polling'])
        .enableAutoConnect()
        .enableReconnection()
        .setAuth({'token': token})
        .setExtraHeaders({'Authorization': 'Bearer $token'})
        .build(),
    );
    
    socket.connect();
  }
}
```

### Opción 2: JavaScript/TypeScript (React, Vue, Angular)

```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://api.tu-dominio.com';

export const connectSocket = (token: string): Socket => {
  const socket = io(`${SOCKET_URL}/gps`, {
    transports: ['websocket', 'polling'],
    auth: {
      token: token
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });
  
  return socket;
};
```

### Opción 3: Variables de Entorno del Frontend

**React (.env.production):**
```bash
REACT_APP_API_URL=https://api.tu-dominio.com
REACT_APP_SOCKET_URL=https://api.tu-dominio.com
```

**Vue (.env.production):**
```bash
VUE_APP_API_URL=https://api.tu-dominio.com
VUE_APP_SOCKET_URL=https://api.tu-dominio.com
```

**Angular (environment.prod.ts):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tu-dominio.com',
  socketUrl: 'https://api.tu-dominio.com'
};
```

---

## 🚀 URLs del WebSocket

### Desarrollo
```
ws://localhost:3000/gps
```

### Producción (HTTP)
```
ws://api.tu-dominio.com/gps
```

### Producción (HTTPS) - **Recomendado**
```
wss://api.tu-dominio.com/gps
```

> ⚠️ **Importante:** Si tu servidor usa HTTPS, el WebSocket automáticamente usará WSS (WebSocket Secure).

---

## 🔐 Autenticación

El WebSocket requiere autenticación JWT. Hay **3 formas** de enviar el token:

### 1. En `auth` (Recomendado para Flutter)
```dart
socket = IO.io(url, IO.OptionBuilder()
  .setAuth({'token': 'tu-jwt-token'})
  .build()
);
```

### 2. En `extraHeaders`
```typescript
const socket = io(url, {
  extraHeaders: {
    Authorization: 'Bearer tu-jwt-token'
  }
});
```

### 3. En query params
```typescript
const socket = io(`${url}?token=tu-jwt-token`);
```

---

## 🐳 Configuración con Docker

Si usas Docker, asegúrate de exponer el puerto correcto:

**docker-compose.yml:**
```yaml
services:
  backend:
    ports:
      - "3000:3000"  # Puerto HTTP/WebSocket
    environment:
      - CORS_ORIGIN=https://tu-dominio.com,https://app.tu-dominio.com
      - NODE_ENV=production
```

---

## 🌐 Configuración de Nginx (Reverse Proxy)

Si usas Nginx como proxy inverso:

```nginx
server {
    listen 443 ssl;
    server_name api.tu-dominio.com;

    # Configuración SSL
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Proxy para API REST
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy para WebSocket
    location /gps {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts para WebSocket
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

---

## ✅ Checklist de Producción

- [ ] Configurar `CORS_ORIGIN` en `.env` con todas las URLs del frontend
- [ ] Usar HTTPS/WSS en producción (no HTTP/WS)
- [ ] Configurar certificado SSL válido
- [ ] Configurar Nginx/Apache para proxy WebSocket
- [ ] Probar conexión desde el frontend
- [ ] Verificar que el token JWT se envía correctamente
- [ ] Monitorear logs de conexión en el servidor
- [ ] Configurar reconexión automática en el cliente

---

## 🔍 Debugging

### Ver conexiones activas
```bash
# En el servidor
curl http://localhost:3000/api/gps/status
```

### Logs del servidor
El servidor mostrará logs como:
```
🔌 [Gateway] Cliente intentando conectar: abc123
✅ [Gateway] Token válido - User ID: 1
✅ [Gateway] Cliente conectado exitosamente: abc123 | Usuario: 12345678
```

### Errores comunes

1. **CORS Error:** Verifica que la URL del frontend esté en `CORS_ORIGIN`
2. **Token inválido:** Verifica que el token JWT sea válido y no haya expirado
3. **Connection refused:** Verifica que el servidor esté corriendo y el puerto sea accesible
4. **SSL Error:** Si usas HTTPS, asegúrate de tener un certificado válido

---

## 📞 Soporte

Para más información, consulta:
- [`src/gps/gps.gateway.ts`](src/gps/gps.gateway.ts) - Implementación del Gateway
- [`src/gps/interfaces/tracking-events.interface.ts`](src/gps/interfaces/tracking-events.interface.ts) - Eventos disponibles
- [Socket.IO Documentation](https://socket.io/docs/v4/)