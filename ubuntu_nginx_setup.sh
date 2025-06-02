#!/bin/bash
# Ubuntu Nginx反向代理配置脚本

echo "🌐 配置Nginx反向代理..."

# 安装Nginx
sudo apt update
sudo apt install nginx -y

# 启动并启用Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 获取域名（用户输入）
read -p "请输入您的域名（如：ticketradar.example.com）: " DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
    echo "⚠️ 未输入域名，使用localhost"
fi

# 创建Nginx配置文件
sudo tee /etc/nginx/sites-available/ticketradar << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:38181;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /static/ {
        proxy_pass http://127.0.0.1:38181;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API接口
    location /api/ {
        proxy_pass http://127.0.0.1:38181;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS头部
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # 处理OPTIONS请求
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/ticketradar /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
sudo nginx -t

if [ $? -eq 0 ]; then
    # 重载Nginx配置
    sudo systemctl reload nginx
    echo "✅ Nginx配置成功"
    echo "🌐 访问地址: http://$DOMAIN"
    
    # 提示SSL配置
    echo ""
    echo "🔒 SSL配置（可选）："
    echo "   sudo apt install certbot python3-certbot-nginx -y"
    echo "   sudo certbot --nginx -d $DOMAIN"
else
    echo "❌ Nginx配置测试失败"
    exit 1
fi
