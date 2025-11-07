FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias de sistema necesarias para paquetes nativos
RUN apk add --no-cache python3 make g++

# Copiar package files
COPY package*.json ./

# Usar npm install en lugar de npm ci para mayor compatibilidad
RUN npm install --legacy-peer-deps

# Copiar configuración
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copiar Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar código
COPY src ./src

# Configurar polyfills para crypto
ENV NODE_OPTIONS="--crypto-global"

# Build y mostrar TODO
RUN set -x && \
    npm run build ; \
    echo "=== EXIT CODE: $? ===" && \
    echo "=== Archivos en raíz ===" && \
    ls -la && \
    echo "=== Contenido de dist ===" && \
    ls -laR dist/ 2>/dev/null || echo "NO EXISTE dist/" && \
    echo "=== Buscar main.js ===" && \
    find . -name "main.js" -type f 2>/dev/null && \
    echo "=== Buscar archivos .js compilados ===" && \
    find dist -name "*.js" 2>/dev/null | head -10

# Continuar sin verificar (para ver qué hay)
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias de sistema necesarias para runtime
RUN apk add --no-cache libc6-compat

# Configurar NODE_OPTIONS para polyfills de crypto
ENV NODE_OPTIONS="--crypto-global"

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p logs uploads

EXPOSE 3080

CMD ["node", "dist/main.js"]