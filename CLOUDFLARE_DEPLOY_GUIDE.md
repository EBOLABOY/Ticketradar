# ☁️ Ticketradar + Cloudflare 部署指南

## 🌐 域名：ticketradar.izlx.me

本指南专门针对使用Cloudflare灵活SSL模式的部署配置。

## 📋 Cloudflare配置

### 1. DNS设置
在Cloudflare控制台配置：

```
类型: A
名称: ticketradar
内容: your-server-ip
代理状态: 已代理（橙色云朵）
TTL: 自动
```

### 2. SSL/TLS设置
- **加密模式**: 灵活 (Flexible)
- **最低TLS版本**: 1.2
- **机会性加密**: 开启
- **TLS 1.3**: 开启
- **自动HTTPS重写**: 开启
- **始终使用HTTPS**: 开启

### 3. 安全设置
- **安全级别**: 中等
- **质询通道**: 自动
- **浏览器完整性检查**: 开启
- **隐私通道**: 开启

### 4. 速度优化
- **Auto Minify**: 开启 (JavaScript, CSS, HTML)
- **Brotli**: 开启
- **早期提示**: 开启

## 🐳 Docker部署步骤

### 快速部署
```bash
# 1. 克隆项目
git clone https://github.com/EBOLABOY/Ticketradar.git
cd Ticketradar

# 2. 运行部署脚本
chmod +x docker-deploy.sh
./docker-deploy.sh

# 3. 选择生产模式（应用 + Nginx）
# 当询问域名时，选择使用默认域名 ticketradar.izlx.me
```

### 手动部署
```bash
# 1. 启动服务（生产模式）
docker-compose --profile nginx up -d

# 2. 验证服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f
```

## 🔧 配置详情

### Nginx配置特点
- ✅ 配置了Cloudflare真实IP获取
- ✅ 支持CF-Connecting-IP头部
- ✅ 正确处理X-Forwarded-Proto
- ✅ 优化了CORS设置
- ✅ 无需本地SSL证书

### 环境变量
```env
EXTERNAL_DOMAIN=ticketradar.izlx.me
USE_HTTPS=false  # Cloudflare处理HTTPS
SERVER_HOST=0.0.0.0
SERVER_PORT=38181
```

### 端口映射
- **应用**: 38181 (内部)
- **Nginx**: 80 (外部访问)
- **Cloudflare**: 443 (HTTPS) → 80 (HTTP)

## 🌍 访问地址

### 外部访问
- **HTTPS**: https://ticketradar.izlx.me (推荐)
- **HTTP**: http://ticketradar.izlx.me (自动重定向到HTTPS)

### 内部访问
- **直接访问**: http://your-server-ip:38181
- **Nginx代理**: http://your-server-ip

### 管理员账户
- **用户名**: 1242772513@qq.com
- **密码**: 1242772513

## 🔍 验证部署

### 1. 检查容器状态
```bash
docker-compose ps
```

### 2. 测试本地访问
```bash
# 测试应用直接访问
curl -I http://localhost:38181

# 测试Nginx代理
curl -I http://localhost

# 测试健康检查
curl http://localhost/health
```

### 3. 测试外部访问
```bash
# 测试域名解析
nslookup ticketradar.izlx.me

# 测试HTTPS访问
curl -I https://ticketradar.izlx.me

# 测试API接口
curl https://ticketradar.izlx.me/api/flights
```

### 4. 检查Cloudflare头部
```bash
curl -H "CF-Connecting-IP: 1.2.3.4" \
     -H "X-Forwarded-Proto: https" \
     http://localhost/
```

## 📊 监控和日志

### 查看日志
```bash
# 应用日志
docker-compose logs -f ticketradar

# Nginx日志
docker-compose logs -f nginx

# 实时监控
docker stats
```

### 性能监控
```bash
# 检查响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://ticketradar.izlx.me

# curl-format.txt 内容：
#     time_namelookup:  %{time_namelookup}\n
#        time_connect:  %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#    time_pretransfer:  %{time_pretransfer}\n
#       time_redirect:  %{time_redirect}\n
#  time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#          time_total:  %{time_total}\n
```

## 🔧 故障排除

### 常见问题

1. **502 Bad Gateway**
```bash
# 检查后端服务
docker-compose logs ticketradar

# 检查网络连接
docker-compose exec nginx ping ticketradar
```

2. **SSL证书错误**
```bash
# 检查Cloudflare SSL设置
# 确保使用"灵活"模式，不是"完全"模式
```

3. **真实IP获取失败**
```bash
# 检查Nginx配置
docker-compose exec nginx nginx -t

# 重新加载配置
docker-compose restart nginx
```

4. **CORS错误**
```bash
# 检查API响应头
curl -I https://ticketradar.izlx.me/api/flights

# 应该包含：
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### 调试命令
```bash
# 进入Nginx容器
docker-compose exec nginx sh

# 查看Nginx配置
docker-compose exec nginx cat /etc/nginx/nginx.conf

# 测试Nginx配置
docker-compose exec nginx nginx -t

# 重新加载Nginx
docker-compose exec nginx nginx -s reload
```

## 🚀 优化建议

### Cloudflare优化
1. **缓存规则**: 设置静态资源缓存
2. **页面规则**: 配置缓存级别
3. **Workers**: 可选的边缘计算
4. **Argo**: 智能路由优化

### 服务器优化
```bash
# 启用HTTP/2
# 已在nginx.conf中配置

# 启用Gzip压缩
# 已在nginx.conf中配置

# 设置缓存头部
# 已为静态文件配置
```

### 监控设置
```bash
# 设置Cloudflare Analytics
# 在Cloudflare控制台查看流量统计

# 设置健康检查
# 使用 /health 端点进行监控
```

## 📈 扩展配置

### 多实例部署
```yaml
# docker-compose.yml 扩展
services:
  ticketradar-1:
    build: .
    container_name: ticketradar-app-1
    # ... 其他配置

  ticketradar-2:
    build: .
    container_name: ticketradar-app-2
    # ... 其他配置

  nginx:
    # 负载均衡配置
    # upstream 中添加多个后端
```

### 数据库分离
```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ticketradar
      POSTGRES_USER: ticketradar
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ticketradar:
    environment:
      DATABASE_URL: postgresql://ticketradar:your-password@postgres:5432/ticketradar
```

## 🎯 生产环境检查清单

- ✅ Cloudflare DNS配置正确
- ✅ SSL模式设置为"灵活"
- ✅ Docker容器正常运行
- ✅ Nginx代理配置正确
- ✅ 真实IP获取正常
- ✅ CORS头部配置正确
- ✅ 健康检查端点可访问
- ✅ 日志记录正常
- ✅ 监控告警设置
- ✅ 备份策略配置

## 📞 技术支持

### 访问测试
- **主域名**: https://ticketradar.izlx.me
- **健康检查**: https://ticketradar.izlx.me/health
- **API测试**: https://ticketradar.izlx.me/api/flights

### 联系方式
- **微信**: Xinx--1996
- **GitHub**: https://github.com/EBOLABOY/Ticketradar

---

**🎉 恭喜！您的Ticketradar系统已通过Cloudflare成功部署！**

现在您可以通过 https://ticketradar.izlx.me 访问您的机票监控系统了！
