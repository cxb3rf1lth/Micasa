@echo off
REM Micasa Automated Installation Script for Windows
REM This script fully automates the setup of Micasa with SQLite database

echo.
echo ==========================================
echo   Micasa Installation
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed.
    echo         Please install Node.js v16 or higher from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node -v
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed.
    echo         Please install npm.
    pause
    exit /b 1
)

echo [OK] npm is installed
npm -v
echo.

REM Install dependencies
echo Installing dependencies...
echo This may take a few minutes...
echo.

call npm run install:all

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies.
    echo         Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully!
echo.

REM Create .env file
echo Configuring environment...

if not exist "server\.env" (
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
echo Building client application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to build client.
    pause
    exit /b 1
)

echo.
echo [OK] Client built successfully!
echo.
echo ==========================================
echo   Installation Complete!
echo ==========================================
echo.
echo Micasa is now ready to use!
echo.
echo Next Steps:
echo.
echo 1. Start the application:
echo    Development mode:  npm run dev
echo    Production mode:   npm run preview
echo.
echo 2. Open your browser:
echo    http://localhost:3000
echo.
echo 3. Create your account and start managing your household!
echo.
echo Documentation:
echo    - README.md - Overview and features
echo    - FEATURES.md - Detailed feature guide
echo    - DEPLOYMENT.md - Production deployment
echo.
echo Tips:
echo    - The SQLite database is stored in: server\data\micasa.db
echo    - No external database setup required!
echo    - All data is stored locally and securely
echo.
echo Need help? Check the documentation or create an issue on GitHub!
echo.
pause
