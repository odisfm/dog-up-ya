#!/bin/bash
set -e
sudo timedatectl set-timezone Australia/Melbourne
export PATH=$PATH:/usr/bin:/usr/sbin:/usr/local/bin

sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

cd /home/ec2-user

yum update -y
yum install -y git jq cronie

systemctl enable crond
systemctl start crond

touch /var/log/cron-pull.log
chown ec2-user:ec2-user /var/log/cron-pull.log

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
echo "DATABASE_URL=$(echo "$SECRET" | jq -r '.DATABASE_URL')" >> shared/.env

cd shared
npx prisma generate
cd ..

chown -R ec2-user:ec2-user /home/ec2-user/.nvm
chown -R ec2-user:ec2-user /home/ec2-user/dog-up-ya

sudo -u ec2-user -i bash << 'EOSU'
  export NVM_DIR="/home/ec2-user/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

  if ! grep -q 'NVM_DIR' /home/ec2-user/.bashrc; then
    echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ec2-user/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"' >> /home/ec2-user/.bashrc
  fi

  NODE_VERSION=$(nvm current)
  NVM_BIN="$NVM_DIR/versions/node/$NODE_VERSION/bin"
  TSX_BIN="$NVM_BIN/tsx"

  cd /home/ec2-user/dog-up-ya

  pm2 start $TSX_BIN --name "watch-server" --interpreter node -- consumers/watchSquiggleEvents.ts
  pm2 list
  pm2 save --force

  $TSX_BIN consumers/pullSquiggleData.ts games "year=$(date +%Y)"
  $TSX_BIN consumers/pullSquiggleData.ts standings "year=$(date +%Y)"
  $TSX_BIN consumers/pullSquiggleData.ts tips "year=$(date +%Y)"

  crontab -l 2>/dev/null > /tmp/ec2cron; true

  printf "SHELL=/bin/bash\n" >> /tmp/ec2cron
  printf "PATH=%s:/usr/local/bin:/usr/bin:/bin\n\n" "$NVM_BIN" >> /tmp/ec2cron
  printf "0 5 * * 1,4 (cd /home/ec2-user/dog-up-ya && %s consumers/pullSquiggleData.ts games year=\$(date +\\%%Y)) >> /var/log/cron-pull.log 2>&1\n" "$TSX_BIN" >> /tmp/ec2cron
  printf "0 16 * * 3,4,5 (cd /home/ec2-user/dog-up-ya && %s consumers/pullSquiggleData.ts tips year=\$(date +\\%%Y)) >> /var/log/cron-pull.log 2>&1\n" "$TSX_BIN" >> /tmp/ec2cron
  printf "30 19-23 * * 4,5 (cd /home/ec2-user/dog-up-ya && %s consumers/pullSquiggleData.ts standings year=\$(date +\\%%Y)) >> /var/log/cron-pull.log 2>&1\n" "$TSX_BIN" >> /tmp/ec2cron
  printf "30 12-23 * * 6,0 (cd /home/ec2-user/dog-up-ya && %s consumers/pullSquiggleData.ts standings year=\$(date +\\%%Y)) >> /var/log/cron-pull.log 2>&1\n" "$TSX_BIN" >> /tmp/ec2cron
  printf "0 */6 * * 1,2,3 (cd /home/ec2-user/dog-up-ya && %s consumers/pullSquiggleData.ts standings year=\$(date +\\%%Y)) >> /var/log/cron-pull.log 2>&1\n" "$TSX_BIN" >> /tmp/ec2cron
  printf "0 12 * * * (cd /home/ec2-user/dog-up-ya && %s consumers/aflTables/pullMatchLinks.ts --year \$(date +\\%%Y)) >> /var/log/cron-pull.log 2>&1\n" "$TSX_BIN" >> /tmp/ec2cron

  crontab /tmp/ec2cron
  rm /tmp/ec2cron

  echo "Crontab installed:"
  crontab -l
EOSU

env HOME=/home/ec2-user pm2 startup systemd -u ec2-user --hp /home/ec2-user | grep "sudo" | bash

dnf install -y https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm

sudo -u ec2-user bash << 'EOSU'
  export NVM_DIR="/home/ec2-user/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

  npx puppeteer browsers install chrome

  TSX_BIN="$NVM_DIR/versions/node/$(nvm current)/bin/tsx"
  $TSX_BIN consumers/aflTables/pullMatchLinks.ts --year $(date +%Y)
EOSU
