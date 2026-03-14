# Stage 1: Install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client
RUN npx prisma generate
# Build Next.js
RUN npm run build

# Stage 3: Production server
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy prisma migrations and schema for potential runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy prisma.config.ts if used at runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./

# Create db directory with correct permissions
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]
