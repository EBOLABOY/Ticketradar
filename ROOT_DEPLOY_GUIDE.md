# 🚀 Ticketradar Root用户部署指南

## ⚠️ 重要提醒

**安全警告**: 在生产环境中，建议使用普通用户而非root用户运行应用程序以提高安全性。但如果您确定要使用root用户，请按照以下步骤操作。

## 📋 系统要求

- **Ubuntu 18.04+** (推荐 20.04 LTS 或 22.04 LTS)
- **Root权限访问**
- **Python 3.8+** (脚本会自动安装)
- **至少1GB内存**
- **至少2GB磁盘空间**
- **网络连接** (访问Trip.com API)

## 🚀 Root用户部署步骤

### 步骤1：上传部署包到服务器

#### 方法A：使用SCP（推荐）
```bash
# 在本地执行，上传到服务器root目录
scp ticketradar-ubuntu-deploy.zip root@your-server-ip:/root/

# 如果SSH端口不是22
scp -P your-ssh-port ticketradar-ubuntu-deploy.zip root@your-server-ip:/root/
```

#### 方法B：使用SFTP工具
- 连接信息：
  - 主机：your-server-ip
  - 用户名：root
  - 密码：your-root-password
  - 上传到：/root/

#### 方法C：使用wget（如果文件在网上）
```bash
# 直接在服务器上下载
ssh root@your-server-ip
cd /root
wget https://your-file-url/ticketradar-ubuntu-deploy.zip
```

### 步骤2：连接到服务器

```bash
# SSH连接到服务器
ssh root@your-server-ip

# 或指定端口
ssh -p your-ssh-port root@your-server-ip
```

### 步骤3：解压和准备

```bash
# 切换到root目录
cd /root

# 解压部署包
unzip ticketradar-ubuntu-deploy.zip

# 进入项目目录
cd ticketradar-deploy

# 查看文件列表
ls -la

# 给脚本执行权限
chmod +x *.sh
```

### 步骤4：一键安装

```bash
# 运行安装脚本（支持root用户）
./ubuntu_install.sh
```

**安装过程说明**：
- ✅ 自动检测root用户并适配
- ✅ 更新系统包
- ✅ 安装Python 3.8+环境
- ✅ 创建虚拟环境
- ✅ 安装所有依赖包
- ✅ 创建启动脚本
- ✅ 生成systemd服务文件

### 步骤5：配置环境（可选但推荐）

```bash
# 编辑配置文件
nano .env

# 基础配置示例：
SERVER_HOST=0.0.0.0
SERVER_PORT=38181
SECRET_KEY=your-super-secret-key-here
ENABLE_PUSHPLUS=true
PUSHPLUS_TOKEN=your-pushplus-token
```

### 步骤6：启动系统

#### 方法A：后台启动（推荐）
```bash
# 后台启动
./start_background.sh

# 查看启动状态
ps aux | grep python

# 查看日志
tail -f ticketradar.log
```

#### 方法B：前台启动（调试用）
```bash
# 前台启动，可以看到实时输出
./start_ticketradar.sh
```

#### 方法C：系统服务启动（开机自启）
```bash
# 安装为系统服务
cp ticketradar.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable ticketradar
systemctl start ticketradar

# 查看服务状态
systemctl status ticketradar

# 查看服务日志
journalctl -u ticketradar -f
```

### 步骤7：配置防火墙

```bash
# 检查防火墙状态
ufw status

# 允许38181端口
ufw allow 38181

# 如果防火墙未启用，可以启用
ufw enable

# 查看开放的端口
ufw status numbered
```

### 步骤8：验证部署

```bash
# 检查进程是否运行
ps aux | grep python

# 检查端口是否监听
netstat -tlnp | grep :38181

# 检查系统资源
free -h
df -h

# 测试本地访问
curl http://localhost:38181
```

## 🌐 访问系统

- **本地访问**: http://localhost:38181
- **外部访问**: http://your-server-ip:38181
- **默认管理员**: admin / admin123

## 🔧 可选配置

### 配置Nginx反向代理

```bash
# 运行Nginx配置脚本
./ubuntu_nginx_setup.sh

# 输入您的域名
# 例如：ticketradar.yourdomain.com
```

### 配置SSL证书

```bash
# 安装Certbot
apt install certbot python3-certbot-nginx -y

# 获取SSL证书
certbot --nginx -d your-domain.com

# 设置自动续期
crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 配置域名访问

如果您有域名，配置DNS解析：
- A记录：your-domain.com → your-server-ip
- 然后使用Nginx反向代理

## 📊 管理命令

### 启动和停止

```bash
# 后台启动
./start_background.sh

# 停止服务
./stop_ticketradar.sh

# 重启服务
./stop_ticketradar.sh && ./start_background.sh

# 查看运行状态
ps aux | grep python
```

### 查看日志

```bash
# 查看应用日志
tail -f ticketradar.log

# 查看系统服务日志
journalctl -u ticketradar -f

# 查看Nginx日志（如果配置了）
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 系统监控

```bash
# 查看系统资源
htop

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看网络连接
netstat -tlnp
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查看端口占用
lsof -i :38181

# 杀死占用进程
kill -9 PID
```

2. **Python依赖问题**
```bash
# 重新安装依赖
cd /root/ticketradar-deploy
source venv/bin/activate
pip install -r requirements.txt
```

3. **权限问题**
```bash
# 修复文件权限
chmod +x *.sh
chown -R root:root .
```

4. **内存不足**
```bash
# 查看内存使用
free -h

# 创建swap文件（如果需要）
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 永久启用swap
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

5. **网络连接问题**
```bash
# 测试网络连接
ping google.com
curl -I https://hk.trip.com

# 检查DNS
nslookup hk.trip.com
```

## 🔒 安全建议

虽然使用root用户，但仍建议：

1. **修改默认密码**
```bash
# 首次登录后立即修改admin密码
```

2. **配置防火墙**
```bash
# 只开放必要端口
ufw allow ssh
ufw allow 38181
ufw enable
```

3. **定期更新系统**
```bash
apt update && apt upgrade -y
```

4. **监控日志**
```bash
# 定期检查日志文件
tail -f ticketradar.log
```

5. **备份数据**
```bash
# 定期备份数据库和配置
cp ticketradar.db /backup/
cp .env /backup/
```

## 📝 部署检查清单

- ✅ 服务器系统：Ubuntu 18.04+
- ✅ Root权限：可以执行所有命令
- ✅ 网络连接：能访问外网
- ✅ 端口38181：未被占用
- ✅ 内存：至少1GB
- ✅ 磁盘：至少2GB可用空间
- ✅ 防火墙：允许38181端口

## 🎯 部署完成后

1. **访问系统**: http://your-server-ip:38181
2. **登录管理员**: admin / admin123
3. **修改密码**: 安全起见，立即修改默认密码
4. **配置PushPlus**: 编辑.env文件添加token
5. **创建监控任务**: 设置出发地和价格阈值
6. **测试通知**: 验证PushPlus推送功能

## 📞 技术支持

如有问题，请：
1. 查看日志文件：`tail -f ticketradar.log`
2. 检查系统状态：`systemctl status ticketradar`
3. 联系技术支持：微信 Xinx--1996

---

**恭喜！您的Ticketradar机票监控系统已在root用户下成功部署！** 🎉
