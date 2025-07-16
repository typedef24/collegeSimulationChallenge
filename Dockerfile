# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli@20

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose port 4200 (default Angular dev server port)
EXPOSE 4200

# Start the development server with hot reload
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]