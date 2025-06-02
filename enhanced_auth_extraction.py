#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
增强的认证字段提取 - 模拟真实用户行为来获取完整的认证信息
"""

import requests
import json
import time
import re
import urllib.parse
from datetime import datetime

def simulate_real_user_behavior():
    """模拟真实用户行为来获取完整的认证信息"""
    print("🎯 开始模拟真实用户行为获取认证信息...")
    
    # 创建session并设置完整的浏览器环境
    session = requests.Session()
    
    # 设置完整的浏览器headers
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,en-GB;q=0.6',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'sec-ch-ua': '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    })
    
    auth_fields = {}
    
    try:
        # 第一步：访问Trip.com主页
        print(f"🔍 第一步：访问Trip.com主页...")
        homepage_response = session.get("https://hk.trip.com/", timeout=30)
        print(f"✅ 主页状态码: {homepage_response.status_code}")
        print(f"📊 Cookie数量: {len(session.cookies)}")
        time.sleep(2)
        
        # 第二步：访问航班首页
        print(f"🔍 第二步：访问航班首页...")
        flights_homepage = "https://hk.trip.com/flights/?locale=zh-HK&curr=CNY"
        flights_response = session.get(flights_homepage, timeout=30)
        print(f"✅ 航班首页状态码: {flights_response.status_code}")
        print(f"📊 Cookie数量: {len(session.cookies)}")
        time.sleep(3)
        
        # 第三步：模拟搜索表单提交（这可能触发_bfa Cookie）
        print(f"🔍 第三步：模拟搜索表单提交...")
        search_form_data = {
            'dcity': 'sha',
            'acity': 'sel', 
            'ddate': '2025-06-30',
            'rdate': '2025-07-03',
            'triptype': 'rt',  # 往返票
            'class': 'y',
            'quantity': '1',
            'locale': 'zh-HK',
            'curr': 'CNY'
        }
        
        # 使用POST方法提交搜索表单
        search_url = "https://hk.trip.com/flights/showfarefirst"
        search_response = session.post(search_url, data=search_form_data, timeout=30)
        print(f"✅ 搜索提交状态码: {search_response.status_code}")
        print(f"📊 Cookie数量: {len(session.cookies)}")
        time.sleep(2)
        
        # 第四步：访问搜索结果页面
        print(f"🔍 第四步：访问搜索结果页面...")
        search_results_url = f"https://hk.trip.com/flights/showfarefirst?dcity=sha&acity=sel&ddate=2025-06-30&rdate=2025-07-03&triptype=rt&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY"
        results_response = session.get(search_results_url, timeout=30)
        print(f"✅ 搜索结果状态码: {results_response.status_code}")
        print(f"📊 Cookie数量: {len(session.cookies)}")
        time.sleep(3)
        
        # 第五步：尝试触发AJAX请求（可能设置UBT相关Cookie）
        print(f"🔍 第五步：尝试触发AJAX请求...")
        ajax_headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': search_results_url
        }
        
        # 模拟一个可能的AJAX请求
        ajax_url = "https://hk.trip.com/restapi/soa2/27015/FlightListSearch"
        ajax_payload = {
            "head": {
                "cid": "09031043410934928682",
                "ctok": "",
                "cver": "1.0",
                "lang": "01",
                "sid": "8888",
                "syscode": "09"
            },
            "searchCondition": {
                "tripType": 2,  # 往返
                "journeyInfoTypes": [
                    {
                        "journeyNo": 1,
                        "departDate": "2025-06-30",
                        "departCode": "SHA",
                        "arriveCode": "SEL"
                    },
                    {
                        "journeyNo": 2,
                        "departDate": "2025-07-03",
                        "departCode": "SEL",
                        "arriveCode": "SHA"
                    }
                ]
            }
        }
        
        try:
            ajax_response = session.post(ajax_url, headers=ajax_headers, json=ajax_payload, timeout=30)
            print(f"✅ AJAX请求状态码: {ajax_response.status_code}")
            print(f"📊 Cookie数量: {len(session.cookies)}")
        except Exception as e:
            print(f"⚠️ AJAX请求失败: {e}")
        
        time.sleep(2)
        
        # 分析所有获取的Cookie
        print(f"\n📋 === 详细Cookie分析 ===")
        for cookie in session.cookies:
            print(f"  {cookie.name} = {cookie.value}")
        
        # 提取认证字段
        auth_fields = extract_auth_fields_from_session(session)
        
        # 从HTML中提取可能的Token
        if 'text/html' in results_response.headers.get('Content-Type', ''):
            html_tokens = extract_tokens_from_html(results_response.text)
            auth_fields.update(html_tokens)
        
        return auth_fields
        
    except Exception as e:
        print(f"❌ 模拟用户行为过程中出错: {e}")
        return {}

def extract_auth_fields_from_session(session):
    """从session中提取认证字段"""
    auth_fields = {}
    
    # 1. Cookie信息
    auth_fields['cookies'] = {cookie.name: cookie.value for cookie in session.cookies}
    print(f"✅ 提取Cookie: {len(session.cookies)}个")
    
    # 2. 从_bfa Cookie提取SID/PVID
    bfa_cookie = session.cookies.get('_bfa')
    if bfa_cookie:
        print(f"🎯 发现_bfa Cookie: {bfa_cookie}")
        try:
            bfa_parts = bfa_cookie.split('.')
            if len(bfa_parts) >= 3:
                potential_sid = bfa_parts[-3]
                potential_pvid = bfa_parts[-2]
                
                if potential_sid.isdigit() and potential_pvid.isdigit():
                    auth_fields['x-ctx-ubt-sid'] = potential_sid
                    auth_fields['x-ctx-ubt-pvid'] = potential_pvid
                    print(f"✅ 从_bfa提取SID: {potential_sid}")
                    print(f"✅ 从_bfa提取PVID: {potential_pvid}")
                    
                    # VID通常是第二部分
                    if len(bfa_parts) > 1:
                        auth_fields['x-ctx-ubt-vid'] = bfa_parts[1]
                        print(f"✅ 从_bfa提取VID: {bfa_parts[1]}")
        except Exception as e:
            print(f"❌ 解析_bfa Cookie失败: {e}")
    
    # 3. 从_ubtstatus Cookie提取
    ubtstatus_cookie = session.cookies.get('_ubtstatus')
    if ubtstatus_cookie:
        print(f"🎯 发现_ubtstatus Cookie: {ubtstatus_cookie}")
        try:
            decoded_ubtstatus = urllib.parse.unquote(ubtstatus_cookie)
            ubt_data = json.loads(decoded_ubtstatus)
            
            if 'sid' in ubt_data and 'x-ctx-ubt-sid' not in auth_fields:
                auth_fields['x-ctx-ubt-sid'] = str(ubt_data['sid'])
                print(f"✅ 从_ubtstatus提取SID: {ubt_data['sid']}")
            
            if 'pvid' in ubt_data and 'x-ctx-ubt-pvid' not in auth_fields:
                auth_fields['x-ctx-ubt-pvid'] = str(ubt_data['pvid'])
                print(f"✅ 从_ubtstatus提取PVID: {ubt_data['pvid']}")
                
            if 'vid' in ubt_data and 'x-ctx-ubt-vid' not in auth_fields:
                auth_fields['x-ctx-ubt-vid'] = ubt_data['vid']
                print(f"✅ 从_ubtstatus提取VID: {ubt_data['vid']}")
                
        except Exception as e:
            print(f"❌ 解析_ubtstatus Cookie失败: {e}")
    
    # 4. 其他UBT相关Cookie
    ubt_vid_cookie = session.cookies.get('UBT_VID')
    if ubt_vid_cookie and 'x-ctx-ubt-vid' not in auth_fields:
        auth_fields['x-ctx-ubt-vid'] = ubt_vid_cookie
        print(f"✅ 从UBT_VID Cookie提取VID: {ubt_vid_cookie}")
    
    return auth_fields

def extract_tokens_from_html(html_content):
    """从HTML内容中提取Token"""
    tokens = {}
    
    # Token相关的正则表达式
    token_patterns = [
        (r'window\.token\s*=\s*["\']([^"\']+)["\']', 'window.token'),
        (r'window\.csrfToken\s*=\s*["\']([^"\']+)["\']', 'window.csrfToken'),
        (r'["\']token["\']\s*:\s*["\']([^"\']+)["\']', 'token object'),
        (r'<meta name="token" content="([^"]+)"', 'meta token'),
        (r'<meta name="csrf-token" content="([^"]+)"', 'meta csrf-token'),
        (r'data-token=["\']([^"\']+)["\']', 'data-token'),
        (r'_token["\']?\s*[:=]\s*["\']([^"\']+)["\']', '_token')
    ]
    
    for pattern, description in token_patterns:
        match = re.search(pattern, html_content, re.IGNORECASE)
        if match:
            tokens['token'] = match.group(1)
            print(f"✅ 从HTML提取Token ({description}): {match.group(1)[:50]}...")
            break
    
    return tokens

def test_enhanced_api_request(auth_fields):
    """使用增强的认证信息测试API请求"""
    if not auth_fields:
        print("❌ 没有认证信息，跳过API测试")
        return
    
    print(f"\n🚀 === 使用增强认证信息测试API ===")
    
    # 创建新的session
    session = requests.Session()
    
    # 恢复Cookie
    for name, value in auth_fields.get('cookies', {}).items():
        session.cookies.set(name, value)
    
    # 构建增强的headers
    enhanced_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'Accept': 'text/event-stream',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Ctx-Country': 'HK',
        'X-Ctx-Currency': 'CNY',
        'X-Ctx-Locale': 'zh-HK'
    }
    
    # 添加认证字段
    if auth_fields.get('token'):
        enhanced_headers['Authorization'] = f'Bearer {auth_fields["token"]}'
        print(f"✅ 添加Token到headers")
    
    if auth_fields.get('x-ctx-ubt-sid'):
        enhanced_headers['x-ctx-ubt-sid'] = auth_fields['x-ctx-ubt-sid']
        print(f"✅ 添加SID到headers: {auth_fields['x-ctx-ubt-sid']}")
    
    if auth_fields.get('x-ctx-ubt-pvid'):
        enhanced_headers['x-ctx-ubt-pvid'] = auth_fields['x-ctx-ubt-pvid']
        print(f"✅ 添加PVID到headers: {auth_fields['x-ctx-ubt-pvid']}")
    
    if auth_fields.get('x-ctx-ubt-vid'):
        enhanced_headers['x-ctx-ubt-vid'] = auth_fields['x-ctx-ubt-vid']
        print(f"✅ 添加VID到headers: {auth_fields['x-ctx-ubt-vid'][:50]}...")
    
    print(f"📊 最终headers包含 {len(enhanced_headers)} 个字段")
    print(f"🍪 Session包含 {len(session.cookies)} 个Cookie")
    
    # 这里可以添加实际的API测试代码
    print(f"🎯 认证信息已准备就绪，可以用于API调用")

if __name__ == "__main__":
    # 执行增强的认证获取
    auth_result = simulate_real_user_behavior()
    
    # 显示结果
    print(f"\n📊 === 认证字段获取结果 ===")
    found_fields = []
    if auth_result.get('cookies'): found_fields.append(f"Cookie({len(auth_result['cookies'])})")
    if auth_result.get('token'): found_fields.append("Token")
    if auth_result.get('x-ctx-ubt-sid'): found_fields.append("SID")
    if auth_result.get('x-ctx-ubt-pvid'): found_fields.append("PVID")
    if auth_result.get('x-ctx-ubt-vid'): found_fields.append("VID")
    
    print(f"成功获取: {', '.join(found_fields) if found_fields else '仅基础Cookie'}")
    
    # 测试API请求
    test_enhanced_api_request(auth_result)
