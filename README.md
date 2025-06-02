# 飞常惠 - 机票价格监控系统

一个自动化的机票价格监控系统，可以定期检查Trip.com上的机票价格，在发现低于设定阈值的境外机票时通过PushPlus推送通知，并提供美观的Web界面展示实时数据。

## 功能特点

- 每5分钟自动检测一次机票价格（用户监控任务每7分钟执行一次）
- 支持香港、广州、深圳、澳门四个始发地同时监控
- 筛选价格低于设定阈值的境外目的地
- 通过PushPlus推送低价机票通知，支持按始发地分组推送
- 避免重复推送同一目的地（除非价格更低或24小时后）
- 支持目的地白名单和黑名单
- 提供美观的Web界面（端口38181）展示境外目的地机票信息
- 系统启动时自动推送当前12个境外目的地信息


## 使用方法

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置.env文件

在项目根目录创建一个`.env`文件，内容如下：

```
# PushPlus配置
# 是否启用PushPlus推送（true/false）
ENABLE_PUSHPLUS=true
PUSHPLUS_TOKEN=你的PushPlus令牌
# 注意：系统会使用PushPlus的群组推送功能
# PushPlus群组编码设置（为空则使用个人推送）
PUSHPLUS_TOPIC_HKG=1
PUSHPLUS_TOPIC_CAN=2
PUSHPLUS_TOPIC_SZX=3
PUSHPLUS_TOPIC_MFM=4
# 请确保在PushPlus平台上已创建对应的群组

# 价格阈值设置（低于此价格的目的地会被推送）
PRICE_THRESHOLD=1000

# 检测间隔（分钟）
CHECK_INTERVAL=5

# 默认始发地设置（系统启动时首先显示的始发地）
# 可选值: HKG(香港), CAN(广州), SZX(深圳), MFM(澳门)
DEFAULT_DEPARTURE=HKG

# 行程类型（1=单程，2=往返）
TRIP_TYPE=2

# 行程日期
DEPART_DATE=2025-05-30
RETURN_DATE=2025-06-02

# 是否启用目的地白名单（true/false）
USE_WHITELIST=false
# 白名单目的地（以逗号分隔，例如：东京,大阪,首尔）
WHITELIST_DESTINATIONS=

# 是否启用目的地黑名单（true/false）
USE_BLACKLIST=false
# 黑名单目的地（以逗号分隔，例如：三亚,杭州,北京）
BLACKLIST_DESTINATIONS=
```

请将`PUSHPLUS_TOKEN`替换为你在[PushPlus官网](http://www.pushplus.plus/)获取的令牌。

### 3. 运行脚本

```bash
python main.py
```

脚本将立即执行一次检测，然后每5分钟自动执行一次。同时，Web页面将在38181端口上运行，您可以通过浏览器访问 http://localhost:38181 查看筛选结果。

### 4. 服务器部署

在服务器上部署时，可以使用以下方法让脚本在后台运行：

#### Windows服务器

直接运行Python脚本：

```batch
python main.py
```

#### Linux服务器

使用提供的启动和停止脚本：

```bash
# 添加执行权限
chmod +x start_monitor.sh stop_monitor.sh

# 启动系统
./start_monitor.sh

# 停止系统
./stop_monitor.sh
```

或者创建systemd服务以实现开机自启动。

## 通知规则

为了避免频繁收到不关注的目的地的通知，系统采用了以下策略：

1. 对于每个目的地，只有在以下情况才会发送通知：
   - 首次发现该目的地价格低于阈值
   - 上次通知后已经过了24小时
   - 价格比上次通知时更低

2. 可以通过白名单/黑名单进一步过滤目的地：
   - 启用白名单后，只有在白名单中的目的地才会被通知
   - 启用黑名单后，黑名单中的目的地将不会被通知

3. 系统使用PushPlus的群组推送功能，按始发地分组推送：
   - 香港始发地的通知会推送到`PUSHPLUS_TOPIC_HKG`指定的群组
   - 广州始发地的通知会推送到`PUSHPLUS_TOPIC_CAN`指定的群组
   - 深圳始发地的通知会推送到`PUSHPLUS_TOPIC_SZX`指定的群组
   - 澳门始发地的通知会推送到`PUSHPLUS_TOPIC_MFM`指定的群组
   - 如果某个始发地的群组编码设置为空，则使用个人推送
   - 请确保在PushPlus平台上已创建对应的群组
   - 可以通过设置`ENABLE_PUSHPLUS=false`来完全禁用推送功能

## 文件说明

- `main.py`: 主程序
- `.env`: 配置文件
- `requirements.txt`: 依赖列表
- `start_monitor.sh`: Linux启动脚本
- `stop_monitor.sh`: Linux停止脚本
- `notified_destinations.pkl`: 已通知目的地记录（自动生成）


- `templates/index.html`: Web页面模板
- `static/style.css`: Web页面样式

## 注意事项

- 请确保PushPlus令牌有效
- 脚本依赖Trip.com的API，如果API变更可能需要更新脚本
- 长时间运行可能需要定期更新headers和payload中的一些值
- Web页面默认运行在38181端口，如需更改，请修改main.py中的相关配置
- 在服务器上部署时，请确保38181端口已开放，或者修改为其他可用端口

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

[MIT License](LICENSE)
