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
    copy server\.env.example server\.env >nul
    
    REM Generate JWT secret (Windows doesn't have easy crypto generation, so use a placeholder)
    echo.
    echo [WARNING] Please generate a secure JWT secret and update server/.env
    echo.
    echo Run this command and copy the output:
    echo node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    echo.
    echo Then edit server/.env and replace JWT_SECRET value
    echo.
) else (
    echo [OK] Environment file already exists
    echo.
)

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
echo 1. Set up MongoDB (if not already done):
echo    - Edit server/.env and update MONGODB_URI
echo.
echo 2. Generate and set JWT_SECRET:
echo    - Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo    - Copy output and paste in server/.env as JWT_SECRET
echo.
echo 3. Start the application:
echo    - Development: npm run dev
echo    - Production preview: npm run preview
echo.
echo 4. Open browser to http://localhost:3000
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
