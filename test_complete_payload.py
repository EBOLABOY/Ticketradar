#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试完整的payload结构，包含所有必要参数
"""

import requests
import json
import time
from trusted_cookies_manager import TrustedCookiesManager

def test_complete_payload():
    """测试完整的payload结构"""
    print("🔍 测试完整的payload结构...")
    
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
        'Referer': 'https://hk.trip.com/flights/showfarefirst?flighttype=OW&dcity=SHA&acity=NRT&ddate=2025-06-30&quantity=1&class=Y&NonstopOnly=on&from=undefined&lowpricesource=historySearch&locale=zh-HK&curr=CNY',
        'Token': real_auth['token'],
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'X-Ctx-Country': 'HK',
        'X-Ctx-Currency': 'CNY',
        'X-Ctx-Locale': 'zh-HK',
        'X-Ctx-Ubt-Pvid': real_auth['x-ctx-ubt-pvid'],
        'X-Ctx-Ubt-Sid': real_auth['x-ctx-ubt-sid'],
        'X-Ctx-Ubt-Vid': real_auth['x-ctx-ubt-vid']
    }
    
    # 测试不同的路线
    test_routes = [
        {
            "name": "上海→东京 (热门直飞路线)",
            "depart": "SHA",
            "arrive": "NRT",
            "date": "2025-06-30"
        },
        {
            "name": "北京→上海 (国内热门路线)",
            "depart": "BJS",
            "arrive": "SHA",
            "date": "2025-06-30"
        },
        {
            "name": "香港→东京 (热门国际路线)",
            "depart": "HKG",
            "arrive": "NRT",
            "date": "2025-06-30"
        }
    ]
    
    api_url = "https://hk.trip.com/restapi/soa2/27015/FlightListSearchSSE"
    
    for route in test_routes:
        print(f"\n🛫 测试路线: {route['name']}")
        print(f"   {route['depart']} → {route['arrive']} ({route['date']})")
        
        # 构建完整的payload
        payload = {
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
                        "departDate": route['date'],
                        "departCode": route['depart'],
                        "arriveCode": route['arrive'],
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
                        "name": "abTesting",
                        "value": "M:71,240723_IBU_OLPS:B;M:0,250520_IBU_FPG:B;M:2,250421_IBU_snth:B;M:34,250430_IBU_ais:A;M:7,240308_IBU_olrp:B;M:6,240417_IBU_Ohtwl:A;M:28,240912_IBU_jpwjo:A;M:-1,240924_IBU_uspoe:A;M:-1,240509_IBU_RFUO:A;M:-1,240924_IBU_usphe:A;M:76,241128_IBU_uspso:A;M:94,241128_IBU_usphs:A;M:80,241031_IBU_OLFL:F;M:44,241224_IBU_TOLNG:B;M:46,250109_IBU_OLFBO:E;M:95,250206_IBU_sxbjo:A;M:9,250219_IBU_OLLIST:A;M:21,250207_IBU_FLTOLM:E;M:41,250305_IBU_sxxw:B;M:7,250313_IBU_GWBVO:B;M:82,250403_IBU_wcd:D;M:43,250423_IBU_olm:B;M:95,250403_IBU_PDOOL:D;M:43,250408_IBU_fltollogin:A;M:0,250417_IBU_olf:A;M:93,250515_IBU_plbb:A;M:68,250527_IBU_lsf:A;M:37,250521_IBU_ONCOPR:A;"
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
                        "name": "uuid",
                        "value": ""
                    },
                    {
                        "name": "useDistributionType",
                        "value": "1"
                    },
                    {
                        "name": "flt_app_session_transactionId",
                        "value": "1-mf-20250602140326038-WEB"
                    },
                    {
                        "name": "vid",
                        "value": real_auth['x-ctx-ubt-vid']
                    },
                    {
                        "name": "pvid",
                        "value": real_auth['x-ctx-ubt-pvid']
                    },
                    {
                        "name": "Flt_SessionId",
                        "value": real_auth['x-ctx-ubt-sid']
                    },
                    {
                        "name": "channel",
                        "value": ""
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
                        "value": "2025-06-02T14:03:26+08:00"
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
                        "value": "359085cf-4b77-4efc-a26c-c570ee29dd7b"
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
        
        try:
            response = session.post(
                api_url,
                headers=headers,
                json=payload,
                stream=True,
                timeout=30
            )
            
            print(f"   状态码: {response.status_code}")
            
            if response.status_code == 200:
                # 解析SSE响应
                flight_count = 0
                record_count = 0
                lowest_price = 0
                direct_available = False
                
                for line in response.iter_lines(decode_unicode=True):
                    if line and line.startswith('data: '):
                        data_content = line[6:]
                        
                        try:
                            if data_content.strip() and data_content != '[DONE]':
                                json_data = json.loads(data_content)
                                
                                # 基本信息
                                if 'basicInfo' in json_data:
                                    basic_info = json_data['basicInfo']
                                    record_count = basic_info.get('recordCount', 0)
                                    if 'lowestPrice' in basic_info:
                                        lowest_price = basic_info['lowestPrice'].get('totalPrice', 0)
                                
                                # 航班列表
                                if 'itineraryList' in json_data:
                                    itinerary_list = json_data['itineraryList']
                                    flight_count = len(itinerary_list)
                                
                                # 过滤选项
                                if 'filterOptionList' in json_data:
                                    filter_options = json_data['filterOptionList']
                                    if filter_options:
                                        hot_filters = filter_options[0].get('hotFilters', [])
                                        for hot_filter in hot_filters:
                                            if hot_filter.get('type') == 'DIRECT':
                                                direct_available = True
                                                direct_price = hot_filter.get('lowestPrice', 0)
                                                print(f"   🎯 直飞可用，价格: ¥{direct_price}")
                                
                        except json.JSONDecodeError:
                            continue
                
                print(f"   📊 结果:")
                print(f"      记录数: {record_count}")
                print(f"      航班数: {flight_count}")
                print(f"      最低价: ¥{lowest_price}")
                print(f"      直飞可用: {'是' if direct_available else '否'}")
                
                # 如果有航班数据，显示第一个航班的详情
                if flight_count > 0:
                    print(f"   ✅ 成功获取航班数据！")
                else:
                    print(f"   ⚠️ 该路线暂无航班数据")
                
            else:
                print(f"   ❌ 请求失败: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ 测试失败: {e}")
        
        # 添加延迟避免请求过于频繁
        time.sleep(3)

if __name__ == "__main__":
    test_complete_payload()
    
    print(f"\n🎯 总结:")
    print(f"✅ 测试了多个热门路线")
    print(f"✅ 使用了完整的payload结构")
    print(f"✅ 包含了所有必要的认证参数")
    print(f"💡 如果某些路线没有数据，可能是该日期确实没有航班")
