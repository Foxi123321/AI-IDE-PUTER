@echo off
title Cursor AI Clone - Development Environment
color 0A

echo.
echo ████████╗██╗   ██╗██████╗ ███████╗ ██████╗ ██████╗ 
echo ╚══██╔══╝██║   ██║██╔══██╗██╔════╝██╔═══██╗██╔══██╗
echo    ██║   ██║   ██║██████╔╝███████╗██║   ██║██████╔╝
echo    ██║   ██║   ██║██╔══██╗╚════██║██║   ██║██╔══██╗
echo    ██║   ╚██████╔╝██║  ██║███████║╚██████╔╝██║  ██║
echo    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝
echo.
echo    🚀 CURSOR AI CLONE - Development Environment 🚀
echo    ⭐ Powered by puter.js AI Integration ⭐
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo 📦 Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm is not available!
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    echo.
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully!
    echo.
)

echo 🚀 Starting Cursor AI Clone Development Environment...
echo.
echo 📋 Development URLs:
echo    🌐 Renderer Dev Server: http://localhost:3000
echo    🖥️  Electron App: Will start automatically
echo.
echo 🔧 Development Hotkeys:
echo    📝 Ctrl+K: Ask AI
echo    🤖 Ctrl+Shift+K: Start Agent  
echo    🔍 Ctrl+Shift+I: Open DevTools
echo    🔄 Ctrl+R: Reload App
echo.
echo ⚠️  To stop: Close Electron app or press Ctrl+C in this window
echo.
echo ═══════════════════════════════════════════════════════════════

REM Start the development environment
echo 🚀 Launching development environment...
echo.

start "Cursor AI Clone Dev" cmd /k "npm run dev"

echo.
echo ✅ Development environment started!
echo.
echo 📖 Check the other terminal window for build output.
echo 🖥️  Electron app should start automatically.
echo.
echo 💡 Tips:
echo    - The app will reload automatically when you change code
echo    - Check the console for any errors
echo    - Use the AI chat panel to test puter.js integration
echo.
echo 🎯 Happy Coding!
echo.
pause

REM Keep this window open
echo.
echo 📖 Development environment is running...
echo 🔄 Close this window to stop the development server.
echo.
:loop
timeout /t 30 /nobreak >nul
goto loop