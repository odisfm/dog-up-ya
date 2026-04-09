#!/bin/bash

yum update -y
yum install -y git jq

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22

git clone https://github.com/odisfm/dog-up-ya.git
cd dog-up-ya
npm install

SECRET=$(aws secretsmanager get-secret-value \
  --region "ap-southeast-4" \
  --secret-id "dog-up-ya-app-server-env" \
  --query 'SecretString' \
  --output text)

echo "$SECRET" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env
echo "DATABASE_URL=$(echo "$SECRET" | jq -r '.DATABASE_URL')" >> shared/.env

cd client
npx vite build
cd ..

cd shared
npx prisma generate
cd ..

./node_modules/.bin/tsx api/src/index.ts
wait
