# 🚀 简化部署指南

## 📋 项目结构优化

现在项目采用更清晰的结构：
- **环境配置**: `Backend/.env` - 所有配置集中在Backend目录
- **前端代码**: `Front_end/` - React应用
- **后端代码**: `Backend/` - FastAPI应用
- **部署配置**: `docker-compose.yml`, `nginx-ubuntu.conf`

## 🔧 Ubuntu服务器部署（3步完成）

### 步骤1: 获取代码
```bash
# 如果是首次部署
git clone https://github.com/EBOLABOY/Ticketradar.git
cd Ticketradar

# 如果是更新部署
cd Ticketradar
git pull origin main
```

### 步骤2: 配置环境变量
```bash
# 复制配置模板
cp Backend/.env.example Backend/.env

# 编辑配置文件
nano Backend/.env
```

**必需配置项**（其他可选）：
```env
# 必填 - Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# 必填 - Supabase数据库
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# 必填 - JWT密钥
JWT_SECRET_KEY=your-random-secret-key
```

### 步骤3: 一键部署
```bash
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

## ✅ 部署完成

访问地址：
- **前端应用**: `http://your-server-ip/`
- **后端API**: `http://your-server-ip:38181/`
- **API文档**: `http://your-server-ip:38181/docs`

## 🔧 常用管理命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新部署
git pull origin main
./deploy-ubuntu.sh
```

## 🛠️ 故障排除

### 1. 配置文件问题
```bash
# 检查配置文件
ls -la Backend/.env
cat Backend/.env | grep -E "(GEMINI|SUPABASE|JWT)"
```

### 2. 服务启动问题
```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs nginx
```

### 3. 端口占用问题
```bash
# 检查端口占用
sudo netstat -tlnp | grep -E ":(80|443|38181)"
```

## 📊 配置说明

### 必需配置
| 配置项 | 说明 | 获取方式 |
|--------|------|----------|
| `GEMINI_API_KEY` | Google AI密钥 | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `SUPABASE_URL` | 数据库URL | Supabase项目设置 |
| `SUPABASE_ANON_KEY` | 数据库公钥 | Supabase项目API设置 |
| `SUPABASE_SERVICE_ROLE_KEY` | 数据库私钥 | Supabase项目API设置 |
| `JWT_SECRET_KEY` | JWT签名密钥 | 随机字符串 |

### 可选配置
| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `AI_API_KEY` | 通用AI密钥 | 可选 |
| `AMAP_API_KEY` | 高德地图密钥 | 可选 |
| `XHS_COOKIES` | 小红书Cookies | 可选 |
| `DEBUG` | 调试模式 | False |

## 🔒 安全建议

1. **使用强密钥**: JWT_SECRET_KEY使用随机字符串
2. **设置文件权限**: `chmod 600 Backend/.env`
3. **定期更新**: 定期更新依赖和系统
4. **监控日志**: 定期检查应用日志

## 📞 技术支持

如果遇到问题：
1. 检查 `docker-compose logs` 输出
2. 验证 `Backend/.env` 配置
3. 确认防火墙端口开放
4. 查看系统资源使用情况

---

## 🎯 总结

现在部署变得非常简单：
1. **拉取代码** → `git pull`
2. **配置环境** → 编辑 `Backend/.env`
3. **一键部署** → `./deploy-ubuntu.sh`

整个过程只需要几分钟！
