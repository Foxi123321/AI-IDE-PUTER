@echo off
echo 🚀 Starting Cursor AI Clone Development Environment...
echo.

echo 📦 Building main process...
start /B npm run dev:main

echo ⏳ Waiting 5 seconds for main process...
timeout /t 5 /nobreak > nul

echo 🌐 Starting renderer dev server...
start /B npm run dev:renderer

echo ⏳ Waiting 10 seconds for renderer to start...
timeout /t 10 /nobreak > nul

echo 🖥️ Starting Electron app...
npm start

echo.
echo ✅ Cursor AI Clone is now running!
echo.
echo 🔧 Development Commands:
echo   - Ctrl+Shift+I: Open DevTools
echo   - Ctrl+R: Reload App  
echo   - Ctrl+K: Ask AI
echo   - Ctrl+Shift+K: Start Agent
echo.
pause