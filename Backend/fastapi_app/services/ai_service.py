"""
FastAPI版本的AI服务
使用Google官方Gemini库实现
"""
import os
import json
import asyncio
from typing import Dict, Any, Optional, List
from loguru import logger
import google.generativeai as genai

from fastapi_app.models.travel import TravelPlanRequest, TravelPlanResponse
from fastapi_app.config import settings
from .amap_mcp_service import get_amap_mcp_service, close_amap_mcp_service


class FastAPIAIService:
    """FastAPI版本的AI服务 - 使用Gemini官方库"""
    
    def __init__(self):
        """初始化AI服务"""
        # 配置Gemini API
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        
        # 验证API密钥是否存在
        if not self.api_key:
            logger.warning("GEMINI_API_KEY环境变量未设置，AI服务可能无法正常工作")
        else:
            # 配置Gemini
            genai.configure(api_key=self.api_key)
            logger.info(f"✅ Gemini API配置成功")
        
        # 初始化模型
        self.model = None
        self._initialize_model()
        
        # 系统提示词
        self.system_prompt = self._load_system_prompt()
        
        logger.info(f"FastAPI AI服务初始化完成 - 使用模型: {self.model_name}")
    
    def _initialize_model(self):
        """初始化Gemini模型"""
        try:
            if self.api_key:
                # 配置生成参数 - 移除token限制，充分利用Gemini 2.5的1M token上下文
                generation_config = {
                    "temperature": 0.7,
                    "top_p": 0.8,
                    "top_k": 40,
                    # 移除max_output_tokens限制，让Gemini 2.5 Pro充分发挥1M token能力
                }
                
                # 安全设置
                safety_settings = [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
                
                self.model = genai.GenerativeModel(
                    model_name=self.model_name,
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
                logger.info(f"✅ Gemini模型初始化成功: {self.model_name}")
            else:
                logger.warning("❌ 无法初始化Gemini模型：API密钥未设置")
                
        except Exception as e:
            logger.error(f"❌ 初始化Gemini模型失败: {e}")
            self.model = None
    
    def _load_system_prompt(self) -> str:
        """加载系统提示词 - 使用新的提示词管理系统"""
        try:
            from ..prompts.travel_system_prompts import get_travel_system_prompt

            # 使用新的提示词管理系统
            prompt = get_travel_system_prompt(language="zh")
            logger.info(f"✅ 成功加载旅行规划系统提示词")
            logger.info(f"📏 提示词长度: {len(prompt):,} 字符")
            return prompt

        except Exception as e:
            logger.error(f"加载系统提示词失败: {e}")
            return self._get_default_system_prompt()
    
    def _get_default_system_prompt(self) -> str:
        """获取默认系统提示词"""
        return """你是一个专业的AI旅行规划师，擅长根据用户需求制定详细的旅行计划。

请根据用户提供的信息，生成一份详细的旅行规划，包括：
1. 行程安排（每日详细计划）
2. 景点推荐（包含特色和亮点）
3. 美食推荐（当地特色菜品）
4. 住宿建议（不同价位选择）
5. 交通指南（城市内外交通）
6. 预算估算（各项费用明细）
7. 注意事项（天气、文化、安全等）

请用中文回答，内容要实用、详细、有条理。"""
    
    async def _get_weather_data(self, destination: str) -> Optional[str]:
        """获取目的地天气数据"""
        try:
            amap_service = get_amap_mcp_service()
            result = await amap_service.get_weather(destination)

            if result.get("success"):
                # 解析天气数据
                content = result.get("data", {}).get("content", [])
                if content and len(content) > 0:
                    weather_text = content[0].get("text", "")
                    if weather_text:
                        logger.info(f"✅ 获取到{destination}天气数据")
                        return weather_text

            logger.warning(f"未能获取到{destination}的天气数据")
            return None

        except Exception as e:
            logger.warning(f"获取天气数据失败，将跳过天气信息: {e}")
            return None

    async def _get_poi_data(self, destination: str) -> Optional[str]:
        """获取目的地POI数据"""
        try:
            amap_service = get_amap_mcp_service()
            result = await amap_service.search_poi(destination, city=destination)

            if result.get("success"):
                # 解析POI数据
                content = result.get("data", {}).get("content", [])
                if content and len(content) > 0:
                    poi_text = content[0].get("text", "")
                    if poi_text:
                        logger.info(f"✅ 获取到{destination}POI数据")
                        return poi_text

            logger.warning(f"未能获取到{destination}的POI数据")
            return None

        except Exception as e:
            logger.warning(f"获取POI数据失败，将跳过景点信息: {e}")
            return None

    async def _build_user_message(self, form_data: Dict[str, Any], notes_data: List[Dict[str, Any]]) -> str:
        """构建用户消息"""
        try:
            # 基础信息
            destination = form_data.get('destination', '')
            days = form_data.get('days', 3)
            people_count = form_data.get('peopleCount', 1)
            budget = form_data.get('budget', '中等')
            travel_type = form_data.get('travelType', '休闲')

            # 构建消息
            message_parts = [
                f"请为我制定一份{destination}{days}天的旅行规划。",
                f"人数：{people_count}人",
                f"预算：{budget}",
                f"旅行类型：{travel_type}"
            ]

            # 获取天气数据
            logger.info(f"🌤️ 获取{destination}天气信息...")
            weather_data = await self._get_weather_data(destination)
            if weather_data:
                message_parts.append(f"\n当前天气信息：\n{weather_data}")

            # 获取POI数据
            logger.info(f"📍 获取{destination}景点信息...")
            poi_data = await self._get_poi_data(destination)
            if poi_data:
                message_parts.append(f"\n景点和地理信息：\n{poi_data}")
            
            # 添加其他信息
            if form_data.get('originCity'):
                message_parts.append(f"出发城市：{form_data['originCity']}")
            
            if form_data.get('otherInfo'):
                message_parts.append(f"特殊要求：{form_data['otherInfo']}")
            
            # 添加小红书笔记数据 - 移除所有截断限制，充分利用Gemini 2.5的1M token上下文
            if notes_data:
                message_parts.append(f"\n参考以下{len(notes_data)}篇真实用户分享的旅行笔记：")
                for i, note in enumerate(notes_data, 1):  # 使用所有笔记，不限制数量
                    title = note.get('title', '')
                    content = note.get('content', '')
                    author = note.get('author', '')
                    likes = note.get('likes', 0)

                    if title or content:
                        message_parts.append(f"\n{i}. 【{title}】")
                        # 移除内容长度限制，让AI获得完整信息
                        if content:
                            message_parts.append(f"   内容：{content}")
                        if author:
                            message_parts.append(f"   作者：{author} (👍{likes})")
            else:
                message_parts.append("\n注意：由于没有获取到相关的用户分享笔记，请基于你的知识为我制定旅行规划。")
            
            user_message = "\n".join(message_parts)
            
            logger.info(f"📊 用户消息构建完成: 笔记{len(notes_data)}篇, 目的地'{destination}'")
            
            return user_message
            
        except Exception as e:
            logger.error(f"构建用户消息失败: {e}")
            return f"请为我制定一份{form_data.get('destination', '未知目的地')}的旅行规划。"
    
    async def _generate_with_gemini(self, user_message: str) -> Optional[str]:
        """使用Gemini生成内容"""
        try:
            if not self.model:
                logger.error("❌ Gemini模型未初始化")
                return None
            
            # 构建完整的提示词
            full_prompt = f"{self.system_prompt}\n\n{user_message}"
            
            logger.info("📡 调用Gemini API...")
            
            # 异步生成内容
            response = await asyncio.to_thread(
                self.model.generate_content,
                full_prompt
            )
            
            if response and response.text:
                logger.info("✅ Gemini API调用成功")
                return response.text
            else:
                logger.error("❌ Gemini API响应为空")
                return None
                
        except Exception as e:
            logger.error(f"❌ Gemini API调用异常: {e}")
            return None

    async def chat_async(self, prompt: str, model_override: str = None) -> dict:
        """通用聊天接口"""
        try:
            if not self.model:
                return {
                    'success': False,
                    'error': 'AI服务未正确配置，请检查GEMINI_API_KEY环境变量',
                    'content': ''
                }

            logger.info("🤖 处理AI聊天请求")

            # 如果指定了模型覆盖，使用指定的模型
            if model_override:
                logger.info(f"🔄 使用指定模型: {model_override}")
                result = await self._generate_with_gemini(prompt, model_override)
            else:
                # 调用Gemini API
                result = await self._generate_with_gemini(prompt)

            if result:
                return {
                    'success': True,
                    'content': result,
                    'model': self.model_name
                }
            else:
                return {
                    'success': False,
                    'error': 'AI服务暂时不可用，请稍后重试',
                    'content': ''
                }

        except Exception as e:
            logger.error(f"AI聊天失败: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': ''
            }

    async def generate_travel_plan(
        self,
        form_data: Dict[str, Any],
        notes_data: List[Dict[str, Any]]
    ) -> TravelPlanResponse:
        """生成旅行规划 - 支持用户偏好和Markdown格式"""
        try:
            # 检查模型是否可用
            if not self.model:
                return TravelPlanResponse(
                    success=False,
                    message="AI服务未正确配置，请检查GEMINI_API_KEY环境变量",
                    data=None
                )

            # 构建用户消息
            user_message = await self._build_user_message(form_data, notes_data)

            # 获取用户偏好并更新系统提示词
            user_preferences = form_data.get('userPreferences', '')
            if user_preferences:
                from ..prompts.travel_system_prompts import get_travel_system_prompt
                enhanced_prompt = get_travel_system_prompt(language="zh", user_preferences=user_preferences)
                # 临时更新系统提示词
                original_prompt = self.system_prompt
                self.system_prompt = enhanced_prompt
                logger.info(f"🎯 应用用户偏好: {user_preferences[:50]}...")

            logger.info("🚀 开始调用Gemini API生成Markdown格式旅行规划")

            # 调用Gemini API
            ai_result = await self._generate_with_gemini(user_message)

            # 恢复原始系统提示词
            if user_preferences:
                self.system_prompt = original_prompt

            if ai_result:
                # 构建响应数据 - 匹配前端期望的数据结构
                from datetime import datetime
                response_data = {
                    "plan": ai_result,  # 前端期望的字段名
                    "data_sources": {   # 前端期望的数据源状态
                        "xiaohongshu": len(notes_data) > 0,
                        "amap": True,  # 高德地图总是可用
                        "weather": True  # 天气服务总是可用
                    },
                    "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # 前端期望的时间格式
                    "destination": form_data.get('destination', ''),
                    "days": form_data.get('days', 3),
                    "notes_count": len(notes_data),
                    "has_real_data": len(notes_data) > 0,
                    "ai_model": self.model_name,
                    "format": "markdown",
                    "has_user_preferences": bool(user_preferences)
                }

                return TravelPlanResponse(
                    success=True,
                    message="AI旅行规划生成成功",
                    data=response_data
                )
            else:
                return TravelPlanResponse(
                    success=False,
                    message="AI服务暂时不可用，请稍后重试",
                    data=None
                )

        except Exception as e:
            logger.error(f"生成旅行规划失败: {e}")
            return TravelPlanResponse(
                success=False,
                message=f"生成旅行规划时发生错误: {str(e)}",
                data=None
            )
    
    async def close(self):
        """关闭服务"""
        # 关闭高德地图MCP服务
        try:
            await close_amap_mcp_service()
        except Exception as e:
            logger.warning(f"关闭高德地图MCP服务时出错: {e}")

        logger.info("FastAPI AI服务已关闭")


# 创建全局服务实例
fastapi_ai_service = FastAPIAIService()


# 依赖注入函数
async def get_ai_service() -> FastAPIAIService:
    """获取AI服务实例"""
    return fastapi_ai_service
