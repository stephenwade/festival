FROM ubuntu:jammy as base

WORKDIR /node

RUN apt-get update && apt-get install -y curl && curl -fsSL https://deb.nodesource.com/setup_20.x > setup.sh
RUN bash setup.sh && apt-get install -y nodejs

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

FROM lscr.io/linuxserver/ffmpeg:version-5.1.2-cli

WORKDIR /node

COPY --from=base /node/setup.sh /node/setup.sh
RUN bash setup.sh && apt-get install -y nodejs

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/start.sh /app/start.sh
COPY --from=build /app/prisma /app/prisma

ENTRYPOINT [ "./start.sh" ]
