# ✅ Ubuntu服务器部署检查清单

## 📋 部署前检查

### 服务器环境
- [ ] Ubuntu 18.04+ 系统
- [ ] 至少2GB内存，推荐4GB+
- [ ] 至少10GB可用磁盘空间
- [ ] 公网IP或域名配置
- [ ] SSH访问权限

### 必要软件
- [ ] Docker 已安装并运行
- [ ] Docker Compose 已安装
- [ ] Node.js 18+ 已安装
- [ ] 防火墙已配置（端口80, 443, 38181）

### 项目文件
- [ ] 项目代码已上传到服务器
- [ ] `Backend/.env` 文件已配置
- [ ] 所有API密钥已正确设置
- [ ] 前端代码可以正常构建

## 🚀 部署执行清单

### 1. 环境准备
```bash
# 检查Docker
- [ ] docker --version
- [ ] docker-compose --version
- [ ] docker info

# 检查Node.js
- [ ] node --version
- [ ] npm --version
```

### 2. 项目构建
```bash
# 前端构建
- [ ] cd Front_end
- [ ] npm install
- [ ] npm run build
- [ ] ls -la build/  # 确认构建文件存在
```

### 3. 配置验证
```bash
# 环境文件检查 - 统一配置文件
- [ ] ls -la .env  # 检查根目录配置文件
- [ ] cat .env | grep AI_API_KEY  # 通用AI配置
- [ ] cat .env | grep GEMINI_API_KEY  # FastAPI专用AI配置
- [ ] cat .env | grep XHS_COOKIES  # 小红书配置
- [ ] cat .env | grep SUPABASE_URL  # 数据库配置
- [ ] cat .env | grep SUPABASE_ANON_KEY  # 数据库密钥
- [ ] cat .env | grep JWT_SECRET_KEY  # JWT配置

# Docker配置检查
- [ ] cat docker-compose.yml
- [ ] cat nginx-ubuntu.conf
```

### 4. 服务部署
```bash
# 使用自动脚本
- [ ] chmod +x deploy-ubuntu.sh
- [ ] ./deploy-ubuntu.sh

# 或手动部署
- [ ] docker-compose build --no-cache
- [ ] docker-compose up -d
```

## 🔍 部署后验证

### 容器状态检查
```bash
- [ ] docker-compose ps  # 所有服务都是Up状态
- [ ] docker-compose logs nginx  # 无错误日志
- [ ] docker-compose logs backend  # 无错误日志
```

### 网络连接测试
```bash
# 端口监听检查
- [ ] sudo netstat -tlnp | grep :80
- [ ] sudo netstat -tlnp | grep :38181

# 本地访问测试
- [ ] curl -I http://localhost/
- [ ] curl http://localhost:38181/health
- [ ] curl http://localhost/api/health
```

### 外部访问测试
```bash
# 替换 YOUR_SERVER_IP 为实际IP
- [ ] curl -I http://YOUR_SERVER_IP/
- [ ] curl http://YOUR_SERVER_IP:38181/health
- [ ] curl http://YOUR_SERVER_IP/api/health
```

### 功能测试
- [ ] 浏览器访问 http://YOUR_SERVER_IP
- [ ] 用户注册/登录功能正常
- [ ] 机票搜索功能正常
- [ ] AI分析功能正常
- [ ] 所有页面加载正常

## 🔧 配置优化（可选）

### 域名配置
- [ ] DNS记录指向服务器IP
- [ ] 修改nginx-ubuntu.conf中的server_name
- [ ] 重启nginx容器

### SSL证书配置
- [ ] 安装certbot
- [ ] 获取Let's Encrypt证书
- [ ] 配置自动续期
- [ ] 测试HTTPS访问

### 性能优化
- [ ] 启用Gzip压缩
- [ ] 配置静态资源缓存
- [ ] 设置适当的超时时间
- [ ] 监控资源使用情况

## 🔄 维护配置

### 日志管理
- [ ] 配置日志轮转
- [ ] 设置日志保留策略
- [ ] 监控日志大小

### 备份策略
- [ ] 数据库备份脚本
- [ ] 配置文件备份
- [ ] 定期备份计划

### 监控设置
- [ ] 服务健康检查
- [ ] 资源使用监控
- [ ] 告警通知配置

## 🚨 故障排除

### 常见问题检查
- [ ] 容器是否正常运行
- [ ] 端口是否被占用
- [ ] 防火墙是否正确配置
- [ ] DNS解析是否正常
- [ ] SSL证书是否有效

### 日志检查位置
- [ ] docker-compose logs
- [ ] /var/log/nginx/
- [ ] Backend/logs/
- [ ] 系统日志 /var/log/

## 📊 性能基准

### 响应时间目标
- [ ] 首页加载 < 3秒
- [ ] API响应 < 2秒
- [ ] 机票搜索 < 30秒
- [ ] AI分析 < 60秒

### 资源使用目标
- [ ] CPU使用率 < 80%
- [ ] 内存使用率 < 80%
- [ ] 磁盘使用率 < 80%
- [ ] 网络延迟 < 100ms

## ✅ 部署完成确认

### 最终检查
- [ ] 所有服务正常运行
- [ ] 外部访问正常
- [ ] 核心功能测试通过
- [ ] 性能指标达标
- [ ] 安全配置完成
- [ ] 监控和备份就绪

### 交付文档
- [ ] 访问地址和凭据
- [ ] 管理员账号信息
- [ ] 维护操作手册
- [ ] 故障排除指南
- [ ] 联系方式和支持信息

---

## 🎉 部署成功！

当所有检查项都完成后，您的机票监控系统就成功部署到Ubuntu服务器了！

**访问地址**: http://YOUR_SERVER_IP
**管理后台**: 使用管理员账号 1242772513@qq.com 登录

记得定期检查系统状态和更新依赖包以确保安全和稳定运行。
