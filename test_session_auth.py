#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试requests.Session()能获取的各种认证字段
"""

import requests
import json
import re

def test_session_auth_extraction():
    """测试Session能获取的认证字段"""
    print("🔍 测试Session认证字段获取能力...")
    
    # 创建session
    session = requests.Session()
    
    # 测试URL - 使用Trip.com的搜索页面
    test_url = "https://hk.trip.com/flights/showfarefirst?dcity=hkg&acity=lon&ddate=2025-09-30&triptype=ow&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY"
    
    print(f"🔍 访问测试URL: {test_url}")
    
    try:
        # 发送请求
        response = session.get(test_url, timeout=30)
        print(f"🔍 响应状态码: {response.status_code}")
        
        # 1. Cookie信息
        print(f"\n📋 === Cookie信息 ===")
        print(f"Cookie数量: {len(session.cookies)}")
        for cookie in session.cookies:
            print(f"  {cookie.name} = {cookie.value[:50]}...")
        
        # 2. 响应Headers中的认证字段
        print(f"\n📋 === 响应Headers中的认证字段 ===")
        auth_headers = {}
        potential_auth_headers = [
            'Authorization', 'X-CSRF-Token', 'X-Session-ID', 'X-API-Key',
            'X-JWT-Token', 'X-Refresh-Token', 'X-Access-Token', 'X-Auth-Token',
            'X-Request-ID', 'X-Trace-ID', 'X-Transaction-ID', 'Set-Authorization',
            'WWW-Authenticate', 'X-RateLimit-Token', 'X-User-Token'
        ]
        
        found_auth_headers = 0
        for header_name in potential_auth_headers:
            header_value = response.headers.get(header_name)
            if header_value:
                auth_headers[header_name] = header_value
                print(f"  ✅ {header_name}: {header_value[:100]}...")
                found_auth_headers += 1
        
        if found_auth_headers == 0:
            print("  ⚠️ 未发现标准认证Headers")
        
        # 3. 所有响应Headers（查找可能的认证相关字段）
        print(f"\n📋 === 所有响应Headers ===")
        auth_related_headers = []
        for header_name, header_value in response.headers.items():
            if any(keyword in header_name.lower() for keyword in ['auth', 'token', 'session', 'csrf', 'key', 'id']):
                auth_related_headers.append((header_name, header_value))
                print(f"  🔍 {header_name}: {header_value[:100]}...")
        
        if not auth_related_headers:
            print("  ⚠️ 未发现认证相关的Headers")
        
        # 4. 从响应体中提取认证信息
        print(f"\n📋 === 响应体中的认证信息 ===")
        content_type = response.headers.get('Content-Type', '')
        print(f"Content-Type: {content_type}")
        
        if 'application/json' in content_type:
            try:
                response_data = response.json()
                potential_tokens = ['token', 'csrf_token', 'session_key', 'api_key', 'access_token', 'auth_token', 'jwt']
                found_tokens = 0
                for token_key in potential_tokens:
                    if token_key in response_data:
                        print(f"  ✅ JSON中的{token_key}: {str(response_data[token_key])[:100]}...")
                        found_tokens += 1
                
                if found_tokens == 0:
                    print("  ⚠️ JSON响应中未发现token字段")
            except:
                print("  ❌ 响应不是有效的JSON")
        
        # 5. HTML中的meta标签和隐藏字段
        elif 'text/html' in content_type:
            print("  🔍 分析HTML内容中的认证字段...")
            html_content = response.text
            
            # 查找meta标签中的token
            meta_patterns = [
                (r'<meta name="csrf-token" content="([^"]+)"', 'CSRF Token (meta)'),
                (r'<meta name="_token" content="([^"]+)"', '_token (meta)'),
                (r'<meta name="api-token" content="([^"]+)"', 'API Token (meta)'),
                (r'<meta name="session-token" content="([^"]+)"', 'Session Token (meta)')
            ]
            
            found_meta_tokens = 0
            for pattern, description in meta_patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    print(f"  ✅ {description}: {match.group(1)[:100]}...")
                    found_meta_tokens += 1
            
            # 查找隐藏的input字段
            input_patterns = [
                (r'<input[^>]*name="[^"]*token[^"]*"[^>]*value="([^"]+)"', 'Token Input'),
                (r'<input[^>]*name="[^"]*csrf[^"]*"[^>]*value="([^"]+)"', 'CSRF Input'),
                (r'<input[^>]*name="_token"[^>]*value="([^"]+)"', '_token Input')
            ]
            
            found_input_tokens = 0
            for pattern, description in input_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                for match in matches[:3]:  # 只显示前3个
                    print(f"  ✅ {description}: {match[:100]}...")
                    found_input_tokens += 1
            
            # 查找JavaScript中的token
            js_patterns = [
                (r'window\.csrfToken\s*=\s*["\']([^"\']+)["\']', 'JS CSRF Token'),
                (r'window\.apiToken\s*=\s*["\']([^"\']+)["\']', 'JS API Token'),
                (r'["\']token["\']\s*:\s*["\']([^"\']+)["\']', 'JS Token Object')
            ]
            
            found_js_tokens = 0
            for pattern, description in js_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                for match in matches[:3]:  # 只显示前3个
                    print(f"  ✅ {description}: {match[:100]}...")
                    found_js_tokens += 1
            
            total_html_tokens = found_meta_tokens + found_input_tokens + found_js_tokens
            if total_html_tokens == 0:
                print("  ⚠️ HTML中未发现认证token")
            else:
                print(f"  📊 HTML中总共发现 {total_html_tokens} 个认证token")
        
        # 6. Session状态总结
        print(f"\n📋 === Session状态总结 ===")
        print(f"  Cookie数量: {len(session.cookies)}")
        print(f"  认证Headers: {len(auth_headers)}")
        print(f"  认证相关Headers: {len(auth_related_headers)}")
        
        # 7. 演示如何在后续请求中使用这些认证信息
        print(f"\n📋 === 后续请求中的认证使用 ===")
        
        # 创建一个新的请求headers，包含所有发现的认证信息
        enhanced_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        
        # 添加发现的认证headers
        for auth_key, auth_value in auth_headers.items():
            enhanced_headers[auth_key] = auth_value
            print(f"  ✅ 添加认证Header: {auth_key}")
        
        print(f"  📊 增强后的Headers包含 {len(enhanced_headers)} 个字段")
        print(f"  🔄 Session会自动携带 {len(session.cookies)} 个Cookie")
        
        return {
            'cookies': len(session.cookies),
            'auth_headers': auth_headers,
            'auth_related_headers': auth_related_headers,
            'enhanced_headers': enhanced_headers
        }
        
    except Exception as e:
        print(f"❌ 测试过程中出错: {e}")
        return None

if __name__ == "__main__":
    result = test_session_auth_extraction()
    if result:
        print(f"\n🎯 === 测试完成 ===")
        print(f"Session成功获取了 {result['cookies']} 个Cookie和 {len(result['auth_headers'])} 个认证Header")
    else:
        print(f"\n❌ 测试失败")
