#!/bin/bash

# 设置项目路径
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "===== 机票价格监控系统环境设置 ====="
echo "项目路径: $PROJECT_DIR"

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 显示Python版本
PYTHON_VERSION=$(python3 --version)
echo "检测到Python版本: $PYTHON_VERSION"

# 创建虚拟环境
echo "正在创建虚拟环境..."
python3 -m venv venv
if [ ! -d "venv" ]; then
    echo "错误: 虚拟环境创建失败"
    exit 1
fi

# 激活虚拟环境
echo "正在激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "正在安装依赖..."
pip install --upgrade pip
pip install -r requirements.txt

# 检查安装结果
if [ $? -eq 0 ]; then
    echo "依赖安装成功！"
else
    echo "错误: 依赖安装失败，请检查错误信息"
    exit 1
fi

echo "===== 环境设置完成 ====="
echo "您现在可以使用以下命令启动系统:"
echo "  ./start_monitor.sh"
echo ""
echo "或者手动执行以下步骤:"
echo "  1. 激活虚拟环境: source venv/bin/activate"
echo "  2. 运行程序: python main.py"

# 设置脚本执行权限
chmod +x start_monitor.sh

echo "已设置start_monitor.sh为可执行文件"
