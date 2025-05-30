#!/bin/bash

# 设置项目路径
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "启动机票价格监控系统..."
echo "项目路径: $PROJECT_DIR"

# 激活虚拟环境并运行程序
# 注意：根据您的虚拟环境配置方式，可能需要调整激活命令
source venv/bin/activate || source ~/.virtualenvs/机票监控/bin/activate || echo "请手动激活您的虚拟环境"

# 启动程序
nohup python main.py > monitor.log 2>&1 &
PID=$!

echo "监控系统已在后台启动，进程ID: $PID"
echo "日志文件: $PROJECT_DIR/monitor.log"

# 检查程序是否成功启动
sleep 2
if ps -p $PID > /dev/null; then
    echo "程序已成功启动！"
else
    echo "警告: 程序可能未成功启动，请检查日志文件"
fi
