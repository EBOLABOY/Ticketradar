#!/bin/bash
# Ticketradar Docker Compose 部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  🐳 Ticketradar Docker 部署${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检查Docker和Docker Compose
check_requirements() {
    print_message "检查系统要求..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        echo "安装命令: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        echo "安装命令: sudo apt install docker-compose-plugin"
        exit 1
    fi

    print_message "✅ Docker 和 Docker Compose 已安装"
}

# 检查端口占用
check_ports() {
    print_message "检查端口占用..."

    if netstat -tlnp 2>/dev/null | grep -q ":38181 "; then
        print_warning "端口 38181 已被占用"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
        print_warning "端口 80 已被占用（Nginx可选）"
    fi
}

# 创建必要的目录
create_directories() {
    print_message "创建必要的目录..."

    mkdir -p backups
    mkdir -p ssl
    mkdir -p logs

    print_message "✅ 目录创建完成"
}

# 配置环境变量
configure_environment() {
    print_message "配置环境变量..."

    if [ ! -f ".env.docker" ]; then
        print_warning ".env.docker 文件不存在，将使用默认配置"
    else
        print_message "✅ 使用现有的 .env.docker 配置"
    fi

    # 询问是否配置PushPlus
    read -p "是否配置 PushPlus 推送？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "请输入 PushPlus Token: " pushplus_token
        if [ ! -z "$pushplus_token" ]; then
            sed -i "s/ENABLE_PUSHPLUS=false/ENABLE_PUSHPLUS=true/" .env.docker
            sed -i "s/PUSHPLUS_TOKEN=/PUSHPLUS_TOKEN=$pushplus_token/" .env.docker
            print_message "✅ PushPlus 配置完成"
        fi
    fi

    # 询问域名配置
    read -p "是否使用默认域名 ticketradar.izlx.me？(Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_message "✅ 使用默认域名: ticketradar.izlx.me"
        print_message "💡 该域名已配置Cloudflare灵活SSL"
    else
        read -p "请输入您的域名: " domain
        if [ ! -z "$domain" ]; then
            sed -i "s/EXTERNAL_DOMAIN=ticketradar.izlx.me/EXTERNAL_DOMAIN=$domain/" .env.docker
            sed -i "s/server_name localhost ticketradar.izlx.me;/server_name localhost $domain;/" nginx.conf
            print_message "✅ 域名配置完成: $domain"
            print_warning "请确保您的域名已配置Cloudflare代理"
        fi
    fi
}

# 构建和启动服务
deploy_services() {
    print_message "构建和启动服务..."

    # 选择部署模式
    echo "请选择部署模式:"
    echo "1) 开发模式 (仅应用)"
    echo "2) 生产模式 (应用 + Nginx)"
    echo "3) 完整模式 (应用 + Nginx + 备份)"

    read -p "请选择 (1-3): " -n 1 -r
    echo

    case $REPLY in
        1)
            print_message "启动开发模式..."
            docker-compose up -d ticketradar
            ;;
        2)
            print_message "启动生产模式..."
            docker-compose --profile nginx up -d
            ;;
        3)
            print_message "启动完整模式..."
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            ;;
        *)
            print_message "使用默认开发模式..."
            docker-compose up -d ticketradar
            ;;
    esac

    print_message "✅ 服务启动完成"
}

# 等待服务启动
wait_for_services() {
    print_message "等待服务启动..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:38181 > /dev/null 2>&1; then
            print_message "✅ 服务已启动"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    print_error "服务启动超时"
    return 1
}

# 显示部署信息
show_deployment_info() {
    print_header
    print_message "🎉 部署完成！"
    echo
    print_message "📋 访问信息:"
    echo "   🌐 应用直接访问: http://localhost:38181"

    if docker-compose ps nginx 2>/dev/null | grep -q "Up"; then
        echo "   🌐 Nginx代理访问: http://localhost"
        echo "   🌍 外部域名访问: https://ticketradar.izlx.me"
        echo "   ☁️ Cloudflare状态: 灵活SSL模式"
    fi

    echo "   👤 管理员账户: 1242772513@qq.com"
    echo "   🔑 管理员密码: 1242772513"
    echo
    print_message "📊 容器状态:"
    docker-compose ps
    echo
    print_message "📝 管理命令:"
    echo "   启动服务: docker-compose up -d"
    echo "   停止服务: docker-compose down"
    echo "   查看日志: docker-compose logs -f"
    echo "   重启服务: docker-compose restart"
    echo "   更新镜像: docker-compose pull && docker-compose up -d"
    echo
    print_message "📁 数据目录:"
    echo "   数据库: Docker Volume (ticketradar_data)"
    echo "   日志: Docker Volume (ticketradar_logs)"
    echo "   备份: ./backups/"
    echo
}

# 主函数
main() {
    print_header

    # 检查是否为root用户
    if [ "$EUID" -eq 0 ]; then
        print_message "检测到root用户，继续使用root权限部署"
    else
        print_message "检测到普通用户，将使用sudo权限"
    fi

    check_requirements
    check_ports
    create_directories
    configure_environment
    deploy_services

    if wait_for_services; then
        show_deployment_info
    else
        print_error "部署失败，请检查日志"
        docker-compose logs
        exit 1
    fi
}

# 脚本参数处理
case "${1:-}" in
    "start")
        docker-compose up -d
        ;;
    "stop")
        docker-compose down
        ;;
    "restart")
        docker-compose restart
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "update")
        docker-compose pull
        docker-compose up -d
        ;;
    "clean")
        docker-compose down -v
        docker system prune -f
        ;;
    *)
        main
        ;;
esac
