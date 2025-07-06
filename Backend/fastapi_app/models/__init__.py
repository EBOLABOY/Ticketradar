"""
FastAPI数据模型
"""

from .auth import UserInfo, UserLogin, UserRegister, TokenResponse, PasswordResetRequest, PasswordResetConfirm
from .travel import TravelPlanRequest, TravelPlanResponse, XHSSearchResponse, APIResponse, UsageInfo
from .flights import (
    FlightSearchRequest, FlightSearchResponse, FlightResult, FlightLeg, FlightLegFormatted,
    FlightPrice, FlightCarrier, FlightAirport, PassengerInfo, MonitorFlightData,
    MonitorDataResponse, SeatClass, TripType, SortBy, MaxStops
)

__all__ = [
    'UserInfo', 'UserLogin', 'UserRegister', 'TokenResponse', 'PasswordResetRequest', 'PasswordResetConfirm',
    'TravelPlanRequest', 'TravelPlanResponse', 'XHSSearchResponse', 'APIResponse', 'UsageInfo',
    'FlightSearchRequest', 'FlightSearchResponse', 'FlightResult', 'FlightLeg', 'FlightLegFormatted',
    'FlightPrice', 'FlightCarrier', 'FlightAirport', 'PassengerInfo', 'MonitorFlightData',
    'MonitorDataResponse', 'SeatClass', 'TripType', 'SortBy', 'MaxStops'
]
