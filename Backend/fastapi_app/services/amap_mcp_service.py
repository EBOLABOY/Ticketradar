"""
FastAPI版本的高德地图MCP服务
基于官方@amap/amap-maps-mcp-server
"""
import asyncio
import json
import os
import platform
from typing import Dict, Any, Optional, List
from loguru import logger


class FastAPIAmapMCPService:
    """FastAPI版本的高德地图MCP服务"""
    
    def __init__(self):
        """初始化高德地图MCP服务"""
        self.api_key = os.getenv("AMAP_API_KEY", "")
        self._process: Optional[asyncio.subprocess.Process] = None
        self._initialized = False
        
        if not self.api_key:
            logger.warning("AMAP_API_KEY未配置，高德地图MCP服务将不可用")
        else:
            logger.info(f"高德地图MCP服务初始化 - API Key: ***{self.api_key[-4:]}")
    
    async def _ensure_initialized(self) -> bool:
        """确保MCP服务已初始化"""
        if self._initialized and self._process and self._process.returncode is None:
            return True
        
        if not self.api_key:
            logger.error("AMAP_API_KEY未配置")
            return False
        
        try:
            # 启动高德地图MCP服务进程
            env = os.environ.copy()
            env["AMAP_MAPS_API_KEY"] = self.api_key

            # Windows环境下使用不同的启动方式
            is_windows = platform.system() == "Windows"

            logger.info(f"🚀 启动高德地图MCP服务，API Key: ***{self.api_key[-4:]}")

            if is_windows:
                # Windows环境下暂时禁用MCP服务，直接返回失败
                logger.warning("Windows环境下暂时禁用高德地图MCP服务，将跳过地图相关功能")
                return False
            else:
                self._process = await asyncio.create_subprocess_exec(
                    "npx", "-y", "@amap/amap-maps-mcp-server",
                    stdin=asyncio.subprocess.PIPE,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    env=env
                )

            # 等待进程启动
            await asyncio.sleep(2)

            # 检查进程是否正常启动
            if self._process.returncode is not None:
                stderr_output = await self._process.stderr.read()
                stderr_text = stderr_output.decode() if stderr_output else "无错误信息"
                logger.error(f"高德地图MCP服务进程启动失败，返回码: {self._process.returncode}")
                logger.error(f"错误信息: {stderr_text}")
                return False

            # 发送初始化请求
            init_request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {"name": "fastapi-amap-client", "version": "1.0.0"}
                }
            }

            logger.debug(f"发送初始化请求: {init_request}")
            self._process.stdin.write((json.dumps(init_request) + '\n').encode())
            await self._process.stdin.drain()

            # 读取初始化响应（添加超时）
            try:
                response_line = await asyncio.wait_for(
                    self._process.stdout.readline(),
                    timeout=10.0
                )
                response_text = response_line.decode().strip()
                logger.debug(f"收到初始化响应: {response_text}")

                if not response_text:
                    logger.error("高德地图MCP服务返回空响应")
                    return False

                init_response = json.loads(response_text)

                if init_response.get("result"):
                    self._initialized = True
                    logger.info("✅ 高德地图MCP服务初始化成功")
                    return True
                else:
                    logger.error(f"高德地图MCP服务初始化失败: {init_response}")
                    return False

            except asyncio.TimeoutError:
                logger.error("高德地图MCP服务初始化超时")
                return False
            except json.JSONDecodeError as e:
                logger.error(f"高德地图MCP服务响应解析失败: {e}, 原始响应: {response_text}")
                return False

        except Exception as e:
            logger.error(f"高德地图MCP服务启动失败: {e}")
            import traceback
            logger.error(f"详细错误信息: {traceback.format_exc()}")
            return False
    
    async def _call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """调用MCP工具"""
        if not await self._ensure_initialized():
            return {"success": False, "error": "MCP服务未初始化"}
        
        try:
            # 构建工具调用请求
            tool_request = {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": tool_name,
                    "arguments": arguments
                }
            }
            
            # 发送请求
            self._process.stdin.write((json.dumps(tool_request) + '\n').encode())
            await self._process.stdin.drain()
            
            # 读取响应
            response_line = await self._process.stdout.readline()
            tool_response = json.loads(response_line.decode().strip())
            
            if "result" in tool_response:
                return {
                    "success": True,
                    "data": tool_response["result"]
                }
            else:
                return {
                    "success": False,
                    "error": tool_response.get("error", "工具调用失败")
                }
                
        except Exception as e:
            logger.error(f"MCP工具调用失败: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_weather(self, city: str) -> Dict[str, Any]:
        """获取天气信息"""
        logger.info(f"获取天气信息: {city}")
        return await self._call_tool("maps_weather", {"city": city})
    
    async def geocode(self, address: str, city: str = None) -> Dict[str, Any]:
        """地理编码：地址转坐标"""
        logger.info(f"地理编码: {address}, 城市: {city}")
        params = {"address": address}
        if city:
            params["city"] = city
        return await self._call_tool("maps_geo", params)
    
    async def reverse_geocode(self, location: str) -> Dict[str, Any]:
        """逆地理编码：坐标转地址"""
        logger.info(f"逆地理编码: {location}")
        return await self._call_tool("maps_regeocode", {"location": location})
    
    async def search_poi(self, keywords: str, city: str = None, types: str = None) -> Dict[str, Any]:
        """POI搜索"""
        logger.info(f"POI搜索: {keywords}, 城市: {city}")
        params = {"keywords": keywords}
        if city:
            params["city"] = city
        if types:
            params["types"] = types
        return await self._call_tool("maps_text_search", params)
    
    async def search_around(self, keywords: str, location: str, radius: str = "1000") -> Dict[str, Any]:
        """周边搜索"""
        logger.info(f"周边搜索: {keywords}, 位置: {location}, 半径: {radius}")
        return await self._call_tool("maps_around_search", {
            "keywords": keywords,
            "location": location,
            "radius": radius
        })
    
    async def get_distance(self, origins: str, destination: str, distance_type: str = "0") -> Dict[str, Any]:
        """距离测量
        distance_type: 0-直线距离, 1-驾车距离, 3-步行距离
        """
        logger.info(f"距离测量: {origins} -> {destination}")
        return await self._call_tool("maps_distance", {
            "origins": origins,
            "destination": destination,
            "type": distance_type
        })
    
    async def get_driving_route(self, origin: str, destination: str) -> Dict[str, Any]:
        """驾车路径规划"""
        logger.info(f"驾车路径规划: {origin} -> {destination}")
        return await self._call_tool("maps_direction_driving", {
            "origin": origin,
            "destination": destination
        })
    
    async def get_walking_route(self, origin: str, destination: str) -> Dict[str, Any]:
        """步行路径规划"""
        logger.info(f"步行路径规划: {origin} -> {destination}")
        return await self._call_tool("maps_direction_walking", {
            "origin": origin,
            "destination": destination
        })
    
    async def get_transit_route(self, origin: str, destination: str, city: str, cityd: str = None) -> Dict[str, Any]:
        """公交路径规划"""
        logger.info(f"公交路径规划: {origin} -> {destination}")
        params = {
            "origin": origin,
            "destination": destination,
            "city": city
        }
        if cityd:
            params["cityd"] = cityd
        return await self._call_tool("maps_direction_transit_integrated", params)
    
    async def close(self):
        """关闭MCP服务"""
        if self._process:
            try:
                self._process.terminate()
                await self._process.wait()
                logger.info("高德地图MCP服务已关闭")
            except Exception as e:
                logger.error(f"关闭高德地图MCP服务时出错: {e}")
            finally:
                self._process = None
                self._initialized = False


# 全局服务实例
_amap_mcp_service: Optional[FastAPIAmapMCPService] = None


def get_amap_mcp_service() -> FastAPIAmapMCPService:
    """获取高德地图MCP服务实例"""
    global _amap_mcp_service
    if _amap_mcp_service is None:
        _amap_mcp_service = FastAPIAmapMCPService()
    return _amap_mcp_service


async def close_amap_mcp_service():
    """关闭高德地图MCP服务"""
    global _amap_mcp_service
    if _amap_mcp_service:
        await _amap_mcp_service.close()
        _amap_mcp_service = None
