#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
服务器数据库安全迁移脚本
保留现有用户数据，添加新的表结构和字段
"""

import sqlite3
import os
import shutil
from datetime import datetime

def backup_database(db_path):
    """备份现有数据库"""
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件不存在: {db_path}")
        return None
    
    backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(db_path, backup_path)
    print(f"✅ 数据库已备份到: {backup_path}")
    return backup_path

def check_table_exists(cursor, table_name):
    """检查表是否存在"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
    return cursor.fetchone() is not None

def check_column_exists(cursor, table_name, column_name):
    """检查列是否存在"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return column_name in columns

def migrate_database(db_path):
    """执行数据库迁移"""
    print(f"🔧 开始迁移数据库: {db_path}")
    
    # 备份数据库
    backup_path = backup_database(db_path)
    if not backup_path:
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查并创建monitor_tasks表
        if not check_table_exists(cursor, 'monitor_tasks'):
            print("➕ 创建monitor_tasks表...")
            cursor.execute('''
                CREATE TABLE monitor_tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    departure_city VARCHAR(10) NOT NULL,
                    departure_code VARCHAR(10) NOT NULL,
                    destination_city VARCHAR(10),
                    depart_date DATE NOT NULL,
                    return_date DATE,
                    trip_type VARCHAR(20) DEFAULT 'one_way',
                    price_threshold FLOAT DEFAULT 1000.0,
                    pushplus_token VARCHAR(255),
                    blacklist_cities TEXT,
                    blacklist_countries TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_check DATETIME,
                    last_notification DATETIME,
                    total_checks INTEGER DEFAULT 0,
                    total_notifications INTEGER DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            print("✅ monitor_tasks表创建成功")
        else:
            print("✅ monitor_tasks表已存在")
            
            # 检查并添加缺失的列
            missing_columns = []
            required_columns = [
                ('blacklist_cities', 'TEXT'),
                ('blacklist_countries', 'TEXT'),
                ('last_check', 'DATETIME'),
                ('last_notification', 'DATETIME'),
                ('total_checks', 'INTEGER DEFAULT 0'),
                ('total_notifications', 'INTEGER DEFAULT 0')
            ]
            
            for column_name, column_type in required_columns:
                if not check_column_exists(cursor, 'monitor_tasks', column_name):
                    missing_columns.append((column_name, column_type))
            
            if missing_columns:
                print(f"➕ 添加缺失的列: {[col[0] for col in missing_columns]}")
                for column_name, column_type in missing_columns:
                    cursor.execute(f'ALTER TABLE monitor_tasks ADD COLUMN {column_name} {column_type}')
                    print(f"   ✅ 添加列: {column_name}")
            else:
                print("✅ monitor_tasks表结构完整")
        
        # 检查并创建invitation_codes表
        if not check_table_exists(cursor, 'invitation_codes'):
            print("➕ 创建invitation_codes表...")
            cursor.execute('''
                CREATE TABLE invitation_codes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    code VARCHAR(50) UNIQUE NOT NULL,
                    created_by INTEGER NOT NULL,
                    used_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    used_at DATETIME,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY (created_by) REFERENCES users (id),
                    FOREIGN KEY (used_by) REFERENCES users (id)
                )
            ''')
            print("✅ invitation_codes表创建成功")
        else:
            print("✅ invitation_codes表已存在")
        
        # 检查users表是否需要添加新字段
        if check_table_exists(cursor, 'users'):
            user_columns = [
                ('is_admin', 'BOOLEAN DEFAULT 0'),
                ('is_active', 'BOOLEAN DEFAULT 1'),
                ('created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP'),
                ('last_login', 'DATETIME')
            ]
            
            missing_user_columns = []
            for column_name, column_type in user_columns:
                if not check_column_exists(cursor, 'users', column_name):
                    missing_user_columns.append((column_name, column_type))
            
            if missing_user_columns:
                print(f"➕ 为users表添加缺失的列: {[col[0] for col in missing_user_columns]}")
                for column_name, column_type in missing_user_columns:
                    cursor.execute(f'ALTER TABLE users ADD COLUMN {column_name} {column_type}')
                    print(f"   ✅ 添加列: {column_name}")
            else:
                print("✅ users表结构完整")
        
        # 提交更改
        conn.commit()
        conn.close()
        
        print("🎉 数据库迁移完成！")
        print(f"📁 备份文件: {backup_path}")
        return True
        
    except Exception as e:
        print(f"❌ 迁移失败: {e}")
        print(f"💡 可以从备份恢复: {backup_path}")
        return False

def main():
    """主函数"""
    print("🚀 Ticketradar 服务器数据库迁移工具")
    print("=" * 50)
    
    # 检查数据库文件
    db_paths = [
        'ticketradar.db',
        'instance/ticketradar.db'
    ]
    
    found_db = None
    for db_path in db_paths:
        if os.path.exists(db_path):
            found_db = db_path
            break
    
    if not found_db:
        print("❌ 未找到数据库文件")
        print("💡 请确保在正确的目录中运行此脚本")
        return
    
    print(f"📊 找到数据库: {found_db}")
    
    # 执行迁移
    success = migrate_database(found_db)
    
    if success:
        print("\n✅ 迁移成功！现在可以安全地更新代码了")
        print("💡 建议步骤:")
        print("   1. git pull origin main")
        print("   2. docker-compose down")
        print("   3. docker-compose up -d")
    else:
        print("\n❌ 迁移失败！请检查错误信息")

if __name__ == '__main__':
    main()
