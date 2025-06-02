# 🍪 受信任Cookie导出指南

## 📋 **操作步骤**

### 第一步：在正常浏览器中建立受信任会话

1. **清理浏览器状态**
   - 打开Chrome/Edge浏览器（正常模式，非无痕）
   - 按 `Ctrl+Shift+Delete` 清除 `hk.trip.com` 的所有Cookie和缓存
   - 或者在开发者工具中：`F12` → `Application` → `Storage` → `Clear storage`

2. **建立受信任会话**
   - 访问 `https://hk.trip.com/flights/?locale=zh-HK&curr=CNY`
   - 完成一次**完整的航班搜索**：
     - 输入出发地：上海 (SHA)
     - 输入目的地：首尔 (SEL)  
     - 选择日期：2025-06-30
     - 点击搜索
     - **确保搜索成功，看到航班列表，没有出现任何验证码**

3. **验证会话状态**
   - 确认页面正常显示航班信息
   - 没有出现"尝试次数过多"或验证码
   - 此时浏览器已建立受信任会话

### 第二步：导出Cookie

#### 方法一：使用浏览器扩展（推荐）

1. **安装Cookie扩展**
   - Chrome: 安装 "EditThisCookie" 或 "Get cookies.txt"
   - Edge: 安装 "EditThisCookie"

2. **导出Cookie**
   - 在 `hk.trip.com` 页面上点击扩展图标
   - 选择 "Export" → "JSON格式"
   - 保存为 `trusted_cookies.json`

#### 方法二：使用开发者工具

1. **打开开发者工具**
   - 按 `F12` 或右键 → "检查"
   - 切换到 `Application` 标签页

2. **导出Cookie**
   - 左侧选择 `Storage` → `Cookies` → `https://hk.trip.com`
   - 右键Cookie列表 → "Copy all as JSON" (如果有此选项)
   - 或者手动复制重要Cookie

3. **手动复制关键Cookie**
   如果没有批量导出选项，请手动复制这些关键Cookie：
   ```json
   [
     {
       "name": "GUID",
       "value": "复制实际值",
       "domain": ".trip.com",
       "path": "/",
       "secure": false,
       "httpOnly": false
     },
     {
       "name": "_bfa", 
       "value": "复制实际值",
       "domain": ".trip.com",
       "path": "/",
       "secure": false,
       "httpOnly": false
     },
     {
       "name": "UBT_VID",
       "value": "复制实际值", 
       "domain": ".trip.com",
       "path": "/",
       "secure": false,
       "httpOnly": false
     },
     {
       "name": "bm_s",
       "value": "复制实际值",
       "domain": ".trip.com", 
       "path": "/",
       "secure": false,
       "httpOnly": false
     },
     {
       "name": "bm_so",
       "value": "复制实际值",
       "domain": ".trip.com",
       "path": "/", 
       "secure": false,
       "httpOnly": false
     },
     {
       "name": "_combined",
       "value": "复制实际值",
       "domain": ".trip.com",
       "path": "/",
       "secure": false, 
       "httpOnly": false
     }
   ]
   ```

### 第三步：保存Cookie文件

1. **保存位置**
   - 将导出的Cookie保存为 `trusted_cookies.json`
   - 放在Python脚本同一目录下

2. **验证格式**
   - 确保是有效的JSON格式
   - 包含 `name`, `value`, `domain` 等字段
   - 特别确保包含关键Cookie：`_bfa`, `UBT_VID`, `GUID`, `bm_s`, `bm_so`

## 🎯 **关键Cookie说明**

| Cookie名称 | 作用 | 重要性 |
|-----------|------|--------|
| `_bfa` | Akamai反机器人，包含SID/PVID | ⭐⭐⭐⭐⭐ |
| `UBT_VID` | 用户行为跟踪ID | ⭐⭐⭐⭐ |
| `GUID` | 全局唯一标识符 | ⭐⭐⭐⭐ |
| `bm_s`, `bm_so` | Akamai Bot Manager | ⭐⭐⭐⭐ |
| `_combined` | 包含transaction_id和page_id | ⭐⭐⭐ |
| `ibu_country` | 地区设置 | ⭐⭐ |
| `ibulanguage` | 语言设置 | ⭐⭐ |

## ⚠️ **注意事项**

1. **时效性**
   - Cookie有过期时间，通常需要定期更新
   - 建议每天或每次使用前重新导出

2. **一致性**
   - 导出Cookie后立即使用，不要间隔太久
   - 确保Cookie与当前会话状态匹配

3. **安全性**
   - Cookie包含敏感信息，不要分享给他人
   - 定期更换以保证安全

## 🚀 **使用方法**

导出Cookie后，运行以下代码测试：

```python
from trusted_cookies_manager import TrustedCookiesManager

# 创建受信任Cookie管理器
manager = TrustedCookiesManager("trusted_cookies.json")

# 创建受信任session
session = manager.create_trusted_session()

# 获取最新token和上下文
context = manager.get_fresh_token_and_context(
    "https://hk.trip.com/flights/showfarefirst?dcity=sha&acity=sel&ddate=2025-06-30&triptype=ow&class=y"
)

if context and context.get('token'):
    print("🎉 受信任Cookie加载成功！")
    print(f"Token: {context['token'][:50]}...")
else:
    print("❌ 需要重新导出Cookie")
```

## 🔧 **故障排除**

1. **Cookie加载失败**
   - 检查JSON格式是否正确
   - 确认文件路径和名称
   - 验证Cookie是否过期

2. **仍然出现验证**
   - 重新在正常浏览器中建立受信任会话
   - 确保导出了所有关键Cookie
   - 检查Cookie的domain和path设置

3. **Token提取失败**
   - 确认使用受信任session访问referer页面
   - 检查页面是否正常加载
   - 验证token提取的正则表达式
