# 高德地图API集成指南

## 📋 申请高德地图API Key

### 1. 注册账号
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 点击右上角"注册"或"登录"
3. 完成账号注册和实名认证

### 2. 创建应用
1. 登录后进入 [控制台](https://console.amap.com/)
2. 点击"应用管理" -> "我的应用"
3. 点击"创建新应用"
4. 填写应用信息：
   - 应用名称：AI旅行规划师
   - 应用类型：Web服务
   - 应用描述：基于AI的智能旅行规划系统

### 3. 添加Key
1. 在应用详情页点击"添加Key"
2. 选择服务平台：Web服务
3. 填写Key名称：travel-planner-api
4. 复制生成的API Key

### 4. 配置Key
将API Key添加到环境变量：

```bash
# 方式1: 添加到 .env 文件
echo "AMAP_API_KEY=your_api_key_here" >> Backend/.env

# 方式2: 设置环境变量
export AMAP_API_KEY="your_api_key_here"
```

## 🔧 API功能说明

### 地理编码
- **功能**: 地址转坐标
- **用途**: 将城市名转换为经纬度坐标
- **限制**: 每日免费调用5000次

### POI搜索
- **功能**: 兴趣点搜索
- **用途**: 搜索景点、餐厅、酒店等
- **限制**: 每日免费调用5000次

### 路线规划
- **功能**: 驾车路线规划
- **用途**: 计算两地间的行车路线和时间
- **限制**: 每日免费调用5000次

### 天气查询
- **功能**: 天气预报
- **用途**: 获取目的地天气信息
- **限制**: 每日免费调用1000次

## 📊 配额管理

### 免费配额
- 地理编码：5000次/天
- POI搜索：5000次/天
- 路线规划：5000次/天
- 天气查询：1000次/天

### 付费套餐
如需更高配额，可购买付费套餐：
- 基础版：10万次/月，￥100/月
- 标准版：50万次/月，￥500/月
- 企业版：200万次/月，￥2000/月

## 🧪 测试API

使用以下命令测试API是否正常工作：

```bash
# 测试地理编码
curl "https://restapi.amap.com/v3/geocode/geo?key=YOUR_KEY&address=北京市"

# 测试POI搜索
curl "https://restapi.amap.com/v3/place/text?key=YOUR_KEY&keywords=景点&city=北京"

# 测试天气查询
curl "https://restapi.amap.com/v3/weather/weatherInfo?key=YOUR_KEY&city=110101"
```

## ⚠️ 注意事项

1. **Key安全**: 不要将API Key提交到代码仓库
2. **配额监控**: 定期检查API调用量，避免超限
3. **错误处理**: 实现完善的错误处理和重试机制
4. **缓存策略**: 对频繁查询的数据进行缓存

## 🔗 相关链接

- [高德开放平台](https://lbs.amap.com/)
- [API文档](https://lbs.amap.com/api/)
- [控制台](https://console.amap.com/)
- [价格说明](https://lbs.amap.com/pricing)
