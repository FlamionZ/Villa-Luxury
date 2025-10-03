@echo off
echo Checking MySQL installation and status...
echo.

:: Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not installed or not in PATH
    echo.
    echo 📥 Please install MySQL first:
    echo 1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
    echo 2. Or install XAMPP from: https://www.apachefriends.org/
    echo 3. Or install WAMP from: https://www.wampserver.com/
    echo.
    goto :end
)

echo ✅ MySQL is installed
echo.

:: Check if MySQL service is running
sc query MySQL >nul 2>&1
if %errorlevel% neq 0 (
    :: Try alternative service names
    sc query MySQL80 >nul 2>&1
    if %errorlevel% neq 0 (
        sc query MySQL57 >nul 2>&1
        if %errorlevel% neq 0 (
            echo ❌ MySQL service not found
            echo.
            echo 🔧 Try these commands to start MySQL:
            echo - net start MySQL
            echo - net start MySQL80
            echo - Or start XAMPP/WAMP control panel
            echo.
            goto :end
        ) else (
            set SERVICE_NAME=MySQL57
        )
    ) else (
        set SERVICE_NAME=MySQL80
    )
) else (
    set SERVICE_NAME=MySQL
)

:: Check service status
for /f "tokens=3" %%a in ('sc query %SERVICE_NAME% ^| find "STATE"') do set STATE=%%a

if "%STATE%"=="RUNNING" (
    echo ✅ MySQL service is running
    echo.
    echo 🚀 Ready to initialize database!
    echo Run: npm run init-db
) else (
    echo ❌ MySQL service is stopped
    echo.
    echo 🔧 Starting MySQL service...
    net start %SERVICE_NAME%
    if %errorlevel% equ 0 (
        echo ✅ MySQL service started successfully!
        echo.
        echo 🚀 Ready to initialize database!
        echo Run: npm run init-db
    ) else (
        echo ❌ Failed to start MySQL service
        echo.
        echo 🔧 Try manual start:
        echo - Run as Administrator: net start %SERVICE_NAME%
        echo - Or use XAMPP/WAMP control panel
        echo - Or restart MySQL service in Windows Services
    )
)

:end
echo.
pause