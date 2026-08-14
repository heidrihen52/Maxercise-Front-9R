# Dockerfile para Backend
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copiar el esquema de Prisma y generar el cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

EXPOSE 3000

# Iniciar el servidor
CMD ["npm", "start"]
