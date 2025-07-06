# 密码重置功能部署指南

## 概述

本文档介绍如何配置和部署密码重置功能，包括数据库设置、邮件服务配置和前端集成。

## 1. 数据库设置

### 1.1 执行数据库迁移

在 Supabase SQL 编辑器中执行以下脚本：

```sql
-- 执行 Backend/migrations/add_password_reset_tokens.sql
```

或者执行完整的架构文件：
```sql
-- 执行 Backend/migrations/supabase_schema.sql
```

### 1.2 验证表创建

确认以下表已创建：
- `password_reset_tokens` - 密码重置token表

## 2. 邮件服务配置

### 2.1 环境变量设置

在 `.env` 文件中添加邮件服务配置：

```env
# 邮件服务配置
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
MAIL_USE_TLS=true
MAIL_USE_SSL=false
```

### 2.2 Gmail 配置示例

如果使用 Gmail：

1. 启用两步验证
2. 生成应用专用密码
3. 使用应用密码作为 `MAIL_PASSWORD`

### 2.3 其他邮件服务

支持的邮件服务：
- Gmail: `smtp.gmail.com:587`
- Outlook: `smtp-mail.outlook.com:587`
- QQ邮箱: `smtp.qq.com:587`
- 163邮箱: `smtp.163.com:25`

## 3. API 端点

### 3.1 忘记密码

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

响应：
```json
{
  "success": true,
  "message": "如果该邮箱已注册，您将收到重置密码的邮件",
  "data": {}
}
```

### 3.2 重置密码

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "new_password_123"
}
```

响应：
```json
{
  "success": true,
  "message": "密码重置成功",
  "data": {}
}
```

## 4. 前端页面

### 4.1 已实现页面

- `/forgot-password` - 忘记密码页面
- `/reset-password` - 重置密码页面

### 4.2 URL 配置

在 Supabase 认证设置中添加以下 URL：

```
https://ticketradar.izlx.de/forgot-password
https://ticketradar.izlx.de/reset-password
```

## 5. 安全特性

### 5.1 Token 安全

- 使用 32 字节随机 token
- Token 哈希存储在数据库中
- 24 小时过期时间
- 一次性使用（使用后自动失效）

### 5.2 防护措施

- 不透露用户是否存在
- Token 验证使用时间安全比较
- 自动清理过期 token
- 重置后使所有旧 token 失效

## 6. 测试

### 6.1 运行测试脚本

```bash
cd Backend
python test_password_reset.py
```

### 6.2 手动测试流程

1. 访问 `/forgot-password` 页面
2. 输入注册邮箱
3. 检查邮箱收到重置邮件
4. 点击邮件中的重置链接
5. 在 `/reset-password` 页面输入新密码
6. 使用新密码登录验证

## 7. 故障排除

### 7.1 邮件发送失败

检查项目：
- SMTP 服务器配置
- 邮箱密码/应用密码
- 网络连接
- 防火墙设置

### 7.2 Token 验证失败

检查项目：
- Token 是否过期
- Token 是否已使用
- 数据库连接
- Token 格式是否正确

### 7.3 数据库错误

检查项目：
- Supabase 连接
- 表是否存在
- RLS 策略配置
- 权限设置

## 8. 监控和日志

### 8.1 关键日志

- 密码重置请求
- 邮件发送状态
- Token 使用情况
- 失败尝试

### 8.2 监控指标

- 重置请求频率
- 邮件发送成功率
- Token 使用率
- 异常错误率

## 9. 生产环境注意事项

### 9.1 安全配置

- 使用 HTTPS
- 配置 CORS
- 限制请求频率
- 监控异常活动

### 9.2 性能优化

- 定期清理过期 token
- 邮件发送队列
- 缓存配置
- 数据库索引

## 10. 维护

### 10.1 定期任务

- 清理过期 token
- 监控邮件发送状态
- 检查数据库性能
- 更新安全配置

### 10.2 备份策略

- 数据库备份
- 配置文件备份
- 日志归档
- 恢复测试
