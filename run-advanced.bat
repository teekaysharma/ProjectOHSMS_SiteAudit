@echo off
REM OHS Management System v2.5 - Advanced Windows Launcher
REM Enhanced version with automatic updates, diagnostics, and troubleshooting

title OHS Management System v2.5 - Advanced Launcher
color 0A
setlocal enabledelayedexpansion

REM Initialize variables
set "NODE_VERSION="
set "NPM_VERSION="
set "GIT_VERSION="
set "MISSING_DEPS=0"
set "NETWORK_AVAILABLE=0"

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Function to log messages
:log_message
echo [%date% %time%] %~1 >> logs\launcher.log
goto :eof

REM Function to check internet connectivity
:check_internet
echo    Checking internet connectivity...
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% equ 0 (
    set "NETWORK_AVAILABLE=1"
    echo    ✅ Internet connection available
    call :log_message "Internet connection available"
) else (
    set "NETWORK_AVAILABLE=0"
    echo    ⚠️  No internet connection detected
    call :log_message "No internet connection detected"
)
goto :eof

REM Function to check Node.js version
:check_nodejs
echo    Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Node.js is not installed!
    set "MISSING_DEPS=1"
    call :log_message "Node.js not found"
    echo.
    echo    Please install Node.js from:
    echo    https://nodejs.org/
    echo.
    echo    Recommended version: Node.js 18.x or higher
    echo    Download LTS version for stability.
    echo.
    echo    After installation, please run this script again.
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('node --version') do set "NODE_VERSION=%%a"
    echo    ✅ Node.js is installed: !NODE_VERSION!
    call :log_message "Node.js found: !NODE_VERSION!"
    
    REM Check Node.js version (minimum 16.x)
    for /f "tokens=2 delims=." %%v in ("!NODE_VERSION:v=!") do set "NODE_MAJOR=%%v"
    if !NODE_MAJOR! lss 16 (
        echo    ⚠️  Node.js version !NODE_VERSION! is outdated!
        echo    Please upgrade to Node.js 16.x or higher for best performance.
        echo    Download from: https://nodejs.org/
        echo.
    )
)
goto :eof

REM Function to check npm version
:check_npm
echo    Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ npm is not installed!
    set "MISSING_DEPS=1"
    call :log_message "npm not found"
    echo.
    echo    npm should be included with Node.js. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('npm --version') do set "NPM_VERSION=%%a"
    echo    ✅ npm is installed: !NPM_VERSION!
    call :log_message "npm found: !NPM_VERSION!"
)
goto :eof

REM Function to check Git installation
:check_git
echo    Checking Git installation...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️  Git is not installed (optional)
    call :log_message "Git not found"
    echo    Git is required if you want to clone from GitHub or use version control.
    echo    Download from: https://git-scm.com/
    echo.
) else (
    for /f "tokens=*" %%a in ('git --version') do set "GIT_VERSION=%%a"
    echo    ✅ Git is installed: !GIT_VERSION!
    call :log_message "Git found: !GIT_VERSION!"
)
goto :eof

REM Function to check project directory
:check_project
echo    Checking project directory...
if not exist "package.json" (
    echo    ❌ package.json not found!
    set "MISSING_DEPS=1"
    call :log_message "package.json not found"
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
    call :log_message "Project directory validated"
    
    REM Check if we're on the correct branch
    if exist ".git" (
        for /f "tokens=*" %%a in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%a"
        if defined CURRENT_BRANCH (
            echo    📂 Current branch: !CURRENT_BRANCH!
            call :log_message "Current branch: !CURRENT_BRANCH!"
            if "!CURRENT_BRANCH!" neq "emergent1" (
                echo    ⚠️  Not on emergent1 branch. Consider switching:
                echo    git checkout emergent1
            )
        )
    )
)
goto :eof

REM Function to install dependencies
:install_dependencies
echo    📦 Dependencies not found. Installing...
echo.
echo    This may take a few minutes depending on your internet speed...
echo.
call :log_message "Starting dependency installation"

REM Ask for permission to install dependencies
set /p INSTALL_DEPS="Do you want to install dependencies now? (Y/N): "
if /i "!INSTALL_DEPS!" neq "Y" (
    echo    ❌ Dependencies installation cancelled.
    call :log_message "Dependencies installation cancelled by user"
    echo.
    echo    You can install dependencies manually by running:
    echo    npm install
    echo.
    pause
    exit /b 1
)

echo.
echo    Installing dependencies...
call :log_message "Running npm install"

npm install

if %errorlevel% neq 0 (
    echo    ❌ Failed to install dependencies!
    call :log_message "npm install failed"
    echo.
    echo    Possible causes:
    echo    1. No internet connection
    echo    2. npm registry issues
    echo    3. Permission issues
    echo.
    echo    Troubleshooting steps:
    echo    1. Check your internet connection
    echo    2. Try: npm cache clean --force
    echo    3. Try: npm install --registry https://registry.npmjs.org/
    echo.
    pause
    exit /b 1
)

echo    ✅ Dependencies installed successfully!
call :log_message "Dependencies installed successfully"
goto :eof

REM Function to show system diagnostics
:show_diagnostics
echo.
echo  ================================================================
echo   SYSTEM DIAGNOSTICS
echo  ================================================================
echo.
echo    Operating System: %OS%
if defined PROCESSOR_ARCHITECTURE (
    echo    Architecture: %PROCESSOR_ARCHITECTURE%
)
if defined NODE_VERSION (
    echo    Node.js: !NODE_VERSION!
)
if defined NPM_VERSION (
    echo    npm: !NPM_VERSION!
)
if defined GIT_VERSION (
    echo    Git: !GIT_VERSION!
)
echo    Network: 
if !NETWORK_AVAILABLE! equ 1 (
    echo    ✅ Available
) else (
    echo    ❌ Not available
)
echo    Current Directory: %CD%
echo.
echo    Project Files:
if exist "package.json" (
    echo    ✅ package.json
) else (
    echo    ❌ package.json
)
if exist "package-lock.json" (
    echo    ✅ package-lock.json
) else (
    echo    ❌ package-lock.json
)
if exist "node_modules" (
    echo    ✅ node_modules
) else (
    echo    ❌ node_modules
)
if exist "dist" (
    echo    ✅ dist (production build)
) else (
    echo    ❌ dist (no production build)
)
echo.
echo    Log Files:
if exist "logs\launcher.log" (
    echo    ✅ launcher.log
) else (
    echo    ❌ launcher.log
)
echo.
pause
goto :eof

REM Function to show troubleshooting options
:show_troubleshooting
echo.
echo  ================================================================
echo   TROUBLESHOOTING OPTIONS
echo  ================================================================
echo.
echo    1. Clear npm cache
echo    2. Reinstall dependencies
echo    3. Check npm registry
echo    4. Test network connectivity
echo    5. View logs
echo    6. Back to main menu
echo.
set /p TROUBLE_CHOICE="Enter your choice (1-6): "

if "!TROUBLE_CHOICE!"=="1" (
    echo.
    echo    Clearing npm cache...
    npm cache clean --force
    echo    ✅ npm cache cleared
    pause
) else if "!TROUBLE_CHOICE!"=="2" (
    echo.
    echo    Reinstalling dependencies...
    if exist "node_modules" rmdir /s /q node_modules
    if exist "package-lock.json" del package-lock.json
    call :install_dependencies
    pause
) else if "!TROUBLE_CHOICE!"=="3" (
    echo.
    echo    Testing npm registry...
    npm config get registry
    echo.
    echo    Pinging registry...
    ping -n 1 registry.npmjs.org
    pause
) else if "!TROUBLE_CHOICE!"=="4" (
    echo.
    echo    Testing network connectivity...
    ping -n 1 8.8.8.8
    ping -n 1 github.com
    ping -n 1 registry.npmjs.org
    pause
) else if "!TROUBLE_CHOICE!"=="5" (
    echo.
    echo    Recent log entries:
    echo    ------------------------------------------------
    if exist "logs\launcher.log" (
        type logs\launcher.log | findstr /i "error fail success"
    ) else (
        echo    No log file found
    )
    echo    ------------------------------------------------
    pause
) else if "!TROUBLE_CHOICE!"=="6" (
    goto :eof
) else (
    echo    Invalid choice. Please try again.
    pause
)
goto :show_troubleshooting

REM Main script starts here
call :log_message "=== Launcher started ==="
echo.
echo  ================================================================
echo   OHS MANAGEMENT SYSTEM v2.5 - ADVANCED WINDOWS LAUNCHER
echo  ================================================================
echo.

REM Show main menu
:main_menu
echo.
echo    MAIN MENU
echo    ================================================================
echo.
echo    1. 🚀 Launch Application
echo    2. 🔧 System Diagnostics
echo    3. 🔍 Troubleshooting
echo    4. 📖 View Documentation
echo    5. 🌐 Check for Updates
echo    6. ❌ Exit
echo.
set /p MAIN_CHOICE="Enter your choice (1-6): "

if "!MAIN_CHOICE!"=="1" goto launch_application
if "!MAIN_CHOICE!"=="2" goto show_diagnostics
if "!MAIN_CHOICE!"=="3" goto show_troubleshooting
if "!MAIN_CHOICE!"=="4" goto view_documentation
if "!MAIN_CHOICE!"=="5" goto check_updates
if "!MAIN_CHOICE!"=="6" goto exit_script
echo    Invalid choice. Please try again.
goto main_menu

:launch_application
echo.
echo  ================================================================
echo   LAUNCHING OHS MANAGEMENT SYSTEM v2.5
echo  ================================================================
echo.

REM Check internet connectivity
call :check_internet

REM Check Node.js
call :check_nodejs

REM Check npm
call :check_npm

REM Check Git
call :check_git

REM Check project directory
call :check_project

REM Check dependencies
echo.
echo    Checking dependencies...
if not exist "node_modules" (
    call :install_dependencies
) else (
    echo    ✅ Dependencies are already installed
    call :log_message "Dependencies already installed"
)

REM All checks passed, ready to launch
echo.
echo  ================================================================
echo   ALL CHECKS PASSED - READY TO LAUNCH!
echo  ================================================================
echo.
echo    Node.js: !NODE_VERSION!
echo    npm: !NPM_VERSION!
if defined GIT_VERSION (
    echo    Git: !GIT_VERSION!
) else (
    echo    Git: Not installed (optional)
)
echo    Dependencies: ✅ Installed
echo    Network: 
if !NETWORK_AVAILABLE! equ 1 (
    echo    ✅ Available
) else (
    echo    ❌ Not available
)
echo.
echo    Starting OHS Management System v2.5...
echo.

REM Ask user what they want to do
echo    Choose launch option:
echo    1. Development server (recommended for testing)
echo    2. Production build
echo    3. Preview production build
echo    4. Back to main menu
echo.
set /p LAUNCH_OPTION="Enter your choice (1-4): "

if "!LAUNCH_OPTION!"=="1" (
    echo.
    echo    🚀 Starting development server...
    echo    Please wait for the server to start...
    echo.
    echo    The application will open in your default browser at:
    echo    http://localhost:5173
    echo.
    echo    Press Ctrl+C to stop the server when you're done.
    echo.
    call :log_message "Starting development server"
    npm run dev
) else if "!LAUNCH_OPTION!"=="2" (
    echo.
    echo    🔨 Creating production build...
    echo.
    call :log_message "Starting production build"
    npm run build
    
    if %errorlevel% equ 0 (
        echo.
        echo    ✅ Production build created successfully!
        echo    Build files are in the 'dist/' folder
        echo.
        call :log_message "Production build successful"
    ) else (
        echo    ❌ Build failed! Please check the error messages above.
        call :log_message "Production build failed"
    )
    
    pause
) else if "!LAUNCH_OPTION!"=="3" (
    echo.
    echo    🔍 Checking if production build exists...
    if not exist "dist" (
        echo    📦 Production build not found. Creating build...
        echo.
        call :log_message "Creating production build for preview"
        npm run build
        
        if %errorlevel% neq 0 (
            echo    ❌ Build failed! Please check the error messages above.
            call :log_message "Production build for preview failed"
            pause
            goto main_menu
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
    call :log_message "Starting preview server"
    npm run preview
) else if "!LAUNCH_OPTION!"=="4" (
    goto main_menu
) else (
    echo    Invalid choice. Please try again.
    pause
    goto launch_application
)

goto main_menu

:view_documentation
echo.
echo  ================================================================
echo   DOCUMENTATION
echo  ================================================================
echo.
echo    Available documentation files:
echo.
if exist "README.md" (
    echo    1. README.md - Main documentation
)
if exist "DEPLOYMENT.md" (
    echo    2. DEPLOYMENT.md - Deployment guide
)
if exist "CHANGELOG.md" (
    echo    3. CHANGELOG.md - Version history
)
if exist "PACKAGE.md" (
    echo    4. PACKAGE.md - Package information
)
echo    5. Back to main menu
echo.
set /p DOC_CHOICE="Enter your choice (1-5): "

if "!DOC_CHOICE!"=="1" (
    if exist "README.md" (
        echo.
        echo    Opening README.md...
        start notepad README.md
    )
) else if "!DOC_CHOICE!"=="2" (
    if exist "DEPLOYMENT.md" (
        echo.
        echo    Opening DEPLOYMENT.md...
        start notepad DEPLOYMENT.md
    )
) else if "!DOC_CHOICE!"=="3" (
    if exist "CHANGELOG.md" (
        echo.
        echo    Opening CHANGELOG.md...
        start notepad CHANGELOG.md
    )
) else if "!DOC_CHOICE!"=="4" (
    if exist "PACKAGE.md" (
        echo.
        echo    Opening PACKAGE.md...
        start notepad PACKAGE.md
    )
) else if "!DOC_CHOICE!"=="5" (
    goto main_menu
) else (
    echo    Invalid choice. Please try again.
)
pause
goto view_documentation

:check_updates
echo.
echo  ================================================================
echo   CHECKING FOR UPDATES
echo  ================================================================
echo.

if !NETWORK_AVAILABLE! equ 0 (
    echo    ❌ No internet connection available.
    echo    Please connect to the internet and try again.
    pause
    goto main_menu
)

if not defined GIT_VERSION (
    echo    ❌ Git is not installed. Cannot check for updates.
    echo    Please install Git from: https://git-scm.com/
    pause
    goto main_menu
)

if not exist ".git" (
    echo    ❌ This is not a Git repository.
    echo    Cannot check for updates.
    pause
    goto main_menu
)

echo    Checking for updates...
echo.
call :log_message "Checking for updates"

REM Fetch latest changes
git fetch origin 2>nul
if %errorlevel% neq 0 (
    echo    ❌ Failed to fetch updates from GitHub.
    echo    Please check your internet connection and repository access.
    call :log_message "Failed to fetch updates"
    pause
    goto main_menu
)

REM Check if there are updates
for /f "tokens=*" %%a in ('git rev-list HEAD...origin/emergent1 --count 2^>nul') do set "COMMITS_BEHIND=%%a"

if defined COMMITS_BEHIND (
    if !COMMITS_BEHIND! gtr 0 (
        echo    📥 Updates available! (!COMMITS_BEHIND! commits behind)
        echo.
        set /p UPDATE_CHOICE="Do you want to update now? (Y/N): "
        if /i "!UPDATE_CHOICE!"=="Y" (
            echo.
            echo    Updating...
            git pull origin emergent1
            if %errorlevel% equ 0 (
                echo    ✅ Update successful!
                call :log_message "Update successful"
                echo.
                echo    Please run the launcher again to ensure all dependencies are up to date.
            ) else (
                echo    ❌ Update failed! Please check the error messages above.
                call :log_message "Update failed"
            )
        ) else (
            echo    Update cancelled.
        )
    ) else (
        echo    ✅ Your system is up to date!
        call :log_message "System is up to date"
    )
) else (
    echo    ✅ Your system is up to date!
    call :log_message "System is up to date"
)

pause
goto main_menu

:exit_script
echo.
echo  ================================================================
echo   THANK YOU FOR USING OHS MANAGEMENT SYSTEM v2.5!
echo  ================================================================
echo.
echo    For support and documentation:
echo    📖 README.md - Main documentation
echo    🚀 DEPLOYMENT.md - Deployment guide
echo    📋 CHANGELOG.md - Version history
echo.
echo    GitHub Repository:
echo    https://github.com/teekaysharma/ProjectOHSMS_SiteAudit
echo.
echo    Report issues at:
echo    https://github.com/teekaysharma/ProjectOHSMS_SiteAudit/issues
echo.
call :log_message "=== Launcher ended ==="
pause
exit /b 0