@echo off
REM Micasa Setup and Launch Script for Windows
REM This script will set up and launch the Micasa application

SETLOCAL EnableDelayedExpansion

echo.
echo ========================================
echo    Micasa Setup ^& Launch Script
echo    Household Management Application
echo ========================================
echo.

REM Check prerequisites
echo [STEP] Checking prerequisites...

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
echo [INFO] Node.js version: !NODE_VERSION! (OK)

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

for /f %%i in ('npm -v') do set NPM_VERSION=%%i
echo [INFO] npm version: !NPM_VERSION! (OK)
echo.

REM Step 1: Set up backend
echo [STEP] Setting up backend...
cd server

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file...

    REM Generate secure JWT secret
    for /f %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set JWT_SECRET=%%i

    (
        echo PORT=5000
        echo JWT_SECRET=!JWT_SECRET!
        echo NODE_ENV=development
        echo CLIENT_URL=http://localhost:3000
    ) > .env

    echo [INFO] .env file created with secure JWT secret (OK)
) else (
    echo [INFO] .env file already exists (OK)
)

REM Install server dependencies
echo [INFO] Installing server dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)

REM Create data directory if it doesn't exist
if not exist data (
    echo [INFO] Creating data directory...
    mkdir data
)

echo [INFO] Backend setup complete (OK)
echo.

REM Step 2: Set up frontend
echo [STEP] Setting up frontend...
cd ..\client

REM Install client dependencies
echo [INFO] Installing client dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)

echo [INFO] Frontend setup complete (OK)
echo.

REM Ask about production build
set /p BUILD_PROD="Do you want to build the frontend for production? [y/N]: "
if /i "!BUILD_PROD!"=="y" (
    echo [STEP] Building frontend for production...
    call npm run build
    echo [INFO] Frontend build complete (OK)
)

cd ..

REM Step 4: Launch the application
echo.
echo ========================================
echo      Setup Complete!
echo ========================================
echo.
echo [INFO] Starting servers...
echo.
echo Backend will start on:  http://localhost:5000
echo Frontend will start on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Create temporary script to run both servers
echo @echo off > start-servers.bat
echo start "Micasa Backend" cmd /k "cd server && npm start" >> start-servers.bat
echo timeout /t 3 /nobreak ^>nul >> start-servers.bat
echo start "Micasa Frontend" cmd /k "cd client && npm run dev" >> start-servers.bat
echo timeout /t 3 /nobreak ^>nul >> start-servers.bat
echo echo. >> start-servers.bat
echo echo ======================================== >> start-servers.bat
echo echo   Micasa is running! >> start-servers.bat
echo echo ======================================== >> start-servers.bat
echo echo. >> start-servers.bat
echo echo Access the application: >> start-servers.bat
echo echo   Frontend: http://localhost:3000 >> start-servers.bat
echo echo   Backend:  http://localhost:5000 >> start-servers.bat
echo echo   API Health: http://localhost:5000/api/health >> start-servers.bat
echo echo. >> start-servers.bat
echo echo Default credentials (create new user): >> start-servers.bat
echo echo   Go to http://localhost:3000/register >> start-servers.bat
echo echo. >> start-servers.bat
echo pause >> start-servers.bat

REM Run the servers
call start-servers.bat

REM Cleanup
del start-servers.bat

echo.
echo [INFO] Servers started in separate windows
echo [INFO] Close the command windows to stop the servers
echo.
pause
