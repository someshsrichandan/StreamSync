# Use Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Build project
RUN npm run build

# Install serve to serve the production build
RUN npm install -g serve

# Expose frontend port
EXPOSE 5173

# Run app in production mode
CMD ["serve", "-s", "dist", "-l", "5173"]
