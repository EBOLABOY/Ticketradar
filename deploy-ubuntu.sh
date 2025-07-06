#!/bin/bash

# 🚀 机票监控系统 - Ubuntu服务器部署脚本
# 适用于有Docker Compose的Ubuntu服务器环境

set -e  # 遇到错误立即退出

echo "🚀 开始部署机票监控系统到Ubuntu服务器..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要的命令
check_requirements() {
    log_info "检查系统环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    log_success "系统环境检查通过"
}

# 构建前端
build_frontend() {
    log_info "构建前端应用..."
    
    cd Front_end
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    fi
    
    # 构建生产版本
    log_info "构建生产版本..."
    npm run build
    
    if [ ! -d "build" ]; then
        log_error "前端构建失败"
        exit 1
    fi
    
    cd ..
    log_success "前端构建完成"
}

# 准备环境文件
prepare_env() {
    log_info "准备环境配置..."

    # 检查Backend环境文件
    if [ ! -f "Backend/.env" ]; then
        log_error "Backend/.env 文件不存在，请先配置环境变量"
        log_info "请运行: cp Backend/.env.example Backend/.env"
        log_info "然后编辑 Backend/.env 文件，填入您的API密钥"
        exit 1
    fi

    log_success "环境配置检查完成"
}

# 停止现有服务
stop_existing_services() {
    log_info "停止现有服务..."
    
    if docker-compose ps | grep -q "Up"; then
        docker-compose down
        log_info "已停止现有服务"
    fi
}

# 构建并启动服务
deploy_services() {
    log_info "构建并启动Docker服务..."
    
    # 构建镜像
    log_info "构建Docker镜像..."
    docker-compose build --no-cache
    
    # 启动服务
    log_info "启动服务容器..."
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_success "服务启动成功"
    else
        log_error "服务启动失败"
        docker-compose logs
        exit 1
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署状态..."
    
    # 检查容器状态
    echo "=== 容器状态 ==="
    docker-compose ps
    
    # 检查端口监听
    echo -e "\n=== 端口监听状态 ==="
    if command -v netstat &> /dev/null; then
        netstat -tlnp | grep -E ":(80|443|38181)"
    elif command -v ss &> /dev/null; then
        ss -tlnp | grep -E ":(80|443|38181)"
    fi
    
    # 测试后端API
    echo -e "\n=== API健康检查 ==="
    sleep 5
    if curl -f http://localhost:38181/health &> /dev/null; then
        log_success "后端API响应正常"
    else
        log_warning "后端API暂未响应，请检查日志"
    fi
    
    # 测试前端访问
    echo -e "\n=== 前端访问检查 ==="
    if curl -f http://localhost/ &> /dev/null; then
        log_success "前端页面访问正常"
    else
        log_warning "前端页面暂未响应，请检查Nginx配置"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo -e "\n${GREEN}🎉 部署完成！${NC}"
    echo -e "\n=== 访问信息 ==="
    echo -e "前端地址: ${BLUE}http://your-server-ip/${NC}"
    echo -e "后端API: ${BLUE}http://your-server-ip:38181/${NC}"
    echo -e "\n=== 管理命令 ==="
    echo -e "查看日志: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "重启服务: ${YELLOW}docker-compose restart${NC}"
    echo -e "停止服务: ${YELLOW}docker-compose down${NC}"
    echo -e "更新服务: ${YELLOW}./deploy-ubuntu.sh${NC}"
    
    echo -e "\n=== 防火墙配置 ==="
    echo -e "请确保开放以下端口："
    echo -e "- 80 (HTTP)"
    echo -e "- 443 (HTTPS, 可选)"
    echo -e "- 38181 (后端API)"
    
    echo -e "\n${YELLOW}注意：请将 'your-server-ip' 替换为您的实际服务器IP地址${NC}"
}

# 主函数
main() {
    log_info "开始部署流程..."
    
    check_requirements
    prepare_env
    build_frontend
    stop_existing_services
    deploy_services
    verify_deployment
    show_deployment_info
    
    log_success "部署流程完成！"
}

# 执行主函数
main "$@"
