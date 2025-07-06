# 监控系统Trip.com API集成文档

## 概述

监控系统已修改为专门使用Trip.com API，不再依赖smart-flights库。这样可以避免smart-flights相关的错误，并确保监控系统的稳定性。

## 主要修改

### 1. 监控服务修改

**文件**: `Backend/fastapi_app/services/monitor_service.py`

#### 修改内容：

1. **航班搜索方法替换**
   ```python
   # 原来使用 smart-flights
   search_result = await self.flight_service.search_flights(...)
   
   # 现在使用 Trip.com API
   flights = await self.flight_service.fetch_trip_flights(...)
   ```

2. **价格提取逻辑优化**
   ```python
   def _extract_flight_price(self, flight: Dict[str, Any]) -> float:
       # 支持Trip.com的中文和英文字段
       # 1. 中文字段: '价格'
       # 2. 英文字段: 'price'
       # 3. smart-flights格式兼容
   ```

### 2. 数据格式适配

#### Trip.com API返回格式：
```json
{
    "目的地": "东京",
    "代码": "NRT",
    "国家": "日本",
    "价格": 2500,
    "货币": "CNY",
    "出发日期": "2025-09-30",
    "返程日期": "2025-10-08",
    "destination": "Tokyo",
    "destination_code": "NRT",
    "country": "Japan",
    "price": 2500,
    "currency": "CNY"
}
```

#### 价格提取优先级：
1. `'价格'` (Trip.com中文字段)
2. `'price'` (Trip.com英文字段或smart-flights格式)
3. 其他价格字段 (`'Price'`, `'amount'`, `'cost'`)

## 功能特性

### 1. 双语支持
- 支持中文字段 (`'价格'`, `'目的地'`, `'国家'`)
- 支持英文字段 (`'price'`, `'destination'`, `'country'`)
- 自动适配不同数据格式

### 2. 错误处理
- 价格提取失败时返回 `float('inf')`
- 详细的错误日志记录
- 优雅的异常处理

### 3. 兼容性
- 保持与现有通知系统的兼容性
- 支持原有的价格阈值过滤
- 维持相同的API接口

## 测试

### 运行测试脚本
```bash
cd Backend
python test_monitor_trip.py
```

### 测试内容
1. **Trip.com API直接调用测试**
   - 验证API连接
   - 检查数据格式
   - 确认返回结果

2. **监控服务集成测试**
   - 测试完整的监控流程
   - 验证价格过滤逻辑
   - 检查执行时间

3. **价格提取测试**
   - 测试不同数据格式
   - 验证提取逻辑
   - 确认错误处理

## 配置要求

### 环境变量
确保以下环境变量已配置：
```env
# Trip.com API相关配置已内置在代码中
# 无需额外配置
```

### 依赖项
- 移除对smart-flights的依赖
- 仅需要标准的HTTP请求库

## 监控任务配置

### 任务字段
```json
{
    "departure_code": "HKG",      // 出发机场代码
    "destination_code": "NRT",    // 目的地机场代码 (可选)
    "depart_date": "2025-09-30",  // 出发日期
    "return_date": "2025-10-08",  // 返程日期 (可选)
    "price_threshold": 3000.0,    // 价格阈值
    "notification_enabled": true   // 是否启用通知
}
```

### 搜索逻辑
1. **指定目的地**: 直接搜索特定路线
2. **无目的地**: 搜索热门目的地列表

## 性能优化

### 1. 缓存机制
- Trip.com API结果可以缓存
- 减少重复请求
- 提高响应速度

### 2. 并发控制
- 限制同时进行的API请求数量
- 避免触发API限制
- 确保系统稳定性

### 3. 错误重试
- API请求失败时自动重试
- 指数退避策略
- 最大重试次数限制

## 日志记录

### 关键日志点
1. **API调用开始/结束**
2. **数据解析结果**
3. **价格过滤统计**
4. **错误和异常**

### 日志级别
- `INFO`: 正常操作流程
- `WARNING`: 非致命错误
- `ERROR`: 严重错误和异常

## 故障排除

### 常见问题

1. **API请求失败**
   - 检查网络连接
   - 验证请求参数
   - 查看API响应状态

2. **价格提取失败**
   - 检查数据格式
   - 验证字段名称
   - 查看错误日志

3. **监控任务执行失败**
   - 检查任务配置
   - 验证日期格式
   - 确认机场代码有效性

### 调试步骤
1. 运行测试脚本
2. 检查日志输出
3. 验证API响应
4. 确认数据格式

## 未来改进

### 1. 性能优化
- 实现请求池
- 添加响应缓存
- 优化数据处理

### 2. 功能扩展
- 支持更多搜索参数
- 添加价格趋势分析
- 实现智能推荐

### 3. 监控增强
- 添加API健康检查
- 实现性能指标收集
- 增强错误报告

## 总结

监控系统现在完全使用Trip.com API，提供了：
- 更稳定的数据源
- 更好的错误处理
- 更清晰的数据格式
- 更高的可维护性

这个修改解决了之前smart-flights库导致的 `'tuple' object has no attribute 'duration'` 错误，确保监控系统的稳定运行。
