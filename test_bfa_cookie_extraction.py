#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试从_bfa Cookie中提取x-ctx-ubt-sid和x-ctx-ubt-pvid
"""

import requests
import json
import urllib.parse

def test_bfa_cookie_extraction():
    """测试_bfa Cookie的解析"""
    print("🎯 测试_bfa Cookie解析...")

    # 创建session并设置完整的浏览器headers
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

    # 第一步：访问航班首页
    flights_homepage = "https://hk.trip.com/flights/?locale=zh-HK&curr=CNY"
    print(f"🔍 第一步：访问Trip.com航班首页...")
    try:
        homepage_response = session.get(flights_homepage, timeout=30)
        print(f"🔍 航班首页响应状态码: {homepage_response.status_code}")
        print(f"🔍 航班首页访问后Cookie数量: {len(session.cookies)}")

        # 显示新获取的Cookie
        print(f"🔍 航班首页获取的Cookie:")
        for cookie in session.cookies:
            print(f"    {cookie.name} = {cookie.value[:100]}...")

    except Exception as e:
        print(f"⚠️ 访问航班首页失败: {e}")

    # 等待一下，模拟用户浏览行为
    import time
    time.sleep(3)

    # 第二步：访问通用主页
    print(f"🔍 第二步：访问Trip.com通用主页...")
    try:
        main_homepage_response = session.get("https://hk.trip.com/", timeout=30)
        print(f"🔍 通用主页响应状态码: {main_homepage_response.status_code}")
        print(f"🔍 通用主页访问后Cookie数量: {len(session.cookies)}")
    except Exception as e:
        print(f"⚠️ 访问通用主页失败: {e}")

    time.sleep(2)

    # 第三步：访问搜索页面
    search_url = "https://hk.trip.com/flights/showfarefirst?dcity=hkg&acity=lon&ddate=2025-09-30&triptype=ow&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY"

    print(f"🔍 第三步：访问搜索页面获取更多Cookie...")

    try:
        # 发送请求获取Cookie
        response = session.get(search_url, timeout=30)
        print(f"🔍 搜索页面响应状态码: {response.status_code}")
        print(f"🔍 搜索页面访问后Cookie数量: {len(session.cookies)}")

        time.sleep(2)

        # 第四步：再次访问航班首页，有时候需要多次访问才能获取完整的Cookie
        print(f"🔍 第四步：再次访问航班首页...")
        response2 = session.get(flights_homepage, timeout=30)
        print(f"🔍 第二次访问航班首页后Cookie数量: {len(session.cookies)}")

        time.sleep(2)

        # 第五步：尝试访问一个可能触发UBT Cookie的页面
        print(f"🔍 第五步：访问可能触发UBT的页面...")
        ubt_trigger_url = "https://hk.trip.com/flights/international?locale=zh-HK&curr=CNY"
        try:
            ubt_response = session.get(ubt_trigger_url, timeout=30)
            print(f"🔍 UBT触发页面响应状态码: {ubt_response.status_code}")
            print(f"🔍 UBT触发页面访问后Cookie数量: {len(session.cookies)}")
        except Exception as e:
            print(f"⚠️ 访问UBT触发页面失败: {e}")

        # 显示所有Cookie
        print(f"\n📋 === 所有Cookie ===")
        for cookie in session.cookies:
            print(f"  {cookie.name} = {cookie.value}")

        # 重点分析_bfa Cookie
        print(f"\n🎯 === _bfa Cookie分析 ===")
        bfa_cookie = session.cookies.get('_bfa')
        if bfa_cookie:
            print(f"✅ 找到_bfa Cookie: {bfa_cookie}")

            # 解析_bfa Cookie
            bfa_parts = bfa_cookie.split('.')
            print(f"🔍 _bfa分割后有 {len(bfa_parts)} 个部分:")
            for i, part in enumerate(bfa_parts):
                print(f"  [{i}] {part}")

            if len(bfa_parts) >= 3:
                # 根据分析：倒数第三个是SID，倒数第二个是PVID
                potential_sid = bfa_parts[-3]
                potential_pvid = bfa_parts[-2]
                potential_last = bfa_parts[-1]

                print(f"\n🎯 提取结果:")
                print(f"  倒数第三个 (SID): {potential_sid}")
                print(f"  倒数第二个 (PVID): {potential_pvid}")
                print(f"  最后一个: {potential_last}")

                # 验证是否为数字
                if potential_sid.isdigit() and potential_pvid.isdigit():
                    print(f"✅ SID和PVID都是有效数字")
                    extracted_sid = potential_sid
                    extracted_pvid = potential_pvid

                    # 如果_bfa有足够的部分，第二部分通常是VID
                    if len(bfa_parts) > 1:
                        potential_vid = bfa_parts[1]
                        print(f"  VID (第二部分): {potential_vid}")

                else:
                    print(f"❌ SID或PVID不是数字")
                    extracted_sid = None
                    extracted_pvid = None
            else:
                print(f"❌ _bfa Cookie部分不足")
                extracted_sid = None
                extracted_pvid = None
        else:
            print(f"❌ 未找到_bfa Cookie")
            extracted_sid = None
            extracted_pvid = None

        # 分析_ubtstatus Cookie作为备选
        print(f"\n🔄 === _ubtstatus Cookie分析 ===")
        ubtstatus_cookie = session.cookies.get('_ubtstatus')
        if ubtstatus_cookie:
            print(f"✅ 找到_ubtstatus Cookie: {ubtstatus_cookie}")
            try:
                # URL解码
                decoded_ubtstatus = urllib.parse.unquote(ubtstatus_cookie)
                print(f"🔍 解码后: {decoded_ubtstatus}")

                # JSON解析
                ubt_data = json.loads(decoded_ubtstatus)
                print(f"🔍 JSON解析结果:")
                for key, value in ubt_data.items():
                    print(f"  {key}: {value}")

                ubtstatus_sid = str(ubt_data.get('sid', ''))
                ubtstatus_pvid = str(ubt_data.get('pvid', ''))
                ubtstatus_vid = ubt_data.get('vid', '')

            except Exception as e:
                print(f"❌ 解析_ubtstatus失败: {e}")
                ubtstatus_sid = None
                ubtstatus_pvid = None
                ubtstatus_vid = None
        else:
            print(f"❌ 未找到_ubtstatus Cookie")
            ubtstatus_sid = None
            ubtstatus_pvid = None
            ubtstatus_vid = None

        # 对比结果
        print(f"\n📊 === 提取结果对比 ===")
        print(f"来源           SID      PVID     VID")
        print(f"_bfa          {extracted_sid or 'N/A':8} {extracted_pvid or 'N/A':8} {bfa_parts[1] if bfa_cookie and len(bfa_parts) > 1 else 'N/A'}")
        print(f"_ubtstatus    {ubtstatus_sid or 'N/A':8} {ubtstatus_pvid or 'N/A':8} {ubtstatus_vid or 'N/A'}")

        # 最终推荐值
        print(f"\n🏆 === 最终推荐使用 ===")
        final_sid = extracted_sid or ubtstatus_sid
        final_pvid = extracted_pvid or ubtstatus_pvid
        final_vid = (bfa_parts[1] if bfa_cookie and len(bfa_parts) > 1 else None) or ubtstatus_vid

        if final_sid and final_pvid:
            print(f"✅ x-ctx-ubt-sid: {final_sid}")
            print(f"✅ x-ctx-ubt-pvid: {final_pvid}")
            if final_vid:
                print(f"✅ x-ctx-ubt-vid: {final_vid}")

            # 演示如何在headers中使用
            print(f"\n🚀 === Headers使用示例 ===")
            headers = {
                'x-ctx-ubt-sid': final_sid,
                'x-ctx-ubt-pvid': final_pvid,
            }
            if final_vid:
                headers['x-ctx-ubt-vid'] = final_vid

            print("headers.update({")
            for key, value in headers.items():
                print(f"    '{key}': '{value}',")
            print("})")

            return {
                'success': True,
                'sid': final_sid,
                'pvid': final_pvid,
                'vid': final_vid,
                'source': '_bfa' if extracted_sid else '_ubtstatus'
            }
        else:
            print(f"❌ 无法获取有效的SID和PVID")
            return {'success': False}

    except Exception as e:
        print(f"❌ 测试过程中出错: {e}")
        return {'success': False}

def simulate_api_request_with_extracted_auth():
    """模拟使用提取的认证信息发送API请求"""
    print(f"\n🚀 === 模拟API请求 ===")

    # 先提取认证信息
    auth_result = test_bfa_cookie_extraction()

    if not auth_result['success']:
        print("❌ 无法获取认证信息，跳过API请求模拟")
        return

    print(f"\n🔍 使用提取的认证信息模拟API请求...")

    # 这里可以添加实际的API请求代码
    # 使用 auth_result['sid'], auth_result['pvid'], auth_result['vid']

    print(f"✅ 认证信息已准备就绪:")
    print(f"   SID: {auth_result['sid']}")
    print(f"   PVID: {auth_result['pvid']}")
    print(f"   VID: {auth_result['vid']}")
    print(f"   来源: {auth_result['source']}")

if __name__ == "__main__":
    simulate_api_request_with_extracted_auth()
