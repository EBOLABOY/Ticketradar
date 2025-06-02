#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Ticketradar 依赖安装脚本
快速安装所有必需的Python依赖包
"""

import sys
import subprocess
import os

# 必需的依赖包
REQUIRED_PACKAGES = [
    "requests>=2.28.0",
    "pandas>=1.5.0",
    "python-dotenv>=1.0.0",
    "schedule>=1.2.0",
    "Flask>=2.2.0",
    "Flask-SQLAlchemy>=3.0.0",
    "Flask-Login>=0.6.0",
    "Flask-CORS>=4.0.0",
    "waitress>=2.1.0"
]

# 验证导入的包映射
IMPORT_MAP = {
    "requests": "requests",
    "pandas": "pandas", 
    "python-dotenv": "dotenv",
    "schedule": "schedule",
    "Flask": "flask",
    "Flask-SQLAlchemy": "flask_sqlalchemy",
    "Flask-Login": "flask_login",
    "Flask-CORS": "flask_cors",
    "waitress": "waitress"
}

def print_header():
    """打印标题"""
    print("📦 Ticketradar 依赖安装脚本")
    print("=" * 50)

def check_python():
    """检查Python环境"""
    print("🐍 检查Python环境...")
    version = sys.version_info
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python版本过低: {version.major}.{version.minor}.{version.micro}")
        print("   需要Python 3.8或更高版本")
        return False
    
    print(f"✅ Python版本: {version.major}.{version.minor}.{version.micro}")
    return True

def upgrade_pip():
    """升级pip"""
    print("⬆️ 升级pip...")
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'
        ], capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ pip升级成功")
            return True
        else:
            print(f"⚠️ pip升级失败: {result.stderr}")
            return False
    except Exception as e:
        print(f"⚠️ pip升级异常: {e}")
        return False

def install_package(package):
    """安装单个包"""
    print(f"  安装 {package}...")
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', package
        ], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print(f"    ✅ 成功")
            return True
        else:
            print(f"    ❌ 失败: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"    ❌ 安装超时")
        return False
    except Exception as e:
        print(f"    ❌ 安装异常: {e}")
        return False

def verify_import(package_name, import_name):
    """验证包导入"""
    print(f"  验证 {package_name}...")
    try:
        result = subprocess.run([
            sys.executable, '-c', f'import {import_name}; print("OK")'
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0 and result.stdout.strip() == "OK":
            print(f"    ✅ 可导入")
            return True
        else:
            print(f"    ❌ 导入失败: {result.stderr}")
            return False
    except Exception as e:
        print(f"    ❌ 导入异常: {e}")
        return False

def main():
    """主函数"""
    print_header()
    
    # 检查Python环境
    if not check_python():
        input("按回车键退出...")
        sys.exit(1)
    
    # 升级pip
    upgrade_pip()
    
    # 安装依赖包
    print("\n📦 安装必需依赖包...")
    failed_packages = []
    
    for package in REQUIRED_PACKAGES:
        if not install_package(package):
            failed_packages.append(package)
    
    # 验证安装
    print("\n🔍 验证安装...")
    verification_failed = []
    
    for package_name, import_name in IMPORT_MAP.items():
        if not verify_import(package_name, import_name):
            verification_failed.append(package_name)
    
    # 显示结果
    print("\n📊 安装结果:")
    print("=" * 50)
    
    if not failed_packages and not verification_failed:
        print("🎉 所有依赖安装成功!")
        print("✅ 系统已准备就绪，可以运行 Ticketradar")
        print("\n🚀 启动命令:")
        print("   python main.py")
        print("   或")
        print("   python start_with_user_system.py")
    else:
        print("⚠️ 部分依赖安装失败")
        
        if failed_packages:
            print("\n❌ 安装失败的包:")
            for pkg in failed_packages:
                print(f"   - {pkg}")
        
        if verification_failed:
            print("\n❌ 验证失败的包:")
            for pkg in verification_failed:
                print(f"   - {pkg}")
        
        print("\n🔧 建议解决方案:")
        print("1. 检查网络连接")
        print("2. 使用国内镜像:")
        print("   python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt")
        print("3. 手动安装失败的包")
        print("4. 运行: python check_dependencies.py")
    
    print("\n📝 其他有用命令:")
    print("   查看已安装包: pip list")
    print("   检查依赖: python check_dependencies.py")
    print("   部署到服务器: python deploy_server.py")
    
    input("\n按回车键退出...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 用户取消操作")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 程序异常: {e}")
        input("按回车键退出...")
        sys.exit(1)
