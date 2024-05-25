#!/bin/sh

npx prisma migrate deploy && NO_UPDATE_NOTIFIER=1 npm run start
