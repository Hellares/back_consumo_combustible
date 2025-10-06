# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluidas dev)
RUN npm install

# Copiar archivos de configuración
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copiar Prisma y generar cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar código fuente
COPY src ./src

# Compilar la aplicación
RUN npm run build

# Verificar que la compilación fue exitosa
RUN ls -la dist/ && \
    if [ -f dist/main.js ]; then \
        echo "✅ Build exitoso - main.js generado"; \
    else \
        echo "❌ ERROR: main.js no encontrado" && exit 1; \
    fi

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Crear directorios para logs y uploads
RUN mkdir -p logs uploads && \
    chmod -R 777 logs uploads

# Exponer puerto
EXPOSE 3080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3080/api', (r) => {process.exit(r.statusCode === 404 || r.statusCode === 200 ? 0 : 1)})" || exit 1

# Comando de inicio
CMD ["node", "dist/main.js"]