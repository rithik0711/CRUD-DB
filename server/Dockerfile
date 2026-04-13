FROM node:18-alpine

WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy rest of the code
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5050

# Start app
CMD ["npm", "start"]