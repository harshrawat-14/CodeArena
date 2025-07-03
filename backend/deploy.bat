@echo off
REM PRODUCTION DEPLOYMENT SCRIPT FOR WINDOWS
REM This script automates the complete production deployment process

echo 🚀 Starting Production Deployment...
echo ========================================

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the backend directory.
    pause
    exit /b 1
)

REM Check environment file
if not exist ".env" (
    echo ⚠️ Warning: .env file not found. Please copy .env.example and configure it.
    echo cp .env.example .env
    pause
    exit /b 1
)

echo ✅ Environment configuration found

REM Install dependencies
echo 📦 Installing production dependencies...
npm ci --only=production

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Run startup validation
echo 🔍 Running startup validation...
npm run startup

if %ERRORLEVEL% neq 0 (
    echo ❌ Startup validation failed
    pause
    exit /b 1
)

echo ✅ Startup validation passed

REM Ask about build process
set /p build_choice="🏗️ Do you want to run the full build process? (y/N): "
if /i "%build_choice%"=="y" (
    echo 🏗️ Starting build process this may take 30-60 minutes...
    npm run build
    
    if %ERRORLEVEL% neq 0 (
        echo ❌ Build process failed
        pause
        exit /b 1
    )
    
    echo ✅ Build process completed successfully
) else (
    echo ⏭️ Skipping build process you can run 'npm run build' later
)

REM Create production scripts
echo 🔧 Creating production scripts...

REM Create start script
echo @echo off > start-production.bat
echo echo 🚀 Starting Premium Codeforces API... >> start-production.bat
echo npm start >> start-production.bat

REM Create monitor script
echo @echo off > monitor.bat
echo echo 🔍 Production System Monitor >> monitor.bat
echo echo ============================ >> monitor.bat
echo. >> monitor.bat
echo REM Check if Node.js process is running >> monitor.bat
echo tasklist /FI "IMAGENAME eq node.exe" 2^>NUL ^| find /I /N "node.exe" ^>NUL >> monitor.bat
echo if "%ERRORLEVEL%"=="0" ( >> monitor.bat
echo     echo ✅ Service is running >> monitor.bat
echo ^) else ( >> monitor.bat
echo     echo ❌ Service is not running >> monitor.bat
echo ^) >> monitor.bat
echo. >> monitor.bat
echo REM Check health endpoint >> monitor.bat
echo curl -s http://localhost:8000/api/health ^>NUL 2^>^&1 >> monitor.bat
echo if "%ERRORLEVEL%"=="0" ( >> monitor.bat
echo     echo ✅ Health endpoint responding >> monitor.bat
echo ^) else ( >> monitor.bat
echo     echo ❌ Health endpoint not responding >> monitor.bat
echo ^) >> monitor.bat
echo. >> monitor.bat
echo echo 🔗 Quick Links: >> monitor.bat
echo echo    Health: http://localhost:8000/api/health >> monitor.bat
echo echo    Diagnostics: http://localhost:8000/api/diagnostics >> monitor.bat
echo echo    Contests: http://localhost:8000/api/contests/2 >> monitor.bat
echo pause >> monitor.bat

REM Create stop script
echo @echo off > stop-production.bat
echo echo 🛑 Stopping Premium Codeforces API... >> stop-production.bat
echo taskkill /IM node.exe /F 2^>NUL >> stop-production.bat
echo echo ✅ Service stopped >> stop-production.bat
echo pause >> stop-production.bat

echo ✅ Production scripts created

REM Final deployment summary
echo.
echo 🎉 PRODUCTION DEPLOYMENT COMPLETE!
echo ==================================
echo.
echo 🚀 Your premium Codeforces API is ready!
echo.
echo 📋 Next Steps:
echo    1. Start the server: start-production.bat
echo    2. Test health: curl http://localhost:8000/api/health
echo    3. Monitor system: monitor.bat
echo.
echo 📊 Available Scripts:
echo    start-production.bat - Start the API server
echo    monitor.bat         - Monitor system health
echo    stop-production.bat  - Stop the API server
echo.
echo 🎯 Performance optimized for premium user experience!
echo ✨ Ready to compete with LeetCode and Codeforces!
echo.
pause
