FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY server/ ./server/
COPY public/ ./public/

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]
