@echo off
setlocal enabledelayedexpansion

:: Online Judge Platform Deployment Script for Windows
:: This script helps deploy the OJ platform with all required compilers

set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:: Function to print colored output
call :print_header "Online Judge Platform Deployment"

if "%1"=="" (
    set "action=deploy"
) else (
    set "action=%1"
)

if "%action%"=="deploy" (
    call :deploy_services
) else if "%action%"=="test" (
    call :test_compilers
) else if "%action%"=="cleanup" (
    call :cleanup
) else if "%action%"=="restart" (
    call :restart_services
) else if "%action%"=="logs" (
    call :show_logs
) else if "%action%"=="stop" (
    call :stop_services
) else (
    echo Usage: %0 {deploy^|test^|cleanup^|restart^|logs^|stop}
    echo   deploy  - Build and start all services (default)
    echo   test    - Test compiler availability
    echo   cleanup - Stop services and clean up
    echo   restart - Restart all services
    echo   logs    - Show service logs
    echo   stop    - Stop all services
    exit /b 1
)

goto :eof

:print_header
echo %BLUE%========================================%NC%
echo %BLUE% %~1 %NC%
echo %BLUE%========================================%NC%
goto :eof

:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:check_docker
call :print_status "Checking Docker installation..."
docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit /b 1
)

call :print_status "Docker and Docker Compose are installed"
goto :eof

:deploy_services
call :print_header "Building and Starting Services"
call :check_docker

call :print_status "Building Docker images..."
docker-compose build --no-cache
if errorlevel 1 (
    call :print_error "Failed to build images"
    exit /b 1
)

call :print_status "Starting services..."
docker-compose up -d
if errorlevel 1 (
    call :print_error "Failed to start services"
    exit /b 1
)

call :print_status "Waiting for services to start..."
timeout /t 10 /nobreak >nul

call :print_status "Checking service health..."
docker-compose ps

call :show_urls
goto :eof

:test_compilers
call :print_header "Testing Compiler Availability"

call :print_status "Testing C++ compilers..."
docker-compose exec backend bash -c "echo 'Testing C++ compilers...'; gcc --version | head -1; g++ --version | head -1"

call :print_status "Testing Python..."
docker-compose exec backend bash -c "echo 'Python version:'; python --version; echo 'print(\"Python works!\")' > /tmp/test.py; python /tmp/test.py"

call :print_status "Testing Java..."
docker-compose exec backend bash -c "echo 'Java version:'; java --version; echo 'public class Test { public static void main(String[] args) { System.out.println(\"Java works!\"); } }' > /tmp/Test.java; javac /tmp/Test.java -d /tmp && java -cp /tmp Test"
goto :eof

:show_urls
call :print_header "Deployment Complete!"

call :print_status "Services are running at:"
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   Nginx Proxy: http://localhost:80
echo.

call :print_status "Available compilers:"
echo   C++14, C++17, C++20, C++23 (with GCC 9-12)
echo   Python 3.x
echo   Java 17
echo.

call :print_status "Useful commands:"
echo   View logs: docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart services: docker-compose restart
echo   Update services: docker-compose pull ^&^& docker-compose up -d
goto :eof

:cleanup
call :print_header "Cleaning Up"
call :print_status "Stopping services..."
docker-compose down

call :print_status "Removing unused images..."
docker image prune -f

call :print_status "Cleanup complete"
goto :eof

:restart_services
call :print_status "Restarting services..."
docker-compose restart
goto :eof

:show_logs
docker-compose logs -f
goto :eof

:stop_services
call :print_status "Stopping services..."
docker-compose down
goto :eof
