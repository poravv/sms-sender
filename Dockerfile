# Usar Node.js oficial como base
FROM node:18-bullseye

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código de la aplicación
COPY . .

# Definir variables de entorno (si deben estar disponibles en tiempo de ejecución)
ENV RAILWAY_STATIC_URL=$RAILWAY_STATIC_URL
ENV PUBLIC_URL=$PUBLIC_URL
ENV PORT=${PORT:-3000}

# Exponer el puerto en el que la aplicación escuchará
EXPOSE $PORT

# Comando para ejecutar la aplicación
CMD ["npm", "start"]