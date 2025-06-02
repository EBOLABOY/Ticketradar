import requests
import json
import time
import urllib.parse
from py_mini_racer import MiniRacer # 用于执行 JavaScript

def deobfuscate_prices(response_json):
    """
    执行 t1000 字段中的 JavaScript 来反混淆价格。
    """
    if "t1000" not in response_json or not response_json["t1000"]:
        print("警告: 响应中未找到 t1000 字段，价格可能未反混淆。")
        return response_json

    js_code_wrapper = response_json["t1000"]
    # 提取主要的JS函数体，它是一个IIFE (Immediately Invoked Function Expression)
    # 形式通常是 (0||(function(a){...}))
    # 我们需要将其转换为一个可以被调用的函数
    if js_code_wrapper.startswith("(0||(") and js_code_wrapper.endswith("))"):
        actual_js_function_str = js_code_wrapper[5:-2] # 移除 (0|| 和最外层的 ))
    else:
        print(f"警告: t1000 JS 包装格式未知: {js_code_wrapper[:50]}...")
        return response_json

    # 构造一个可执行的 JS 环境
    # JS 函数期望一个参数 (通常是 'a')，这个参数是整个 response_json 对象
    # JS 函数会直接修改传入的对象
    mr = MiniRacer()
    try:
        # 将原始的IIFE包装的函数字符串转换为一个可调用的函数
        # 例如，原始可能是 (function(a){...})
        # 我们需要定义一个函数名，然后将函数体放进去
        # py_mini_racer 的 call 方法需要函数名
        function_name = "_m0a5emmf2o" # 从 t1000 中提取的函数名，或者自定义一个
        
        # 有时 t1000 的值是 (0||(function _someName(a){...}))(param)
        # 我们只需要 function _someName(a){...} 部分，并让它返回修改后的 'a'
        # 有时是 (function(a){...})(param)
        
        # 简化处理：直接执行整个包装代码，它会返回一个函数，我们再调用那个函数
        # 确保JS代码的最后会返回处理后的对象
        # 原始JS: (0||(function _m0a5emmf2o(a){ /* ... modifies a ... */ return a}))
        # 我们把它变成: function deobfuscate(data) { var func = (0||(function _m0a5emmf2o(a){ /* ... */ return a})); return func(data); }
        # 或者更简单，如果原来的JS就是 (function(a){...}) 这种形式，可以直接执行
        
        # 假设 t1000 中的函数会修改传入的对象并返回它
        # py_mini_racer 的 call 方法可以直接调用这种 (function(a){...}) 形式的函数字符串
        # 但前提是这个字符串本身就是一个可调用的函数定义或表达式

        # 尝试提取函数体并包装成一个可调用函数
        # (0||(function _m0a5emmf2o(a){ ... })) -> function _m0a5emmf2o(a){ ... }
        # 提取 `function _m0a5emmf2o(a){...}` 部分
        start_index = js_code_wrapper.find("function ")
        if start_index == -1:
            print("警告: 在 t1000 中未找到 'function ' 关键字。")
            return response_json
            
        # 找到匹配的最后一个 '}'
        open_braces = 0
        end_index = -1
        for i in range(start_index, len(js_code_wrapper)):
            if js_code_wrapper[i] == '{':
                open_braces += 1
            elif js_code_wrapper[i] == '}':
                open_braces -= 1
                if open_braces == 0:
                    end_index = i + 1
                    break
        
        if end_index == -1:
            print("警告: 无法在 t1000 中找到匹配的函数体结束 '}'。")
            return response_json

        isolated_function_str = js_code_wrapper[start_index:end_index]
        
        # 为了让 py_mini_racer 的 call 方法能正确传递参数并获得返回值
        # 我们将JS函数包装一下
        js_to_execute = f"""
        function wrapper(data) {{
            var fn = {isolated_function_str};
            return fn(data);
        }}
        """
        mr.eval(js_to_execute)
        # print("反混淆前的 selected_flight_price.price.lowTotalPrice:", response_json.get("result", {}).get("flightPrice", {}).get("price", {}).get("lowTotalPrice"))
        
        # 注意：JS函数通常直接修改传入的对象。
        # py_mini_racer 对于复杂对象的双向传递和修改可能不完美。
        # 最稳妥的方式是让JS返回一个包含需要更新的值的简单对象，然后在Python中合并。
        # 但这里的JS通常直接修改传入的对象。
        
        # 传入整个 response_json, JS应该会修改它
        # 由于JS通常是 (function(a){...})(data) 的形式，我们这里模拟这种调用
        # 或者如果JS函数内部直接修改全局传入的变量，那更复杂。
        # 这里的 t1000 格式是 `(0||(function _m0a5emmf2o(a){...}))`
        # 它返回一个函数，这个返回的函数才接收真正的参数。
        
        # 正确的执行方式：
        # 1. 执行 `(0||(function _m0a5emmf2o(a){...}))` 本身，它会返回内部的函数
        # 2. 调用这个返回的函数，参数是 `response_json`

        returned_function_name = "deobfuscator_func" # 给返回的函数起个名字
        mr.eval(f"var {returned_function_name} = {js_code_wrapper};")
        
        # 深拷贝一份用于JS修改，避免污染原始数据（如果JS行为不可控）
        # 但通常这里的JS是设计来修改传入对象的
        data_for_js = json.loads(json.dumps(response_json)) # 简单深拷贝
        
        modified_data = mr.call(returned_function_name, data_for_js)
        
        # print("反混淆后的 selected_flight_price.price.lowTotalPrice (from JS return):", modified_data.get("result", {}).get("flightPrice", {}).get("price", {}).get("lowTotalPrice"))
        # print("反混淆后的 selected_flight_price.price.lowTotalPrice (from original obj):", data_for_js.get("result", {}).get("flightPrice", {}).get("price", {}).get("lowTotalPrice"))
        
        # py_mini_racer 的 call 方法会返回 JS 函数的返回值。
        # 如果JS函数修改了传入的对象并返回了它，那么 modified_data 就是更新后的。
        return modified_data

    except Exception as e:
        print(f"执行JavaScript时出错: {e}")
        print(f"JS代码片段: {js_code_wrapper[:200]}...") # 打印部分JS代码用于调试
        return response_json # 返回原始数据以防JS执行失败


# 1. 请求URL (从你提供的信息中复制)
# 注意：Bella参数非常长，这里为了可读性做了截断，实际使用时请用完整的。
# 你需要确保 Bella, queryId, flightCode, st, Cookie 都是有效的。
# st 参数应该是动态的（当前时间戳）
current_timestamp_ms = int(time.time() * 1000)

# 从你提供的 URL 中解析参数
original_url = "https://flight.qunar.com/touch/api/inter/wwwsearch?from=flight_int_search&ex_track=3w&depCity=%E6%B7%B1%E5%9C%B3&arrCity=%E9%A6%96%E5%B0%94&adultNum=1&childNum=0&depDate=2025-06-04&retDate=2025-06-24&hasApply=true&queryId=10.72.206.162%3Ao%3A-24befd70%3A1972f4b8555%3A-6787&isSupportPack=true&flightCode=ZH633%7CSZX-ICN%7C2025-06-04_ZH632%7CICN-SZX%7C2025-06-24%4010.72.206.162%3Al%3A-24befd70%3A1972f4b8555%3A-69a8&st=1748845532452&_v=3&Bella=1683616182042%23%2374c70c3e7868b62a25e6a9354dcbfd7bcf5ea9fe%23%23iKohiK3wgMkMf-i0gUPwaUPsXuPwaMfLy9opohNno9NHgUNScO%3D0a2j0aS30a2a0aSi8y9WScOnxiK3wiKWTiK3wWR28VhPwawPwasv8as2%3DVD3naPihWR2%2BaK30aSa0aSanWsXmVRXAWKjwaKjniK3wiKiRiK3wgOHQgMn0duPwaUPsXuPwa5kbyONxoOm0aS30a2a0aSi%3Dy-ELfuPwaUPsXuPwaUkGWwkhEhPNakGAcMGwqMWxcuPwaUPwXwPwaMe0d-oxgMEsiK3wiKWTiK3wiKiRP-kbj-3bjOFeiK3wiKiRiK3wfIksj%2BiQgCEQcOm0aS30a%3DD0aS30EKP0VDP0X230EKP0VKa0XPD0EKP0VRX0X2jpP-kbj-3bjOFeJukGWhkhEhPNXwkGWhkhVhkhXukGWuPmWukTVhkGWwPNahPmawkGWUPNXwPmahkGWukTWhkTWwPwaUPwXwPwaMHxg%2BX0aS30a%3DD0aSiMcI05yCXbg-kbj-3bjOFeiK3wiKiRiK3wgOWwy-T%3DP%2BiSiK3wiKWTiKkhiK3wcCvbfMnQfOH%3Dq5GAcMGwqUPwaUPwXwPwa5iej%2BW2fUNno9NHgUNScO%3D0aS30WPX0a2a0aSisy9obiK3wiKWTiK3wWsESWsTSaOP%2BVRjmjSjwjK3AfKfHVKaAWIESjMf2WOiSfSk0jK0MfuPwaUPwXwPwa5iHcMExcPNAcuPwaUPsXuPwaSomuMnpasEHW%2BtsP5awWPkOcDeWPUPwaUPwXwPwa5X0aS30a%3DDnWsXmVRXAWKjwaKjwiKoD%23%237xJlh34a7x3Rs25EvlKMR%23%23from%2Cex_track%2CdepCity%2CarrCity%2CadultNum%2CchildNum%2CdepDate%2CretDate%2ChasApply%2CqueryId%2CisSupportPack%2CflightCode%2Cst%2C_v"
parsed_original_url = urllib.parse.urlparse(original_url)
query_params_dict = urllib.parse.parse_qs(parsed_original_url.query)

# 更新 st 参数
query_params_dict['st'] = [str(current_timestamp_ms)]

# 如果需要，可以从这里修改其他参数
# query_params_dict['depCity'] = [urllib.parse.quote("北京")]
# query_params_dict['arrCity'] = [urllib.parse.quote("上海")]
# query_params_dict['depDate'] = ["2025-07-01"]
# query_params_dict['retDate'] = ["2025-07-10"]
# ... 等等。但 Bella 值很可能与这些参数绑定，修改后原始 Bella 会失效。

# 重新构建查询字符串
# parse_qs 返回的值是列表，需要转换为字符串
encoded_query_params = {}
for k, v_list in query_params_dict.items():
    encoded_query_params[k] = v_list[0] # 假设每个参数只有一个值

# 重新构建 URL
# 对于这个特定请求，我们用原始的 Bella 和其他ID，只更新时间戳
# 如果是发起新搜索，Bella, flightCode, queryId 都需要是新的
final_url = f"{parsed_original_url.scheme}://{parsed_original_url.netloc}{parsed_original_url.path}?{urllib.parse.urlencode(encoded_query_params)}"

# 2. 请求头 (从你提供的信息中选择重要的)
headers = {
    ":authority": "flight.qunar.com", # 这个是HTTP/2的伪头部, requests会自动处理
    ":method": "GET", # 这个是HTTP/2的伪头部, requests会自动处理
    ":scheme": "https", # 这个是HTTP/2的伪头部, requests会自动处理
    "accept": "text/javascript, text/html, application/xml, text/xml, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,en-GB;q=0.6",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
    "referer": "https://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=%E6%B7%B1%E5%9C%B3&toCity=%E9%A6%96%E5%B0%94&fromDate=2025-06-04&toDate=2025-06-24&fromCode=SZX&toCode=SEL&from=flight_int_search&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=0&adultNum=1&childNum=0&cabinClass=",
    "x-requested-with": "XMLHttpRequest",
    # Cookie: 你提供的Cookie非常长，如果请求不成功，可能需要加入。但Cookie有时效性。
    # "cookie": "QN1=...; QN300=3w", # 非常长的Cookie字符串，截断示例
    # 以下自定义头部可能也重要，取决于服务器校验严格程度
    "csht": "ppap",
    "e4q2p": "pre",
    "pre": "2ddb2cf6-a91c25-26468b87-74a13c34-a5a10ea714f6", # 这个pre值可能也需要动态获取
}

# 移除 requests 不直接支持的HTTP/2伪头部 (requests 会自动处理它们)
pseudo_headers = [key for key in headers if key.startswith(':')]
for p_header in pseudo_headers:
    del headers[p_header]

# 3. 发送请求
try:
    print(f"请求URL: {final_url}")
    response = requests.get(final_url, headers=headers, timeout=20)
    response.raise_for_status() # 如果状态码不是200, 会抛出异常
    
    # 尝试解析JSON
    try:
        response_data = response.json()
    except json.JSONDecodeError:
        print("错误: 响应内容不是有效的JSON格式。")
        print("响应文本:", response.text[:500]) # 打印部分响应文本
        exit()

    # 4. 如果有 t1000 字段，执行JS反混淆
    if 't1000' in response_data and response_data['t1000']:
        print("检测到 t1000 字段，尝试执行 JavaScript 反混淆价格...")
        response_data_deobfuscated = deobfuscate_prices(response_data)
        # 用反混淆后的数据替换原始数据
        if response_data_deobfuscated:
             response_data = response_data_deobfuscated
        else:
            print("警告: JavaScript 执行后未返回有效数据，将使用原始数据。")

    # 5. 解析和打印所需信息
    if response_data.get("status") == 0 and "result" in response_data:
        result = response_data["result"]
        
        # 基本航班信息
        flight_price_info = result.get("flightPrice", {})
        journey_info = flight_price_info.get("journey", {})
        price_details = flight_price_info.get("price", {})

        print("\n--- 航班基本信息 ---")
        print(f"航班号组合: {journey_info.get('code')}")
        print(f"总价 (机票+税): {price_details.get('lowTotalPrice')} {price_details.get('currencyCode')}")
        print(f"机票价: {price_details.get('lowPrice')}")
        print(f"税费: {price_details.get('tax')}")
        print(f"舱位: {price_details.get('totalCainDesc')}")

        trips = journey_info.get("trips", [])
        for i, trip in enumerate(trips):
            direction = "去程" if i == 0 else "返程"
            print(f"\n--- {direction} ---")
            print(f"  航班号: {trip.get('code')}")
            print(f"  飞行时长: {trip.get('duration')} 分钟")
            segments = trip.get("flightSegments", [])
            for seg_idx, segment in enumerate(segments):
                print(f"  航段 {seg_idx+1}:")
                print(f"    起飞: {segment.get('depCityName')} ({segment.get('depAirportName')} {segment.get('depTerminal')}) {segment.get('depDate')} {segment.get('depTime')}")
                print(f"    到达: {segment.get('arrCityName')} ({segment.get('arrAirportName')} {segment.get('arrTerminal')}) {segment.get('arrDate')} {segment.get('arrTime')}")
                print(f"    航空公司: {segment.get('carrierShortName')}")
                print(f"    机型: {segment.get('planeTypeName')}")

        # 供应商报价信息
        pack_vendors = result.get("packVendors", {})
        vendor_prices = pack_vendors.get("prices", {})
        
        print("\n--- 供应商报价 (部分示例) ---")
        count = 0
        for vendor_code, vendor_data in vendor_prices.items():
            if count >= 3: # 只打印前3个作为示例
                break
            
            vendor_info = vendor_data.get("vendor", {})
            vendor_price_info = vendor_data.get("price", {})
            vendor_base_info = vendor_data.get("base", {})
            
            print(f"\n  供应商: {vendor_info.get('name')} ({vendor_info.get('wrapperId')})")
            print(f"    产品标签: {vendor_base_info.get('productTag')}")
            print(f"    舱位: {vendor_base_info.get('cabin')}")
            print(f"    价格 (机票+税): {vendor_price_info.get('avgPrice')} {vendor_price_info.get('currencyCode')} (机票: {vendor_price_info.get('price')}, 税: {vendor_price_info.get('tax')})")
            
            labels = []
            label_infos_b = vendor_base_info.get("labelInfos", {}).get("B", [])
            for label in label_infos_b:
                labels.append(label.get("name"))
            if labels:
                print(f"    标签: {', '.join(labels)}")
            count +=1

    else:
        print("未能成功获取航班信息或响应格式不符合预期。")
        print("Status:", response_data.get("status"))
        # print("完整响应:", json.dumps(response_data, indent=4, ensure_ascii=False))


except requests.exceptions.RequestException as e:
    print(f"请求错误: {e}")
except Exception as e:
    print(f"发生其他错误: {e}")