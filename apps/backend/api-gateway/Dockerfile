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
COPY apps/backend/api-gateway ./apps/backend/api-gateway
COPY libs ./libs

# Build the application
RUN npx nx build api-gateway --configuration=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/apps/backend/api-gateway ./

# Install production dependencies
RUN if [ -f package.json ]; then npm ci --production; fi

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "main.js"]
