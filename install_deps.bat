@echo off
chcp 65001 >nul
echo 📦 Ticketradar 依赖安装脚本
echo ================================================

echo 🐍 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装或不在PATH中
    pause
    exit /b 1
)

echo ✅ Python环境正常

echo 📋 检查pip...
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip不可用
    pause
    exit /b 1
)

echo ✅ pip可用

echo ⬆️ 升级pip...
python -m pip install --upgrade pip

echo 📦 安装必需依赖包...
echo.

echo   安装 requests...
python -m pip install "requests>=2.28.0"

echo   安装 pandas...
python -m pip install "pandas>=1.5.0"

echo   安装 python-dotenv...
python -m pip install "python-dotenv>=1.0.0"

echo   安装 schedule...
python -m pip install "schedule>=1.2.0"

echo   安装 Flask...
python -m pip install "Flask>=2.2.0"

echo   安装 Flask-SQLAlchemy...
python -m pip install "Flask-SQLAlchemy>=3.0.0"

echo   安装 Flask-Login...
python -m pip install "Flask-Login>=0.6.0"

echo   安装 Flask-CORS...
python -m pip install "Flask-CORS>=4.0.0"

echo   安装 waitress...
python -m pip install "waitress>=2.1.0"

echo.
echo 🔍 验证安装...

echo   验证 requests...
python -c "import requests; print('✅ requests OK')" 2>nul || echo "❌ requests 失败"

echo   验证 pandas...
python -c "import pandas; print('✅ pandas OK')" 2>nul || echo "❌ pandas 失败"

echo   验证 python-dotenv...
python -c "import dotenv; print('✅ python-dotenv OK')" 2>nul || echo "❌ python-dotenv 失败"

echo   验证 schedule...
python -c "import schedule; print('✅ schedule OK')" 2>nul || echo "❌ schedule 失败"

echo   验证 Flask...
python -c "import flask; print('✅ Flask OK')" 2>nul || echo "❌ Flask 失败"

echo   验证 Flask-SQLAlchemy...
python -c "import flask_sqlalchemy; print('✅ Flask-SQLAlchemy OK')" 2>nul || echo "❌ Flask-SQLAlchemy 失败"

echo   验证 Flask-Login...
python -c "import flask_login; print('✅ Flask-Login OK')" 2>nul || echo "❌ Flask-Login 失败"

echo   验证 Flask-CORS...
python -c "import flask_cors; print('✅ Flask-CORS OK')" 2>nul || echo "❌ Flask-CORS 失败"

echo   验证 waitress...
python -c "import waitress; print('✅ waitress OK')" 2>nul || echo "❌ waitress 失败"

echo.
echo 🎉 依赖安装完成！
echo.
echo 🚀 现在可以启动系统：
echo    python main.py
echo    或
echo    python start_with_user_system.py
echo.
echo 📝 其他有用命令：
echo    查看已安装包: pip list
echo    检查依赖: python check_dependencies.py
echo.
pause
