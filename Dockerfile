FROM oven/bun AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy only files needed for installation
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy package.json first (needed for build script)
COPY package.json ./

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy configuration files
COPY next.config.js tsconfig.json postcss.config.mjs tailwind.config.js components.json ./

# Copy application code
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY docker/scripts ./docker/scripts

# currently not used
# COPY public ./public

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=NEXT_PUBLIC_API_URL_PLACEHOLDER

RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=NEXT_PUBLIC_API_URL_PLACEHOLDER

# Create non-root user and set up directories
RUN adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:bun .next

# Copy only the necessary files from builder

# currently not used
# COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:bun /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/.next/static ./.next/static
COPY --from=builder /app/docker/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["bun", "server.js"]
