# Etapa 1: Construcción de Angular 18
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: Servidor web Nginx para Producción
FROM nginx:alpine
COPY --from=build /app/dist/frontend_residencia/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
