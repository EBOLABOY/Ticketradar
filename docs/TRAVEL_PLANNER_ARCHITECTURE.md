# 旅行计划生成器架构设计

## 🎯 项目目标

将现有的对话式AI旅行页面改造为结构化的旅行计划生成器，具备以下特性：
- 丰富的预设选择框，减少用户输入负担
- 结合MCP工具和AI生成详细旅行计划
- 生成可分享的独立旅行计划页面
- 支持旅行计划管理和收藏

## 🏗️ 系统架构

### 1. 前端架构

#### 1.1 页面结构
```
/ai-travel                    # 主要旅行计划生成页面
├── TravelPlannerForm         # 结构化表单组件
├── PlanGenerationProgress    # 生成进度组件
└── PlanPreview              # 计划预览组件

/travel-plan/:planId         # 可分享的旅行计划页面
├── SharedTravelPlan         # 公开访问的计划展示
├── PlanHeader              # 计划头部信息
├── PlanContent             # 计划详细内容
└── SocialShare             # 社交分享组件

/my-travel-plans            # 用户的旅行计划管理页面
├── PlansList               # 计划列表
├── PlanCard                # 计划卡片
└── PlanActions             # 计划操作（编辑/删除/分享）
```

#### 1.2 表单设计（结构化输入）
```javascript
const formStructure = {
  // 基本信息
  basic: {
    destination: "目的地（支持自动补全）",
    originCity: "出发城市",
    departDate: "出发日期",
    returnDate: "返程日期",
    days: "旅行天数",
    peopleCount: "人数"
  },
  
  // 预算和住宿
  budget: {
    budgetRange: ["经济型(<3000)", "舒适型(3000-8000)", "豪华型(>8000)"],
    accommodation: ["酒店", "民宿", "青旅", "度假村", "不限"]
  },
  
  // 交通偏好
  transportation: {
    flightClass: ["经济舱", "商务舱", "头等舱"],
    localTransport: ["公共交通", "出租车", "租车", "包车", "步行+公交"]
  },
  
  // 旅行偏好
  preferences: {
    travelType: ["休闲度假", "文化探索", "美食之旅", "购物天堂", "自然风光", "冒险刺激"],
    activityTypes: ["观光游览", "户外运动", "文化体验", "美食探索", "购物娱乐", "放松休闲"],
    timePreference: ["早起型", "夜猫子型", "随性安排"],
    pacePreference: ["紧凑行程", "悠闲节奏", "混合安排"]
  },
  
  // 餐饮偏好
  dining: {
    cuisineTypes: ["当地特色", "中餐", "西餐", "日韩料理", "东南亚菜", "素食"],
    diningBudget: ["街边小吃", "中档餐厅", "高档餐厅", "米其林餐厅"],
    dietaryRestrictions: ["无限制", "素食", "清真", "无麸质", "其他"]
  },
  
  // 特殊需求
  special: {
    accessibility: ["无障碍需求", "老人友好", "儿童友好", "宠物友好"],
    interests: ["历史文化", "艺术博物馆", "自然景观", "现代建筑", "夜生活", "购物"],
    language: ["中文服务", "英文服务", "当地语言", "不限"]
  }
}
```

### 2. 后端架构

#### 2.1 数据库模型
```python
class TravelPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # 基本信息
    title = db.Column(db.String(200), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    origin_city = db.Column(db.String(100))
    depart_date = db.Column(db.Date)
    return_date = db.Column(db.Date)
    days = db.Column(db.Integer)
    people_count = db.Column(db.Integer)
    
    # 表单数据（JSON格式存储）
    form_data = db.Column(db.JSON)
    
    # 生成的计划内容
    plan_content = db.Column(db.Text)
    plan_data = db.Column(db.JSON)  # 结构化计划数据
    
    # MCP数据源信息
    data_sources = db.Column(db.JSON)
    
    # 分享设置
    is_public = db.Column(db.Boolean, default=False)
    share_token = db.Column(db.String(32), unique=True)
    share_expires_at = db.Column(db.DateTime)
    
    # 元数据
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 统计信息
    view_count = db.Column(db.Integer, default=0)
    like_count = db.Column(db.Integer, default=0)
```

#### 2.2 API端点设计
```python
# 旅行计划CRUD
POST   /travel/api/plans                    # 创建旅行计划
GET    /travel/api/plans                    # 获取用户的旅行计划列表
GET    /travel/api/plans/:id               # 获取特定旅行计划
PUT    /travel/api/plans/:id               # 更新旅行计划
DELETE /travel/api/plans/:id               # 删除旅行计划

# 分享功能
POST   /travel/api/plans/:id/share         # 生成分享链接
GET    /travel/api/shared/:token           # 获取公开分享的计划（无需认证）
POST   /travel/api/shared/:token/view      # 记录访问统计

# 增强的计划生成
POST   /travel/api/generate-structured-plan # 基于结构化表单生成计划
```

### 3. MCP工具集成增强

#### 3.1 扩展MCP工具调用
```python
# 现有工具
search_flights      # 航班搜索
search_hotels       # 酒店搜索  
get_place_info      # 地点信息
get_weather         # 天气信息
get_attraction_reviews # 景点评价
convert_currency    # 货币转换
generate_map        # 地图生成
get_transportation  # 交通信息
get_local_info      # 本地信息
get_visa_requirements # 签证要求
get_shopping_guide  # 购物指南

# 新增工具调用
get_restaurant_recommendations  # 餐厅推荐
get_cultural_events           # 文化活动
get_safety_information        # 安全信息
get_local_customs            # 当地习俗
get_emergency_contacts       # 紧急联系方式
```

#### 3.2 数据整合策略
```python
async def generate_comprehensive_plan(form_data):
    """基于结构化表单数据生成综合旅行计划"""
    
    # 1. 并行调用多个MCP工具
    tasks = [
        get_destination_info(form_data.destination),
        get_weather_forecast(form_data.destination, form_data.dates),
        search_accommodations(form_data),
        get_transportation_options(form_data),
        get_attraction_recommendations(form_data),
        get_restaurant_recommendations(form_data),
        get_cultural_events(form_data),
        get_safety_and_visa_info(form_data)
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # 2. 数据清洗和整合
    integrated_data = integrate_mcp_results(results)
    
    # 3. AI生成个性化计划
    travel_plan = await ai_service.generate_structured_plan(
        form_data=form_data,
        mcp_data=integrated_data
    )
    
    return travel_plan
```

### 4. 路由设计

#### 4.1 前端路由
```javascript
// 新增路由
{
  path: '/travel-plan/:planId',
  component: SharedTravelPlan,
  meta: { requiresAuth: false, title: '旅行计划' }
},
{
  path: '/my-travel-plans', 
  component: MyTravelPlans,
  meta: { requiresAuth: true, title: '我的旅行计划' }
}
```

#### 4.2 分享链接格式
```
https://yourdomain.com/travel-plan/abc123def456
- abc123def456: 32位随机分享token
- 支持设置过期时间
- 支持访问统计
```

## 🔄 实现流程

### 阶段1：数据库和后端API
1. 创建TravelPlan数据库模型
2. 实现旅行计划CRUD API
3. 实现分享功能API
4. 数据库迁移

### 阶段2：增强表单和MCP集成
1. 扩展EnhancedTravelPlanner组件
2. 添加更多结构化输入选项
3. 优化MCP工具调用和数据整合
4. 改进AI计划生成逻辑

### 阶段3：分享页面和管理功能
1. 创建SharedTravelPlan组件
2. 实现旅行计划管理页面
3. 添加社交分享功能
4. 优化移动端体验

### 阶段4：测试和优化
1. 端到端功能测试
2. 性能优化
3. 用户体验改进
4. 错误处理完善

## 📱 用户体验流程

1. **计划创建**：用户填写结构化表单 → 系统调用MCP工具收集数据 → AI生成个性化计划
2. **计划保存**：自动保存到用户账户 → 生成唯一计划ID
3. **计划分享**：用户选择分享 → 生成公开访问链接 → 他人可无需登录查看
4. **计划管理**：用户可查看、编辑、删除自己的所有计划

这个架构设计确保了系统的可扩展性、用户友好性和功能完整性。
