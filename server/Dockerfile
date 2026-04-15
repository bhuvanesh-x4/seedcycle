FROM node:20-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy source code
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
