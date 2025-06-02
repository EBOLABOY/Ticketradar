#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化版航班数据获取器
按照用户建议：直接访问获得什么信息就用什么信息
"""

import requests
import time

def fetch_flights_simple(departure_city, destination_city, depart_date, payload):
    """
    简化版本：直接访问页面获取信息，用什么就是什么
    不使用复杂的受信任Cookie管理，直接用最简单的方式
    """
    try:
        print(f"🔍 简化获取: {departure_city} → {destination_city}")

        # 创建普通Session
        session = requests.Session()
        
        # 构建搜索页面URL
        search_url = f"https://hk.trip.com/flights/showfarefirst?dcity={departure_city.lower()}&acity={destination_city.lower()}&ddate={depart_date}&triptype=ow&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY"
        
        # 第一步：访问搜索页面获取基本Cookie
        print(f"🔍 访问搜索页面获取Cookie...")
        try:
            page_response = session.get(search_url, timeout=30)
            print(f"✅ 页面访问成功，状态码: {page_response.status_code}")
            print(f"📊 获得Cookie数量: {len(session.cookies)}")
        except Exception as e:
            print(f"⚠️ 页面访问失败: {e}")
            # 即使失败也继续，使用空Cookie
        
        # 第二步：构建简单的headers
        headers = {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json; charset=utf-8',
            'Currency': 'CNY',
            'Locale': 'zh-HK',
            'Origin': 'https://hk.trip.com',
            'Referer': search_url,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'X-Ctx-Country': 'HK',
            'X-Ctx-Currency': 'CNY',
            'X-Ctx-Locale': 'zh-HK',
        }
        
        # 添加已知有效的认证信息（如果需要的话）
        headers.update({
            'Token': '1001-common-7OGr9GJ8sIfqW4tRB3eL8WMHK7LwpgjOnWdfjbaEgajzoJBSYQPWMlYhXw7ajDUWb0jsaYAUy3TyOHYDlR5dw8sKOhJkovZDiXpE6AvN0yzhYmNJL6vhYQZx83YSzI54RNTyfqEXojN7j9AEHsYcniUSi31Y9Tj3UihTYMtycE7ArBYLDrD1Rp8E1Pwa7ypPEHYBMRtPxMmi07Rqcy7lESqwpmy0SWt5jktiHpWMfvs0JDZw4lvXbIdqRDZyoqidmj5QEZtw0Uxfbe7FYNTJHLwh6yOOKMdwOFizYcFrShwFQw57jMqyO9vzsyf5w9MyqnwktvzneotE9BEs8WmzwM3e0ZEPbv3Uj0by8oep6Jo0vHBvP5wBkenNyMpyBNROAjDOwQaJFgwDXiDZvTsjXQEHBJ13WnPwqBrZY59yk9x4Fvp3EcQEXdYQ3wLTwNnJhPY6mwtOw60EokR6Yt9wfsRT7Y3DYdDEfFxAURBaw7YkAyfBvO9vsgvG7eZBYP5iQTY0XJ4BvB5ypYOpvobvOpegkeXaEFBjnpWM7Eb1YkkKlYDlypnEaPy4ArgsKBAedhELAWFcxl0EDhELYtNrPBeZjfURmBYTQjU3W7ceQbjLsWf9WNoRbgR6HxDYUPWbAK0DWqZRZ0YHkj4ZWD8eNtyDpJ0FYBQrNygh',
            'X-Ctx-Ubt-Pvid': '13',
            'X-Ctx-Ubt-Sid': '25',
            'X-Ctx-Ubt-Vid': '1746708309569.1d384rgx2qT7'
        })
        
        print(f"✅ 简化headers构建完成")
        
        # 第三步：智能重试机制调用API
        api_url = "https://hk.trip.com/restapi/soa2/27015/FlightListSearchSSE"
        max_retries = 3
        final_response = None
        
        for attempt in range(max_retries):
            print(f"🔄 第{attempt+1}次API请求...")
            
            try:
                response = session.post(api_url, headers=headers, json=payload, stream=True, timeout=30)
                print(f"✅ API响应状态码: {response.status_code}")
                
                if response.status_code == 200:
                    # 快速检查响应质量
                    response_preview = ""
                    line_count = 0
                    
                    # 读取前几行来判断数据质量
                    for line_bytes in response.iter_lines():
                        if line_count > 10:
                            break
                        if line_bytes:
                            line = line_bytes.decode('utf-8', errors='replace').strip()
                            response_preview += line + "\n"
                            line_count += 1
                    
                    # 检查数据质量
                    has_flights = '"itineraryList"' in response_preview
                    has_good_data = ('"recordCount":' in response_preview and 
                                   not '"recordCount":0' in response_preview and
                                   not '"recordCount": 0' in response_preview)
                    
                    print(f"🔍 数据质量检查:")
                    print(f"    - 包含航班数据: {has_flights}")
                    print(f"    - 数据质量良好: {has_good_data}")
                    
                    if has_flights and has_good_data:
                        print(f"✅ 第{attempt+1}次请求获得优质数据")
                        # 重新请求获取完整响应
                        final_response = session.post(api_url, headers=headers, json=payload, stream=True, timeout=30)
                        break
                    elif has_flights:
                        print(f"⚠️ 第{attempt+1}次请求数据有限，可能遇到验证")
                        if attempt < max_retries - 1:
                            print(f"🔄 等待{2 + attempt}秒后重试...")
                            time.sleep(2 + attempt)
                            continue
                        else:
                            # 最后一次，即使数据有限也使用
                            final_response = session.post(api_url, headers=headers, json=payload, stream=True, timeout=30)
                    else:
                        print(f"❌ 第{attempt+1}次请求无有效数据")
                        if attempt < max_retries - 1:
                            print(f"🔄 等待{2 + attempt}秒后重试...")
                            time.sleep(2 + attempt)
                            continue
                        else:
                            final_response = response
                else:
                    print(f"❌ API请求失败，状态码: {response.status_code}")
                    if attempt < max_retries - 1:
                        print(f"🔄 等待{2 + attempt}秒后重试...")
                        time.sleep(2 + attempt)
                        continue
                    else:
                        final_response = response
                        
            except Exception as e:
                print(f"❌ 第{attempt+1}次请求异常: {e}")
                if attempt < max_retries - 1:
                    print(f"🔄 等待{2 + attempt}秒后重试...")
                    time.sleep(2 + attempt)
                    continue
                else:
                    raise e
        
        print(f"🎯 简化获取完成，返回最终响应")
        return final_response
        
    except Exception as e:
        print(f"❌ 简化获取失败: {e}")
        raise e

if __name__ == "__main__":
    # 测试函数
    print("🧪 测试简化航班获取器...")
    
    # 这里可以添加测试代码
    test_payload = {
        "mode": 0,
        "searchCriteria": {
            "grade": 3,
            "tripType": 1,
            "journeyNo": 1,
            "passengerInfoType": {
                "adultCount": 1,
                "childCount": 0,
                "infantCount": 0
            },
            "journeyInfoTypes": [
                {
                    "journeyNo": 1,
                    "departDate": "2025-06-30",
                    "departCode": "SHA",
                    "arriveCode": "SEL",
                    "departAirport": "",
                    "arriveAirport": ""
                }
            ],
            "policyId": None
        },
        "sortInfoType": {
            "direction": True,
            "orderBy": "Direct",
            "topList": []
        },
        "tagList": [],
        "flagList": [],
        "filterType": {
            "filterFlagTypes": [
                {
                    "flag": "Direct",
                    "allow": True,
                    "journeyNoList": [1],
                    "memory": True
                }
            ],
            "queryItemSettings": [],
            "studentsSelectedStatus": True
        }
    }
    
    try:
        response = fetch_flights_simple("SHA", "SEL", "2025-06-30", test_payload)
        print(f"✅ 测试成功，响应状态码: {response.status_code}")
    except Exception as e:
        print(f"❌ 测试失败: {e}")
