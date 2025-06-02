#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试直飞航班搜索 - 简化版本
"""

import requests
import json
import time
from trusted_cookies_manager import TrustedCookiesManager

def test_direct_flights():
    """测试直飞航班搜索"""
    print("🚀 开始测试直飞航班搜索 (北京→上海)")
    
    # 创建受信任Cookie管理器
    manager = TrustedCookiesManager("trusted_cookies.json")
    session = manager.create_trusted_session()
    
    if not session:
        print("❌ 无法创建受信任Session")
        return
    
    # 真实认证信息
    real_auth = {
        'token': '1001-common-7OGr9GJ8sIfqW4tRB3eL8WMHK7LwpgjOnWdfjbaEgajzoJBSYQPWMlYhXw7ajDUWb0jsaYAUy3TyOHYDlR5dw8sKOhJkovZDiXpE6AvN0yzhYmNJL6vhYQZx83YSzI54RNTyfqEXojN7j9AEHsYcniUSi31Y9Tj3UihTYMtycE7ArBYLDrD1Rp8E1Pwa7ypPEHYBMRtPxMmi07Rqcy7lESqwpmy0SWt5jktiHpWMfvs0JDZw4lvXbIdqRDZyoqidmj5QEZtw0Uxfbe7FYNTJHLwh6yOOKMdwOFizYcFrShwFQw57jMqyO9vzsyf5w9MyqnwktvzneotE9BEs8WmzwM3e0ZEPbv3Uj0by8oep6Jo0vHBvP5wBkenNyMpyBNROAjDOwQaJFgwDXiDZvTsjXQEHBJ13WnPwqBrZY59yk9x4Fvp3EcQEXdYQ3wLTwNnJhPY6mwtOw60EokR6Yt9wfsRT7Y3DYdDEfFxAURBaw7YkAyfBvO9vsgvG7eZBYP5iQTY0XJ4BvB5ypYOpvobvOpegkeXaEFBjnpWM7Eb1YkkKlYDlypnEaPy4ArgsKBAedhELAWFcxl0EDhELYtNrPBeZjfURmBYTQjU3W7ceQbjLsWf9WNoRbgR6HxDYUPWbAK0DWqZRZ0YHkj4ZWD8eNtyDpJ0FYBQrNygh',
        'x-ctx-ubt-vid': '1746708309569.1d384rgx2qT7',
        'x-ctx-ubt-sid': '25',
        'x-ctx-ubt-pvid': '13'
    }
    
    # 构建headers
    headers = {
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json; charset=utf-8',
        'Currency': 'CNY',
        'Locale': 'zh-HK',
        'Origin': 'https://hk.trip.com',
        'Referer': 'https://hk.trip.com/flights/showfarefirst?flighttype=OW&dcity=BJS&acity=SHA&ddate=2025-06-30&quantity=1&class=Y&NonstopOnly=on&from=undefined&lowpricesource=historySearch&locale=zh-HK&curr=CNY',
        'Token': real_auth['token'],
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'X-Ctx-Country': 'HK',
        'X-Ctx-Currency': 'CNY',
        'X-Ctx-Locale': 'zh-HK',
        'X-Ctx-Ubt-Pvid': real_auth['x-ctx-ubt-pvid'],
        'X-Ctx-Ubt-Sid': real_auth['x-ctx-ubt-sid'],
        'X-Ctx-Ubt-Vid': real_auth['x-ctx-ubt-vid']
    }
    
    # 构建payload - 专门搜索直飞航班
    payload = {
        "mode": 0,
        "searchCriteria": {
            "grade": 3,
            "tripType": 1,  # 单程
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
                    "departCode": "BJS",
                    "arriveCode": "SHA",
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
                    "journeyNoList": [1]
                }
            ],
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
            "cid": "09034048218003791614",
            "ctok": "",
            "cver": "3",
            "lang": "01",
            "sid": "8888",
            "syscode": "40",
            "auth": "",
            "xsid": "",
            "extension": [
                {
                    "name": "source",
                    "value": "ONLINE"
                },
                {
                    "name": "vid",
                    "value": "1746708309569.1d384rgx2qT7"
                },
                {
                    "name": "pvid",
                    "value": "15"
                },
                {
                    "name": "Flt_SessionId",
                    "value": "25"
                },
                {
                    "name": "PageId",
                    "value": "10320667452"
                }
            ],
            "Locale": "zh-HK",
            "Language": "hk",
            "Currency": "CNY",
            "ClientID": "",
            "appid": "700020"
        }
    }
    
    print(f"🔍 搜索参数:")
    print(f"  - 出发地: BJS (北京)")
    print(f"  - 目的地: SHA (上海)")
    print(f"  - 日期: 2025-06-30")
    print(f"  - 类型: 仅直飞航班")
    print(f"  - Cookie数量: {len(session.cookies)}")
    
    # 发送API请求
    api_url = "https://hk.trip.com/restapi/soa2/27015/FlightListSearchSSE"
    
    try:
        print(f"\n🚀 发送API请求...")
        response = session.post(
            api_url,
            headers=headers,
            json=payload,
            stream=True,
            timeout=60
        )
        
        print(f"✅ API响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            print(f"🎯 开始解析SSE数据...")
            
            flight_count = 0
            
            # 读取完整的响应内容
            full_response = ""
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    full_response += line + "\n"
                    if line.startswith('data: '):
                        data_content = line[6:]  # 去掉 'data: ' 前缀
                        
                        try:
                            if data_content.strip() and data_content != '[DONE]':
                                json_data = json.loads(data_content)
                                
                                # 检查基本信息
                                if 'basicInfo' in json_data:
                                    basic_info = json_data['basicInfo']
                                    record_count = basic_info.get('recordCount', 0)
                                    print(f"📊 找到 {record_count} 个航班")
                                    
                                    if 'lowestPrice' in basic_info:
                                        lowest_price = basic_info['lowestPrice']
                                        total_price = lowest_price.get('totalPrice', 0)
                                        print(f"💰 最低价格: ¥{total_price}")
                                
                                # 检查航班列表
                                if 'itineraryList' in json_data and json_data['itineraryList']:
                                    itinerary_list = json_data['itineraryList']
                                    flight_count = len(itinerary_list)
                                    print(f"✈️ 航班详情 ({flight_count}个):")
                                    
                                    for idx, flight in enumerate(itinerary_list[:3]):  # 只显示前3个
                                        print(f"\n  航班 {idx+1}:")
                                        
                                        if 'journeyList' in flight:
                                            for journey in flight['journeyList']:
                                                if 'transSectionList' in journey:
                                                    for section in journey['transSectionList']:
                                                        if section.get('transportType') == 'FLIGHT':
                                                            flight_info = section.get('flightInfo', {})
                                                            flight_no = flight_info.get('flightNo', 'Unknown')
                                                            airline_code = flight_info.get('airlineCode', 'Unknown')
                                                            
                                                            depart_point = section.get('departPoint', {})
                                                            arrive_point = section.get('arrivePoint', {})
                                                            depart_time = section.get('departDateTime', 'Unknown')
                                                            arrive_time = section.get('arriveDateTime', 'Unknown')
                                                            duration = section.get('duration', 0)
                                                            
                                                            print(f"    {airline_code} {flight_no}")
                                                            print(f"    {depart_point.get('cityName', '')}({depart_point.get('airportCode', '')}) {depart_time[-8:]}")
                                                            print(f" → {arrive_point.get('cityName', '')}({arrive_point.get('airportCode', '')}) {arrive_time[-8:]}")
                                                            print(f"    飞行时间: {duration}分钟")
                                        
                                        # 价格信息
                                        if 'policies' in flight and flight['policies']:
                                            policy = flight['policies'][0]
                                            if 'price' in policy:
                                                price_info = policy['price']
                                                total_price = price_info.get('totalPrice', 0)
                                                print(f"    💰 价格: ¥{total_price}")
                                
                                # 检查过滤选项
                                if 'filterOptionList' in json_data and json_data['filterOptionList']:
                                    filter_options = json_data['filterOptionList'][0]
                                    if 'hotFilters' in filter_options:
                                        hot_filters = filter_options['hotFilters']
                                        for filter_item in hot_filters:
                                            if filter_item.get('type') == 'DIRECT':
                                                direct_count = filter_item.get('lowestPrice', 0)
                                                print(f"🎯 直飞航班可用，最低价: ¥{direct_count}")
                                
                        except json.JSONDecodeError as e:
                            print(f"⚠️ JSON解析失败: {e}")
                            print(f"   数据: {data_content[:200]}...")
            
            print(f"\n📊 === 搜索结果 ===")
            if flight_count > 0:
                print(f"🎉 成功找到 {flight_count} 个直飞航班！")
                print(f"🎯 认证信息有效，API工作正常")
            else:
                print(f"⚠️ 没有找到直飞航班")
                print(f"💡 可能原因：该日期没有直飞航班或需要调整搜索条件")
                
        else:
            print(f"❌ API请求失败，状态码: {response.status_code}")
            print(f"响应: {response.text[:500]}...")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

if __name__ == "__main__":
    test_direct_flights()
