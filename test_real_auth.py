#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用真实认证信息测试FlightListSearchSSE API
"""

import requests
import json
import time
from trusted_cookies_manager import TrustedCookiesManager

def test_with_real_auth():
    """使用真实的认证信息测试API"""
    print("🚀 开始使用真实认证信息测试FlightListSearchSSE API")

    # 创建受信任Cookie管理器
    manager = TrustedCookiesManager("trusted_cookies.json")
    session = manager.create_trusted_session()

    if not session:
        print("❌ 无法创建受信任Session")
        return

    # 从真实请求中提取的认证信息
    real_auth = {
        'token': '1001-common-7OGr9GJ8sIfqW4tRB3eL8WMHK7LwpgjOnWdfjbaEgajzoJBSYQPWMlYhXw7ajDUWb0jsaYAUy3TyOHYDlR5dw8sKOhJkovZDiXpE6AvN0yzhYmNJL6vhYQZx83YSzI54RNTyfqEXojN7j9AEHsYcniUSi31Y9Tj3UihTYMtycE7ArBYLDrD1Rp8E1Pwa7ypPEHYBMRtPxMmi07Rqcy7lESqwpmy0SWt5jktiHpWMfvs0JDZw4lvXbIdqRDZyoqidmj5QEZtw0Uxfbe7FYNTJHLwh6yOOKMdwOFizYcFrShwFQw57jMqyO9vzsyf5w9MyqnwktvzneotE9BEs8WmzwM3e0ZEPbv3Uj0by8oep6Jo0vHBvP5wBkenNyMpyBNROAjDOwQaJFgwDXiDZvTsjXQEHBJ13WnPwqBrZY59yk9x4Fvp3EcQEXdYQ3wLTwNnJhPY6mwtOw60EokR6Yt9wfsRT7Y3DYdDEfFxAURBaw7YkAyfBvO9vsgvG7eZBYP5iQTY0XJ4BvB5ypYOpvobvOpegkeXaEFBjnpWM7Eb1YkkKlYDlypnEaPy4ArgsKBAedhELAWFcxl0EDhELYtNrPBeZjfURmBYTQjU3W7ceQbjLsWf9WNoRbgR6HxDYUPWbAK0DWqZRZ0YHkj4ZWD8eNtyDpJ0FYBQrNygh',
        'x-ctx-ubt-vid': '1746708309569.1d384rgx2qT7',
        'x-ctx-ubt-sid': '25',
        'x-ctx-ubt-pvid': '13'
    }

    # 构建完整的headers（基于真实请求）
    headers = {
        'Accept': 'text/event-stream',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,en-GB;q=0.6',
        'Content-Type': 'application/json; charset=utf-8',
        'Currency': 'CNY',
        'Locale': 'zh-HK',
        'Origin': 'https://hk.trip.com',
        'Priority': 'u=1, i',
        'Referer': 'https://hk.trip.com/flights/showfarefirst?flighttype=OW&dcity=BJS&acity=SEL&ddate=2025-06-30&quantity=1&class=Y&NonstopOnly=off&from=undefined&lowpricesource=historySearch&locale=zh-HK&curr=CNY',
        'Sec-Ch-Ua': '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Token': real_auth['token'],
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',
        'X-Ctx-Country': 'HK',
        'X-Ctx-Currency': 'CNY',
        'X-Ctx-Locale': 'zh-HK',
        'X-Ctx-Ubt-Pvid': real_auth['x-ctx-ubt-pvid'],
        'X-Ctx-Ubt-Sid': real_auth['x-ctx-ubt-sid'],
        'X-Ctx-Ubt-Vid': real_auth['x-ctx-ubt-vid']
    }

    # 构建payload（基于FlightListSearchSSE的正确结构）
    payload = {
        "head": {
            "cid": "09031043410934928682",
            "ctok": "",
            "cver": "1.0",
            "lang": "01",
            "sid": "8888",
            "syscode": "09",
            "auth": "",
            "extension": []
        },
        "searchCondition": {
            "tripType": 1,  # 1=单程, 2=往返
            "journeyInfoTypes": [
                {
                    "journeyNo": 1,
                    "departDate": "2025-06-30",
                    "departCode": "BJS",
                    "arriveCode": "SEL",
                    "departCityCode": "BJS",
                    "arriveCityCode": "SEL",
                    "departCityName": "北京",
                    "arriveCityName": "首尔",
                    "departAirportName": "北京首都国际机场",
                    "arriveAirportName": "仁川国际机场"
                }
            ],
            "cabinClass": 1,  # 1=经济舱
            "adultNum": 1,
            "childNum": 0,
            "infantNum": 0,
            "searchSource": 1,
            "searchType": 1,
            "isNonStop": False,
            "isRedEye": False,
            "currency": "CNY",
            "locale": "zh-HK",
            "countryCode": "HK"
        },
        "filterCondition": {
            "airlineCodeList": [],
            "allianceCodeList": [],
            "airportCodeList": [],
            "cabinGradeList": [],
            "takeoffTimeList": [],
            "landingTimeList": [],
            "flightDurationRange": {
                "min": 0,
                "max": 0
            },
            "priceRange": {
                "min": 0,
                "max": 0
            },
            "stopoverCountList": [],
            "aircraftTypeList": [],
            "mealTypeList": [],
            "wifiList": [],
            "entertainmentList": [],
            "powerList": []
        },
        "sortType": 1,  # 1=推荐排序
        "pageInfo": {
            "pageIndex": 1,
            "pageSize": 20
        },
        "extension": {
            "pageId": "10320667452",
            "transactionId": "1-mf-20250602133212669-WEB",
            "initPageId": "10320667452",
            "searchId": "",
            "abTestList": [],
            "channel": "Online",
            "subChannel": "HK_TRIP_COM",
            "source": "PC"
        }
    }

    print(f"🔍 测试参数:")
    print(f"  - 出发地: BJS (北京)")
    print(f"  - 目的地: SEL (首尔)")
    print(f"  - 日期: 2025-06-30")
    print(f"  - Token: {real_auth['token'][:50]}...")
    print(f"  - UBT_VID: {real_auth['x-ctx-ubt-vid']}")
    print(f"  - UBT_SID: {real_auth['x-ctx-ubt-sid']}")
    print(f"  - UBT_PVID: {real_auth['x-ctx-ubt-pvid']}")
    print(f"  - Cookie数量: {len(session.cookies)}")

    # 发送API请求
    api_url = "https://hk.trip.com/restapi/soa2/27015/FlightListSearchSSE"

    try:
        print(f"\n🚀 发送FlightListSearchSSE请求...")
        response = session.post(
            api_url,
            headers=headers,
            json=payload,
            stream=True,
            timeout=60
        )

        print(f"✅ API响应状态码: {response.status_code}")
        print(f"📊 响应Headers:")
        for key, value in response.headers.items():
            if key.lower() in ['content-type', 'set-cookie', 'x-service-call', 'rootmessageid']:
                print(f"  {key}: {value}")

        if response.status_code == 200:
            print(f"\n🎯 开始解析SSE流...")

            # 解析SSE流
            flight_count = 0
            data_blocks = 0
            start_time = time.time()
            max_wait_time = 30  # 最多等待30秒

            for line in response.iter_lines(decode_unicode=True):
                current_time = time.time()
                if current_time - start_time > max_wait_time:
                    print(f"⏰ 超时 {max_wait_time} 秒，停止等待")
                    break

                if line:
                    print(f"📝 SSE行: {line}")

                    if line.startswith('data: '):
                        data_content = line[6:]  # 去掉 'data: ' 前缀
                        data_blocks += 1

                        # 处理SSE数据
                        try:
                            if data_content.strip() and data_content != '[DONE]':
                                json_data = json.loads(data_content)
                                print(f"🔍 SSE数据: {json.dumps(json_data, indent=2, ensure_ascii=False)[:500]}...")

                                # 检查是否包含航班数据
                                if 'itineraryList' in json_data:
                                    itinerary_list = json_data['itineraryList']
                                    flight_count += len(itinerary_list)
                                    print(f"🛫 发现 {len(itinerary_list)} 个航班")

                        except json.JSONDecodeError as e:
                            print(f"⚠️ SSE JSON解析失败: {e}")

                    elif line.startswith('event: '):
                        event_type = line[7:]
                        print(f"📡 SSE事件: {event_type}")

                    elif line.strip() == '':
                        # 空行表示一个SSE事件结束
                        continue

                    else:
                        # 直接处理JSON响应（非SSE格式）
                        try:
                            json_data = json.loads(line)
                            print(f"🔍 直接JSON响应: {json.dumps(json_data, indent=2, ensure_ascii=False)}")

                            # 检查错误信息
                            if 'ResponseStatus' in json_data:
                                status = json_data['ResponseStatus']
                                if status.get('Ack') == 'Failure':
                                    print(f"❌ API返回失败状态:")
                                    if 'Errors' in status:
                                        for error in status['Errors']:
                                            print(f"  错误: {error.get('Message', 'Unknown error')}")
                                    return

                            # 检查是否包含航班数据
                            if 'itineraryList' in json_data:
                                itinerary_list = json_data['itineraryList']
                                flight_count += len(itinerary_list)
                                print(f"🛫 发现 {len(itinerary_list)} 个航班")

                        except json.JSONDecodeError:
                            pass

                        data_blocks += 1

                                # 检查是否包含航班数据
                                if 'itineraryList' in json_data:
                                    itinerary_list = json_data['itineraryList']
                                    flight_count += len(itinerary_list)

                                    print(f"🛫 数据块 {data_blocks}: 包含 {len(itinerary_list)} 个航班")

                                    # 显示第一个航班的详细信息
                                    if itinerary_list and len(itinerary_list) > 0:
                                        first_flight = itinerary_list[0]
                                        print(f"  航班详情:")

                                        if 'journeyList' in first_flight:
                                            for i, journey in enumerate(first_flight['journeyList']):
                                                if 'segmentList' in journey:
                                                    for j, segment in enumerate(journey['segmentList']):
                                                        airline = segment.get('airlineName', 'Unknown')
                                                        flight_no = segment.get('flightNumber', 'Unknown')
                                                        depart_time = segment.get('departTime', 'Unknown')
                                                        arrive_time = segment.get('arriveTime', 'Unknown')
                                                        depart_airport = segment.get('departAirportCode', 'Unknown')
                                                        arrive_airport = segment.get('arriveAirportCode', 'Unknown')

                                                        print(f"    段 {j+1}: {airline} {flight_no}")
                                                        print(f"           {depart_airport} {depart_time} → {arrive_airport} {arrive_time}")

                                        # 价格信息
                                        if 'priceList' in first_flight and first_flight['priceList']:
                                            price_info = first_flight['priceList'][0]
                                            total_price = price_info.get('totalPrice', 'Unknown')
                                            print(f"    价格: ¥{total_price}")

                                # 检查基本信息
                                if 'basicInfo' in json_data:
                                    basic_info = json_data['basicInfo']
                                    record_count = basic_info.get('recordCount', 0)
                                    original_count = basic_info.get('originalCount', 0)
                                    print(f"📊 基本信息: recordCount={record_count}, originalCount={original_count}")

                        except json.JSONDecodeError as e:
                            print(f"⚠️ JSON解析失败: {e}")
                            print(f"   原始数据: {data_content[:200]}...")
                        except Exception as e:
                            print(f"⚠️ 数据处理失败: {e}")

                # 限制处理时间，避免无限等待
                if data_blocks >= 10:  # 处理前10个数据块
                    print(f"🔄 已处理 {data_blocks} 个数据块，停止解析")
                    break

            print(f"\n📊 === 解析结果 ===")
            print(f"✅ 总数据块: {data_blocks}")
            print(f"✅ 总航班数: {flight_count}")

            if flight_count > 0:
                print(f"🎉 成功！API返回了 {flight_count} 个航班信息")
                print(f"🎯 认证信息有效，可以获取完整的航班数据")
            else:
                print(f"⚠️ 没有获取到航班数据，可能需要调整参数")

        else:
            print(f"❌ API请求失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text[:500]}...")

    except Exception as e:
        print(f"❌ API请求异常: {e}")

if __name__ == "__main__":
    test_with_real_auth()
