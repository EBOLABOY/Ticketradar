# Ticketradar 服务器部署指南

## 📋 部署概述

本指南将帮助您将Ticketradar机票监控系统部署到生产服务器上，确保前端能够正确请求后端API。

## 🛠️ 部署方式

### 方式一：自动部署脚本（推荐）

```powershell
# 基础部署
.\deploy_server.ps1 -InstallDeps

# 指定域名和端口
.\deploy_server.ps1 -Domain "your-domain.com" -Port "8080" -InstallDeps

# 启用HTTPS
.\deploy_server.ps1 -Domain "your-domain.com" -UseHttps -InstallDeps
```

### 方式二：手动部署

#### 1. 环境准备

```powershell
# 1. 克隆项目
git clone <repository-url>
cd 机票监控

# 2. 创建虚拟环境
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. 安装依赖（推荐方式）
.\install_dependencies.ps1 -Upgrade

# 或使用传统方式
pip install -r requirements.txt

# 4. 验证依赖
python check_dependencies.py
```

#### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
# 服务器配置
SERVER_HOST=0.0.0.0
SERVER_PORT=38181
EXTERNAL_DOMAIN=your-domain.com
USE_HTTPS=false

# 应用配置
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///ticketradar.db

# PushPlus配置
ENABLE_PUSHPLUS=true
PUSHPLUS_TOKEN=your-pushplus-token
```

#### 3. 启动服务

```powershell
# 直接启动
python main.py

# 或使用生成的启动脚本
.\start_server.bat
```

## 🌐 网络配置

### 防火墙设置

确保服务器防火墙允许指定端口：

```powershell
# Windows防火墙
New-NetFirewallRule -DisplayName "Ticketradar" -Direction Inbound -Protocol TCP -LocalPort 38181 -Action Allow

# 或通过图形界面：控制面板 → 系统和安全 → Windows Defender防火墙 → 高级设置
```

### 反向代理配置（推荐）

#### Nginx配置

1. 复制 `nginx.conf.template` 到Nginx配置目录
2. 修改域名和路径
3. 重启Nginx服务

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:38181;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### IIS配置（Windows Server）

1. 安装URL Rewrite和Application Request Routing模块
2. 创建反向代理规则：

```xml
<system.webServer>
    <rewrite>
        <rules>
            <rule name="Ticketradar" stopProcessing="true">
                <match url="(.*)" />
                <action type="Rewrite" url="http://localhost:38181/{R:1}" />
            </rule>
        </rules>
    </rewrite>
</system.webServer>
```

## 🔒 HTTPS配置

### 1. 获取SSL证书

```bash
# 使用Let's Encrypt（免费）
certbot --nginx -d your-domain.com

# 或使用其他证书提供商
```

### 2. 配置HTTPS

更新 `.env` 文件：

```env
USE_HTTPS=true
EXTERNAL_DOMAIN=your-domain.com
```

更新Nginx配置以支持HTTPS。

## 🚀 前端API请求配置

系统已自动配置前端API请求：

### 自动检测机制

- **开发环境**：自动使用 `localhost:38181`
- **生产环境**：自动使用当前域名和端口
- **HTTPS支持**：自动检测协议类型

### API配置文件

`static/js/api-config.js` 提供：

- 自动URL检测
- 请求重试机制
- CORS头部处理
- 连接状态检查

### 使用示例

```javascript
// 获取航班数据
const flights = await window.api.getFlights();

// 获取指定城市数据
const cityFlights = await window.api.getFlightsByCity('HKG');

// 检查API连接
const isConnected = await window.api.checkConnection();
```

## 🔧 常见问题解决

### 1. 依赖安装问题

**症状**：导入模块失败，如"No module named 'flask_cors'"

**解决方案**：
```powershell
# 检查依赖状态
python check_dependencies.py

# 重新安装依赖
.\install_dependencies.ps1 -Force -Upgrade

# 或手动安装特定包
pip install Flask-CORS>=4.0.0
```

### 2. 前端无法连接后端

**症状**：页面显示"API连接异常"

**解决方案**：
```powershell
# 检查服务是否运行
netstat -an | findstr :38181

# 检查防火墙
Get-NetFirewallRule -DisplayName "*Ticketradar*"

# 检查日志
Get-Content monitor.log -Tail 50
```

### 3. CORS跨域问题

**症状**：浏览器控制台显示CORS错误

**解决方案**：
- 确保Flask-CORS已安装：`pip install Flask-CORS`
- 检查API响应头是否包含CORS头部
- 使用反向代理避免跨域问题

### 4. 静态文件404错误

**症状**：CSS/JS文件加载失败

**解决方案**：
```python
# 检查Flask静态文件配置
app = Flask(__name__, static_folder='static', static_url_path='/static')
```

### 5. 数据库连接问题

**症状**：用户登录失败或数据保存失败

**解决方案**：
```powershell
# 检查数据库文件权限
icacls ticketradar.db

# 重新初始化数据库
python -c "from main import init_database; init_database()"
```

## 📊 监控和维护

### 1. 日志监控

```powershell
# 实时查看日志
Get-Content monitor.log -Wait

# 查看错误日志
Get-Content monitor.log | Select-String "ERROR"
```

### 2. 性能监控

```powershell
# 检查内存使用
Get-Process python | Select-Object ProcessName, WorkingSet

# 检查端口占用
netstat -ano | findstr :38181
```

### 3. 自动重启

创建Windows服务或使用任务计划程序：

```powershell
# 安装为Windows服务
python install_service.py install
python install_service.py start
```

## 🔄 更新部署

```powershell
# 1. 停止服务
python install_service.py stop

# 2. 更新代码
git pull origin main

# 3. 更新依赖
pip install -r requirements.txt

# 4. 重启服务
python install_service.py start
```

## 📞 技术支持

如遇到部署问题，请检查：

1. **系统要求**：Python 3.8+, Windows Server 2016+
2. **网络要求**：出站HTTPS访问（Trip.com API）
3. **权限要求**：文件读写权限，网络端口绑定权限

**联系方式**：
- 微信：Xinx--1996
- 邮箱：通过项目Issues反馈

---

*最后更新：2024年1月*
