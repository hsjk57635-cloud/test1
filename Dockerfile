# ╔══════════════════════════════════════╗
# ║   🔥 JUNAID-MD↣³⁰² MINI — Dockerfile   ║
# ║   Owner: JUNAID-MD↣³⁰²      ║
# ╚══════════════════════════════════════╝

FROM node:20-slim

# Install git + ffmpeg + build tools (git is REQUIRED by npm/baileys)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ffmpeg \
    python3 \
    python3-pip \
    make \
    g++ \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files FIRST for layer caching
COPY package.json ./

# Install deps — use --omit=dev (--production is deprecated and broken in Docker)
RUN npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

# Copy all project files
COPY . .

# Create required runtime directories
RUN mkdir -p session temp data plugins public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD sh -c "curl -f http://localhost:${PORT:-3000}/health || exit 1"

CMD ["node", "index.js"]
