# 🐳 Ticketradar Docker Compose 部署指南

## 🚀 快速开始（3步部署）

### 前提条件
- Ubuntu 18.04+ 或其他Linux发行版
- Docker 和 Docker Compose 已安装

### 一键部署
```bash
# 1. 克隆项目
git clone https://github.com/EBOLABOY/Ticketradar.git
cd Ticketradar

# 2. 运行部署脚本
chmod +x docker-deploy.sh
./docker-deploy.sh

# 3. 访问系统
# http://your-server-ip:38181
```

## 📋 详细部署步骤

### 步骤1：安装Docker环境

#### Ubuntu/Debian系统
```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加当前用户到docker组（可选）
sudo usermod -aG docker $USER
newgrp docker

# 安装Docker Compose
sudo apt update
sudo apt install docker-compose-plugin -y
```

#### CentOS/RHEL系统
```bash
# 安装Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 步骤2：下载项目文件

```bash
# 方法A：Git克隆
git clone https://github.com/EBOLABOY/Ticketradar.git
cd Ticketradar

# 方法B：直接下载
wget https://github.com/EBOLABOY/Ticketradar/archive/main.zip
unzip main.zip
cd Ticketradar-main
```

### 步骤3：配置环境变量

```bash
# 复制环境变量模板
cp .env.docker .env.docker.local

# 编辑配置文件
nano .env.docker.local

# 主要配置项：
# EXTERNAL_DOMAIN=your-domain.com
# ENABLE_PUSHPLUS=true
# PUSHPLUS_TOKEN=your-pushplus-token
```

### 步骤4：选择部署模式

#### 模式1：开发模式（仅应用）
```bash
docker-compose up -d ticketradar
```

#### 模式2：生产模式（应用 + Nginx）
```bash
docker-compose --profile nginx up -d
```

#### 模式3：完整模式（应用 + Nginx + 备份）
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 步骤5：验证部署

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f ticketradar

# 测试访问
curl http://localhost:38181
```

## 🔧 配置说明

### 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SERVER_HOST` | 服务器监听地址 | `0.0.0.0` |
| `SERVER_PORT` | 服务器端口 | `38181` |
| `EXTERNAL_DOMAIN` | 外部访问域名 | `your-domain.com` |
| `SECRET_KEY` | Flask密钥 | 随机生成 |
| `ENABLE_PUSHPLUS` | 启用PushPlus推送 | `false` |
| `PUSHPLUS_TOKEN` | PushPlus令牌 | 空 |
| `PRICE_THRESHOLD` | 价格阈值 | `1000` |
| `CHECK_INTERVAL` | 检查间隔（分钟） | `5` |

### 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| Ticketradar | 38181 | 38181 | 主应用 |
| Nginx | 80 | 80 | HTTP代理 |
| Nginx | 443 | 443 | HTTPS代理 |

### 数据持久化

| 数据类型 | 存储位置 | 说明 |
|----------|----------|------|
| 数据库 | Docker Volume | `ticketradar_data` |
| 日志 | Docker Volume | `ticketradar_logs` |
| 备份 | 本地目录 | `./backups/` |

## 📊 管理命令

### 基本操作
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 进入容器
docker-compose exec ticketradar bash
```

### 高级操作
```bash
# 更新镜像
docker-compose pull
docker-compose up -d

# 重新构建
docker-compose build --no-cache
docker-compose up -d

# 清理数据
docker-compose down -v
docker system prune -f

# 备份数据
docker-compose exec ticketradar cp /app/data/ticketradar.db /app/backups/

# 恢复数据
docker-compose exec ticketradar cp /app/backups/ticketradar.db /app/data/
```

### 使用部署脚本
```bash
# 一键部署
./docker-deploy.sh

# 启动服务
./docker-deploy.sh start

# 停止服务
./docker-deploy.sh stop

# 重启服务
./docker-deploy.sh restart

# 查看日志
./docker-deploy.sh logs

# 查看状态
./docker-deploy.sh status

# 更新服务
./docker-deploy.sh update

# 清理系统
./docker-deploy.sh clean
```

## 🌐 访问系统

### 默认访问地址
- **应用直接访问**: http://your-server-ip:38181
- **Nginx代理访问**: http://your-server-ip (如果启用了Nginx)

### 默认管理员账户
- **用户名**: `1242772513@qq.com`
- **密码**: `1242772513`

## 🔒 SSL/HTTPS配置

### 使用Let's Encrypt
```bash
# 1. 安装Certbot
sudo apt install certbot

# 2. 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 3. 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem

# 4. 修改nginx.conf启用HTTPS配置

# 5. 重启服务
docker-compose restart nginx
```

### 自签名证书（测试用）
```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ./ssl/key.pem \
    -out ./ssl/cert.pem \
    -subj "/C=CN/ST=State/L=City/O=Organization/CN=your-domain.com"
```

## 🔍 故障排除

### 常见问题

1. **容器启动失败**
```bash
# 查看详细日志
docker-compose logs ticketradar

# 检查配置文件
docker-compose config
```

2. **端口被占用**
```bash
# 查看端口占用
sudo netstat -tlnp | grep :38181

# 修改端口映射
# 编辑docker-compose.yml中的ports配置
```

3. **权限问题**
```bash
# 修复文件权限
sudo chown -R $USER:$USER .
chmod +x docker-deploy.sh
```

4. **网络连接问题**
```bash
# 检查Docker网络
docker network ls
docker network inspect ticketradar_ticketradar-network
```

5. **数据丢失**
```bash
# 检查数据卷
docker volume ls
docker volume inspect ticketradar_ticketradar_data
```

### 日志查看
```bash
# 应用日志
docker-compose logs -f ticketradar

# Nginx日志
docker-compose logs -f nginx

# 系统日志
journalctl -u docker

# 容器内部日志
docker-compose exec ticketradar tail -f /app/logs/ticketradar.log
```

## 📈 性能优化

### 资源限制
```yaml
# 在docker-compose.yml中添加
services:
  ticketradar:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 监控配置
```bash
# 安装监控工具
docker run -d --name=cadvisor \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  gcr.io/cadvisor/cadvisor:latest
```

## 🎯 生产环境建议

1. **安全配置**
   - 修改默认密码
   - 配置防火墙
   - 使用HTTPS
   - 定期更新镜像

2. **备份策略**
   - 定期备份数据库
   - 备份配置文件
   - 监控磁盘空间

3. **监控告警**
   - 配置健康检查
   - 设置日志监控
   - 配置资源告警

4. **高可用性**
   - 使用Docker Swarm或Kubernetes
   - 配置负载均衡
   - 设置自动重启

---

**🎉 恭喜！您的Ticketradar系统已通过Docker Compose成功部署！**
