FROM node:24.14-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:server && npm run assets && npm prune --omit=dev

FROM node:24.14-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV LOAD_DOTENV=false

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/server ./dist/server

CMD ["node", "--enable-source-maps", "dist/server/index.js"]
