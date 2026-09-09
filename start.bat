@echo off
title TOR Sentinel 2.0 - Launch Pad

color 0A
echo.
echo =====================================================================
echo  TOR SENTINEL 2.0 -- NTRO PS-26151
echo  Dark Web Threat Actor De-anonymization Platform
echo =====================================================================
echo.

:: Check Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo [OK] Node.js detected: %NODE_VER%
echo.

:: Check backend node_modules
if not exist "%~dp0backend\node_modules" (
    echo [SETUP] Installing backend dependencies... (first run only)
    cd /d "%~dp0backend"
    call npm install
    cd /d "%~dp0"
    echo [OK] Backend dependencies installed.
    echo.
)

:: Check frontend node_modules
if not exist "%~dp0frontend\node_modules" (
    echo [SETUP] Installing frontend dependencies... (this may take a few minutes)
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
    echo [OK] Frontend dependencies installed.
    echo.
)

echo =====================================================================
echo  Launching services in parallel...
echo.
echo  (1) Backend  : http://localhost:5000 (Express + Socket.IO)
echo  (2) Frontend : http://localhost:3000 (React UI)
echo.
echo  Each service runs in its own window.
echo  Close a window to stop that service.
echo =====================================================================
echo.

:: Launch Backend in a new window (cyan title bar)
echo [*] Starting Backend server on port 5000...
start "TOR Sentinel - BACKEND :5000" cmd /k "color 0B && title TOR Sentinel BACKEND [Port 5000] && cd /d "%~dp0backend" && echo. && echo [BACKEND] Express + Socket.IO starting on port 5000... && echo. && npm run dev"

:: Wait 8 seconds so backend fully starts before frontend begins proxying
timeout /t 8 /nobreak >nul

:: Launch Frontend in a new window (yellow title bar)
echo [*] Starting Frontend React server on port 3000...
start "TOR Sentinel - FRONTEND :3000" cmd /k "color 0E && title TOR Sentinel FRONTEND [Port 3000] && cd /d "%~dp0frontend" && echo. && echo [FRONTEND] React dev server starting on port 3000... && echo. && npm start"

echo.
echo [OK] Both services launched!
echo.
echo =====================================================================
echo  Service URLs
echo.
echo    Frontend  : http://localhost:3000
echo    Backend   : http://localhost:5000/health
echo    Socket.IO : ws://localhost:5000
echo.
echo  API Routes:
echo    /api/darkweb  : Dark web intelligence and scanner
echo    /api/v2       : Blockchain, behavioral, OSINT
echo    /api/cases    : Case management and NTRO reports
echo =====================================================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul

start "" "http://localhost:3000"

echo.
echo [OK] Browser opened.
echo You can close this window - services keep running in their own windows.
echo.
pause >nul
