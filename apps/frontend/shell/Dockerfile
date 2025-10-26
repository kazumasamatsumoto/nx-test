# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/frontend/shell ./apps/frontend/shell
COPY apps/frontend/feature-users ./apps/frontend/feature-users
COPY libs ./libs

# Build the application
RUN npx nx build shell --configuration=production

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY apps/frontend/shell/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist/apps/frontend/shell /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
