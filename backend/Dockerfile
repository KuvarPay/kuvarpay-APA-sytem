FROM node:20-slim

WORKDIR /app

# Copy the database submodule and backend
COPY database/ ./database/
# Build the database dependency
WORKDIR /app/database/rayswap-db
RUN npm install && npm run build

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the backend source
COPY backend/ .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
