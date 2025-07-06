"""
FastAPI航班路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from loguru import logger
from typing import Optional

from fastapi_app.models.travel import APIResponse
from fastapi_app.models.auth import UserInfo
from fastapi_app.models.flights import (
    FlightSearchRequest, FlightSearchResponse, MonitorDataResponse,
    SeatClass, MaxStops, SortBy
)
from fastapi_app.dependencies.auth import get_current_active_user
from fastapi_app.services.ai_flight_service import AIFlightService
from fastapi_app.services.flight_service import get_flight_service

# 创建路由器
router = APIRouter()


@router.get("/health", response_model=APIResponse)
async def health_check():
    """
    健康检查接口
    """
    return APIResponse(
        success=True,
        message="航班服务正常",
        data={"status": "healthy", "service": "flights"}
    )


@router.get("/airports", response_model=APIResponse)
async def get_airports(
    query: str = Query("", description="搜索关键词"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """
    获取机场信息 (旧版API，保持兼容性)
    """
    return await search_airports_internal(query)


@router.get("/airports/search", response_model=APIResponse)
async def search_airports(
    q: str = Query("", description="搜索关键词"),
    language: str = Query("zh", description="语言设置")
):
    """
    机场搜索API (公开接口，无需认证)

    集成smart-flights的机场搜索API
    """
    try:
        logger.info(f"机场搜索: {q}, 语言: {language}")
        return await search_airports_internal(q, language)

    except Exception as e:
        logger.error(f"机场搜索失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="机场搜索服务异常"
        )


@router.get("/airports/search/auth", response_model=APIResponse)
async def search_airports_authenticated(
    q: str = Query("", description="搜索关键词"),
    language: str = Query("zh", description="语言设置"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """
    机场搜索API (需要认证的版本)

    集成smart-flights的机场搜索API
    """
    try:
        logger.info(f"用户 {current_user.username} 机场搜索: {q}, 语言: {language}")
        return await search_airports_internal(q, language)

    except Exception as e:
        logger.error(f"机场搜索失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="机场搜索服务异常"
        )


async def search_airports_internal(query: str, language: str = "zh"):
    """
    内部机场搜索函数
    """
    try:
        # 导入smart-flights的机场搜索API
        try:
            from fli.api.airport_search import airport_search_api
            from fli.models.google_flights.base import Language

            # 根据语言设置选择语言
            lang = Language.CHINESE if language.startswith('zh') else Language.ENGLISH

            # 使用smart-flights搜索机场
            if query:
                results = airport_search_api.search_airports(query, language=lang)
                airports = []

                for result in results:
                    # 处理字典或对象两种情况
                    if isinstance(result, dict):
                        code = result.get('code', '')
                        name = result.get('name', '')
                        city = result.get('city', result.get('name', ''))
                        country = result.get('country', '')

                        # 构建前端期望的格式
                        airport_data = {
                            "code": code,
                            "name": name,
                            "city": city,
                            "country": country,
                            "type": result.get('type', 'airport'),
                            "skyId": code,  # 添加skyId字段供航班搜索使用
                            "presentation": {
                                "suggestionTitle": f"{name} ({code}) - {city}, {country}"
                            }
                        }
                        airports.append(airport_data)
                    else:
                        code = getattr(result, 'code', '')
                        name = getattr(result, 'name', '')
                        city = getattr(result, 'city', '') or getattr(result, 'name', '')
                        country = getattr(result, 'country', '')

                        # 构建前端期望的格式
                        airport_data = {
                            "code": code,
                            "name": name,
                            "city": city,
                            "country": country,
                            "type": getattr(result, 'type', 'airport'),
                            "skyId": code,  # 添加skyId字段供航班搜索使用
                            "presentation": {
                                "suggestionTitle": f"{name} ({code}) - {city}, {country}"
                            }
                        }
                        airports.append(airport_data)

                logger.info(f"smart-flights返回 {len(airports)} 个机场")
            else:
                # 返回常用机场
                airports = [
                    {"code": "PEK", "name": "北京首都国际机场", "city": "北京", "country": "中国", "type": "airport"},
                    {"code": "PVG", "name": "上海浦东国际机场", "city": "上海", "country": "中国", "type": "airport"},
                    {"code": "CAN", "name": "广州白云国际机场", "city": "广州", "country": "中国", "type": "airport"},
                    {"code": "SZX", "name": "深圳宝安国际机场", "city": "深圳", "country": "中国", "type": "airport"},
                    {"code": "HGH", "name": "杭州萧山国际机场", "city": "杭州", "country": "中国", "type": "airport"},
                    {"code": "HKG", "name": "香港国际机场", "city": "香港", "country": "中国", "type": "airport"},
                    {"code": "TPE", "name": "台北桃园国际机场", "city": "台北", "country": "中国台湾", "type": "airport"},
                    {"code": "NRT", "name": "东京成田国际机场", "city": "东京", "country": "日本", "type": "airport"},
                    {"code": "ICN", "name": "首尔仁川国际机场", "city": "首尔", "country": "韩国", "type": "airport"},
                    {"code": "SIN", "name": "新加坡樟宜机场", "city": "新加坡", "country": "新加坡", "type": "airport"}
                ]

        except ImportError as e:
            logger.warning(f"smart-flights机场搜索API不可用: {e}")
            # 降级到静态数据
            static_airports = [
                {"code": "PEK", "name": "北京首都国际机场", "city": "北京", "country": "中国", "type": "airport"},
                {"code": "PVG", "name": "上海浦东国际机场", "city": "上海", "country": "中国", "type": "airport"},
                {"code": "CAN", "name": "广州白云国际机场", "city": "广州", "country": "中国", "type": "airport"},
                {"code": "SZX", "name": "深圳宝安国际机场", "city": "深圳", "country": "中国", "type": "airport"},
                {"code": "HGH", "name": "杭州萧山国际机场", "city": "杭州", "country": "中国", "type": "airport"}
            ]

            # 如果有查询参数，进行过滤
            if query:
                query_lower = query.lower()
                static_airports = [
                    airport for airport in static_airports
                    if query_lower in airport["name"].lower() or
                       query_lower in airport["city"].lower() or
                       query_lower in airport["code"].lower()
                ]

            # 转换为前端期望的格式
            airports = []
            for airport in static_airports:
                code = airport["code"]
                name = airport["name"]
                city = airport["city"]
                country = airport["country"]

                airport_data = {
                    "code": code,
                    "name": name,
                    "city": city,
                    "country": country,
                    "type": airport["type"],
                    "skyId": code,  # 添加skyId字段供航班搜索使用
                    "presentation": {
                        "suggestionTitle": f"{name} ({code}) - {city}, {country}"
                    }
                }
                airports.append(airport_data)

        return APIResponse(
            success=True,
            message="机场搜索成功",
            data={"airports": airports, "total": len(airports)}
        )

    except Exception as e:
        logger.error(f"机场搜索内部错误: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="机场搜索服务异常"
        )


@router.get("/airports/popular", response_model=APIResponse)
async def get_popular_airports(
    language: str = Query("zh", description="语言设置"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """
    获取热门机场列表
    """
    try:
        logger.info(f"用户 {current_user.username} 获取热门机场列表")

        popular_airports = [
            {"code": "PEK", "name": "北京首都国际机场", "city": "北京", "country": "中国", "popular": True},
            {"code": "PVG", "name": "上海浦东国际机场", "city": "上海", "country": "中国", "popular": True},
            {"code": "CAN", "name": "广州白云国际机场", "city": "广州", "country": "中国", "popular": True},
            {"code": "SZX", "name": "深圳宝安国际机场", "city": "深圳", "country": "中国", "popular": True},
            {"code": "HKG", "name": "香港国际机场", "city": "香港", "country": "中国", "popular": True},
            {"code": "NRT", "name": "东京成田国际机场", "city": "东京", "country": "日本", "popular": True},
            {"code": "ICN", "name": "首尔仁川国际机场", "city": "首尔", "country": "韩国", "popular": True},
            {"code": "SIN", "name": "新加坡樟宜机场", "city": "新加坡", "country": "新加坡", "popular": True},
            {"code": "BKK", "name": "曼谷素万那普国际机场", "city": "曼谷", "country": "泰国", "popular": True},
            {"code": "KUL", "name": "吉隆坡国际机场", "city": "吉隆坡", "country": "马来西亚", "popular": True}
        ]

        return APIResponse(
            success=True,
            message=f"获取到 {len(popular_airports)} 个热门机场",
            data={"airports": popular_airports, "total": len(popular_airports), "language": language}
        )

    except Exception as e:
        logger.error(f"获取热门机场失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取热门机场失败"
        )


@router.get("/search")
async def search_flights(
    departure_code: str = Query(..., description="出发机场代码", min_length=3, max_length=3),
    destination_code: str = Query(..., description="目的地机场代码", min_length=3, max_length=3),
    depart_date: str = Query(..., description="出发日期(YYYY-MM-DD)"),
    return_date: Optional[str] = Query(None, description="返程日期(YYYY-MM-DD)"),
    adults: int = Query(1, description="成人数量", ge=1, le=9),
    children: int = Query(0, description="儿童数量", ge=0, le=8),
    infants_in_seat: int = Query(0, description="婴儿占座数量", ge=0, le=8),
    infants_on_lap: int = Query(0, description="婴儿怀抱数量", ge=0, le=8),
    seat_class: SeatClass = Query(SeatClass.ECONOMY, description="座位等级"),
    max_stops: MaxStops = Query(MaxStops.ANY, description="最大中转次数"),
    sort_by: SortBy = Query(SortBy.CHEAPEST, description="排序方式"),
    language: str = Query("zh", description="语言设置 (zh/en)"),
    currency: str = Query("CNY", description="货币设置 (CNY/USD)"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """
    搜索航班

    集成smart-flights库进行真实的航班搜索
    """
    try:
        logger.info(f"用户 {current_user.username} 搜索航班: {departure_code} -> {destination_code}, {depart_date}, 语言: {language}, 货币: {currency}")

        # 验证必需参数
        if not all([departure_code, destination_code, depart_date]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='缺少必需参数：出发机场代码、目的地机场代码、出发日期'
            )

        # 验证机场代码格式
        if len(departure_code) != 3 or len(destination_code) != 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='机场代码必须是3位字母'
            )

        # 验证出发地和目的地不能相同
        if departure_code.upper() == destination_code.upper():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='出发地和目的地不能相同'
            )

        # 获取航班搜索服务
        flight_service = get_flight_service()

        # 执行异步搜索
        result = await flight_service.search_flights(
            departure_code=departure_code.upper(),
            destination_code=destination_code.upper(),
            depart_date=depart_date,
            return_date=return_date,
            adults=adults,
            seat_class=seat_class.value,
            children=children,
            infants_in_seat=infants_in_seat,
            infants_on_lap=infants_on_lap,
            max_stops=max_stops.value,
            sort_by=sort_by.value,
            language=language,
            currency=currency
        )

        logger.info(f"航班搜索完成: 成功={result['success']}, 结果数={result['total_count']}")
        return result

    except HTTPException:
        # 重新抛出HTTP异常
        raise
    except Exception as e:
        logger.error(f"搜索航班失败: {e}")
        return {
            'success': False,
            'error': str(e),
            'data': {'itineraries': []},
            'flights': [],
            'message': str(e),
            'search_info': {
                'source': 'smart-flights',
                'search_time': '',
                'total_count': 0,
                'departure_code': departure_code if 'departure_code' in locals() else 'N/A',
                'destination_code': destination_code if 'destination_code' in locals() else 'N/A',
                'depart_date': depart_date if 'depart_date' in locals() else 'N/A'
            },
            'search_time': '',
            'total_count': 0
        }


@router.get("/search/comprehensive")
async def search_flights_comprehensive(
    departure_code: str = Query(..., description="出发机场代码", min_length=3, max_length=3),
    destination_code: str = Query(..., description="目的地机场代码", min_length=3, max_length=3),
    depart_date: str = Query(..., description="出发日期(YYYY-MM-DD)"),
    return_date: Optional[str] = Query(None, description="返程日期(YYYY-MM-DD)"),
    adults: int = Query(1, description="成人数量", ge=1, le=9),
    children: int = Query(0, description="儿童数量", ge=0, le=8),
    infants_in_seat: int = Query(0, description="婴儿占座数量", ge=0, le=8),
    infants_on_lap: int = Query(0, description="婴儿怀抱数量", ge=0, le=8),
    seat_class: SeatClass = Query(SeatClass.ECONOMY, description="座位等级"),
    max_stops: MaxStops = Query(MaxStops.ANY, description="最大中转次数"),
    sort_by: SortBy = Query(SortBy.CHEAPEST, description="排序方式"),
    language: str = Query("zh", description="语言设置 (zh/en)"),
    currency: str = Query("CNY", description="货币设置 (CNY/USD)"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """
    三阶段综合航班搜索

    阶段1: Google Flights 常规搜索
    阶段2: Kiwi 隐藏城市搜索
    阶段3: AI 分析隐藏城市机会
    """
    try:
        logger.info(f"用户 {current_user.username} 开始三阶段航班搜索: {departure_code} -> {destination_code}, {depart_date}")

        # 验证必需参数
        if not all([departure_code, destination_code, depart_date]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='缺少必需参数：出发机场代码、目的地机场代码、出发日期'
            )

        # 验证机场代码格式
        if len(departure_code) != 3 or len(destination_code) != 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='机场代码必须是3位字母'
            )

        # 验证出发地和目的地不能相同
        if departure_code.upper() == destination_code.upper():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='出发地和目的地不能相同'
            )

        # 获取航班搜索服务
        flight_service = get_flight_service()

        # 执行三阶段综合搜索
        result = await flight_service.search_flights_comprehensive(
            departure_code=departure_code.upper(),
            destination_code=destination_code.upper(),
            depart_date=depart_date,
            return_date=return_date,
            adults=adults,
            seat_class=seat_class.value,
            children=children,
            infants_in_seat=infants_in_seat,
            infants_on_lap=infants_on_lap,
            max_stops=max_stops.value,
            sort_by=sort_by.value,
            language=language,
            currency=currency
        )

        logger.info(f"三阶段航班搜索完成: 成功={result['success']}, 总结果数={result['total_count']}")

        # 添加搜索阶段统计信息
        if 'search_stages' in result:
            stages_info = []
            for stage_key, stage_data in result['search_stages'].items():
                stages_info.append({
                    'stage': stage_key,
                    'name': stage_data['name'],
                    'status': stage_data['status'],
                    'flight_count': len(stage_data.get('flights', []))
                })
            logger.info(f"搜索阶段详情: {stages_info}")

        return result

    except HTTPException:
        # 重新抛出HTTP异常
        raise
    except Exception as e:
        logger.error(f"三阶段航班搜索失败: {e}")
        return {
            'success': False,
            'error': str(e),
            'flights': [],
            'search_stages': {},
            'message': str(e),
            'total_count': 0,
            'search_info': {
                'source': 'comprehensive_search',
                'search_time': '',
                'departure_code': departure_code if 'departure_code' in locals() else 'N/A',
                'destination_code': destination_code if 'destination_code' in locals() else 'N/A',
                'depart_date': depart_date if 'depart_date' in locals() else 'N/A',
                'stages_completed': 0
            }
        }


@router.get("/monitor/{city_code}")
async def get_monitor_data_legacy(
    city_code: str,
    blacklist_cities: Optional[str] = Query(None, description="黑名单城市，逗号分隔"),
    blacklist_countries: Optional[str] = Query(None, description="黑名单国家，逗号分隔"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """
    获取监控页面数据 (旧版API，保持兼容性，现在返回所有航班)
    """
    return await get_monitor_data_internal(city_code, blacklist_cities, blacklist_countries, current_user)


async def get_monitor_data_internal(
    city_code: str,
    blacklist_cities: Optional[str],
    blacklist_countries: Optional[str],
    current_user: UserInfo
):
    """
    获取监控页面数据

    支持的城市代码: HKG, SZX, CAN, MFM
    """
    try:
        logger.info(f"用户 {current_user.username} 获取监控数据: {city_code}")

        # 验证城市代码
        supported_cities = ['HKG', 'SZX', 'CAN', 'MFM']
        if city_code.upper() not in supported_cities:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f'不支持的城市代码: {city_code}，支持的城市: {", ".join(supported_cities)}'
            )

        # 处理黑名单参数
        blacklist_cities_list = []
        blacklist_countries_list = []

        if blacklist_cities:
            blacklist_cities_list = [city.strip() for city in blacklist_cities.split(',') if city.strip()]

        if blacklist_countries:
            blacklist_countries_list = [country.strip() for country in blacklist_countries.split(',') if country.strip()]

        # 获取航班搜索服务
        flight_service = get_flight_service()

        # 执行异步监控数据获取
        result = await flight_service.get_monitor_data_async(
            city_code=city_code.upper(),
            blacklist_cities=blacklist_cities_list,
            blacklist_countries=blacklist_countries_list
        )

        logger.info(f"监控数据获取完成: 成功={result['success']}, 航班数={len(result.get('flights', []))}")
        return result

    except HTTPException:
        # 重新抛出HTTP异常
        raise
    except Exception as e:
        logger.error(f"获取监控数据失败: {e}")
        return {
            'success': False,
            'error': str(e),
            'flights': [],
            'stats': {'total': 0, 'lowPrice': 0, 'minPrice': 0},
            'city_name': city_code,
            'city_flag': '🏙️'
        }


@router.get("/search/ai-enhanced")
async def search_flights_ai_enhanced(
    departure_code: str = Query(..., description="出发机场代码", min_length=3, max_length=3),
    destination_code: str = Query(..., description="目的地机场代码", min_length=3, max_length=3),
    depart_date: str = Query(..., description="出发日期(YYYY-MM-DD)"),
    return_date: Optional[str] = Query(None, description="返程日期(YYYY-MM-DD)"),
    adults: int = Query(1, description="成人数量", ge=1, le=9),
    children: int = Query(0, description="儿童数量", ge=0, le=8),
    infants_in_seat: int = Query(0, description="婴儿占座数量", ge=0, le=8),
    infants_on_lap: int = Query(0, description="婴儿怀抱数量", ge=0, le=8),
    seat_class: SeatClass = Query(SeatClass.ECONOMY, description="座位等级"),
    max_stops: MaxStops = Query(MaxStops.ANY, description="最大中转次数"),
    sort_by: SortBy = Query(SortBy.CHEAPEST, description="排序方式"),
    language: str = Query("zh", description="语言设置 (zh/en)"),
    currency: str = Query("CNY", description="货币设置 (CNY/USD)"),
    user_preferences: str = Query("", description="用户偏好和要求（如：我想要最便宜的航班、希望直飞、早上出发等）"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """
    AI增强的航班搜索

    执行三阶段搜索（Google Flights + Kiwi + AI分析），然后使用AI清洗和本地化数据

    特点：
    - 🤖 AI智能数据清洗和本地化
    - 🔍 三阶段全面搜索
    - 🌐 根据语言设置自动本地化机场名称
    - 📊 去重和数据统一
    """
    try:
        logger.info(f"🤖 用户 {current_user.username} 开始AI增强航班搜索: {departure_code} -> {destination_code}, {depart_date}")

        # 验证必需参数
        if not all([departure_code, destination_code, depart_date]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='缺少必需参数：出发机场代码、目的地机场代码、出发日期'
            )

        # 验证机场代码格式
        if len(departure_code) != 3 or len(destination_code) != 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='机场代码必须是3位字母'
            )

        # 验证出发地和目的地不能相同
        if departure_code.upper() == destination_code.upper():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='出发地和目的地不能相同'
            )

        # 获取AI增强航班搜索服务
        flight_service = AIFlightService()

        # 执行简化的AI增强搜索
        result = await flight_service.search_flights_ai_enhanced(
            departure_code=departure_code.upper(),
            destination_code=destination_code.upper(),
            depart_date=depart_date,
            return_date=return_date,
            adults=adults,
            seat_class=seat_class.value,
            children=children,
            infants_in_seat=infants_in_seat,
            infants_on_lap=infants_on_lap,
            max_stops=max_stops.value,
            sort_by=sort_by.value,
            language=language,
            currency=currency,
            user_preferences=user_preferences
        )

        logger.info(f"AI增强搜索完成: 成功={result['success']}, 总结果数={result.get('total_count', 0)}")

        # 添加AI处理信息到日志
        ai_processing = result.get('ai_processing', {})
        if ai_processing.get('success'):
            logger.info("✅ AI数据处理成功")
        else:
            logger.warning(f"⚠️ AI数据处理失败: {ai_processing.get('error', 'Unknown error')}")

        return result

    except HTTPException:
        # 重新抛出HTTP异常
        raise
    except Exception as e:
        logger.error(f"AI增强航班搜索失败: {e}")
        return {
            'success': False,
            'error': str(e),
            'flights': [],
            'search_stages': {},
            'ai_processing': {
                'success': False,
                'error': str(e)
            },
            'message': str(e),
            'total_count': 0,
            'search_info': {
                'source': 'ai_enhanced_comprehensive',
                'search_time': '',
                'departure_code': departure_code if 'departure_code' in locals() else 'N/A',
                'destination_code': destination_code if 'destination_code' in locals() else 'N/A',
                'depart_date': depart_date if 'depart_date' in locals() else 'N/A',
                'processing_method': 'failed'
            }
        }
