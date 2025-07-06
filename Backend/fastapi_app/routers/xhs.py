"""
小红书API路由
基于cv-cat/Spider_XHS项目实现的完整小红书功能
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from loguru import logger

from ..services.xhs_service import FastAPIXhsService, get_xhs_service
from ..models.travel import XHSSearchResponse

router = APIRouter(prefix="/api/xhs", tags=["小红书"])

# 请求模型
class XHSSearchRequest(BaseModel):
    query: str
    limit: int = 20
    sort_type: int = 0  # 0:综合, 1:最新, 2:最多点赞, 3:最多评论, 4:最多收藏
    note_type: int = 0  # 0:不限, 1:视频笔记, 2:普通笔记
    note_time: int = 0  # 0:不限, 1:一天内, 2:一周内, 3:半年内

class XHSNoteRequest(BaseModel):
    note_url: str

class XHSUserRequest(BaseModel):
    user_id: str

# 响应模型
class XHSNoteResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class XHSUserResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class XHSChannelsResponse(BaseModel):
    success: bool
    message: str
    data: List[Dict[str, Any]] = []

class XHSAdvancedSearchResponse(BaseModel):
    success: bool
    message: str
    data: List[Dict[str, Any]] = []

@router.post("/search", response_model=XHSSearchResponse)
async def search_notes(
    request: XHSSearchRequest,
    xhs_service: FastAPIXhsService = Depends(get_xhs_service)
):
    """
    搜索小红书笔记（基础搜索）
    """
    try:
        logger.info(f"搜索小红书笔记: {request.query}")
        result = await xhs_service.search_notes(request.query, request.limit)
        return result
    except Exception as e:
        logger.error(f"搜索笔记失败: {e}")
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")

@router.post("/search/advanced", response_model=XHSAdvancedSearchResponse)
async def search_notes_advanced(
    request: XHSSearchRequest,
    xhs_service: FastAPIXhsService = Depends(get_xhs_service)
):
    """
    高级搜索小红书笔记
    """
    try:
        logger.info(f"高级搜索小红书笔记: {request.query}")
        notes = await xhs_service.search_notes_advanced(
            query=request.query,
            limit=request.limit,
            sort_type=request.sort_type,
            note_type=request.note_type,
            note_time=request.note_time
        )
        
        return XHSAdvancedSearchResponse(
            success=True,
            message="搜索成功",
            data=notes
        )
    except Exception as e:
        logger.error(f"高级搜索失败: {e}")
        return XHSAdvancedSearchResponse(
            success=False,
            message=f"搜索失败: {str(e)}",
            data=[]
        )

@router.post("/note/info", response_model=XHSNoteResponse)
async def get_note_info(
    request: XHSNoteRequest,
    xhs_service: FastAPIXhsService = Depends(get_xhs_service)
):
    """
    获取笔记详细信息
    """
    try:
        logger.info(f"获取笔记信息: {request.note_url}")
        note_data = await xhs_service.get_note_info(request.note_url)
        
        if note_data:
            return XHSNoteResponse(
                success=True,
                message="获取成功",
                data=note_data
            )
        else:
            return XHSNoteResponse(
                success=False,
                message="未找到笔记信息",
                data=None
            )
    except Exception as e:
        logger.error(f"获取笔记信息失败: {e}")
        return XHSNoteResponse(
            success=False,
            message=f"获取失败: {str(e)}",
            data=None
        )

@router.post("/user/info", response_model=XHSUserResponse)
async def get_user_info(
    request: XHSUserRequest,
    xhs_service: FastAPIXhsService = Depends(get_xhs_service)
):
    """
    获取用户信息
    """
    try:
        logger.info(f"获取用户信息: {request.user_id}")
        user_data = await xhs_service.get_user_info(request.user_id)
        
        if user_data:
            return XHSUserResponse(
                success=True,
                message="获取成功",
                data=user_data
            )
        else:
            return XHSUserResponse(
                success=False,
                message="未找到用户信息",
                data=None
            )
    except Exception as e:
        logger.error(f"获取用户信息失败: {e}")
        return XHSUserResponse(
            success=False,
            message=f"获取失败: {str(e)}",
            data=None
        )

@router.get("/channels", response_model=XHSChannelsResponse)
async def get_homefeed_channels(
    xhs_service: FastAPIXhsService = Depends(get_xhs_service)
):
    """
    获取主页频道列表
    """
    try:
        logger.info("获取主页频道列表")
        channels = await xhs_service.get_homefeed_channels()
        
        return XHSChannelsResponse(
            success=True,
            message="获取成功",
            data=channels
        )
    except Exception as e:
        logger.error(f"获取频道列表失败: {e}")
        return XHSChannelsResponse(
            success=False,
            message=f"获取失败: {str(e)}",
            data=[]
        )

@router.get("/image/no-watermark")
async def get_no_watermark_image(
    img_url: str = Query(..., description="图片URL")
):
    """
    获取无水印图片URL
    """
    try:
        logger.info(f"获取无水印图片: {img_url}")
        new_url = FastAPIXhsService.get_no_watermark_image(img_url)
        
        if new_url:
            return {
                "success": True,
                "message": "获取成功",
                "data": {"original_url": img_url, "no_watermark_url": new_url}
            }
        else:
            return {
                "success": False,
                "message": "获取无水印图片失败",
                "data": None
            }
    except Exception as e:
        logger.error(f"获取无水印图片失败: {e}")
        return {
            "success": False,
            "message": f"获取失败: {str(e)}",
            "data": None
        }

@router.get("/video/no-watermark")
async def get_no_watermark_video(
    note_id: str = Query(..., description="笔记ID")
):
    """
    获取无水印视频URL
    """
    try:
        logger.info(f"获取无水印视频: {note_id}")
        video_url = FastAPIXhsService.get_no_watermark_video(note_id)
        
        if video_url:
            return {
                "success": True,
                "message": "获取成功",
                "data": {"note_id": note_id, "video_url": video_url}
            }
        else:
            return {
                "success": False,
                "message": "获取无水印视频失败",
                "data": None
            }
    except Exception as e:
        logger.error(f"获取无水印视频失败: {e}")
        return {
            "success": False,
            "message": f"获取失败: {str(e)}",
            "data": None
        }

@router.get("/health")
async def health_check(
    xhs_service: FastAPIXhsService = Depends(get_xhs_service)
):
    """
    健康检查
    """
    try:
        # 检查服务是否正常初始化
        is_initialized = await xhs_service._initialize()
        
        return {
            "success": True,
            "message": "服务正常",
            "data": {
                "service": "XHS API",
                "status": "healthy" if is_initialized else "degraded",
                "features": {
                    "search": True,
                    "note_info": True,
                    "user_info": True,
                    "channels": True,
                    "no_watermark": True
                }
            }
        }
    except Exception as e:
        logger.error(f"健康检查失败: {e}")
        return {
            "success": False,
            "message": f"服务异常: {str(e)}",
            "data": None
        }
