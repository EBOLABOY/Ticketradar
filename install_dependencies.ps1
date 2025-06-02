# Ticketradar 依赖安装脚本
# 快速安装所有必需的Python依赖包

param(
    [switch]$Force = $false,
    [switch]$Upgrade = $false,
    [switch]$IncludeOptional = $false
)

Write-Host "📦 Ticketradar 依赖安装脚本" -ForegroundColor Green
Write-Host ("=" * 50)

# 检查Python环境
Write-Host "🐍 检查Python环境..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python版本: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python未安装或不在PATH中" -ForegroundColor Red
    exit 1
}

# 检查pip
Write-Host "📋 检查pip..." -ForegroundColor Yellow
try {
    $pipVersion = python -m pip --version 2>&1
    Write-Host "✅ pip版本: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip不可用" -ForegroundColor Red
    exit 1
}

# 升级pip
if ($Upgrade) {
    Write-Host "⬆️ 升级pip..." -ForegroundColor Yellow
    python -m pip install --upgrade pip
}

# 必需依赖包
$requiredPackages = @(
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

# 可选依赖包
$optionalPackages = @(
    "pywin32>=306"  # Windows服务支持
)

# 安装必需依赖
Write-Host "📦 安装必需依赖包..." -ForegroundColor Yellow
$failedPackages = @()

foreach ($package in $requiredPackages) {
    Write-Host "  安装 $package..." -ForegroundColor Cyan

    $installArgs = @("install")
    if ($Force) { $installArgs += "--force-reinstall" }
    if ($Upgrade) { $installArgs += "--upgrade" }
    $installArgs += $package

    try {
        $result = python -m pip @installArgs 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ 成功" -ForegroundColor Green
        } else {
            Write-Host "    ❌ 失败" -ForegroundColor Red
            $failedPackages += $package
            Write-Host "    错误: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "    ❌ 异常: $_" -ForegroundColor Red
        $failedPackages += $package
    }
}

# 安装可选依赖
if ($IncludeOptional) {
    Write-Host "📦 安装可选依赖包..." -ForegroundColor Yellow

    foreach ($package in $optionalPackages) {
        Write-Host "  安装 $package..." -ForegroundColor Cyan

        $installArgs = @("install")
        if ($Force) { $installArgs += "--force-reinstall" }
        if ($Upgrade) { $installArgs += "--upgrade" }
        $installArgs += $package

        try {
            $result = python -m pip @installArgs 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ 成功" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️ 失败 (可选包)" -ForegroundColor Yellow
                Write-Host "    错误: $result" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "    ⚠️ 异常 (可选包): $_" -ForegroundColor Yellow
        }
    }
}

# 验证安装
Write-Host "🔍 验证安装..." -ForegroundColor Yellow
$verificationFailed = $false

$testImports = @{
    "requests" = "requests"
    "pandas" = "pandas"
    "python-dotenv" = "dotenv"
    "schedule" = "schedule"
    "Flask" = "flask"
    "Flask-SQLAlchemy" = "flask_sqlalchemy"
    "Flask-Login" = "flask_login"
    "Flask-CORS" = "flask_cors"
    "waitress" = "waitress"
}

foreach ($package in $testImports.Keys) {
    $importName = $testImports[$package]
    Write-Host "  验证 $package..." -ForegroundColor Cyan

    try {
        $result = python -c "import $importName; print('OK')" 2>&1
        if ($result -eq "OK") {
            Write-Host "    ✅ 可导入" -ForegroundColor Green
        } else {
            Write-Host "    ❌ 导入失败: $result" -ForegroundColor Red
            $verificationFailed = $true
        }
    } catch {
        Write-Host "    ❌ 导入异常: $_" -ForegroundColor Red
        $verificationFailed = $true
    }
}

# 显示结果
Write-Host ""
Write-Host "📊 安装结果:" -ForegroundColor Yellow
Write-Host "=" * 50

if ($failedPackages.Count -eq 0 -and -not $verificationFailed) {
    Write-Host "🎉 所有依赖安装成功!" -ForegroundColor Green
    Write-Host "✅ 系统已准备就绪，可以运行 Ticketradar" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 启动命令:" -ForegroundColor Cyan
    Write-Host "   python main.py" -ForegroundColor White
    Write-Host "   或" -ForegroundColor Gray
    Write-Host "   python start_with_user_system.py" -ForegroundColor White
} else {
    Write-Host "⚠️ 部分依赖安装失败" -ForegroundColor Yellow

    if ($failedPackages.Count -gt 0) {
        Write-Host "❌ 失败的包:" -ForegroundColor Red
        foreach ($pkg in $failedPackages) {
            Write-Host "   - $pkg" -ForegroundColor Red
        }
    }

    if ($verificationFailed) {
        Write-Host "❌ 部分包导入验证失败" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "🔧 建议解决方案:" -ForegroundColor Yellow
    Write-Host "1. 检查网络连接" -ForegroundColor White
    Write-Host "2. 升级pip: python -m pip install --upgrade pip" -ForegroundColor White
    Write-Host "3. 使用国内镜像: python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt" -ForegroundColor White
    Write-Host "4. 手动安装失败的包" -ForegroundColor White

    exit 1
}

Write-Host ""
Write-Host "📝 其他有用命令:" -ForegroundColor Cyan
Write-Host "   查看已安装包: pip list" -ForegroundColor White
Write-Host "   检查依赖: python check_dependencies.py" -ForegroundColor White
Write-Host "   部署到服务器: .\deploy_server.ps1 -InstallDeps" -ForegroundColor White
