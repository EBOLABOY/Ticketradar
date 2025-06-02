# 🔒 Ticketradar 安全配置指南

## ⚠️ 重要安全提醒

### 1. 立即修改默认密码
系统默认管理员账户：
- **用户名**: `admin`
- **密码**: `admin123`

**🚨 首次登录后请立即修改密码！**

### 2. 生成强随机SECRET_KEY
在 `.env` 文件中设置强随机密钥：

```bash
# 生成随机密钥的方法：
python -c "import secrets; print(secrets.token_hex(32))"
```

将生成的密钥设置到 `.env` 文件：
```env
SECRET_KEY=your-generated-random-key-here
```

### 3. 数据库安全
- 定期备份 `ticketradar.db` 文件
- 确保数据库文件权限正确（仅应用可读写）
- 生产环境建议使用PostgreSQL或MySQL

### 4. 邀请码管理
- 定期清理过期的邀请码
- 设置合理的邀请码过期时间
- 监控邀请码使用情况

### 5. 网络安全
- 生产环境使用HTTPS
- 配置防火墙限制访问
- 使用反向代理（如Nginx）

### 6. 环境变量安全
- 不要将 `.env` 文件提交到版本控制
- 生产环境使用环境变量而非文件
- 定期轮换敏感令牌

## 🛡️ 生产环境部署建议

### 1. 使用专用用户运行
```bash
# 创建专用用户
sudo useradd -r -s /bin/false ticketradar

# 设置文件权限
sudo chown -R ticketradar:ticketradar /path/to/ticketradar
sudo chmod 750 /path/to/ticketradar
sudo chmod 600 /path/to/ticketradar/.env
```

### 2. 使用systemd服务
创建 `/etc/systemd/system/ticketradar.service`：
```ini
[Unit]
Description=Ticketradar Flight Monitor
After=network.target

[Service]
Type=simple
User=ticketradar
WorkingDirectory=/path/to/ticketradar
ExecStart=/path/to/ticketradar/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3. 配置日志轮转
创建 `/etc/logrotate.d/ticketradar`：
```
/var/log/ticketradar/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ticketradar ticketradar
}
```

## 🔍 安全检查清单

- [ ] 已修改默认管理员密码
- [ ] 已设置强随机SECRET_KEY
- [ ] 已配置.env文件权限（600）
- [ ] 已备份数据库文件
- [ ] 已设置防火墙规则
- [ ] 已配置HTTPS（生产环境）
- [ ] 已设置日志轮转
- [ ] 已创建专用运行用户
- [ ] 已配置systemd服务
- [ ] 已测试备份恢复流程

## 🚨 安全事件响应

如果发现安全问题：

1. **立即行动**
   - 停止服务
   - 检查日志文件
   - 评估影响范围

2. **修复措施**
   - 修改所有密码
   - 重新生成SECRET_KEY
   - 清理可疑数据

3. **预防措施**
   - 更新系统和依赖
   - 加强监控
   - 审查配置

## 📞 联系方式

如发现安全漏洞，请通过以下方式报告：
- 创建GitHub Issue（非敏感信息）
- 发送邮件（敏感安全问题）

---

**记住：安全是一个持续的过程，不是一次性的设置！**
