# Ticketradar Backend API

基于 FastAPI 的机票监控系统后端API，提供完整的RESTful API服务，支持前后端分离架构。

## 🚀 项目特性

- **RESTful API** - 完整的REST API设计
- **用户认证** - JWT Token认证系统
- **机票搜索** - 集成多个航班搜索引擎
- **价格监控** - 自动化价格监控和通知
- **AI助手** - 智能旅行规划和建议
- **管理后台** - 系统管理和用户管理
- **数据分析** - 价格趋势分析和预测
- **通知系统** - 邮件和推送通知

## 📁 项目结构

```
Backend/
├── app/                    # 应用核心代码
│   ├── models/            # 数据库模型
│   │   ├── user.py        # 用户模型
│   │   ├── monitor_task.py # 监控任务模型
│   │   ├── flight_models.py # 航班数据模型
│   │   └── ...
│   ├── routes/            # API路由
│   │   ├── auth.py        # 认证路由
│   │   ├── api.py         # 核心API路由
│   │   ├── admin.py       # 管理员路由
│   │   └── travel.py      # AI旅行助手路由
│   ├── services/          # 业务逻辑层
│   │   ├── flight_service.py      # 航班服务
│   │   ├── user_service.py        # 用户服务
│   │   ├── notification_service.py # 通知服务
│   │   ├── ai_service.py          # AI服务
│   │   └── ...
│   ├── tasks/             # 后台任务
│   │   └── monitor_task.py # 监控任务
│   └── utils/             # 工具函数
├── config/                # 配置文件
├── database/              # 数据库相关
├── docs/                  # 文档
├── logs/                  # 日志文件
├── scripts/               # 部署脚本
├── static/                # 静态文件
├── templates/             # 模板文件（兼容性保留）
├── tests/                 # 测试文件
├── app.py                 # 应用入口
├── requirements.txt       # 依赖文件
└── .env.example          # 环境变量示例
```

## 🛠️ 技术栈

- **FastAPI** - 现代Web框架
- **SQLAlchemy** - ORM数据库操作
- **python-jose** - JWT认证
- **FastAPI-CORS** - 跨域支持
- **FastAPI-Mail** - 邮件服务
- **Celery** - 异步任务队列
- **Redis** - 缓存和消息队列
- **SQLite/PostgreSQL** - 数据库
- **Loguru** - 日志管理

## 📋 API端点

### 认证相关
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出
- `POST /auth/forgot-password` - 忘记密码
- `POST /auth/reset-password` - 重置密码
- `GET /auth/me` - 获取当前用户信息

### 航班相关
- `POST /api/flights/search` - 搜索航班
- `GET /api/flights` - 获取航班数据
- `GET /api/airports/search` - 搜索机场
- `GET /api/airports/nearby` - 获取附近机场

### 监控相关
- `GET /api/monitor/tasks` - 获取监控任务
- `POST /api/monitor/tasks` - 创建监控任务
- `PUT /api/monitor/tasks/:id` - 更新监控任务
- `DELETE /api/monitor/tasks/:id` - 删除监控任务
- `PATCH /api/monitor/tasks/:id/toggle` - 切换任务状态
- `GET /api/monitor/stats` - 获取监控统计

### 价格相关
- `GET /api/prices/trends` - 获取价格趋势
- `GET /api/prices/history` - 获取价格历史
- `GET /api/prices/prediction` - 获取价格预测

### AI助手相关
- `POST /travel/ai-travel` - AI旅行咨询
- `POST /travel/suggestions` - 获取旅行建议

### 管理员相关
- `GET /admin/stats` - 系统统计
- `GET /admin/users` - 用户列表
- `PATCH /admin/users/:id/status` - 更新用户状态
- `GET /admin/config` - 系统配置
- `PUT /admin/config` - 更新系统配置

## 🔧 安装和运行

### 1. 环境要求

- Python 3.8+
- pip 或 conda
- SQLite（开发环境）或 PostgreSQL（生产环境）

### 2. 安装依赖

```bash
cd Backend
pip install -r requirements.txt
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///instance/ticketradar.db
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# AI服务配置 - 原生Gemini API (推荐)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash-preview-05-20

# 备用AI服务配置 - OpenAI兼容API
AI_BASE_URL=http://154.19.184.12:3000/v1
AI_MODEL=gemini-2.5-flash-preview-05-20
AI_API_KEY=your-backup-api-key

# 高德地图API配置
AMAP_KEY=your-amap-key-here
AMAP_SECRET=your-amap-secret-here
```

### 4. 初始化数据库

```bash
python app.py
```

首次运行会自动创建数据库表。

### 5. 启动开发服务器

```bash
python app.py
```

服务器将在 `http://localhost:38181` 启动。

## 🔌 与前端集成

### CORS配置

后端已配置CORS支持，允许前端（默认 `http://localhost:3000`）访问API。

### API认证

使用JWT Token进行认证：

1. 用户登录获取token
2. 在请求头中添加 `Authorization: Bearer <token>`
3. 后端验证token并返回相应数据

### 错误处理

API返回标准的HTTP状态码和JSON错误信息：

```json
{
  "error": "错误信息",
  "message": "详细描述",
  "status": 400
}
```

## 🚀 部署

### Docker部署

```bash
# 构建镜像
docker build -t ticketradar-backend .

# 运行容器
docker run -p 38181:38181 ticketradar-backend
```

### 使用docker-compose

```bash
docker-compose up -d
```

### 生产环境部署

1. 使用Gunicorn作为WSGI服务器
2. 配置Nginx作为反向代理
3. 使用PostgreSQL作为数据库
4. 配置Redis作为缓存和消息队列

```bash
# 安装Gunicorn
pip install gunicorn

# 启动生产服务器
gunicorn -w 4 -b 0.0.0.0:38181 app:app
```

## 📊 监控和日志

### 日志配置

日志文件位于 `logs/ticketradar.log`，支持：
- 自动轮转（10MB）
- 保留7天
- 多级别日志（DEBUG, INFO, WARNING, ERROR）

### 性能监控

- API响应时间监控
- 数据库查询性能
- 内存和CPU使用率
- 错误率统计

## 🧪 测试

```bash
# 运行单元测试
python -m pytest tests/

# 运行覆盖率测试
python -m pytest --cov=app tests/
```

## 🔒 安全配置

- JWT Token过期时间：24小时
- 密码加密：bcrypt
- SQL注入防护：SQLAlchemy ORM
- XSS防护：FastAPI内置
- CSRF防护：FastAPI安全机制

## 📝 开发指南

### 添加新的API端点

1. 在 `app/routes/` 中创建或修改路由文件
2. 在 `app/services/` 中实现业务逻辑
3. 在 `app/models/` 中定义数据模型
4. 添加相应的测试用例

### 数据库迁移

```bash
# 生成迁移文件
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head
```

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📚 API文档

详细的API文档请参考 `docs/API.md`。

## 📄 许可证

MIT License
