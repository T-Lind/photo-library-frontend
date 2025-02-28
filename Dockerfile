# Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Run the app
FROM node:18-alpine AS runner

WORKDIR /app

# Set NODE_ENV to production for optimizations
ENV NODE_ENV production

# Copy built assets from builder stage
COPY --from=builder /app ./

# Expose the port Next.js uses (default 3000)
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]
