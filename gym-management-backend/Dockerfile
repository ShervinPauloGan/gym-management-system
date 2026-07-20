FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN pnpm db:generate

COPY . .
ENV CI=true
RUN pnpm build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
