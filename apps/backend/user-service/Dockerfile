# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY apps/backend/user-service ./apps/backend/user-service
COPY libs ./libs

# Build the application
RUN npx nx build user-service --configuration=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/apps/backend/user-service ./

# Install production dependencies
RUN if [ -f package.json ]; then npm ci --production; fi

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "main.js"]
