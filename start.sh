#!/bin/sh

npx prisma migrate deploy && NPM_CONFIG_UPDATE_NOTIFIER=false npm run start
