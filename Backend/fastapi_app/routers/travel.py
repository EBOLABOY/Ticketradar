"""
FastAPI旅行规划路由
"""
import asyncio
from typing import Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger

from fastapi_app.models.travel import (
    TravelPlanRequest, 
    TravelPlanResponse, 
    XHSSearchResponse,
    APIResponse,
    UsageInfo
)
from fastapi_app.models.auth import UserInfo
from fastapi_app.dependencies.auth import get_current_active_user
from fastapi_app.dependencies.permissions import require_travel_plan_permission
from fastapi_app.services.xhs_service import get_xhs_service, FastAPIXhsService
from fastapi_app.services.ai_service import get_ai_service, FastAPIAIService

# 创建路由器
router = APIRouter()


from typing import Tuple

async def _fetch_and_process_xhs_notes(
    request: TravelPlanRequest,
    xhs_service: FastAPIXhsService
) -> Tuple[List[Dict], List[str], List[str]]:
    """
    内部辅助函数：获取并处理小红书笔记
    """
    # 构建搜索关键词
    search_keywords = [
        f"{request.destination}{request.days}天{request.travel_type}",
        f"{request.destination} 攻略",
        f"{request.destination} {request.travel_type}"
    ]
    
    # 并发搜索小红书笔记
    all_notes_data = []
    search_results = []
    
    # 使用asyncio.gather进行并发搜索
    search_tasks = []
    for query in search_keywords[:3]:  # 限制3轮搜索
        task = xhs_service.search_notes(query, limit=10)
        search_tasks.append(task)
    
    # 等待所有搜索完成
    search_responses = await asyncio.gather(*search_tasks, return_exceptions=True)
    
    # 处理搜索结果
    for i, response in enumerate(search_responses):
        query = search_keywords[i]
        
        if isinstance(response, Exception):
            logger.error(f"第{i+1}轮搜索异常 ({query}): {response}")
            search_results.append(f"第{i+1}轮({query}): 搜索异常")
            continue
        
        if response.success and response.data:
            notes = response.data.get("notes", [])
            if notes:
                # 转换为字典格式
                notes_dict = []
                for note in notes:
                    if isinstance(note, dict):
                        notes_dict.append(note)
                    else:
                        # 如果是Pydantic模型，转换为字典
                        notes_dict.append(note.dict() if hasattr(note, 'dict') else note)
                
                all_notes_data.extend(notes_dict)
                search_results.append(f"第{i+1}轮({query}): {len(notes_dict)}篇")
                logger.info(f"第{i+1}轮搜索成功，获得 {len(notes_dict)} 篇笔记")
            else:
                search_results.append(f"第{i+1}轮({query}): 无结果")
                logger.info(f"第{i+1}轮搜索无结果")
        else:
            search_results.append(f"第{i+1}轮({query}): 无结果")
            logger.info(f"第{i+1}轮搜索失败: {response.message if hasattr(response, 'message') else 'Unknown error'}")
    
    # 去重笔记（基于ID）
    unique_notes = {}
    for note in all_notes_data:
        note_id = note.get('id', '')
        if note_id and note_id not in unique_notes:
            unique_notes[note_id] = note
    
    final_notes_data = list(unique_notes.values())
    
    return final_notes_data, search_results, search_keywords


@router.post("/api/generate-travel-plan", response_model=TravelPlanResponse)
async def generate_travel_plan(
    request: TravelPlanRequest,
    current_user: UserInfo = Depends(require_travel_plan_permission),
    xhs_service: FastAPIXhsService = Depends(get_xhs_service),
    ai_service: FastAPIAIService = Depends(get_ai_service)
):
    """
    生成AI旅行规划
    
    这是核心的AI旅行规划API，整合了：
    - 小红书真实用户笔记数据
    - AI智能规划生成
    - 用户个性化需求
    """
    try:
        logger.info(f"用户 {current_user.username} 请求生成旅行规划: {request.destination}")
        
        # 调用辅助函数获取小红书数据
        final_notes_data, search_results, search_keywords = await _fetch_and_process_xhs_notes(request, xhs_service)
        
        # 记录搜索情况
        if final_notes_data:
            logger.info(f"小红书数据获取成功，共获得 {len(final_notes_data)} 篇去重后的笔记")
        else:
            logger.info(f"小红书数据获取失败或无相关内容，将基于{request.destination}常识生成旅行计划")
        
        logger.info(f"搜索尝试详情: {'; '.join(search_results)}")
        
        # 调用AI服务生成旅行规划
        form_data = request.dict()
        ai_response = await ai_service.generate_travel_plan(form_data, final_notes_data)
        
        if ai_response.success:
            # 更新响应数据
            if ai_response.data:
                ai_response.data.update({
                    "search_results": search_results,
                    "total_notes_found": len(final_notes_data),
                    "search_keywords": search_keywords[:3]
                })
            
            logger.info(f"用户 {current_user.username} AI旅行规划生成成功")
            return ai_response
        else:
            logger.error(f"AI旅行规划生成失败: {ai_response.message}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ai_response.message
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"生成旅行规划时发生异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成旅行规划时发生错误: {str(e)}"
        )


@router.get("/api/test-xhs", response_model=APIResponse)
async def test_xhs_service(
    keyword: str = "杭州旅行",
    limit: int = 5,
    xhs_service: FastAPIXhsService = Depends(get_xhs_service)
):
    """
    测试小红书服务
    
    公开接口，用于调试小红书数据获取功能
    """
    try:
        logger.info(f"测试小红书API，关键词: {keyword}")
        
        # 调用搜索服务
        result = await xhs_service.search_notes(keyword, limit=limit)
        
        # 构建响应
        response_data = {
            "test_keyword": keyword,
            "limit": limit,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "service_status": "FastAPI版本",
            "search_result": result.dict()
        }
        
        if result.success and result.data:
            notes = result.data.get("notes", [])
            response_data["preview"] = {
                "total_notes": len(notes),
                "sample_notes": [
                    {
                        "title": note.get("title", "")[:50] + "..." if len(note.get("title", "")) > 50 else note.get("title", ""),
                        "author": note.get("author", ""),
                        "likes": note.get("likes", 0)
                    }
                    for note in notes[:3]  # 只显示前3个笔记的预览
                ]
            }
        
        return APIResponse(
            success=result.success,
            message=result.message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"测试小红书API错误: {e}")
        return APIResponse(
            success=False,
            message=f"测试失败: {str(e)}",
            data={
                "test_keyword": keyword,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "error": str(e)
            }
        )


@router.get("/api/get-location", response_model=APIResponse)
async def get_user_location():
    """
    获取用户建议的出发城市
    基于IP地址或其他方式推测用户位置
    """
    try:
        # 简单的位置推测逻辑
        # 在实际应用中，可以使用IP地理位置服务
        suggested_cities = [
            "北京", "上海", "广州", "深圳", "杭州",
            "成都", "重庆", "西安", "南京", "武汉"
        ]

        # 默认推荐北京作为出发城市
        # 可以根据用户的历史记录、IP地址等进行智能推荐
        suggested_city = "北京"

        return APIResponse(
            success=True,
            message="获取位置建议成功",
            data={
                "suggested_city": suggested_city,
                "available_cities": suggested_cities
            }
        )

    except Exception as e:
        logger.error(f"获取位置建议失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取位置建议失败: {str(e)}"
        )


@router.post("/api/enhanced-travel-plan", response_model=TravelPlanResponse)
async def generate_enhanced_travel_plan(
    request: TravelPlanRequest,
    current_user: UserInfo = Depends(require_travel_plan_permission),
    xhs_service: FastAPIXhsService = Depends(get_xhs_service),
    ai_service: FastAPIAIService = Depends(get_ai_service)
):
    """
    生成增强版AI旅行规划

    支持用户偏好和Markdown格式输出的新版本API
    """
    try:
        logger.info(f"用户 {current_user.username} 请求生成增强版旅行规划: {request.destination}")

        # 调用辅助函数获取小红书数据
        final_notes_data, search_results, search_keywords = await _fetch_and_process_xhs_notes(request, xhs_service)

        # 限制笔记数量
        final_notes_data = final_notes_data[:30]

        logger.info(f"搜索尝试详情: {'; '.join(search_results)}")

        # 调用AI服务生成旅行规划
        form_data = request.dict()
        ai_response = await ai_service.generate_travel_plan(form_data, final_notes_data)

        if ai_response.success:
            # 更新响应数据
            if ai_response.data:
                ai_response.data.update({
                    "search_results": search_results,
                    "total_notes_found": len(final_notes_data),
                    "search_keywords": search_keywords[:3],
                    "enhanced_version": True,
                    "markdown_format": True
                })

            logger.info(f"用户 {current_user.username} 增强版AI旅行规划生成成功")
            return ai_response
        else:
            logger.error(f"增强版AI旅行规划生成失败: {ai_response.message}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ai_response.message
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"生成增强版旅行规划时发生异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成增强版旅行规划时发生错误: {str(e)}"
        )


@router.get("/api/usage-info", response_model=APIResponse)
async def get_usage_info(
    current_user: UserInfo = Depends(get_current_active_user)
):
    """
    获取用户使用情况信息
    """
    try:
        # 这里可以从数据库查询用户的使用情况
        # 暂时返回模拟数据
        usage_info = UsageInfo(
            today_usage=2,  # 今日已使用次数
            daily_limit=10 if current_user.is_admin else 3,  # 每日限制
            remaining=8 if current_user.is_admin else 1,  # 剩余次数
            is_admin=current_user.is_admin
        )

        return APIResponse(
            success=True,
            message="获取使用情况成功",
            data=usage_info.dict()
        )

    except Exception as e:
        logger.error(f"获取使用情况失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取使用情况失败: {str(e)}"
        )
