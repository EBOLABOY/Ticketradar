#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PushPlus推送功能诊断脚本
"""

import os
import requests
from dotenv import load_dotenv

def diagnose_pushplus():
    """诊断PushPlus推送功能"""
    print("🔍 PushPlus推送功能诊断")
    print("=" * 50)
    
    # 1. 检查环境变量加载
    print("\n📋 1. 检查环境变量加载...")
    try:
        load_dotenv()
        print("✅ .env文件加载成功")
        
        # 检查.env文件是否存在
        if os.path.exists('.env'):
            print("✅ .env文件存在")
            with open('.env', 'r', encoding='utf-8') as f:
                content = f.read()
                if 'ENABLE_PUSHPLUS' in content:
                    print("✅ .env文件包含ENABLE_PUSHPLUS配置")
                else:
                    print("❌ .env文件缺少ENABLE_PUSHPLUS配置")
        else:
            print("❌ .env文件不存在")
    except Exception as e:
        print(f"❌ 环境变量加载失败: {e}")
    
    # 2. 检查推送开关
    print("\n🔘 2. 检查推送开关...")
    enable_pushplus = os.getenv("ENABLE_PUSHPLUS", "true").lower() == "true"
    print(f"ENABLE_PUSHPLUS = {os.getenv('ENABLE_PUSHPLUS', '未设置')}")
    print(f"推送开关状态: {'✅ 已启用' if enable_pushplus else '❌ 已禁用'}")
    
    if not enable_pushplus:
        print("⚠️ 推送功能被禁用，请设置 ENABLE_PUSHPLUS=true")
        return False
    
    # 3. 检查PushPlus令牌
    print("\n🔑 3. 检查PushPlus令牌...")
    pushplus_token = os.getenv("PUSHPLUS_TOKEN")
    if pushplus_token:
        print(f"✅ PushPlus令牌已设置: {pushplus_token[:8]}...{pushplus_token[-4:]}")
    else:
        print("❌ PushPlus令牌未设置")
        return False
    
    # 4. 检查群组配置
    print("\n👥 4. 检查群组配置...")
    topics = {
        'HKG': os.getenv('PUSHPLUS_TOPIC_HKG'),
        'SZX': os.getenv('PUSHPLUS_TOPIC_SZX'), 
        'CAN': os.getenv('PUSHPLUS_TOPIC_CAN'),
        'MFM': os.getenv('PUSHPLUS_TOPIC_MFM')
    }
    
    for city, topic in topics.items():
        if topic:
            print(f"✅ {city}群组: {topic}")
        else:
            print(f"⚠️ {city}群组: 未设置（将使用个人推送）")
    
    # 5. 测试网络连接
    print("\n🌐 5. 测试网络连接...")
    try:
        response = requests.get("http://www.pushplus.plus", timeout=10)
        print(f"✅ PushPlus网站连接正常 (状态码: {response.status_code})")
    except requests.exceptions.Timeout:
        print("❌ 连接PushPlus网站超时")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到PushPlus网站")
        return False
    except Exception as e:
        print(f"❌ 网络连接测试失败: {e}")
        return False
    
    # 6. 测试推送API
    print("\n📤 6. 测试推送API...")
    try:
        test_data = {
            "token": pushplus_token,
            "title": "Ticketradar测试推送",
            "content": "这是一条测试消息，用于验证PushPlus推送功能是否正常工作。",
            "template": "html"
        }
        
        response = requests.post("http://www.pushplus.plus/send", json=test_data, timeout=30)
        result = response.json()
        
        if result.get("code") == 200:
            print("✅ 测试推送发送成功")
            print(f"   消息ID: {result.get('data', 'N/A')}")
            return True
        else:
            print(f"❌ 测试推送失败: {result.get('msg', '未知错误')}")
            print(f"   错误代码: {result.get('code', 'N/A')}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ 推送API请求超时")
        return False
    except Exception as e:
        print(f"❌ 推送API测试失败: {e}")
        return False

def check_flight_data():
    """检查航班数据获取"""
    print("\n✈️ 7. 检查航班数据获取...")
    try:
        import sys
        sys.path.append('.')
        from main import get_flights_for_user_task
        
        # 测试获取航班数据
        result = get_flights_for_user_task('BJS', None, '2025-06-30', None)
        
        if result and result.get('flights'):
            print(f"✅ 航班数据获取正常，共{len(result['flights'])}个航班")
            
            # 检查价格数据
            prices = [f.get('价格', 0) for f in result['flights']]
            min_price = min(prices) if prices else 0
            print(f"   最低价格: ¥{min_price}")
            
            # 检查价格阈值
            threshold = float(os.getenv("PRICE_THRESHOLD", "1000"))
            low_price_count = len([p for p in prices if p <= threshold])
            print(f"   价格阈值: ¥{threshold}")
            print(f"   低价航班数: {low_price_count}")
            
            if low_price_count > 0:
                print("✅ 有符合推送条件的航班")
                return True
            else:
                print("⚠️ 没有符合推送条件的航班（价格都高于阈值）")
                return False
        else:
            print("❌ 航班数据获取失败")
            return False
            
    except Exception as e:
        print(f"❌ 航班数据检查失败: {e}")
        return False

def main():
    """主诊断流程"""
    pushplus_ok = diagnose_pushplus()
    flight_data_ok = check_flight_data()
    
    print("\n" + "=" * 50)
    print("📊 诊断结果汇总:")
    print(f"   PushPlus配置: {'✅ 正常' if pushplus_ok else '❌ 异常'}")
    print(f"   航班数据: {'✅ 正常' if flight_data_ok else '❌ 异常'}")
    
    if pushplus_ok and flight_data_ok:
        print("\n🎉 所有检查通过！PushPlus推送功能应该正常工作")
        print("💡 如果仍然没有收到推送，请检查:")
        print("   1. PushPlus平台是否正常")
        print("   2. 微信是否关注了PushPlus公众号")
        print("   3. 群组设置是否正确")
    else:
        print("\n❌ 发现问题，请根据上述检查结果进行修复")

if __name__ == '__main__':
    main()
