#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
服务器安全更新脚本
保留用户数据，安全更新数据库结构
"""

import os
import sys
import sqlite3
import shutil
import subprocess
from datetime import datetime
from dotenv import load_dotenv

def print_step(step, message):
    """打印步骤信息"""
    print(f"\n{'='*50}")
    print(f"步骤 {step}: {message}")
    print(f"{'='*50}")

def backup_database():
    """备份数据库"""
    print_step(1, "备份现有数据库")
    
    load_dotenv()
    database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketradar.db')
    db_path = database_url.replace('sqlite:///', '')
    
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件不存在: {db_path}")
        return False
    
    # 创建备份文件名
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f"{db_path}.backup_{timestamp}"
    
    try:
        shutil.copy2(db_path, backup_path)
        print(f"✅ 数据库备份成功: {backup_path}")
        return backup_path
    except Exception as e:
        print(f"❌ 数据库备份失败: {e}")
        return False

def check_git_status():
    """检查Git状态"""
    print_step(2, "检查代码更新状态")
    
    try:
        # 检查是否在Git仓库中
        result = subprocess.run(['git', 'status'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ 当前目录不是Git仓库")
            return False
        
        # 检查是否有未提交的更改
        if "nothing to commit" not in result.stdout:
            print("⚠️  检测到未提交的更改:")
            print(result.stdout)
            response = input("是否继续更新？(y/N): ")
            if response.lower() != 'y':
                return False
        
        print("✅ Git状态检查通过")
        return True
        
    except FileNotFoundError:
        print("❌ Git未安装或不在PATH中")
        return False
    except Exception as e:
        print(f"❌ Git状态检查失败: {e}")
        return False

def pull_latest_code():
    """拉取最新代码"""
    print_step(3, "拉取最新代码")
    
    try:
        result = subprocess.run(['git', 'pull', 'origin', 'main'], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ 代码拉取失败: {result.stderr}")
            return False
        
        print("✅ 代码更新成功")
        print(result.stdout)
        return True
        
    except Exception as e:
        print(f"❌ 代码拉取失败: {e}")
        return False

def migrate_database():
    """迁移数据库"""
    print_step(4, "迁移数据库结构")
    
    try:
        # 运行迁移脚本
        result = subprocess.run([sys.executable, 'migrate_blacklist.py'], capture_output=True, text=True)
        print(result.stdout)
        
        if result.returncode != 0:
            print(f"❌ 数据库迁移失败: {result.stderr}")
            return False
        
        print("✅ 数据库迁移成功")
        return True
        
    except Exception as e:
        print(f"❌ 数据库迁移失败: {e}")
        return False

def verify_database():
    """验证数据库结构"""
    print_step(5, "验证数据库结构")
    
    try:
        result = subprocess.run([sys.executable, 'check_db.py'], capture_output=True, text=True)
        print(result.stdout)
        
        if result.returncode != 0:
            print(f"❌ 数据库验证失败: {result.stderr}")
            return False
        
        print("✅ 数据库结构验证通过")
        return True
        
    except Exception as e:
        print(f"❌ 数据库验证失败: {e}")
        return False

def check_user_data():
    """检查用户数据是否保留"""
    print_step(6, "检查用户数据完整性")
    
    load_dotenv()
    database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketradar.db')
    db_path = database_url.replace('sqlite:///', '')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查用户表
        cursor.execute("SELECT COUNT(*) FROM user")
        user_count = cursor.fetchone()[0]
        print(f"👥 用户数量: {user_count}")
        
        # 检查监控任务表
        cursor.execute("SELECT COUNT(*) FROM monitor_tasks")
        task_count = cursor.fetchone()[0]
        print(f"📋 监控任务数量: {task_count}")
        
        # 检查新字段是否存在
        cursor.execute("PRAGMA table_info(monitor_tasks)")
        columns = [row[1] for row in cursor.fetchall()]
        
        has_blacklist_cities = 'blacklist_cities' in columns
        has_blacklist_countries = 'blacklist_countries' in columns
        
        print(f"🚫 黑名单城市字段: {'✅' if has_blacklist_cities else '❌'}")
        print(f"🚫 黑名单国家字段: {'✅' if has_blacklist_countries else '❌'}")
        
        conn.close()
        
        if user_count > 0 and has_blacklist_cities and has_blacklist_countries:
            print("✅ 用户数据完整，新功能已添加")
            return True
        else:
            print("⚠️  数据检查发现问题")
            return False
            
    except Exception as e:
        print(f"❌ 数据检查失败: {e}")
        return False

def main():
    """主更新流程"""
    print("🚀 Ticketradar 服务器安全更新工具")
    print("=" * 50)
    
    # 确认更新
    response = input("确认开始更新？这将保留所有用户数据 (y/N): ")
    if response.lower() != 'y':
        print("❌ 更新已取消")
        return
    
    # 步骤1: 备份数据库
    backup_path = backup_database()
    if not backup_path:
        print("❌ 更新失败：数据库备份失败")
        return
    
    # 步骤2: 检查Git状态
    if not check_git_status():
        print("❌ 更新失败：Git状态检查失败")
        return
    
    # 步骤3: 拉取最新代码
    if not pull_latest_code():
        print("❌ 更新失败：代码拉取失败")
        return
    
    # 步骤4: 迁移数据库
    if not migrate_database():
        print("❌ 更新失败：数据库迁移失败")
        print(f"💡 可以使用备份恢复: cp {backup_path} ticketradar.db")
        return
    
    # 步骤5: 验证数据库
    if not verify_database():
        print("❌ 更新失败：数据库验证失败")
        print(f"💡 可以使用备份恢复: cp {backup_path} ticketradar.db")
        return
    
    # 步骤6: 检查用户数据
    if not check_user_data():
        print("⚠️  更新完成但数据检查发现问题")
        print(f"💡 如有问题可以使用备份恢复: cp {backup_path} ticketradar.db")
    else:
        print("\n🎉 更新完成！")
        print("✅ 所有用户数据已保留")
        print("✅ 新功能已添加")
        print(f"📁 数据库备份: {backup_path}")
        print("\n💡 现在可以重启服务:")
        print("   python main.py")

if __name__ == '__main__':
    main()
