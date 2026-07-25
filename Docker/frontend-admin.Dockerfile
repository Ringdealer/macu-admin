# ==========================
# Stage 1: Build React/Vite Admin App
# ==========================
FROM node:24-slim AS build

WORKDIR /app/admin

# Copy package files first for caching
COPY frontend-admin/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend-admin/ .

# API URL (same pattern as frontend)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build production admin app
RUN npm run build

# Debug (optional but useful)
RUN ls -l /app/admin/dist


# ==========================
# Stage 2: Serve with Nginx
# ==========================
FROM nginx:latest

RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=build /app/admin/dist /usr/share/nginx/html/

# Optional nginx config reuse (recommended)
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Permissions
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]