import requests
import json
import pandas as pd # 导入 pandas 库
import os
import time
import datetime
import pickle
import threading
import copy  # 用于深拷贝payload
from dotenv import load_dotenv
import schedule
from flask import Flask, render_template, jsonify, request, redirect, url_for, flash, session
from flask_login import LoginManager, login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from waitress import serve

# 1. 请求 URL
url = "https://hk.trip.com/restapi/soa2/19728/fuzzySearch"
# 新的航班列表搜索接口，用于指定目的地的查询
flight_list_url = "https://hk.trip.com/restapi/soa2/27015/FlightListSearchSSE"
base_url = "https://hk.trip.com" # 定义基础网址，用于拼接跳转链接

# 2. 请求头 (Request Headers) - 注意：Cookie 和其他动态值可能需要更新
headers = {
    'accept': '*/*',
    'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,en-GB;q=0.6',
    'content-type': 'application/json',
    # --- 警告：下面的 Cookie 非常长，且极有可能过期或失效 ---
    'cookie': 'Union=AllianceID=1079381&SID=2043339&OUID=ctag.hash.nwfme5hcv7n6&Expires=1749300305922&createtime=1746708305; _abtest_userid=5b8f2403-9ac5-450a-a6f0-41afa99dda5e; UBT_VID=1746708309569.1d384rgx2qT7; ubtc_trip_pwa=0; _gcl_au=1.1.381608091.1746708313; _fwb=99MHsWgE3ATJbQfCXhE6N7.1746708312920; _tt_enable_cookie=1; _ttp=01JTQYVDDFN89MG1TD7HPN2PAA_.tt.1; _RF1=154.19.184.12; _RSG=hvqFn0LYdBA6ebDB66lhGB; _RDG=28cda73c85c5fa244e24575cd692d19421; _RGUID=a2e78950-313f-4e6b-b42b-bc618b365a06; GUID=09034129218004024014; GUID.sig=Io10lN9GSo-8OOcwKdXKsFQc1EC8YHbiK1p5NUbUfcI; ibulanguage=HK; ibulocale=zh_hk; ibu_country=HK; _fwb=99MHsWgE3ATJbQfCXhE6N7.1746708312920; IBU_FLIGHT_LIST_STYLE=Separate; cookiePricesDisplayed=CNY; _gid=GA1.2.715444595.1746709098; _fbp=fb.1.1746709098820.431379395469181287; adid=174670909955958; ibu_h5_site=HK; ibu_h5_group=trip; ibu_h5_curr=CNY; bm_so=0AB1E950D1A51B97700924D7D46F44E11CE676D5C61F0BDBFCEA780CF12689B3~YAAQL/EPF3TfUa2WAQAArfX/rwOkqE5ay+iXzlOEB3wTrgYgxP06WTGRZAUmhxsp+3v0UoLAVzRPKciM0QJGYYnJQZSuRQNeDqnhp72d96qwqDQbet/b/IC0oTFvi4SAeZfyt4nfjmuWaptHAzfgZe+X7LSkQpCeQ58Z351sqKnMwADvQeFpUd3a7LXZQ87qXyinOV8Uec7jaqo/52paY8+hmM3xojbQUXUbPl8YSZXW+gHBlJvIeUiM/cWhDql4KtRLlFwbUZUrzAG7LhQZnkeyltOy5SUi30FHFesKWWysIzH+gtqLBQpJlhLcbMyRjxUFAGvXRZIXs5Lk6l7IxIjyOKRN1KILz1JS6OmdaoFta7owS8r11DKRjznQeAmUEiptYWEnu9ISx2y0/KurHQ9SaqBUjb6fCap4kMY+mKnhef+sNqx5PNz7EE5zH14JPmMoOGIflTaqOLWn; bm_lso=0AB1E950D1A51B97700924D7D46F44E11CE676D5C61F0BDBFCEA780CF12689B3~YAAQL/EPF3TfUa2WAQAArfX/rwOkqE5ay+iXzlOEB3wTrgYgxP06WTGRZAUmhxsp+3v0UoLAVzRPKciM0QJGYYnJQZSuRQNeDqnhp72d96qwqDQbet/b/IC0oTFvi4SAeZfyt4nfjmuWaptHAzfgZe+X7LSkQpCeQ58Z351sqKnMwADvQeFpUd3a7LXZQ87qXyinOV8Uec7jaqo/22paY8+hmM3xojbQUXUbPl8YSZXW+gHBlJvIeUiM/cWhDql4KtRLlFwbUZUrzAG7LhQZnkeyltOy5SUi30FHFesKWWysIzH+gtqLBQpJlhLcbMyRjxUFAGvXRZIXs5Lk6l7IxIjyOKRN1KILz1JS6OmdaoFta7owS8r11DKRjznQeAmUEiptYWEnu9ISx2y0/KurHQ9SaqBUjb6fCap4kMY+mKnhef+sNqx5PNz7EE5zH14JPmMoOGIflTaqOLWn^1746709527100; _uetsid=1d2794702c0c11f08f457fb9c035cd0f; _uetvid=1d27d5802c0c11f098d07dc253b45eb4; _ga_2DCSB93KS4=GS2.2.s1746709098$o1$g1$t1746709550$j25$l0$h0; ibu_h5_local=zh-hk; ibu_h5_local=zh-hk; ibu_h5_lang=hk; ibu_online_jump_site_result={"site_url":[],"suggestion":[]}; ibu_online_home_language_match={"isRedirect":false,"isShowSuggestion":false,"lastVisited":true,"region":"us","redirectSymbol":false}; trip_test_cookie=1; _ga=GA1.1.1926436688.1746708314; _ga_37RNVFDP1J=GS2.2.s1746709820$o1$g0$t1746709820$j60$l0$h0; _tp_search_latest_channel_name=flights; bm_s=YAAQRfEPF3AE83yWAQAAcDQFsAPXxJuBnvstTNslLwAmiTmDH6ho2aSnOMaCVBjaH31lfohN1vnehuQdHOjnD4zBSKekcVp01de9zz+vzwE0WqnFshSJmcoYk1nsAYfpsqfY+kwUyRRKEgD/qs5CkGgc/8gD0bXHkubC1CcaXXCPeuBLjI3yl73Yz+cu+aqUOq6E2iwiC8W3ssgSTN+6krSPIH/K2RHFbyzN96FLlZqHWwZRFvCGkUNICumAcvbOLujsPs8eVCmAgla2RqNomHQsqPqwpucIekCUJvBfadPPVbELRegrfK9qvcXBAov3dEveXFACElgGQms+ckmNZCHKPadJR8ppOWR7y5H6qug/Is8w9wTUnhcgz3ZhOl8HjU31Lp/vN01AEMvp8BmTQUL6+keXkU4Kep0zngNb+wksLxYmxwH4ohW+b69q/a4/uAwRbed5BH32a7OcNbHKsv3dP5tT6qERPW3RXn25iWqDQiUWpuPjpb5PuVMzvFCFW2BAwhKYpte1q7fGsUkQ/GNvGvC7uCmGV+/r7857k3BTxf8L9I7tfY/ZMDTvz3kQ/5G/QA7hymnEEMc=; _combined=transactionId%3D1-mf-20250508210512456-WEB%26pageId%3D10650034306%26initPageId%3D10320667453; __utma=1.1926436688.1746708314.1746710690.1746710690.1; __utmc=1; __utmz=1.1746710690.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); nfes_isSupportWebP=1; _pd=%7B%22_o%22%3A2%2C%22s%22%3A11%2C%22_s%22%3A1%7D; logoutFlag=true; _bfa=1.1746708309569.1d384rgx2qT7.1.1746710717100.1746710726288.1.40.10650034306; wcs_bt=s_33fb334966e9:1746710726; _ga_X437DZ73MR=GS2.1.s1746708313$o1$g1$t1746710727$j47$l0$h0; ttcsid=1746708313524::PJ7hunQvAgqJ0G7tqTWu.1.1746710727593; cto_bundle=iBPVk19MNXgybkJCQVB3QSUyQmt1dVBKOXRmbzVSSiUyRmZkMFczZ3RsNGMxV1hGV0RLbVNKJTJCRUIlMkIwNlJmRHpUcVc5d1ZNWmFPYmFZVzZ3JTJGbFFCQ21FNExKYkt6MERiZ1JzMExmeXlsUVdCa25RTmZqZDhBTG5hMW51TWxpY3RVaVhNN0xNZmV1bTEzQkJIcVNrbDlUJTJCMyUyQllHUFJFUSUzRCUzRA; ttcsid_CIR4RVBC77UD5V58BBNG=1746708313524::o2kONJ7ykUh6OzyxO2OO.1.1746710727907',
    'origin': 'https://hk.trip.com',
    'referer': 'https://hk.trip.com/flights/showfarefirst?dcity=bjs&acity=sel&ddate=2025-06-30&rdate=2025-07-03&triptype=ow&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY',
    'sec-ch-ua': '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',
    'x-ctx-country': 'HK',
    'x-ctx-currency': 'CNY',
    'x-ctx-locale': 'zh-HK',
    'x-ctx-ubt-pvid': '12',
    'x-ctx-ubt-sid': '24',
    'x-ctx-ubt-vid': '1746708309569.1d384rgx2qT7',
    'cookieorigin': 'https://hk.trip.com',
    'currency': 'CNY',
    'locale': 'zh-HK',
    'priority': 'u=1, i'
}

# 3. 请求载荷 (Request Payload) - 注意：其中一些值可能需要动态更新
payload = {
  "tt": 2,
  "st": 15,
  "source": "mapList",
  "asyncToken": "",
  "ptoken": "",
  "route": 1,
  "segments": [
    {
      "dcl": [],
      "acl": [],
      "dow": [],
      "dcs": [ { "ct": 1, "code": "HKG" } ],
      "acs": [ { "ct": 6, "code": "bd_49_29" } ], # bd_49_29 可能代表特定区域或预算范围
      "drl": [ { "begin": "2025-09-30", "end": "2025-09-30" } ],
      "rdrl": [ { "begin": "2025-10-08", "end": "2025-10-08" } ]
    }
  ],
  "filters": [ { "type": 18, "code": "1,0,0" } ],
  "tripDays": [],
  "leaveDay": 0,
  "vaccine": False,
  # --- 警告： transactionId 极有可能需要动态生成或更新 ---
  "transactionId": "1-mf-20250508210512456-WEB",
  "limitCount": 0,
  "batchBeginNum": 0,
  "batchEndNum": 0,
  "specialType": 0,
  "head": {
    # --- 警告： cid, transactionId, vid, pvid, PageId, clientTime 等都可能需要动态更新 ---
    "cid": "09034129218004024014",
    "ctok": "", "cver": "3", "lang": "01", "sid": "8888", "syscode": "40", "auth": "", "xsid": "",
    "extension": [
      { "name": "abTesting", "value": "" }, { "name": "source", "value": "ONLINE" },
      { "name": "sotpGroup", "value": "Trip" }, { "name": "sotpLocale", "value": "zh-HK" },
      { "name": "sotpCurrency", "value": "CNY" }, { "name": "allianceID", "value": "0" },
      { "name": "sid", "value": "0" }, { "name": "ouid", "value": "ctag.hash.nwfme5hcv7n6" },
      { "name": "uuid" }, { "name": "useDistributionType", "value": "1" },
      { "name": "flt_app_session_transactionId", "value": "1-mf-20250508210512456-WEB" },
      { "name": "vid", "value": "1746708309569.1d384rgx2qT7" }, { "name": "pvid", "value": "40" },
      { "name": "Flt_SessionId", "value": "1" }, { "name": "channel" },
      { "name": "x-ua", "value": "v=3_os=ONLINE_osv=10" }, { "name": "PageId", "value": "10650034306" },
      # --- 警告：clientTime 强烈建议动态生成 ---
      { "name": "clientTime", "value": "2025-05-08T22:02:51+08:00" },
      { "name": "Locale", "value": "zh_hk" }, { "name": "Currency", "value": "CNY" },
      { "name": "Language", "value": "hk" }, { "name": "fromVersion", "value": "2" },
      { "name": "frontVersion", "value": "2" }, { "name": "SourceApp", "value": "Trip" }
    ],
    "Locale": "zh-HK", "Language": "hk", "Currency": "CNY", "ClientID": "", "appid": "700020"
  }
}

# ---- 数据清洗函数 ----
def clean_flight_data(json_data, base_url):
    """
    清洗从 Trip.com API 获取的航班 JSON 数据。

    Args:
        json_data (dict): 从 API 响应解析出的 Python 字典。
        base_url (str): 用于构建完整链接的基础 URL。

    Returns:
        list: 包含清洗后航班信息的字典列表，如果出错则返回空列表。
    """
    cleaned_flights = []
    if 'routes' not in json_data or not isinstance(json_data['routes'], list):
        print("清洗错误: JSON 数据中未找到 'routes' 键或其不是一个列表。")
        return cleaned_flights

    for route in json_data['routes']:
        try:
            # 安全地提取抵达城市信息
            arrive_city_info = route.get('arriveCity', {})
            arrival_city_name = arrive_city_info.get('name', '未知')
            arrival_city_code = arrive_city_info.get('code', 'N/A')
            arrival_country = arrive_city_info.get('countryName', '未知')
            image_url = arrive_city_info.get('imageUrl', None)

            # 安全地提取价格列表信息 (取第一个)
            price_info_list = route.get('pl', [])
            price_info = price_info_list[0] if price_info_list else {}

            price = price_info.get('price', None)
            currency = price_info.get('currency', 'N/A')
            depart_date = price_info.get('departDate', 'N/A')
            return_date = price_info.get('returnDate', 'N/A')
            jump_url_path = price_info.get('jumpUrl', '')
            # 构建完整 URL
            full_jump_url = base_url + jump_url_path if jump_url_path.startswith('/') else jump_url_path

            # 提取热度评分
            hot_score = route.get('hot', None)

            # 提取并格式化标签
            tags_list = route.get('tags', [])
            tags_str = ", ".join([tag.get('name', '') for tag in tags_list if tag.get('name')])

            # 获取路线是否为国际航线的标记
            is_international = route.get('isIntl', False)

            # 添加到结果列表
            cleaned_flights.append({
                '目的地': arrival_city_name,
                '代码': arrival_city_code,
                '国家': arrival_country,
                '价格': price,
                '货币': currency,
                '出发日期': depart_date,
                '返程日期': return_date,
                '热度': hot_score,
                '标签': tags_str,
                '图片链接': image_url,
                '预订链接': full_jump_url,
                'is_international': is_international,  # 添加国际航线标记
                # 为原始API数据添加缺失的字段，以兼容模板
                '中转次数': 0,  # 原始API不提供中转信息，默认为直飞
                '飞行时长': '查看详情',  # 原始API不提供飞行时长
                '航空公司': '查看详情',  # 原始API不提供航空公司信息
                '航班号': '查看详情',  # 原始API不提供航班号
                '出发时间': '查看详情',  # 原始API不提供具体时间
                '到达时间': '查看详情',  # 原始API不提供具体时间
                '链接': full_jump_url
            })
        except Exception as e:
            print(f"处理路线时发生错误: {route.get('arriveCity', {}).get('name', '未知路线')} - {e}")
            continue # 继续处理下一条路线

    return cleaned_flights

# ---- 生成漂亮的HTML通知模板 ----
def generate_beautiful_html_template(title, content_data):
    """
    生成漂亮的HTML通知模板

    Args:
        title (str): 通知标题
        content_data (dict): 通知内容数据，包含以下字段：
            - message: 主要消息
            - departure_city: 始发地城市
            - trip_type: 行程类型
            - depart_date: 出发日期
            - return_date: 返程日期（可选）
            - flights: 航班数据列表，每个元素是一个字典，包含目的地、国家、价格、货币、出发日期、返程日期、预订链接等字段

    Returns:
        str: 格式化的HTML内容
    """
    # 获取当前日期和时间
    current_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 网站域名和链接
    website_domain = "ticketradar.izlx.me"
    website_url = f"http://{website_domain}"

    # 根据始发地构建特定链接
    departure_code = content_data.get('departure_code', 'HKG')
    website_specific_url = f"{website_url}/{departure_code}"

    # 构建HTML头部
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background-color: #0d6efd;
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                margin: -20px -20px 20px;
                text-align: center;
                position: relative;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }}
            .header p {{
                margin: 10px 0 0;
                opacity: 0.9;
                font-size: 14px;
            }}
            .website-badge {{
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                text-decoration: none;
                transition: all 0.3s ease;
            }}
            .website-badge:hover {{
                background-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }}
            .message {{
                background-color: #f1f8ff;
                border-left: 4px solid #0d6efd;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 4px;
            }}
            .trip-info {{
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 20px;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
            }}
            .trip-info-item {{
                flex: 1;
                min-width: 150px;
                margin: 5px;
            }}
            .trip-info-label {{
                font-size: 12px;
                color: #6c757d;
                margin-bottom: 5px;
            }}
            .trip-info-value {{
                font-size: 16px;
                font-weight: 500;
                color: #212529;
            }}
            .flights-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }}
            .flights-table th {{
                background-color: #f1f3f5;
                color: #495057;
                font-weight: 600;
                text-align: left;
                padding: 12px;
                border-bottom: 2px solid #dee2e6;
            }}
            .flights-table td {{
                padding: 12px;
                border-bottom: 1px solid #e9ecef;
                vertical-align: middle;
            }}
            .flights-table tr:hover {{
                background-color: #f8f9fa;
            }}
            .price {{
                font-weight: 700;
                color: #dc3545;
            }}
            .btn {{
                display: inline-block;
                background-color: #0d6efd;
                color: white;
                padding: 8px 16px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 500;
                transition: background-color 0.2s;
            }}
            .btn:hover {{
                background-color: #0b5ed7;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 12px;
            }}
            .badge {{
                display: inline-block;
                padding: 4px 8px;
                font-size: 12px;
                font-weight: 500;
                border-radius: 20px;
                background-color: #e9ecef;
                color: #495057;
            }}
            .badge-country {{
                background-color: #e7f5ff;
                color: #1971c2;
            }}
            @media (max-width: 576px) {{
                .trip-info {{
                    flex-direction: column;
                }}
                .trip-info-item {{
                    margin-bottom: 10px;
                }}
                .flights-table {{
                    font-size: 14px;
                }}
                .flights-table th, .flights-table td {{
                    padding: 8px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{title}</h1>
                <p>发送时间: {current_datetime}</p>
                <a href="{website_specific_url}" class="website-badge" target="_blank">
                    {website_domain} <span style="margin-left:3px;">↗</span>
                </a>
            </div>

            <div class="message">
                <p>{content_data.get('message', '')}</p>
                <p style="margin-top:10px; text-align:center;">
                    <a href="{website_specific_url}" target="_blank" style="display:inline-block; background-color:#0d6efd; color:white; padding:8px 16px; text-decoration:none; border-radius:4px; font-weight:500; transition:all 0.3s ease;">
                        查看更多机票信息 <span style="margin-left:3px;">→</span>
                    </a>
                </p>
            </div>

            <div class="trip-info">
                <div class="trip-info-item">
                    <div class="trip-info-label">始发地</div>
                    <div class="trip-info-value">{content_data.get('departure_city', '')}</div>
                </div>
                <div class="trip-info-item">
                    <div class="trip-info-label">行程类型</div>
                    <div class="trip-info-value">{content_data.get('trip_type', '')}</div>
                </div>
                <div class="trip-info-item">
                    <div class="trip-info-label">出发日期</div>
                    <div class="trip-info-value">{content_data.get('depart_date', '')}</div>
                </div>
    """

    # 如果是往返行程，添加返程日期
    if content_data.get('return_date'):
        html += f"""
                <div class="trip-info-item">
                    <div class="trip-info-label">返程日期</div>
                    <div class="trip-info-value">{content_data.get('return_date', '')}</div>
                </div>
        """

    html += """
            </div>

            <table class="flights-table">
                <thead>
                    <tr>
                        <th>目的地</th>
                        <th>国家</th>
                        <th>价格</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
    """

    # 添加航班数据
    flights = content_data.get('flights', [])
    for flight in flights:
        html += f"""
                    <tr>
                        <td><strong>{flight.get('目的地', '')}</strong></td>
                        <td><span class="badge badge-country">{flight.get('国家', '')}</span></td>
                        <td><span class="price">{flight.get('价格', '')} {flight.get('货币', '')}</span></td>
                        <td><a href="{flight.get('预订链接', '')}" class="btn" target="_blank">预订</a></td>
                    </tr>
        """

    # 添加HTML尾部
    html += """
                </tbody>
            </table>
    """

    # 使用f-string添加页脚，以便正确插入变量
    html += f"""
            <div class="footer">
                <p>此消息由 Ticketradar 系统自动发送，请勿回复。</p>
                <p>© 2024 <a href="{website_url}" style="color:#0d6efd; text-decoration:none;" target="_blank">Ticketradar</a> - 实时监控低价机票，助您找到最佳出行选择</p>
                <p style="margin-top:10px;">
                    <a href="{website_url}" style="color:#6c757d; text-decoration:none; font-size:11px;" target="_blank">{website_domain}</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    return html

# ---- 独立的用户监控系统 ----
def check_all_user_monitoring_tasks():
    """独立的用户监控系统 - 不依赖主循环数据，不受全局ENABLE_PUSHPLUS影响"""
    try:
        # 使用直接的SQLite连接，避免Flask应用上下文问题
        import sqlite3
        import os

        # 强制使用Flask应用的instance目录数据库，确保数据一致性
        database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketradar.db')
        if database_url.startswith('sqlite:///'):
            db_filename = database_url.replace('sqlite:///', '')
            # 始终使用instance目录中的数据库，与Flask应用保持一致
            db_path = os.path.join('instance', db_filename)
            print(f"🔍 用户监控系统使用数据库: {db_path}")
        else:
            db_path = database_url

        if not os.path.exists(db_path):
            print(f"数据库文件不存在: {db_path}，跳过用户监控任务检查")
            return

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 查询所有活跃的监控任务（包含黑名单字段）
        # 用户监控任务不受全局ENABLE_PUSHPLUS设置影响，只要任务有PushPlus令牌就执行
        cursor.execute('''
            SELECT id, user_id, name, departure_city, destination_city,
                   depart_date, return_date, price_threshold, pushplus_token,
                   last_notification, total_checks, total_notifications,
                   blacklist_cities, blacklist_countries
            FROM monitor_tasks
            WHERE is_active = 1 AND pushplus_token IS NOT NULL AND pushplus_token != ''
        ''')

        tasks = cursor.fetchall()
        print(f"🔍 用户监控系统执行: 数据库查询到 {len(tasks)} 个任务")

        if tasks:
            print(f"🔍 用户监控: 开始处理 {len(tasks)} 个任务")
        else:
            print("⚠️ 用户监控: 没有找到活跃的监控任务")

        for task in tasks:
            try:
                task_id, user_id, _, departure_city, destination_city, depart_date, return_date, price_threshold, pushplus_token, last_notification, total_checks, total_notifications, blacklist_cities, blacklist_countries = task

                # 获取城市显示名称
                departure_display = get_city_display_name(departure_city)
                destination_display = destination_city or '所有目的地'

                # 检查是否需要发送通知（避免重复通知）
                current_time = datetime.datetime.now()
                if last_notification:
                    last_notif_time = datetime.datetime.fromisoformat(last_notification)
                    if (current_time - last_notif_time).total_seconds() < 86400:
                        continue

                # 为每个用户任务获取专属的航班数据
                flight_result = get_flights_for_user_task(
                    departure_city, destination_city, depart_date, return_date,
                    blacklist_cities=blacklist_cities,
                    blacklist_countries=blacklist_countries
                )

                # 提取所有境外航班用于价格阈值检查
                all_task_flights = flight_result['all_flights']

                if not all_task_flights:
                    continue

                # 过滤低于用户设定阈值的机票
                low_price_flights = [f for f in all_task_flights if f.get('价格', 0) <= price_threshold]

                if low_price_flights:
                    print(f"🎯 任务 {departure_display}({departure_city}) → {destination_display}({destination_city or 'ALL'}) 发现 {len(low_price_flights)} 个低价机票")

                    # 准备通知内容
                    content_data = {
                        'message': f"您的监控任务发现 {len(low_price_flights)} 个价格低于 {price_threshold} 元的机票。",
                        'departure_city': get_city_display_name(departure_city),
                        'departure_code': departure_city,
                        'trip_type': '往返' if return_date else '单程',
                        'depart_date': depart_date,
                        'flights': low_price_flights[:10]  # 最多显示10个
                    }

                    # 如果是往返行程，添加返程日期
                    if return_date:
                        content_data['return_date'] = return_date

                    # 构建标题
                    title = f"[Ticketradar] {departure_display}→{destination_display} - 发现 {len(low_price_flights)} 个低价机票"

                    # 生成HTML通知内容
                    notification_content = generate_beautiful_html_template(title, content_data)

                    # 发送个人推送（使用任务自己的PushPlus令牌，不受全局ENABLE_PUSHPLUS影响）
                    success = send_pushplus_notification(
                        pushplus_token,  # 使用任务自己的令牌
                        title,
                        notification_content,
                        topic=None  # 个人推送，不使用群组
                    )

                    if success:
                        # 更新任务的最后通知时间和统计信息
                        cursor.execute('''
                            UPDATE monitor_tasks
                            SET last_notification = ?, last_check = ?,
                                total_checks = ?, total_notifications = ?
                            WHERE id = ?
                        ''', (
                            current_time.isoformat(),
                            current_time.isoformat(),
                            (total_checks or 0) + 1,
                            (total_notifications or 0) + 1,
                            task_id
                        ))
                        conn.commit()

                        print(f"✅ {departure_city}→{destination_display}: 发现{len(low_price_flights)}个低价机票，已推送")
                    else:
                        print(f"❌ {departure_city}→{destination_display}: 推送失败")
                else:
                    pass  # 不输出未发现低价机票的日志
                    # 即使没有低价机票，也要更新检查时间
                    cursor.execute('''
                        UPDATE monitor_tasks
                        SET last_check = ?, total_checks = ?
                        WHERE id = ?
                    ''', (
                        datetime.datetime.now().isoformat(),
                        (total_checks or 0) + 1,
                        task_id
                    ))
                    conn.commit()

            except Exception as e:
                print(f"❌ 处理用户监控任务时出错: {e}")
                continue

        conn.close()

    except Exception as e:
        print(f"用户监控系统出错: {e}")

def fetch_flights_with_session(departure_city, destination_city, depart_date, payload):
    """简化版本：直接访问页面获取信息，用什么就是什么"""
    try:
        print(f"🔍 简化获取: {departure_city} → {destination_city}")

        # 创建普通Session
        session = requests.Session()

        # 构建搜索页面URL
        search_url = f"https://hk.trip.com/flights/showfarefirst?dcity={departure_city.lower()}&acity={destination_city.lower()}&ddate={depart_date}&triptype=ow&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY"

        # 简化策略：访问页面获取基本Cookie
        print(f"🔍 访问搜索页面获取Cookie...")
        try:
            page_response = session.get(search_url, timeout=30)
            print(f"✅ 页面访问成功，状态码: {page_response.status_code}")
            print(f"📊 获得Cookie数量: {len(session.cookies)}")
        except Exception as e:
            print(f"⚠️ 页面访问失败: {e}")
            # 即使失败也继续，使用空Cookie

        # 构建简单的headers
        headers = {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json; charset=utf-8',
            'Currency': 'CNY',
            'Locale': 'zh-HK',
            'Origin': 'https://hk.trip.com',
            'Referer': search_url,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'X-Ctx-Country': 'HK',
            'X-Ctx-Currency': 'CNY',
            'X-Ctx-Locale': 'zh-HK',
            # 添加已知有效的认证信息
            'Token': '1001-common-7OGr9GJ8sIfqW4tRB3eL8WMHK7LwpgjOnWdfjbaEgajzoJBSYQPWMlYhXw7ajDUWb0jsaYAUy3TyOHYDlR5dw8sKOhJkovZDiXpE6AvN0yzhYmNJL6vhYQZx83YSzI54RNTyfqEXojN7j9AEHsYcniUSi31Y9Tj3UihTYMtycE7ArBYLDrD1Rp8E1Pwa7ypPEHYBMRtPxMmi07Rqcy7lESqwpmy0SWt5jktiHpWMfvs0JDZw4lvXbIdqRDZyoqidmj5QEZtw0Uxfbe7FYNTJHLwh6yOOKMdwOFizYcFrShwFQw57jMqyO9vzsyf5w9MyqnwktvzneotE9BEs8WmzwM3e0ZEPbv3Uj0by8oep6Jo0vHBvP5wBkenNyMpyBNROAjDOwQaJFgwDXiDZvTsjXQEHBJ13WnPwqBrZY59yk9x4Fvp3EcQEXdYQ3wLTwNnJhPY6mwtOw60EokR6Yt9wfsRT7Y3DYdDEfFxAURBaw7YkAyfBvO9vsgvG7eZBYP5iQTY0XJ4BvB5ypYOpvobvOpegkeXaEFBjnpWM7Eb1YkkKlYDlypnEaPy4ArgsKBAedhELAWFcxl0EDhELYtNrPBeZjfURmBYTQjU3W7ceQbjLsWf9WNoRbgR6HxDYUPWbAK0DWqZRZ0YHkj4ZWD8eNtyDpJ0FYBQrNygh',
            'X-Ctx-Ubt-Pvid': '13',
            'X-Ctx-Ubt-Sid': '25',
            'X-Ctx-Ubt-Vid': '1746708309569.1d384rgx2qT7'
        }

        print(f"✅ 简化headers构建完成")

        # 智能重试机制调用API
        api_url = "https://hk.trip.com/restapi/soa2/27015/FlightListSearchSSE"
        max_retries = 3
        final_response = None

        for attempt in range(max_retries):
            print(f"🔄 第{attempt+1}次API请求...")

            try:
                response = session.post(api_url, headers=headers, json=payload, stream=True, timeout=30)
                print(f"✅ API响应状态码: {response.status_code}")

                if response.status_code == 200:
                    # 快速检查响应质量
                    response_preview = ""
                    line_count = 0

                    # 读取前几行来判断数据质量
                    for line_bytes in response.iter_lines():
                        if line_count > 10:
                            break
                        if line_bytes:
                            line = line_bytes.decode('utf-8', errors='replace').strip()
                            response_preview += line + "\n"
                            line_count += 1

                    # 检查数据质量
                    has_flights = '"itineraryList"' in response_preview
                    has_good_data = ('"recordCount":' in response_preview and
                                   not '"recordCount":0' in response_preview and
                                   not '"recordCount": 0' in response_preview)

                    print(f"🔍 数据质量检查:")
                    print(f"    - 包含航班数据: {has_flights}")
                    print(f"    - 数据质量良好: {has_good_data}")

                    if has_flights and has_good_data:
                        print(f"✅ 第{attempt+1}次请求获得优质数据")
                        # 重新请求获取完整响应
                        final_response = session.post(api_url, headers=headers, json=payload, stream=True, timeout=30)
                        break
                    elif has_flights:
                        print(f"⚠️ 第{attempt+1}次请求数据有限，可能遇到验证")
                        if attempt < max_retries - 1:
                            print(f"🔄 等待{2 + attempt}秒后重试...")
                            time.sleep(2 + attempt)
                            continue
                        else:
                            # 最后一次，即使数据有限也使用
                            final_response = session.post(api_url, headers=headers, json=payload, stream=True, timeout=30)
                    else:
                        print(f"❌ 第{attempt+1}次请求无有效数据")
                        if attempt < max_retries - 1:
                            print(f"🔄 等待{2 + attempt}秒后重试...")
                            time.sleep(2 + attempt)
                            continue
                        else:
                            final_response = response
                else:
                    print(f"❌ API请求失败，状态码: {response.status_code}")
                    if attempt < max_retries - 1:
                        print(f"🔄 等待{2 + attempt}秒后重试...")
                        time.sleep(2 + attempt)
                        continue
                    else:
                        final_response = response

            except Exception as e:
                print(f"❌ 第{attempt+1}次请求异常: {e}")
                if attempt < max_retries - 1:
                    print(f"🔄 等待{2 + attempt}秒后重试...")
                    time.sleep(2 + attempt)
                    continue
                else:
                    raise e

        print(f"🎯 简化获取完成，返回最终响应")
        return final_response

    except Exception as e:
        print(f"🔍 简化获取失败: {e}")
        raise e

def get_flights_for_user_task(departure_city, destination_city, depart_date, return_date, blacklist_cities=None, blacklist_countries=None):
    """为用户任务获取专属的航班数据，支持黑名单过滤"""
    try:
        trip_type = "往返" if return_date else "单程"
        destination_display = destination_city or '所有目的地'
        print(f"🔍 用户任务: {departure_city} → {destination_display} ({trip_type})")

        # 创建特定的payload - 支持指定目的地和所有目的地
        task_payload = create_payload_for_user_task(
            departure_code=departure_city,
            destination_code=destination_city,  # 传递实际的目的地参数
            depart_date=depart_date,
            return_date=return_date
        )
        # 发送API请求
        response = requests.post(url, headers=headers, json=task_payload, timeout=30)
        response.raise_for_status()

        # 解析API响应
        response_data = response.json()
        routes_count = len(response_data.get('routes', []))
        print(f"🔍 API返回: {routes_count} 个航线")

        # 清洗数据 - 使用更健壮的方法
        cleaned_data = []

        if response_data.get('routes'):
            for idx, route in enumerate(response_data['routes']):
                try:
                    arrive_city_info = route.get('arriveCity', {})
                    price_info_list = route.get('pl', [])

                    if arrive_city_info and price_info_list:
                        price_info = price_info_list[0]

                        # 手动构建航班数据
                        flight_data = {
                            '目的地': arrive_city_info.get('name', '未知'),
                            '代码': arrive_city_info.get('code', 'N/A'),
                            '国家': arrive_city_info.get('countryName', '未知'),
                            '价格': price_info.get('price', 0),
                            '货币': price_info.get('currency', 'CNY'),
                            '出发日期': price_info.get('departDate', 'N/A'),
                            '返程日期': price_info.get('returnDate', 'N/A'),
                            '热度': route.get('hot', 0),
                            '标签': ', '.join([tag.get('name', '') for tag in route.get('tags', []) if tag.get('name')]),
                            '图片链接': arrive_city_info.get('imageUrl', None),
                            '预订链接': base_url + price_info.get('jumpUrl', '') if price_info.get('jumpUrl', '').startswith('/') else price_info.get('jumpUrl', ''),
                            'is_international': route.get('isIntl', False),
                            # 为原始API数据添加缺失的字段，以兼容模板
                            '中转次数': 0,  # 原始API不提供中转信息，默认为直飞
                            '飞行时长': '查看详情',  # 原始API不提供飞行时长
                            '航空公司': '查看详情',  # 原始API不提供航空公司信息
                            '航班号': '查看详情',  # 原始API不提供航班号
                            '出发时间': '查看详情',  # 原始API不提供具体时间
                            '到达时间': '查看详情',  # 原始API不提供具体时间
                            '链接': base_url + price_info.get('jumpUrl', '') if price_info.get('jumpUrl', '').startswith('/') else price_info.get('jumpUrl', '')
                        }

                        cleaned_data.append(flight_data)

                except Exception as e:
                    continue

        # 如果手动清洗失败，回退到原始函数
        if not cleaned_data and response_data.get('routes'):
            try:
                cleaned_data = clean_flight_data(response_data, base_url)
            except Exception as e:
                cleaned_data = []

        # 筛选境外目的地 - 使用与主页相同的逻辑
        if cleaned_data:
            df = pd.DataFrame(cleaned_data)

            # 第1步：先排除中国航线，只保留境外航线
            international_df = df[df['国家'] != '中國']

            # 第2步：应用黑名单过滤
            filtered_df = international_df.copy()

            # 解析黑名单城市
            if blacklist_cities:
                blacklist_city_list = [city.strip().upper() for city in blacklist_cities.split(',') if city.strip()]
                if blacklist_city_list:
                    # 过滤掉黑名单中的城市（不区分大小写）
                    filtered_df = filtered_df[~filtered_df['代码'].str.upper().isin(blacklist_city_list)]
                    print(f"🚫 黑名单城市过滤: {blacklist_city_list}, 剩余 {len(filtered_df)} 个航班")

            # 解析黑名单国家
            if blacklist_countries:
                blacklist_country_list = [country.strip() for country in blacklist_countries.split(',') if country.strip()]
                if blacklist_country_list:
                    # 过滤掉黑名单中的国家
                    filtered_df = filtered_df[~filtered_df['国家'].isin(blacklist_country_list)]
                    print(f"🚫 黑名单国家过滤: {blacklist_country_list}, 剩余 {len(filtered_df)} 个航班")

            # 第3步：计算统计信息（基于过滤后的境外航线）
            total_flights = len(filtered_df)
            min_price = filtered_df['价格'].min() if not filtered_df.empty else 0

            # 第4步：按价格排序，选择最低价格的前9个用于显示
            sorted_df = filtered_df.sort_values('价格')
            display_flights = sorted_df.head(9).to_dict('records')
            all_flights = sorted_df.to_dict('records')

            print(f"🔍 境外航线统计: 总数{total_flights}个，显示前{len(display_flights)}个最低价")

            return {
                'flights': display_flights,
                'all_flights': all_flights,
                'stats': {
                    'total_flights': total_flights,
                    'min_price': min_price
                }
            }
        else:
            print(f"🔍 未获取到有效数据")
            return {
                'flights': [],
                'all_flights': [],
                'stats': {
                    'total_flights': 0,
                    'min_price': 0
                }
            }

    except Exception as e:
        print(f"获取用户任务航班数据失败: {e}")
        return {
            'flights': [],
            'all_flights': [],
            'stats': {
                'total_flights': 0,
                'min_price': 0
            }
        }

# ---- 保留原函数用于向后兼容 ----
def check_user_monitoring_tasks(departure_code=None, flights_data=None):
    """保留原函数用于向后兼容，但不再使用"""
    # 这个函数现在什么都不做，因为我们使用独立的用户监控系统
    # 避免未使用参数警告
    _ = departure_code, flights_data
    pass

# ---- PushPlus推送函数 ----
def send_pushplus_notification(token, title, content, template="html", topic=None):
    """
    使用PushPlus发送通知，支持群组推送

    Args:
        token (str): PushPlus令牌
        title (str): 通知标题
        content (str): 通知内容
        template (str): 内容模板类型，默认为html
        topic (str): 群组编码，不传则为个人推送

    Returns:
        bool: 推送是否成功
    """
    try:
        url = "http://www.pushplus.plus/send"
        data = {
            "token": token,
            "title": title,
            "content": content,
            "template": template
        }

        # 如果指定了群组，添加topic参数
        if topic:
            data["topic"] = topic
            print(f"使用群组推送，始发地: {app_settings['departure_city']}，群组编码: {topic}")
        else:
            print(f"使用个人推送，始发地: {app_settings['departure_city']}，未配置群组编码")

        response = requests.post(url, json=data)
        response.raise_for_status()
        result = response.json()
        if result.get("code") == 200:
            if topic:
                print(f"PushPlus群组推送成功: {title} (群组: {topic})")
            else:
                print(f"PushPlus个人推送成功: {title}")
            return True
        else:
            print(f"PushPlus推送失败: {result.get('msg')}")
            return False
    except Exception as e:
        print(f"PushPlus推送出错: {e}")
        return False

# ---- 记忆功能 ----
def load_notified_destinations():
    """加载已通知的目的地记录"""
    try:
        if os.path.exists("notified_destinations.pkl"):
            with open("notified_destinations.pkl", "rb") as f:
                return pickle.load(f)
        return {}
    except Exception as e:
        print(f"加载已通知目的地记录出错: {e}")
        return {}

def save_notified_destinations(notified_dict):
    """保存已通知的目的地记录"""
    try:
        with open("notified_destinations.pkl", "wb") as f:
            pickle.dump(notified_dict, f)
    except Exception as e:
        print(f"保存已通知目的地记录出错: {e}")

def is_destination_in_list(destination, destination_list):
    """检查目的地是否在列表中（不区分大小写和空格）"""
    if not destination_list:
        return False
    destination = destination.lower().strip()
    return any(dest.lower().strip() == destination for dest in destination_list)

# ---- 主函数 ----
def main(departure_code=None):
    """主函数，支持指定始发地"""
    global first_run_completed, current_departure

    # 如果指定了始发地，使用指定的始发地
    if departure_code:
        current_departure = departure_code

    # 加载环境变量
    load_dotenv()

    # 获取配置
    enable_pushplus = os.getenv("ENABLE_PUSHPLUS", "true").lower() == "true"
    pushplus_token = os.getenv("PUSHPLUS_TOKEN") if enable_pushplus else None
    price_threshold = float(os.getenv("PRICE_THRESHOLD", "1000"))
    use_whitelist = os.getenv("USE_WHITELIST", "false").lower() == "true"
    whitelist = os.getenv("WHITELIST_DESTINATIONS", "").split(",") if os.getenv("WHITELIST_DESTINATIONS") else []
    use_blacklist = os.getenv("USE_BLACKLIST", "false").lower() == "true"
    blacklist = os.getenv("BLACKLIST_DESTINATIONS", "").split(",") if os.getenv("BLACKLIST_DESTINATIONS") else []

    # 输出推送状态
    if enable_pushplus:
        print("PushPlus推送功能已启用")
    else:
        print("PushPlus推送功能已禁用")

    # 加载已通知的目的地记录
    notified_destinations = load_notified_destinations()

    # 当前时间
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n[{current_time}] 开始执行Ticketradar机票价格检测...")

    try:
        # 根据当前始发地更新payload
        current_payload = update_payload_for_departure(current_departure)

        # 从payload中提取行程信息
        extract_trip_info_from_payload(current_payload)

        # 发送POST请求
        print(f"开始发送请求，始发地: {get_city_display_name(current_departure)}...")
        response = requests.post(url, headers=headers, json=current_payload, timeout=30)
        response.raise_for_status()

        print(f"请求成功，状态码: {response.status_code}")

        # 解析响应内容为JSON
        response_data = response.json()
        print("成功解析响应为 JSON。")

        # 调用清洗函数
        print("开始清洗数据...")
        cleaned_data = clean_flight_data(response_data, base_url)

        # 使用 Pandas 处理数据
        if cleaned_data:
            df = pd.DataFrame(cleaned_data)

            # 不再保存CSV文件

            # 筛选境外目的地
            # 所有始发地都使用相同的筛选逻辑：只考虑国家字段
            # 只需满足国家不是中国
            international_df = df[df['国家'] != '中國']

            # 更新Web页面数据（不再生成CSV文件）
            update_web_data(df, international_df.head(12))

            # 筛选境外且价格低于阈值的目的地
            # 所有始发地都使用相同的筛选逻辑：只考虑国家字段
            # 只需满足国家不是中国且价格低于阈值
            low_price_df = df[(df['国家'] != '中國') & (df['价格'] < price_threshold)].copy()

            if not low_price_df.empty:
                print(f"\n发现{len(low_price_df)}个价格低于{price_threshold}的境外目的地:")

                # 应用白名单/黑名单过滤
                if use_whitelist:
                    low_price_df = low_price_df[low_price_df['目的地'].apply(
                        lambda x: is_destination_in_list(x, whitelist))]
                    print(f"应用白名单后剩余{len(low_price_df)}个境外目的地")

                if use_blacklist:
                    low_price_df = low_price_df[~low_price_df['目的地'].apply(
                        lambda x: is_destination_in_list(x, blacklist))]
                    print(f"应用黑名单后剩余{len(low_price_df)}个境外目的地")

                # 检查是否有需要通知的目的地
                if not low_price_df.empty:
                    notification_needed = False
                    flights_to_notify = []

                    for _, row in low_price_df.iterrows():
                        destination = row['目的地']
                        price = row['价格']

                        # 检查是否已经通知过
                        last_notified = notified_destinations.get(destination, None)
                        current_time = datetime.datetime.now()

                        # 如果从未通知过，或者上次通知是在24小时前，或者价格比上次通知时更低
                        if (last_notified is None or
                            (current_time - last_notified['time']).total_seconds() > 86400 or
                            price < last_notified['price']):

                            # 更新通知记录
                            notified_destinations[destination] = {
                                'time': current_time,
                                'price': price
                            }

                            # 添加到通知列表
                            flights_to_notify.append(row.to_dict())
                            notification_needed = True

                    # 如果有需要通知的航班，生成漂亮的HTML通知内容
                    if notification_needed:
                        # 准备通知内容数据
                        content_data = {
                            'message': f"为您发现{len(flights_to_notify)}个价格低于{price_threshold}元的境外机票。",
                            'departure_city': get_city_display_name(current_departure),
                            'departure_code': current_departure,  # 添加始发地代码，用于构建特定链接
                            'trip_type': app_settings['trip_type'],
                            'depart_date': app_settings['depart_date'],
                            'flights': flights_to_notify
                        }

                        # 如果是往返行程，添加返程日期
                        if app_settings['trip_type'] == '往返':
                            content_data['return_date'] = app_settings['return_date']

                        # 构建简洁的标题
                        title = f"Ticketradar - {get_city_display_name(current_departure)}发现{len(flights_to_notify)}个低价机票"

                        # 生成漂亮的HTML通知内容
                        notification_content = generate_beautiful_html_template(
                            title,
                            content_data
                        )

                    # 发送通知
                    if notification_needed and pushplus_token:
                        # 获取当前始发地对应的环境变量名
                        topic_env_var = pushplus_topic_env_vars.get(current_departure)
                        # 从环境变量中读取群组编码
                        topic = os.getenv(topic_env_var) if topic_env_var else None

                        # 构建标题，包含始发地信息，使用flights_to_notify的长度确保与内容一致
                        title = f"[Ticketradar] {get_city_display_name(current_departure)}出发 - 发现{len(flights_to_notify)}个低价境外机票"

                        # 发送群组推送
                        send_pushplus_notification(
                            pushplus_token,
                            title,
                            notification_content,
                            topic=topic
                        )

                        # 只在有新通知时保存已通知的目的地记录，避免不必要的文件写入
                        save_notified_destinations(notified_destinations)
                else:
                    print("应用过滤条件后没有符合条件的低价境外目的地")
            else:
                print(f"没有发现价格低于{price_threshold}的境外目的地")

            # 注意：用户监控任务现在由独立的循环处理，不再在主循环中处理
        else:
            print("未能从响应中清洗出有效的航班数据。")

    except json.JSONDecodeError:
        print("错误：响应内容不是有效的JSON格式")
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP 错误发生: {http_err}")
    except requests.exceptions.Timeout:
        print("请求超时。")
    except requests.exceptions.RequestException as req_err:
        print(f"请求错误发生: {req_err}")
    except Exception as e:
        print(f"发生未知错误: {e}")

    print("本次检测执行完毕。")

    # 标记第一次运行已完成
    first_run_completed = True

# ---- 全局变量 ----
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-this')
# 数据库配置 - 支持Docker环境
database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketradar.db')
# 确保数据目录存在（Docker环境）
if database_url.startswith('sqlite:///data/'):
    data_dir = 'data'
    try:
        os.makedirs(data_dir, mode=0o755, exist_ok=True)
        print(f"✅ 数据目录已创建: {data_dir}")
        # 测试目录写权限
        test_file = os.path.join(data_dir, '.test_write')
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        print(f"✅ 数据目录写权限正常")
    except Exception as e:
        print(f"❌ 数据目录创建失败: {e}")
        # 回退到当前目录
        database_url = 'sqlite:///ticketradar.db'
        print(f"🔄 回退到当前目录数据库: {database_url}")
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 配置CORS - 允许跨域请求
try:
    from flask_cors import CORS
    CORS(app, origins=['*'])  # 生产环境建议限制具体域名
    print("✅ CORS支持已启用")
except ImportError:
    print("⚠️ flask-cors未安装，跨域请求可能受限")

# 初始化扩展
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = '请先登录'
login_manager.login_message_category = 'info'

# ---- 简化的用户模型 ----
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import string

class User(UserMixin, db.Model):
    """用户模型"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    pushplus_token = db.Column(db.String(255))

    # 关联监控任务
    monitor_tasks = db.relationship('MonitorTask', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class InviteCode(db.Model):
    """邀请码模型"""
    __tablename__ = 'invite_codes'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(32), unique=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    expires_at = db.Column(db.DateTime)
    used_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    used_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    max_uses = db.Column(db.Integer, default=1)
    current_uses = db.Column(db.Integer, default=0)

    @staticmethod
    def generate_code(length=16):
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))

    def is_valid(self):
        if not self.is_active:
            return False
        if self.expires_at and datetime.datetime.now(datetime.timezone.utc) > self.expires_at:
            return False
        if self.current_uses >= self.max_uses:
            return False
        return True

    def use_code(self, user_id):
        if not self.is_valid():
            return False
        self.used_by = user_id
        self.used_at = datetime.datetime.now(datetime.timezone.utc)
        self.current_uses += 1
        if self.current_uses >= self.max_uses:
            self.is_active = False
        return True

class MonitorTask(db.Model):
    """监控任务模型"""
    __tablename__ = 'monitor_tasks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    departure_city = db.Column(db.String(50), nullable=False)
    departure_code = db.Column(db.String(10), nullable=False)
    destination_city = db.Column(db.String(50))
    depart_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date)
    trip_type = db.Column(db.String(10), default='round_trip')
    price_threshold = db.Column(db.Float, default=1000.0)
    pushplus_token = db.Column(db.String(255))  # 用户个人PushPlus令牌
    blacklist_cities = db.Column(db.Text)  # 黑名单城市列表，用逗号分隔
    blacklist_countries = db.Column(db.Text)  # 黑名单国家列表，用逗号分隔
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_check = db.Column(db.DateTime)
    last_notification = db.Column(db.DateTime)  # 最后通知时间
    total_checks = db.Column(db.Integer, default=0)  # 总检查次数
    total_notifications = db.Column(db.Integer, default=0)  # 总通知次数

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

last_update_time = None
flights_data = []  # 当前选中始发地的航班数据
all_flights_data = {}  # 存储所有始发地的航班数据，格式: {'HKG': [...], 'CAN': [...], 'SZX': [...], 'MFM': [...]}
current_departure = None  # 当前选中的始发地，将在程序启动时从环境变量中读取
first_run_completed = False  # 标记第一次运行是否完成

# 始发地映射表 - 扩展支持更多城市
# 主页显示的城市（只包含您需要的4个城市）
homepage_cities = {
    'HKG': '香港',
    'SZX': '深圳',
    'CAN': '广州',
    'MFM': '澳门'
}

def get_city_display_name(city_code):
    """获取城市显示名称，优先使用中文名，否则使用代码"""
    return homepage_cities.get(city_code, city_code.upper()) if city_code else 'N/A'

# 始发地对应的PushPlus群组编码变量名映射
pushplus_topic_env_vars = {
    'HKG': 'PUSHPLUS_TOPIC_HKG',  # 香港始发地对应的环境变量
    'CAN': 'PUSHPLUS_TOPIC_CAN',  # 广州始发地对应的环境变量
    'SZX': 'PUSHPLUS_TOPIC_SZX',  # 深圳始发地对应的环境变量
    'MFM': 'PUSHPLUS_TOPIC_MFM'   # 澳门始发地对应的环境变量
}

app_settings = {
    'price_threshold': 1000,
    'check_interval': 5,
    'notification_method': 'PushPlus',
    'departure_city': '香港',
    'departure_code': 'HKG',
    'trip_type': '往返',
    'depart_date': '2025-09-30',
    'return_date': '2025-10-08'
}
app_stats = {
    'HKG': {'total': 0, 'low_price': 0, 'min_price': 0},
    'CAN': {'total': 0, 'low_price': 0, 'min_price': 0},
    'SZX': {'total': 0, 'low_price': 0, 'min_price': 0},
    'MFM': {'total': 0, 'low_price': 0, 'min_price': 0}
}

# ---- Web路由 ----
@app.route('/')
@app.route('/<departure_code>')
def index(departure_code=None):
    """Web首页，支持选择不同始发地"""
    global last_update_time, flights_data, app_settings, app_stats, current_departure, all_flights_data

    # 如果指定了始发地，且格式正确，则切换到该始发地
    if departure_code and len(departure_code) == 3 and departure_code.isalpha():
        current_departure = departure_code.upper()
        app_settings['departure_code'] = current_departure
        app_settings['departure_city'] = get_city_display_name(current_departure)

        # 如果已经有该始发地的数据，则使用该数据
        if current_departure in all_flights_data:
            flights_data = all_flights_data[current_departure]

    # 如果没有当前始发地的数据，显示空数据
    if not flights_data:
        # 不再从CSV文件加载数据
        print(f"当前始发地 {get_city_display_name(current_departure)} 没有数据，等待下次API请求更新。")

    # 确保当前始发地在app_stats中存在
    if current_departure not in app_stats:
        app_stats[current_departure] = {'total': 0, 'low_price': 0, 'min_price': 0}

    # 定义各始发地的二维码URL
    qr_codes = {
        'HKG': 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQEe8DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAya1BHWEVwMDVjWEQxcEtFNU5FY3kAAgRuGx5oAwQAjScA',
        'CAN': 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQF48DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyTnhYTUYtMDVjWEQxcGlFNU5FY04AAgRSGx5oAwQAjScA',
        'SZX': 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQGe8DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyUzlJVkZqMDVjWEQxbFBHNmhFY0gAAgRz3R5oAwQAjScA',
        'MFM': 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQHK8TwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyNjQzLUZDMDVjWEQxaVNqeGhFYzgAAgS2hjloAwQAjScA'
    }

    # 主页只显示指定的4个城市，不管是否有数据
    departure_cities = homepage_cities.copy()

    return render_template('index.html',
                          flights=flights_data,
                          last_update=last_update_time or '尚未更新',
                          settings=app_settings,
                          stats=app_stats,
                          departure_cities=departure_cities,
                          current_departure=current_departure,
                          qr_codes=qr_codes)

@app.route('/api/flights')
def api_flights():
    """API接口 - 获取航班数据"""
    global flights_data

    # 添加CORS头部
    response = jsonify(flights_data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')

    return response

@app.route('/api/flights/<departure_code>')
def api_flights_by_city(departure_code):
    """API接口 - 获取指定城市的航班数据"""
    departure_code = departure_code.upper()

    # 验证城市代码格式
    if len(departure_code) != 3 or not departure_code.isalpha():
        return jsonify({
            'error': f'城市代码格式错误: {departure_code}，必须是3位字母'
        }), 400

    # 如果已有数据，直接返回
    if departure_code in all_flights_data:
        return jsonify({
            'departure_code': departure_code,
            'departure_city': get_city_display_name(departure_code),
            'flights': all_flights_data[departure_code],
            'last_update': last_update_time,
            'cached': True
        })

    # 如果没有数据，尝试获取
    try:
        # 临时获取该城市的数据
        temp_flights = fetch_flights_for_city(departure_code)
        return jsonify({
            'departure_code': departure_code,
            'departure_city': get_city_display_name(departure_code),
            'flights': temp_flights,
            'last_update': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'cached': False
        })
    except Exception as e:
        return jsonify({
            'error': f'获取 {get_city_display_name(departure_code)} 航班数据失败: {str(e)}',
            'departure_code': departure_code,
            'departure_city': get_city_display_name(departure_code)
        }), 500

@app.route('/api/supported-cities')
def api_supported_cities():
    """API接口 - 获取当前有数据的城市列表"""
    cities_with_data = [
        {
            'code': code,
            'name': get_city_display_name(code),
            'has_data': True,
            'flight_count': len(flights)
        }
        for code, flights in all_flights_data.items()
        if flights
    ]

    return jsonify({
        'cities': cities_with_data,
        'total': len(cities_with_data),
        'message': '支持任意有效的IATA城市代码，以上为当前有数据的城市'
    })

@app.route('/show_qr')
def show_qr():
    """显示二维码页面，用于在微信中长按识别"""
    # 这个路由主要是提供一个专门的页面来显示二维码
    # 实际的二维码URL会通过URL参数传递给qr_code_display_page.html
    return render_template('qr_code_display_page.html')

@app.route('/test-cities')
def test_cities():
    """测试城市支持页面"""
    return f"""
    <html>
    <head><title>城市支持测试</title></head>
    <body>
        <h1>城市支持测试</h1>
        <h2>支持任意有效的IATA城市代码</h2>

        <h3>当前有数据的城市:</h3>
        <ul>
        {''.join([f'<li>{code} - {get_city_display_name(code)} ({len(flights)}个航班)</li>' for code, flights in all_flights_data.items() if flights])}
        </ul>

        <h3>测试创建BJS任务:</h3>
        <form method="post" action="/test-create-bjs">
            <input type="submit" value="测试创建BJS任务">
        </form>
    </body>
    </html>
    """

@app.route('/test-create-bjs', methods=['POST'])
def test_create_bjs():
    """测试创建BJS任务"""
    departure_city = 'BJS'

    # 验证逻辑（复制自create_task）
    errors = []

    if not departure_city:
        errors.append('请输入出发城市代码')
    elif len(departure_city) != 3 or not departure_city.isalpha():
        errors.append('出发城市代码必须是3位字母，如：BJS、SHA、CAN、SZX等')

    result = f"""
    <html>
    <head><title>BJS任务创建测试结果</title></head>
    <body>
        <h1>BJS任务创建测试结果</h1>
        <p>测试城市代码: {departure_city}</p>
        <p>验证结果: {'通过' if not errors else '失败'}</p>

        {'<h3>错误信息:</h3><ul>' + ''.join([f'<li>{error}</li>' for error in errors]) + '</ul>' if errors else '<p>✅ 验证通过，BJS城市代码有效！</p>'}

        <p><a href="/test-cities">返回测试页面</a></p>
    </body>
    </html>
    """

    return result

@app.route('/clear-cache')
def clear_cache():
    """清除缓存并重定向到dashboard"""
    # 清除所有flash消息
    session.clear()

    # 返回一个强制刷新的页面
    return f"""
    <html>
    <head>
        <title>缓存已清除</title>
        <meta http-equiv="refresh" content="2;url={url_for('dashboard')}">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
    </head>
    <body>
        <h2>缓存已清除</h2>
        <p>正在重定向到dashboard...</p>
        <p>如果没有自动跳转，请<a href="{url_for('dashboard')}">点击这里</a></p>

        <h3>支持任意有效的IATA城市代码</h3>
        <p>当前有数据的城市数量：{len(all_flights_data)}</p>
    </body>
    </html>
    """

# ---- 用户认证路由 ----
@app.route('/login', methods=['GET', 'POST'])
def login():
    """用户登录"""
    if current_user.is_authenticated:
        flash(f'您已经登录为 {current_user.username}', 'info')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username_or_email = request.form.get('username_or_email', '').strip()
        password = request.form.get('password', '')

        if not username_or_email or not password:
            flash('请输入用户名/邮箱和密码', 'error')
            return render_template('login.html')

        # 查找用户
        user = None
        if '@' in username_or_email:
            user = User.query.filter_by(email=username_or_email.lower()).first()
        else:
            user = User.query.filter_by(username=username_or_email).first()

        if not user or not user.check_password(password):
            flash('用户名/邮箱或密码错误', 'error')
            return render_template('login.html')

        if not user.is_active:
            flash('账户已被禁用，请联系管理员', 'error')
            return render_template('login.html')

        # 登录用户
        from flask_login import login_user
        login_user(user, remember=request.form.get('remember_me'))
        user.last_login = datetime.datetime.now(datetime.timezone.utc)
        db.session.commit()

        flash(f'欢迎回来，{user.username}！', 'success')
        next_page = request.args.get('next')
        if not next_page or not next_page.startswith('/'):
            next_page = url_for('dashboard')
        return redirect(next_page)

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """用户注册"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        invite_code = request.form.get('invite_code', '').strip()

        # 验证输入
        errors = []

        if not username or len(username) < 3:
            errors.append('用户名至少3位')
        elif User.query.filter_by(username=username).first():
            errors.append('用户名已存在')

        if not email or '@' not in email:
            errors.append('请输入有效邮箱')
        elif User.query.filter_by(email=email).first():
            errors.append('邮箱已被注册')

        if not password or len(password) < 6:
            errors.append('密码至少6位')

        if password != confirm_password:
            errors.append('两次输入的密码不一致')

        if not invite_code:
            errors.append('邀请码不能为空')
        else:
            code_obj = InviteCode.query.filter_by(code=invite_code).first()
            if not code_obj or not code_obj.is_valid():
                errors.append('邀请码无效或已过期')

        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('register.html')

        try:
            # 创建用户
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.flush()

            # 使用邀请码
            code_obj.use_code(user.id)
            db.session.commit()

            # 自动登录
            from flask_login import login_user
            login_user(user)
            user.last_login = datetime.datetime.now(datetime.timezone.utc)
            db.session.commit()

            flash('注册成功，欢迎使用Ticketradar！', 'success')
            return redirect(url_for('dashboard'))

        except Exception as e:
            db.session.rollback()
            flash(f'注册失败：{str(e)}', 'error')
            return render_template('register.html')

    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    """用户登出"""
    from flask_login import logout_user
    username = current_user.username
    logout_user()
    flash(f'再见，{username}！', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    """用户仪表板"""
    # 获取用户的监控任务（限制为一个）
    user_task = MonitorTask.query.filter_by(user_id=current_user.id).first()
    if user_task:
        destination_text = user_task.destination_city or '所有目的地'
        print(f"🔍 Dashboard: {user_task.departure_city} → {destination_text} (¥{user_task.price_threshold})")

    # 如果用户有监控任务，获取对应的机票数据
    task_flights = []
    task_stats = {}
    if user_task:
        # 使用departure_city作为键（存储的是城市代码如'HKG'）
        departure_code = user_task.departure_city

        # 使用统一的函数获取航班数据 - 确保Dashboard和推送一致
        try:
            # 使用用户任务的具体日期
            depart_date_str = user_task.depart_date.strftime('%Y-%m-%d')
            return_date_str = user_task.return_date.strftime('%Y-%m-%d') if user_task.return_date else None



            # 使用统一的get_flights_for_user_task函数
            flight_result = get_flights_for_user_task(
                departure_city=departure_code,
                destination_city=user_task.destination_city,
                depart_date=depart_date_str,
                return_date=return_date_str,
                blacklist_cities=user_task.blacklist_cities,
                blacklist_countries=user_task.blacklist_countries
            )

            # 提取数据
            task_flights = flight_result['flights']  # 前9个最低价航班
            all_flights = flight_result['all_flights']  # 所有境外航班
            base_stats = flight_result['stats']  # 基础统计信息

            if task_flights:
                destination_text = user_task.destination_city or '所有目的地'
                flash(f'已获取 {get_city_display_name(departure_code)} 到 {destination_text} 的最新航班数据', 'success')
            else:
                destination_text = user_task.destination_city or '所有目的地'
                flash(f'未找到 {get_city_display_name(departure_code)} 到 {destination_text} 的航班数据', 'warning')

        except Exception as e:
            print(f"🔍 Dashboard: 获取航班数据失败: {e}")
            task_flights = []
            all_flights = []
            base_stats = {'total_flights': 0, 'min_price': 0}
            destination_text = user_task.destination_city or '所有目的地'
            flash(f'获取 {get_city_display_name(departure_code)} 到 {destination_text} 航班数据失败，请稍后重试', 'warning')

        # 计算统计信息（基于所有境外航班）
        if all_flights:
            low_price_flights = [f for f in all_flights if f.get('价格', 0) <= user_task.price_threshold]

            # 统计信息（基于完整的境外航班数据）
            task_stats = {
                'total_flights': base_stats['total_flights'],  # 总境外航班数
                'low_price_count': len(low_price_flights),     # 低价航班数
                'min_price': base_stats['min_price'],          # 最低价格
                'departure_city_name': get_city_display_name(departure_code)
            }
        else:
            task_stats = {
                'total_flights': 0,
                'low_price_count': 0,
                'min_price': 0,
                'departure_city_name': get_city_display_name(departure_code)
            }



    return render_template('dashboard.html',
                         user=current_user,
                         task=user_task,
                         flights=task_flights,
                         stats=task_stats,
                         last_update=last_update_time)

# ---- 管理员功能 ----
@app.route('/admin')
@login_required
def admin():
    """管理员页面"""
    if not current_user.is_admin:
        flash('需要管理员权限', 'error')
        return redirect(url_for('index'))

    # 统计信息
    stats = {
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(is_active=True).count(),
        'total_tasks': MonitorTask.query.count(),
        'active_tasks': MonitorTask.query.filter_by(is_active=True).count(),
        'total_invites': InviteCode.query.count(),
        'active_invites': InviteCode.query.filter_by(is_active=True).count()
    }

    # 最近的邀请码
    recent_codes = InviteCode.query.order_by(InviteCode.created_at.desc()).limit(10).all()

    # 用户列表
    users = User.query.order_by(User.created_at.desc()).all()

    return render_template('admin.html', stats=stats, recent_codes=recent_codes, users=users)

@app.route('/admin/generate-invite', methods=['POST'])
@login_required
def generate_invite():
    """生成邀请码"""
    if not current_user.is_admin:
        flash('需要管理员权限', 'error')
        return redirect(url_for('index'))

    count = int(request.form.get('count', 1))
    expires_days = request.form.get('expires_days', '')

    if count < 1 or count > 50:
        flash('生成数量必须在1-50之间', 'error')
        return redirect(url_for('admin'))

    expires_at = None
    if expires_days:
        try:
            days = int(expires_days)
            if days > 0:
                expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=days)
        except ValueError:
            flash('过期天数必须是正整数', 'error')
            return redirect(url_for('admin'))

    try:
        generated_codes = []
        for _ in range(count):
            code = InviteCode(
                code=InviteCode.generate_code(),
                created_by=current_user.id,
                expires_at=expires_at
            )
            db.session.add(code)
            generated_codes.append(code.code)

        db.session.commit()
        flash(f'成功生成 {count} 个邀请码', 'success')

    except Exception as e:
        db.session.rollback()
        flash(f'生成失败：{str(e)}', 'error')

    return redirect(url_for('admin'))

@app.route('/admin/deactivate-invite/<int:code_id>', methods=['POST'])
@login_required
def deactivate_invite(code_id):
    """停用邀请码"""
    if not current_user.is_admin:
        return jsonify({'success': False, 'message': '需要管理员权限'}), 403

    try:
        invite_code = InviteCode.query.get_or_404(code_id)

        if not invite_code.is_active:
            return jsonify({'success': False, 'message': '邀请码已经是停用状态'}), 400

        invite_code.is_active = False
        db.session.commit()

        return jsonify({'success': True, 'message': '邀请码已成功停用'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'停用失败：{str(e)}'}), 500

@app.route('/admin/toggle-user/<int:user_id>', methods=['POST'])
@login_required
def toggle_user(user_id):
    """切换用户状态（激活/暂停）"""
    if not current_user.is_admin:
        return jsonify({'success': False, 'message': '需要管理员权限'}), 403

    try:
        user = User.query.get_or_404(user_id)

        # 不能操作自己的账户
        if user.id == current_user.id:
            return jsonify({'success': False, 'message': '不能操作自己的账户'}), 400

        # 不能操作其他管理员账户
        if user.is_admin:
            return jsonify({'success': False, 'message': '不能操作管理员账户'}), 400

        user.is_active = not user.is_active
        db.session.commit()

        status = '激活' if user.is_active else '暂停'
        return jsonify({'success': True, 'message': f'用户已{status}', 'is_active': user.is_active})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'操作失败：{str(e)}'}), 500

@app.route('/admin/delete-user/<int:user_id>', methods=['POST'])
@login_required
def delete_user(user_id):
    """删除用户"""
    if not current_user.is_admin:
        return jsonify({'success': False, 'message': '需要管理员权限'}), 403

    try:
        user = User.query.get_or_404(user_id)

        # 不能删除自己的账户
        if user.id == current_user.id:
            return jsonify({'success': False, 'message': '不能删除自己的账户'}), 400

        # 不能删除其他管理员账户
        if user.is_admin:
            return jsonify({'success': False, 'message': '不能删除管理员账户'}), 400

        # 删除用户（会级联删除相关的监控任务）
        db.session.delete(user)
        db.session.commit()

        return jsonify({'success': True, 'message': '用户已删除'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'删除失败：{str(e)}'}), 500

# ---- 监控任务管理 ----
@app.route('/create-task', methods=['POST'])
@login_required
def create_task():
    """创建监控任务"""
    # 临时移除单任务限制，用于调试
    print(f"🔍 创建任务 - 用户ID: {current_user.id}, 用户名: {current_user.username}")

    # 检查用户是否已有监控任务（暂时注释掉）
    # existing_task = MonitorTask.query.filter_by(user_id=current_user.id).first()
    # if existing_task:
    #     flash('您已经有一个监控任务，请先删除现有任务再创建新的', 'error')
    #     return redirect(url_for('dashboard'))

    departure_city = request.form.get('departure_city', '').strip().upper()  # 转换为大写
    destination_city = request.form.get('destination_city', '').strip().upper()  # 新增目的地字段
    depart_date = request.form.get('depart_date', '')
    return_date = request.form.get('return_date', '')
    price_threshold = request.form.get('price_threshold', 1000)
    pushplus_token = request.form.get('pushplus_token', '').strip()
    blacklist_cities = request.form.get('blacklist_cities', '').strip()  # 黑名单城市
    blacklist_countries = request.form.get('blacklist_countries', '').strip()  # 黑名单国家

    # 验证输入
    errors = []

    if not departure_city:
        errors.append('请输入出发城市代码')
    elif len(departure_city) != 3 or not departure_city.isalpha():
        errors.append('出发城市代码必须是3位字母，如：BJS、SHA、CAN、SZX等')

    # 验证目的地城市（可选）
    if destination_city and (len(destination_city) != 3 or not destination_city.isalpha()):
        errors.append('目的地城市代码必须是3位字母，如：SEL、LON、NYC等')



    if not depart_date:
        errors.append('请选择出发日期')
    else:
        try:
            depart_date_obj = datetime.datetime.strptime(depart_date, '%Y-%m-%d').date()
            if depart_date_obj <= datetime.datetime.now().date():
                errors.append('出发日期必须是未来日期')
        except ValueError:
            errors.append('出发日期格式错误')

    return_date_obj = None
    if return_date:
        try:
            return_date_obj = datetime.datetime.strptime(return_date, '%Y-%m-%d').date()
            if return_date_obj <= depart_date_obj:
                errors.append('返程日期必须晚于出发日期')
        except ValueError:
            errors.append('返程日期格式错误')

    try:
        price_threshold = float(price_threshold)
        if price_threshold < 100:
            errors.append('价格阈值不能低于100元')
    except ValueError:
        errors.append('价格阈值必须是数字')

    if errors:
        for error in errors:
            flash(error, 'error')
        return redirect(url_for('dashboard'))

    try:
        # 自动生成任务名称
        trip_type_text = '往返' if return_date_obj else '单程'
        destination_text = destination_city if destination_city else '所有目的地'
        task_name = f"{departure_city}→{destination_text}监控({trip_type_text})"

        # 创建监控任务（支持指定目的地或所有目的地）
        task = MonitorTask(
            user_id=current_user.id,
            name=task_name,
            departure_city=departure_city,  # 直接使用用户输入的代码
            departure_code=departure_city,
            destination_city=destination_city if destination_city else None,  # 支持指定目的地
            depart_date=depart_date_obj,
            return_date=return_date_obj,
            trip_type='round_trip' if return_date_obj else 'one_way',
            price_threshold=price_threshold,
            pushplus_token=pushplus_token if pushplus_token else None,
            blacklist_cities=blacklist_cities if blacklist_cities else None,
            blacklist_countries=blacklist_countries if blacklist_countries else None
        )

        db.session.add(task)
        db.session.commit()

        flash('监控任务创建成功！', 'success')

    except Exception as e:
        db.session.rollback()
        flash(f'创建失败：{str(e)}', 'error')

    return redirect(url_for('dashboard'))

@app.route('/edit-task/<int:task_id>', methods=['GET', 'POST'])
@login_required
def edit_task(task_id):
    """编辑监控任务"""
    task = MonitorTask.query.filter_by(id=task_id, user_id=current_user.id).first()
    if not task:
        flash('任务不存在或无权限访问', 'error')
        return redirect(url_for('dashboard'))

    if request.method == 'GET':
        # 返回任务数据用于编辑表单
        return jsonify({
            'id': task.id,
            'name': task.name,
            'departure_city': task.departure_city,
            'destination_city': task.destination_city or '',
            'depart_date': task.depart_date.strftime('%Y-%m-%d'),
            'return_date': task.return_date.strftime('%Y-%m-%d') if task.return_date else '',
            'price_threshold': task.price_threshold,
            'pushplus_token': task.pushplus_token or '',
            'blacklist_cities': task.blacklist_cities or '',
            'blacklist_countries': task.blacklist_countries or ''
        })

    # POST 请求 - 更新任务
    departure_city = request.form.get('departure_city', '').strip().upper()
    destination_city = request.form.get('destination_city', '').strip().upper()  # 新增目的地字段
    depart_date = request.form.get('depart_date', '')
    return_date = request.form.get('return_date', '')
    price_threshold = request.form.get('price_threshold', 1000)
    pushplus_token = request.form.get('pushplus_token', '').strip()
    blacklist_cities = request.form.get('blacklist_cities', '').strip()  # 黑名单城市
    blacklist_countries = request.form.get('blacklist_countries', '').strip()  # 黑名单国家

    # 验证输入（复用创建任务的验证逻辑）
    errors = []

    if not departure_city:
        errors.append('请输入出发城市代码')
    elif len(departure_city) != 3 or not departure_city.isalpha():
        errors.append('出发城市代码必须是3位字母，如：BJS、SHA、CAN、SZX等')

    # 验证目的地城市（可选）
    if destination_city and (len(destination_city) != 3 or not destination_city.isalpha()):
        errors.append('目的地城市代码必须是3位字母，如：SEL、LON、NYC等')



    if not depart_date:
        errors.append('请选择出发日期')
    else:
        try:
            depart_date_obj = datetime.datetime.strptime(depart_date, '%Y-%m-%d').date()
            if depart_date_obj <= datetime.datetime.now().date():
                errors.append('出发日期必须是未来日期')
        except ValueError:
            errors.append('出发日期格式错误')

    return_date_obj = None
    if return_date:
        try:
            return_date_obj = datetime.datetime.strptime(return_date, '%Y-%m-%d').date()
            if return_date_obj <= depart_date_obj:
                errors.append('返程日期必须晚于出发日期')
        except ValueError:
            errors.append('返程日期格式错误')

    try:
        price_threshold = float(price_threshold)
        if price_threshold < 100:
            errors.append('价格阈值不能低于100元')
    except ValueError:
        errors.append('价格阈值必须是数字')

    if errors:
        for error in errors:
            flash(error, 'error')
        return redirect(url_for('dashboard'))

    try:
        # 自动生成任务名称
        trip_type_text = '往返' if return_date_obj else '单程'
        destination_text = destination_city if destination_city else '所有目的地'
        task_name = f"{departure_city}→{destination_text}监控({trip_type_text})"

        # 更新任务（支持指定目的地或所有目的地）
        task.name = task_name
        task.departure_city = departure_city
        task.departure_code = departure_city
        task.destination_city = destination_city if destination_city else None  # 支持指定目的地
        task.depart_date = depart_date_obj
        task.return_date = return_date_obj
        task.trip_type = 'round_trip' if return_date_obj else 'one_way'
        task.price_threshold = price_threshold
        task.pushplus_token = pushplus_token if pushplus_token else None
        task.blacklist_cities = blacklist_cities if blacklist_cities else None
        task.blacklist_countries = blacklist_countries if blacklist_countries else None

        db.session.commit()
        flash('监控任务更新成功！', 'success')

    except Exception as e:
        db.session.rollback()
        flash(f'更新失败：{str(e)}', 'error')

    return redirect(url_for('dashboard'))

@app.route('/toggle-task/<int:task_id>', methods=['POST'])
@login_required
def toggle_task(task_id):
    """切换任务状态（启动/暂停）"""
    task = MonitorTask.query.filter_by(id=task_id, user_id=current_user.id).first()
    if not task:
        return jsonify({'success': False, 'message': '任务不存在或无权限访问'})

    try:
        task.is_active = not task.is_active
        db.session.commit()

        status = '启动' if task.is_active else '暂停'
        return jsonify({
            'success': True,
            'message': f'任务已{status}',
            'is_active': task.is_active
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'操作失败：{str(e)}'})

@app.route('/delete-task/<int:task_id>', methods=['POST', 'DELETE'])
@login_required
def delete_task(task_id):
    """删除监控任务"""
    task = MonitorTask.query.filter_by(id=task_id, user_id=current_user.id).first()
    if not task:
        return jsonify({'success': False, 'message': '任务不存在或无权限访问'})

    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'success': True, 'message': '任务删除成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'删除失败：{str(e)}'})

# ---- 数据库初始化 ----
def init_database():
    """初始化数据库"""
    with app.app_context():
        db.create_all()

        # 检查并添加黑名单字段（数据库迁移）
        migrate_blacklist_fields()

        # 检查是否已有管理员用户
        admin_user = User.query.filter_by(is_admin=True).first()
        if not admin_user:
            print("未找到管理员用户，创建默认管理员账户...")

            # 创建默认管理员账户
            default_admin = User(
                username='1242772513@qq.com',
                email='1242772513@qq.com',
                password_hash=generate_password_hash('1242772513'),
                is_admin=True,
                is_active=True
            )

            db.session.add(default_admin)
            db.session.commit()

            print("✅ 默认管理员账户创建成功:")
            print(f"   用户名: 1242772513@qq.com")
            print(f"   密码: 1242772513")
            print(f"   权限: 管理员")
        else:
            print(f"数据库已存在管理员用户: {admin_user.username} ({admin_user.email})")

def migrate_blacklist_fields():
    """迁移黑名单字段到现有数据库"""
    try:
        # 获取数据库连接
        from sqlalchemy import text

        # 检查字段是否存在
        result = db.session.execute(text("PRAGMA table_info(monitor_tasks)"))
        columns = [row[1] for row in result.fetchall()]

        # 添加blacklist_cities字段
        if 'blacklist_cities' not in columns:
            print("➕ 添加blacklist_cities字段...")
            db.session.execute(text("ALTER TABLE monitor_tasks ADD COLUMN blacklist_cities TEXT"))
            print("✅ blacklist_cities字段添加成功")

        # 添加blacklist_countries字段
        if 'blacklist_countries' not in columns:
            print("➕ 添加blacklist_countries字段...")
            db.session.execute(text("ALTER TABLE monitor_tasks ADD COLUMN blacklist_countries TEXT"))
            print("✅ blacklist_countries字段添加成功")

        db.session.commit()
        print("🎉 数据库迁移完成")

    except Exception as e:
        print(f"⚠️ 数据库迁移跳过: {e}")
        db.session.rollback()

# ---- 更新数据函数 ----
def update_web_data(df, international_top_df, departure_code=None):
    """更新Web页面数据，支持指定始发地"""
    global last_update_time, flights_data, app_stats, all_flights_data, current_departure

    # 如果没有指定始发地，使用当前始发地
    if departure_code is None:
        departure_code = current_departure

    # 更新时间
    last_update_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 更新航班数据
    flight_records = international_top_df.to_dict('records')

    # 存储到对应始发地的数据中
    all_flights_data[departure_code] = flight_records

    # 如果是当前选中的始发地，更新flights_data
    if departure_code == current_departure:
        flights_data = flight_records

    # 更新统计信息 - 只统计境外的机票
    # 所有始发地都使用相同的筛选逻辑：只考虑国家字段
    # 只需满足国家不是中国
    international_full_df = df[df['国家'] != '中國']

    # 确保始发地在app_stats中存在
    if departure_code not in app_stats:
        app_stats[departure_code] = {'total': 0, 'low_price': 0, 'min_price': 0}

    # 更新对应始发地的统计信息
    app_stats[departure_code]['total'] = len(international_full_df)
    app_stats[departure_code]['low_price'] = len(international_full_df[international_full_df['价格'] < app_settings['price_threshold']])
    app_stats[departure_code]['min_price'] = international_full_df['价格'].min() if not international_full_df.empty else 0

    # 不再保存CSV文件

    print(f"Web数据已更新，始发地: {get_city_display_name(departure_code)}，展示了{len(flight_records)}条Top境外记录，总境外目的地共{app_stats[departure_code]['total']}条")

# ---- 根据始发地更新payload ----
def update_payload_for_departure(departure_code):
    """根据始发地更新payload"""
    # 复制原始payload
    updated_payload = copy.deepcopy(payload)

    # 更新始发地
    if 'segments' in updated_payload and len(updated_payload['segments']) > 0:
        if 'dcs' in updated_payload['segments'][0] and len(updated_payload['segments'][0]['dcs']) > 0:
            updated_payload['segments'][0]['dcs'][0]['code'] = departure_code

    # 更新日期信息，使用app_settings中的日期（已从环境变量读取）
    if 'segments' in updated_payload and len(updated_payload['segments']) > 0:
        # 更新出发日期
        if 'drl' in updated_payload['segments'][0] and len(updated_payload['segments'][0]['drl']) > 0:
            updated_payload['segments'][0]['drl'][0]['begin'] = app_settings['depart_date']
            updated_payload['segments'][0]['drl'][0]['end'] = app_settings['depart_date']

        # 更新返程日期
        if 'rdrl' in updated_payload['segments'][0] and len(updated_payload['segments'][0]['rdrl']) > 0:
            updated_payload['segments'][0]['rdrl'][0]['begin'] = app_settings['return_date']
            updated_payload['segments'][0]['rdrl'][0]['end'] = app_settings['return_date']

    # 更新transactionId，使用当前时间戳
    current_time = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    transaction_id = f"1-mf-{current_time}-WEB"
    updated_payload['transactionId'] = transaction_id

    # 更新head中的相关字段
    if 'head' in updated_payload and 'extension' in updated_payload['head']:
        for item in updated_payload['head']['extension']:
            if item.get('name') == 'flt_app_session_transactionId':
                item['value'] = transaction_id
            elif item.get('name') == 'clientTime':
                item['value'] = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S+08:00")

    return updated_payload

# ---- 为用户监控任务创建特定的payload ----
def create_payload_for_user_task(departure_code, destination_code=None, depart_date=None, return_date=None):
    """为用户监控任务创建特定的payload"""
    # 复制原始payload
    updated_payload = copy.deepcopy(payload)

    # 根据是否有返程日期设置行程类型
    if return_date:
        updated_payload['tt'] = 2  # 往返
        print(f"🔍 设置为往返票: {depart_date} → {return_date}")
    else:
        updated_payload['tt'] = 1  # 单程
        print(f"🔍 设置为单程票: {depart_date}")

    # 更新始发地
    if 'segments' in updated_payload and len(updated_payload['segments']) > 0:
        if 'dcs' in updated_payload['segments'][0] and len(updated_payload['segments'][0]['dcs']) > 0:
            updated_payload['segments'][0]['dcs'][0]['code'] = departure_code

        # 更新目的地
        if destination_code:
            # 如果指定了目的地，使用具体的城市代码
            updated_payload['segments'][0]['acs'] = [{"ct": 1, "code": destination_code}]
        else:
            # 如果没有指定目的地，使用原始的区域代码（搜索所有目的地）
            updated_payload['segments'][0]['acs'] = [{"ct": 6, "code": "bd_49_29"}]

        # 更新出发日期
        if 'drl' in updated_payload['segments'][0] and len(updated_payload['segments'][0]['drl']) > 0:
            depart_date_str = depart_date or app_settings['depart_date']
            updated_payload['segments'][0]['drl'][0]['begin'] = depart_date_str
            updated_payload['segments'][0]['drl'][0]['end'] = depart_date_str

        # 更新返程日期
        if return_date:
            # 往返票：设置返程日期
            if 'rdrl' in updated_payload['segments'][0] and len(updated_payload['segments'][0]['rdrl']) > 0:
                updated_payload['segments'][0]['rdrl'][0]['begin'] = return_date
                updated_payload['segments'][0]['rdrl'][0]['end'] = return_date
            else:
                updated_payload['segments'][0]['rdrl'] = [{"begin": return_date, "end": return_date}]
        else:
            # 单程票：返程日期范围应为空数组
            updated_payload['segments'][0]['rdrl'] = []

    # 更新transactionId，使用当前时间戳
    current_time = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    transaction_id = f"1-mf-{current_time}-WEB"
    updated_payload['transactionId'] = transaction_id

    # 更新head中的相关字段
    if 'head' in updated_payload and 'extension' in updated_payload['head']:
        for item in updated_payload['head']['extension']:
            if item.get('name') == 'flt_app_session_transactionId':
                item['value'] = transaction_id
            elif item.get('name') == 'clientTime':
                item['value'] = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S+08:00")

    return updated_payload

def create_flight_list_payload(departure_code, destination_code, depart_date, return_date=None):
    """为指定目的地的监控任务创建FlightListSearchSSE接口的payload"""
    import datetime

    print(f"🔍 Dashboard: 创建FlightListSearchSSE payload - {departure_code} → {destination_code}")

    # 生成当前时间相关的值
    current_time = datetime.datetime.now()
    transaction_id = f"1-mf-{current_time.strftime('%Y%m%d%H%M%S')}-WEB"
    client_time = current_time.strftime("%Y-%m-%dT%H:%M:%S+08:00")

    # 构建新接口的payload
    flight_list_payload = {
        "mode": 0,
        "searchCriteria": {
            "grade": 3,
            "tripType": 1,  # 1=单程, 2=往返
            "journeyNo": 1,
            "passengerInfoType": {
                "adultCount": 1,
                "childCount": 0,
                "infantCount": 0
            },
            "journeyInfoTypes": [
                {
                    "journeyNo": 1,
                    "departDate": depart_date,
                    "departCode": departure_code,
                    "arriveCode": destination_code,
                    "departAirport": "",
                    "arriveAirport": ""
                }
            ],
            "policyId": None
        },
        "sortInfoType": {
            "direction": True,
            "orderBy": "Direct",  # 改为按直飞排序
            "topList": []
        },
        "tagList": [],
        "flagList": [],
        "filterType": {
            "filterFlagTypes": [
                {
                    "flag": "Direct",
                    "allow": True,
                    "journeyNoList": [1],
                    "memory": True  # 关键字段：记住直飞过滤设置
                }
            ],
            "queryItemSettings": [],
            "studentsSelectedStatus": True
        },
        "abtList": [
            {
                "abCode": "240509_IBU_RFUO",
                "abVersion": "A"
            }
        ],
        "head": {
            "cid": "09034048218003791614",
            "ctok": "",
            "cver": "3",
            "lang": "01",
            "sid": "8888",
            "syscode": "40",
            "auth": "",
            "xsid": "",
            "extension": [
                {"name": "abTesting", "value": "M:71,240723_IBU_OLPS:B;M:0,250520_IBU_FPG:B;M:2,250421_IBU_snth:B;M:34,250430_IBU_ais:A;M:34,250430_IBU_ais:A;M:7,240308_IBU_olrp:B;M:6,240417_IBU_Ohtwl:A;M:28,240912_IBU_jpwjo:A;M:-1,240924_IBU_uspoe:A;M:-1,240509_IBU_RFUO:A;M:-1,240924_IBU_usphe:A;M:76,241128_IBU_uspso:A;M:94,241128_IBU_usphs:A;M:80,241031_IBU_OLFL:F;M:44,241224_IBU_TOLNG:B;M:46,250109_IBU_OLFBO:E;M:46,250109_IBU_OLFBO:E;M:95,250206_IBU_sxbjo:A;M:9,250219_IBU_OLLIST:A;M:9,250219_IBU_OLLIST:A;M:21,250207_IBU_FLTOLM:E;M:21,250207_IBU_FLTOLM:E;M:41,250305_IBU_sxxw:B;M:7,250313_IBU_GWBVO:B;M:82,250403_IBU_wcd:D;M:43,250423_IBU_olm:B;M:95,250403_IBU_PDOOL:D;M:43,250408_IBU_fltollogin:A;M:0,250417_IBU_olf:A;M:93,250515_IBU_plbb:A;M:68,250527_IBU_lsf:A;M:37,250521_IBU_ONCOPR:A;"},
                {"name": "source", "value": "ONLINE"},
                {"name": "sotpGroup", "value": "Trip"},
                {"name": "sotpLocale", "value": "zh-HK"},
                {"name": "sotpCurrency", "value": "CNY"},
                {"name": "allianceID", "value": "1094387"},
                {"name": "sid", "value": "2209817"},
                {"name": "ouid", "value": "ctag.hash.od66w3zbknse"},
                {"name": "uuid", "value": ""},
                {"name": "useDistributionType", "value": "1"},
                {"name": "flt_app_session_transactionId", "value": transaction_id},
                {"name": "vid", "value": "1746708309569.1d384rgx2qT7"},
                {"name": "pvid", "value": "13"},
                {"name": "Flt_SessionId", "value": "22"},
                {"name": "channel", "value": ""},
                {"name": "x-ua", "value": "v=3_os=ONLINE_osv=10"},
                {"name": "PageId", "value": "10320667452"},
                {"name": "clientTime", "value": client_time},
                {"name": "edmSource", "value": "undefined"},
                {"name": "LowPriceSource", "value": "historySearch"},
                {"name": "Flt_BatchId", "value": "e203cd39-acf5-4bbd-ab78-9a86f5a69261"},
                {"name": "BlockTokenTimeout", "value": "0"},
                {"name": "full_link_time_scene", "value": "pure_list_page"},
                {"name": "units", "value": "METRIC"},
                {"name": "sotpUnit", "value": "METRIC"}
            ],
            "Locale": "zh-HK",
            "Language": "hk",
            "Currency": "CNY",
            "ClientID": "",
            "appid": "700020"
        }
    }

    # 如果是往返票，添加返程信息
    if return_date:
        flight_list_payload["searchCriteria"]["tripType"] = 2  # 往返
        flight_list_payload["searchCriteria"]["journeyInfoTypes"].append({
            "journeyNo": 2,
            "departDate": return_date,
            "departCode": destination_code,
            "arriveCode": departure_code,
            "departAirport": "",
            "arriveAirport": ""
        })
        print(f"🔍 设置为往返票: 返程 {return_date}")

    # 简化的payload信息
    trip_type_text = '往返' if flight_list_payload['searchCriteria']['tripType'] == 2 else '单程'
    print(f"🔍 创建payload: {flight_list_payload['searchCriteria']['journeyInfoTypes'][0]['departCode']} → {flight_list_payload['searchCriteria']['journeyInfoTypes'][0]['arriveCode']} ({trip_type_text})")

    return flight_list_payload

def parse_sse_response(response):
    """解析SSE流响应，提取JSON数据"""

    try:
        json_data_list = []
        current_event_data_lines = []

        # 解析SSE流
        for line_bytes in response.iter_lines():
            if not line_bytes:
                # 空行表示一个事件结束
                if current_event_data_lines:
                    process_sse_event(current_event_data_lines, json_data_list)
                    current_event_data_lines = []
                continue

            line = line_bytes.decode('utf-8').strip()

            if line.startswith("data:"):
                data_content = line[len("data:"):].strip()
                if data_content:
                    current_event_data_lines.append(data_content)

        # 处理最后一个事件
        if current_event_data_lines:
            process_sse_event(current_event_data_lines, json_data_list)

        # 返回结果
        if json_data_list:
            selected_block = json_data_list[0]
            total_flights = len(selected_block.get("itineraryList", []))
            print(f"✅ 获得 {total_flights} 个航班数据")
            return selected_block
        else:
            print(f"⚠️ 未获得有效航班数据")
            return None

    except Exception as e:
        print(f"❌ SSE解析失败: {e}")
        return None

def process_sse_event(data_lines, json_data_list):
    """处理单个SSE事件"""
    import json

    if not data_lines:
        return

    # 将多行data内容合并
    full_data_str = "".join(data_lines)

    try:
        json_object = json.loads(full_data_str)

        # 检查是否包含航班数据
        if "itineraryList" in json_object or "basicInfo" in json_object:
            json_data_list.append(json_object)

    except json.JSONDecodeError:
        pass  # 忽略解析失败的数据
    except Exception:
        pass  # 忽略其他错误

def merge_multiple_sse_blocks(json_data_list):
    """合并多个SSE JSON块的航班数据"""
    try:
        if not json_data_list:
            return None

        # 使用第一个块作为基础模板
        merged_data = json_data_list[0].copy()
        merged_itinerary_list = []

        # 合并所有块的itineraryList
        total_itineraries = 0
        for i, json_block in enumerate(json_data_list):
            block_itineraries = json_block.get("itineraryList", [])
            merged_itinerary_list.extend(block_itineraries)
            total_itineraries += len(block_itineraries)
            print(f"🔍 DEBUG: 合并第 {i+1} 个块，包含 {len(block_itineraries)} 个行程")

        # 更新合并后的数据
        merged_data["itineraryList"] = merged_itinerary_list

        print(f"🔍 DEBUG: 合并完成，总共 {total_itineraries} 个行程")
        return merged_data

    except Exception as e:
        print(f"🔍 DEBUG: 合并SSE块时出错: {e}")
        # 如果合并失败，返回第一个块
        return json_data_list[0] if json_data_list else None

def fallback_parse_response(response):
    """回退解析方案：尝试直接解析响应文本"""
    import json

    print(f"🔍 Dashboard: 未找到标准SSE格式，尝试回退解析...")

    try:
        response_text = response.text
        print(f"🔍 Dashboard: 响应文本长度: {len(response_text)}")

        if not response_text.strip():
            print(f"🔍 Dashboard: 响应文本为空")
            return None

        # 尝试直接解析为JSON
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            print(f"🔍 Dashboard: 响应文本不是有效JSON")

            # 尝试查找JSON片段
            if '{' in response_text and '}' in response_text:
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                json_fragment = response_text[start_idx:end_idx]

                try:
                    return json.loads(json_fragment)
                except json.JSONDecodeError:
                    print(f"🔍 Dashboard: JSON片段也无法解析")

            # 显示响应内容用于调试
            print(f"🔍 Dashboard: 响应文本前500字符:")
            print(f"{response_text[:500]}")

            return None

    except Exception as e:
        print(f"🔍 Dashboard: 回退解析失败: {e}")
        return None

def parse_flight_list_response(response_data):
    """解析FlightListSearchSSE接口的响应数据"""
    try:
        if not isinstance(response_data, dict):
            return []

        flights = []

        # 预处理：创建航空公司代码到名称的映射
        airline_mapping = {
            item.get("code"): item.get("name")
            for item in response_data.get("airlineList", [])
            if item.get("code") and item.get("name")
        }

        # 提取全局信息
        basic_info = response_data.get("basicInfo", {})
        search_currency = basic_info.get("currency", "CNY")
        product_id_for_links = basic_info.get("productId")

        # 获取搜索的目的地城市名称
        search_destination_city_name = None
        search_journeys = basic_info.get("searchCondition", {}).get("searchJourneys", [])
        if search_journeys and isinstance(search_journeys, list) and len(search_journeys) > 0:
            arrive_city_info = search_journeys[0].get("arriveCity", {})
            search_destination_city_name = arrive_city_info.get("name")

        # 遍历行程列表
        itinerary_list = response_data.get("itineraryList", [])

        # 如果没有航班数据，尝试从filterOptionList构造
        if len(itinerary_list) == 0:
            if "filterOptionList" in response_data and response_data["filterOptionList"]:
                filter_options = response_data["filterOptionList"][0]
                if "hotFilters" in filter_options:
                    hot_filters = filter_options["hotFilters"]
                    for hot_filter in hot_filters:
                        if hot_filter.get("type") == "DIRECT":
                            direct_price = hot_filter.get("lowestPrice", 0)
                            if direct_price > 0 and search_journeys:
                                journey = search_journeys[0]
                                depart_city = journey.get("departCity", {})
                                arrive_city = journey.get("arriveCity", {})
                                depart_date = journey.get("departDate", "")

                                # 构建直飞航班的预订链接
                                depart_city_code = depart_city.get("code", "").lower()
                                arrive_city_code = arrive_city.get("code", "").lower()
                                direct_booking_link = f"{base_url}/flights/showfarefirst?dcity={depart_city_code}&acity={arrive_city_code}&ddate={depart_date}&triptype=ow&class=y&quantity=1&nonstoponly=on&locale=zh-HK&curr=CNY"

                                flight_info = {
                                    '目的地': arrive_city.get("name", ""),
                                    '目的地代码': arrive_city.get("code", ""),
                                    '价格': direct_price,
                                    '货币': basic_info.get("currency", "CNY"),
                                    '出发日期': depart_date,
                                    '航空公司': "直飞航班",
                                    '航班号': "查看详情",
                                    '飞行时长': "查看详情",
                                    '出发时间': "查看详情",
                                    '到达时间': "查看详情",
                                    '完整出发时间': "",
                                    '完整到达时间': "",
                                    '中转次数': 0,
                                    '航班详情': f"直飞航班 ¥{direct_price}",
                                    '链接': direct_booking_link
                                }
                                flights.append(flight_info)

        # 处理实际的航班列表
        for idx, itinerary_item in enumerate(itinerary_list):
            try:
                # 定位到单个行程的主要数据结构
                journey = itinerary_item.get("journeyList", [{}])[0]
                policy = itinerary_item.get("policies", [{}])[0]

                # 如果 journey 或 policy 为空字典，则跳过
                if not journey or not policy:
                    continue

                trans_sections = journey.get("transSectionList", [])
                if not trans_sections:
                    continue

                first_segment = trans_sections[0]
                last_segment = trans_sections[-1]

                # 1. 价格和货币
                price_info = policy.get("price", {})
                price = price_info.get("totalPrice", 0)

                # 2. 时间信息
                departure_datetime_str = first_segment.get("departDateTime", "")
                arrival_datetime_str = last_segment.get("arriveDateTime", "")
                departure_date = departure_datetime_str.split(" ")[0] if departure_datetime_str else ""

                # 3. 航班详情
                airline_names = []
                flight_numbers = []
                for segment in trans_sections:
                    flight_info = segment.get("flightInfo", {})
                    airline_code = flight_info.get("airlineCode")
                    flight_no = flight_info.get("flightNo")

                    if airline_code:
                        airline_names.append(airline_mapping.get(airline_code, airline_code))
                    if flight_no:
                        flight_numbers.append(flight_no)

                # 去重航空公司名称
                airline_names = list(dict.fromkeys(airline_names))

                # 计算飞行时长
                total_duration_minutes = journey.get("duration")
                total_duration_readable = ""
                if total_duration_minutes is not None:
                    hours = total_duration_minutes // 60
                    minutes = total_duration_minutes % 60
                    total_duration_readable = f"{hours}h{minutes}m"

                # 目的地信息
                final_arrival_airport_code = last_segment.get("arrivePoint", {}).get("airportCode", "")

                # 4. 链接信息组件
                policy_id_for_links = policy.get("policyId")

                # 构建正确的Trip.com预订链接
                booking_link = ""
                if policy_id_for_links and product_id_for_links:
                    # 使用Trip.com的标准预订链接格式
                    booking_link = f"{base_url}/flights/booking/{policy_id_for_links}?productId={product_id_for_links}"
                elif policy_id_for_links:
                    # 如果只有policyId，使用简化链接
                    booking_link = f"{base_url}/flights/booking/{policy_id_for_links}"
                else:
                    # 如果没有具体的预订ID，构建搜索链接
                    search_journeys = basic_info.get("searchCondition", {}).get("searchJourneys", [])
                    if search_journeys:
                        journey = search_journeys[0]
                        depart_city = journey.get("departCity", {}).get("code", "")
                        arrive_city = journey.get("arriveCity", {}).get("code", "")
                        depart_date = journey.get("departDate", "")
                        if depart_city and arrive_city and depart_date:
                            booking_link = f"{base_url}/flights/showfarefirst?dcity={depart_city.lower()}&acity={arrive_city.lower()}&ddate={depart_date}&triptype=ow&class=y&quantity=1&locale=zh-HK&curr=CNY"

                # 构建我们系统需要的格式 - 优化显示信息
                flight_info = {
                    '目的地': search_destination_city_name or "",
                    '目的地代码': final_arrival_airport_code,
                    '价格': price,
                    '货币': search_currency,
                    '出发时间': departure_datetime_str.split(" ")[1] if " " in departure_datetime_str else departure_datetime_str,
                    '到达时间': arrival_datetime_str.split(" ")[1] if " " in arrival_datetime_str else arrival_datetime_str,
                    '出发日期': departure_date,
                    '航空公司': ", ".join(airline_names) if airline_names else "",
                    '航班号': ", ".join(flight_numbers) if flight_numbers else "",
                    '飞行时长': total_duration_readable,
                    '完整出发时间': departure_datetime_str,  # 添加完整时间信息
                    '完整到达时间': arrival_datetime_str,   # 添加完整时间信息
                    '中转次数': len(trans_sections) - 1,    # 计算中转次数
                    '航班详情': f"{', '.join(airline_names)} {', '.join(flight_numbers)}" if airline_names and flight_numbers else "",
                    '链接': booking_link
                }

                flights.append(flight_info)

            except Exception:
                continue

        print(f"✅ 解析完成: {len(flights)} 个航班")
        return flights

    except Exception as e:
        print(f"❌ 解析响应失败: {e}")
        return []

# ---- 获取指定城市的航班数据 ----
def fetch_flights_for_city(departure_code):
    """获取指定城市的航班数据"""
    try:
        # 根据指定始发地更新payload
        current_payload = update_payload_for_departure(departure_code)

        # 发送POST请求
        print(f"正在获取 {get_city_display_name(departure_code)} 的航班数据...")
        response = requests.post(url, headers=headers, json=current_payload, timeout=30)
        response.raise_for_status()

        # 解析响应内容为JSON
        response_data = response.json()

        # 调用清洗函数
        cleaned_data = clean_flight_data(response_data, base_url)

        # 使用 Pandas 处理数据
        if cleaned_data:
            df = pd.DataFrame(cleaned_data)

            # 筛选境外目的地
            international_df = df[df['国家'] != '中國']

            # 返回前12条记录
            return international_df.head(12).to_dict('records')
        else:
            return []

    except Exception as e:
        print(f"获取 {get_city_display_name(departure_code)} 航班数据失败: {e}")
        raise e

# ---- 从payload提取行程信息 ----
def extract_trip_info_from_payload(current_payload=None):
    """从payload中提取行程信息"""
    # 如果没有提供payload，使用全局payload
    if current_payload is None:
        current_payload = payload

    try:
        # 提取始发地（如果payload中有更新的信息）
        if 'segments' in current_payload and len(current_payload['segments']) > 0:
            if 'dcs' in current_payload['segments'][0] and len(current_payload['segments'][0]['dcs']) > 0:
                departure_code = current_payload['segments'][0]['dcs'][0].get('code')
                if departure_code:
                    app_settings['departure_code'] = departure_code
                    # 根据代码设置城市名称
                    app_settings['departure_city'] = get_city_display_name(departure_code)

        # 提取行程类型（如果payload中有更新的信息）
        if 'tt' in current_payload:
            trip_type_code = current_payload.get('tt')
            if trip_type_code is not None:
                app_settings['trip_type'] = '往返' if trip_type_code == 2 else '单程'

        # 注意：不再从payload中提取日期信息，因为日期应该由环境变量控制
        # 这样可以确保.env文件中的日期配置生效
    except Exception as e:
        print(f"提取行程信息出错: {e}")

# ---- Web服务 ----
def run_web_server():
    """运行Web服务器"""
    # 从环境变量读取服务器配置
    host = os.getenv('SERVER_HOST', '0.0.0.0')
    port = int(os.getenv('SERVER_PORT', '38181'))

    print(f"启动Web服务器，地址: {host}:{port}")

    # 生产环境建议
    external_domain = os.getenv('EXTERNAL_DOMAIN')
    if external_domain:
        print(f"外部访问地址: {'https' if os.getenv('USE_HTTPS', 'false').lower() == 'true' else 'http'}://{external_domain}")

    serve(app, host=host, port=port)

# ---- 启动时推送目的地 ----
def push_destinations_on_startup(flights_data):
    """系统启动时推送目的地信息"""
    if not flights_data:
        print("没有目的地数据可推送")
        return

    # 加载环境变量
    load_dotenv()

    # 检查是否启用PushPlus推送
    enable_pushplus = os.getenv("ENABLE_PUSHPLUS", "true").lower() == "true"
    if not enable_pushplus:
        print("PushPlus推送功能已禁用，跳过推送")
        return

    pushplus_token = os.getenv("PUSHPLUS_TOKEN")
    if not pushplus_token:
        print("未配置PushPlus令牌，无法推送")
        return

    # 获取当前始发地对应的环境变量名
    topic_env_var = pushplus_topic_env_vars.get(app_settings['departure_code'])
    # 从环境变量中读取群组编码
    topic = os.getenv(topic_env_var) if topic_env_var else None

    # 构建简洁的推送标题
    title = f"Ticketradar - {app_settings['departure_city']}推荐{len(flights_data)}个目的地"

    # 准备通知内容数据
    content_data = {
        'message': f"系统已启动，为您推荐{len(flights_data)}个热门境外目的地。",
        'departure_city': app_settings['departure_city'],
        'departure_code': app_settings['departure_code'],  # 添加始发地代码，用于构建特定链接
        'trip_type': app_settings['trip_type'],
        'depart_date': app_settings['depart_date'],
        'flights': flights_data
    }

    # 如果是往返行程，添加返程日期
    if app_settings['trip_type'] == '往返':
        content_data['return_date'] = app_settings['return_date']

    # 生成漂亮的HTML通知内容
    content = generate_beautiful_html_template(title, content_data)

    # 发送推送，使用群组推送
    send_pushplus_notification(pushplus_token, title, content, topic=topic)

# ---- 启动定时任务并推送 ----
def get_all_monitored_cities():
    """获取主循环需要监控的城市（只包含主页的4个城市）"""
    # 主循环只监控主页显示的4个城市
    main_loop_cities = list(homepage_cities.keys())  # ['HKG', 'SZX', 'CAN', 'MFM']
    print(f"主循环监控的城市: {main_loop_cities}")
    return main_loop_cities

def start_monitoring_and_push():
    """启动监控并在首次数据获取后推送，支持多个始发地"""
    # 获取所有需要监控的城市（包括用户任务）
    monitored_cities = get_all_monitored_cities()

    # 立即执行一次main函数，获取所有需要监控的城市数据
    for departure_code in monitored_cities:
        print(f"\n开始获取始发地 {get_city_display_name(departure_code)} 的数据...")
        main(departure_code)

    # 检查是否获取到数据
    if all_flights_data:
        print("首次数据获取完成，推送目的地信息...")
        # 为每个始发地推送数据
        for departure_code, flights in all_flights_data.items():
            if flights:
                departure_city_name = get_city_display_name(departure_code)
                print(f"推送始发地 {departure_city_name} 的数据...")
                # 临时设置当前始发地，以便推送时使用正确的始发地信息
                global current_departure
                temp_departure = current_departure
                current_departure = departure_code
                app_settings['departure_city'] = departure_city_name
                app_settings['departure_code'] = departure_code

                # 推送数据
                push_destinations_on_startup(flights)

                # 恢复当前始发地
                current_departure = temp_departure
                temp_departure_city_name = get_city_display_name(temp_departure)
                app_settings['departure_city'] = temp_departure_city_name
                app_settings['departure_code'] = temp_departure
    else:
        print("首次数据获取未能获得有效数据，无法推送")

    # 设置定时任务，每隔指定时间轮询所有需要监控的城市
    def check_all_departures():
        # 每次执行时重新获取需要监控的城市列表
        current_monitored_cities = get_all_monitored_cities()
        for departure_code in current_monitored_cities:
            main(departure_code)
            # 添加短暂延迟，避免API请求过于频繁
            time.sleep(5)

    schedule.every(app_settings['check_interval']).minutes.do(check_all_departures)
    print(f"已设置每{app_settings['check_interval']}分钟执行一次主循环检测任务，轮询所有始发地")

    # 设置独立的用户监控任务，每7分钟执行一次
    schedule.every(7).minutes.do(check_all_user_monitoring_tasks)
    print("已设置每7分钟执行一次用户监控任务，独立处理个性化推送")

    # 持续运行定时任务
    while True:
        schedule.run_pending()
        time.sleep(1)

# ---- 程序入口 ----
if __name__ == "__main__":
    # 加载环境变量
    load_dotenv()

    # 初始化数据库
    print("🔧 正在初始化数据库...")
    init_database()
    print("✅ 数据库初始化完成")

    # 更新设置
    app_settings['price_threshold'] = float(os.getenv("PRICE_THRESHOLD", "1000"))
    app_settings['check_interval'] = int(os.getenv("CHECK_INTERVAL", "5"))

    # 从.env文件中读取默认始发地
    # 注意：current_departure是全局变量，不需要在这里使用global声明
    # 因为我们不是在函数内部
    current_departure = os.getenv("DEFAULT_DEPARTURE", "HKG")
    # 移除城市列表检查，允许任何3位字母代码
    if len(current_departure) != 3 or not current_departure.isalpha():
        print(f"警告: 默认始发地 {current_departure} 格式无效，使用香港(HKG)作为默认始发地")
        current_departure = "HKG"

    # 设置初始始发地信息
    app_settings['departure_code'] = current_departure
    app_settings['departure_city'] = get_city_display_name(current_departure)

    # 读取行程类型和日期信息
    trip_type_code = int(os.getenv("TRIP_TYPE", "2"))
    app_settings['trip_type'] = '往返' if trip_type_code == 2 else '单程'

    app_settings['depart_date'] = os.getenv("DEPART_DATE", "2025-09-30")
    app_settings['return_date'] = os.getenv("RETURN_DATE", "2025-10-08")

    print(f"默认始发地设置为: {app_settings['departure_city']} ({current_departure})")

    # 确保数据库完全初始化后再启动监控
    print("🚀 启动监控系统...")

    # 启动监控并推送（在后台线程中）
    monitor_thread = threading.Thread(target=start_monitoring_and_push, daemon=True)
    monitor_thread.start()

    # 给监控线程一点时间启动
    time.sleep(2)
    print("✅ 监控系统已启动")

    # 启动Web服务器（在主线程中）
    run_web_server()
