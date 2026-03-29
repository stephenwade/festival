#!/bin/sh

set -ex

npx prisma migrate deploy
NPM_CONFIG_UPDATE_NOTIFIER=false NODE_ENV=production node --expose-gc server/index.ts
