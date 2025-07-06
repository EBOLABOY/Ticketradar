#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试AI分析报告是否不再显示具体数据源信息
"""

import asyncio
import logging
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

async def test_no_data_source_info():
    """测试AI分析报告是否隐藏了数据源信息"""
    try:
        logger.info("🔧 启动数据源信息隐藏测试")
        
        # 导入AI航班服务
        from fastapi_app.services.ai_flight_service import AIFlightService
        
        # 创建服务实例
        ai_service = AIFlightService()
        
        # 测试参数
        test_params = {
            'departure_code': 'LHR',
            'destination_code': 'PEK',
            'depart_date': '2025-08-31',
            'adults': 1,
            'seat_class': 'BUSINESS',
            'language': 'zh',
            'currency': 'CNY'
        }
        
        logger.info(f"📍 测试路线: {test_params['departure_code']} → {test_params['destination_code']}")
        logger.info(f"💺 测试舱位: {test_params['seat_class']}")
        
        # 执行三阶段搜索
        logger.info("🚀 开始执行三阶段航班搜索...")
        
        result = await ai_service.search_flights_enhanced(
            departure_code=test_params['departure_code'],
            destination_code=test_params['destination_code'],
            depart_date=test_params['depart_date'],
            adults=test_params['adults'],
            seat_class=test_params['seat_class'],
            language=test_params['language'],
            currency=test_params['currency']
        )
        
        logger.info(f"📊 搜索结果类型: {type(result)}")
        
        if isinstance(result, dict) and result.get('success'):
            ai_report = result.get('ai_analysis_report', '')
            
            if ai_report:
                logger.info(f"✅ AI分析报告生成成功，长度: {len(ai_report)} 字符")
                
                # 检查报告中是否包含不应该出现的数据源信息
                forbidden_terms = [
                    'Google Flights',
                    'Kiwi',
                    'Kiwi.com',
                    'google_flights_data',
                    'kiwi_data',
                    'ai_data',
                    '数据源1',
                    '数据源2', 
                    '数据源3',
                    'Data Source 1',
                    'Data Source 2',
                    'Data Source 3'
                ]
                
                found_forbidden = []
                for term in forbidden_terms:
                    if term in ai_report:
                        found_forbidden.append(term)
                
                # 检查报告标题格式
                lines = ai_report.split('\n')
                title_line = ""
                subtitle_line = ""
                
                for line in lines:
                    if '旅航AI • 航班分析报告' in line or 'FlightAI • Flight Analysis Report' in line:
                        title_line = line.strip()
                    elif '航线:' in line or 'Route:' in line:
                        subtitle_line = line.strip()
                        break
                
                logger.info(f"\n{'='*60}")
                logger.info(f"📋 数据源信息隐藏测试结果:")
                logger.info(f"{'='*60}")
                
                if found_forbidden:
                    logger.error(f"❌ 发现禁止的数据源信息: {found_forbidden}")
                    logger.error(f"🔍 报告前500字符预览:")
                    logger.error(f"{ai_report[:500]}...")
                else:
                    logger.info(f"✅ 未发现禁止的数据源信息")
                
                logger.info(f"📝 报告标题: {title_line}")
                logger.info(f"📝 报告副标题: {subtitle_line}")
                
                # 检查是否使用了正确的通用描述
                allowed_terms = [
                    '常规搜索',
                    '隐藏城市搜索',
                    'AI智能推荐',
                    'regular_search',
                    'hidden_city_search',
                    'ai_analysis',
                    '多源数据整合',
                    '智能搜索引擎'
                ]
                
                found_allowed = []
                for term in allowed_terms:
                    if term in ai_report:
                        found_allowed.append(term)
                
                logger.info(f"✅ 使用的通用描述: {found_allowed}")
                
                # 检查处理信息
                processing_info = result.get('processing_info', {})
                if processing_info:
                    source_counts = processing_info.get('source_counts', {})
                    logger.info(f"📊 处理统计: {source_counts}")
                
                # 总结测试结果
                if not found_forbidden and title_line and subtitle_line:
                    logger.info(f"🎉 数据源信息隐藏测试 - 通过")
                else:
                    logger.warning(f"⚠️ 数据源信息隐藏测试 - 需要改进")
                    
            else:
                logger.warning(f"⚠️ 没有生成AI分析报告")
        else:
            logger.error(f"❌ 搜索失败: {result}")
        
        logger.info(f"\n🎉 数据源信息隐藏测试完成")
        
    except Exception as e:
        logger.error(f"❌ 测试过程中发生错误: {e}")
        import traceback
        logger.error(f"❌ 错误堆栈: {traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(test_no_data_source_info())
