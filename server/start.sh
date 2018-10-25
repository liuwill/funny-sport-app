#!/bin/sh

cd /usr/src/app/server

if [ ! -f "/etc/apk/repositories.bak" ]; then
    cp /etc/apk/repositories /etc/apk/repositories.bak
fi

check_result=`which yarn`
if [ ! "$check_result" ]; then
    echo "http://mirrors.aliyun.com/alpine/v3.8/main/" > /etc/apk/repositories

    apk add --no-cache git make
    npm install --registry=https://registry.npm.taobao.org --global yarn
    yarn config set registry 'https://registry.npm.taobao.org'
fi

check_pm2=`which pm2`
if [ ! "$check_pm2" ]; then
    yarn global add pm2
fi

if [ ! -d "./node_modules" ]; then
    yarn install
fi

yarn init
yarn start
