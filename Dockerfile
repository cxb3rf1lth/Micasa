# Multi-stage build for optimized production image
# Optimized for AWS ECS/Fargate deployment

# Stage 1: Build client
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./
RUN npm ci --production=false

# Copy client source
COPY client/ ./

# Build client for production
RUN npm run build

# Stage 2: Build server dependencies
FROM node:18-alpine AS server-deps

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
RUN npm ci --production

# Stage 3: Production image
FROM node:18-alpine

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy server dependencies
COPY --from=server-deps --chown=nodejs:nodejs /app/server/node_modules ./server/node_modules

# Copy server source
COPY --chown=nodejs:nodejs server/ ./server/

# Copy built client
COPY --from=client-build --chown=nodejs:nodejs /app/client/dist ./client/dist

# Copy root package.json for npm scripts
COPY --chown=nodejs:nodejs package*.json ./

# Create directory for SQLite database (if using SQLite)
# In production with AWS, you should use RDS PostgreSQL instead
RUN mkdir -p server/data && chown -R nodejs:nodejs server/data

# Create logs directory
RUN mkdir -p server/logs && chown -R nodejs:nodejs server/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server/src/index.js"]
