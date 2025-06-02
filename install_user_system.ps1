# Ticketradar 用户系统安装脚本
# PowerShell 脚本

Write-Host "🚀 Ticketradar 用户系统安装脚本" -ForegroundColor Green
Write-Host "=" * 50

# 检查Python是否安装
Write-Host "📋 检查Python环境..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python已安装: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到Python，请先安装Python 3.8+" -ForegroundColor Red
    exit 1
}

# 检查虚拟环境是否存在
if (Test-Path "venv") {
    Write-Host "✅ 虚拟环境已存在" -ForegroundColor Green
} else {
    Write-Host "📦 创建虚拟环境..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 创建虚拟环境失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 虚拟环境创建成功" -ForegroundColor Green
}

# 激活虚拟环境
Write-Host "🔧 激活虚拟环境..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# 升级pip
Write-Host "⬆️ 升级pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# 安装依赖
Write-Host "📦 安装依赖包..." -ForegroundColor Yellow
$packages = @(
    "requests>=2.28.0",
    "pandas>=1.5.0",
    "python-dotenv>=1.0.0",
    "schedule>=1.2.0",
    "Flask>=2.2.0",
    "Flask-SQLAlchemy>=3.0.0",
    "Flask-Login>=0.6.0",
    "Flask-CORS>=4.0.0",
    "waitress>=2.1.0"
)

foreach ($package in $packages) {
    Write-Host "  安装 $package..." -ForegroundColor Cyan
    python -m pip install $package
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 安装 $package 失败" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ 所有依赖安装完成" -ForegroundColor Green

# 检查.env文件
if (Test-Path ".env") {
    Write-Host "✅ .env配置文件已存在" -ForegroundColor Green
} else {
    Write-Host "⚠️ 未找到.env配置文件，请确保配置正确" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 安装完成！" -ForegroundColor Green
Write-Host "=" * 50
Write-Host "启动方法："
Write-Host "1. 激活虚拟环境: .\venv\Scripts\Activate.ps1"
Write-Host "2. 启动服务: python start_with_user_system.py"
Write-Host "   或直接运行: python main.py"
Write-Host ""
Write-Host "🌐 访问地址: http://localhost:38181"
Write-Host "👤 默认管理员: admin / admin123"
Write-Host "📝 请及时修改默认密码"
