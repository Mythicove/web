# ---- deps ----
FROM node:24-alpine AS deps
WORKDIR /app
# Node 24：让 fetch/corepack 遵循 HTTP(S)_PROXY 构建参数（受限网络下构建必需；无代理时为 no-op）
ENV NODE_USE_ENV_PROXY=1
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
ENV NODE_USE_ENV_PROXY=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable
  ARG NEXT_PUBLIC_API_URL=http://localhost:8080
  ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
  # 路由/索引策略为构建期开关：always=每语言独立 URL；never=同路径（默认）
  ARG NEXT_PUBLIC_LOCALE_PREFIX=never
  ENV NEXT_PUBLIC_LOCALE_PREFIX=$NEXT_PUBLIC_LOCALE_PREFIX
  ARG NEXT_PUBLIC_INDEXABLE=false
  ENV NEXT_PUBLIC_INDEXABLE=$NEXT_PUBLIC_INDEXABLE
  # CSP 在构建期烘焙：cap 验证码实例地址（driver=cap 部署必填，与 mirror MIRROR_CAPTCHA_CAP_URL 一致）
  ARG CAPTCHA_CAP_URL=
  ENV CAPTCHA_CAP_URL=$CAPTCHA_CAP_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- run ----
# 不用 node:24-alpine 整包（含 npm/corepack 等运行时用不到的 ~40MB）：
# alpine + 仅拷 node 二进制（musl 需 libstdc++/libgcc），保留 busybox wget 供 compose healthcheck。
FROM alpine:3.20 AS runner
WORKDIR /app
RUN apk add --no-cache libstdc++ libgcc
COPY --from=build /usr/local/bin/node /usr/local/bin/node
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
