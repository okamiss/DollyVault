FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --filter @dollyvault/api --frozen-lockfile=false
COPY apps/api apps/api
RUN pnpm --filter @dollyvault/api prisma:generate
RUN pnpm --filter @dollyvault/api build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
WORKDIR /app/apps/api
CMD ["sh", "-c", "./node_modules/.bin/prisma db push && node dist/src/main.js"]
