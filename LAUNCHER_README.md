# OHS Management System v2.5 - Windows Launchers

This directory contains multiple launcher scripts to help you easily run the OHS Management System v2.5 on Windows. These scripts automatically check for dependencies, install them with your permission, and launch the application.

## 🚀 Available Launchers

### 1. `run.bat` - Simple Launcher
**Best for:** Quick start and basic usage

**Features:**
- ✅ Checks for Node.js and npm installation
- ✅ Verifies project directory structure
- ✅ Installs dependencies with user permission
- ✅ Launches development server, production build, or preview
- ✅ Basic error handling and user guidance

**Usage:**
```batch
# Double-click the file or run from command line
run.bat
```

### 2. `run-advanced.bat` - Advanced Launcher
**Best for:** Advanced users and troubleshooting

**Features:**
- ✅ All features of simple launcher
- ✅ Internet connectivity check
- ✅ Git installation check and branch verification
- ✅ Comprehensive system diagnostics
- ✅ Troubleshooting tools and utilities
- ✅ Automatic update checking
- ✅ Detailed logging system
- ✅ Documentation viewer
- ✅ Network diagnostics
- ✅ npm cache management

**Usage:**
```batch
# Double-click the file or run from command line
run-advanced.bat
```

### 3. `run.ps1` - PowerShell Launcher
**Best for:** Modern Windows systems with PowerShell

**Features:**
- ✅ All features of advanced launcher
- ✅ Modern PowerShell scripting with better error handling
- ✅ Command-line parameters for automation
- ✅ Colored output and better UI
- ✅ Advanced system diagnostics
- ✅ Comprehensive logging
- ✅ Support for different launch modes

**Usage:**
```powershell
# Interactive mode (default)
.\run.ps1

# Direct development mode
.\run.ps1 -Mode dev

# Direct build mode
.\run.ps1 -Mode build

# Direct preview mode
.\run.ps1 -Mode preview

# Skip dependency checks (for advanced users)
.\run.ps1 -Mode dev -SkipChecks

# Force install dependencies
.\run.ps1 -Mode dev -ForceInstall
```

## 📋 System Requirements

### Minimum Requirements
- **Windows**: Windows 7 or later
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **RAM**: 4GB minimum
- **Storage**: 100MB free space
- **Internet**: Required for dependency installation

### Recommended Requirements
- **Windows**: Windows 10 or later
- **Node.js**: Version 18 or higher (LTS recommended)
- **npm**: Latest version
- **RAM**: 8GB or more
- **Storage**: 500MB free space
- **Internet**: High-speed connection

## 🛠️ Installation Guide

### Step 1: Download the Application
1. Go to the GitHub repository: https://github.com/teekaysharma/ProjectOHSMS_SiteAudit
2. Download the ZIP file or clone the repository
3. Extract the files to a folder (e.g., `C:\OHS-Management-System`)
4. Make sure you're on the `emergent1` branch

### Step 2: Install Node.js (if not already installed)
1. Download Node.js from: https://nodejs.org/
2. Download the **LTS (Long Term Support)** version
3. Run the installer with default settings
4. Restart your computer after installation

### Step 3: Run the Launcher
1. Navigate to the project folder
2. Double-click one of the launcher files:
   - `run.bat` (simple)
   - `run-advanced.bat` (advanced)
   - `run.ps1` (PowerShell - may need to right-click and "Run with PowerShell")

### Step 4: Follow the On-Screen Instructions
The launcher will:
- Check for required dependencies
- Install missing components with your permission
- Launch the application
- Open your default browser with the application

## 🔧 Launcher Features Explained

### Dependency Checking
All launchers check for:
- **Node.js**: JavaScript runtime environment
- **npm**: Node Package Manager
- **Git**: Version control system (optional but recommended)
- **Project files**: Ensures you're in the correct directory
- **Dependencies**: Checks if `node_modules` folder exists

### Installation Options
- **Automatic Installation**: Launchers can automatically install required dependencies
- **User Confirmation**: You'll be asked for permission before installing anything
- **Error Handling**: Clear error messages and troubleshooting guidance
- **Network Detection**: Checks internet connectivity before attempting downloads

### Launch Modes
- **Development Server**: Best for testing and development
  - URL: `http://localhost:5173`
  - Features hot reload and development tools
- **Production Build**: Creates optimized files for deployment
  - Output: `dist/` folder
  - Minified and optimized code
- **Preview Server**: Tests the production build locally
  - URL: `http://localhost:4173`
  - Shows how the application will behave in production

### Advanced Features (Advanced and PowerShell Launchers)
- **System Diagnostics**: Shows detailed system information
- **Troubleshooting**: Tools to fix common issues
- **Update Checking**: Checks for new versions on GitHub
- **Documentation Viewer**: Opens documentation files
- **Logging**: Creates detailed logs for debugging
- **Network Tools**: Tests connectivity and DNS resolution

## 🆘 Troubleshooting

### Common Issues and Solutions

#### 1. "Node.js is not installed!"
**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install the LTS version
3. Restart your computer
4. Run the launcher again

#### 2. "npm is not installed!"
**Solution:**
- npm is included with Node.js. Reinstall Node.js if this error occurs.

#### 3. "package.json not found!"
**Solution:**
1. Make sure you're running the launcher from the project directory
2. The directory should contain `package.json`, `index.html`, and other project files
3. If you haven't downloaded the project, get it from GitHub

#### 4. "Failed to install dependencies!"
**Solutions:**
- Check your internet connection
- Try clearing npm cache: `npm cache clean --force`
- Try installing manually: `npm install`
- Check if npm registry is accessible: `ping registry.npmjs.org`

#### 5. "Port already in use!"
**Solution:**
- The development server will automatically find an available port
- Check the console output for the actual URL

#### 6. PowerShell execution policy prevents running scripts
**Solution:**
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Answer "Y" when prompted
4. Try running the PowerShell launcher again

### Getting Help

#### Check Logs
- **Advanced Launcher**: Check `logs\launcher.log`
- **PowerShell Launcher**: Check `logs\launcher.log`

#### View Documentation
- Use the launcher's built-in documentation viewer
- Open `README.md` in a text editor
- Check `DEPLOYMENT.md` for deployment instructions

#### System Diagnostics
- Use the advanced launcher's diagnostic tools
- Check system requirements
- Verify all dependencies are installed

#### Community Support
- Create an issue on GitHub: https://github.com/teekaysharma/ProjectOHSMS_SiteAudit/issues
- Check the repository's documentation
- Review existing issues and discussions

## 🚀 Advanced Usage

### Command Line Options

#### PowerShell Launcher
```powershell
# Launch in development mode directly
.\run.ps1 -Mode dev

# Create production build directly
.\run.ps1 -Mode build

# Preview production build directly
.\run.ps1 -Mode preview

# Skip dependency checks (advanced users)
.\run.ps1 -Mode dev -SkipChecks

# Force reinstall dependencies
.\run.ps1 -Mode dev -ForceInstall
```

#### Batch Launchers
The batch launchers support interactive mode only through their menu system.

### Automation
For automated deployments or CI/CD pipelines, use the PowerShell launcher with appropriate parameters:

```powershell
# Example: Automated build script
.\run.ps1 -Mode build -SkipChecks -ForceInstall
```

### Custom Configuration
You can modify the launcher scripts to:
- Change default ports
- Add custom environment variables
- Modify dependency installation commands
- Add additional diagnostic checks

## 📊 Launcher Comparison

| Feature | run.bat | run-advanced.bat | run.ps1 |
|---------|---------|------------------|---------|
| Node.js Check | ✅ | ✅ | ✅ |
| npm Check | ✅ | ✅ | ✅ |
| Git Check | ❌ | ✅ | ✅ |
| Network Check | ❌ | ✅ | ✅ |
| Dependency Install | ✅ | ✅ | ✅ |
| System Diagnostics | ❌ | ✅ | ✅ |
| Troubleshooting Tools | ❌ | ✅ | ✅ |
| Update Checking | ❌ | ✅ | ✅ |
| Documentation Viewer | ❌ | ✅ | ✅ |
| Logging | ❌ | ✅ | ✅ |
| Command Line Params | ❌ | ❌ | ✅ |
| Colored Output | ❌ | ✅ | ✅ |
| Error Handling | Basic | Advanced | Advanced |
| Best For | Beginners | Advanced Users | Modern Systems |

## 🔒 Security Considerations

### Safe Practices
- **Download from Official Sources**: Only download Node.js from nodejs.org
- **Check Scripts**: Review launcher scripts before running
- **Use Administrator Privileges**: Some operations may require admin rights
- **Keep Software Updated**: Keep Node.js and npm updated
- **Firewall Settings**: Ensure the launcher can access the internet

### What the Launchers Do
- Check system requirements
- Install dependencies from npm registry
- Launch local development servers
- Create log files for debugging
- Check for updates from GitHub

### What the Launchers Don't Do
- Collect personal information
- Access files outside the project directory
- Make system-wide changes without permission
- Install unnecessary software
- Modify system settings

## 📝 License and Support

### License
These launcher scripts are part of the OHS Management System v2.5 and are subject to the same license terms as the main application.

### Support
For issues related to the launchers:
1. Check this documentation
2. Review the troubleshooting section
3. Check the log files
4. Create an issue on GitHub

### Contributions
Contributions to improve the launchers are welcome! Please submit pull requests with:
- Clear descriptions of changes
- Testing results
- Documentation updates

---

## 🎉 Getting Started

1. **Choose Your Launcher**: 
   - Beginners: `run.bat`
   - Advanced Users: `run-advanced.bat`
   - Modern Systems: `run.ps1`

2. **Run the Launcher**: Double-click the file or run from command line

3. **Follow Instructions**: The launcher will guide you through the process

4. **Launch the Application**: Choose your preferred launch mode

5. **Start Using**: The application will open in your default browser

For additional help, refer to the main application documentation or create an issue on GitHub.

**Happy Auditing! 🎯**