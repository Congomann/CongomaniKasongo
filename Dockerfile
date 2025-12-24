# Multi-stage build for full-stack application
FROM node:20-alpine AS builder

# Build frontend
WORKDIR /app/client
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Build backend
WORKDIR /app/server
COPY server/package.json ./
RUN npm install
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies for backend
COPY server/package.json ./server/
WORKDIR /app/server
RUN npm install --only=production

# Copy backend build and prisma
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/node_modules/.prisma ./node_modules/.prisma

# Copy frontend build
COPY --from=builder /app/client/dist /app/client/dist

# Install nginx to serve frontend and proxy to backend
RUN apk add --no-cache nginx

# Create nginx config
RUN mkdir -p /run/nginx
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    \
    # Remove X-Frame-Options to allow preview mode \
    proxy_hide_header X-Frame-Options; \
    add_header X-Frame-Options ""; \
    \
    # Serve frontend \
    location / { \
        root /app/client/dist; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Proxy API requests to backend \
    location /api { \
        proxy_pass http://localhost:3001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
} \
' > /etc/nginx/http.d/default.conf

# Create startup script
RUN echo '#!/bin/sh\n\
cd /app/server\n\
npx prisma db push --skip-generate &\n\
node dist/server.js &\n\
nginx -g "daemon off;"\n\
' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]
