#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复数据库问题 - 手动创建表结构
"""

import sqlite3
import os
from dotenv import load_dotenv

def fix_database():
    """手动创建数据库表结构"""
    
    # 加载环境变量
    load_dotenv()
    
    # 获取数据库路径
    database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketradar.db')
    db_path = database_url.replace('sqlite:///', '')
    
    print(f"🔧 修复数据库: {db_path}")
    
    # 确保目录存在
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        print(f"📁 创建目录: {db_dir}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查现有表
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        existing_tables = [row[0] for row in cursor.fetchall()]
        print(f"📋 现有表: {existing_tables}")
        
        # 创建用户表
        if 'user' not in existing_tables:
            print("➕ 创建用户表...")
            cursor.execute('''
                CREATE TABLE user (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(80) UNIQUE NOT NULL,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    is_admin BOOLEAN DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            print("✅ 用户表创建成功")
        
        # 创建监控任务表（包含黑名单字段）
        if 'monitor_tasks' not in existing_tables:
            print("➕ 创建监控任务表...")
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
                    FOREIGN KEY (user_id) REFERENCES user (id)
                )
            ''')
            print("✅ 监控任务表创建成功")
        else:
            # 检查是否需要添加黑名单字段
            cursor.execute("PRAGMA table_info(monitor_tasks)")
            columns = [row[1] for row in cursor.fetchall()]
            
            if 'blacklist_cities' not in columns:
                print("➕ 添加blacklist_cities字段...")
                cursor.execute("ALTER TABLE monitor_tasks ADD COLUMN blacklist_cities TEXT")
                print("✅ blacklist_cities字段添加成功")
            
            if 'blacklist_countries' not in columns:
                print("➕ 添加blacklist_countries字段...")
                cursor.execute("ALTER TABLE monitor_tasks ADD COLUMN blacklist_countries TEXT")
                print("✅ blacklist_countries字段添加成功")
        
        # 创建默认管理员用户
        cursor.execute("SELECT COUNT(*) FROM user WHERE is_admin = 1")
        admin_count = cursor.fetchone()[0]
        
        if admin_count == 0:
            print("➕ 创建默认管理员用户...")
            from werkzeug.security import generate_password_hash
            
            cursor.execute('''
                INSERT INTO user (username, email, password_hash, is_admin, is_active)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                '1242772513@qq.com',
                '1242772513@qq.com', 
                generate_password_hash('1242772513'),
                1,
                1
            ))
            print("✅ 默认管理员用户创建成功")
            print("   用户名: 1242772513@qq.com")
            print("   密码: 1242772513")
        
        # 提交所有更改
        conn.commit()
        
        # 验证表结构
        print("\n📊 最终表结构验证:")
        
        # 检查用户表
        cursor.execute("SELECT COUNT(*) FROM user")
        user_count = cursor.fetchone()[0]
        print(f"   用户表: {user_count} 个用户")
        
        # 检查监控任务表
        cursor.execute("SELECT COUNT(*) FROM monitor_tasks")
        task_count = cursor.fetchone()[0]
        print(f"   监控任务表: {task_count} 个任务")
        
        # 检查监控任务表字段
        cursor.execute("PRAGMA table_info(monitor_tasks)")
        columns = cursor.fetchall()
        print(f"   监控任务表字段 ({len(columns)}个):")
        for i, (cid, name, type_, notnull, default, pk) in enumerate(columns, 1):
            print(f"     {i:2d}. {name:<20} {type_:<10}")
        
        conn.close()
        
        print(f"\n🎉 数据库修复完成！")
        print(f"📁 数据库文件: {db_path}")
        return True
        
    except Exception as e:
        print(f"❌ 数据库修复失败: {e}")
        return False

if __name__ == '__main__':
    print("🔧 开始修复数据库...")
    success = fix_database()
    
    if success:
        print("\n✅ 数据库修复成功！现在可以启动主程序了")
        print("💡 运行命令: python main.py")
    else:
        print("\n❌ 数据库修复失败！请检查错误信息")
