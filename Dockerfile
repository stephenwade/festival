# syntax=docker/dockerfile:1
# check=skip=SecretsUsedInArgOrEnv

FROM ubuntu:jammy@sha256:eb29ed27b0821dca09c2e28b39135e185fc1302036427d5f4d70a41ce8fd7659 AS base

WORKDIR /node

# Install Node.js
# Keep in sync with final image
RUN apt-get update && \
  apt-get install -y ca-certificates curl gnupg && \
  mkdir -p /etc/apt/keyrings && \
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN apt-get update && apt-get install -y nodejs

FROM base AS deps

WORKDIR /app

ADD package.json .npmrc prisma ./
RUN npm install --include=dev

FROM base AS production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json .npmrc prisma ./
RUN npm prune --omit=dev

FROM base AS build

WORKDIR /app

ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

FROM linuxserver/ffmpeg:version-5.1.2-cli@sha256:e691582facf5ec1b4f59ad7872e0c763a96875128c38e0fe703dca06a8ed1212 AS final

WORKDIR /node

# Install Node.js
# Keep in sync with base image
RUN apt-get update && \
  apt-get install -y ca-certificates curl gnupg && \
  mkdir -p /etc/apt/keyrings && \
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN apt-get update && apt-get install -y nodejs

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/server /app/server
COPY --from=build /app/shared /app/shared
COPY --from=build /app/start.sh /app/start.sh

ENTRYPOINT [ "./start.sh" ]
