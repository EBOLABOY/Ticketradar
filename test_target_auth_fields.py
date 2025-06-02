#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
专门测试获取目标认证字段：Cookie, Token, x-ctx-ubt-pvid, x-ctx-ubt-sid
"""

import requests
import re
import json

def extract_target_auth_fields():
    """提取目标认证字段"""
    print("🎯 开始提取目标认证字段...")
    
    # 创建session
    session = requests.Session()
    
    # 访问Trip.com搜索页面
    search_url = "https://hk.trip.com/flights/showfarefirst?dcity=hkg&acity=lon&ddate=2025-09-30&triptype=ow&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY"
    
    print(f"🔍 访问搜索页面: {search_url}")
    
    try:
        # 发送请求
        response = session.get(search_url, timeout=30)
        print(f"🔍 响应状态码: {response.status_code}")
        
        # 存储目标认证字段
        auth_fields = {}
        
        # 1. ✅ Cookie - 通过session自动管理
        cookie_count = len(session.cookies)
        auth_fields['cookies'] = {cookie.name: cookie.value for cookie in session.cookies}
        print(f"\n🍪 === Cookie信息 ===")
        print(f"✅ Cookie数量: {cookie_count}")
        for cookie in session.cookies:
            print(f"   {cookie.name} = {cookie.value[:50]}...")
        
        # 2. 🔍 Token - 从多个位置查找
        print(f"\n🔑 === Token查找 ===")
        content_type = response.headers.get('Content-Type', '')
        
        # 从响应Headers查找
        token_headers = ['token', 'authorization', 'x-auth-token', 'x-api-token']
        for header_name in token_headers:
            header_variants = [header_name, header_name.upper(), header_name.lower(), header_name.title()]
            for variant in header_variants:
                header_value = response.headers.get(variant)
                if header_value:
                    auth_fields['token'] = header_value
                    print(f"✅ 从Header获取Token ({variant}): {header_value[:50]}...")
                    break
            if auth_fields.get('token'):
                break
        
        # 从HTML内容查找Token
        if 'text/html' in content_type and not auth_fields.get('token'):
            html_content = response.text
            
            token_patterns = [
                (r'window\.token\s*=\s*["\']([^"\']+)["\']', 'window.token'),
                (r'window\.csrfToken\s*=\s*["\']([^"\']+)["\']', 'window.csrfToken'),
                (r'["\']token["\']\s*:\s*["\']([^"\']+)["\']', 'token object'),
                (r'<meta name="token" content="([^"]+)"', 'meta token'),
                (r'<meta name="csrf-token" content="([^"]+)"', 'meta csrf-token'),
                (r'<input[^>]*name="[^"]*token[^"]*"[^>]*value="([^"]+)"', 'input token'),
                (r'data-token=["\']([^"\']+)["\']', 'data-token'),
                (r'_token["\']?\s*[:=]\s*["\']([^"\']+)["\']', '_token')
            ]
            
            for pattern, description in token_patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    auth_fields['token'] = match.group(1)
                    print(f"✅ 从HTML获取Token ({description}): {match.group(1)[:50]}...")
                    break
        
        if not auth_fields.get('token'):
            print("❌ 未找到Token")
        
        # 3. 🔍 x-ctx-ubt-pvid - 页面访问ID
        print(f"\n📄 === x-ctx-ubt-pvid查找 ===")
        
        # 从响应Headers查找
        pvid_headers = ['x-ctx-ubt-pvid', 'x-ubt-pvid', 'pvid']
        for header_name in pvid_headers:
            header_variants = [header_name, header_name.upper(), header_name.lower()]
            for variant in header_variants:
                header_value = response.headers.get(variant)
                if header_value:
                    auth_fields['x-ctx-ubt-pvid'] = header_value
                    print(f"✅ 从Header获取PVID ({variant}): {header_value[:50]}...")
                    break
            if auth_fields.get('x-ctx-ubt-pvid'):
                break
        
        # 从HTML内容查找PVID
        if 'text/html' in content_type and not auth_fields.get('x-ctx-ubt-pvid'):
            html_content = response.text
            
            pvid_patterns = [
                (r'window\.ubtPvid\s*=\s*["\']([^"\']+)["\']', 'window.ubtPvid'),
                (r'window\.pvid\s*=\s*["\']([^"\']+)["\']', 'window.pvid'),
                (r'["\']pvid["\']\s*:\s*["\']([^"\']+)["\']', 'pvid object'),
                (r'data-pvid=["\']([^"\']+)["\']', 'data-pvid'),
                (r'ubt[_-]?pvid["\']?\s*[:=]\s*["\']([^"\']+)["\']', 'ubt_pvid')
            ]
            
            for pattern, description in pvid_patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    auth_fields['x-ctx-ubt-pvid'] = match.group(1)
                    print(f"✅ 从HTML获取PVID ({description}): {match.group(1)[:50]}...")
                    break
        
        # 从Cookie查找PVID
        if not auth_fields.get('x-ctx-ubt-pvid'):
            for cookie in session.cookies:
                if 'pvid' in cookie.name.lower():
                    auth_fields['x-ctx-ubt-pvid'] = cookie.value
                    print(f"✅ 从Cookie获取PVID ({cookie.name}): {cookie.value[:50]}...")
                    break
        
        if not auth_fields.get('x-ctx-ubt-pvid'):
            print("❌ 未找到x-ctx-ubt-pvid")
        
        # 4. 🔍 x-ctx-ubt-sid - 会话ID
        print(f"\n🔗 === x-ctx-ubt-sid查找 ===")
        
        # 从响应Headers查找
        sid_headers = ['x-ctx-ubt-sid', 'x-ubt-sid', 'sid']
        for header_name in sid_headers:
            header_variants = [header_name, header_name.upper(), header_name.lower()]
            for variant in header_variants:
                header_value = response.headers.get(variant)
                if header_value:
                    auth_fields['x-ctx-ubt-sid'] = header_value
                    print(f"✅ 从Header获取SID ({variant}): {header_value[:50]}...")
                    break
            if auth_fields.get('x-ctx-ubt-sid'):
                break
        
        # 从HTML内容查找SID
        if 'text/html' in content_type and not auth_fields.get('x-ctx-ubt-sid'):
            html_content = response.text
            
            sid_patterns = [
                (r'window\.ubtSid\s*=\s*["\']([^"\']+)["\']', 'window.ubtSid'),
                (r'window\.sid\s*=\s*["\']([^"\']+)["\']', 'window.sid'),
                (r'["\']sid["\']\s*:\s*["\']([^"\']+)["\']', 'sid object'),
                (r'data-sid=["\']([^"\']+)["\']', 'data-sid'),
                (r'ubt[_-]?sid["\']?\s*[:=]\s*["\']([^"\']+)["\']', 'ubt_sid')
            ]
            
            for pattern, description in sid_patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    auth_fields['x-ctx-ubt-sid'] = match.group(1)
                    print(f"✅ 从HTML获取SID ({description}): {match.group(1)[:50]}...")
                    break
        
        # 从Cookie查找SID
        if not auth_fields.get('x-ctx-ubt-sid'):
            for cookie in session.cookies:
                if 'sid' in cookie.name.lower() and 'pvid' not in cookie.name.lower():
                    auth_fields['x-ctx-ubt-sid'] = cookie.value
                    print(f"✅ 从Cookie获取SID ({cookie.name}): {cookie.value[:50]}...")
                    break
        
        if not auth_fields.get('x-ctx-ubt-sid'):
            print("❌ 未找到x-ctx-ubt-sid")
        
        # 5. 📊 总结结果
        print(f"\n📊 === 认证字段获取总结 ===")
        found_fields = []
        if auth_fields.get('cookies'): found_fields.append('✅ Cookie')
        else: found_fields.append('❌ Cookie')
        
        if auth_fields.get('token'): found_fields.append('✅ Token')
        else: found_fields.append('❌ Token')
        
        if auth_fields.get('x-ctx-ubt-pvid'): found_fields.append('✅ x-ctx-ubt-pvid')
        else: found_fields.append('❌ x-ctx-ubt-pvid')
        
        if auth_fields.get('x-ctx-ubt-sid'): found_fields.append('✅ x-ctx-ubt-sid')
        else: found_fields.append('❌ x-ctx-ubt-sid')
        
        success_count = len([f for f in found_fields if f.startswith('✅')])
        
        print(f"结果: {', '.join(found_fields)}")
        print(f"成功率: {success_count}/4 ({success_count/4*100:.1f}%)")
        
        # 6. 🚀 演示如何在后续请求中使用
        if success_count > 0:
            print(f"\n🚀 === 后续请求使用示例 ===")
            enhanced_headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            
            if auth_fields.get('token'):
                enhanced_headers['Authorization'] = f'Bearer {auth_fields["token"]}'
                print(f"✅ 添加Authorization header")
            
            if auth_fields.get('x-ctx-ubt-pvid'):
                enhanced_headers['x-ctx-ubt-pvid'] = auth_fields['x-ctx-ubt-pvid']
                print(f"✅ 添加x-ctx-ubt-pvid header")
            
            if auth_fields.get('x-ctx-ubt-sid'):
                enhanced_headers['x-ctx-ubt-sid'] = auth_fields['x-ctx-ubt-sid']
                print(f"✅ 添加x-ctx-ubt-sid header")
            
            print(f"🍪 Session会自动携带 {cookie_count} 个Cookie")
            print(f"📋 增强后的Headers包含 {len(enhanced_headers)} 个字段")
        
        return auth_fields
        
    except Exception as e:
        print(f"❌ 提取过程中出错: {e}")
        return None

if __name__ == "__main__":
    result = extract_target_auth_fields()
    if result:
        print(f"\n🎯 === 测试完成 ===")
        success_fields = [k for k in ['cookies', 'token', 'x-ctx-ubt-pvid', 'x-ctx-ubt-sid'] if result.get(k)]
        print(f"成功获取: {', '.join(success_fields) if success_fields else '无'}")
    else:
        print(f"\n❌ 测试失败")
