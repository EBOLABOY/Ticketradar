"""
旅行规划相关的Pydantic模型
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

from .common import APIResponse


class TravelPlanRequest(BaseModel):
    """旅行规划请求模型"""
    destination: str = Field(..., description="目的地", min_length=1, max_length=100)
    days: int = Field(3, description="旅行天数", ge=1, le=30)
    people_count: int = Field(1, description="人数", ge=1, le=20, alias="peopleCount")
    
    # 航班信息
    origin_city: Optional[str] = Field(None, description="出发城市", alias="originCity")
    arrive_city: Optional[str] = Field(None, description="目的地到达城市", alias="arriveCity")
    depart_city: Optional[str] = Field(None, description="目的地出发城市", alias="departCity")
    return_city: Optional[str] = Field(None, description="回程到达城市", alias="returnCity")
    
    # 时间信息
    depart_date: Optional[str] = Field(None, description="出发日期", alias="departDate")
    return_date: Optional[str] = Field(None, description="返程日期", alias="returnDate")
    depart_time: Optional[str] = Field(None, description="出发时间", alias="departTime")
    return_time: Optional[str] = Field(None, description="返程时间", alias="returnTime")
    
    # 预算信息
    budget: Optional[str] = Field(None, description="总预算")
    accommodation_budget: Optional[str] = Field(None, description="住宿预算", alias="accommodationBudget")
    currency: str = Field("CNY", description="货币类型")
    
    # 旅行偏好
    travel_type: Optional[str] = Field("休闲", description="旅行类型", alias="travelType")
    travel_style: Optional[str] = Field(None, description="旅行风格", alias="travelStyle")
    user_preferences: Optional[str] = Field(None, description="用户个人偏好", alias="userPreferences")
    other_info: Optional[str] = Field(None, description="其他信息", alias="otherInfo")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "destination": "杭州",
                "days": 3,
                "peopleCount": 2,
                "originCity": "上海",
                "budget": "中等",
                "travelType": "休闲度假"
            }
        }


class TravelPlanResponse(APIResponse):
    """旅行规划响应模型"""
    data: Optional[Dict[str, Any]] = Field(None, description="规划数据")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "生成成功",
                "data": {
                    "travel_plan": "详细的旅行规划...",
                    "destination": "杭州",
                    "days": 3,
                    "notes_count": 10,
                    "has_real_data": True
                }
            }
        }


class XHSNote(BaseModel):
    """小红书笔记模型"""
    id: str = Field(..., description="笔记ID")
    title: str = Field(..., description="笔记标题")
    desc: str = Field("", description="笔记描述")
    author: str = Field("", description="作者")
    author_id: str = Field("", description="作者ID")
    likes: int = Field(0, description="点赞数")
    url: str = Field("", description="笔记链接")
    cover: str = Field("", description="封面图片")
    type: str = Field("", description="笔记类型")
    tags: List[str] = Field(default_factory=list, description="标签列表")


class XHSSearchResponse(APIResponse):
    """小红书搜索响应模型"""
    data: Optional[Dict[str, Any]] = Field(None, description="搜索数据")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "搜索成功",
                "data": {
                    "keyword": "杭州旅行",
                    "total": 5,
                    "notes": []
                }
            }
        }


class UsageInfo(BaseModel):
    """使用情况信息模型"""
    today_usage: int = Field(..., description="今日使用次数")
    daily_limit: int = Field(..., description="每日限制")
    remaining: int = Field(..., description="剩余次数")
    is_admin: bool = Field(False, description="是否管理员")
