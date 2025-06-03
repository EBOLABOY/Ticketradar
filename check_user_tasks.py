#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查用户监控任务
"""

import sqlite3
import os
from dotenv import load_dotenv

def check_user_tasks():
    load_dotenv()
    database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketradar.db')

    # 强制使用instance目录中的数据库，与Flask应用保持一致
    if database_url.startswith('sqlite:///'):
        db_filename = database_url.replace('sqlite:///', '')
        db_path = os.path.join('instance', db_filename)
        print(f"🔍 使用数据库: {db_path}")
    else:
        db_path = database_url

    if not os.path.exists(db_path):
        print(f"❌ 数据库文件不存在: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 查询所有监控任务
    cursor.execute('''
        SELECT id, name, departure_city, destination_city, price_threshold,
               pushplus_token, blacklist_cities, blacklist_countries, is_active
        FROM monitor_tasks
        ORDER BY id DESC
    ''')

    tasks = cursor.fetchall()
    print(f'📋 共有 {len(tasks)} 个监控任务:')

    for task in tasks:
        task_id, name, dep, dest, threshold, token, bl_cities, bl_countries, active = task
        print(f'\n  🎯 任务 ID {task_id}: {name}')
        print(f'    📍 路线: {dep} → {dest or "所有目的地"}')
        print(f'    💰 价格阈值: ¥{threshold}')
        print(f'    🔑 PushPlus令牌: {"✅ 已设置" if token else "❌ 未设置"}')
        print(f'    🚫 黑名单城市: {bl_cities or "无"}')
        print(f'    🚫 黑名单国家: {bl_countries or "无"}')
        print(f'    📊 状态: {"✅ 活跃" if active else "❌ 禁用"}')

        # 检查推送条件
        if not active:
            print(f'    ⚠️ 任务已禁用，不会执行监控')
        elif not token:
            print(f'    ⚠️ 未设置PushPlus令牌，不会发送推送')
        else:
            print(f'    ✅ 满足推送条件')

    conn.close()

if __name__ == '__main__':
    check_user_tasks()
