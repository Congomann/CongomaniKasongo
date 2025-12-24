# Multi-stage Dockerfile for Full Stack NHFG CRM

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY App.tsx ./
COPY index.tsx ./
COPY types.ts ./
COPY components/ ./components/
COPY context/ ./context/
COPY pages/ ./pages/
COPY services/ ./services/

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend

# Copy backend package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code
COPY server/src/ ./src/
COPY server/prisma/ ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Build backend
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Install production dependencies only
COPY server/package*.json ./
RUN npm install --production

# Copy Prisma schema and generate client
COPY server/prisma/ ./prisma/
RUN npx prisma generate

# Copy built backend
COPY --from=backend-build /app/backend/dist ./dist

# Copy built frontend to serve statically
COPY --from=frontend-build /app/frontend/dist ./dist/public

# Install serve to host frontend alongside backend
RUN npm install -g serve

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
