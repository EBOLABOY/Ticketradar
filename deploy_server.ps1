#!/usr/bin/env powershell
# -*- coding: utf-8 -*-
"""
Ticketradar 服务器部署脚本
适用于Windows Server部署
"""

param(
    [string]$Domain = "",
    [string]$Port = "38181",
    [switch]$UseHttps = $false,
    [switch]$InstallDeps = $false,
    [switch]$InstallService = $false
)

Write-Host "🚀 Ticketradar 服务器部署脚本" -ForegroundColor Green
Write-Host "=" * 50

# 检查是否以管理员权限运行
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️ 建议以管理员权限运行此脚本" -ForegroundColor Yellow
}

# 1. 检查Python环境
Write-Host "🔍 检查Python环境..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python版本: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python未安装或不在PATH中" -ForegroundColor Red
    exit 1
}

# 2. 检查虚拟环境
Write-Host "🔍 检查虚拟环境..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "✅ 虚拟环境已存在" -ForegroundColor Green
} else {
    Write-Host "📦 创建虚拟环境..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 创建虚拟环境失败" -ForegroundColor Red
        exit 1
    }
}

# 3. 激活虚拟环境
Write-Host "🔧 激活虚拟环境..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# 4. 安装/更新依赖
if ($InstallDeps) {
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

    # Windows服务相关依赖（可选）
    if ($InstallService) {
        $packages += "pywin32>=306"
    }

    foreach ($package in $packages) {
        Write-Host "  安装 $package..." -ForegroundColor Cyan
        python -m pip install $package
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 安装 $package 失败" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "✅ 所有依赖安装完成" -ForegroundColor Green
}

# 5. 配置环境变量
Write-Host "⚙️ 配置服务器环境..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ 已从.env.example创建.env文件" -ForegroundColor Green
    } else {
        Write-Host "❌ 未找到.env.example文件" -ForegroundColor Red
        exit 1
    }
}

# 更新.env文件中的服务器配置
$envContent = Get-Content ".env"
$newEnvContent = @()

foreach ($line in $envContent) {
    if ($line -match "^SERVER_HOST=") {
        $newEnvContent += "SERVER_HOST=0.0.0.0"
    } elseif ($line -match "^SERVER_PORT=") {
        $newEnvContent += "SERVER_PORT=$Port"
    } elseif ($line -match "^EXTERNAL_DOMAIN=" -and $Domain) {
        $newEnvContent += "EXTERNAL_DOMAIN=$Domain"
    } elseif ($line -match "^USE_HTTPS=") {
        $newEnvContent += "USE_HTTPS=$($UseHttps.ToString().ToLower())"
    } else {
        $newEnvContent += $line
    }
}

$newEnvContent | Set-Content ".env"
Write-Host "✅ 环境配置已更新" -ForegroundColor Green

# 6. 检查防火墙
Write-Host "🔥 检查防火墙配置..." -ForegroundColor Yellow
try {
    $firewallRule = Get-NetFirewallRule -DisplayName "Ticketradar-$Port" -ErrorAction SilentlyContinue
    if (-not $firewallRule) {
        if ($isAdmin) {
            New-NetFirewallRule -DisplayName "Ticketradar-$Port" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow
            Write-Host "✅ 防火墙规则已添加" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 请手动添加防火墙规则允许端口 $Port" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ 防火墙规则已存在" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ 无法配置防火墙，请手动检查" -ForegroundColor Yellow
}

# 7. 创建启动脚本
Write-Host "📝 创建启动脚本..." -ForegroundColor Yellow
$startScript = @"
@echo off
cd /d "%~dp0"
echo 启动Ticketradar服务器...
call venv\Scripts\activate.bat
python main.py
pause
"@

$startScript | Set-Content "start_server.bat" -Encoding UTF8
Write-Host "✅ 启动脚本已创建: start_server.bat" -ForegroundColor Green

# 8. 创建服务安装脚本（可选）
$serviceScript = @"
# 安装为Windows服务（需要管理员权限）
# 需要先安装: pip install pywin32

import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import sys
import os

class TicketradarService(win32serviceutil.ServiceFramework):
    _svc_name_ = "Ticketradar"
    _svc_display_name_ = "Ticketradar Flight Monitor"
    _svc_description_ = "机票价格监控服务"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)

    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        self.main()

    def main(self):
        # 切换到脚本目录
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        # 导入并运行主程序
        import main

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(TicketradarService)
"@

$serviceScript | Set-Content "install_service.py" -Encoding UTF8

# 9. 显示部署信息
Write-Host ""
Write-Host "🎉 部署配置完成！" -ForegroundColor Green
Write-Host "=" * 50
Write-Host "📋 部署信息："
Write-Host "   🌐 服务器地址: 0.0.0.0:$Port"
if ($Domain) {
    $protocol = if ($UseHttps) { "https" } else { "http" }
    Write-Host "   🔗 外部访问: $protocol`://$Domain"
}
Write-Host "   📁 项目目录: $(Get-Location)"
Write-Host "   ⚙️ 配置文件: .env"
Write-Host ""
Write-Host "🚀 启动方法："
Write-Host "   方法1: 双击 start_server.bat"
Write-Host "   方法2: 运行 python main.py"
Write-Host "   方法3: 安装为服务 python install_service.py install"
Write-Host ""
Write-Host "🔧 后续配置："
Write-Host "   1. 编辑 .env 文件配置PushPlus等参数"
Write-Host "   2. 配置反向代理（Nginx/IIS）"
Write-Host "   3. 配置SSL证书（如使用HTTPS）"
Write-Host "   4. 设置开机自启动"
Write-Host ""

if ($Domain) {
    Write-Host "🌍 访问地址: $($UseHttps ? 'https' : 'http')://$Domain" -ForegroundColor Cyan
} else {
    Write-Host "🌍 本地访问: http://localhost:$Port" -ForegroundColor Cyan
}
