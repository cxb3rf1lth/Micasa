@echo off
REM Micasa Quick Start Script for Windows
REM This script helps you set up Micasa quickly

echo.
echo ========================================
echo   Welcome to Micasa Setup!
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16 or higher.
    echo         Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node -v
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo [OK] npm is installed
npm -v
echo.

REM Install dependencies
echo Installing dependencies...
call npm run install:all

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully!
echo.

REM Check if .env file exists
if not exist "server\.env" (
    echo Creating .env file...
    
    REM Generate JWT secret
    for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set JWT_SECRET=%%i
    
    REM Create .env file
    (
        echo PORT=5000
        echo JWT_SECRET=%JWT_SECRET%
        echo NODE_ENV=development
        echo CLIENT_URL=http://localhost:3000
    ) > server\.env
    
    echo [OK] Environment configured with secure JWT secret
) else (
    echo [OK] Environment file already exists
)

echo.

REM Create database directory
echo Initializing database...
if not exist "server\data" mkdir server\data
echo [OK] Database directory created
echo.

REM Build the client
echo Building client for production...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build client.
    pause
    exit /b 1
)

echo.
echo [OK] Client built successfully!
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Start the application:
echo    - Development: npm run dev
echo    - Production preview: npm run preview
echo.
echo 2. Open browser to http://localhost:3000
echo.
echo 3. Create your account and start managing your household!
echo.
echo Database Info:
echo    - Uses SQLite (automatically created)
echo    - Database location: server\data\micasa.db
echo    - No external database setup required!
echo.
echo Documentation:
echo    - README.md - Overview and quick start
echo    - PRODUCTION_SETUP.md - Production setup guide
echo    - DEPLOYMENT.md - Deployment instructions
echo    - FEATURES.md - Feature documentation
echo.
echo Need help? Check the documentation or create an issue on GitHub!
echo.
pause
