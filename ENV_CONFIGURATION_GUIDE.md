# 🔧 环境变量配置指南

## 📋 双配置文件策略

项目采用双配置文件策略，以支持不同的服务和功能模块：

### 1. 根目录 `.env` - 通用配置
- **用途**: 通用服务配置，兼容旧系统
- **加载**: XHS服务、AI服务、通用工具
- **位置**: `项目根目录/.env`

### 2. Backend/.env - FastAPI专用配置  
- **用途**: FastAPI应用专用配置
- **加载**: FastAPI应用、Supabase服务
- **位置**: `Backend/.env`

## 🔄 配置文件详解

### 根目录 `.env` 配置项

```env
# ===== AI服务配置 =====
# 通用AI API配置（用于XHS分析等）
AI_BASE_URL=http://154.19.184.12:3000/v1
AI_MODEL=gemini-2.5-flash
AI_API_KEY=your_ai_api_key_here

# ===== 小红书配置 =====
# 小红书Cookies（从浏览器开发者工具获取）
XHS_COOKIES=your_complete_xhs_cookies_string

# ===== 地图服务配置 =====
# 高德地图API密钥
AMAP_API_KEY=your_amap_api_key

# ===== 通用配置 =====
# 应用密钥
SECRET_KEY=your-secret-key-change-this-to-random-string

# 推送服务配置（可选）
ENABLE_PUSHPLUS=false
PUSHPLUS_TOKEN=your_pushplus_token

# 邮件服务配置（可选）
MAIL_SERVER=your_mail_server
MAIL_PORT=465
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
```

### Backend/.env 配置项

```env
# ===== 应用基础配置 =====
DEBUG=False
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ===== Gemini AI配置 =====
# 原生Gemini API（推荐）
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-pro

# ===== Supabase数据库配置 =====
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# ===== 其他API配置 =====
# 高德地图API（如果Backend也需要）
AMAP_API_KEY=your_amap_api_key

# 日志配置
LOG_LEVEL=INFO
RATE_LIMIT_PER_MINUTE=120
```

## 🚀 Ubuntu部署配置

### 快速配置步骤

```bash
# 1. 克隆项目
git clone https://github.com/EBOLABOY/Ticketradar.git
cd Ticketradar

# 2. 配置根目录环境变量
cp .env.production.template .env
nano .env  # 编辑通用配置

# 3. 配置Backend环境变量
cp Backend/.env.example Backend/.env
nano Backend/.env  # 编辑FastAPI配置

# 4. 部署
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

### 必需配置项

#### 根目录 `.env` 必需项
- `AI_API_KEY` - AI服务密钥
- `XHS_COOKIES` - 小红书功能（可选）
- `AMAP_API_KEY` - 地图服务（可选）

#### Backend/.env 必需项
- `GEMINI_API_KEY` - Gemini AI密钥
- `SUPABASE_URL` - 数据库URL
- `SUPABASE_ANON_KEY` - 数据库匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - 数据库服务密钥
- `JWT_SECRET_KEY` - JWT签名密钥

## 🔍 配置验证

### 检查配置文件
```bash
# 检查文件存在
ls -la .env Backend/.env

# 验证关键配置
grep -E "(API_KEY|SUPABASE)" .env Backend/.env
```

### 测试配置加载
```bash
# 测试Backend配置
cd Backend
python -c "from fastapi_app.config.settings import settings; print('✅ Backend配置加载成功')"

# 测试根目录配置
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('✅ 根目录配置加载成功')"
```

## ⚠️ 安全注意事项

1. **文件权限**: 设置适当的文件权限
   ```bash
   chmod 600 .env Backend/.env
   ```

2. **Git忽略**: 确保.env文件不被提交
   ```bash
   # .gitignore 应包含
   .env
   Backend/.env
   ```

3. **密钥安全**: 使用强密码和随机密钥
   ```bash
   # 生成随机JWT密钥
   openssl rand -hex 32
   ```

## 🔧 故障排除

### 常见问题

1. **配置文件不存在**
   ```bash
   # 解决方案：复制模板文件
   cp .env.production.template .env
   cp Backend/.env.example Backend/.env
   ```

2. **环境变量未加载**
   ```bash
   # 检查文件路径和权限
   ls -la .env Backend/.env
   # 检查文件内容格式
   cat .env | head -5
   ```

3. **API密钥无效**
   ```bash
   # 验证密钥格式和有效性
   curl -H "Authorization: Bearer $GEMINI_API_KEY" https://generativelanguage.googleapis.com/v1/models
   ```

## 📚 相关文档

- [Ubuntu部署指南](UBUNTU_DEPLOYMENT.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST.md)
- [后端配置说明](Backend/README.md)

---

## 💡 最佳实践

1. **开发环境**: 使用示例配置文件快速开始
2. **生产环境**: 使用强密钥和安全配置
3. **团队协作**: 共享配置模板，不共享实际密钥
4. **版本控制**: 只提交模板文件，不提交实际配置
