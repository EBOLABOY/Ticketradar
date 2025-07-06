#!/usr/bin/env python3
"""
Windows环境下的SSL修复脚本
解决smart-flights库在Windows下的SSL证书验证问题
"""
import os
import ssl
import platform
from loguru import logger


def fix_ssl_for_windows():
    """
    修复Windows环境下的SSL问题
    """
    if platform.system() != "Windows":
        logger.info("非Windows环境，跳过SSL修复")
        return
    
    try:
        # 1. 禁用SSL证书验证
        ssl._create_default_https_context = ssl._create_unverified_context
        logger.info("✅ 已禁用SSL证书验证")
        
        # 2. 设置环境变量
        ssl_env_vars = {
            'CURL_CA_BUNDLE': '',
            'REQUESTS_CA_BUNDLE': '',
            'SSL_VERIFY': 'false',
            'PYTHONHTTPSVERIFY': '0',
            'CURL_CFFI_VERIFY': 'false',
            'CURL_INSECURE': '1',
            'CURL_CAINFO': '',
            'CURL_CAPATH': '',
            'CURL_SSL_VERIFYPEER': '0',
            'CURL_SSL_VERIFYHOST': '0'
        }
        
        for key, value in ssl_env_vars.items():
            os.environ[key] = value
            
        logger.info("✅ 已设置SSL相关环境变量")
        
        # 3. 尝试修复requests库的SSL问题
        try:
            import requests
            from requests.adapters import HTTPAdapter
            from urllib3.util.retry import Retry
            import urllib3
            
            # 禁用SSL警告
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            
            # 设置默认的requests会话
            session = requests.Session()
            session.verify = False
            
            logger.info("✅ 已配置requests库禁用SSL验证")
            
        except ImportError:
            logger.warning("requests库未安装，跳过requests SSL配置")
        
        # 4. 尝试修复curl-cffi的SSL问题
        try:
            import curl_cffi
            # 设置curl-cffi的默认选项
            os.environ['CURL_CFFI_VERIFY'] = 'false'
            logger.info("✅ 已配置curl-cffi禁用SSL验证")
        except ImportError:
            logger.warning("curl-cffi库未安装，跳过curl-cffi SSL配置")
            
        logger.info("🔧 Windows SSL修复完成")
        
    except Exception as e:
        logger.error(f"SSL修复失败: {e}")
        raise


if __name__ == "__main__":
    fix_ssl_for_windows()
