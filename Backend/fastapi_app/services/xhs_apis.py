# encoding: utf-8
import json
import re
import urllib.parse
import requests
from typing import Dict, List, Tuple, Optional, Any
import asyncio
import aiohttp
from loguru import logger
from .xhs_utils import splice_str, generate_request_params, generate_x_b3_traceid, get_common_headers

"""
小红书API接口类
基于cv-cat/Spider_XHS项目实现
"""

class XHSApis:
    def __init__(self):
        self.base_url = "https://edith.xiaohongshu.com"
        
    async def get_homefeed_all_channel(self, cookies_str: str, proxies: dict = None) -> Tuple[bool, str, Optional[Dict]]:
        """
        获取主页的所有频道
        """
        res_json = None
        try:
            api = "/api/sns/web/v1/homefeed/category"
            headers, cookies, data = generate_request_params(cookies_str, api)
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.base_url + api, 
                    headers=headers, 
                    cookies=cookies, 
                    proxy=proxies.get('http') if proxies else None
                ) as response:
                    res_json = await response.json()
                    success, msg = res_json["success"], res_json["msg"]
        except Exception as e:
            success = False
            msg = str(e)
            logger.error(f"获取主页频道失败: {e}")
        
        return success, msg, res_json

    async def get_homefeed_recommend(
        self, 
        category: str, 
        cursor_score: str, 
        refresh_type: int, 
        note_index: int, 
        cookies_str: str, 
        proxies: dict = None
    ) -> Tuple[bool, str, Optional[Dict]]:
        """
        获取主页推荐的笔记
        """
        res_json = None
        try:
            api = "/api/sns/web/v1/homefeed"
            data = {
                "cursor_score": cursor_score,
                "num": 20,
                "refresh_type": refresh_type,
                "note_index": note_index,
                "unread_begin_note_id": "",
                "unread_end_note_id": "",
                "unread_note_count": 0,
                "category": category,
                "search_key": "",
                "need_num": 10,
                "image_formats": ["jpg", "webp", "avif"],
                "need_filter_image": False
            }
            
            headers, cookies, trans_data = generate_request_params(cookies_str, api, data)
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url + api,
                    headers=headers,
                    data=trans_data,
                    cookies=cookies,
                    proxy=proxies.get('http') if proxies else None
                ) as response:
                    res_json = await response.json()
                    success, msg = res_json["success"], res_json["msg"]
        except Exception as e:
            success = False
            msg = str(e)
            logger.error(f"获取主页推荐失败: {e}")
            
        return success, msg, res_json

    async def get_user_info(self, user_id: str, cookies_str: str, proxies: dict = None) -> Tuple[bool, str, Optional[Dict]]:
        """
        获取用户的信息
        """
        res_json = None
        try:
            api = "/api/sns/web/v1/user/otherinfo"
            params = {"target_user_id": user_id}
            splice_api = splice_str(api, params)
            headers, cookies, data = generate_request_params(cookies_str, splice_api)
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.base_url + splice_api,
                    headers=headers,
                    cookies=cookies,
                    proxy=proxies.get('http') if proxies else None
                ) as response:
                    res_json = await response.json()
                    success, msg = res_json["success"], res_json["msg"]
        except Exception as e:
            success = False
            msg = str(e)
            logger.error(f"获取用户信息失败: {e}")
            
        return success, msg, res_json

    async def get_note_info(self, url: str, cookies_str: str, proxies: dict = None) -> Tuple[bool, str, Optional[Dict]]:
        """
        获取笔记的详细信息
        """
        res_json = None
        try:
            urlParse = urllib.parse.urlparse(url)
            note_id = urlParse.path.split("/")[-1]
            kvs = urlParse.query.split('&') if urlParse.query else []
            kvDist = {kv.split('=')[0]: kv.split('=')[1] for kv in kvs if '=' in kv}
            
            api = "/api/sns/web/v1/feed"
            data = {
                "source_note_id": note_id,
                "image_formats": ["jpg", "webp", "avif"],
                "extra": {"need_body_topic": "1"},
                "xsec_source": kvDist.get('xsec_source', 'pc_search'),
                "xsec_token": kvDist.get('xsec_token', '')
            }
            
            headers, cookies, trans_data = generate_request_params(cookies_str, api, data)
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url + api,
                    headers=headers,
                    data=trans_data,
                    cookies=cookies,
                    proxy=proxies.get('http') if proxies else None
                ) as response:
                    res_json = await response.json()
                    success, msg = res_json["success"], res_json["msg"]
        except Exception as e:
            success = False
            msg = str(e)
            logger.error(f"获取笔记信息失败: {e}")
            
        return success, msg, res_json

    async def search_note(
        self,
        query: str,
        cookies_str: str,
        page: int = 1,
        sort_type_choice: int = 0,
        note_type: int = 0,
        note_time: int = 0,
        note_range: int = 0,
        pos_distance: int = 0,
        geo: str = "",
        proxies: dict = None
    ) -> Tuple[bool, str, Optional[Dict]]:
        """
        搜索笔记
        """
        res_json = None
        
        # 排序类型映射
        sort_type = "general"
        if sort_type_choice == 1:
            sort_type = "time_descending"
        elif sort_type_choice == 2:
            sort_type = "popularity_descending"
        elif sort_type_choice == 3:
            sort_type = "comment_descending"
        elif sort_type_choice == 4:
            sort_type = "collect_descending"
            
        # 笔记类型映射
        filter_note_type = "不限"
        if note_type == 1:
            filter_note_type = "视频笔记"
        elif note_type == 2:
            filter_note_type = "普通笔记"
            
        # 时间范围映射
        filter_note_time = "不限"
        if note_time == 1:
            filter_note_time = "一天内"
        elif note_time == 2:
            filter_note_time = "一周内"
        elif note_time == 3:
            filter_note_time = "半年内"
            
        # 笔记范围映射
        filter_note_range = "不限"
        if note_range == 1:
            filter_note_range = "已看过"
        elif note_range == 2:
            filter_note_range = "未看过"
        elif note_range == 3:
            filter_note_range = "已关注"
            
        # 位置距离映射
        filter_pos_distance = "不限"
        if pos_distance == 1:
            filter_pos_distance = "同城"
        elif pos_distance == 2:
            filter_pos_distance = "附近"
            
        if geo:
            geo = json.dumps(geo, separators=(',', ':'))
            
        try:
            api = "/api/sns/web/v1/search/notes"
            data = {
                "keyword": query,
                "page": page,
                "page_size": 20,
                "search_id": generate_x_b3_traceid(21),
                "sort": "general",
                "note_type": 0,
                "ext_flags": [],
                "filters": [
                    {"tags": [sort_type], "type": "sort_type"},
                    {"tags": [filter_note_type], "type": "filter_note_type"},
                    {"tags": [filter_note_time], "type": "filter_note_time"},
                    {"tags": [filter_note_range], "type": "filter_note_range"},
                    {"tags": [filter_pos_distance], "type": "filter_pos_distance"}
                ],
                "geo": geo,
                "image_formats": ["jpg", "webp", "avif"]
            }
            
            headers, cookies, trans_data = generate_request_params(cookies_str, api, data)
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url + api,
                    headers=headers,
                    data=trans_data.encode('utf-8'),
                    cookies=cookies,
                    proxy=proxies.get('http') if proxies else None
                ) as response:
                    res_json = await response.json()
                    success, msg = res_json["success"], res_json["msg"]
        except Exception as e:
            success = False
            msg = str(e)
            logger.error(f"搜索笔记失败: {e}")
            
        return success, msg, res_json

    async def search_some_note(
        self,
        query: str,
        require_num: int,
        cookies_str: str,
        sort_type_choice: int = 0,
        note_type: int = 0,
        note_time: int = 0,
        note_range: int = 0,
        pos_distance: int = 0,
        geo: str = "",
        proxies: dict = None
    ) -> Tuple[bool, str, List[Dict]]:
        """
        指定数量搜索笔记
        """
        page = 1
        note_list = []
        
        try:
            while True:
                success, msg, res_json = await self.search_note(
                    query, cookies_str, page, sort_type_choice, 
                    note_type, note_time, note_range, pos_distance, geo, proxies
                )
                
                if not success:
                    raise Exception(msg)
                    
                if "items" not in res_json["data"]:
                    break
                    
                notes = res_json["data"]["items"]
                note_list.extend(notes)
                page += 1
                
                if len(note_list) >= require_num or not res_json["data"]["has_more"]:
                    break
                    
        except Exception as e:
            success = False
            msg = str(e)
            logger.error(f"批量搜索笔记失败: {e}")
            
        if len(note_list) > require_num:
            note_list = note_list[:require_num]
            
        return success, msg, note_list

    @staticmethod
    def get_note_no_water_img(img_url: str) -> Tuple[bool, str, Optional[str]]:
        """
        获取笔记无水印图片
        """
        success = True
        msg = '成功'
        new_url = None
        
        try:
            if '.jpg' in img_url:
                img_id = '/'.join([split for split in img_url.split('/')[-3:]]).split('!')[0]
                new_url = f'https://sns-img-qc.xhscdn.com/{img_id}'
            elif 'spectrum' in img_url:
                img_id = '/'.join(img_url.split('/')[-2:]).split('!')[0]
                new_url = f'http://sns-webpic.xhscdn.com/{img_id}?imageView2/2/w/format/jpg'
            else:
                img_id = img_url.split('/')[-1].split('!')[0]
                new_url = f'https://sns-img-qc.xhscdn.com/{img_id}'
        except Exception as e:
            success = False
            msg = str(e)
            logger.error(f"获取无水印图片失败: {e}")
            
        return success, msg, new_url

    @staticmethod
    def get_note_no_water_video(note_id: str) -> Tuple[bool, str, Optional[str]]:
        """
        获取笔记无水印视频
        """
        success = True
        msg = '成功'
        video_addr = None
        
        try:
            headers = get_common_headers()
            url = f"https://www.xiaohongshu.com/explore/{note_id}"
            response = requests.get(url, headers=headers)
            res = response.text
            video_addr = re.findall(r'<video[^>]*src="([^"]*)"', res)[0]
        except Exception as e:
            success = False
            msg = str(e)
            logger.error(f"获取无水印视频失败: {e}")
            
        return success, msg, video_addr
