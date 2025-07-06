# 🚀 机票监控系统 - Ubuntu服务器部署指南

## 📋 部署架构

```
Internet → Ubuntu Server → Docker Compose
                        ├── Nginx (80/443) → 前端静态文件
                        └── FastAPI Backend (38181) → 后端服务
```

## 🛠️ 部署前准备

### 1. 服务器要求
- **操作系统**: Ubuntu 18.04+ 
- **内存**: 最少2GB，推荐4GB+
- **存储**: 最少10GB可用空间
- **网络**: 公网IP或域名

### 2. 必要软件安装

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装Node.js (用于构建前端)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 重新登录以应用Docker组权限
exit
# 重新SSH登录
```

### 3. 防火墙配置

```bash
# 开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (可选)
sudo ufw allow 38181 # 后端API (可选，用于直接访问)
sudo ufw enable
```

## 🚀 快速部署

### 方法一：使用自动部署脚本（推荐）

```bash
# 1. 上传项目文件到服务器
# 可以使用 scp, rsync, git clone 等方式

# 2. 进入项目目录
cd /path/to/机票监控

# 3. 给部署脚本执行权限
chmod +x deploy-ubuntu.sh

# 4. 运行部署脚本
./deploy-ubuntu.sh
```

### 方法二：手动部署步骤

```bash
# 1. 检查环境
docker --version
docker-compose --version
node --version

# 2. 构建前端
cd Front_end
npm install
npm run build
cd ..

# 3. 检查配置文件
ls -la Backend/.env  # 确保环境文件存在

# 4. 启动服务
docker-compose build --no-cache
docker-compose up -d

# 5. 检查服务状态
docker-compose ps
docker-compose logs -f
```

## 🔧 配置说明

### 环境变量配置

项目使用双配置文件策略，需要配置两个.env文件：

#### 1. 根目录 `.env` 文件（通用配置）
```env
# AI服务配置
AI_BASE_URL=http://154.19.184.12:3000/v1
AI_MODEL=gemini-2.5-flash
AI_API_KEY=your_ai_api_key

# 小红书配置
XHS_COOKIES=your_xhs_cookies

# 高德地图配置
AMAP_API_KEY=your_amap_key

# 其他通用配置
SECRET_KEY=your-secret-key-change-this
```

#### 2. Backend/.env 文件（FastAPI专用配置）
```env
# Gemini AI服务配置
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro

# Supabase配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
SUPABASE_DATABASE_URL=your_supabase_db_url

# JWT配置
JWT_SECRET_KEY=your-jwt-secret-key
```

### 域名配置（可选）

如果您有域名，请修改 `nginx-ubuntu.conf`：

```nginx
server_name your-domain.com;  # 替换 _ 为您的域名
```

### SSL证书配置（推荐）

使用Let's Encrypt免费SSL证书：

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（需要先配置域名）
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔍 验证部署

### 检查服务状态

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs nginx
docker-compose logs backend

# 检查端口监听
sudo netstat -tlnp | grep -E ":(80|443|38181)"
```

### 功能测试

```bash
# 测试前端访问
curl -I http://your-server-ip/

# 测试后端API
curl http://your-server-ip:38181/health

# 测试API代理
curl http://your-server-ip/api/health
```

## 🔄 日常维护

### 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新部署
git pull  # 如果使用git
./deploy-ubuntu.sh

# 清理未使用的镜像
docker system prune -f
```

### 备份策略

```bash
# 备份数据库（如果使用本地数据库）
docker-compose exec backend python -c "
import shutil
shutil.copy('/app/instance/ticketradar.db', '/app/instance/backup_$(date +%Y%m%d).db')
"

# 备份配置文件
tar -czf config_backup_$(date +%Y%m%d).tar.gz Backend/.env nginx-ubuntu.conf docker-compose.yml
```

## 🚨 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   docker-compose logs backend
   # 检查环境变量和依赖
   ```

2. **前端无法访问**
   ```bash
   docker-compose logs nginx
   # 检查nginx配置和前端构建
   ```

3. **API请求失败**
   ```bash
   # 检查后端服务和代理配置
   curl -v http://localhost:38181/health
   ```

4. **端口冲突**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :80
   # 修改docker-compose.yml中的端口映射
   ```

### 性能优化

1. **启用HTTP/2**（需要SSL）
2. **配置CDN**加速静态资源
3. **数据库优化**（如果使用本地数据库）
4. **监控资源使用**

```bash
# 监控容器资源使用
docker stats
```

## 📊 监控和日志

### 日志位置

- **Nginx日志**: Docker卷 `nginx_logs`
- **后端日志**: `Backend/logs/`
- **容器日志**: `docker-compose logs`

### 监控建议

1. 设置日志轮转
2. 监控磁盘空间
3. 设置服务健康检查
4. 配置告警通知

## 🔒 安全建议

1. **定期更新**系统和Docker镜像
2. **使用SSL证书**
3. **配置防火墙**
4. **定期备份**数据
5. **监控访问日志**
6. **使用非root用户**运行服务

---

## 📞 技术支持

如果遇到问题，请检查：
1. 服务器日志
2. Docker容器状态
3. 网络连接
4. 配置文件语法

部署成功后，您可以通过 `http://your-server-ip` 访问应用！
