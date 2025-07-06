# 🔧 环境变量配置指南

## 📋 统一配置文件策略

项目采用统一的根目录 `.env` 文件配置，简化环境变量管理：

### 根目录 `.env` - 统一配置
- **用途**: 包含所有服务的配置变量
- **加载**: 所有服务模块统一加载
- **位置**: `项目根目录/.env`
- **优势**: 配置集中管理，避免重复和冲突

## 🔄 配置文件详解

### 根目录 `.env` 统一配置项

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

# 以上所有配置项都已整合到根目录 .env 文件中

## 🚀 Ubuntu部署配置

### 快速配置步骤

```bash
# 1. 克隆项目
git clone https://github.com/EBOLABOY/Ticketradar.git
cd Ticketradar

# 2. 配置环境变量（统一配置文件）
cp .env.example .env
nano .env  # 编辑所有配置项

# 3. 部署
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

### 必需配置项

#### 根目录 `.env` 必需项
- `AI_API_KEY` - 通用AI服务密钥
- `GEMINI_API_KEY` - Gemini AI密钥
- `SUPABASE_URL` - 数据库URL
- `SUPABASE_ANON_KEY` - 数据库匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - 数据库服务密钥
- `JWT_SECRET_KEY` - JWT签名密钥

#### 可选配置项
- `XHS_COOKIES` - 小红书功能
- `AMAP_API_KEY` - 地图服务

## 🔍 配置验证

### 检查配置文件
```bash
# 检查文件存在
ls -la .env

# 验证关键配置
grep -E "(API_KEY|SUPABASE|JWT_SECRET)" .env
```

### 测试配置加载
```bash
# 测试Backend配置
cd Backend
python -c "from fastapi_app.config.settings import settings; print('✅ 配置加载成功')"

# 测试根目录配置
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('✅ 环境变量加载成功')"
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
   cp .env.example .env
   ```

2. **环境变量未加载**
   ```bash
   # 检查文件路径和权限
   ls -la .env
   # 检查文件内容格式
   cat .env | head -10
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
