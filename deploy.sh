#!/bin/bash

# 机票监控系统 - Nginx 部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署机票监控系统..."

# 配置变量
FRONTEND_BUILD_DIR="/var/www/html/flight-frontend"
BACKEND_SERVICE_NAME="flight-backend"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/flight-monitor"
NGINX_ENABLED_PATH="/etc/nginx/sites-enabled/flight-monitor"

# 1. 构建前端
echo "📦 构建前端应用..."
cd Front_end
npm install
npm run build

# 2. 部署前端静态文件
echo "📂 部署前端静态文件..."
sudo mkdir -p $FRONTEND_BUILD_DIR
sudo cp -r build/* $FRONTEND_BUILD_DIR/
sudo chown -R www-data:www-data $FRONTEND_BUILD_DIR
sudo chmod -R 755 $FRONTEND_BUILD_DIR

# 3. 配置 Nginx
echo "⚙️ 配置 Nginx..."
sudo cp ../nginx.conf $NGINX_CONFIG_PATH

# 启用站点
sudo ln -sf $NGINX_CONFIG_PATH $NGINX_ENABLED_PATH

# 测试 Nginx 配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx

# 4. 配置后端服务 (systemd)
echo "🔧 配置后端服务..."
sudo tee /etc/systemd/system/$BACKEND_SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Flight Monitor Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)/../Backend
Environment=PATH=$(pwd)/../venv/bin
ExecStart=$(pwd)/../venv/bin/python run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd 并启动服务
sudo systemctl daemon-reload
sudo systemctl enable $BACKEND_SERVICE_NAME
sudo systemctl restart $BACKEND_SERVICE_NAME

# 5. 检查服务状态
echo "✅ 检查服务状态..."
sudo systemctl status nginx --no-pager
sudo systemctl status $BACKEND_SERVICE_NAME --no-pager

echo "🎉 部署完成！"
echo "📍 访问地址: http://your-domain.com"
echo "🔍 查看日志: sudo journalctl -u $BACKEND_SERVICE_NAME -f"
