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
from flask import Flask, render_template, jsonify, request
from waitress import serve

# 1. 请求 URL
url = "https://hk.trip.com/restapi/soa2/19728/fuzzySearch"
base_url = "https://hk.trip.com" # 定义基础网址，用于拼接跳转链接

# 2. 请求头 (Request Headers) - 注意：Cookie 和其他动态值可能需要更新
headers = {
    'accept': '*/*',
    'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,en-GB;q=0.6',
    'content-type': 'application/json',
    # --- 警告：下面的 Cookie 非常长，且极有可能过期或失效 ---
    'cookie': 'Union=AllianceID=1079381&SID=2043339&OUID=ctag.hash.nwfme5hcv7n6&Expires=1749300305922&createtime=1746708305; _abtest_userid=5b8f2403-9ac5-450a-a6f0-41afa99dda5e; UBT_VID=1746708309569.1d384rgx2qT7; ubtc_trip_pwa=0; _gcl_au=1.1.381608091.1746708313; _fwb=99MHsWgE3ATJbQfCXhE6N7.1746708312920; _tt_enable_cookie=1; _ttp=01JTQYVDDFN89MG1TD7HPN2PAA_.tt.1; _RF1=154.19.184.12; _RSG=hvqFn0LYdBA6ebDB66lhGB; _RDG=28cda73c85c5fa244e24575cd692d19421; _RGUID=a2e78950-313f-4e6b-b42b-bc618b365a06; GUID=09034129218004024014; GUID.sig=Io10lN9GSo-8OOcwKdXKsFQc1EC8YHbiK1p5NUbUfcI; ibulanguage=HK; ibulocale=zh_hk; ibu_country=HK; _fwb=99MHsWgE3ATJbQfCXhE6N7.1746708312920; IBU_FLIGHT_LIST_STYLE=Separate; cookiePricesDisplayed=CNY; _gid=GA1.2.715444595.1746709098; _fbp=fb.1.1746709098820.431379395469181287; adid=174670909955958; ibu_h5_site=HK; ibu_h5_group=trip; ibu_h5_curr=CNY; bm_so=0AB1E950D1A51B97700924D7D46F44E11CE676D5C61F0BDBFCEA780CF12689B3~YAAQL/EPF3TfUa2WAQAArfX/rwOkqE5ay+iXzlOEB3wTrgYgxP06WTGRZAUmhxsp+3v0UoLAVzRPKciM0QJGYYnJQZSuRQNeDqnhp72d96qwqDQbet/b/IC0oTFvi4SAeZfyt4nfjmuWaptHAzfgZe+X7LSkQpCeQ58Z351sqKnMwADvQeFpUd3a7LXZQ87qXyinOV8Uec7jaqo/52paY8+hmM3xojbQUXUbPl8YSZXW+gHBlJvIeUiM/cWhDql4KtRLlFwbUZUrzAG7LhQZnkeyltOy5SUi30FHFesKWWysIzH+gtqLBQpJlhLcbMyRjxUFAGvXRZIXs5Lk6l7IxIjyOKRN1KILz1JS6OmdaoFta7owS8r11DKRjznQeAmUEiptYWEnu9ISx2y0/KurHQ9SaqBUjb6fCap4kMY+mKnhef+sNqx5PNz7EE5zH14JPmMoOGIflTaqOLWn; bm_lso=0AB1E950D1A51B97700924D7D46F44E11CE676D5C61F0BDBFCEA780CF12689B3~YAAQL/EPF3TfUa2WAQAArfX/rwOkqE5ay+iXzlOEB3wTrgYgxP06WTGRZAUmhxsp+3v0UoLAVzRPKciM0QJGYYnJQZSuRQNeDqnhp72d96qwqDQbet/b/IC0oTFvi4SAeZfyt4nfjmuWaptHAzfgZe+X7LSkQpCeQ58Z351sqKnMwADvQeFpUd3a7LXZQ87qXyinOV8Uec7jaqo/22paY8+hmM3xojbQUXUbPl8YSZXW+gHBlJvIeUiM/cWhDql4KtRLlFwbUZUrzAG7LhQZnkeyltOy5SUi30FHFesKWWysIzH+gtqLBQpJlhLcbMyRjxUFAGvXRZIXs5Lk6l7IxIjyOKRN1KILz1JS6OmdaoFta7owS8r11DKRjznQeAmUEiptYWEnu9ISx2y0/KurHQ9SaqBUjb6fCap4kMY+mKnhef+sNqx5PNz7EE5zH14JPmMoOGIflTaqOLWn^1746709527100; _uetsid=1d2794702c0c11f08f457fb9c035cd0f; _uetvid=1d27d5802c0c11f098d07dc253b45eb4; _ga_2DCSB93KS4=GS2.2.s1746709098$o1$g1$t1746709550$j25$l0$h0; ibu_h5_local=zh-hk; ibu_h5_local=zh-hk; ibu_h5_lang=hk; ibu_online_jump_site_result={"site_url":[],"suggestion":[]}; ibu_online_home_language_match={"isRedirect":false,"isShowSuggestion":false,"lastVisited":true,"region":"us","redirectSymbol":false}; trip_test_cookie=1; _ga=GA1.1.1926436688.1746708314; _ga_37RNVFDP1J=GS2.2.s1746709820$o1$g0$t1746709820$j60$l0$h0; _tp_search_latest_channel_name=flights; bm_s=YAAQRfEPF3AE83yWAQAAcDQFsAPXxJuBnvstTNslLwAmiTmDH6ho2aSnOMaCVBjaH31lfohN1vnehuQdHOjnD4zBSKekcVp01de9zz+vzwE0WqnFshSJmcoYk1nsAYfpsqfY+kwUyRRKEgD/qs5CkGgc/8gD0bXHkubC1CcaXXCPeuBLjI3yl73Yz+cu+aqUOq6E2iwiC8W3ssgSTN+6krSPIH/K2RHFbyzN96FLlZqHWwZRFvCGkUNICumAcvbOLujsPs8eVCmAgla2RqNomHQsqPqwpucIekCUJvBfadPPVbELRegrfK9qvcXBAov3dEveXFACElgGQms+ckmNZCHKPadJR8ppOWR7y5H6qug/Is8w9wTUnhcgz3ZhOl8HjU31Lp/vN01AEMvp8BmTQUL6+keXkU4Kep0zngNb+wksLxYmxwH4ohW+b69q/a4/uAwRbed5BH32a7OcNbHKsv3dP5tT6qERPW3RXn25iWqDQiUWpuPjpb5PuVMzvFCFW2BAwhKYpte1q7fGsUkQ/GNvGvC7uCmGV+/r7857k3BTxf8L9I7tfY/ZMDTvz3kQ/5G/QA7hymnEEMc=; _combined=transactionId%3D1-mf-20250508210512456-WEB%26pageId%3D10650034306%26initPageId%3D10320667453; __utma=1.1926436688.1746708314.1746710690.1746710690.1; __utmc=1; __utmz=1.1746710690.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); nfes_isSupportWebP=1; _pd=%7B%22_o%22%3A2%2C%22s%22%3A11%2C%22_s%22%3A1%7D; logoutFlag=true; _bfa=1.1746708309569.1d384rgx2qT7.1.1746710717100.1746710726288.1.40.10650034306; wcs_bt=s_33fb334966e9:1746710726; _ga_X437DZ73MR=GS2.1.s1746708313$o1$g1$t1746710727$j47$l0$h0; ttcsid=1746708313524::PJ7hunQvAgqJ0G7tqTWu.1.1746710727593; cto_bundle=iBPVk19MNXgybkJCQVB3QSUyQmt1dVBKOXRmbzVSSiUyRmZkMFczZ3RsNGMxV1hGV0RLbVNKJTJCRUIlMkIwNlJmRHpUcVc5d1ZNWmFPYmFZVzZ3JTJGbFFCQ21FNExKYkt6MERiZ1JzMExmeXlsUVdCa25RTmZqZDhBTG5hMW51TWxpY3RVaVhNN0xNZmV1bTEzQkJIcVNrbDlUJTJCMyUyQllHUFJFUSUzRCUzRA; ttcsid_CIR4RVBC77UD5V58BBNG=1746708313524::o2kONJ7ykUh6OzyxO2OO.1.1746710727907',
    'origin': 'https://hk.trip.com',
    'referer': 'https://hk.trip.com/flights/explore?dcity=hkg&ddate=2025-05-30&rdate=2025-06-02&triptype=rt&class=y&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-HK&curr=CNY',
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
    'x-ctx-ubt-pageid': '10650034306', # 这个值也可能需要更新
    'x-ctx-ubt-pvid': '40',           # 这个值也可能需要更新
    'x-ctx-ubt-sid': '1',             # 这个值也可能需要更新
    'x-ctx-ubt-vid': '1746708309569.1d384rgx2qT7' # 这个值也可能需要更新
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
      "drl": [ { "begin": "2025-05-30", "end": "2025-05-30" } ],
      "rdrl": [ { "begin": "2025-06-02", "end": "2025-06-02" } ]
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
                'is_international': is_international  # 添加国际航线标记
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
        print(f"开始发送请求，始发地: {departure_cities.get(current_departure, current_departure)}...")
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
                            'departure_city': departure_cities[current_departure],
                            'departure_code': current_departure,  # 添加始发地代码，用于构建特定链接
                            'trip_type': app_settings['trip_type'],
                            'depart_date': app_settings['depart_date'],
                            'flights': flights_to_notify
                        }

                        # 如果是往返行程，添加返程日期
                        if app_settings['trip_type'] == '往返':
                            content_data['return_date'] = app_settings['return_date']

                        # 构建简洁的标题
                        title = f"Ticketradar - {departure_cities[current_departure]}发现{len(flights_to_notify)}个低价机票"

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
                        title = f"[Ticketradar] {departure_cities[current_departure]}出发 - 发现{len(flights_to_notify)}个低价境外机票"

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
last_update_time = None
flights_data = []  # 当前选中始发地的航班数据
all_flights_data = {}  # 存储所有始发地的航班数据，格式: {'HKG': [...], 'CAN': [...], 'SZX': [...]}
current_departure = None  # 当前选中的始发地，将在程序启动时从环境变量中读取
first_run_completed = False  # 标记第一次运行是否完成

# 始发地映射表
departure_cities = {
    'HKG': '香港',
    'CAN': '广州',
    'SZX': '深圳'
}

# 始发地对应的PushPlus群组编码变量名映射
pushplus_topic_env_vars = {
    'HKG': 'PUSHPLUS_TOPIC_HKG',  # 香港始发地对应的环境变量
    'CAN': 'PUSHPLUS_TOPIC_CAN',  # 广州始发地对应的环境变量
    'SZX': 'PUSHPLUS_TOPIC_SZX'   # 深圳始发地对应的环境变量
}

app_settings = {
    'price_threshold': 1000,
    'check_interval': 5,
    'notification_method': 'PushPlus',
    'departure_city': '香港',
    'departure_code': 'HKG',
    'trip_type': '往返',
    'depart_date': '2025-05-30',
    'return_date': '2025-06-02'
}
app_stats = {
    'HKG': {'total': 0, 'low_price': 0, 'min_price': 0},
    'CAN': {'total': 0, 'low_price': 0, 'min_price': 0},
    'SZX': {'total': 0, 'low_price': 0, 'min_price': 0}
}

# ---- Web路由 ----
@app.route('/')
@app.route('/<departure_code>')
def index(departure_code=None):
    """Web首页，支持选择不同始发地"""
    global last_update_time, flights_data, app_settings, app_stats, current_departure, all_flights_data

    # 如果指定了始发地，且是有效的始发地代码，则切换到该始发地
    if departure_code and departure_code in departure_cities:
        current_departure = departure_code
        app_settings['departure_code'] = departure_code
        app_settings['departure_city'] = departure_cities[departure_code]

        # 如果已经有该始发地的数据，则使用该数据
        if departure_code in all_flights_data:
            flights_data = all_flights_data[departure_code]

    # 如果没有当前始发地的数据，显示空数据
    if not flights_data:
        # 不再从CSV文件加载数据
        print(f"当前始发地 {departure_cities.get(current_departure, current_departure)} 没有数据，等待下次API请求更新。")

    # 确保当前始发地在app_stats中存在
    if current_departure not in app_stats:
        app_stats[current_departure] = {'total': 0, 'low_price': 0, 'min_price': 0}

    # 定义各始发地的二维码URL
    qr_codes = {
        'HKG': 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQEe8DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAya1BHWEVwMDVjWEQxcEtFNU5FY3kAAgRuGx5oAwQAjScA',
        'CAN': 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQF48DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyTnhYTUYtMDVjWEQxcGlFNU5FY04AAgRSGx5oAwQAjScA',
        'SZX': 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQGe8DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyUzlJVkZqMDVjWEQxbFBHNmhFY0gAAgRz3R5oAwQAjScA'
    }

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
    return jsonify(flights_data)

@app.route('/show_qr')
def show_qr():
    """显示二维码页面，用于在微信中长按识别"""
    # 这个路由主要是提供一个专门的页面来显示二维码
    # 实际的二维码URL会通过URL参数传递给qr_code_display_page.html
    return render_template('qr_code_display_page.html')

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

    # 更新对应始发地的统计信息
    app_stats[departure_code]['total'] = len(international_full_df)
    app_stats[departure_code]['low_price'] = len(international_full_df[international_full_df['价格'] < app_settings['price_threshold']])
    app_stats[departure_code]['min_price'] = international_full_df['价格'].min() if not international_full_df.empty else 0

    # 不再保存CSV文件

    print(f"Web数据已更新，始发地: {departure_cities.get(departure_code, departure_code)}，展示了{len(flight_records)}条Top境外记录，总境外目的地共{app_stats[departure_code]['total']}条")

# ---- 根据始发地更新payload ----
def update_payload_for_departure(departure_code):
    """根据始发地更新payload"""
    # 复制原始payload
    updated_payload = copy.deepcopy(payload)

    # 更新始发地
    if 'segments' in updated_payload and len(updated_payload['segments']) > 0:
        if 'dcs' in updated_payload['segments'][0] and len(updated_payload['segments'][0]['dcs']) > 0:
            updated_payload['segments'][0]['dcs'][0]['code'] = departure_code

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
                    app_settings['departure_city'] = departure_cities.get(departure_code, departure_code)

        # 提取行程类型（如果payload中有更新的信息）
        if 'tt' in current_payload:
            trip_type_code = current_payload.get('tt')
            if trip_type_code is not None:
                app_settings['trip_type'] = '往返' if trip_type_code == 2 else '单程'

        # 提取日期（如果payload中有更新的信息）
        if 'segments' in current_payload and len(current_payload['segments']) > 0:
            if 'drl' in current_payload['segments'][0] and len(current_payload['segments'][0]['drl']) > 0:
                depart_date = current_payload['segments'][0]['drl'][0].get('begin')
                if depart_date:
                    app_settings['depart_date'] = depart_date
            if 'rdrl' in current_payload['segments'][0] and len(current_payload['segments'][0]['rdrl']) > 0:
                return_date = current_payload['segments'][0]['rdrl'][0].get('begin')
                if return_date:
                    app_settings['return_date'] = return_date
    except Exception as e:
        print(f"提取行程信息出错: {e}")

# ---- Web服务 ----
def run_web_server():
    """运行Web服务器"""
    print(f"启动Web服务器，端口: 38181")
    serve(app, host='0.0.0.0', port=38181)

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
def start_monitoring_and_push():
    """启动监控并在首次数据获取后推送，支持多个始发地"""
    # 获取所有始发地
    all_departures = list(departure_cities.keys())

    # 立即执行一次main函数，获取所有始发地的数据
    for departure_code in all_departures:
        print(f"\n开始获取始发地 {departure_cities[departure_code]} 的数据...")
        main(departure_code)

    # 检查是否获取到数据
    if all_flights_data:
        print("首次数据获取完成，推送目的地信息...")
        # 为每个始发地推送数据
        for departure_code, flights in all_flights_data.items():
            if flights:
                print(f"推送始发地 {departure_cities[departure_code]} 的数据...")
                # 临时设置当前始发地，以便推送时使用正确的始发地信息
                global current_departure
                temp_departure = current_departure
                current_departure = departure_code
                app_settings['departure_city'] = departure_cities[departure_code]
                app_settings['departure_code'] = departure_code

                # 推送数据
                push_destinations_on_startup(flights)

                # 恢复当前始发地
                current_departure = temp_departure
                app_settings['departure_city'] = departure_cities[temp_departure]
                app_settings['departure_code'] = temp_departure
    else:
        print("首次数据获取未能获得有效数据，无法推送")

    # 设置定时任务，每隔指定时间轮询所有始发地
    def check_all_departures():
        for departure_code in all_departures:
            main(departure_code)
            # 添加短暂延迟，避免API请求过于频繁
            time.sleep(5)

    schedule.every(app_settings['check_interval']).minutes.do(check_all_departures)
    print(f"已设置每{app_settings['check_interval']}分钟执行一次检测任务，轮询所有始发地")

    # 持续运行定时任务
    while True:
        schedule.run_pending()
        time.sleep(1)

# ---- 程序入口 ----
if __name__ == "__main__":
    # 加载环境变量
    load_dotenv()

    # 更新设置
    app_settings['price_threshold'] = float(os.getenv("PRICE_THRESHOLD", "1000"))
    app_settings['check_interval'] = int(os.getenv("CHECK_INTERVAL", "5"))

    # 从.env文件中读取默认始发地
    # 注意：current_departure是全局变量，不需要在这里使用global声明
    # 因为我们不是在函数内部
    current_departure = os.getenv("DEFAULT_DEPARTURE", "HKG")
    if current_departure not in departure_cities:
        print(f"警告: 默认始发地 {current_departure} 无效，使用香港(HKG)作为默认始发地")
        current_departure = "HKG"

    # 设置初始始发地信息
    app_settings['departure_code'] = current_departure
    app_settings['departure_city'] = departure_cities[current_departure]

    # 读取行程类型和日期信息
    trip_type_code = int(os.getenv("TRIP_TYPE", "2"))
    app_settings['trip_type'] = '往返' if trip_type_code == 2 else '单程'

    app_settings['depart_date'] = os.getenv("DEPART_DATE", "2025-05-30")
    app_settings['return_date'] = os.getenv("RETURN_DATE", "2025-06-02")

    print(f"默认始发地设置为: {app_settings['departure_city']} ({current_departure})")

    # 启动Web服务器（在新线程中）
    web_thread = threading.Thread(target=run_web_server, daemon=True)
    web_thread.start()

    # 启动监控并推送（在主线程中）
    start_monitoring_and_push()
