# Multi-stage Dockerfile for CRUD app

# Stage 1: Build the React client
FROM node:20-alpine AS client-build

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm install

# Copy client source
COPY client/ ./

# Build the client
RUN npm run build

# Stage 2: Setup the Node.js server
FROM node:20-alpine AS server

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
RUN cd server && npm install --production

# Copy server source
COPY server/ ./server/

# Copy built client to server public directory
RUN mkdir -p server/public
COPY --from=client-build /app/client/dist ./server/public

# Expose port
EXPOSE 5050

# Set working directory to server
WORKDIR /app/server

# Start the server
CMD ["npm", "start"]