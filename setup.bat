@echo off
echo.
echo 🚀 PHCS Hackathon Setup
echo =====================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Backend setup
echo 📦 Setting up Backend...
cd backend
call npm install
echo ✅ Backend ready!
echo.

REM Frontend setup
echo 📦 Setting up Frontend...
cd ..\frontend
call npm install
echo ✅ Frontend ready!
echo.

echo 🎉 Setup complete!
echo.
echo 📝 Quick Start:
echo   Terminal 1: cd backend ^&^& npm run dev
echo   Terminal 2: cd frontend ^&^& npm run dev
echo.
echo 🌐 Open http://localhost:3000
echo 📧 Demo: demo@jhs.org / demo123
echo.
pause
