#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用真实认证信息测试FlightListSearchSSE API - 清理版本
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

    # 构建payload（基于真实请求的完整结构）
    payload = {
        "mode": 0,  # 关键参数！
        "searchCriteria": {
            "grade": 3,
            "tripType": 1,  # 1=单程
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
            ],  # 恢复直飞限制，只要直飞航班
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
            "cid": "09034048218003791614",  # 使用真实的GUID
            "ctok": "",
            "cver": "3",  # 版本3
            "lang": "01",
            "sid": "8888",
            "syscode": "40",  # 系统代码40
            "auth": "",
            "xsid": "",
            "extension": [
                {
                    "name": "abTesting",
                    "value": "M:71,240723_IBU_OLPS:B;M:0,250520_IBU_FPG:B;M:2,250421_IBU_snth:B;M:34,250430_IBU_ais:A;M:34,250430_IBU_ais:A;M:7,240308_IBU_olrp:B;M:6,240417_IBU_Ohtwl:A;M:28,240912_IBU_jpwjo:A;M:-1,240924_IBU_uspoe:A;M:-1,240509_IBU_RFUO:A;M:-1,240924_IBU_usphe:A;M:76,241128_IBU_uspso:A;M:94,241128_IBU_usphs:A;M:80,241031_IBU_OLFL:F;M:44,241224_IBU_TOLNG:B;M:46,250109_IBU_OLFBO:E;M:46,250109_IBU_OLFBO:E;M:95,250206_IBU_sxbjo:A;M:9,250219_IBU_OLLIST:A;M:9,250219_IBU_OLLIST:A;M:21,250207_IBU_FLTOLM:E;M:21,250207_IBU_FLTOLM:E;M:41,250305_IBU_sxxw:B;M:7,250313_IBU_GWBVO:B;M:82,250403_IBU_wcd:D;M:43,250423_IBU_olm:B;M:95,250403_IBU_PDOOL:D;M:43,250408_IBU_fltollogin:A;M:0,250417_IBU_olf:A;M:93,250515_IBU_plbb:A;M:68,250527_IBU_lsf:A;M:37,250521_IBU_ONCOPR:A;"
                },
                {
                    "name": "source",
                    "value": "ONLINE"
                },
                {
                    "name": "sotpGroup",
                    "value": "Trip"
                },
                {
                    "name": "sotpLocale",
                    "value": "zh-HK"
                },
                {
                    "name": "sotpCurrency",
                    "value": "CNY"
                },
                {
                    "name": "allianceID",
                    "value": "1094387"
                },
                {
                    "name": "sid",
                    "value": "2209817"
                },
                {
                    "name": "ouid",
                    "value": "ctag.hash.od66w3zbknse"
                },
                {
                    "name": "uuid"
                },
                {
                    "name": "useDistributionType",
                    "value": "1"
                },
                {
                    "name": "flt_app_session_transactionId",
                    "value": "1-mf-20250602133854017-WEB"
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
                    "name": "channel"
                },
                {
                    "name": "x-ua",
                    "value": "v=3_os=ONLINE_osv=10"
                },
                {
                    "name": "PageId",
                    "value": "10320667452"
                },
                {
                    "name": "clientTime",
                    "value": "2025-06-02T13:38:54+08:00"
                },
                {
                    "name": "edmSource",
                    "value": "undefined"
                },
                {
                    "name": "LowPriceSource",
                    "value": "historySearch"
                },
                {
                    "name": "Flt_BatchId",
                    "value": "9ff10da2-0bba-4e89-9999-02d1333bee74"
                },
                {
                    "name": "BlockTokenTimeout",
                    "value": "0"
                },
                {
                    "name": "full_link_time_scene",
                    "value": "pure_list_page"
                },
                {
                    "name": "units",
                    "value": "METRIC"
                },
                {
                    "name": "sotpUnit",
                    "value": "METRIC"
                }
            ],
            "Locale": "zh-HK",
            "Language": "hk",
            "Currency": "CNY",
            "ClientID": "",
            "appid": "700020"
        }
    }

    print(f"🔍 测试参数:")
    print(f"  - 出发地: BJS (北京)")
    print(f"  - 目的地: SHA (上海)")
    print(f"  - 日期: 2025-06-30")
    print(f"  - 航班类型: 仅直飞")
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
            max_wait_time = 60  # 最多等待60秒，给SSE更多时间

            for line in response.iter_lines(decode_unicode=True):
                current_time = time.time()
                if current_time - start_time > max_wait_time:
                    print(f"⏰ 超时 {max_wait_time} 秒，停止等待")
                    break

                if line:
                    print(f"📝 SSE行: {line[:100]}...")  # 只显示前100个字符

                    if line.startswith('data: '):
                        data_content = line[6:]  # 去掉 'data: ' 前缀
                        data_blocks += 1

                        # 处理SSE数据
                        try:
                            if data_content.strip() and data_content != '[DONE]':
                                json_data = json.loads(data_content)
                                print(f"🔍 SSE数据包含字段: {list(json_data.keys())}")

                                # 检查基本信息
                                if 'basicInfo' in json_data:
                                    basic_info = json_data['basicInfo']
                                    record_count = basic_info.get('recordCount', 0)
                                    print(f"📊 记录数量: {record_count}")

                                    if 'lowestPrice' in basic_info:
                                        lowest_price = basic_info['lowestPrice']
                                        total_price = lowest_price.get('totalPrice', 0)
                                        print(f"💰 最低价格: ¥{total_price}")

                                # 检查是否包含航班数据
                                if 'itineraryList' in json_data and json_data['itineraryList']:
                                    itinerary_list = json_data['itineraryList']
                                    flight_count += len(itinerary_list)
                                    print(f"🛫 发现 {len(itinerary_list)} 个航班")

                                    # 显示第一个航班的详细信息
                                    if len(itinerary_list) > 0:
                                        first_flight = itinerary_list[0]
                                        print(f"✈️ 航班详情:")

                                        if 'journeyList' in first_flight:
                                            for journey in first_flight['journeyList']:
                                                if 'transSectionList' in journey:
                                                    for i, section in enumerate(journey['transSectionList']):
                                                        if section.get('transportType') == 'FLIGHT':
                                                            flight_info = section.get('flightInfo', {})
                                                            flight_no = flight_info.get('flightNo', 'Unknown')
                                                            airline_code = flight_info.get('airlineCode', 'Unknown')

                                                            depart_point = section.get('departPoint', {})
                                                            arrive_point = section.get('arrivePoint', {})
                                                            depart_time = section.get('departDateTime', 'Unknown')
                                                            arrive_time = section.get('arriveDateTime', 'Unknown')
                                                            duration = section.get('duration', 0)

                                                            print(f"    段 {i+1}: {airline_code} {flight_no}")
                                                            print(f"           {depart_point.get('cityName', '')}({depart_point.get('airportCode', '')}) {depart_time}")
                                                            print(f"        → {arrive_point.get('cityName', '')}({arrive_point.get('airportCode', '')}) {arrive_time}")
                                                            print(f"           飞行时间: {duration}分钟")

                                        # 价格信息
                                        if 'policies' in first_flight and first_flight['policies']:
                                            policy = first_flight['policies'][0]
                                            if 'price' in policy:
                                                price_info = policy['price']
                                                total_price = price_info.get('totalPrice', 0)
                                                adult_price = price_info.get('adult', {})
                                                sale_price = adult_price.get('salePrice', 0)
                                                tax = adult_price.get('tax', 0)
                                                print(f"    💰 总价: ¥{total_price} (票价: ¥{sale_price} + 税费: ¥{tax})")

                        except json.JSONDecodeError as e:
                            print(f"⚠️ SSE JSON解析失败: {e}")
                            print(f"   原始数据: {data_content[:200]}...")

                    elif line.startswith('event: '):
                        event_type = line[7:]
                        print(f"📡 SSE事件: {event_type}")

                    elif line.strip() == '':
                        # 空行表示一个SSE事件结束
                        continue

                # 限制处理数据块数量
                if data_blocks >= 20:
                    print(f"🔄 已处理 {data_blocks} 个数据块，停止解析")
                    break

            print(f"\n📊 === 解析结果 ===")
            print(f"✅ 总数据块: {data_blocks}")
            print(f"✅ 总航班数: {flight_count}")

            if flight_count > 0:
                print(f"🎉 成功！API返回了 {flight_count} 个航班信息")
                print(f"🎯 认证信息有效，可以获取完整的航班数据")
            else:
                print(f"⚠️ 没有获取到航班数据")
                if data_blocks == 0:
                    print(f"💡 可能原因：Token过期或SSE流没有数据")
                else:
                    print(f"💡 可能原因：搜索条件无匹配结果")

        else:
            print(f"❌ API请求失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text[:500]}...")

    except Exception as e:
        print(f"❌ API请求异常: {e}")

if __name__ == "__main__":
    test_with_real_auth()
