#!/bin/sh

set -ex

npx prisma migrate deploy
NPM_CONFIG_UPDATE_NOTIFIER=false node --expose-gc node_modules/.bin/remix-serve build/server/index.js
