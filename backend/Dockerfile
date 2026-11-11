FROM node:24.14.0-bookworm-slim@sha256:d8e448a56fc63242f70026718378bd4b00f8c82e78d20eefb199224a4d8e33d8 AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

FROM base AS build
ENV HUSKY=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS production-dependencies
ENV HUSKY=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

FROM node:24.14.0-bookworm-slim@sha256:d8e448a56fc63242f70026718378bd4b00f8c82e78d20eefb199224a4d8e33d8 AS runtime
ARG VCS_REF=local
LABEL org.opencontainers.image.source="https://github.com/AriiH08/ssdlc-seguridad-informatica" \
      org.opencontainers.image.revision=$VCS_REF
ENV NODE_ENV=production PORT=3001
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
