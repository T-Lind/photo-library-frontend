# Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Run the Next.js app in production mode
FROM node:18-alpine AS runner

WORKDIR /app

# Set NODE_ENV to production for optimizations
ENV NODE_ENV production

# Copy all files
COPY --from=builder /app .

# Expose the port Next.js uses (default is 3000)
EXPOSE 3000

# Start the Next.js server using npx so it runs from the local installation
CMD ["npx", "next", "start", "-p", "3000"]
