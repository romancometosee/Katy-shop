#!/bin/bash
# Автоматическая установка магазина Katy на чистый сервер Ubuntu 22.04/24.04.
# Вставляется в поле «Cloud-init» при создании сервера или запускается от root: bash setup-server.sh
# Перед запуском впишите пароль админки в ADMIN_PASSWORD.
set -euxo pipefail
exec > >(tee -a /var/log/katy-setup.log) 2>&1

ADMIN_PASSWORD="ПОМЕНЯЙТЕ-ПАРОЛЬ"
REPO="https://github.com/romancometosee/Katy-shop.git"
BRANCH="claude/project-thread-0zzx0t"
APP=/opt/katy/app
DATA=/var/lib/katy

export DEBIAN_FRONTEND=noninteractive
export HOME=/root

# 1. Файл подкачки, чтобы сборка не упиралась в память на маленьком сервере
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 2. Программы: git, Node.js 22, Caddy (веб-сервер с автоматическим HTTPS)
apt-get update
apt-get install -y curl git ca-certificates gnupg openssl caddy
if ! command -v node >/dev/null || ! node -v | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# 3. Пользователь и папки
id katy >/dev/null 2>&1 || useradd -r -m -d /opt/katy -s /bin/bash katy
mkdir -p "$DATA"
chown -R katy:katy /opt/katy "$DATA"

# 4. Настройки магазина
if [ ! -f /opt/katy/env ]; then
  cat > /opt/katy/env <<ENV
NODE_ENV=production
PORT=3000
KATY_DATA_DIR=$DATA
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_SECRET=$(openssl rand -hex 32)
NEXT_TELEMETRY_DISABLED=1
ENV
  chmod 600 /opt/katy/env
  chown katy:katy /opt/katy/env
fi

# 5. Скрипт обновления: забирает новый код с GitHub и пересобирает сайт
cat > /opt/katy/update.sh <<UPD
#!/bin/bash
set -euo pipefail
cd /opt/katy
if [ ! -d $APP/.git ]; then
  git clone -b "$BRANCH" "$REPO" $APP
  FORCE=1
fi
cd $APP
git fetch -q origin "$BRANCH"
if [ "\${FORCE:-0}" = "1" ] || [ "\$(git rev-parse HEAD)" != "\$(git rev-parse FETCH_HEAD)" ] || [ ! -d .next ]; then
  git reset -q --hard FETCH_HEAD
  set -a; . /opt/katy/env; set +a
  npm ci --no-audit --no-fund --include=dev
  npm run build
  sudo /bin/systemctl restart katy || true
  echo "\$(date) обновлено до \$(git rev-parse --short HEAD)" >> /opt/katy/updates.log
fi
UPD
chmod +x /opt/katy/update.sh
chown katy:katy /opt/katy/update.sh
echo 'katy ALL=(root) NOPASSWD: /bin/systemctl restart katy' > /etc/sudoers.d/katy
chmod 440 /etc/sudoers.d/katy

# 6. Служба магазина
cat > /etc/systemd/system/katy.service <<SVC
[Unit]
Description=Katy shop
After=network.target

[Service]
User=katy
WorkingDirectory=$APP
EnvironmentFile=/opt/katy/env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVC

# 7. Автообновление каждые 5 минут
cat > /etc/systemd/system/katy-update.service <<SVC
[Unit]
Description=Katy shop update from GitHub

[Service]
Type=oneshot
User=katy
ExecStart=/opt/katy/update.sh
SVC
cat > /etc/systemd/system/katy-update.timer <<SVC
[Unit]
Description=Check GitHub for Katy shop updates

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
SVC

# 8. Первая сборка
sudo -u katy env FORCE=1 /opt/katy/update.sh
systemctl daemon-reload
systemctl enable --now katy katy-update.timer

# 9. Веб-сервер: пока сайт открывается по IP-адресу сервера.
#    Когда будет домен, в /etc/caddy/Caddyfile вместо ":80" пишется домен — HTTPS включится сам.
if [ ! -f /etc/caddy/.katy ]; then
  cat > /etc/caddy/Caddyfile <<CADDY
:80 {
  encode gzip
  reverse_proxy localhost:3000
}
CADDY
  touch /etc/caddy/.katy
fi
systemctl enable caddy
systemctl restart caddy

echo "KATY SETUP DONE"
