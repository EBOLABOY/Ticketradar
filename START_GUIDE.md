# 机票监控系统 - 启动指南

## 🚀 快速启动

本项目提供了简化的批处理文件来启动开发环境。

### 📁 文件说明

| 文件名 | 用途 | 推荐场景 |
|--------|------|----------|
| `start-all.bat` | 启动完整开发环境 | 日常开发，一键启动所有服务 |
| `stop-all.bat` | 停止所有服务 | 一键停止所有服务 |

### 🎯 使用方法

#### 1. 启动开发环境 (推荐)
```bash
# 双击运行或在命令行执行
start-all.bat
```

#### 2. 停止服务
```bash
# 双击运行或在命令行执行
stop-all.bat
```

### 📋 启动前准备

#### 必需环境
- **Python 3.8+** (已安装并添加到PATH)
- **Node.js 16+** (已安装并添加到PATH)
- **npm** (通常随Node.js一起安装)

#### 推荐环境
- **Python虚拟环境** (venv) - **强烈推荐**
  - 项目根目录下应有 `venv` 文件夹
  - `start-all.bat` 会自动激活虚拟环境
  - 如果不存在虚拟环境，请运行：`python -m venv venv`
- **Redis服务器** (可选)
  - 推荐安装到：`D:\Redis\redis-server.exe`
  - 如果未安装，系统将使用内存缓存

### 🔧 服务信息

启动后的服务地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 (React) | http://localhost:30000 | 用户界面 |
| 后端 (FastAPI) | http://localhost:38181 | API服务 |
| API文档 | http://localhost:38181/docs | API接口文档 |
| 交互式文档 | http://localhost:38181/redoc | ReDoc格式文档 |
| Redis缓存 | redis://localhost:6379 | 缓存服务 (如果可用) |

### 💡 使用提示

1. **启动开发环境**：使用 `start-all.bat`，它会自动检查环境、激活虚拟环境并启动所有服务
2. **停止服务**：使用 `stop-all.bat` 或直接关闭命令行窗口
3. **热重载**：代码修改后会自动重启，无需手动重启服务
4. **虚拟环境**：脚本会自动检测并激活虚拟环境，确保依赖隔离
5. **自动打开浏览器**：启动完成后会自动打开前端应用和API文档

### 🐛 常见问题

#### 问题1：编码错误或乱码
**解决方案**：确保在支持UTF-8的命令行环境中运行，或使用PowerShell

#### 问题2：Python/Node.js未找到
**解决方案**：
- 确保Python和Node.js已正确安装
- 检查环境变量PATH是否包含Python和Node.js的安装路径
- 重启命令行窗口

#### 问题3：端口被占用
**解决方案**：
- 使用 `stop-all.bat` 停止可能运行的服务
- 或手动结束占用端口的进程

#### 问题4：前端依赖安装失败
**解决方案**：
- 检查网络连接
- 尝试使用国内npm镜像：`npm config set registry https://registry.npmmirror.com`
- 手动进入Front_end目录执行 `npm install`

#### 问题5：Redis服务启动失败
**解决方案**：
- 确保Redis已安装到 `D:\Redis\redis-server.exe`
- 或者忽略Redis错误，系统会使用内存缓存

### 🔄 手动启动方式

如果批处理文件无法正常工作，可以手动启动：

#### 启动后端
```bash
# 激活虚拟环境
venv\Scripts\activate
# 进入后端目录
cd Backend
# 启动FastAPI应用
python main_fastapi.py
```

#### 启动前端
```bash
cd Front_end
# 安装依赖（首次）
npm install
# 启动React应用
npm start
```

### 📝 开发注意事项

1. **数据库**：使用Supabase云数据库，配置在 `.env` 文件中
2. **日志**：应用日志保存在 `logs/` 目录
3. **配置**：环境配置在 `Backend/.env` 文件中
4. **调试模式**：开发环境默认启用FastAPI调试模式
5. **管理员账户**：默认账户 `1242772513@qq.com` / `1242772513`

### 🆘 获取帮助

如果遇到问题：
1. 查看命令行输出的错误信息
2. 检查 `logs/ticketradar.log` 日志文件
3. 确认所有依赖已正确安装
4. 尝试手动启动方式进行排查
