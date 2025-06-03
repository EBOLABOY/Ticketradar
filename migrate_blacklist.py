#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库迁移脚本：添加黑名单字段
"""

import sqlite3
import os
from dotenv import load_dotenv

def migrate_database():
    """为monitor_tasks表添加黑名单字段"""
    
    # 加载环境变量
    load_dotenv()
    
    # 获取数据库路径
    database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketradar.db')
    
    # 提取SQLite数据库文件路径
    if database_url.startswith('sqlite:///'):
        db_path = database_url.replace('sqlite:///', '')
        if db_path.startswith('data/'):
            # 确保data目录存在
            os.makedirs('data', exist_ok=True)
    else:
        print("❌ 只支持SQLite数据库迁移")
        return False
    
    print(f"📁 数据库文件: {db_path}")
    
    try:
        # 连接数据库
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查表是否存在
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='monitor_tasks'
        """)
        
        if not cursor.fetchone():
            print("❌ monitor_tasks表不存在，请先运行主程序创建基础表结构")
            return False
        
        # 检查blacklist_cities字段是否已存在
        cursor.execute("PRAGMA table_info(monitor_tasks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'blacklist_cities' in columns:
            print("✅ blacklist_cities字段已存在")
        else:
            print("➕ 添加blacklist_cities字段...")
            cursor.execute("""
                ALTER TABLE monitor_tasks 
                ADD COLUMN blacklist_cities TEXT
            """)
            print("✅ blacklist_cities字段添加成功")
        
        if 'blacklist_countries' in columns:
            print("✅ blacklist_countries字段已存在")
        else:
            print("➕ 添加blacklist_countries字段...")
            cursor.execute("""
                ALTER TABLE monitor_tasks 
                ADD COLUMN blacklist_countries TEXT
            """)
            print("✅ blacklist_countries字段添加成功")
        
        # 提交更改
        conn.commit()
        
        # 验证字段添加成功
        cursor.execute("PRAGMA table_info(monitor_tasks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print(f"\n📋 当前monitor_tasks表字段:")
        for i, column in enumerate(columns, 1):
            print(f"  {i:2d}. {column}")
        
        if 'blacklist_cities' in columns and 'blacklist_countries' in columns:
            print("\n🎉 数据库迁移成功！黑名单字段已添加")
            return True
        else:
            print("\n❌ 数据库迁移失败！字段添加不完整")
            return False
            
    except sqlite3.Error as e:
        print(f"❌ 数据库操作失败: {e}")
        return False
    
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    print("🔧 开始数据库迁移...")
    success = migrate_database()
    
    if success:
        print("\n✅ 迁移完成！现在可以启动主程序了")
        print("💡 运行命令: python main.py")
    else:
        print("\n❌ 迁移失败！请检查错误信息")
