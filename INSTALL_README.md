# Ticketradar 安装和部署指南

## 🚀 快速开始

### 方法一：一键安装（推荐）

```bash
# 1. 安装依赖
python install_deps.py

# 2. 启动系统
python main.py
```

### 方法二：传统安装

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 检查依赖
python check_dependencies.py

# 3. 启动系统
python start_with_user_system.py
```

## 📦 依赖管理

### 已更新的依赖文件

- ✅ **requirements.txt** - 包含所有必需依赖
- ✅ **Flask-CORS>=4.0.0** - 已添加并安装成功
- ✅ **install_deps.py** - 自动安装脚本
- ✅ **check_dependencies.py** - 依赖检查工具

### 核心依赖包

| 包名 | 版本要求 | 用途 |
|------|----------|------|
| requests | >=2.28.0 | HTTP请求 |
| pandas | >=1.5.0 | 数据处理 |
| python-dotenv | >=1.0.0 | 环境变量 |
| schedule | >=1.2.0 | 定时任务 |
| Flask | >=2.2.0 | Web框架 |
| Flask-SQLAlchemy | >=3.0.0 | 数据库ORM |
| Flask-Login | >=0.6.0 | 用户认证 |
| **Flask-CORS** | **>=4.0.0** | **跨域支持** |
| waitress | >=2.1.0 | WSGI服务器 |

## 🌐 服务器部署

### 自动部署脚本

```powershell
# 基础部署
.\deploy_server.ps1 -InstallDeps

# 指定域名部署
.\deploy_server.ps1 -Domain "your-domain.com" -InstallDeps

# HTTPS部署
.\deploy_server.ps1 -Domain "your-domain.com" -UseHttps -InstallDeps
```

### 前端API配置

系统已自动配置前端API请求：

- **自动URL检测** - 开发/生产环境自适应
- **CORS支持** - 解决跨域问题
- **重试机制** - 网络异常自动重试
- **连接检查** - 实时监控API状态

## 🔧 配置文件

### 环境变量 (.env)

```env
# 服务器配置
SERVER_HOST=0.0.0.0
SERVER_PORT=38181
EXTERNAL_DOMAIN=your-domain.com
USE_HTTPS=false

# 应用配置
SECRET_KEY=your-super-secret-key
DATABASE_URL=sqlite:///ticketradar.db

# PushPlus配置
ENABLE_PUSHPLUS=true
PUSHPLUS_TOKEN=your-token
```

### API配置 (static/js/api-config.js)

- 自动检测服务器地址
- 智能重试机制
- CORS头部处理
- 连接状态监控

## 🛠️ 故障排除

### 1. 依赖问题

```bash
# 检查依赖状态
python check_dependencies.py

# 重新安装依赖
python install_deps.py

# 手动安装特定包
pip install Flask-CORS>=4.0.0
```

### 2. 前端连接问题

- 检查服务器是否运行：`netstat -an | findstr :38181`
- 检查防火墙设置
- 查看浏览器控制台错误信息

### 3. CORS跨域问题

- ✅ Flask-CORS已安装并配置
- ✅ API响应包含CORS头部
- ✅ 支持OPTIONS预检请求

## 📁 文件结构

```
机票监控/
├── main.py                    # 主程序
├── requirements.txt           # 依赖列表（已更新）
├── install_deps.py           # 依赖安装脚本
├── check_dependencies.py     # 依赖检查工具
├── deploy_server.ps1         # 服务器部署脚本
├── nginx.conf.template       # Nginx配置模板
├── static/js/api-config.js   # 前端API配置
├── DEPLOYMENT_GUIDE.md       # 详细部署指南
└── .env.example              # 环境变量模板
```

## 🎯 部署验证

### 本地测试

```bash
# 1. 启动服务
python main.py

# 2. 访问测试
# 浏览器打开: http://localhost:38181

# 3. API测试
curl http://localhost:38181/api/flights
```

### 生产环境

```bash
# 1. 配置域名
# 编辑 .env 文件设置 EXTERNAL_DOMAIN

# 2. 配置反向代理
# 使用 nginx.conf.template

# 3. 启动服务
python main.py

# 4. 访问测试
# 浏览器打开: http://your-domain.com
```

## 📞 技术支持

### 常用命令

```bash
# 查看已安装包
pip list

# 检查依赖状态
python check_dependencies.py

# 验证主程序
python -c "import main; print('OK')"

# 测试Flask-CORS
python -c "import flask_cors; print('CORS version:', flask_cors.__version__)"
```

### 联系方式

- **微信**: Xinx--1996
- **Issues**: 通过项目Issues反馈问题

---

## ✅ 更新日志

### 最新更新 (2024-01-XX)

- ✅ 添加 Flask-CORS>=4.0.0 依赖
- ✅ 更新 requirements.txt
- ✅ 创建自动安装脚本 install_deps.py
- ✅ 添加依赖检查工具 check_dependencies.py
- ✅ 配置前端API自动检测
- ✅ 添加CORS跨域支持
- ✅ 完善部署文档和脚本

### 核心功能

- ✅ 机票价格监控
- ✅ 用户系统和认证
- ✅ 个性化监控任务
- ✅ PushPlus通知推送
- ✅ 响应式Web界面
- ✅ 服务器部署支持

**系统已准备就绪，可以正常部署和使用！** 🎉
