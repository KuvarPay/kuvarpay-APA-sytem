FROM node:20-slim

WORKDIR /app

# Copy the database submodule and backend
COPY database/ ./database/
COPY backend/package*.json ./backend/

# Install backend dependencies (which will link to the local database folder)
WORKDIR /app/backend
RUN npm install

# Copy the rest of the backend source
COPY backend/ .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
