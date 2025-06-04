#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
服务器安全更新脚本
保留用户数据，安全更新数据库结构
支持Docker环境和新的管理功能
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
    """备份数据库和重要配置文件"""
    print_step(1, "备份现有数据库和配置")

    load_dotenv()

    # 检查数据库位置（优先检查instance目录）
    db_paths = ['instance/ticketradar.db', 'ticketradar.db']
    db_path = None

    for path in db_paths:
        if os.path.exists(path):
            db_path = path
            break

    if not db_path:
        print(f"❌ 数据库文件不存在，检查的路径: {db_paths}")
        return False

    print(f"📍 找到数据库: {db_path}")

    # 创建备份目录
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = f"backup_{timestamp}"
    os.makedirs(backup_dir, exist_ok=True)

    try:
        # 备份数据库
        backup_db_path = os.path.join(backup_dir, 'ticketradar.db')
        shutil.copy2(db_path, backup_db_path)
        print(f"✅ 数据库备份成功: {backup_db_path}")

        # 备份.env文件
        if os.path.exists('.env'):
            shutil.copy2('.env', os.path.join(backup_dir, '.env'))
            print(f"✅ 环境配置备份成功")

        # 备份docker-compose配置
        if os.path.exists('docker-compose.simple.yml'):
            shutil.copy2('docker-compose.simple.yml', os.path.join(backup_dir, 'docker-compose.simple.yml'))
            print(f"✅ Docker配置备份成功")

        return backup_dir
    except Exception as e:
        print(f"❌ 备份失败: {e}")
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

def stop_docker_service():
    """停止Docker服务"""
    print_step(4, "停止当前Docker服务")

    try:
        if os.path.exists('docker-compose.simple.yml'):
            result = subprocess.run(['docker-compose', '-f', 'docker-compose.simple.yml', 'down'],
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Docker服务已停止")
                return True
            else:
                print(f"⚠️  停止服务时出现警告: {result.stderr}")
                return True  # 继续执行，可能服务本来就没运行
        else:
            print("⚠️  未找到docker-compose.simple.yml，跳过Docker服务停止")
            return True
    except Exception as e:
        print(f"⚠️  停止Docker服务失败: {e}")
        return True  # 继续执行

def migrate_database():
    """迁移数据库"""
    print_step(5, "迁移数据库结构")

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

def start_docker_service():
    """启动Docker服务"""
    print_step(6, "重新构建和启动Docker服务")

    try:
        if os.path.exists('docker-compose.simple.yml'):
            # 重新构建镜像
            print("🔨 重新构建Docker镜像...")
            result = subprocess.run(['docker-compose', '-f', 'docker-compose.simple.yml', 'build', '--no-cache'],
                                  capture_output=True, text=True)
            if result.returncode != 0:
                print(f"❌ Docker镜像构建失败: {result.stderr}")
                return False

            # 启动服务
            print("🚀 启动Docker服务...")
            result = subprocess.run(['docker-compose', '-f', 'docker-compose.simple.yml', 'up', '-d'],
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Docker服务已启动")
                return True
            else:
                print(f"❌ Docker服务启动失败: {result.stderr}")
                return False
        else:
            print("⚠️  未找到docker-compose.simple.yml，跳过Docker服务启动")
            return True
    except Exception as e:
        print(f"❌ Docker服务启动失败: {e}")
        return False

def verify_database():
    """验证数据库结构"""
    print_step(7, "验证数据库结构")
    
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
    print_step(8, "检查用户数据完整性")

    # 检查数据库位置（优先检查instance目录）
    db_paths = ['instance/ticketradar.db', 'ticketradar.db']
    db_path = None

    for path in db_paths:
        if os.path.exists(path):
            db_path = path
            break

    if not db_path:
        print(f"❌ 数据库文件不存在")
        return False

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 检查用户表
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"👥 用户数量: {user_count}")

        # 检查邀请码表
        cursor.execute("SELECT COUNT(*) FROM invite_codes")
        invite_count = cursor.fetchone()[0]
        print(f"🎫 邀请码数量: {invite_count}")

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

        # 检查管理员用户
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_admin = 1")
        admin_count = cursor.fetchone()[0]
        print(f"👑 管理员数量: {admin_count}")

        conn.close()

        if user_count > 0 and admin_count > 0:
            print("✅ 用户数据完整，管理功能可用")
            return True
        else:
            print("⚠️  数据检查发现问题")
            return False

    except Exception as e:
        print(f"❌ 数据检查失败: {e}")
        return False

def check_service_status():
    """检查服务运行状态"""
    print_step(9, "检查服务运行状态")

    try:
        if os.path.exists('docker-compose.simple.yml'):
            result = subprocess.run(['docker-compose', '-f', 'docker-compose.simple.yml', 'ps'],
                                  capture_output=True, text=True)
            print(result.stdout)

            if "Up" in result.stdout:
                print("✅ 服务运行正常")

                # 显示最近的日志
                print("\n📋 最近的服务日志:")
                log_result = subprocess.run(['docker-compose', '-f', 'docker-compose.simple.yml', 'logs', '--tail=10'],
                                          capture_output=True, text=True)
                print(log_result.stdout)
                return True
            else:
                print("❌ 服务可能未正常启动")
                return False
        else:
            print("⚠️  未找到docker-compose.simple.yml，无法检查服务状态")
            return True
    except Exception as e:
        print(f"❌ 服务状态检查失败: {e}")
        return False

def main():
    """主更新流程"""
    print("🚀 Ticketradar 服务器安全更新工具 v2.0")
    print("=" * 60)
    print("📋 本次更新内容:")
    print("   - ✅ 邀请码停用功能")
    print("   - ✅ 用户管理功能（暂停/删除用户）")
    print("   - ✅ 优化的管理界面")
    print("   - ✅ 保留所有用户数据和配置")
    print("=" * 60)

    # 确认更新
    response = input("确认开始更新？这将保留所有用户数据 (y/N): ")
    if response.lower() != 'y':
        print("❌ 更新已取消")
        return

    # 步骤1: 备份数据库和配置
    backup_dir = backup_database()
    if not backup_dir:
        print("❌ 更新失败：备份失败")
        return

    # 步骤2: 检查Git状态
    if not check_git_status():
        print("❌ 更新失败：Git状态检查失败")
        return

    # 步骤3: 拉取最新代码
    if not pull_latest_code():
        print("❌ 更新失败：代码拉取失败")
        return

    # 步骤4: 停止Docker服务
    if not stop_docker_service():
        print("⚠️  停止服务时出现问题，但继续更新")

    # 步骤5: 迁移数据库
    if not migrate_database():
        print("❌ 更新失败：数据库迁移失败")
        print(f"💡 可以使用备份恢复: cp {backup_dir}/ticketradar.db instance/ticketradar.db")
        return

    # 步骤6: 启动Docker服务
    if not start_docker_service():
        print("❌ 更新失败：服务启动失败")
        print(f"💡 可以使用备份恢复: cp {backup_dir}/ticketradar.db instance/ticketradar.db")
        return

    # 步骤7: 验证数据库
    if not verify_database():
        print("⚠️  数据库验证出现问题，但服务可能正常")

    # 步骤8: 检查用户数据
    if not check_user_data():
        print("⚠️  用户数据检查发现问题")
        print(f"💡 如有问题可以使用备份恢复: cp {backup_dir}/ticketradar.db instance/ticketradar.db")

    # 步骤9: 检查服务状态
    if not check_service_status():
        print("⚠️  服务状态检查出现问题")

    print("\n🎉 更新完成！")
    print("=" * 60)
    print("✅ 新功能已部署:")
    print("   - 邀请码停用功能")
    print("   - 用户状态管理（暂停/激活）")
    print("   - 用户删除功能")
    print("   - 优化的管理界面")
    print(f"📁 备份文件保存在: {backup_dir}")
    print("🌐 管理后台: https://ticketradar.izlx.me/admin")
    print("=" * 60)

if __name__ == '__main__':
    main()
