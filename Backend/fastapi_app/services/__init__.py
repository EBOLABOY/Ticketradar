"""
FastAPI服务层模块
"""

from .ai_service import FastAPIAIService, get_ai_service
from .user_service import FastAPIUserService, get_user_service
from .xhs_service import FastAPIXhsService, get_xhs_service
from .flight_service import MonitorFlightService, get_flight_service, get_monitor_flight_service
from .ai_flight_service import AIFlightService, get_ai_flight_service
from .monitor_service import FastAPIMonitorService, get_monitor_service
from .notification_service import FastAPINotificationService, get_notification_service
from .supabase_service import SupabaseService, get_supabase_service

__all__ = [
    'FastAPIAIService', 'get_ai_service',
    'FastAPIUserService', 'get_user_service',
    'FastAPIXhsService', 'get_xhs_service',
    'MonitorFlightService', 'get_flight_service', 'get_monitor_flight_service',
    'AIFlightService', 'get_ai_flight_service',
    'FastAPIMonitorService', 'get_monitor_service',
    'FastAPINotificationService', 'get_notification_service',
    'SupabaseService', 'get_supabase_service'
]
