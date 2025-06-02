#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从Trip.com页面提取真实的API payload信息
"""

import requests
import json
import re
from trusted_cookies_manager import TrustedCookiesManager

def extract_trip_payload():
    """从Trip.com页面提取payload信息"""
    print("🔍 开始从Trip.com页面提取payload信息...")
    
    # 创建受信任Cookie管理器
    manager = TrustedCookiesManager("trusted_cookies.json")
    session = manager.create_trusted_session()
    
    if not session:
        print("❌ 无法创建受信任Session")
        return
    
    # 访问航班搜索页面
    search_url = "https://hk.trip.com/flights/showfarefirst?dcity=sha&acity=sel&ddate=2025-06-30&triptype=ow&class=y&quantity=1&locale=zh-HK&curr=CNY"
    
    try:
        print(f"🌐 访问页面: {search_url}")
        response = session.get(search_url, timeout=30)
        print(f"✅ 页面访问状态码: {response.status_code}")
        
        if response.status_code == 200:
            html_content = response.text
            print(f"📄 页面内容长度: {len(html_content)}")
            
            # 提取JavaScript中的配置信息
            print(f"\n🔍 开始提取JavaScript配置...")
            
            # 1. 提取window.__INITIAL_STATE__
            initial_state_pattern = r'window\.__INITIAL_STATE__\s*=\s*({.*?});'
            initial_state_match = re.search(initial_state_pattern, html_content, re.DOTALL)
            if initial_state_match:
                try:
                    initial_state = json.loads(initial_state_match.group(1))
                    print(f"✅ 找到 __INITIAL_STATE__")
                    print(f"   顶级键: {list(initial_state.keys())}")
                    
                    # 保存到文件
                    with open("initial_state.json", "w", encoding="utf-8") as f:
                        json.dump(initial_state, f, ensure_ascii=False, indent=2)
                    print(f"💾 已保存到 initial_state.json")
                    
                except json.JSONDecodeError as e:
                    print(f"⚠️ 解析 __INITIAL_STATE__ 失败: {e}")
            
            # 2. 提取window.IBU_CONFIG
            ibu_config_pattern = r'window\.IBU_CONFIG\s*=\s*({.*?});'
            ibu_config_match = re.search(ibu_config_pattern, html_content, re.DOTALL)
            if ibu_config_match:
                try:
                    ibu_config = json.loads(ibu_config_match.group(1))
                    print(f"✅ 找到 IBU_CONFIG")
                    print(f"   顶级键: {list(ibu_config.keys())}")
                    
                    # 保存到文件
                    with open("ibu_config.json", "w", encoding="utf-8") as f:
                        json.dump(ibu_config, f, ensure_ascii=False, indent=2)
                    print(f"💾 已保存到 ibu_config.json")
                    
                except json.JSONDecodeError as e:
                    print(f"⚠️ 解析 IBU_CONFIG 失败: {e}")
            
            # 3. 提取其他配置信息
            config_patterns = [
                (r'window\.serverRenderData\s*=\s*({.*?});', "serverRenderData"),
                (r'window\.flightSearchConfig\s*=\s*({.*?});', "flightSearchConfig"),
                (r'window\.searchParams\s*=\s*({.*?});', "searchParams"),
                (r'window\.apiConfig\s*=\s*({.*?});', "apiConfig"),
            ]
            
            for pattern, name in config_patterns:
                match = re.search(pattern, html_content, re.DOTALL)
                if match:
                    try:
                        config_data = json.loads(match.group(1))
                        print(f"✅ 找到 {name}")
                        print(f"   顶级键: {list(config_data.keys())}")
                        
                        # 保存到文件
                        with open(f"{name}.json", "w", encoding="utf-8") as f:
                            json.dump(config_data, f, ensure_ascii=False, indent=2)
                        print(f"💾 已保存到 {name}.json")
                        
                    except json.JSONDecodeError as e:
                        print(f"⚠️ 解析 {name} 失败: {e}")
            
            # 4. 提取API端点信息
            print(f"\n🔍 搜索API端点...")
            api_patterns = [
                r'FlightListSearchSSE',
                r'fuzzySearch',
                r'/restapi/soa2/\d+/',
                r'https://[^"\']*trip\.com[^"\']*api[^"\']*',
            ]
            
            found_apis = set()
            for pattern in api_patterns:
                matches = re.findall(pattern, html_content)
                for match in matches:
                    found_apis.add(match)
            
            if found_apis:
                print(f"✅ 找到API端点:")
                for api in sorted(found_apis):
                    print(f"   - {api}")
            
            # 5. 提取Cookie和认证信息
            print(f"\n🔍 当前Session Cookie:")
            for cookie in session.cookies:
                if cookie.name in ['_bfa', 'UBT_VID', 'GUID', '_combined']:
                    print(f"   🔑 {cookie.name}: {cookie.value[:50]}...")
            
            # 6. 搜索payload结构
            print(f"\n🔍 搜索payload结构...")
            payload_patterns = [
                r'"searchCriteria":\s*{[^}]+}',
                r'"filterType":\s*{[^}]+}',
                r'"sortInfoType":\s*{[^}]+}',
                r'"head":\s*{[^}]+}',
            ]
            
            for pattern in payload_patterns:
                matches = re.findall(pattern, html_content)
                if matches:
                    print(f"✅ 找到payload片段: {pattern}")
                    for i, match in enumerate(matches[:3]):  # 只显示前3个
                        print(f"   {i+1}: {match[:100]}...")
            
        else:
            print(f"❌ 页面访问失败，状态码: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 提取过程出错: {e}")

def analyze_existing_payload():
    """分析我们当前使用的payload"""
    print(f"\n🔍 分析当前payload结构...")
    
    # 这是我们当前使用的payload结构
    current_payload = {
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
    
    print(f"📋 当前payload结构:")
    print(json.dumps(current_payload, ensure_ascii=False, indent=2))
    
    # 保存当前payload
    with open("current_payload.json", "w", encoding="utf-8") as f:
        json.dump(current_payload, f, ensure_ascii=False, indent=2)
    print(f"💾 已保存到 current_payload.json")

if __name__ == "__main__":
    extract_trip_payload()
    analyze_existing_payload()
    
    print(f"\n🎯 总结:")
    print(f"✅ 已从Trip.com页面提取配置信息")
    print(f"✅ 已分析当前payload结构")
    print(f"📁 生成的文件:")
    print(f"   - initial_state.json (页面初始状态)")
    print(f"   - ibu_config.json (IBU配置)")
    print(f"   - current_payload.json (当前payload)")
    print(f"   - 其他配置文件...")
