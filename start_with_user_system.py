#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Ticketradar 用户系统启动脚本
使用方法：
1. 激活虚拟环境：.\venv\Scripts\activate
2. 安装依赖：pip install -r requirements.txt
3. 运行：python start_with_user_system.py
"""

import os
import sys

def check_dependencies():
    """检查依赖是否安装"""
    try:
        # 尝试运行依赖检查脚本
        import subprocess
        result = subprocess.run([
            sys.executable, 'check_dependencies.py'
        ], capture_output=True, text=True, timeout=60)

        if result.returncode == 0:
            print("✅ 依赖检查通过")
            return True
        else:
            print("❌ 依赖检查失败")
            print(result.stdout)
            print(result.stderr)
            return False

    except Exception as e:
        print(f"⚠️ 无法运行依赖检查脚本: {e}")
        print("尝试基础依赖检查...")

        # 回退到基础检查
        required_packages = [
            ('flask', 'Flask'),
            ('flask_sqlalchemy', 'Flask-SQLAlchemy'),
            ('flask_login', 'Flask-Login'),
            ('flask_cors', 'Flask-CORS'),
            ('requests', 'requests'),
            ('pandas', 'pandas'),
            ('dotenv', 'python-dotenv'),
            ('schedule', 'schedule'),
            ('waitress', 'waitress')
        ]

        missing_packages = []

        for import_name, package_name in required_packages:
            try:
                __import__(import_name)
            except ImportError:
                missing_packages.append(package_name)

        if missing_packages:
            print("❌ 缺少以下依赖包：")
            for pkg in missing_packages:
                print(f"   - {pkg}")
            print("\n请先安装依赖：")
            print("1. 激活虚拟环境：.\\venv\\Scripts\\activate")
            print("2. 安装依赖：pip install -r requirements.txt")
            print("3. 或运行：python check_dependencies.py")
            return False

        print("✅ 基础依赖检查通过")
        return True

def main():
    """主函数"""
    print("🚀 Ticketradar 用户系统启动中...")
    print("=" * 50)

    # 检查依赖
    if not check_dependencies():
        sys.exit(1)

    # 检查.env文件
    if not os.path.exists('.env'):
        print("❌ 未找到.env配置文件")
        print("请确保.env文件存在并包含必要的配置")
        sys.exit(1)

    print("✅ 配置文件检查通过")

    # 导入并启动主程序
    try:
        print("📦 导入主程序模块...")
        import main
        print("✅ 主程序启动成功")
        print("\n🌐 Web服务器运行在: http://localhost:38181")
        print("👤 默认管理员账户: 1242772513@qq.com / 1242772513")
        print("📝 请及时修改默认密码")
        print("\n按 Ctrl+C 停止服务器")
        print("=" * 50)

        # 保持程序运行，等待用户中断
        try:
            while True:
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 服务器已停止")

    except ImportError as e:
        print(f"❌ 导入主程序失败: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
