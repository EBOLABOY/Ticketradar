#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查数据库状态
"""

import sqlite3
import os
from dotenv import load_dotenv

def check_database():
    load_dotenv()
    database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketradar.db')
    db_path = database_url.replace('sqlite:///', '')

    print(f'🔍 检查数据库文件: {db_path}')
    print(f'📁 文件存在: {os.path.exists(db_path)}')

    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查所有表
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f'📋 数据库中的表: {[t[0] for t in tables]}')
        
        # 检查monitor_tasks表
        if ('monitor_tasks',) in tables:
            cursor.execute('PRAGMA table_info(monitor_tasks)')
            columns = cursor.fetchall()
            print(f'✅ monitor_tasks表字段数: {len(columns)}')
            for col in columns:
                print(f'  - {col[1]} ({col[2]})')
                
            # 检查数据
            cursor.execute('SELECT COUNT(*) FROM monitor_tasks')
            count = cursor.fetchone()[0]
            print(f'📊 monitor_tasks表记录数: {count}')
        else:
            print('❌ monitor_tasks表不存在')
        
        conn.close()
    else:
        print('❌ 数据库文件不存在')

if __name__ == '__main__':
    check_database()
