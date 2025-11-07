FROM node:18-slim

WORKDIR /app

# Instalar dependencias básicas
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Configurar NODE_OPTIONS para crypto
ENV NODE_OPTIONS="--crypto-global"

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar código fuente
COPY src ./src

# Generar Prisma client y construir
RUN npm run build

# Crear directorios necesarios
RUN mkdir -p logs uploads

EXPOSE 3080

CMD ["npm", "run", "start:prod"]