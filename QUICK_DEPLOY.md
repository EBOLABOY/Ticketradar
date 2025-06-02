# 🚀 Ticketradar 一键部署指南

## 📋 系统要求

- **Python 3.8+** (推荐 3.10+)
- **Windows 10/11** 或 **Windows Server 2016+**
- **网络连接** (访问Trip.com API)

## ⚡ 超级简化部署（3步完成）

### 步骤1：下载代码

```bash
# 方法A：Git克隆（推荐）
git clone https://github.com/your-username/ticketradar.git
cd ticketradar

# 方法B：直接下载ZIP
# 1. 访问GitHub仓库
# 2. 点击绿色"Code"按钮 → "Download ZIP"
# 3. 解压到任意目录
```

### 步骤2：一键安装

```bash
# 双击运行（或在命令行执行）
python install_deps.py
```

**就这么简单！** 脚本会自动：
- ✅ 检查Python环境
- ✅ 升级pip到最新版本
- ✅ 安装所有必需依赖
- ✅ 验证安装是否成功

### 步骤3：启动系统

```bash
# 双击运行（或在命令行执行）
python main.py
```

**完成！** 🎉

- 🌐 **访问地址**: http://localhost:38181
- 👤 **默认管理员**: admin / admin123
- 📱 **移动端友好**: 支持手机访问

---

## 🔧 可选配置

### 配置PushPlus通知（可选）

1. 复制 `.env.example` 为 `.env`
2. 编辑 `.env` 文件：

```env
# 启用PushPlus推送
ENABLE_PUSHPLUS=true
PUSHPLUS_TOKEN=你的PushPlus令牌

# 其他配置保持默认即可
```

### 修改端口（可选）

编辑 `.env` 文件：

```env
SERVER_PORT=8080  # 改为你想要的端口
```

---

## 🌐 服务器部署（生产环境）

### 方法A：直接部署

```bash
# 1. 在服务器上重复上述3个步骤
# 2. 修改.env文件
SERVER_HOST=0.0.0.0
SERVER_PORT=38181
EXTERNAL_DOMAIN=your-domain.com

# 3. 配置防火墙
# Windows防火墙允许端口38181

# 4. 启动服务
python main.py
```

### 方法B：自动部署脚本

```powershell
# 以管理员权限运行PowerShell
.\deploy_server.ps1 -Domain "your-domain.com" -InstallDeps
```

---

## 🔍 故障排除

### 问题1：Python未安装

**解决方案**：
1. 访问 https://python.org
2. 下载Python 3.10+
3. 安装时勾选"Add to PATH"

### 问题2：依赖安装失败

**解决方案**：
```bash
# 使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 或重新运行安装脚本
python install_deps.py
```

### 问题3：端口被占用

**解决方案**：
```bash
# 查看端口占用
netstat -ano | findstr :38181

# 修改端口（编辑.env文件）
SERVER_PORT=8080
```

### 问题4：无法访问

**检查清单**：
- ✅ 服务是否正常启动
- ✅ 防火墙是否允许端口
- ✅ 浏览器地址是否正确
- ✅ 网络连接是否正常

---

## 📱 使用指南

### 首次使用

1. **访问系统**: http://localhost:38181
2. **注册账户**: 需要邀请码（联系管理员）
3. **创建监控**: 设置出发地、价格阈值
4. **配置通知**: 设置PushPlus令牌

### 管理员功能

- **生成邀请码**: 管理后台 → 生成邀请码
- **用户管理**: 查看用户统计
- **系统监控**: 查看任务状态

---

## 🎯 核心特性

- 🛫 **多城市支持**: 香港、深圳、广州、澳门
- 💰 **价格监控**: 自定义价格阈值
- 📱 **微信通知**: PushPlus推送
- 👥 **用户系统**: 个性化监控
- 📊 **实时数据**: Trip.com官方数据
- 🌐 **响应式**: 支持手机/平板

---

## 📞 技术支持

### 快速命令

```bash
# 检查系统状态
python check_dependencies.py

# 查看日志
type monitor.log

# 重启服务
# Ctrl+C 停止，然后重新运行 python main.py
```

### 联系方式

- **微信**: Xinx--1996
- **GitHub Issues**: 项目页面提交问题

---

## 🎉 部署完成！

恭喜！您的Ticketradar机票监控系统已经成功部署。

**下一步**：
1. 🔐 修改默认管理员密码
2. 📧 配置PushPlus通知
3. 🎯 创建您的第一个监控任务
4. 📱 添加到手机主屏幕

**享受智能机票监控服务！** ✈️💰
