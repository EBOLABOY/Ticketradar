# 🚀 Ticketradar 服务器安全更新指南

## 📋 更新概述

本次更新包含以下重要改进：
- ✅ 用户监控系统完善（独立推送逻辑）
- ✅ 数据库结构优化（新增黑名单字段）
- ✅ 推送功能增强（不受全局设置影响）
- ✅ 监控间隔优化（7分钟间隔）

## ⚠️ 重要提醒

**本次更新涉及数据库结构变更，请务必按照以下步骤操作，确保数据安全！**

## 🔧 安全更新步骤

### 1. 连接到服务器
```bash
ssh root@your-server-ip
cd /root/Ticketradar
```

### 2. 停止当前服务
```bash
docker-compose down
```

### 3. 备份当前数据（重要！）
```bash
# 备份整个项目目录
cp -r /root/Ticketradar /root/Ticketradar_backup_$(date +%Y%m%d_%H%M%S)

# 备份数据库文件
cp instance/ticketradar.db instance/ticketradar.db.backup_$(date +%Y%m%d_%H%M%S)
```

### 4. 拉取最新代码
```bash
git pull origin main
```

### 5. 运行数据库迁移脚本
```bash
python3 migrate_server_database.py
```

**预期输出：**
```
🚀 Ticketradar 服务器数据库迁移工具
==================================================
📊 找到数据库: instance/ticketradar.db
✅ 数据库已备份到: instance/ticketradar.db.backup_20250603_210000
✅ monitor_tasks表已存在
➕ 添加缺失的列: ['blacklist_cities', 'blacklist_countries', 'last_check', 'last_notification', 'total_checks', 'total_notifications']
   ✅ 添加列: blacklist_cities
   ✅ 添加列: blacklist_countries
   ✅ 添加列: last_check
   ✅ 添加列: last_notification
   ✅ 添加列: total_checks
   ✅ 添加列: total_notifications
✅ invitation_codes表已存在
✅ users表结构完整
🎉 数据库迁移完成！
```

### 6. 重新启动服务
```bash
docker-compose up -d
```

### 7. 验证服务状态
```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs -f --tail=50
```

## 🔍 验证更新成功

### 检查Web服务
```bash
curl -I http://localhost:38181
```
应该返回 `200 OK`

### 检查数据库结构
```bash
python3 -c "
import sqlite3
conn = sqlite3.connect('instance/ticketradar.db')
cursor = conn.cursor()
cursor.execute('PRAGMA table_info(monitor_tasks)')
columns = [row[1] for row in cursor.fetchall()]
print('monitor_tasks表字段:', columns)
cursor.execute('SELECT COUNT(*) FROM users')
user_count = cursor.fetchone()[0]
print(f'用户数量: {user_count}')
conn.close()
"
```

### 检查监控功能
登录Dashboard查看：
- 用户账户是否正常
- 监控任务是否正常
- 推送功能是否正常

## 🆘 故障恢复

如果更新过程中出现问题：

### 1. 恢复备份
```bash
# 停止服务
docker-compose down

# 恢复整个项目
rm -rf /root/Ticketradar
mv /root/Ticketradar_backup_* /root/Ticketradar

# 重新启动
cd /root/Ticketradar
docker-compose up -d
```

### 2. 仅恢复数据库
```bash
# 恢复数据库文件
cp instance/ticketradar.db.backup_* instance/ticketradar.db

# 重启服务
docker-compose restart
```

## 📊 更新后的新功能

### 1. 用户监控系统
- 每7分钟检查一次个人监控任务
- 独立的推送逻辑，不受全局设置影响
- 支持黑名单城市和国家过滤

### 2. 数据库优化
- 新增黑名单字段支持
- 监控统计信息记录
- 更完善的数据结构

### 3. 推送功能增强
- 个人推送和群组推送分离
- 更美观的HTML通知模板
- 推送失败重试机制

## 📞 技术支持

如果在更新过程中遇到问题，请：

1. **保留错误日志**
2. **不要删除备份文件**
3. **联系技术支持**

## ✅ 更新完成检查清单

- [ ] 服务器连接正常
- [ ] 代码更新完成
- [ ] 数据库迁移成功
- [ ] 服务重启正常
- [ ] Web界面可访问
- [ ] 用户登录正常
- [ ] 监控任务正常
- [ ] 推送功能正常
- [ ] 备份文件已保留

---

**祝您更新顺利！🎉**
