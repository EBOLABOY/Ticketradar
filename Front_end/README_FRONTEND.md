# Ticketradar 前端项目

基于 React + Material-UI 的机票监控系统前端界面，实现前后端分离架构。

## 🚀 项目特性

- **现代化UI设计**: 使用 Material-UI v6 组件库
- **响应式布局**: 支持桌面端和移动端
- **前后端分离**: 通过 RESTful API 与后端通信
- **用户认证系统**: 完整的登录、注册、密码重置流程
- **智能搜索**: 航班搜索和价格监控功能
- **数据可视化**: 价格趋势图表和分析
- **AI助手**: 智能旅行规划和建议
- **管理后台**: 系统管理和用户管理

## 📁 项目结构

```
Front_end/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   │   ├── Navbar.jsx     # 导航栏
│   │   └── Footer.jsx     # 页脚
│   ├── pages/             # 页面组件
│   │   ├── Home.jsx       # 首页
│   │   ├── Login.jsx      # 登录页
│   │   ├── Register.jsx   # 注册页
│   │   ├── Dashboard.jsx  # 用户面板

│   │   ├── MonitorHome.jsx      # 监控主页
│   │   ├── PriceTrends.jsx      # 价格趋势
│   │   ├── AITravelAssistant.jsx # AI助手
│   │   └── AdminDashboard.jsx   # 管理后台
│   ├── services/          # API服务
│   │   ├── api.js         # 原有API服务
│   │   └── backendApi.js  # 后端API服务
│   ├── router/            # 路由配置
│   │   └── AppRouter.js   # 主路由
│   └── App.js             # 应用入口
├── .env                   # 环境变量
├── .env.example          # 环境变量示例
└── package.json          # 项目依赖
```

## 🛠️ 技术栈

- **React 19.0.0** - 前端框架
- **Material-UI 6.4.2** - UI组件库
- **React Router DOM** - 路由管理
- **Axios** - HTTP客户端
- **Day.js** - 日期处理
- **React Toastify** - 通知组件

## 📋 页面功能

### 用户认证
- **登录页面** (`/login`) - 用户登录
- **注册页面** (`/register`) - 用户注册
- **忘记密码** (`/forgot-password`) - 密码重置申请
- **重置密码** (`/reset-password`) - 密码重置

### 核心功能
- **首页** (`/`) - 原有的航班搜索功能
- **监控主页** (`/monitor`) - 机票价格监控展示

- **用户面板** (`/dashboard`) - 个人监控任务管理
- **价格趋势** (`/price-trends`) - 价格分析和图表
- **AI助手** (`/ai-travel`) - 智能旅行规划

### 管理功能
- **管理后台** (`/admin`) - 系统管理和用户管理

## 🔧 安装和运行

### 1. 安装依赖

```bash
cd Front_end
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 后端API地址
REACT_APP_BACKEND_URL=http://localhost:38181

# 应用配置
REACT_APP_NAME=Ticketradar
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
```

### 3. 启动开发服务器

```bash
npm start
```

应用将在 `http://localhost:30000` 启动。

### 4. 构建生产版本

```bash
npm run build
```

## 🔌 API集成

前端通过 `src/services/backendApi.js` 与后端FastAPI通信：

### 认证API
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `POST /auth/forgot-password` - 忘记密码
- `POST /auth/reset-password` - 重置密码

### 航班API
- `POST /api/flights/search` - 搜索航班
- `GET /api/flights` - 获取航班数据
- `GET /api/airports/search` - 搜索机场

### 监控API
- `GET /api/monitor/tasks` - 获取监控任务
- `POST /api/monitor/tasks` - 创建监控任务
- `PUT /api/monitor/tasks/:id` - 更新监控任务
- `DELETE /api/monitor/tasks/:id` - 删除监控任务

### AI助手API
- `POST /travel/ai-travel` - AI旅行咨询

## 🎨 UI设计特点

### 设计风格
- **现代简约**: 采用Google Material Design设计语言
- **渐变色彩**: 使用蓝绿渐变色调
- **卡片布局**: 信息以卡片形式组织
- **响应式**: 适配不同屏幕尺寸

### 交互体验
- **流畅动画**: 页面切换和组件交互动画
- **即时反馈**: 操作状态和错误提示
- **智能提示**: 表单验证和输入建议
- **快捷操作**: 快速问题和常用功能

## 🔄 与后端集成

### 1. 确保后端服务运行

后端FastAPI应用应在 `http://localhost:38181` 运行。

### 2. API认证

前端使用JWT token进行认证：
- 登录成功后token存储在localStorage
- 每个API请求自动添加Authorization头
- token过期时自动跳转到登录页

### 3. 错误处理

统一的错误处理机制：
- 网络错误提示
- API错误信息显示
- 用户友好的错误页面

## 📱 移动端适配

- 响应式导航栏
- 触摸友好的交互元素
- 移动端优化的表单布局
- 适配不同屏幕尺寸

## 🚀 部署建议

### 开发环境
```bash
npm start
```

### 生产环境
```bash
npm run build
# 将build文件夹部署到Web服务器
```

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 30000
CMD ["npm", "start"]
```

## 🔧 自定义配置

### 主题定制
在 `src/theme.js` 中自定义Material-UI主题。

### API配置
在 `src/services/backendApi.js` 中修改API配置。

### 路由配置
在 `src/router/AppRouter.js` 中添加新路由。

## 📝 开发注意事项

1. **代码规范**: 使用ESLint和Prettier保持代码风格一致
2. **组件复用**: 提取公共组件到components目录
3. **状态管理**: 复杂状态考虑使用Context或Redux
4. **性能优化**: 使用React.lazy进行代码分割
5. **错误边界**: 添加错误边界组件处理异常

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License
