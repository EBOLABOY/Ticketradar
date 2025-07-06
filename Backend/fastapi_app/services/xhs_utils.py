# encoding: utf-8
import os
import json
import random
import string
import time
import hashlib
import base64
import asyncio
from typing import Dict, Any, Tuple, Optional
from loguru import logger
from dotenv import load_dotenv

# 确保能加载到项目根目录的.env文件
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
            logger.debug(f"✅ xhs_utils成功加载环境变量文件: {env_path}")
            return env_path

    logger.warning("⚠️ xhs_utils未找到.env文件，将使用系统环境变量")
    return None

# 加载环境变量
load_project_env()

def splice_str(api: str, params: Dict[str, Any]) -> str:
    """
    拼接URL参数
    """
    if not params:
        return api
    
    param_str = "&".join([f"{k}={v}" for k, v in params.items()])
    return f"{api}?{param_str}"

def generate_x_b3_traceid(length: int = 16) -> str:
    """
    生成X-B3-TraceId
    """
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def get_common_headers() -> Dict[str, str]:
    """
    获取通用请求头
    """
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    }

def generate_request_params(cookies_str: str, api: str, data: Dict[str, Any] = None) -> Tuple[Dict[str, str], Dict[str, str], str]:
    """
    生成请求参数，包括headers、cookies和data
    """
    # 解析cookies字符串
    cookies = parse_cookies_string(cookies_str)

    # 生成基础headers
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
        'X-Requested-With': 'XMLHttpRequest'
    }

    # 如果有数据，转换为JSON字符串
    data_str = ""
    if data:
        data_str = json.dumps(data, separators=(',', ':'), ensure_ascii=False)

    # 尝试生成真实的签名
    try:
        a1 = cookies.get('a1', '')
        if a1:
            signature_result = generate_advanced_signature(api, data_str, a1)
            if signature_result:
                headers.update({
                    'X-t': signature_result['X-t'],
                    'X-s': signature_result['X-s'],
                    'X-s-common': signature_result.get('X-s-common', ''),
                    'X-B3-TraceId': generate_x_b3_traceid(32)
                })
            else:
                # 降级到简化签名
                timestamp = str(int(time.time() * 1000))
                headers.update({
                    'X-t': timestamp,
                    'X-s': generate_simple_signature(api, data_str, timestamp),
                    'X-B3-TraceId': generate_x_b3_traceid(32)
                })
        else:
            # 没有a1参数，使用简化签名
            timestamp = str(int(time.time() * 1000))
            headers.update({
                'X-t': timestamp,
                'X-s': generate_simple_signature(api, data_str, timestamp),
                'X-B3-TraceId': generate_x_b3_traceid(32)
            })
    except Exception as e:
        logger.warning(f"签名生成失败，使用简化版本: {e}")
        timestamp = str(int(time.time() * 1000))
        headers.update({
            'X-t': timestamp,
            'X-s': generate_simple_signature(api, data_str, timestamp),
            'X-B3-TraceId': generate_x_b3_traceid(32)
        })

    return headers, cookies, data_str

def generate_simple_signature(api: str, data: str, timestamp: str) -> str:
    """
    生成简化的签名（实际的小红书签名算法非常复杂）
    这里只是一个占位符实现
    """
    # 注意：这是一个简化的实现，真实的小红书签名算法需要JavaScript逆向
    content = f"{api}{data}{timestamp}"
    signature = hashlib.md5(content.encode()).hexdigest()

    # 模拟小红书的签名格式
    fake_payload = {
        "signSvn": "56",
        "signType": "x2",
        "appId": "xhs-pc-web",
        "signVersion": "1",
        "payload": signature
    }

    encoded_payload = base64.b64encode(json.dumps(fake_payload).encode()).decode()
    return f"XYW_{encoded_payload}"

def generate_advanced_signature(api: str, data: str, a1: str) -> Optional[Dict[str, str]]:
    """
    生成高级签名，使用Python实现的签名算法
    """
    try:
        # 生成时间戳
        timestamp = str(int(time.time() * 1000))

        # 构建签名内容
        content1 = api + data
        content2 = timestamp + a1

        # 生成多重哈希
        hash1 = hashlib.md5(content1.encode('utf-8')).hexdigest()
        hash2 = hashlib.sha1(content2.encode('utf-8')).hexdigest()

        # 固定字符串常量（来自cv-cat/Spider_XHS项目）
        fff_constant = "I38rHdgsjopgIvesdVwgIC+oIELmBZ5e3VwXLgFTIxS3bqwErFeexd0ekncAzMFYnqthIhJeSfMDKutRI3KsYorWHPtGrbV0P9WfIi/eWc6eYqtyQApPI37ekmR1QL+5Ii6sdnoeSfqYHqwl2qt5B0DoIx+PGDi/sVtkIxdeTqwGtuwWIEhBIE3s3Mi3ICLdI3Oe0Vtl2ADmsLveDSJsSPw5IEvsiVtJOqw8BVwfPpdeTFWOIx4TIiu6ZPwbPut5IvlaLbgs3qtxIxes1VwHIkumIkIyejgsY/WTge7eSqte/D7sDcpipBKefm4sIx/efutZIE0ejutImcLj8fPHIx5e3ut3gIoe19kKIESPIhhgHgGUI38P4m+oIhLu/uwMI3qV2d3ejIgs6PwRIvge0fvejAR2IideTbVUqqwkIkOs196s6Y3eiVwopa/eDuwFICFeoBKsWqt1msoeYqtoIvIQIvm5muwGmPwJoei4KWKed77eiPwcIioejAAeVMDYIiNsWMvs3nV7Ikge1Vt6IkiIPqwwNqtUI3OeiVtdIkKsVqwVIENsDqtXNPwnsuwFIvGUI3HgGBIW2IveiPtMIhPKIi0eSPw4eY4KLa6sYjYdIirw4VtOZuw5ICKe3qtd+L/eTlJs1rSwIhOs3oNs3qts/VwqI3Ae0PwAIkge6sR+Ixds0UgsSPtRIh/eSPwUH0PwIiLpI33sxMgeka/ejFdsYPtQIiFFI3EYmutcICEIIEgs3SFSNsOsWutsIEbQmqtWGIKsjMveYPwrsPwZIvEDIhh+LuwtyPtbIC7eWMAs6Vt2ZVwHIiHQLPw5IvG4L9MgIEJe0L/sY9Ne3VwsHVt4I3HyIx0s6PtRIEKe0WPAI3bebW42ICSKIv0e1VwvbVww4VwFICb3IkJexfgskutTmI8lIC4LqPtseuteIxGiIibyIiT3IE/ekSKe3WLItuwKICLEpPwQrVwVIh6sT/lvIEm3sUNs0VwdcqwmzLYKr/DXIiMlaVwtIkdsDWY/IiTHrPwYIhZO2utfbPtwIEDIIClMICk/zVtjIE4OIiee6VtFLbV1IkbNI3gedo5ekPwkICYkIEPAnjHdIvpf/Wq9IxgedYoeSuwZIENsiVtQIEZ8IC3s0PtwIxIpzPtYI3ve1FTnouw6GuwQIx0eSPwwIEJsSDzSIEJsDoAsTVtrtsvsSuwOcm7e6utrIx/sxYJe3PtaIEq0Ikq2autQyMFnIv5sjVtap7Ks1LFEsuwNIxRPIivsdYYrIiAeDPtrIvHyIEgeWZFdIkHLIico8M8nICJeYWYFIkWMIvb9I3oeSdWLJuwzbuwynmgsdF5sfqtYIv6ejbNejqwzZVtNI3QPnqw0outHHqtUGqwEtVtWt06s6z5ei9/skl6e6uwqIiPGIhT6I3QFI3OsiBgsT7hUHVtGIEMEmut4P03ekPt8ICAsfZOefezZIvAsSqwmPpmxI36sfPt6IvesVuw7HqtyI3JefdDzOutZbc7ejph="

        # 组合哈希
        combined_hash = hashlib.md5((hash1 + hash2 + fff_constant[:100]).encode('utf-8')).hexdigest()

        # 构建payload
        payload = {
            "signSvn": "56",
            "signType": "x2",
            "appId": "xhs-pc-web",
            "signVersion": "1",
            "payload": combined_hash
        }

        # 编码payload
        payload_str = json.dumps(payload, separators=(',', ':'))
        encoded_payload = base64.b64encode(payload_str.encode('utf-8')).decode('utf-8')
        xs = f"XYW_{encoded_payload}"

        # 生成xs_common
        xs_common_data = {
            "s0": 5,
            "s1": "",
            "x0": "1",
            "x1": "3.8.7",
            "x2": "Windows",
            "x3": "xhs-pc-web",
            "x4": "4.45.1",
            "x5": a1,
            "x6": timestamp,
            "x7": xs,
            "x8": fff_constant,
            "x9": hashlib.md5((timestamp + xs + fff_constant).encode('utf-8')).hexdigest(),
            "x10": 11,
        }

        xs_common_str = json.dumps(xs_common_data, separators=(',', ':'))
        xs_common = base64.b64encode(xs_common_str.encode('utf-8')).decode('utf-8')

        return {
            'X-s': xs,
            'X-t': timestamp,
            'X-s-common': xs_common
        }

    except Exception as e:
        logger.error(f"Python签名生成异常: {e}")
        return None

def parse_cookies_string(cookies_str: str) -> Dict[str, str]:
    """
    解析cookies字符串为字典
    """
    cookies = {}
    if not cookies_str:
        return cookies
        
    for cookie in cookies_str.split(';'):
        cookie = cookie.strip()
        if '=' in cookie:
            key, value = cookie.split('=', 1)
            cookies[key.strip()] = value.strip()
    
    return cookies

def format_cookies_dict(cookies: Dict[str, str]) -> str:
    """
    将cookies字典格式化为字符串
    """
    return '; '.join([f"{k}={v}" for k, v in cookies.items()])

def extract_note_id_from_url(url: str) -> str:
    """
    从小红书URL中提取笔记ID
    """
    import re
    
    # 匹配各种小红书URL格式
    patterns = [
        r'/explore/([a-f0-9]+)',
        r'/discovery/item/([a-f0-9]+)',
        r'noteId=([a-f0-9]+)',
        r'/([a-f0-9]{24})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return ""

def extract_user_id_from_url(url: str) -> str:
    """
    从小红书用户URL中提取用户ID
    """
    import re
    
    patterns = [
        r'/user/profile/([a-f0-9]+)',
        r'userId=([a-f0-9]+)',
        r'/([a-f0-9]{24})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return ""

def validate_cookies(cookies_str: str) -> bool:
    """
    验证cookies是否有效
    """
    if not cookies_str:
        return False

    # 基本验证：至少需要a1参数
    cookies = parse_cookies_string(cookies_str)

    # 必须有a1参数
    if 'a1' not in cookies or not cookies['a1']:
        return False

    # 推荐有web_session，但不强制要求
    if 'web_session' not in cookies:
        logger.warning("建议添加web_session参数以获得更好的API访问权限")

    return True

def clean_text(text: str) -> str:
    """
    清理文本，移除特殊字符
    """
    import re
    
    if not text:
        return ""
    
    # 移除HTML标签
    text = re.sub(r'<[^>]+>', '', text)
    
    # 移除多余的空白字符
    text = re.sub(r'\s+', ' ', text)
    
    # 移除首尾空白
    text = text.strip()
    
    return text

def format_note_data(note_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    格式化笔记数据
    """
    if not note_data:
        return {}
    
    formatted = {
        'note_id': note_data.get('id', ''),
        'title': clean_text(note_data.get('title', '')),
        'desc': clean_text(note_data.get('desc', '')),
        'type': note_data.get('type', ''),
        'user': {
            'user_id': note_data.get('user', {}).get('user_id', ''),
            'nickname': note_data.get('user', {}).get('nickname', ''),
            'avatar': note_data.get('user', {}).get('avatar', '')
        },
        'interact_info': note_data.get('interact_info', {}),
        'image_list': note_data.get('image_list', []),
        'video': note_data.get('video', {}),
        'tag_list': note_data.get('tag_list', []),
        'at_user_list': note_data.get('at_user_list', []),
        'collected_count': note_data.get('interact_info', {}).get('collected_count', 0),
        'comment_count': note_data.get('interact_info', {}).get('comment_count', 0),
        'liked_count': note_data.get('interact_info', {}).get('liked_count', 0),
        'share_count': note_data.get('interact_info', {}).get('share_count', 0),
        'time': note_data.get('time', 0),
        'last_update_time': note_data.get('last_update_time', 0)
    }
    
    return formatted

def format_user_data(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    格式化用户数据
    """
    if not user_data:
        return {}
    
    formatted = {
        'user_id': user_data.get('user_id', ''),
        'nickname': clean_text(user_data.get('nickname', '')),
        'desc': clean_text(user_data.get('desc', '')),
        'avatar': user_data.get('avatar', ''),
        'ip_location': user_data.get('ip_location', ''),
        'follows': user_data.get('follows', 0),
        'fans': user_data.get('fans', 0),
        'interaction': user_data.get('interaction', 0),
        'tags': user_data.get('tags', []),
        'is_verified': user_data.get('is_verified', False),
        'verification_content': user_data.get('verification_content', ''),
        'level_info': user_data.get('level_info', {}),
        'gender': user_data.get('gender', 0),
        'birthday': user_data.get('birthday', ''),
        'location': user_data.get('location', '')
    }
    
    return formatted

def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """
    重试装饰器
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logger.warning(f"第{attempt + 1}次尝试失败: {e}")
                    
                    if attempt < max_retries - 1:
                        await asyncio.sleep(delay * (2 ** attempt))  # 指数退避
                    
            logger.error(f"所有重试都失败了，最后的错误: {last_exception}")
            raise last_exception
            
        return wrapper
    return decorator
