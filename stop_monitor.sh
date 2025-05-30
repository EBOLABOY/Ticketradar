#!/bin/bash

echo "正在停止机票价格监控系统..."

# 查找运行中的python main.py进程
PID=$(ps aux | grep "python main.py" | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "未找到正在运行的监控程序。"
    exit 0
fi

# 停止进程
echo "找到进程ID: $PID，正在停止..."
kill $PID

# 检查进程是否已停止
sleep 2
if ps -p $PID > /dev/null; then
    echo "进程未能正常停止，尝试强制终止..."
    kill -9 $PID
    sleep 1
fi

# 最终检查
if ps -p $PID > /dev/null; then
    echo "错误: 无法停止进程 $PID"
    exit 1
else
    echo "监控系统已成功停止。"
fi
