# ==========================
# Stage 1: Build React/Vite App
# ==========================
FROM node:24-slim AS build 

# Set working directory
WORKDIR /app/frontend 

# Copy package files first for caching
COPY frontend/package*.json ./ 

# Install dependencies
RUN npm install 

# Copy the rest of the frontend source code
COPY frontend/ . 

# build argument to pass API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the production React/Vite app
RUN npm run build 

# After RUN npm run build
RUN ls -l /app/frontend/dist

# ==========================
# Stage 2: Serve with Nginx
# ==========================
FROM nginx:latest 

# Remove default nginx html content to avoid Welcome page
RUN rm -rf /usr/share/nginx/html/* 

# Copy built React files to Nginx
COPY --from=build /app/frontend/dist /usr/share/nginx/html/ 

# Copy custom nginx config # new
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf



# Ensure correct permissions for nginx to read files # new
RUN chmod -R 755 /usr/share/nginx/html # new

# Expose port
EXPOSE 80 

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]