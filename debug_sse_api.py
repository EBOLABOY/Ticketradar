#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
独立的SSE API调试脚本
用于测试FlightListSearchSSE接口的原始行为
"""

import requests
import json
import time
from datetime import datetime, timedelta

def create_debug_payload(departure_code="HKG", destination_code="LON", depart_date="2025-09-30"):
    """创建调试用的payload - 使用与主代码相同的结构"""
    import datetime

    # 生成当前时间相关的值
    current_time = datetime.datetime.now()
    transaction_id = f"1-mf-{current_time.strftime('%Y%m%d%H%M%S')}-WEB"
    client_time = current_time.strftime("%Y-%m-%dT%H:%M:%S+08:00")

    return {
        "mode": 0,
        "searchCriteria": {
            "grade": 3,
            "tripType": 1,  # 1=单程, 2=往返
            "journeyNo": 1,
            "passengerInfoType": {
                "adultCount": 1,
                "childCount": 0,
                "infantCount": 0
            },
            "journeyInfoTypes": [
                {
                    "journeyNo": 1,
                    "departDate": depart_date,
                    "departCode": departure_code,
                    "arriveCode": destination_code,
                    "departAirport": "",
                    "arriveAirport": ""
                }
            ],
            "policyId": None
        },
        "sortInfoType": {
            "direction": True,
            "orderBy": "Price",
            "topList": []
        },
        "tagList": [],
        "flagList": [],
        "filterType": {
            "filterFlagTypes": [],
            "queryItemSettings": [],
            "studentsSelectedStatus": True
        },
        "abtList": [
            {
                "abCode": "240509_IBU_RFUO",
                "abVersion": "A"
            }
        ],
        "head": {
            "cid": "09031043410934928682",
            "ctok": "",
            "cver": "1.0",
            "lang": "01",
            "sid": "8888",
            "syscode": "09",
            "auth": "",
            "xsid": "",
            "extension": [
                {"name": "protocal", "value": "https"},
                {"name": "appid", "value": "700020"},
                {"name": "locale", "value": "zh-HK"},
                {"name": "currency", "value": "CNY"},
                {"name": "vid", "value": "1746708309569.1d384rgx2qT7"},
                {"name": "pvid", "value": "1746708309569.1d384rgx2qT7"},
                {"name": "sid", "value": "1746708309569.1d384rgx2qT7"},
                {"name": "clientTime", "value": client_time},
                {"name": "transactionId", "value": transaction_id},
                {"name": "PageId", "value": "10320668141"},
                {"name": "frontVersion", "value": "2"},
                {"name": "SourceApp", "value": "Trip"}
            ]
        }
    }

def debug_sse_raw_response():
    """调试SSE接口的原始响应"""
    print("🔍 开始调试SSE接口...")

    # 创建session
    session = requests.Session()

    # 先访问搜索结果页面获取Cookie（模拟主代码的行为）
    departure_city = "HKG"
    destination_city = "LON"
    depart_date = "2025-09-30"

    search_results_url = f"https://hk.trip.com/flights/showfarefirst?dcity={departure_city.lower()}&acity={destination_city.lower()}&ddate={depart_date}&triptype=ow&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY"

    print(f"🔍 先访问搜索结果页面获取Cookie")
    print(f"🔍 URL: {search_results_url}")

    try:
        # 访问搜索页面
        initial_response = session.get(search_results_url, timeout=30)
        print(f"🔍 搜索页面响应状态码: {initial_response.status_code}")
        print(f"🔍 获得的Cookie数量: {len(session.cookies)}")

        # 显示获得的主要cookies
        for cookie in session.cookies:
            print(f"    Cookie: {cookie.name} = {cookie.value[:50]}...")

    except Exception as e:
        print(f"🔍 访问搜索页面失败: {e}")
        return

    # 设置SSE请求的headers（模拟主代码）
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/event-stream',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Priority': 'u=1, i',
        'X-Ctx-Country': 'HK',
        'X-Ctx-Currency': 'CNY',
        'X-Ctx-Locale': 'zh-HK'
    }

    # API URL
    url = "https://hk.trip.com/restapi/soa2/27015/FlightListSearchSSE"

    # 创建payload - 测试单程查询
    payload = create_debug_payload("HKG", "LON", "2025-09-30")
    print(f"🔍 测试单程查询 HKG → LON")

    print(f"🔍 请求URL: {url}")
    print(f"🔍 Payload: {json.dumps(payload, indent=2, ensure_ascii=False)}")
    print(f"🔍 Headers: {json.dumps(headers, indent=2, ensure_ascii=False)}")

    try:
        # 发送请求
        print(f"\n🔍 发送SSE请求...")
        start_time = time.time()

        response = session.post(url, headers=headers, json=payload, stream=True, timeout=60)

        print(f"🔍 响应状态码: {response.status_code}")
        print(f"🔍 响应Headers: {dict(response.headers)}")

        if response.status_code != 200:
            print(f"❌ 请求失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            return

        # 逐行读取SSE流
        line_count = 0
        event_count = 0
        json_blocks = []
        current_event_lines = []

        print(f"\n🔍 开始读取SSE流...")

        for line_bytes in response.iter_lines():
            line_count += 1
            current_time = time.time()
            elapsed = current_time - start_time

            # 检查超时
            if elapsed > 60:  # 60秒超时
                print(f"🔍 超时停止 (60秒)")
                break

            if not line_bytes:
                # 空行表示事件结束
                if current_event_lines:
                    event_count += 1
                    print(f"\n🔍 === 事件 {event_count} (第{line_count}行, {elapsed:.1f}s) ===")

                    # 处理当前事件
                    process_debug_event(current_event_lines, json_blocks)
                    current_event_lines = []
                continue

            line = line_bytes.decode('utf-8', errors='replace').strip()

            # 显示原始行（前20行）
            if line_count <= 20:
                print(f"第{line_count}行: {line}")

            current_event_lines.append(line)

        # 处理最后一个事件
        if current_event_lines:
            event_count += 1
            print(f"\n🔍 === 最后事件 {event_count} ===")
            process_debug_event(current_event_lines, json_blocks)

        print(f"\n🔍 SSE流读取完成:")
        print(f"    - 总行数: {line_count}")
        print(f"    - 事件数: {event_count}")
        print(f"    - JSON块数: {len(json_blocks)}")
        print(f"    - 总耗时: {time.time() - start_time:.2f}秒")

        # 分析JSON块
        analyze_json_blocks(json_blocks)

    except Exception as e:
        print(f"❌ 调试过程中出错: {e}")
        import traceback
        traceback.print_exc()

def process_debug_event(event_lines, json_blocks):
    """处理单个调试事件"""
    if not event_lines:
        return

    data_lines = []
    event_type = None

    for line in event_lines:
        if line.startswith("data:"):
            data_content = line[len("data:"):].strip()
            if data_content:
                data_lines.append(data_content)
        elif line.startswith("event:"):
            event_type = line[len("event:"):].strip()

    print(f"    Event类型: {event_type}")
    print(f"    Data行数: {len(data_lines)}")

    if data_lines:
        full_data = "".join(data_lines)
        print(f"    数据长度: {len(full_data)}")
        print(f"    数据前200字符: {full_data[:200]}...")

        try:
            json_obj = json.loads(full_data)
            json_blocks.append(json_obj)

            # 分析JSON结构
            print(f"    JSON顶级键: {list(json_obj.keys())}")

            if "itineraryList" in json_obj:
                itinerary_count = len(json_obj["itineraryList"])
                print(f"    ✅ 包含 {itinerary_count} 个航班")
            else:
                print(f"    ⚠️ 不包含itineraryList")

        except json.JSONDecodeError as e:
            print(f"    ❌ JSON解析失败: {e}")

def analyze_json_blocks(json_blocks):
    """分析收集到的JSON块"""
    print(f"\n🔍 === JSON块分析 ===")

    total_flights = 0

    for i, block in enumerate(json_blocks):
        print(f"\n块 {i+1}:")
        print(f"    顶级键: {list(block.keys())}")

        if "itineraryList" in block:
            flights_in_block = len(block["itineraryList"])
            total_flights += flights_in_block
            print(f"    航班数: {flights_in_block}")

            # 显示前几个航班的基本信息
            for j, itinerary in enumerate(block["itineraryList"][:3]):
                if "journeyList" in itinerary and itinerary["journeyList"]:
                    journey = itinerary["journeyList"][0]
                    if "transSectionList" in journey and journey["transSectionList"]:
                        first_segment = journey["transSectionList"][0]
                        depart_time = first_segment.get("departDateTime", "")
                        flight_info = first_segment.get("flightInfo", {})
                        flight_no = flight_info.get("flightNo", "")
                        print(f"        航班{j+1}: {flight_no} {depart_time}")

        if "basicInfo" in block:
            basic_info = block["basicInfo"]
            print(f"    basicInfo键: {list(basic_info.keys())}")

    print(f"\n🔍 总计: {total_flights} 个航班")

if __name__ == "__main__":
    debug_sse_raw_response()
