# 📁 Ticketradar 项目结构

## 🎯 核心文件

### 主程序文件
- **main.py** - 主程序入口，包含Flask应用和监控逻辑
- **models.py** - 数据库模型定义（用户、监控任务等）
- **start_with_user_system.py** - 带用户系统的启动脚本

### 配置文件
- **requirements.txt** - Python依赖包列表
- **.env.example** - 环境变量配置模板
- **nginx.conf.template** - Nginx反向代理配置模板

## 🛠️ 安装和部署工具

### 依赖管理
- **install_deps.py** - 自动安装Python依赖
- **check_dependencies.py** - 检查依赖安装状态

### 部署脚本
- **ubuntu_install.sh** - Ubuntu系统一键安装脚本
- **ubuntu_nginx_setup.sh** - Ubuntu Nginx配置脚本
- **start_monitor.sh** - Linux启动脚本
- **stop_monitor.sh** - Linux停止脚本

## 🌐 Web界面

### 模板文件 (templates/)
- **index.html** - 主页模板
- **login.html** - 登录页面
- **register.html** - 注册页面
- **dashboard.html** - 用户仪表板
- **admin.html** - 管理员后台
- **qr_code_display_page.html** - 二维码显示页面

### 静态资源 (static/)
- **style.css** - 主样式文件
- **js/api-config.js** - 前端API配置
- **airplane.ico** - 网站图标
- **favicon-*.png** - 各尺寸图标
- **favicon.svg** - SVG图标
- **manifest.json** - PWA配置

## 📚 文档

### 用户文档
- **README.md** - 项目介绍和基本使用
- **QUICK_DEPLOY.md** - 快速部署指南
- **INSTALL_README.md** - 详细安装说明

### 技术文档
- **DEPLOYMENT_GUIDE.md** - 完整部署指南
- **USER_SYSTEM_README.md** - 用户系统说明
- **PROJECT_STRUCTURE.md** - 项目结构说明（本文件）

### 其他
- **LICENSE** - 开源许可证

## 🗂️ 目录结构

```
ticketradar/
├── 📄 main.py                    # 主程序
├── 📄 models.py                  # 数据模型
├── 📄 requirements.txt           # 依赖列表
├── 📄 .env.example              # 配置模板
├── 📄 .gitignore                # Git忽略文件
│
├── 🛠️ 安装工具/
│   ├── install_deps.py          # 依赖安装
│   ├── check_dependencies.py    # 依赖检查
│   ├── ubuntu_install.sh        # Ubuntu安装
│   └── ubuntu_nginx_setup.sh    # Nginx配置
│
├── 🌐 Web界面/
│   ├── templates/               # HTML模板
│   │   ├── index.html          # 主页
│   │   ├── login.html          # 登录
│   │   ├── register.html       # 注册
│   │   ├── dashboard.html      # 仪表板
│   │   ├── admin.html          # 管理后台
│   │   └── qr_code_display_page.html
│   │
│   └── static/                 # 静态资源
│       ├── style.css           # 样式
│       ├── js/api-config.js    # API配置
│       ├── airplane.ico        # 图标
│       ├── favicon-*.png       # 各尺寸图标
│       ├── favicon.svg         # SVG图标
│       └── manifest.json       # PWA配置
│
├── 📚 文档/
│   ├── README.md               # 项目介绍
│   ├── QUICK_DEPLOY.md         # 快速部署
│   ├── INSTALL_README.md       # 安装说明
│   ├── DEPLOYMENT_GUIDE.md     # 部署指南
│   ├── USER_SYSTEM_README.md   # 用户系统
│   └── PROJECT_STRUCTURE.md    # 项目结构
│
├── 🔧 配置文件/
│   ├── nginx.conf.template     # Nginx配置
│   ├── start_monitor.sh        # Linux启动
│   ├── stop_monitor.sh         # Linux停止
│   └── start_with_user_system.py # 用户系统启动
│
└── 📄 LICENSE                   # 开源许可
```

## 🚫 已清理的文件

以下文件已被清理删除：

### 测试文件
- `test_*.py` - 所有测试脚本
- `debug_*.py` - 所有调试脚本
- `analyze_*.py` - 分析工具脚本

### 临时文件
- `dashboard_*.html` - 临时HTML文件
- `*.pkl` - 缓存数据文件
- `*.json` - 临时JSON配置
- `__pycache__/` - Python缓存目录

### Windows特定文件
- `*.bat` - 批处理文件
- `*.ps1` - PowerShell脚本
- `一键部署.bat` - Windows部署脚本

### 其他清理项
- `去哪儿.py` - 其他平台测试
- `auth.py` - 临时认证脚本
- `admin.py` - 临时管理脚本
- `venv/` - 虚拟环境目录
- `instance/` - 实例数据目录

## 🎯 核心功能模块

### 1. 机票监控 (main.py)
- 定时获取Trip.com机票数据
- 价格阈值监控
- 多城市支持（香港、深圳、广州、澳门）

### 2. 用户系统 (models.py)
- 用户注册/登录
- 邀请码机制
- 个性化监控任务

### 3. 通知推送
- PushPlus微信推送
- 群组推送支持
- 智能去重机制

### 4. Web界面
- 响应式设计
- 移动端友好
- 实时数据展示

## 🔧 部署要求

### 系统要求
- **Ubuntu 18.04+** (推荐 20.04 LTS)
- **Python 3.8+**
- **2GB+ RAM**
- **网络连接**

### 依赖包
- Flask 2.2+
- Flask-SQLAlchemy 3.0+
- Flask-Login 0.6+
- Flask-CORS 4.0+
- requests 2.28+
- pandas 1.5+
- 其他（见requirements.txt）

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/your-username/ticketradar.git
cd ticketradar

# 2. 运行安装脚本
chmod +x ubuntu_install.sh
./ubuntu_install.sh

# 3. 启动系统
./start_background.sh
```

**访问地址**: http://your-server-ip:38181

---

*项目已优化为生产就绪状态，所有测试文件和临时文件已清理完毕。*
