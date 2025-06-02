#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
受信任Cookie管理器 - 从正常浏览器会话中导入和管理受信任的Cookie
"""

import requests
import json
import os
from datetime import datetime, timedelta
import time

class TrustedCookiesManager:
    def __init__(self, cookies_file="trusted_cookies.json"):
        self.cookies_file = cookies_file
        self.session = None
        
    def load_cookies_from_file(self, session):
        """从文件加载受信任的Cookie到session"""
        try:
            if not os.path.exists(self.cookies_file):
                print(f"❌ Cookie文件不存在: {self.cookies_file}")
                print(f"📝 请先使用浏览器导出Cookie到该文件")
                return False
                
            with open(self.cookies_file, "r", encoding='utf-8') as f:
                saved_cookies = json.load(f)
            
            if not saved_cookies:
                print(f"❌ Cookie文件为空")
                return False
                
            loaded_count = 0
            for cookie_dict in saved_cookies:
                try:
                    # 检查Cookie是否过期
                    if 'expirationDate' in cookie_dict:
                        expiry_timestamp = cookie_dict['expirationDate']
                        if expiry_timestamp < time.time():
                            print(f"⚠️ 跳过过期Cookie: {cookie_dict['name']}")
                            continue
                    
                    # 设置Cookie到session
                    session.cookies.set(
                        name=cookie_dict['name'],
                        value=cookie_dict['value'],
                        domain=cookie_dict.get('domain', '.trip.com'),
                        path=cookie_dict.get('path', '/'),
                        secure=cookie_dict.get('secure', False),
                        rest={'HttpOnly': cookie_dict.get('httpOnly', False)}
                    )
                    loaded_count += 1
                    
                except Exception as e:
                    print(f"⚠️ 加载Cookie失败 {cookie_dict.get('name', 'unknown')}: {e}")
                    continue
            
            print(f"✅ 成功加载 {loaded_count} 个受信任Cookie")
            
            # 显示关键Cookie
            key_cookies = ['_bfa', 'UBT_VID', 'GUID', 'bm_s', 'bm_so', '_combined']
            found_key_cookies = []
            for key_cookie in key_cookies:
                if session.cookies.get(key_cookie):
                    found_key_cookies.append(key_cookie)
                    
            if found_key_cookies:
                print(f"🎯 发现关键Cookie: {', '.join(found_key_cookies)}")
            else:
                print(f"⚠️ 未发现关键Cookie，可能需要重新导出")
                
            return True
            
        except FileNotFoundError:
            print(f"❌ Cookie文件未找到: {self.cookies_file}")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ Cookie文件格式错误: {e}")
            return False
        except Exception as e:
            print(f"❌ 加载Cookie失败: {e}")
            return False
    
    def create_trusted_session(self):
        """创建一个加载了受信任Cookie的session"""
        session = requests.Session()
        
        # 设置完整的浏览器headers
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
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
        
        # 加载受信任的Cookie
        if self.load_cookies_from_file(session):
            print(f"🎯 受信任Session创建成功")
            self.session = session
            return session
        else:
            print(f"❌ 受信任Session创建失败，返回普通Session")
            return session
    
    def get_fresh_token_and_context(self, referer_url):
        """使用受信任session获取最新的token和上下文信息"""
        if not self.session:
            print(f"❌ 受信任Session未初始化")
            return None
            
        try:
            print(f"🔍 使用受信任Session访问: {referer_url}")
            
            # 使用受信任session访问referer页面
            response = self.session.get(referer_url, timeout=30)
            print(f"✅ 受信任Session访问状态码: {response.status_code}")
            print(f"📊 Session Cookie数量: {len(self.session.cookies)}")
            
            if response.status_code != 200:
                print(f"❌ 访问失败，状态码: {response.status_code}")
                return None
            
            # 提取token和其他动态信息
            context = self.extract_context_from_response(response)
            
            return context
            
        except Exception as e:
            print(f"❌ 获取token和上下文失败: {e}")
            return None
    
    def extract_context_from_response(self, response):
        """从响应中提取完整的上下文信息"""
        import re
        import urllib.parse
        
        context = {}
        html_content = response.text
        
        # 1. 提取token
        token_patterns = [
            (r'window\.token\s*=\s*["\']([^"\']+)["\']', 'window.token'),
            (r'["\']token["\']\s*:\s*["\']([^"\']+)["\']', 'token object'),
            (r'<meta name="token" content="([^"]+)"', 'meta token'),
            (r'data-token=["\']([^"\']+)["\']', 'data-token'),
            (r'csrf[_-]?token["\']?\s*[:=]\s*["\']([^"\']+)["\']', 'csrf token')
        ]
        
        for pattern, description in token_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                context['token'] = match.group(1)
                print(f"✅ 提取Token ({description}): {match.group(1)[:50]}...")
                break
        
        # 2. 从Cookie中提取关键信息
        cookies = self.session.cookies
        
        # GUID
        guid_cookie = cookies.get('GUID')
        if guid_cookie:
            context['guid'] = guid_cookie
            print(f"✅ 提取GUID: {guid_cookie}")
        
        # _combined中的transaction_id和page_id
        combined_cookie = cookies.get('_combined')
        if combined_cookie:
            try:
                decoded_combined = urllib.parse.unquote(combined_cookie)
                # 解析格式：transactionId%3D...%26pageId%3D...
                if 'transactionId' in decoded_combined and 'pageId' in decoded_combined:
                    parts = decoded_combined.split('&')
                    for part in parts:
                        if part.startswith('transactionId='):
                            context['transaction_id'] = part.split('=', 1)[1]
                        elif part.startswith('pageId='):
                            context['page_id'] = part.split('=', 1)[1]
                        elif part.startswith('initPageId='):
                            context['init_page_id'] = part.split('=', 1)[1]
                    print(f"✅ 从_combined提取: transaction_id={context.get('transaction_id')}, page_id={context.get('page_id')}")
            except Exception as e:
                print(f"⚠️ 解析_combined Cookie失败: {e}")
        
        # UBT相关信息
        ubt_vid = cookies.get('UBT_VID')
        if ubt_vid:
            context['ubt_vid'] = ubt_vid
            print(f"✅ 提取UBT_VID: {ubt_vid}")
        
        # 从_bfa Cookie提取SID/PVID
        bfa_cookie = cookies.get('_bfa')
        if bfa_cookie:
            try:
                bfa_parts = bfa_cookie.split('.')
                if len(bfa_parts) >= 3:
                    potential_sid = bfa_parts[-3]
                    potential_pvid = bfa_parts[-2]
                    
                    if potential_sid.isdigit() and potential_pvid.isdigit():
                        context['ubt_sid'] = potential_sid
                        context['ubt_pvid'] = potential_pvid
                        print(f"✅ 从_bfa提取SID: {potential_sid}, PVID: {potential_pvid}")
                    
                    # VID通常是第二部分
                    if len(bfa_parts) > 1 and not context.get('ubt_vid'):
                        context['ubt_vid'] = bfa_parts[1]
                        print(f"✅ 从_bfa提取VID: {bfa_parts[1]}")
            except Exception as e:
                print(f"⚠️ 解析_bfa Cookie失败: {e}")
        
        # 3. 显示提取结果
        extracted_fields = []
        if context.get('token'): extracted_fields.append('Token')
        if context.get('guid'): extracted_fields.append('GUID')
        if context.get('transaction_id'): extracted_fields.append('TransactionID')
        if context.get('ubt_vid'): extracted_fields.append('UBT_VID')
        if context.get('ubt_sid'): extracted_fields.append('UBT_SID')
        if context.get('ubt_pvid'): extracted_fields.append('UBT_PVID')
        
        print(f"🎯 成功提取上下文字段: {', '.join(extracted_fields) if extracted_fields else '无'}")
        
        return context
    
    def save_cookies_to_file(self, cookies_data, filename=None):
        """保存Cookie数据到文件"""
        if filename is None:
            filename = self.cookies_file
            
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(cookies_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Cookie已保存到: {filename}")
            return True
        except Exception as e:
            print(f"❌ 保存Cookie失败: {e}")
            return False

def create_cookie_template():
    """创建Cookie模板文件，帮助用户了解格式"""
    template = [
        {
            "name": "GUID",
            "value": "09034108219101041886",
            "domain": ".trip.com",
            "path": "/",
            "secure": False,
            "httpOnly": False,
            "expirationDate": 1893456000
        },
        {
            "name": "_bfa",
            "value": "1.1746708309569.1d384rgx2qT7.1.1748840791819.1748840834949.25.7.0",
            "domain": ".trip.com",
            "path": "/",
            "secure": False,
            "httpOnly": False,
            "expirationDate": 1893456000
        },
        {
            "name": "UBT_VID",
            "value": "1748841554858.797eVts6bH1i",
            "domain": ".trip.com",
            "path": "/",
            "secure": False,
            "httpOnly": False,
            "expirationDate": 1893456000
        }
    ]
    
    with open("cookie_template.json", 'w', encoding='utf-8') as f:
        json.dump(template, f, indent=2, ensure_ascii=False)
    
    print("📝 已创建Cookie模板文件: cookie_template.json")
    print("请使用浏览器扩展(如EditThisCookie)导出hk.trip.com的Cookie，")
    print("并保存为trusted_cookies.json文件")

if __name__ == "__main__":
    # 创建模板文件
    create_cookie_template()
    
    # 测试受信任Cookie管理器
    manager = TrustedCookiesManager()
    session = manager.create_trusted_session()
    
    if session:
        print("🎯 受信任Session测试成功")
    else:
        print("❌ 受信任Session测试失败")
