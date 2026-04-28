# Cashier panel once build edilir, sonra Nginx ile statik olarak servis edilir.
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ARG VITE_APP_BASE_PATH=/cashier/
ENV VITE_APP_BASE_PATH=${VITE_APP_BASE_PATH}

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM nginx:1.27-alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
