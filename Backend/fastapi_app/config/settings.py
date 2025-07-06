#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPI 应用配置设置
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# 加载Backend目录的环境变量文件
backend_root = Path(__file__).parent.parent.parent
env_path = backend_root / ".env"
load_dotenv(env_path)

# 基本配置
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")

# 服务器配置
SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("SERVER_PORT", 38181))

# 数据库配置
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ticketradar.db")

# Supabase 配置
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")

# 使用 Supabase 作为主数据库
USE_SUPABASE = bool(SUPABASE_URL and SUPABASE_ANON_KEY)
if USE_SUPABASE:
    DATABASE_URL = SUPABASE_DATABASE_URL or DATABASE_URL

# JWT 配置
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Redis 配置
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

# AI 服务配置
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")

# 高德地图配置
AMAP_API_KEY = os.getenv("AMAP_API_KEY")

# 小红书配置
XHS_COOKIES = os.getenv("XHS_COOKIES")

# 邮件配置
EMAIL_VERIFICATION_ENABLED = os.getenv("EMAIL_VERIFICATION_ENABLED", "false").lower() == "true"

# CORS 配置
CORS_ORIGINS = [
    "http://localhost:30000",
    "http://127.0.0.1:30000",
    "http://localhost:38181",
    "http://127.0.0.1:38181"
]

# 受信任主机
TRUSTED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# 日志配置
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# 应用信息
APP_NAME = "Ticketradar API"
APP_VERSION = "2.0.0"
APP_DESCRIPTION = "机票监控和AI旅行规划系统"

# 配置验证
def validate_config():
    """验证配置"""
    errors = []
    
    if USE_SUPABASE:
        if not SUPABASE_URL:
            errors.append("SUPABASE_URL is required when using Supabase")
        if not SUPABASE_ANON_KEY:
            errors.append("SUPABASE_ANON_KEY is required when using Supabase")
    
    if not GEMINI_API_KEY:
        errors.append("GEMINI_API_KEY is required for AI services")
    
    if errors:
        raise ValueError(f"Configuration errors: {', '.join(errors)}")

# 在导入时验证配置
try:
    validate_config()
except ValueError as e:
    print(f"⚠️  Configuration warning: {e}")

# 配置摘要
def get_config_summary():
    """获取配置摘要"""
    return {
        "app_name": APP_NAME,
        "app_version": APP_VERSION,
        "debug": DEBUG,
        "server": f"{SERVER_HOST}:{SERVER_PORT}",
        "database": "Supabase" if USE_SUPABASE else "SQLite",
        "ai_service": "Gemini" if GEMINI_API_KEY else "None",
        "cache": "Redis" if REDIS_URL else "Memory",
        "email_verification": EMAIL_VERIFICATION_ENABLED
    }

# 创建settings对象以便导入
class Settings:
    """配置设置类"""
    def __init__(self):
        # 基本配置
        self.DEBUG = DEBUG
        self.SECRET_KEY = SECRET_KEY
        self.APP_NAME = APP_NAME
        self.APP_VERSION = APP_VERSION

        # 服务器配置
        self.SERVER_HOST = SERVER_HOST
        self.SERVER_PORT = SERVER_PORT

        # 数据库配置
        self.DATABASE_URL = DATABASE_URL
        self.USE_SUPABASE = USE_SUPABASE
        self.SUPABASE_URL = SUPABASE_URL
        self.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY
        self.SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_ROLE_KEY
        self.SUPABASE_DATABASE_URL = SUPABASE_DATABASE_URL

        # AI配置
        self.GEMINI_API_KEY = GEMINI_API_KEY
        self.GEMINI_MODEL = GEMINI_MODEL

        # JWT配置
        self.JWT_SECRET_KEY = JWT_SECRET_KEY
        self.JWT_ALGORITHM = JWT_ALGORITHM
        self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = JWT_ACCESS_TOKEN_EXPIRE_MINUTES

        # CORS配置
        self.CORS_ORIGINS = CORS_ORIGINS

        # 其他配置
        self.EMAIL_VERIFICATION_ENABLED = EMAIL_VERIFICATION_ENABLED
        self.REDIS_URL = REDIS_URL

# 创建全局settings实例
settings = Settings()
