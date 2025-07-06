"""
FastAPI版本的小红书服务
基于cv-cat/Spider_XHS项目重新实现，支持完整的小红书API功能
"""
import os
import json
import time
import asyncio
import aiohttp
from typing import Dict, Any, Optional, List
from loguru import logger
from dotenv import load_dotenv

# 确保能加载到项目根目录的.env文件
# 这使得该模块在独立运行时也能获取到环境变量
def load_project_env():
    """
    智能加载项目根目录的.env文件
    支持多种运行环境：独立运行、测试、FastAPI服务等
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # 尝试多个可能的.env文件路径
    possible_paths = [
        # 从services目录向上查找
        os.path.join(current_dir, "..", "..", ".env"),  # Backend/.env
        os.path.join(current_dir, "..", "..", "..", ".env"),  # 项目根目录/.env
        # 直接在当前工作目录查找
        os.path.join(os.getcwd(), ".env"),
        # 在Backend目录查找
        os.path.join(os.getcwd(), "Backend", ".env"),
        # 向上查找直到找到.env文件
        os.path.join(os.path.dirname(os.getcwd()), ".env")
    ]

    for env_path in possible_paths:
        if os.path.exists(env_path):
            load_dotenv(env_path)
            logger.debug(f"✅ 成功加载环境变量文件: {env_path}")
            return env_path

    logger.warning("⚠️ 未找到.env文件，将使用系统环境变量")
    return None

# 加载环境变量
load_project_env()

from fastapi_app.models.travel import XHSNote, XHSSearchResponse
from .xhs_apis import XHSApis
from .xhs_utils import (
    validate_cookies,
    format_note_data,
    format_user_data
)


class FastAPIXhsService:
    """FastAPI版本的小红书服务"""

    def __init__(self):
        """初始化服务"""
        self.cookies = os.getenv("XHS_COOKIES", "")
        self.base_url = "https://edith.xiaohongshu.com"
        self._session: Optional[aiohttp.ClientSession] = None
        self._initialized = False

        # 初始化新的API接口
        self.apis = XHSApis()

        # JavaScript加密脚本路径
        self.js_script_path = os.path.join(
            os.path.dirname(__file__), "..", "static", "xhs_encrypt.js"
        )

        # 验证配置
        if not self.cookies:
            logger.warning("小红书cookies未配置，部分功能可能受限")
        elif not validate_cookies(self.cookies):
            logger.warning("小红书cookies格式无效")

        if not os.path.exists(self.js_script_path):
            logger.warning(f"JavaScript加密脚本不存在: {self.js_script_path}")
        else:
            logger.info(f"JavaScript加密脚本路径: {self.js_script_path}")

        logger.info("FastAPI小红书服务初始化完成")
    
    async def _initialize(self) -> bool:
        """初始化服务"""
        if self._initialized:
            return True

        try:
            # 检查Cookie配置
            if not self.cookies:
                logger.warning("XHS_COOKIES环境变量未配置，将使用无认证模式")
            elif not validate_cookies(self.cookies):
                logger.warning("XHS_COOKIES格式无效，将使用无认证模式")

            # 创建HTTP会话
            if not self._session:
                timeout = aiohttp.ClientTimeout(total=30)
                self._session = aiohttp.ClientSession(timeout=timeout)

            # 验证JavaScript加密脚本（可选）
            if not os.path.exists(self.js_script_path):
                logger.warning(f"JavaScript加密脚本不存在: {self.js_script_path}，将使用简化签名")
            else:
                logger.info(f"JavaScript加密脚本已加载: {self.js_script_path}")

            self._initialized = True
            logger.info("✅ FastAPI小红书服务初始化成功")
            return True

        except Exception as e:
            logger.error(f"小红书服务初始化失败: {e}")
            return False
    
    async def _generate_x_b3_traceid(self, length: int = 21) -> str:
        """生成X-B3-TraceId"""
        import random
        import string
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
    
    async def _generate_request_headers(self, uri: str, data: Dict[str, Any]) -> Dict[str, str]:
        """生成请求头，使用Python实现的签名算法"""
        try:
            from .xhs_utils import generate_advanced_signature, parse_cookies_string

            # 解析cookies获取a1参数
            cookies_dict = parse_cookies_string(self.cookies)
            a1 = cookies_dict.get('a1', '')

            if not a1:
                logger.warning("未找到a1参数，使用简化签名")
                # 使用简化签名
                timestamp = str(int(time.time() * 1000))
                return {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Origin': 'https://www.xiaohongshu.com',
                    'Referer': 'https://www.xiaohongshu.com/',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-t': timestamp,
                    'X-s': f"simple_{timestamp}",
                    'Cookie': self.cookies
                }

            # 使用高级签名算法
            data_str = json.dumps(data, separators=(',', ':'), ensure_ascii=False) if data else ""
            signature_result = generate_advanced_signature(uri, data_str, a1)

            if not signature_result:
                logger.error("高级签名生成失败，使用简化签名")
                timestamp = str(int(time.time() * 1000))
                return {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Origin': 'https://www.xiaohongshu.com',
                    'Referer': 'https://www.xiaohongshu.com/',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-t': timestamp,
                    'X-s': f"simple_{timestamp}",
                    'Cookie': self.cookies
                }

            # 构建完整的请求头
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json;charset=UTF-8',
                'Origin': 'https://www.xiaohongshu.com',
                'Referer': 'https://www.xiaohongshu.com/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'X-Requested-With': 'XMLHttpRequest',
                'X-s': signature_result['X-s'],
                'X-t': signature_result['X-t'],
                'X-B3-TraceId': await self._generate_x_b3_traceid(32),
                'Cookie': self.cookies
            }

            # 添加可选的X-s-common字段
            if 'X-s-common' in signature_result:
                headers['X-s-common'] = signature_result['X-s-common']

            logger.info(f"✅ Python签名生成成功，X-s长度: {len(headers['X-s'])}")
            return headers

        except Exception as e:
            logger.error(f"生成请求头失败: {e}")
            import traceback
            logger.error(f"异常堆栈: {traceback.format_exc()}")

            # 返回基础请求头作为备用方案
            timestamp = str(int(time.time() * 1000))
            return {
                'Content-Type': 'application/json;charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://www.xiaohongshu.com/',
                'Origin': 'https://www.xiaohongshu.com',
                'X-t': timestamp,
                'X-s': f"fallback_{timestamp}",
                'Cookie': self.cookies
            }

    async def _request(self, uri: str, method: str = "GET", data: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """发送HTTP请求"""
        if not await self._initialize():
            return None

        try:
            url = f"{self.base_url}{uri}"

            # 生成请求头
            if method == "POST" and data:
                headers = await self._generate_request_headers(uri, data)
            else:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Cookie': self.cookies
                }

            # 发送请求
            if method == "POST":
                async with self._session.post(url, json=data, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"请求失败: {response.status}")
                        return None
            else:
                async with self._session.get(url, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"请求失败: {response.status}")
                        return None

        except Exception as e:
            logger.error(f"请求失败: {e}")
            return None
    
    async def search_notes(self, keywords: str, limit: int = 10) -> XHSSearchResponse:
        """搜索旅行笔记"""
        if not await self._initialize():
            return XHSSearchResponse(
                success=False,
                message="服务初始化失败",
                data={"keyword": keywords, "total": 0, "notes": []}
            )
        
        try:
            # 使用cv-cat项目的完整搜索实现
            uri = "/api/sns/web/v1/search/notes"
            
            # 生成21位搜索ID
            search_id = await self._generate_x_b3_traceid(21)
            
            # 构造搜索数据
            data = {
                "keyword": keywords,
                "page": 1,
                "page_size": 20,
                "search_id": search_id,
                "sort": "general",
                "note_type": 0,
                "ext_flags": [],
                "filters": [
                    {"tags": ["general"], "type": "sort_type"},
                    {"tags": ["不限"], "type": "filter_note_type"},
                    {"tags": ["不限"], "type": "filter_note_time"},
                    {"tags": ["不限"], "type": "filter_note_range"},
                    {"tags": ["不限"], "type": "filter_pos_distance"}
                ],
                "geo": "",
                "image_formats": ["jpg", "webp", "avif"]
            }
            
            logger.info(f"搜索小红书笔记: {keywords}, search_id: {search_id}")
            
            # 发送搜索请求
            result = await self._request(uri, method="POST", data=data)
            
            if not result:
                return XHSSearchResponse(
                    success=False,
                    message="搜索请求失败",
                    data={"keyword": keywords, "total": 0, "notes": []}
                )
            
            # 检查API响应状态
            if result.get('code') != 0:
                logger.error(f"搜索API返回错误: code={result.get('code')}, msg={result.get('msg', 'Unknown')}")
                return XHSSearchResponse(
                    success=False,
                    message=f"API错误: {result.get('msg', 'Unknown')}",
                    data={"keyword": keywords, "total": 0, "notes": []}
                )
            
            # 处理搜索结果
            data_section = result.get('data', {})
            items = data_section.get('items', [])
            
            logger.info(f"搜索API返回 {len(items)} 个原始结果")
            
            notes = []
            for i, item in enumerate(items):
                try:
                    if 'note_card' in item:
                        note_card = item['note_card']
                        user_info = note_card.get('user', {})
                        interact_info = note_card.get('interact_info', {})
                        cover_info = note_card.get('cover', {})
                        
                        note = XHSNote(
                            id=item.get('id', ''),
                            title=note_card.get('display_title', ''),
                            desc=note_card.get('desc', ''),
                            author=user_info.get('nickname', ''),
                            author_id=user_info.get('user_id', ''),
                            likes=interact_info.get('liked_count', 0),
                            url=f"https://www.xiaohongshu.com/explore/{item.get('id', '')}",
                            cover=cover_info.get('url_default', ''),
                            type=note_card.get('type', ''),
                            tags=note_card.get('tag_list', [])
                        )
                        notes.append(note)
                        
                        # 达到限制数量就停止
                        if len(notes) >= limit:
                            break
                    else:
                        logger.debug(f"项目 {i+1} 没有note_card字段")
                except Exception as e:
                    logger.warning(f"解析笔记 {i+1} 失败: {e}")
                    continue
            
            if notes:
                logger.info(f"搜索成功，找到 {len(notes)} 条有效笔记")
                return XHSSearchResponse(
                    success=True,
                    message="搜索成功",
                    data={
                        "keyword": keywords,
                        "total": len(notes),
                        "notes": [note.dict() for note in notes],
                        "source": "api_search"
                    }
                )
            else:
                logger.warning("搜索结果为空")
                return XHSSearchResponse(
                    success=False,
                    message=f"未找到关键词 '{keywords}' 的相关笔记",
                    data={"keyword": keywords, "total": 0, "notes": []}
                )
                
        except Exception as e:
            logger.error(f"搜索异常: {e}")
            return XHSSearchResponse(
                success=False,
                message=f"搜索服务异常: {str(e)}",
                data={"keyword": keywords, "total": 0, "notes": []}
            )
    
    async def get_note_info(self, note_url: str) -> Optional[Dict[str, Any]]:
        """
        获取笔记详细信息
        """
        if not await self._initialize():
            return None

        try:
            success, msg, result = await self.apis.get_note_info(note_url, self.cookies)
            if success and result:
                # 格式化笔记数据
                note_data = result.get('data', {}).get('items', [])
                if note_data:
                    return format_note_data(note_data[0])
            else:
                logger.error(f"获取笔记信息失败: {msg}")
            return None
        except Exception as e:
            logger.error(f"获取笔记信息异常: {e}")
            return None

    async def get_user_info(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        获取用户信息
        """
        if not await self._initialize():
            return None

        try:
            success, msg, result = await self.apis.get_user_info(user_id, self.cookies)
            if success and result:
                user_data = result.get('data', {})
                if user_data:
                    return format_user_data(user_data)
            else:
                logger.error(f"获取用户信息失败: {msg}")
            return None
        except Exception as e:
            logger.error(f"获取用户信息异常: {e}")
            return None

    async def search_notes_advanced(
        self,
        query: str,
        limit: int = 20,
        sort_type: int = 0,
        note_type: int = 0,
        note_time: int = 0
    ) -> List[Dict[str, Any]]:
        """
        高级笔记搜索
        """
        if not await self._initialize():
            return []

        try:
            success, msg, notes = await self.apis.search_some_note(
                query=query,
                require_num=limit,
                cookies_str=self.cookies,
                sort_type_choice=sort_type,
                note_type=note_type,
                note_time=note_time
            )

            if success and notes:
                # 格式化笔记数据
                formatted_notes = []
                for note in notes:
                    if 'note_card' in note:
                        formatted_note = format_note_data(note['note_card'])
                        if formatted_note:
                            formatted_notes.append(formatted_note)
                return formatted_notes
            else:
                logger.error(f"高级搜索失败: {msg}")
            return []
        except Exception as e:
            logger.error(f"高级搜索异常: {e}")
            return []

    async def get_homefeed_channels(self) -> List[Dict[str, Any]]:
        """
        获取主页频道列表
        """
        if not await self._initialize():
            return []

        try:
            success, msg, result = await self.apis.get_homefeed_all_channel(self.cookies)
            if success and result:
                channels = result.get('data', {}).get('channels', [])
                return channels
            else:
                logger.error(f"获取主页频道失败: {msg}")
            return []
        except Exception as e:
            logger.error(f"获取主页频道异常: {e}")
            return []

    @staticmethod
    def get_no_watermark_image(img_url: str) -> Optional[str]:
        """
        获取无水印图片URL
        """
        try:
            success, msg, new_url = XHSApis.get_note_no_water_img(img_url)
            if success:
                return new_url
            else:
                logger.error(f"获取无水印图片失败: {msg}")
            return None
        except Exception as e:
            logger.error(f"获取无水印图片异常: {e}")
            return None

    @staticmethod
    def get_no_watermark_video(note_id: str) -> Optional[str]:
        """
        获取无水印视频URL
        """
        try:
            success, msg, video_url = XHSApis.get_note_no_water_video(note_id)
            if success:
                return video_url
            else:
                logger.error(f"获取无水印视频失败: {msg}")
            return None
        except Exception as e:
            logger.error(f"获取无水印视频异常: {e}")
            return None

    async def close(self):
        """关闭服务"""
        if self._session:
            await self._session.close()
            self._session = None
        self._initialized = False
        logger.info("FastAPI小红书服务已关闭")


# 创建全局服务实例
fastapi_xhs_service = FastAPIXhsService()


# 依赖注入函数
async def get_xhs_service() -> FastAPIXhsService:
    """获取小红书服务实例"""
    return fastapi_xhs_service
