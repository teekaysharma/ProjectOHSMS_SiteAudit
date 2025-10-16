# OHS Management System v2.5 - PowerShell Launcher
# This script checks for dependencies and launches the application

param(
    [string]$Mode = "interactive",
    [switch]$SkipChecks = $false,
    [switch]$ForceInstall = $false
)

# Set console colors
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "Green"
Clear-Host

# Initialize variables
$Script:LogPath = "logs\launcher.log"
$Script:NodeVersion = $null
$Script:NpmVersion = $null
$Script:GitVersion = $null
$Script:NetworkAvailable = $false
$Script:MissingDeps = $false

# Create logs directory if it doesn't exist
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
}

# Function to log messages
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Add-Content -Path $Script:LogPath -Value $logMessage
}

# Function to check internet connectivity
function Test-InternetConnection {
    Write-Host "    Checking internet connectivity..." -ForegroundColor Yellow
    try {
        $connection = Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet
        if ($connection) {
            $Script:NetworkAvailable = $true
            Write-Host "    ✅ Internet connection available" -ForegroundColor Green
            Write-Log "Internet connection available"
        } else {
            $Script:NetworkAvailable = $false
            Write-Host "    ⚠️  No internet connection detected" -ForegroundColor Yellow
            Write-Log "No internet connection detected"
        }
    } catch {
        $Script:NetworkAvailable = $false
        Write-Host "    ⚠️  No internet connection detected" -ForegroundColor Yellow
        Write-Log "No internet connection detected"
    }
}

# Function to check Node.js
function Test-NodeJS {
    Write-Host "    Checking Node.js installation..." -ForegroundColor Yellow
    try {
        $nodeOutput = node --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $Script:NodeVersion = $nodeOutput.Trim()
            Write-Host "    ✅ Node.js is installed: $Script:NodeVersion" -ForegroundColor Green
            Write-Log "Node.js found: $Script:NodeVersion"
            
            # Check Node.js version (minimum 16.x)
            $versionParts = $Script:NodeVersion -replace 'v', '' -split '\.'
            $majorVersion = [int]$versionParts[0]
            if ($majorVersion -lt 16) {
                Write-Host "    ⚠️  Node.js version $Script:NodeVersion is outdated!" -ForegroundColor Yellow
                Write-Host "    Please upgrade to Node.js 16.x or higher for best performance." -ForegroundColor Yellow
                Write-Host "    Download from: https://nodejs.org/" -ForegroundColor Yellow
            }
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Host "    ❌ Node.js is not installed!" -ForegroundColor Red
        $Script:MissingDeps = $true
        Write-Log "Node.js not found"
        Write-Host ""
        Write-Host "    Please install Node.js from:" -ForegroundColor White
        Write-Host "    https://nodejs.org/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "    Recommended version: Node.js 18.x or higher" -ForegroundColor White
        Write-Host "    Download LTS version for stability." -ForegroundColor White
        Write-Host ""
        Write-Host "    After installation, please run this script again." -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Function to check npm
function Test-Npm {
    Write-Host "    Checking npm installation..." -ForegroundColor Yellow
    try {
        $npmOutput = npm --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $Script:NpmVersion = $npmOutput.Trim()
            Write-Host "    ✅ npm is installed: $Script:NpmVersion" -ForegroundColor Green
            Write-Log "npm found: $Script:NpmVersion"
        } else {
            throw "npm not found"
        }
    } catch {
        Write-Host "    ❌ npm is not installed!" -ForegroundColor Red
        $Script:MissingDeps = $true
        Write-Log "npm not found"
        Write-Host ""
        Write-Host "    npm should be included with Node.js. Please reinstall Node.js." -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Function to check Git
function Test-Git {
    Write-Host "    Checking Git installation..." -ForegroundColor Yellow
    try {
        $gitOutput = git --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $Script:GitVersion = $gitOutput.Trim()
            Write-Host "    ✅ Git is installed: $Script:GitVersion" -ForegroundColor Green
            Write-Log "Git found: $Script:GitVersion"
        } else {
            throw "Git not found"
        }
    } catch {
        Write-Host "    ⚠️  Git is not installed (optional)" -ForegroundColor Yellow
        Write-Log "Git not found"
        Write-Host "    Git is required if you want to clone from GitHub or use version control." -ForegroundColor White
        Write-Host "    Download from: https://git-scm.com/" -ForegroundColor Cyan
        Write-Host ""
    }
}

# Function to check project directory
function Test-ProjectDirectory {
    Write-Host "    Checking project directory..." -ForegroundColor Yellow
    if (-not (Test-Path "package.json")) {
        Write-Host "    ❌ package.json not found!" -ForegroundColor Red
        $Script:MissingDeps = $true
        Write-Log "package.json not found"
        Write-Host ""
        Write-Host "    Please make sure you're running this script from the project directory." -ForegroundColor White
        Write-Host ""
        Write-Host "    If you haven't downloaded the project yet:" -ForegroundColor White
        Write-Host "    1. Download from: https://github.com/teekaysharma/ProjectOHSMS_SiteAudit" -ForegroundColor Cyan
        Write-Host "    2. Extract to a folder" -ForegroundColor White
        Write-Host "    3. Run this script from that folder" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    } else {
        Write-Host "    ✅ Project directory found" -ForegroundColor Green
        Write-Log "Project directory validated"
        
        # Check if we're on the correct branch
        if (Test-Path ".git") {
            try {
                $currentBranch = git branch --show-current 2>$null
                if ($currentBranch) {
                    Write-Host "    📂 Current branch: $currentBranch" -ForegroundColor Cyan
                    Write-Log "Current branch: $currentBranch"
                    if ($currentBranch -ne "emergent1") {
                        Write-Host "    ⚠️  Not on emergent1 branch. Consider switching:" -ForegroundColor Yellow
                        Write-Host "    git checkout emergent1" -ForegroundColor Cyan
                    }
                }
            } catch {
                # Git branch check failed, continue
            }
        }
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "    📦 Dependencies not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    This may take a few minutes depending on your internet speed..." -ForegroundColor White
    Write-Host ""
    Write-Log "Starting dependency installation"
    
    if (-not $ForceInstall) {
        $installChoice = Read-Host "Do you want to install dependencies now? (Y/N)"
        if ($installChoice -ne "Y" -and $installChoice -ne "y") {
            Write-Host "    ❌ Dependencies installation cancelled." -ForegroundColor Red
            Write-Log "Dependencies installation cancelled by user"
            Write-Host ""
            Write-Host "    You can install dependencies manually by running:" -ForegroundColor White
            Write-Host "    npm install" -ForegroundColor Cyan
            Write-Host ""
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    
    Write-Host ""
    Write-Host "    Installing dependencies..." -ForegroundColor Yellow
    Write-Log "Running npm install"
    
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Dependencies installed successfully!" -ForegroundColor Green
            Write-Log "Dependencies installed successfully"
        } else {
            throw "npm install failed"
        }
    } catch {
        Write-Host "    ❌ Failed to install dependencies!" -ForegroundColor Red
        Write-Log "npm install failed"
        Write-Host ""
        Write-Host "    Possible causes:" -ForegroundColor White
        Write-Host "    1. No internet connection" -ForegroundColor White
        Write-Host "    2. npm registry issues" -ForegroundColor White
        Write-Host "    3. Permission issues" -ForegroundColor White
        Write-Host ""
        Write-Host "    Troubleshooting steps:" -ForegroundColor White
        Write-Host "    1. Check your internet connection" -ForegroundColor White
        Write-Host "    2. Try: npm cache clean --force" -ForegroundColor Cyan
        Write-Host "    3. Try: npm install --registry https://registry.npmjs.org/" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Function to show system diagnostics
function Show-Diagnostics {
    Write-Host ""
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host "   SYSTEM DIAGNOSTICS" -ForegroundColor Cyan
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "    Operating System: $((Get-CimInstance -ClassName Win32_OperatingSystem).Caption)" -ForegroundColor White
    if ($Script:NodeVersion) {
        Write-Host "    Node.js: $Script:NodeVersion" -ForegroundColor White
    }
    if ($Script:NpmVersion) {
        Write-Host "    npm: $Script:NpmVersion" -ForegroundColor White
    }
    if ($Script:GitVersion) {
        Write-Host "    Git: $Script:GitVersion" -ForegroundColor White
    }
    Write-Host "    Network: $(if ($Script:NetworkAvailable) { '✅ Available' } else { '❌ Not available' })" -ForegroundColor White
    Write-Host "    Current Directory: $PWD" -ForegroundColor White
    Write-Host ""
    Write-Host "    Project Files:" -ForegroundColor White
    Write-Host "    $(if (Test-Path 'package.json') { '✅' } else { '❌' }) package.json" -ForegroundColor White
    Write-Host "    $(if (Test-Path 'package-lock.json') { '✅' } else { '❌' }) package-lock.json" -ForegroundColor White
    Write-Host "    $(if (Test-Path 'node_modules') { '✅' } else { '❌' }) node_modules" -ForegroundColor White
    Write-Host "    $(if (Test-Path 'dist') { '✅' } else { '❌' }) dist (production build)" -ForegroundColor White
    Write-Host ""
    Write-Host "    Log Files:" -ForegroundColor White
    Write-Host "    $(if (Test-Path $Script:LogPath) { '✅' } else { '❌' }) launcher.log" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Function to show troubleshooting options
function Show-Troubleshooting {
    do {
        Write-Host ""
        Write-Host "  ================================================================" -ForegroundColor Cyan
        Write-Host "   TROUBLESHOOTING OPTIONS" -ForegroundColor Cyan
        Write-Host "  ================================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "    1. Clear npm cache" -ForegroundColor White
        Write-Host "    2. Reinstall dependencies" -ForegroundColor White
        Write-Host "    3. Check npm registry" -ForegroundColor White
        Write-Host "    4. Test network connectivity" -ForegroundColor White
        Write-Host "    5. View logs" -ForegroundColor White
        Write-Host "    6. Back to main menu" -ForegroundColor White
        Write-Host ""
        $troubleChoice = Read-Host "Enter your choice (1-6)"
        
        switch ($troubleChoice) {
            "1" {
                Write-Host ""
                Write-Host "    Clearing npm cache..." -ForegroundColor Yellow
                npm cache clean --force
                Write-Host "    ✅ npm cache cleared" -ForegroundColor Green
                Read-Host "Press Enter to continue"
            }
            "2" {
                Write-Host ""
                Write-Host "    Reinstalling dependencies..." -ForegroundColor Yellow
                if (Test-Path "node_modules") {
                    Remove-Item -Path "node_modules" -Recurse -Force
                }
                if (Test-Path "package-lock.json") {
                    Remove-Item -Path "package-lock.json" -Force
                }
                Install-Dependencies
                Read-Host "Press Enter to continue"
            }
            "3" {
                Write-Host ""
                Write-Host "    Testing npm registry..." -ForegroundColor Yellow
                $registry = npm config get registry
                Write-Host "    Current registry: $registry" -ForegroundColor White
                Write-Host ""
                Write-Host "    Pinging registry..." -ForegroundColor Yellow
                Test-Connection -ComputerName "registry.npmjs.org" -Count 1
                Read-Host "Press Enter to continue"
            }
            "4" {
                Write-Host ""
                Write-Host "    Testing network connectivity..." -ForegroundColor Yellow
                Test-Connection -ComputerName "8.8.8.8" -Count 1
                Test-Connection -ComputerName "github.com" -Count 1
                Test-Connection -ComputerName "registry.npmjs.org" -Count 1
                Read-Host "Press Enter to continue"
            }
            "5" {
                Write-Host ""
                Write-Host "    Recent log entries:" -ForegroundColor Yellow
                Write-Host "    ------------------------------------------------" -ForegroundColor Gray
                if (Test-Path $Script:LogPath) {
                    Get-Content $Script:LogPath | Where-Object { $_ -match "error|fail|success" } | Select-Object -Last 10
                } else {
                    Write-Host "    No log file found" -ForegroundColor Red
                }
                Write-Host "    ------------------------------------------------" -ForegroundColor Gray
                Read-Host "Press Enter to continue"
            }
            "6" {
                return
            }
            default {
                Write-Host "    Invalid choice. Please try again." -ForegroundColor Red
                Read-Host "Press Enter to continue"
            }
        }
    } while ($true)
}

# Function to launch application
function Launch-Application {
    Write-Host ""
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host "   LAUNCHING OHS MANAGEMENT SYSTEM v2.5" -ForegroundColor Cyan
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $SkipChecks) {
        # Check internet connectivity
        Test-InternetConnection
        
        # Check Node.js
        Test-NodeJS
        
        # Check npm
        Test-Npm
        
        # Check Git
        Test-Git
        
        # Check project directory
        Test-ProjectDirectory
        
        # Check dependencies
        Write-Host ""
        Write-Host "    Checking dependencies..." -ForegroundColor Yellow
        if (-not (Test-Path "node_modules")) {
            Install-Dependencies
        } else {
            Write-Host "    ✅ Dependencies are already installed" -ForegroundColor Green
            Write-Log "Dependencies already installed"
        }
    }
    
    # All checks passed, ready to launch
    Write-Host ""
    Write-Host "  ================================================================" -ForegroundColor Green
    Write-Host "   ALL CHECKS PASSED - READY TO LAUNCH!" -ForegroundColor Green
    Write-Host "  ================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "    Node.js: $Script:NodeVersion" -ForegroundColor White
    Write-Host "    npm: $Script:NpmVersion" -ForegroundColor White
    if ($Script:GitVersion) {
        Write-Host "    Git: $Script:GitVersion" -ForegroundColor White
    } else {
        Write-Host "    Git: Not installed (optional)" -ForegroundColor White
    }
    Write-Host "    Dependencies: ✅ Installed" -ForegroundColor White
    Write-Host "    Network: $(if ($Script:NetworkAvailable) { '✅ Available' } else { '❌ Not available' })" -ForegroundColor White
    Write-Host ""
    Write-Host "    Starting OHS Management System v2.5..." -ForegroundColor Yellow
    Write-Host ""
    
    # Ask user what they want to do
    Write-Host "    Choose launch option:" -ForegroundColor White
    Write-Host "    1. Development server (recommended for testing)" -ForegroundColor White
    Write-Host "    2. Production build" -ForegroundColor White
    Write-Host "    3. Preview production build" -ForegroundColor White
    Write-Host "    4. Back to main menu" -ForegroundColor White
    Write-Host ""
    $launchOption = Read-Host "Enter your choice (1-4)"
    
    switch ($launchOption) {
        "1" {
            Write-Host ""
            Write-Host "    🚀 Starting development server..." -ForegroundColor Yellow
            Write-Host "    Please wait for the server to start..." -ForegroundColor White
            Write-Host ""
            Write-Host "    The application will open in your default browser at:" -ForegroundColor White
            Write-Host "    http://localhost:5173" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "    Press Ctrl+C to stop the server when you're done." -ForegroundColor White
            Write-Host ""
            Write-Log "Starting development server"
            npm run dev
        }
        "2" {
            Write-Host ""
            Write-Host "    🔨 Creating production build..." -ForegroundColor Yellow
            Write-Host ""
            Write-Log "Starting production build"
            npm run build
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "    ✅ Production build created successfully!" -ForegroundColor Green
                Write-Host "    Build files are in the 'dist/' folder" -ForegroundColor White
                Write-Host ""
                Write-Log "Production build successful"
            } else {
                Write-Host ""
                Write-Host "    ❌ Build failed! Please check the error messages above." -ForegroundColor Red
                Write-Log "Production build failed"
            }
            
            Read-Host "Press Enter to continue"
        }
        "3" {
            Write-Host ""
            Write-Host "    🔍 Checking if production build exists..." -ForegroundColor Yellow
            if (-not (Test-Path "dist")) {
                Write-Host "    📦 Production build not found. Creating build..." -ForegroundColor Yellow
                Write-Host ""
                Write-Log "Creating production build for preview"
                npm run build
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "    ❌ Build failed! Please check the error messages above." -ForegroundColor Red
                    Write-Log "Production build for preview failed"
                    Read-Host "Press Enter to continue"
                    return
                }
            }
            
            Write-Host "    🚀 Starting preview server..." -ForegroundColor Yellow
            Write-Host "    Please wait for the server to start..." -ForegroundColor White
            Write-Host ""
            Write-Host "    The application will open in your default browser at:" -ForegroundColor White
            Write-Host "    http://localhost:4173" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "    Press Ctrl+C to stop the server when you're done." -ForegroundColor White
            Write-Host ""
            Write-Log "Starting preview server"
            npm run preview
        }
        "4" {
            return
        }
        default {
            Write-Host "    Invalid choice. Please try again." -ForegroundColor Red
            Read-Host "Press Enter to continue"
        }
    }
}

# Function to view documentation
function View-Documentation {
    do {
        Write-Host ""
        Write-Host "  ================================================================" -ForegroundColor Cyan
        Write-Host "   DOCUMENTATION" -ForegroundColor Cyan
        Write-Host "  ================================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "    Available documentation files:" -ForegroundColor White
        Write-Host ""
        $docFiles = @()
        if (Test-Path "README.md") { $docFiles += "README.md" }
        if (Test-Path "DEPLOYMENT.md") { $docFiles += "DEPLOYMENT.md" }
        if (Test-Path "CHANGELOG.md") { $docFiles += "CHANGELOG.md" }
        if (Test-Path "PACKAGE.md") { $docFiles += "PACKAGE.md" }
        
        for ($i = 0; $i -lt $docFiles.Count; $i++) {
            Write-Host "    $($i + 1). $($docFiles[$i])" -ForegroundColor White
        }
        Write-Host "    $($docFiles.Count + 1). Back to main menu" -ForegroundColor White
        Write-Host ""
        $docChoice = Read-Host "Enter your choice (1-$($docFiles.Count + 1))"
        
        if ($docChoice -match '^\d+$' -and [int]$docChoice -ge 1 -and [int]$docChoice -le $docFiles.Count) {
            $selectedFile = $docFiles[[int]$docChoice - 1]
            Write-Host ""
            Write-Host "    Opening $selectedFile..." -ForegroundColor Yellow
            Start-Process notepad.exe $selectedFile
            Read-Host "Press Enter to continue"
        } elseif ($docChoice -eq ($docFiles.Count + 1).ToString()) {
            return
        } else {
            Write-Host "    Invalid choice. Please try again." -ForegroundColor Red
            Read-Host "Press Enter to continue"
        }
    } while ($true)
}

# Function to check for updates
function Check-Updates {
    Write-Host ""
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host "   CHECKING FOR UPDATES" -ForegroundColor Cyan
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $Script:NetworkAvailable) {
        Write-Host "    ❌ No internet connection available." -ForegroundColor Red
        Write-Host "    Please connect to the internet and try again." -ForegroundColor White
        Read-Host "Press Enter to continue"
        return
    }
    
    if (-not $Script:GitVersion) {
        Write-Host "    ❌ Git is not installed. Cannot check for updates." -ForegroundColor Red
        Write-Host "    Please install Git from: https://git-scm.com/" -ForegroundColor Cyan
        Read-Host "Press Enter to continue"
        return
    }
    
    if (-not (Test-Path ".git")) {
        Write-Host "    ❌ This is not a Git repository." -ForegroundColor Red
        Write-Host "    Cannot check for updates." -ForegroundColor White
        Read-Host "Press Enter to continue"
        return
    }
    
    Write-Host "    Checking for updates..." -ForegroundColor Yellow
    Write-Host ""
    Write-Log "Checking for updates"
    
    try {
        # Fetch latest changes
        git fetch origin 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "    ❌ Failed to fetch updates from GitHub." -ForegroundColor Red
            Write-Host "    Please check your internet connection and repository access." -ForegroundColor White
            Write-Log "Failed to fetch updates"
            Read-Host "Press Enter to continue"
            return
        }
        
        # Check if there are updates
        $commitsBehind = git rev-list HEAD...origin/emergent1 --count 2>$null
        if ($commitsBehind -and $commitsBehind -gt 0) {
            Write-Host "    📥 Updates available! ($commitsBehind commits behind)" -ForegroundColor Yellow
            Write-Host ""
            $updateChoice = Read-Host "Do you want to update now? (Y/N)"
            if ($updateChoice -eq "Y" -or $updateChoice -eq "y") {
                Write-Host ""
                Write-Host "    Updating..." -ForegroundColor Yellow
                git pull origin emergent1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✅ Update successful!" -ForegroundColor Green
                    Write-Log "Update successful"
                    Write-Host ""
                    Write-Host "    Please run the launcher again to ensure all dependencies are up to date." -ForegroundColor White
                } else {
                    Write-Host "    ❌ Update failed! Please check the error messages above." -ForegroundColor Red
                    Write-Log "Update failed"
                }
            } else {
                Write-Host "    Update cancelled." -ForegroundColor Yellow
            }
        } else {
            Write-Host "    ✅ Your system is up to date!" -ForegroundColor Green
            Write-Log "System is up to date"
        }
    } catch {
        Write-Host "    ❌ Failed to check for updates." -ForegroundColor Red
        Write-Log "Failed to check for updates"
    }
    
    Read-Host "Press Enter to continue"
}

# Main script starts here
Write-Log "=== Launcher started ==="
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Cyan
Write-Host "   OHS MANAGEMENT SYSTEM v2.5 - POWERSHELL LAUNCHER" -ForegroundColor Cyan
Write-Host "  ================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in interactive mode
if ($Mode -eq "interactive") {
    do {
        Write-Host ""
        Write-Host "    MAIN MENU" -ForegroundColor Cyan
        Write-Host "    ================================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "    1. 🚀 Launch Application" -ForegroundColor White
        Write-Host "    2. 🔧 System Diagnostics" -ForegroundColor White
        Write-Host "    3. 🔍 Troubleshooting" -ForegroundColor White
        Write-Host "    4. 📖 View Documentation" -ForegroundColor White
        Write-Host "    5. 🌐 Check for Updates" -ForegroundColor White
        Write-Host "    6. ❌ Exit" -ForegroundColor White
        Write-Host ""
        $mainChoice = Read-Host "Enter your choice (1-6)"
        
        switch ($mainChoice) {
            "1" { Launch-Application }
            "2" { Show-Diagnostics }
            "3" { Show-Troubleshooting }
            "4" { View-Documentation }
            "5" { Check-Updates }
            "6" { 
                Write-Host ""
                Write-Host "  ================================================================" -ForegroundColor Green
                Write-Host "   THANK YOU FOR USING OHS MANAGEMENT SYSTEM v2.5!" -ForegroundColor Green
                Write-Host "  ================================================================" -ForegroundColor Green
                Write-Host ""
                Write-Host "    For support and documentation:" -ForegroundColor White
                Write-Host "    📖 README.md - Main documentation" -ForegroundColor White
                Write-Host "    🚀 DEPLOYMENT.md - Deployment guide" -ForegroundColor White
                Write-Host "    📋 CHANGELOG.md - Version history" -ForegroundColor White
                Write-Host ""
                Write-Host "    GitHub Repository:" -ForegroundColor White
                Write-Host "    https://github.com/teekaysharma/ProjectOHSMS_SiteAudit" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "    Report issues at:" -ForegroundColor White
                Write-Host "    https://github.com/teekaysharma/ProjectOHSMS_SiteAudit/issues" -ForegroundColor Cyan
                Write-Host ""
                Write-Log "=== Launcher ended ==="
                exit 0
            }
            default {
                Write-Host "    Invalid choice. Please try again." -ForegroundColor Red
                Read-Host "Press Enter to continue"
            }
        }
    } while ($true)
} elseif ($Mode -eq "dev") {
    # Direct development mode
    Write-Host "    🚀 Starting development server..." -ForegroundColor Yellow
    npm run dev
} elseif ($Mode -eq "build") {
    # Direct build mode
    Write-Host "    🔨 Creating production build..." -ForegroundColor Yellow
    npm run build
} elseif ($Mode -eq "preview") {
    # Direct preview mode
    Write-Host "    🚀 Starting preview server..." -ForegroundColor Yellow
    npm run preview
} else {
    Write-Host "    Invalid mode specified. Use 'interactive', 'dev', 'build', or 'preview'." -ForegroundColor Red
    exit 1
}