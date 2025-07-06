# 🚀 机票监控系统 - Nginx 部署指南

## 📋 部署架构

```
用户请求 → Nginx (80/443) → 前端静态文件 (React Build)
                          → 后端API (FastAPI:38181)
```

## 🛠️ 部署方式

### 方式一：传统部署 (推荐)

#### 1. 准备环境
```bash
# 安装 Nginx
sudo apt update
sudo apt install nginx

# 安装 Node.js (用于构建前端)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Python 3.9+
sudo apt install python3 python3-pip python3-venv
```

#### 2. 构建前端
```bash
cd Front_end
npm install
npm run build
```

#### 3. 部署前端静态文件
```bash
sudo mkdir -p /var/www/html/flight-frontend
sudo cp -r Front_end/build/* /var/www/html/flight-frontend/
sudo chown -R www-data:www-data /var/www/html/flight-frontend
sudo chmod -R 755 /var/www/html/flight-frontend
```

#### 4. 配置 Nginx
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/flight-monitor

# 启用站点
sudo ln -s /etc/nginx/sites-available/flight-monitor /etc/nginx/sites-enabled/

# 删除默认站点 (可选)
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 5. 配置后端服务
```bash
# 创建 systemd 服务文件
sudo nano /etc/systemd/system/flight-backend.service
```

服务文件内容：
```ini
[Unit]
Description=Flight Monitor Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project/Backend
Environment=PATH=/path/to/your/project/venv/bin
ExecStart=/path/to/your/project/venv/bin/python run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable flight-backend
sudo systemctl start flight-backend
```

### 方式二：Docker 部署

#### 1. 构建前端
```bash
cd Front_end
npm install
npm run build
cd ..
```

#### 2. 启动服务
```bash
docker-compose up -d
```

#### 3. 查看状态
```bash
docker-compose ps
docker-compose logs -f
```

## 🔧 配置说明

### Nginx 配置要点

1. **静态文件服务**: 直接服务 React 构建文件
2. **API 代理**: 将 `/api/`, `/travel/`, `/auth/` 请求代理到后端
3. **SPA 路由**: 使用 `try_files` 支持前端路由
4. **缓存策略**: 静态资源长期缓存
5. **安全头**: 添加必要的安全响应头

### 环境变量配置

开发环境和生产环境的 API 请求会自动切换：
- **开发环境**: 直接请求 `http://localhost:38181`
- **生产环境**: 使用相对路径，由 Nginx 代理

## 🔍 监控和维护

### 查看服务状态
```bash
# Nginx 状态
sudo systemctl status nginx

# 后端服务状态
sudo systemctl status flight-backend

# 查看日志
sudo journalctl -u flight-backend -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 更新部署
```bash
# 更新前端
cd Front_end
npm run build
sudo cp -r build/* /var/www/html/flight-frontend/

# 更新后端
sudo systemctl restart flight-backend
```

## 🔒 SSL/HTTPS 配置

### 使用 Let's Encrypt
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 手动 SSL 证书
修改 `nginx.conf` 中的 SSL 配置部分，指定证书路径。

## 🚨 故障排除

### 常见问题

1. **404 错误**: 检查 Nginx 配置和文件路径
2. **502 错误**: 检查后端服务是否运行
3. **CORS 错误**: 检查 API 代理配置
4. **静态文件不更新**: 清除浏览器缓存或修改缓存策略

### 调试命令
```bash
# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :38181

# 检查 Nginx 配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx
```

## 📊 性能优化

1. **启用 Gzip 压缩**: 已在配置中启用
2. **静态资源缓存**: 设置长期缓存
3. **CDN**: 可考虑使用 CDN 加速静态资源
4. **数据库优化**: 根据需要优化数据库查询
5. **负载均衡**: 高并发时可配置多个后端实例

## 🔄 备份策略

1. **数据库备份**: 定期备份 SQLite 文件
2. **配置备份**: 备份 Nginx 配置和服务配置
3. **代码备份**: 使用 Git 管理代码版本
