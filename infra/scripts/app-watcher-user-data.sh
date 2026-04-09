#!/bin/bash
set -e

export PATH=$PATH:/usr/bin:/usr/sbin:/usr/local/bin

cd /home/ec2-user

yum update -y
yum install -y git jq cronie

systemctl enable crond
systemctl start crond

mkdir -p /home/ec2-user/.nvm

export NVM_DIR="/home/ec2-user/.nvm"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | NVM_DIR="$NVM_DIR" bash

[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

nvm install 22
nvm use 22

npm install -g pm2
npm install -g tsx

git clone https://github.com/odisfm/dog-up-ya.git
cd dog-up-ya
npm install

SECRET=$(aws secretsmanager get-secret-value \
  --region "ap-southeast-4" \
  --secret-id "dog-up-ya-app-server-env" \
  --query 'SecretString' \
  --output text)

echo "$SECRET" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env

cd shared
npx prisma generate
cd ..

chown -R ec2-user:ec2-user /home/ec2-user/.nvm
chown -R ec2-user:ec2-user /home/ec2-user/dog-up-ya

sudo -u ec2-user -i bash << 'EOSU'
  export NVM_DIR="/home/ec2-user/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

  NODE_BIN=$(which node)
  TSX_BIN=$(which tsx)
  CURRENT_YEAR=$(date +%Y)

  cd /home/ec2-user/dog-up-ya

  pm2 start --name "watch-server" -- tsx consumers/watchSquiggleEvents.ts
  pm2 save

  # Write all cron jobs at once (avoids repeated crontab reads)
  crontab -l 2>/dev/null > /tmp/ec2cron || true
  cat >> /tmp/ec2cron << EOF
0 5 * * 1,4 cd /home/ec2-user/dog-up-ya && $NODE_BIN $TSX_BIN consumers/pullSquiggleData.ts games year=$CURRENT_YEAR >> /var/log/cron-pull.log 2>&1
0 16 * * 3,4,5 cd /home/ec2-user/dog-up-ya && $NODE_BIN $TSX_BIN consumers/pullSquiggleData.ts tips year=$CURRENT_YEAR >> /var/log/cron-pull.log 2>&1
30 19-23 * * 4,5 cd /home/ec2-user/dog-up-ya && $NODE_BIN $TSX_BIN consumers/pullSquiggleData.ts standings year=$CURRENT_YEAR >> /var/log/cron-pull.log 2>&1
30 12-23 * * 6,0 cd /home/ec2-user/dog-up-ya && $NODE_BIN $TSX_BIN consumers/pullSquiggleData.ts standings year=$CURRENT_YEAR >> /var/log/cron-pull.log 2>&1
0 */6 * * 1,2,3 cd /home/ec2-user/dog-up-ya && $NODE_BIN $TSX_BIN consumers/pullSquiggleData.ts standings year=$CURRENT_YEAR >> /var/log/cron-pull.log 2>&1
0 5 * * 1 cd /home/ec2-user/dog-up-ya && $NODE_BIN $TSX_BIN consumers/reddit/matchThreads.ts >> /var/log/weekly.log 2>&1
EOF
  crontab /tmp/ec2cron
  rm /tmp/ec2cron
EOSU

env HOME=/home/ec2-user pm2 startup systemd -u ec2-user --hp /home/ec2-user
