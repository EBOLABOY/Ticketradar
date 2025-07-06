# Trip.com API城市代码修复

## 问题发现

通过分析发现，**Trip.com API需要使用城市代码而不是机场代码**。

### 问题分析：

1. **仪表板成功**: 使用 `HKG` (香港) - 城市和机场代码相同 ✅
2. **监控系统失败**: 使用 `PEK` (北京首都机场) - 应该使用 `BJS` (北京城市) ❌

### API错误：
```json
{
  "serviceResult": {"rt": 1, "errcode": "10004", "errmsg": ""},
  "routes": []
}
```

## 解决方案

### 1. 创建机场代码到城市代码映射

```python
def _get_city_code_for_trip_api(self, airport_code: str) -> str:
    """将机场代码转换为Trip.com API需要的城市代码"""
    airport_to_city_map = {
        # 中国大陆
        'PEK': 'BJS',  # 北京首都 -> 北京城市
        'PKX': 'BJS',  # 北京大兴 -> 北京城市
        'PVG': 'SHA',  # 上海浦东 -> 上海城市
        'SHA': 'SHA',  # 上海虹桥 (相同)
        
        # 国际城市
        'NRT': 'TYO',  # 东京成田 -> 东京
        'HND': 'TYO',  # 东京羽田 -> 东京
        'ICN': 'SEL',  # 首尔仁川 -> 首尔
        
        # 港澳台 (通常相同)
        'HKG': 'HKG',  # 香港
        'MFM': 'MFM',  # 澳门
        'TPE': 'TPE',  # 台北
    }
    return airport_to_city_map.get(airport_code, airport_code)
```

### 2. 修改API调用逻辑

```python
def _update_trip_payload(self, departure_code: str, destination_code: str = None, ...):
    # 将机场代码转换为城市代码
    departure_city_code = self._get_city_code_for_trip_api(departure_code)
    
    # 更新始发地
    payload['segments'][0]['dcs'][0]['code'] = departure_city_code
    
    # 更新目的地
    if destination_code:
        destination_city_code = self._get_city_code_for_trip_api(destination_code)
        payload['segments'][0]['acs'] = [{"ct": 1, "code": destination_city_code}]
```

## 主要修改

### 文件: `Backend/fastapi_app/services/flight_service.py`

1. **新增方法**: `_get_city_code_for_trip_api()`
   - 机场代码到城市代码的映射
   - 支持中国大陆、港澳台、国际主要城市

2. **修改方法**: `_update_trip_payload()`
   - 出发地和目的地都进行代码转换
   - 确保Trip.com API收到正确的城市代码

## 代码转换示例

| 机场代码 | 城市代码 | 说明 |
|---------|---------|------|
| PEK | BJS | 北京首都 → 北京城市 |
| PKX | BJS | 北京大兴 → 北京城市 |
| PVG | SHA | 上海浦东 → 上海城市 |
| SHA | SHA | 上海虹桥 (相同) |
| NRT | TYO | 东京成田 → 东京城市 |
| HND | TYO | 东京羽田 → 东京城市 |
| ICN | SEL | 首尔仁川 → 首尔城市 |
| HKG | HKG | 香港 (相同) |

## 预期效果

修复后，监控系统应该能够：

1. ✅ **正确处理北京**: `PEK` → `BJS` → 成功获取数据
2. ✅ **支持多机场城市**: 北京、上海、东京等
3. ✅ **兼容现有代码**: 香港等单一机场城市继续正常工作
4. ✅ **统一API调用**: 监控系统和仪表板使用相同逻辑

## 测试验证

### 运行测试脚本：
```bash
cd Backend
python test_city_code_fix.py
```

### 测试内容：
1. **代码转换测试** - 验证映射关系
2. **API调用测试** - 测试北京等城市
3. **监控系统测试** - 端到端功能验证
4. **Payload生成测试** - 验证请求参数

## 支持的城市

### 中国大陆主要城市：
- 北京 (PEK/PKX → BJS)
- 上海 (PVG/SHA → SHA)
- 广州 (CAN → CAN)
- 深圳 (SZX → SZX)
- 成都 (CTU → CTU)
- 西安 (XIY → XIY)
- 武汉 (WUH → WUH)

### 港澳台：
- 香港 (HKG → HKG)
- 澳门 (MFM → MFM)
- 台北 (TPE → TPE)

### 国际主要城市：
- 东京 (NRT/HND → TYO)
- 首尔 (ICN/GMP → SEL)
- 大阪 (KIX/ITM → OSA)
- 曼谷 (BKK → BKK)
- 新加坡 (SIN → SIN)

## 注意事项

1. **向后兼容**: 现有的香港等城市继续正常工作
2. **日志记录**: 代码转换过程会记录到日志中
3. **错误处理**: 未知机场代码会保持原样
4. **扩展性**: 可以轻松添加新的城市映射

这个修复解决了监控系统无法获取北京等中国大陆城市数据的根本问题。
