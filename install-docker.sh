#!/bin/bash
# Docker 和 Docker Compose 一键安装脚本

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
    echo -e "${BLUE}  🐳 Docker 一键安装脚本${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    elif [ -f /etc/redhat-release ]; then
        OS="CentOS"
        VER=$(cat /etc/redhat-release | sed 's/.*release //' | sed 's/ .*//')
    else
        print_error "无法检测操作系统"
        exit 1
    fi
    
    print_message "检测到操作系统: $OS $VER"
}

# 检查是否为root用户或有sudo权限
check_privileges() {
    if [ "$EUID" -eq 0 ]; then
        SUDO_CMD=""
        print_message "检测到root用户"
    elif command -v sudo >/dev/null 2>&1; then
        SUDO_CMD="sudo"
        print_message "检测到sudo权限"
    else
        print_error "需要root权限或sudo权限来安装Docker"
        exit 1
    fi
}

# 检查Docker是否已安装
check_docker_installed() {
    if command -v docker >/dev/null 2>&1; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_warning "Docker已安装 (版本: $DOCKER_VERSION)"
        
        read -p "是否重新安装Docker? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_message "跳过Docker安装"
            return 1
        fi
    fi
    return 0
}

# 检查Docker Compose是否已安装
check_docker_compose_installed() {
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        print_warning "Docker Compose已安装 (版本: $COMPOSE_VERSION)"
        return 1
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version --short)
        print_warning "Docker Compose Plugin已安装 (版本: $COMPOSE_VERSION)"
        return 1
    fi
    return 0
}

# Ubuntu/Debian安装Docker
install_docker_ubuntu() {
    print_message "在Ubuntu/Debian上安装Docker..."
    
    # 更新包索引
    $SUDO_CMD apt-get update
    
    # 安装必要的包
    $SUDO_CMD apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # 添加Docker官方GPG密钥
    $SUDO_CMD mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO_CMD gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # 设置稳定版仓库
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | $SUDO_CMD tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # 更新包索引
    $SUDO_CMD apt-get update
    
    # 安装Docker Engine
    $SUDO_CMD apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    print_message "✅ Docker安装完成"
}

# CentOS/RHEL安装Docker
install_docker_centos() {
    print_message "在CentOS/RHEL上安装Docker..."
    
    # 安装必要的包
    $SUDO_CMD yum install -y yum-utils
    
    # 添加Docker仓库
    $SUDO_CMD yum-config-manager \
        --add-repo \
        https://download.docker.com/linux/centos/docker-ce.repo
    
    # 安装Docker Engine
    $SUDO_CMD yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    print_message "✅ Docker安装完成"
}

# 通用安装方法（使用官方脚本）
install_docker_generic() {
    print_message "使用官方脚本安装Docker..."
    
    # 下载并运行官方安装脚本
    curl -fsSL https://get.docker.com -o get-docker.sh
    $SUDO_CMD sh get-docker.sh
    rm get-docker.sh
    
    # 安装Docker Compose Plugin
    if [ "$SUDO_CMD" = "sudo" ]; then
        sudo apt-get update && sudo apt-get install -y docker-compose-plugin
    else
        apt-get update && apt-get install -y docker-compose-plugin
    fi
    
    print_message "✅ Docker安装完成"
}

# 启动Docker服务
start_docker_service() {
    print_message "启动Docker服务..."
    
    # 启动Docker服务
    $SUDO_CMD systemctl start docker
    
    # 设置开机自启
    $SUDO_CMD systemctl enable docker
    
    # 检查服务状态
    if $SUDO_CMD systemctl is-active --quiet docker; then
        print_message "✅ Docker服务已启动"
    else
        print_error "Docker服务启动失败"
        exit 1
    fi
}

# 配置用户权限
configure_user_permissions() {
    if [ "$SUDO_CMD" = "sudo" ]; then
        print_message "配置用户权限..."
        
        # 将当前用户添加到docker组
        $SUDO_CMD usermod -aG docker $USER
        
        print_warning "用户权限已配置，请重新登录或运行以下命令："
        print_warning "newgrp docker"
        
        # 询问是否立即应用权限
        read -p "是否立即应用Docker权限? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            newgrp docker
        fi
    fi
}

# 验证安装
verify_installation() {
    print_message "验证Docker安装..."
    
    # 检查Docker版本
    if command -v docker >/dev/null 2>&1; then
        DOCKER_VERSION=$(docker --version)
        print_message "Docker版本: $DOCKER_VERSION"
    else
        print_error "Docker安装失败"
        exit 1
    fi
    
    # 检查Docker Compose
    if docker compose version >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version)
        print_message "Docker Compose版本: $COMPOSE_VERSION"
    elif command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_message "Docker Compose版本: $COMPOSE_VERSION"
    else
        print_warning "Docker Compose未安装，尝试安装..."
        install_docker_compose_standalone
    fi
    
    # 测试Docker运行
    print_message "测试Docker运行..."
    if $SUDO_CMD docker run --rm hello-world >/dev/null 2>&1; then
        print_message "✅ Docker运行测试成功"
    else
        print_warning "Docker运行测试失败，可能需要重新登录"
    fi
}

# 安装独立的Docker Compose
install_docker_compose_standalone() {
    print_message "安装Docker Compose独立版本..."
    
    # 获取最新版本号
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    # 下载Docker Compose
    $SUDO_CMD curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # 设置执行权限
    $SUDO_CMD chmod +x /usr/local/bin/docker-compose
    
    # 创建软链接
    $SUDO_CMD ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_message "✅ Docker Compose安装完成"
}

# 显示安装完成信息
show_completion_info() {
    print_header
    print_message "🎉 Docker安装完成！"
    echo
    print_message "📋 安装信息:"
    docker --version
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose --version
    elif docker compose version >/dev/null 2>&1; then
        docker compose version
    fi
    echo
    print_message "📝 常用命令:"
    echo "   查看版本: docker --version"
    echo "   运行容器: docker run hello-world"
    echo "   查看镜像: docker images"
    echo "   查看容器: docker ps"
    echo "   Docker Compose: docker-compose --help"
    echo
    print_message "🚀 下一步:"
    echo "   1. 重新登录终端或运行: newgrp docker"
    echo "   2. 测试运行: docker run hello-world"
    echo "   3. 部署Ticketradar: ./docker-deploy.sh"
    echo
}

# 主函数
main() {
    print_header
    
    # 检测系统
    detect_os
    check_privileges
    
    # 检查现有安装
    if ! check_docker_installed; then
        print_message "Docker已存在，跳过安装"
    else
        # 根据操作系统选择安装方法
        case $OS in
            "Ubuntu"*)
                install_docker_ubuntu
                ;;
            "Debian"*)
                install_docker_ubuntu
                ;;
            "CentOS"*)
                install_docker_centos
                ;;
            "Red Hat"*)
                install_docker_centos
                ;;
            *)
                print_warning "未识别的操作系统，使用通用安装方法"
                install_docker_generic
                ;;
        esac
        
        # 启动服务
        start_docker_service
        
        # 配置权限
        configure_user_permissions
    fi
    
    # 检查Docker Compose
    if ! check_docker_compose_installed; then
        print_message "Docker Compose已存在"
    fi
    
    # 验证安装
    verify_installation
    
    # 显示完成信息
    show_completion_info
}

# 脚本参数处理
case "${1:-}" in
    "uninstall")
        print_message "卸载Docker..."
        if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
            $SUDO_CMD apt-get remove -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            $SUDO_CMD rm -rf /var/lib/docker
            $SUDO_CMD rm -rf /var/lib/containerd
        elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
            $SUDO_CMD yum remove -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            $SUDO_CMD rm -rf /var/lib/docker
            $SUDO_CMD rm -rf /var/lib/containerd
        fi
        print_message "✅ Docker已卸载"
        ;;
    "test")
        print_message "测试Docker安装..."
        docker --version
        docker run --rm hello-world
        ;;
    *)
        main
        ;;
esac
