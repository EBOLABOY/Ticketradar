# MCP服务架构设计

## 🏗️ 架构概览

我们的AI旅行规划师采用了统一的MCP（Model Context Protocol）服务管理架构，支持多个数据源的协调工作。

```
┌─────────────────────────────────────────────────────────────┐
│                    AI旅行规划师前端                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP API
┌─────────────────────▼───────────────────────────────────────┐
│                 FastAPI后端服务                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              MCP管理器 (mcp_manager.py)                 │ │
│  │  ┌─────────────┬─────────────┬─────────────────────────┐ │ │
│  │  │ 小红书MCP   │ 高德地图API │ 和风天气API             │ │ │
│  │  │ 服务        │ 服务        │ 服务                    │ │ │
│  │  └─────────────┴─────────────┴─────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           增强AI旅行规划器 (ai_travel_planner.py)       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 核心组件

### 1. MCP管理器 (`mcp_manager.py`)

**职责:**
- 统一管理多个MCP服务
- 提供服务注册和发现机制
- 处理服务调用和错误处理
- 支持服务状态监控

**主要功能:**
```python
class MCPManager:
    def register_service(config: MCPServiceConfig)     # 注册服务
    def start_service(service_name: str)               # 启动服务
    def stop_service(service_name: str)                # 停止服务
    def call_service(service_name, tool_name, **kwargs) # 调用服务
    def get_service_status()                           # 获取状态
```

### 2. 服务适配器

#### 小红书MCP服务
- **类型**: 外部MCP服务 (jobsonlook/xhs-mcp)
- **协议**: MCP标准协议
- **功能**: 搜索笔记、获取内容、获取评论
- **配置**: XHS_COOKIE

#### 高德地图API服务
- **类型**: 直接API调用
- **协议**: REST API
- **功能**: 地理编码、POI搜索、路线规划
- **配置**: AMAP_API_KEY

#### 和风天气API服务
- **类型**: 直接API调用
- **协议**: REST API
- **功能**: 实时天气、预报、生活指数、空气质量
- **配置**: WEATHER_API_KEY

## 📊 数据流架构

### 1. 请求处理流程

```
用户请求 → FastAPI路由 → 增强AI规划器 → MCP管理器 → 各服务适配器
    ↓
AI服务整合 ← 数据整合 ← 并行调用 ← 服务响应
    ↓
返回结果
```

### 2. 并行数据获取

```python
# 并行获取各种数据
tasks = [
    self._get_xiaohongshu_data(destination),
    self._get_map_data(destination, origin_city),
    self._get_weather_data(destination, depart_date),
]

xhs_data, map_data, weather_data = await asyncio.gather(*tasks)
```

### 3. 数据整合策略

- **小红书数据**: 提供真实用户体验和旅行笔记
- **地图数据**: 提供POI信息、路线规划、地理位置
- **天气数据**: 提供天气预报、生活指数、空气质量
- **AI整合**: 基于多数据源生成个性化旅行规划

## 🔄 服务生命周期

### 1. 服务注册
```python
# 注册小红书MCP服务
xhs_config = MCPServiceConfig(
    name="xhs-mcp",
    service_type=MCPServiceType.XHS,
    command=["uv", "run", "main.py"],
    env={"XHS_COOKIE": os.getenv("XHS_COOKIE", "")},
    working_dir="./mcp_services/xhs-mcp"
)
mcp_manager.register_service(xhs_config)
```

### 2. 服务启动
- 按需启动：首次调用时自动启动
- 进程管理：使用subprocess管理外部服务
- 健康检查：定期检查服务状态

### 3. 服务调用
```python
# 统一的服务调用接口
result = await mcp_manager.call_service(
    service_name="xhs-mcp",
    tool_name="search_notes",
    keyword="东京旅行"
)
```

### 4. 错误处理
- **降级策略**: 某个服务不可用时，系统仍能正常工作
- **重试机制**: 自动重试失败的请求
- **错误日志**: 详细记录错误信息用于调试

## 🛡️ 容错设计

### 1. 服务隔离
- 每个服务独立运行，互不影响
- 单个服务故障不影响整体系统

### 2. 降级策略
```python
# 小红书数据获取失败时的降级
if not xhs_data.get("success"):
    logger.warning("小红书数据不可用，使用常识生成规划")
    # 系统仍能基于地图和天气数据生成规划
```

### 3. 超时控制
- API调用设置合理超时时间
- 避免长时间等待影响用户体验

## 📈 性能优化

### 1. 并行处理
- 同时调用多个服务，减少总响应时间
- 使用asyncio实现异步并发

### 2. 缓存策略
- 对频繁查询的数据进行缓存
- 减少API调用次数和成本

### 3. 连接池
- 复用HTTP连接
- 减少连接建立开销

## 🔧 配置管理

### 1. 环境变量
```bash
# .env文件配置
AMAP_API_KEY=your_amap_key
WEATHER_API_KEY=your_weather_key
XHS_COOKIE=your_xhs_cookie
```

### 2. 配置验证
```python
# 配置完整性检查
validation = MCPConfig.validate_config()
if not validation['valid']:
    logger.warning(f"配置不完整: {validation['issues']}")
```

### 3. 动态配置
- 支持运行时修改配置
- 无需重启服务即可生效

## 🧪 测试策略

### 1. 单元测试
- 每个服务适配器独立测试
- 模拟各种异常情况

### 2. 集成测试
- 测试服务间协调工作
- 验证数据整合效果

### 3. 端到端测试
- 完整的用户场景测试
- 性能和稳定性验证

## 🚀 扩展性设计

### 1. 新服务接入
```python
# 添加新的MCP服务只需实现适配器
class NewServiceAdapter:
    async def call_service(self, tool_name, **kwargs):
        # 实现具体的服务调用逻辑
        pass
```

### 2. 插件化架构
- 支持动态加载新的服务插件
- 标准化的服务接口

### 3. 配置驱动
- 通过配置文件控制服务行为
- 支持A/B测试和灰度发布

## 📋 最佳实践

1. **服务设计**: 保持服务的单一职责和松耦合
2. **错误处理**: 实现完善的错误处理和降级机制
3. **监控告警**: 建立服务监控和告警机制
4. **文档维护**: 保持API文档和架构文档的更新
5. **安全考虑**: 保护API密钥和敏感信息
