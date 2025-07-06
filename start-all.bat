@echo off
title Flight Monitor System - Start All Services

echo.
echo ========================================
echo   Flight Monitor System - Start All
echo ========================================
echo   Redis + FastAPI + React
echo ========================================
echo.

:: Check project directories
if not exist "Backend" (
    echo [ERROR] Please run this script from project root directory
    echo Current directory should contain Backend and Front_end folders
    pause
    exit /b 1
)

if not exist "Front_end" (
    echo [ERROR] Please run this script from project root directory
    echo Current directory should contain Backend and Front_end folders
    pause
    exit /b 1
)

:: Check virtual environment
echo [INFO] Checking virtual environment...
if exist "venv\Scripts\activate.bat" (
    echo [OK] Found virtual environment: venv
) else (
    echo [ERROR] Virtual environment not found
    echo Please ensure venv folder exists in project root
    echo Run: python -m venv venv
    pause
    exit /b 1
)

:: Check Node.js
echo [INFO] Checking Node.js environment...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found, please install Node.js
    pause
    exit /b 1
) else (
    echo [OK] Node.js environment ready
)

:: Check Redis
echo [INFO] Checking Redis environment...
if exist "D:\Redis\redis-server.exe" (
    echo [OK] Found Redis server

    :: Check if Redis is already running
    echo [INFO] Checking if Redis is already running...
    netstat -ano | findstr ":6379" >nul 2>&1
    if errorlevel 1 (
        echo [INFO] Starting Redis service...
        start "Redis Server" cmd /k "title Redis Server && D:\Redis\redis-server.exe --port 6379"
        timeout /t 3 /nobreak >nul
    ) else (
        echo [INFO] Redis is already running on port 6379
    )
) else (
    echo [WARN] Redis not found, will use memory cache
)

echo.
echo [INFO] Starting services...

:: Start FastAPI backend
echo [INFO] Starting FastAPI backend service...
echo [INFO] Admin account: 1242772513@qq.com / 1242772513
echo [INFO] Database: Supabase (Cloud PostgreSQL)
start "FastAPI Backend" cmd /k "title FastAPI Backend && cd /d %~dp0 && call venv\Scripts\activate.bat && cd Backend && python main_fastapi.py"

:: Wait for backend to start
echo [INFO] Waiting for FastAPI backend to start (10 seconds)...
timeout /t 10 /nobreak >nul

:: Start React frontend
echo [INFO] Starting React frontend service...
start "React Frontend" cmd /k "title React Frontend && cd /d %~dp0Front_end && npm start"

:: Wait for frontend to start
echo [INFO] Waiting for React frontend to start (10 seconds)...
timeout /t 10 /nobreak >nul

:: Display service information
echo.
echo ========================================
echo [SUCCESS] Development environment started!
echo ========================================
echo [DB] Supabase Database:    Connected (Cloud PostgreSQL)
echo [FRONTEND] Application:    http://localhost:3000
echo [BACKEND] API:             http://localhost:38181
echo [DOCS] API Documentation:  http://localhost:38181/docs
echo [DOCS] Interactive Docs:   http://localhost:38181/redoc
echo [ADMIN] Account:           1242772513@qq.com / 1242772513
echo.

:: Open browser
echo [INFO] Opening browser...
start http://localhost:3000
timeout /t 2 /nobreak >nul
start http://localhost:38181/docs

echo.
echo [SUCCESS] Development environment is ready!
echo.
echo [USAGE] Instructions:
echo   - Frontend: React dev server with hot reload
echo   - Backend: FastAPI server with auto restart
echo   - Close command windows to stop services
echo.
echo [LINKS] Quick access:
echo   - Frontend App: http://localhost:3000
echo   - API Docs:     http://localhost:38181/docs
echo.
echo [STOP] To stop all services, run: stop-all.bat
echo.
pause
