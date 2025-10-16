@echo off
REM OHS Management System v2.5 - Windows Launcher
REM This script checks for dependencies and launches the application

title OHS Management System v2.5 Launcher
color 0A
echo.
echo  ================================================================
echo   OHS MANAGEMENT SYSTEM v2.5 - WINDOWS LAUNCHER
echo  ================================================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Node.js is not installed!
    echo.
    echo    Please install Node.js from:
    echo    https://nodejs.org/
    echo.
    echo    Recommended version: Node.js 18.x or higher
    echo.
    echo    After installation, please run this script again.
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    echo    ✅ Node.js is installed: %NODE_VERSION%
)

REM Check if npm is installed
echo.
echo [2/5] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ npm is not installed!
    echo.
    echo    npm should be included with Node.js. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
    echo    ✅ npm is installed: %NPM_VERSION%
)

REM Check if Git is installed (optional, for version control)
echo.
echo [3/5] Checking Git installation...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️  Git is not installed (optional)
    echo    Git is required if you want to clone from GitHub
    echo    Download from: https://git-scm.com/
    echo.
) else (
    for /f "tokens=*" %%a in ('git --version') do set GIT_VERSION=%%a
    echo    ✅ Git is installed: %GIT_VERSION%
)

REM Check if we're in the correct directory (look for package.json)
echo.
echo [4/5] Checking project directory...
if not exist "package.json" (
    echo    ❌ package.json not found!
    echo.
    echo    Please make sure you're running this script from the project directory.
    echo.
    echo    If you haven't downloaded the project yet:
    echo    1. Download from: https://github.com/teekaysharma/ProjectOHSMS_SiteAudit
    echo    2. Extract to a folder
    echo    3. Run this script from that folder
    echo.
    pause
    exit /b 1
) else (
    echo    ✅ Project directory found
)

REM Check if node_modules exists
echo.
echo [5/5] Checking dependencies...
if not exist "node_modules" (
    echo    📦 Dependencies not found. Installing...
    echo.
    echo    This may take a few minutes...
    echo.
    
    REM Ask for permission to install dependencies
    set /p INSTALL_DEPS="Do you want to install dependencies now? (Y/N): "
    if /i "%INSTALL_DEPS%" neq "Y" (
        echo    ❌ Dependencies installation cancelled.
        echo.
        echo    You can install dependencies manually by running:
        echo    npm install
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo    Installing dependencies...
    npm install
    
    if %errorlevel% neq 0 (
        echo    ❌ Failed to install dependencies!
        echo.
        echo    Please check your internet connection and try again.
        echo    You can also try running: npm install manually
        echo.
        pause
        exit /b 1
    )
    
    echo    ✅ Dependencies installed successfully!
) else (
    echo    ✅ Dependencies are already installed
)

REM All checks passed, ready to launch
echo.
echo  ================================================================
echo   ALL CHECKS PASSED - READY TO LAUNCH!
echo  ================================================================
echo.
echo    Node.js: %NODE_VERSION%
echo    npm: %NPM_VERSION%
if defined GIT_VERSION (
    echo    Git: %GIT_VERSION%
) else (
    echo    Git: Not installed (optional)
)
echo    Dependencies: ✅ Installed
echo.
echo    Starting OHS Management System v2.5...
echo.

REM Ask user what they want to do
echo    Choose launch option:
echo    1. Development server (recommended for testing)
echo    2. Production build
echo    3. Preview production build
echo    4. Exit
echo.
set /p LAUNCH_OPTION="Enter your choice (1-4): "

if "%LAUNCH_OPTION%"=="1" (
    echo.
    echo    🚀 Starting development server...
    echo    Please wait for the server to start...
    echo.
    echo    The application will open in your default browser at:
    echo    http://localhost:5173
    echo.
    echo    Press Ctrl+C to stop the server when you're done.
    echo.
    npm run dev
) else if "%LAUNCH_OPTION%"=="2" (
    echo.
    echo    🔨 Creating production build...
    echo.
    npm run build
    
    if %errorlevel% equ 0 (
        echo.
        echo    ✅ Production build created successfully!
        echo    Build files are in the 'dist/' folder
        echo.
        echo    You can deploy these files to a web server.
        echo.
    ) else (
        echo    ❌ Build failed! Please check the error messages above.
    )
    
    pause
) else if "%LAUNCH_OPTION%"=="3" (
    echo.
    echo    🔍 Checking if production build exists...
    if not exist "dist" (
        echo    📦 Production build not found. Creating build...
        echo.
        npm run build
        
        if %errorlevel% neq 0 (
            echo    ❌ Build failed! Please check the error messages above.
            pause
            exit /b 1
        )
    )
    
    echo    🚀 Starting preview server...
    echo    Please wait for the server to start...
    echo.
    echo    The application will open in your default browser at:
    echo    http://localhost:4173
    echo.
    echo    Press Ctrl+C to stop the server when you're done.
    echo.
    npm run preview
) else (
    echo.
    echo    👋 Goodbye!
    echo.
    pause
    exit /b 0
)

REM End of script
echo.
echo    Thank you for using OHS Management System v2.5!
echo.
pause