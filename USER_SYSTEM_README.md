# Ticketradar 用户系统说明

## 🎉 新功能概述

在原有的机票监控功能基础上，新增了完整的用户系统，支持：

- ✅ 用户注册/登录（邀请码机制）
- ✅ 个人监控任务管理
- ✅ 管理员邀请码生成
- ✅ 保留原有主页功能
- ✅ 个性化监控设置

## 🚀 快速开始

### 1. 安装依赖

**方法一：使用安装脚本（推荐）**
```powershell
# 在PowerShell中运行
.\install_user_system.ps1
```

**方法二：手动安装**
```powershell
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置环境

确保 `.env` 文件包含以下配置：
```env
# 用户系统配置
SECRET_KEY=your-secret-key-change-this-to-random-string
DATABASE_URL=sqlite:///ticketradar.db

# 其他原有配置...
ENABLE_PUSHPLUS=false
PUSHPLUS_TOKEN=your-token
PRICE_THRESHOLD=1000
CHECK_INTERVAL=5
DEFAULT_DEPARTURE=HKG
TRIP_TYPE=2
DEPART_DATE=2025-09-30
RETURN_DATE=2025-10-08
```

### 3. 启动服务

**方法一：使用启动脚本**
```powershell
python start_with_user_system.py
```

**方法二：直接启动**
```powershell
python main.py
```

### 4. 访问系统

- 🌐 **主页**: http://localhost:38181
- 👤 **默认管理员**: admin / admin123
- 📝 **请及时修改默认密码**

## 📋 功能说明

### 主页功能
- 保留原有的机票监控展示
- 新增登录/注册按钮
- 登录后显示用户菜单

### 用户系统
1. **注册**: 需要邀请码，联系管理员获取
2. **登录**: 支持用户名或邮箱登录
3. **个人中心**: 管理个人监控任务

### 管理员功能
1. **生成邀请码**: 可设置数量和有效期
2. **用户管理**: 查看用户统计信息
3. **系统监控**: 查看任务和通知统计

### 个性化监控
1. **自定义出发地**: 支持香港、广州、深圳、澳门
2. **自定义目的地**: 可指定具体城市或监控所有
3. **自定义日期**: 设置出发和返程日期
4. **价格阈值**: 个人化的价格提醒设置

## 🗂️ 数据库结构

系统使用SQLite数据库，包含以下表：

- **users**: 用户信息
- **invite_codes**: 邀请码管理
- **monitor_tasks**: 监控任务
- **notifications**: 通知记录（预留）

## 🔧 技术栈

- **后端**: Flask + SQLAlchemy + Flask-Login
- **前端**: Bootstrap 5 + 原有样式
- **数据库**: SQLite
- **部署**: Waitress

## 📱 页面结构

```
/                    # 主页（保留原功能 + 用户菜单）
/login              # 登录页面
/register           # 注册页面（需邀请码）
/dashboard          # 用户个人中心
/admin              # 管理员后台
/logout             # 登出
```

## 🛠️ 开发说明

### 添加新的监控任务功能

1. 在 `dashboard.html` 中的表单添加字段
2. 在 `create_task` 路由中处理新字段
3. 在 `MonitorTask` 模型中添加对应字段

### 自定义通知方式

1. 在用户模型中添加通知配置字段
2. 修改通知发送逻辑
3. 在个人中心添加通知设置

## 🔒 安全注意事项

1. **修改默认密码**: 首次登录后立即修改admin密码
2. **SECRET_KEY**: 在生产环境中使用强随机密钥
3. **邀请码管理**: 定期清理过期邀请码
4. **数据备份**: 定期备份SQLite数据库文件

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**
   - 检查Python版本（需要3.8+）
   - 确保有足够的磁盘空间
   - 尝试使用国内镜像源

2. **数据库错误**
   - 删除 `ticketradar.db` 文件重新初始化
   - 检查文件权限

3. **登录问题**
   - 确认用户名/密码正确
   - 检查数据库是否正常初始化

### 日志查看

程序运行时会输出详细日志，包括：
- 数据库初始化状态
- 用户登录/注册操作
- 监控任务执行情况

## 📞 技术支持

如有问题，请检查：
1. 依赖是否正确安装
2. .env配置是否完整
3. 数据库是否正常初始化
4. 端口38181是否被占用

## 🔄 升级说明

从原版本升级：
1. 备份原有数据和配置
2. 安装新依赖
3. 更新.env配置
4. 运行新版本（会自动初始化数据库）

原有的机票监控功能完全保留，新用户系统作为增强功能添加。
