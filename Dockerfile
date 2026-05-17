# Use official Node.js runtime as parent image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy all application files
COPY . .

# Expose port 5000 (standard unified server port)
EXPOSE 5000

# Start the unified server
CMD ["node", "unified-server.js"]
