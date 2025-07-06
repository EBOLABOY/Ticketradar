@echo off
chcp 65001 >nul
title Flight Monitor System - Stop All Services

echo.
echo ========================================
echo   [STOP] Flight Monitor System Services
echo ========================================
echo.

echo [INFO] Finding running services...

:: Stop Redis service (port 6379)
echo [INFO] Stopping Redis service...
netstat -ano | findstr :6379 >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :6379 2^>nul') do (
        echo [INFO] Found Redis process: %%a
        taskkill /f /pid %%a >nul 2>&1
        if not errorlevel 1 (
            echo [OK] Redis service stopped
        )
    )
) else (
    echo [INFO] Redis service not running
)

:: Stop FastAPI service (port 38181)
echo [INFO] Stopping FastAPI backend service...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :38181 2^>nul') do (
    echo [INFO] Found FastAPI process: %%a
    taskkill /f /pid %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] FastAPI service stopped
    )
)

:: Stop React service (port 30000)
echo [INFO] Stopping React frontend service...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :30000 2^>nul') do (
    echo [INFO] Found React process: %%a
    taskkill /f /pid %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] React service stopped
    )
)

:: Stop related command windows
echo [INFO] Closing related command windows...
taskkill /f /fi "WindowTitle eq Redis Server" >nul 2>&1
taskkill /f /fi "WindowTitle eq FastAPI Backend" >nul 2>&1
taskkill /f /fi "WindowTitle eq React Frontend" >nul 2>&1
taskkill /f /fi "WindowTitle eq FastAPI Backend Service" >nul 2>&1
taskkill /f /fi "WindowTitle eq React Frontend Service" >nul 2>&1

:: Stop related processes
echo [INFO] Stopping Python processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im pythonw.exe >nul 2>&1

echo [INFO] Stopping Node processes...
taskkill /f /im node.exe >nul 2>&1

echo [INFO] Stopping Redis processes...
taskkill /f /im redis-server.exe >nul 2>&1

echo.
echo ========================================
echo [SUCCESS] All services stopped!
echo ========================================
echo.
echo [INFO] All development services have been stopped
echo [RESTART] To restart, run: start-all.bat
echo.
pause
