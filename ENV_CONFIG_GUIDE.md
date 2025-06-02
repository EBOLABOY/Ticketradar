# 🔧 Ticketradar 环境变量配置指南

## 📋 配置文件说明

### 可用的配置文件

1. **`.env.docker`** - 默认Docker配置（已包含您的PushPlus Token）
2. **`.env.production.template`** - 生产环境配置模板
3. **自定义配置** - 您可以创建自己的配置文件

## 🚀 快速配置

### 方法1：使用默认配置（推荐）
```bash
# 直接使用默认配置，已包含您的PushPlus Token
docker compose -f docker-compose.simple.yml --profile nginx up -d
```

### 方法2：自定义生产配置
```bash
# 复制模板文件
cp .env.production.template .env.production

# 编辑配置
nano .env.production

# 使用自定义配置部署
docker compose --env-file .env.production --profile nginx up -d
```

## 📝 重要配置项说明

### 🔐 必须配置的项目

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| `SECRET_KEY` | Flask应用密钥 | `your-super-secret-key` |
| `PUSHPLUS_TOKEN` | PushPlus推送令牌 | `f3da240f668a4fa7ac8db1f9eaa16d39` |
| `EXTERNAL_DOMAIN` | 外部访问域名 | `ticketradar.izlx.me` |

### ⚙️ 监控配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `PRICE_THRESHOLD` | 价格阈值（元） | `1000` |
| `CHECK_INTERVAL` | 主循环检查间隔（分钟） | `5` |
| `USER_MONITOR_INTERVAL` | 用户监控间隔（分钟） | `7` |
| `DEFAULT_DEPARTURE` | 默认出发地 | `HKG` |

### 🌐 PushPlus群组配置（可选）

| 配置项 | 说明 | 用途 |
|--------|------|------|
| `PUSHPLUS_TOPIC_HKG` | 香港群组编码 | 香港航班推送到指定群组 |
| `PUSHPLUS_TOPIC_SZX` | 深圳群组编码 | 深圳航班推送到指定群组 |
| `PUSHPLUS_TOPIC_CAN` | 广州群组编码 | 广州航班推送到指定群组 |
| `PUSHPLUS_TOPIC_MFM` | 澳门群组编码 | 澳门航班推送到指定群组 |

### 🔧 高级配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `MAX_FLIGHTS_PER_REQUEST` | 每次获取最大航班数 | `50` |
| `NOTIFICATION_COOLDOWN` | 通知冷却时间（分钟） | `60` |
| `REQUEST_TIMEOUT` | API请求超时（秒） | `30` |
| `CONCURRENT_REQUESTS` | 并发请求数 | `4` |

## 🎯 配置示例

### 基础配置示例
```env
# 基本设置
SECRET_KEY=my-super-secret-key-2024
PUSHPLUS_TOKEN=f3da240f668a4fa7ac8db1f9eaa16d39
EXTERNAL_DOMAIN=ticketradar.izlx.me

# 监控设置
PRICE_THRESHOLD=800
CHECK_INTERVAL=3
USER_MONITOR_INTERVAL=5

# 行程设置
DEPART_DATE=2025-10-01
RETURN_DATE=2025-10-08
```

### 高级配置示例
```env
# 性能优化
CONCURRENT_REQUESTS=8
MAX_FLIGHTS_PER_REQUEST=100
DATA_CACHE_DURATION=15

# 通知优化
NOTIFICATION_COOLDOWN=30
PRICE_CHANGE_THRESHOLD=50
ENABLE_PRICE_CHANGE_NOTIFICATION=true

# 调试设置
DEBUG=false
VERBOSE_LOGGING=true
LOG_LEVEL=DEBUG
```

## 🔄 配置更新流程

### 1. 停止服务
```bash
docker compose down
```

### 2. 更新配置
```bash
# 编辑配置文件
nano .env.docker
# 或创建新的配置文件
cp .env.production.template .env.custom
nano .env.custom
```

### 3. 重新部署
```bash
# 使用默认配置
docker compose -f docker-compose.simple.yml --profile nginx up -d

# 或使用自定义配置
docker compose --env-file .env.custom --profile nginx up -d
```

### 4. 验证配置
```bash
# 查看环境变量是否正确加载
docker compose exec ticketradar env | grep -E "(PUSHPLUS|SECRET|PRICE)"

# 查看应用日志
docker compose logs -f ticketradar
```

## 🔍 配置验证

### 检查配置是否生效
```bash
# 检查PushPlus配置
docker compose exec ticketradar env | grep PUSHPLUS

# 检查监控配置
docker compose exec ticketradar env | grep -E "(PRICE_THRESHOLD|CHECK_INTERVAL)"

# 检查数据库配置
docker compose exec ticketradar env | grep DATABASE_URL
```

### 测试推送功能
```bash
# 查看推送日志
docker compose logs ticketradar | grep -i pushplus

# 检查推送是否成功
docker compose logs ticketradar | grep "推送成功"
```

## ⚠️ 注意事项

### 安全建议
1. **SECRET_KEY**: 生产环境必须使用强随机字符串
2. **PUSHPLUS_TOKEN**: 不要在公开代码中暴露
3. **DEBUG**: 生产环境必须设为false

### 性能建议
1. **CHECK_INTERVAL**: 不要设置过小，避免频繁请求
2. **CONCURRENT_REQUESTS**: 根据服务器性能调整
3. **NOTIFICATION_COOLDOWN**: 避免重复通知

### 兼容性
1. 所有时间配置单位为分钟或秒，请注意区分
2. 布尔值使用 `true`/`false`
3. 日期格式使用 `YYYY-MM-DD`

## 🎉 快速开始

最简单的配置方式：
```bash
# 1. 使用默认配置（已包含您的PushPlus Token）
cd /root/Ticketradar
docker compose -f docker-compose.simple.yml --profile nginx up -d

# 2. 查看日志确认配置正确
docker compose logs -f ticketradar

# 3. 访问系统
# http://your-server-ip:38181
```

现在您的系统已经包含完整的配置选项！🚀
