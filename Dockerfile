FROM ubuntu:jammy@sha256:8eab65df33a6de2844c9aefd19efe8ddb87b7df5e9185a4ab73af936225685bb as base

WORKDIR /node

# Install Node.js
# Keep in sync with final image
RUN apt-get update && \
  apt-get install -y ca-certificates curl gnupg && \
  mkdir -p /etc/apt/keyrings && \
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN apt-get update && apt-get install -y nodejs

FROM base as deps

WORKDIR /app

ADD package.json .npmrc ./
RUN npm install --include=dev

FROM base as production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json .npmrc ./
RUN npm prune --omit=dev

FROM base as build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

FROM lscr.io/linuxserver/ffmpeg:version-5.1.2-cli@sha256:e691582facf5ec1b4f59ad7872e0c763a96875128c38e0fe703dca06a8ed1212 as final

WORKDIR /node

# Install Node.js
# Keep in sync with base image
RUN apt-get update && \
  apt-get install -y ca-certificates curl gnupg && \
  mkdir -p /etc/apt/keyrings && \
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN apt-get update && apt-get install -y nodejs

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/start.sh /app/start.sh
COPY --from=build /app/prisma /app/prisma

ENTRYPOINT [ "./start.sh" ]
