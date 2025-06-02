#!/bin/bash
# Ticketradar Ubuntu 一键安装脚本

set -e  # 遇到错误立即退出

echo "🚀 Ticketradar Ubuntu 一键安装脚本"
echo "=================================="

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  请不要使用root用户运行此脚本"
   echo "💡 建议使用普通用户，脚本会在需要时提示输入sudo密码"
   exit 1
fi

# 更新系统包
echo "📦 更新系统包..."
sudo apt update

# 安装Python3和pip
echo "🐍 安装Python环境..."
sudo apt install -y python3 python3-pip python3-venv

# 检查Python版本
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python版本: $PYTHON_VERSION"

# 检查版本是否满足要求
if python3 -c 'import sys; exit(0 if sys.version_info >= (3, 8) else 1)'; then
    echo "✅ Python版本满足要求"
else
    echo "❌ Python版本过低，需要3.8+，当前版本: $PYTHON_VERSION"
    exit 1
fi

# 创建虚拟环境
echo "📁 创建Python虚拟环境..."
python3 -m venv venv

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 升级pip
echo "⬆️ 升级pip..."
pip install --upgrade pip

# 安装依赖
echo "📦 安装Python依赖包..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "⚠️ 未找到requirements.txt，手动安装依赖..."
    pip install requests>=2.28.0 pandas>=1.5.0 python-dotenv>=1.0.0 schedule>=1.2.0 Flask>=2.2.0 Flask-SQLAlchemy>=3.0.0 Flask-Login>=0.6.0 Flask-CORS>=4.0.0 waitress>=2.1.0
fi

# 验证安装
echo "🔍 验证安装..."
python3 -c "
import requests, pandas, dotenv, schedule, flask, flask_sqlalchemy, flask_login, flask_cors, waitress
print('✅ 所有依赖包安装成功')
"

# 配置环境文件
echo "⚙️ 配置环境文件..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ 已创建配置文件 .env"
    else
        echo "⚠️ 未找到配置模板，创建基础配置..."
        cat > .env << EOF
# 服务器配置
SERVER_HOST=0.0.0.0
SERVER_PORT=38181

# 应用配置
SECRET_KEY=ubuntu-ticketradar-$(date +%s)
DATABASE_URL=sqlite:///ticketradar.db

# PushPlus配置
ENABLE_PUSHPLUS=false
PUSHPLUS_TOKEN=

# 监控配置
PRICE_THRESHOLD=1000
CHECK_INTERVAL=5
DEFAULT_DEPARTURE=HKG

# 行程配置
TRIP_TYPE=2
DEPART_DATE=2025-09-30
RETURN_DATE=2025-10-08
EOF
        echo "✅ 已创建基础配置文件"
    fi
else
    echo "✅ 配置文件已存在"
fi

# 验证主程序
echo "🔍 验证主程序..."
source venv/bin/activate
python3 -c "import main; print('✅ 主程序验证成功')" 2>/dev/null || {
    echo "❌ 主程序验证失败，请检查代码"
    exit 1
}

# 创建启动脚本
echo "📝 创建启动脚本..."
cat > start_ticketradar.sh << 'EOF'
#!/bin/bash
# Ticketradar 启动脚本

cd "$(dirname "$0")"
source venv/bin/activate
python3 main.py
EOF

chmod +x start_ticketradar.sh

# 创建后台启动脚本
cat > start_background.sh << 'EOF'
#!/bin/bash
# Ticketradar 后台启动脚本

cd "$(dirname "$0")"
source venv/bin/activate
nohup python3 main.py > ticketradar.log 2>&1 &
echo $! > ticketradar.pid
echo "✅ Ticketradar已在后台启动"
echo "📍 访问地址: http://$(hostname -I | awk '{print $1}'):38181"
echo "📝 日志文件: ticketradar.log"
echo "🛑 停止命令: ./stop_ticketradar.sh"
EOF

chmod +x start_background.sh

# 创建停止脚本
cat > stop_ticketradar.sh << 'EOF'
#!/bin/bash
# Ticketradar 停止脚本

if [ -f "ticketradar.pid" ]; then
    PID=$(cat ticketradar.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Ticketradar已停止 (PID: $PID)"
        rm -f ticketradar.pid
    else
        echo "⚠️ 进程不存在 (PID: $PID)"
        rm -f ticketradar.pid
    fi
else
    echo "⚠️ 未找到PID文件，尝试查找进程..."
    pkill -f "python3 main.py" && echo "✅ 已停止Ticketradar进程" || echo "❌ 未找到运行中的进程"
fi
EOF

chmod +x stop_ticketradar.sh

# 创建systemd服务文件（可选）
echo "🔧 创建systemd服务文件..."
cat > ticketradar.service << EOF
[Unit]
Description=Ticketradar Flight Monitor
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/venv/bin
ExecStart=$(pwd)/venv/bin/python $(pwd)/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "📋 安装完成！"
echo "=================================="
echo "🎉 Ticketradar已成功安装到Ubuntu系统"
echo ""
echo "🚀 启动方法："
echo "   前台启动: ./start_ticketradar.sh"
echo "   后台启动: ./start_background.sh"
echo "   停止服务: ./stop_ticketradar.sh"
echo ""
echo "🔧 系统服务（可选）："
echo "   sudo cp ticketradar.service /etc/systemd/system/"
echo "   sudo systemctl enable ticketradar"
echo "   sudo systemctl start ticketradar"
echo ""
echo "🌐 访问地址: http://$(hostname -I | awk '{print $1}'):38181"
echo "👤 默认管理员: admin / admin123"
echo ""
echo "📝 配置文件: .env"
echo "📊 日志文件: ticketradar.log"
echo ""
echo "🔧 防火墙配置（如需要）："
echo "   sudo ufw allow 38181"
echo ""
echo "💡 下一步："
echo "   1. 编辑 .env 文件配置PushPlus等参数"
echo "   2. 运行 ./start_background.sh 启动服务"
echo "   3. 访问Web界面进行配置"
echo ""
echo "📞 技术支持: 微信 Xinx--1996"
