@echo off
REM FRONTEND PRODUCTION DEPLOYMENT SCRIPT
REM This script builds and optimizes the frontend for production

echo 🎨 Starting Frontend Production Build...
echo ========================================

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the frontend directory.
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
npm ci --production=false

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Build the application
echo 🏗️ Building production bundle...
npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Production build completed successfully

REM Create deployment scripts
echo 🔧 Creating deployment scripts...

REM Create preview script
echo @echo off > preview-production.bat
echo echo 🌐 Starting Production Preview... >> preview-production.bat
echo npm run preview >> preview-production.bat

REM Create local server script
echo @echo off > serve-production.bat
echo echo 🚀 Starting Production Server... >> serve-production.bat
echo npx serve -s dist -l 3000 >> serve-production.bat
echo echo Production frontend available at: http://localhost:3000 >> serve-production.bat
echo pause >> serve-production.bat

echo ✅ Deployment scripts created

REM Build summary
echo.
echo 🎉 FRONTEND BUILD COMPLETE!
echo ================================
echo.
echo 🚀 Your premium frontend is ready for deployment!
echo.
echo 📋 Next Steps:
echo    1. Test locally: preview-production.bat
echo    2. Serve files: serve-production.bat
echo    3. Deploy dist/ folder to your web server
echo.
echo 📊 Build Output:
dir dist 2>NUL && (
    echo    ✅ Build files created in dist/ directory
    echo    📁 Contents:
    dir /b dist
) || (
    echo    ⚠️ Build directory not found - build may have failed
)

echo.
echo 🔗 Backend API Connection:
type .env | findstr "VITE_API_URL" && (
    echo    ✅ Backend URL configured
) || (
    echo    ⚠️ Backend URL not configured
)

echo.
echo 🎯 Premium Features Included:
echo    ⚡ Lightning-fast contest loading
echo    🔍 Advanced search capabilities  
echo    🎲 Random problem generator
echo    🤖 AI-powered code review
echo    📊 Real-time system health monitoring
echo    🎨 Beautiful responsive UI
echo    🚀 Optimized bundle for fast loading
echo.
echo 🌟 Your frontend is now ready to deliver a premium experience!
echo Ready to compete with LeetCode and Codeforces! 🏆
echo.
pause
