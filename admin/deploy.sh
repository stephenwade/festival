#!/bin/bash

rsync -rltv --delete --exclude node_modules ./ $FESTIVAL_ADMIN_DEPLOY_SERVER:$FESTIVAL_ADMIN_DEPLOY_LOCATION
ssh root@$FESTIVAL_ADMIN_DEPLOY_SERVER "sudo systemctl restart festival-admin"
