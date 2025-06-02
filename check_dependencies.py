#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Ticketradar 依赖检查和安装脚本
检查所有必需的Python包是否已安装，并提供安装建议
"""

import sys
import subprocess
import importlib

# 必需的依赖包
REQUIRED_PACKAGES = {
    'requests': '2.28.0',
    'pandas': '1.5.0',
    'python-dotenv': '1.0.0',
    'schedule': '1.2.0',
    'Flask': '2.2.0',
    'Flask-SQLAlchemy': '3.0.0',
    'Flask-Login': '0.6.0',
    'Flask-CORS': '4.0.0',
    'waitress': '2.1.0'
}

# 可选依赖包
OPTIONAL_PACKAGES = {
    'pywin32': '306'  # 仅Windows系统需要，用于Windows服务
}

def check_python_version() -> bool:
    """检查Python版本"""
    print("🐍 检查Python版本...")
    version = sys.version_info

    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python版本过低: {version.major}.{version.minor}.{version.micro}")
        print("   需要Python 3.8或更高版本")
        return False

    print(f"✅ Python版本: {version.major}.{version.minor}.{version.micro}")
    return True

def check_package(package_name: str, min_version: str = None):
    """检查单个包是否已安装"""
    try:
        # 尝试导入包
        if package_name == 'python-dotenv':
            import dotenv
            installed_version = getattr(dotenv, '__version__', 'unknown')
        elif package_name == 'Flask-SQLAlchemy':
            import flask_sqlalchemy
            installed_version = getattr(flask_sqlalchemy, '__version__', 'unknown')
        elif package_name == 'Flask-Login':
            import flask_login
            installed_version = getattr(flask_login, '__version__', 'unknown')
        elif package_name == 'Flask-CORS':
            import flask_cors
            installed_version = getattr(flask_cors, '__version__', 'unknown')
        else:
            module = importlib.import_module(package_name.lower().replace('-', '_'))
            installed_version = getattr(module, '__version__', 'unknown')

        # 简化版本检查（不使用packaging）
        if min_version and installed_version != 'unknown':
            try:
                # 简单的版本比较（仅适用于标准版本号）
                installed_parts = [int(x) for x in installed_version.split('.')]
                required_parts = [int(x) for x in min_version.split('.')]

                # 补齐版本号长度
                max_len = max(len(installed_parts), len(required_parts))
                installed_parts.extend([0] * (max_len - len(installed_parts)))
                required_parts.extend([0] * (max_len - len(required_parts)))

                if installed_parts < required_parts:
                    return False, f"版本过低: {installed_version} < {min_version}"
            except (ValueError, AttributeError):
                # 版本号格式不标准，跳过版本检查
                pass

        return True, installed_version

    except ImportError:
        return False, "未安装"
    except Exception as e:
        return False, f"检查失败: {str(e)}"

def install_package(package_name: str, min_version: str = None) -> bool:
    """安装单个包"""
    package_spec = f"{package_name}>={min_version}" if min_version else package_name

    try:
        print(f"📦 安装 {package_spec}...")
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'install', package_spec],
            capture_output=True,
            text=True,
            timeout=300  # 5分钟超时
        )

        if result.returncode == 0:
            print(f"✅ {package_name} 安装成功")
            return True
        else:
            print(f"❌ {package_name} 安装失败:")
            print(f"   {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        print(f"❌ {package_name} 安装超时")
        return False
    except Exception as e:
        print(f"❌ {package_name} 安装异常: {str(e)}")
        return False

def check_all_dependencies():
    """检查所有依赖"""
    print("\n🔍 检查依赖包...")
    print("-" * 50)

    results = {}

    # 检查必需包
    for package, min_version in REQUIRED_PACKAGES.items():
        is_installed, info = check_package(package, min_version)
        results[package] = (is_installed, info)

        status = "✅" if is_installed else "❌"
        print(f"{status} {package:<20} {info}")

    # 检查可选包
    print("\n🔧 检查可选依赖...")
    for package, min_version in OPTIONAL_PACKAGES.items():
        is_installed, info = check_package(package, min_version)
        results[package] = (is_installed, info)

        status = "✅" if is_installed else "⚠️"
        print(f"{status} {package:<20} {info} (可选)")

    return results

def install_missing_packages(results, install_optional: bool = False) -> bool:
    """安装缺失的包"""
    missing_required = []
    missing_optional = []

    # 分类缺失的包
    for package, (is_installed, _) in results.items():
        if not is_installed:
            if package in REQUIRED_PACKAGES:
                missing_required.append(package)
            elif package in OPTIONAL_PACKAGES:
                missing_optional.append(package)

    if not missing_required and not missing_optional:
        print("\n✅ 所有依赖都已安装")
        return True

    success = True

    # 安装必需包
    if missing_required:
        print(f"\n📦 安装缺失的必需依赖 ({len(missing_required)} 个)...")
        for package in missing_required:
            min_version = REQUIRED_PACKAGES[package]
            if not install_package(package, min_version):
                success = False

    # 安装可选包
    if install_optional and missing_optional:
        print(f"\n📦 安装缺失的可选依赖 ({len(missing_optional)} 个)...")
        for package in missing_optional:
            min_version = OPTIONAL_PACKAGES[package]
            install_package(package, min_version)  # 可选包安装失败不影响整体结果

    return success

def main():
    """主函数"""
    print("🚀 Ticketradar 依赖检查工具")
    print("=" * 50)

    # 检查Python版本
    if not check_python_version():
        sys.exit(1)

    # 检查所有依赖
    results = check_all_dependencies()

    # 统计结果
    required_missing = sum(1 for pkg, (installed, _) in results.items()
                          if not installed and pkg in REQUIRED_PACKAGES)
    optional_missing = sum(1 for pkg, (installed, _) in results.items()
                          if not installed and pkg in OPTIONAL_PACKAGES)

    print(f"\n📊 检查结果:")
    print(f"   必需依赖: {len(REQUIRED_PACKAGES) - required_missing}/{len(REQUIRED_PACKAGES)} 已安装")
    print(f"   可选依赖: {len(OPTIONAL_PACKAGES) - optional_missing}/{len(OPTIONAL_PACKAGES)} 已安装")

    # 询问是否安装缺失的包
    if required_missing > 0:
        print(f"\n⚠️ 发现 {required_missing} 个缺失的必需依赖")

        try:
            install_choice = input("是否自动安装缺失的依赖? (y/N): ").strip().lower()
            if install_choice in ['y', 'yes']:
                install_optional_choice = input("是否同时安装可选依赖? (y/N): ").strip().lower()
                install_optional = install_optional_choice in ['y', 'yes']

                if install_missing_packages(results, install_optional):
                    print("\n🎉 所有依赖安装完成!")
                    print("现在可以运行: python main.py")
                else:
                    print("\n❌ 部分依赖安装失败，请手动安装")
                    print("手动安装命令: pip install -r requirements.txt")
                    sys.exit(1)
            else:
                print("\n💡 手动安装命令:")
                print("   pip install -r requirements.txt")
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n\n👋 用户取消操作")
            sys.exit(1)
    else:
        print("\n✅ 所有必需依赖都已安装，系统可以正常运行!")

if __name__ == "__main__":
    main()
