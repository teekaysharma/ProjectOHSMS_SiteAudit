// Project management functions
(function() {
    // Initialize project management
    function initializeProjectManagement() {
        console.log('Initializing Project Management...');
        
        // Initialize event listeners
        initializeProjectEventListeners();
        
        // Update selectors
        updateProjectSelector();
        updateSiteSelector();
        
        console.log('Project Management initialized successfully');
    }
    
    // Initialize event listeners for project management
    function initializeProjectEventListeners() {
        // Project selector
        const projectSelector = document.getElementById('projectSelector');
        if (projectSelector) {
            projectSelector.addEventListener('change', (e) => {
                selectProject(e.target.value);
            });
        }
        
        // Project name field
        const projectNameField = document.getElementById('projectName');
        if (projectNameField) {
            projectNameField.addEventListener('input', (e) => {
                const newName = e.target.value;
                if (app.inspectionData.currentProject && newName !== app.inspectionData.currentProject) {
                    // Rename current project
                    if (newName && !app.inspectionData.projects[newName]) {
                        app.inspectionData.projects[newName] = app.inspectionData.projects[app.inspectionData.currentProject];
                        delete app.inspectionData.projects[app.inspectionData.currentProject];
                        app.inspectionData.currentProject = newName;
                        updateProjectSelector();
                        if (typeof saveData === 'function') {
                            saveData();
                        }
                    }
                }
            });
        }
        
        // Site selector
        const siteSelector = document.getElementById('siteSelector');
        if (siteSelector) {
            siteSelector.addEventListener('change', (e) => {
                selectSite(e.target.value);
            });
        }
        
        // Site name field
        const siteNameField = document.getElementById('siteName');
        if (siteNameField) {
            siteNameField.addEventListener('input', (e) => {
                const project = app.getCurrentProject();
                if (project && project.currentSite) {
                    const newName = e.target.value;
                    if (newName && newName !== project.currentSite && !project.sites[newName]) {
                        // Rename current site
                        project.sites[newName] = project.sites[project.currentSite];
                        delete project.sites[project.currentSite];
                        project.currentSite = newName;
                        updateSiteSelector();
                        if (typeof saveData === 'function') {
                            saveData();
                        }
                    }
                }
            });
        }
        
        // Add project button
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', addNewProject);
        }
        
        // Clone project button
        const cloneProjectBtn = document.getElementById('cloneProjectBtn');
        if (cloneProjectBtn) {
            cloneProjectBtn.addEventListener('click', cloneCurrentProject);
        }
        
        // Add site button
        const addSiteBtn = document.getElementById('addSiteBtn');
        if (addSiteBtn) {
            addSiteBtn.addEventListener('click', addSiteFromInputField);
        }
        
        // Add multiple sites button
        const addMultipleSitesBtn = document.getElementById('addMultipleSitesBtn');
        if (addMultipleSitesBtn) {
            addMultipleSitesBtn.addEventListener('click', importSitesFromCSV);
        }
        
        // Add site name input field enter key listener
        const newSiteNameField = document.getElementById('newSiteName');
        if (newSiteNameField) {
            newSiteNameField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addSiteFromInputField();
                }
            });
        }
    }
    
    // Update project selector
    function updateProjectSelector() {
        try {
            const selector = document.getElementById('projectSelector');
            if (!selector) return;
            
            selector.innerHTML = '<option value="">Select a project</option>';
            
            for (const projectName in app.inspectionData.projects) {
                const option = document.createElement('option');
                option.value = projectName;
                option.textContent = projectName;
                if (projectName === app.inspectionData.currentProject) {
                    option.selected = true;
                }
                selector.appendChild(option);
            }
            
            // Update project name field
            const projectNameField = document.getElementById('projectName');
            if (projectNameField) {
                projectNameField.value = app.inspectionData.currentProject || '';
            }
            
            // Update project name display field
            const projectNameDisplay = document.getElementById('projectNameDisplay');
            if (projectNameDisplay) {
                projectNameDisplay.value = app.inspectionData.currentProject || 'Default Project';
            }
            
            // Also update report selectors
            if (typeof updateReportSiteSelector === 'function') {
                updateReportSiteSelector();
            }
            if (typeof updateComparisonSiteSelector === 'function') {
                updateComparisonSiteSelector();
            }
            
            console.log('Project selector updated successfully');
        } catch (error) {
            console.error('Error updating project selector:', error);
        }
    }
    
    // Update site selector
    function updateSiteSelector() {
        try {
            const selector = document.getElementById('siteSelector');
            if (!selector) return;
            
            selector.innerHTML = '<option value="">Select a site</option>';
            
            const project = app.getCurrentProject();
            if (project && project.sites) {
                for (const siteName in project.sites) {
                    const option = document.createElement('option');
                    option.value = siteName;
                    option.textContent = siteName;
                    if (siteName === project.currentSite) {
                        option.selected = true;
                    }
                    selector.appendChild(option);
                }
            }
            
            // Update site name field
            const siteNameField = document.getElementById('siteName');
            if (siteNameField && project && project.currentSite) {
                siteNameField.value = project.currentSite;
                siteNameField.disabled = false;
            } else if (siteNameField) {
                siteNameField.value = '';
                siteNameField.disabled = true;
            }
            
            // Update site name display field
            const siteNameDisplay = document.getElementById('siteNameDisplay');
            if (siteNameDisplay && project && project.currentSite) {
                siteNameDisplay.value = project.currentSite;
            } else if (siteNameDisplay) {
                siteNameDisplay.value = 'Default Site';
            }
            
            // Also update report selectors
            if (typeof updateReportSiteSelector === 'function') {
                updateReportSiteSelector();
            }
            if (typeof updateComparisonSiteSelector === 'function') {
                updateComparisonSiteSelector();
            }
            
            console.log('Site selector updated successfully');
        } catch (error) {
            console.error('Error updating site selector:', error);
        }
    }
    
    // Select project
    function selectProject(projectName) {
        try {
            if (!projectName) {
                app.inspectionData.currentProject = '';
                const projectNameField = document.getElementById('projectName');
                const siteNameField = document.getElementById('siteName');
                const projectNameDisplay = document.getElementById('projectNameDisplay');
                const siteNameDisplay = document.getElementById('siteNameDisplay');
                
                if (projectNameField) projectNameField.value = '';
                if (siteNameField) siteNameField.value = '';
                if (projectNameDisplay) projectNameDisplay.value = 'Default Project';
                if (siteNameDisplay) siteNameDisplay.value = 'Default Site';
                
                updateProjectSelector();
                updateSiteSelector();
                if (typeof saveData === 'function') {
                    saveData();
                }
                return;
            }
            
            // Create project if it doesn't exist
            if (!app.inspectionData.projects[projectName]) {
                app.inspectionData.projects[projectName] = {
                    managementSystemAudit: {},
                    sites: {
                        "Default Site": {}
                    },
                    currentSite: "Default Site"
                };
                
                // Initialize with current master configuration
                const project = app.inspectionData.projects[projectName];
                
                // Initialize management system audit
                for (const section in app.masterConfig.management) {
                    project.managementSystemAudit[section] = app.masterConfig.management[section].map(name => ({
                        name, 
                        score: 0, 
                        comment: ''
                    }));
                }
                
                // Initialize default site
                for (const section in app.masterConfig.site) {
                    project.sites["Default Site"][section] = app.masterConfig.site[section].map(name => ({
                        name, 
                        score: 0, 
                        comment: ''
                    }));
                }
            }
            
            app.inspectionData.currentProject = projectName;
            document.getElementById('projectName').value = projectName;
            
            // Update site selector and select current site
            const project = app.getCurrentProject();
            if (project && project.currentSite) {
                document.getElementById('siteName').value = project.currentSite;
            }
            
            updateProjectSelector();
            updateSiteSelector();
            if (typeof saveData === 'function') {
                saveData();
            }
            
            // Refresh current tab to show new project's data
            const currentTab = document.querySelector('.tab.active')?.dataset.tabName;
            if (currentTab && typeof showTab === 'function') {
                showTab(currentTab);
            }
            
            console.log(`Project "${projectName}" selected successfully`);
        } catch (error) {
            console.error('Error selecting project:', error);
        }
    }
    
    // Select site
    function selectSite(siteName) {
        try {
            const project = app.getCurrentProject();
            if (!project) return;
            
            if (!siteName) {
                project.currentSite = '';
                document.getElementById('siteName').value = '';
                updateSiteSelector();
                if (typeof saveData === 'function') {
                    saveData();
                }
                return;
            }
            
            // Create site if it doesn't exist
            if (!project.sites[siteName]) {
                project.sites[siteName] = {};
                
                // Initialize with current master configuration
                for (const section in app.masterConfig.site) {
                    project.sites[siteName][section] = app.masterConfig.site[section].map(name => ({
                        name, 
                        score: 0, 
                        comment: ''
                    }));
                }
            }
            
            project.currentSite = siteName;
            document.getElementById('siteName').value = siteName;
            
            updateSiteSelector();
            if (typeof saveData === 'function') {
                saveData();
            }
            
            // Refresh current tab to show new site's data
            const currentTab = document.querySelector('.tab.active')?.dataset.tabName;
            if (currentTab && typeof showTab === 'function') {
                showTab(currentTab);
            }
            
            console.log(`Site "${siteName}" selected successfully`);
        } catch (error) {
            console.error('Error selecting site:', error);
        }
    }
    
    // Add new project
    function addNewProject() {
        try {
            const projectName = prompt('Enter project name:');
            if (!projectName) return;
            
            if (app.inspectionData.projects[projectName]) {
                alert('A project with this name already exists');
                return;
            }
            
            // Create new project
            app.inspectionData.projects[projectName] = {
                managementSystemAudit: {},
                sites: {
                    "Default Site": {}
                },
                currentSite: "Default Site",
                hasEvaluationData: false,
                createdDate: new Date().toISOString(),
                leadAuditor: ''
            };
            
            // Initialize with current master configuration
            const project = app.inspectionData.projects[projectName];
            
            // Initialize management system audit
            for (const section in app.masterConfig.management) {
                project.managementSystemAudit[section] = app.masterConfig.management[section].map(name => ({
                    name, 
                    score: 0, 
                    comment: ''
                }));
            }
            
            // Initialize default site
            for (const section in app.masterConfig.site) {
                project.sites["Default Site"][section] = app.masterConfig.site[section].map(name => ({
                    name, 
                    score: 0, 
                    comment: ''
                }));
            }
            
            // Select the new project
            selectProject(projectName);
            
            // Update projects list immediately
            if (typeof updateProjectsList === 'function') {
                updateProjectsList();
            }
            
            alert(`Project "${projectName}" added successfully`);
            console.log(`Project "${projectName}" added successfully`);
        } catch (error) {
            console.error('Error adding new project:', error);
        }
    }
    
    // Clone current project
    function cloneCurrentProject() {
        try {
            const currentProject = app.getCurrentProject();
            if (!currentProject) {
                alert('No project selected to clone');
                return;
            }
            
            const newProjectName = prompt('Enter name for the cloned project:');
            if (!newProjectName) return;
            
            if (app.inspectionData.projects[newProjectName]) {
                alert('A project with this name already exists');
                return;
            }
            
            // Deep clone the current project
            app.inspectionData.projects[newProjectName] = JSON.parse(JSON.stringify(currentProject));
            
            // Select the new project
            selectProject(newProjectName);
            
            alert(`Project cloned successfully as "${newProjectName}"`);
            console.log(`Project cloned successfully as "${newProjectName}"`);
        } catch (error) {
            console.error('Error cloning project:', error);
        }
    }
    
    // Add site from input field
    function addSiteFromInputField() {
        try {
            const newSiteNameField = document.getElementById('newSiteName');
            if (!newSiteNameField) {
                console.error('New site name input field not found');
                return;
            }
            
            const siteName = newSiteNameField.value.trim();
            if (!siteName) {
                alert('Please enter a site name');
                return;
            }
            
            const project = window.app.getCurrentProject();
            if (!project) {
                alert('No project selected. Please select or create a project first.');
                return;
            }
            
            if (project.sites[siteName]) {
                alert('A site with this name already exists');
                return;
            }
            
            // Create new site
            project.sites[siteName] = {};
            
            // Initialize with current master configuration
            for (const section in window.app.masterConfig.site) {
                project.sites[siteName][section] = window.app.masterConfig.site[section].map(name => ({
                    name, 
                    score: 0, 
                    comment: ''
                }));
            }
            
            // Select the new site
            selectSite(siteName);
            
            // Clear the input field
            newSiteNameField.value = '';
            
            // Update sites list immediately
            if (typeof updateSitesList === 'function') {
                updateSitesList();
            }
            
            console.log(`Site "${siteName}" added successfully`);
        } catch (error) {
            console.error('Error adding site from input field:', error);
        }
    }
    
    // Import sites from CSV (placeholder for future implementation)
    function importSitesFromCSV() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.xlsx,.xls';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = evt => {
                    try {
                        const text = evt.target.result;
                        const lines = text.split('\n');
                        const siteNames = [];
                        
                        // Parse CSV - assume site names are in first column
                        lines.forEach((line, index) => {
                            const siteName = line.split(',')[0].trim();
                            if (siteName && index > 0) { // Skip header row
                                siteNames.push(siteName);
                            }
                        });
                        
                        if (siteNames.length === 0) {
                            alert('No valid site names found in the file');
                            return;
                        }
                        
                        const project = window.app.getCurrentProject();
                        if (!project) {
                            alert('No project selected. Please select or create a project first.');
                            return;
                        }
                        
                        let addedCount = 0;
                        siteNames.forEach(siteName => {
                            if (siteName && !project.sites[siteName]) {
                                // Create new site
                                project.sites[siteName] = {};
                                
                                // Initialize with current master configuration
                                for (const section in window.app.masterConfig.site) {
                                    project.sites[siteName][section] = window.app.masterConfig.site[section].map(name => ({
                                        name, 
                                        score: 0, 
                                        comment: ''
                                    }));
                                }
                                addedCount++;
                            }
                        });
                        
                        updateSiteSelector();
                        if (typeof saveData === 'function') {
                            saveData();
                        }
                        
                        alert(`Successfully added ${addedCount} sites from CSV file`);
                        console.log(`Imported ${addedCount} sites from CSV`);
                        
                    } catch (err) {
                        console.error('Error parsing CSV file:', err);
                        alert('Error parsing CSV file. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        } catch (error) {
            console.error('Error importing sites from CSV:', error);
            alert('Error importing sites from CSV. Please check the console for details.');
        }
    }
    
    // Get summary data for reports
    function getSummaryData(siteName = null) {
        try {
            const project = app.getCurrentProject();
            if (!project) {
                return {
                    overallScore: '0.0',
                    overallPercentage: '0',
                    totalItemsCount: 0,
                    ratedItemsCount: 0
                };
            }
            
            let allData = [];
            
            // Add management system audit data
            for (const section in project.managementSystemAudit) {
                allData = allData.concat(project.managementSystemAudit[section]);
            }
            
            // Add site data
            if (siteName && project.sites[siteName]) {
                for (const section in project.sites[siteName]) {
                    allData = allData.concat(project.sites[siteName][section]);
                }
            } else if (!siteName && project.currentSite && project.sites[project.currentSite]) {
                for (const section in project.sites[project.currentSite]) {
                    allData = allData.concat(project.sites[project.currentSite][section]);
                }
            }
            
            // Filter out score 0 for calculations
            const ratedItems = allData.filter(item => item.score > 0);
            const totalItems = allData.length;
            
            if (ratedItems.length === 0) {
                return {
                    overallScore: '0.0',
                    overallPercentage: '0',
                    totalItemsCount: totalItems,
                    ratedItemsCount: 0
                };
            }
            
            const totalScore = ratedItems.reduce((sum, item) => sum + item.score, 0);
            const averageScore = totalScore / ratedItems.length;
            const percentage = (averageScore / 5) * 100;
            
            return {
                overallScore: averageScore.toFixed(1),
                overallPercentage: Math.round(percentage).toString(),
                totalItemsCount: totalItems,
                ratedItemsCount: ratedItems.length
            };
        } catch (error) {
            console.error('Error getting summary data:', error);
            return {
                overallScore: '0.0',
                overallPercentage: '0',
                totalItemsCount: 0,
                ratedItemsCount: 0
            };
        }
    }
    
    // Get report summary data
    function getReportSummaryData(reportScope) {
        try {
            const project = app.getCurrentProject();
            if (!project) {
                return {
                    overallScore: '0.0',
                    overallPercentage: '0',
                    totalItemsCount: 0,
                    ratedItemsCount: 0
                };
            }
            
            let allData = [];
            
            if (reportScope === 'management') {
                // Management system only
                for (const section in project.managementSystemAudit) {
                    allData = allData.concat(project.managementSystemAudit[section]);
                }
            } else if (reportScope === 'all') {
                // All sites + management
                for (const section in project.managementSystemAudit) {
                    allData = allData.concat(project.managementSystemAudit[section]);
                }
                
                for (const siteName in project.sites) {
                    for (const section in project.sites[siteName]) {
                        allData = allData.concat(project.sites[siteName][section]);
                    }
                }
            } else {
                // Specific site + management
                for (const section in project.managementSystemAudit) {
                    allData = allData.concat(project.managementSystemAudit[section]);
                }
                
                if (project.sites[reportScope]) {
                    for (const section in project.sites[reportScope]) {
                        allData = allData.concat(project.sites[reportScope][section]);
                    }
                }
            }
            
            // Filter out score 0 for calculations
            const ratedItems = allData.filter(item => item.score > 0);
            const totalItems = allData.length;
            
            if (ratedItems.length === 0) {
                return {
                    overallScore: '0.0',
                    overallPercentage: '0',
                    totalItemsCount: totalItems,
                    ratedItemsCount: 0
                };
            }
            
            const totalScore = ratedItems.reduce((sum, item) => sum + item.score, 0);
            const averageScore = totalScore / ratedItems.length;
            const percentage = (averageScore / 5) * 100;
            
            return {
                overallScore: averageScore.toFixed(1),
                overallPercentage: Math.round(percentage).toString(),
                totalItemsCount: totalItems,
                ratedItemsCount: ratedItems.length
            };
        } catch (error) {
            console.error('Error getting report summary data:', error);
            return {
                overallScore: '0.0',
                overallPercentage: '0',
                totalItemsCount: 0,
                ratedItemsCount: 0
            };
        }
    }
    
    // Generate executive summary
    function generateExecutiveSummary(siteName = null, includeManagement = true, includeSite = true) {
        try {
            const project = app.getCurrentProject();
            if (!project) return 'No project data available.';
            
            const summary = getReportSummaryData(siteName || 'all');
            const ratingInfo = app.getRatingDetails(parseFloat(summary.overallPercentage));
            
            // Get detailed audit data for analysis
            let criticalCount = 0;
            let improvementCount = 0;
            let bestPracticeCount = 0;
            let managementIssues = [];
            let siteIssues = [];
            
            // Analyze management data
            if (project.managementSystemAudit) {
                for (const section in project.managementSystemAudit) {
                    project.managementSystemAudit[section].forEach(item => {
                        if (item.score > 0) {
                            if (item.score === 1) {
                                criticalCount++;
                                managementIssues.push(`${section}: ${item.name}`);
                            } else if (item.score === 2 || item.score === 3) {
                                improvementCount++;
                            } else if (item.score === 5) {
                                bestPracticeCount++;
                            }
                        }
                    });
                }
            }
            
            // Analyze site data
            if (project.sites) {
                for (const siteName in project.sites) {
                    const site = project.sites[siteName];
                    for (const section in site) {
                        site[section].forEach(item => {
                            if (item.score > 0) {
                                if (item.score === 1) {
                                    criticalCount++;
                                    siteIssues.push(`${siteName} - ${section}: ${item.name}`);
                                } else if (item.score === 2 || item.score === 3) {
                                    improvementCount++;
                                } else if (item.score === 5) {
                                    bestPracticeCount++;
                                }
                            }
                        });
                    }
                }
            }
            
            const completionRate = summary.totalItemsCount > 0 ? Math.round((summary.ratedItemsCount / summary.totalItemsCount) * 100) : 0;
            const percentage = parseFloat(summary.overallPercentage);
            
            let executiveSummary = `EXECUTIVE SUMMARY - ${new Date().toLocaleDateString()}\n\n`;
            
            executiveSummary += `OVERALL PERFORMANCE STATUS:\n`;
            executiveSummary += `• Overall Rating: ${ratingInfo.text} (${summary.overallPercentage}%)\n`;
            executiveSummary += `• Average Score: ${summary.overallScore} out of 5.0\n`;
            executiveSummary += `• Audit Completion: ${summary.ratedItemsCount} of ${summary.totalItemsCount} items (${completionRate}%)\n`;
            executiveSummary += `• Critical Issues: ${criticalCount} | Improvement Areas: ${improvementCount} | Best Practices: ${bestPracticeCount}\n\n`;
            
            // Performance analysis based on rating
            executiveSummary += `PERFORMANCE ASSESSMENT:\n`;
            if (percentage > 90) {
                executiveSummary += `Excellent performance demonstrating strong health and safety leadership. The organization shows exceptional commitment to safety standards and continuous improvement.\n`;
            } else if (percentage > 80) {
                executiveSummary += `Good performance with effective health and safety management systems in place. Minor improvements would enhance the already solid safety culture.\n`;
            } else if (percentage > 70) {
                executiveSummary += `Satisfactory performance with room for improvement. Key areas require attention to achieve consistent safety excellence.\n`;
            } else if (percentage > 50) {
                executiveSummary += `Low performance indicating significant gaps in health and safety management. Immediate action is required to address critical deficiencies.\n`;
            } else {
                executiveSummary += `Unacceptable performance requiring urgent intervention. Major non-conformances must be addressed immediately to ensure compliance and worker safety.\n`;
            }
            
            // Key findings
            if (criticalCount > 0 || improvementCount > 0) {
                executiveSummary += `\nKEY FINDINGS:\n`;
                if (criticalCount > 0) {
                    executiveSummary += `• ${criticalCount} critical non-conformance(s) identified requiring immediate corrective action\n`;
                }
                if (improvementCount > 0) {
                    executiveSummary += `• ${improvementCount} improvement opportunity(ies) that should be addressed\n`;
                }
                if (bestPracticeCount > 0) {
                    executiveSummary += `• ${bestPracticeCount} best practice(s) demonstrating excellence in specific areas\n`;
                }
                
                // Top critical issues
                if (managementIssues.length > 0 || siteIssues.length > 0) {
                    executiveSummary += `\nPRIORITY AREAS:\n`;
                    const topIssues = [...managementIssues.slice(0, 2), ...siteIssues.slice(0, 2)].slice(0, 3);
                    topIssues.forEach(issue => {
                        executiveSummary += `• ${issue}\n`;
                    });
                }
            }
            
            // Completion status
            if (completionRate < 100) {
                executiveSummary += `\nAUDIT STATUS:\n`;
                executiveSummary += `Audit is ${completionRate}% complete. ${summary.totalItemsCount - summary.ratedItemsCount} items remain to be evaluated.\n`;
            }
            
            // Dynamic recommendations based on performance
            executiveSummary += `\nIMMEDIATE ACTIONS:\n`;
            if (criticalCount > 0) {
                executiveSummary += `• Address all critical non-conformances within specified timeframes\n`;
                executiveSummary += `• Implement corrective actions and verify effectiveness\n`;
            }
            if (percentage < 70) {
                executiveSummary += `• Review and enhance health and safety management systems\n`;
                executiveSummary += `• Increase management commitment and resource allocation\n`;
            }
            if (completionRate < 100) {
                executiveSummary += `• Complete remaining audit evaluations to ensure comprehensive assessment\n`;
            }
            executiveSummary += `• Schedule follow-up audit to verify improvements\n`;
            
            return executiveSummary;
        } catch (error) {
            console.error('Error generating executive summary:', error);
            return 'Error generating executive summary.';
        }
    }
    
    // Update dashboard executive summary
    function updateDashboardExecutiveSummary() {
        try {
            console.log('Updating dashboard executive summary...');
            const summaryElement = document.getElementById('dashboardExecutiveSummary');
            if (!summaryElement) {
                console.error('Dashboard executive summary element not found');
                return;
            }
            
            const project = app.getCurrentProject();
            if (!project) {
                summaryElement.innerHTML = 'No project selected. Please select or create a project to begin.';
                console.log('No project found for executive summary');
                return;
            }
            
            // Use the comprehensive executive summary generator
            const executiveSummary = generateExecutiveSummary();
            console.log('Generated executive summary:', executiveSummary);
            
            // Format the executive summary for HTML display
            const formattedSummary = executiveSummary
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>');
            
            summaryElement.innerHTML = formattedSummary;
            console.log('Dashboard executive summary updated successfully');
        } catch (error) {
            console.error('Error updating dashboard executive summary:', error);
            const summaryElement = document.getElementById('dashboardExecutiveSummary');
            if (summaryElement) {
                summaryElement.innerHTML = 'Error generating executive summary. Please check the console for details.';
            }
        }
    }
    
    // Rename project function (only if no evaluation data)
    function renameProject(oldName, newName) {
        try {
            if (!oldName || !newName || oldName === newName) return false;
            
            if (!app.inspectionData.projects[oldName]) {
                alert('Project not found');
                return false;
            }
            
            if (app.inspectionData.projects[newName]) {
                alert('A project with this name already exists');
                return false;
            }
            
            const project = app.inspectionData.projects[oldName];
            
            // Check if project has evaluation data
            if (project.hasEvaluationData || hasProjectEvaluationData(project)) {
                alert('Cannot rename project: This project contains evaluation data. Please create a new project instead.');
                return false;
            }
            
            // Rename the project
            app.inspectionData.projects[newName] = project;
            delete app.inspectionData.projects[oldName];
            
            // Update current project reference if needed
            if (app.inspectionData.currentProject === oldName) {
                app.inspectionData.currentProject = newName;
            }
            
            // Update UI
            updateProjectSelector();
            if (typeof updateProjectsList === 'function') {
                updateProjectsList();
            }
            
            if (typeof saveData === 'function') {
                saveData();
            }
            
            console.log(`Project renamed from "${oldName}" to "${newName}"`);
            return true;
        } catch (error) {
            console.error('Error renaming project:', error);
            return false;
        }
    }
    
    // Check if project has evaluation data
    function hasProjectEvaluationData(project) {
        try {
            // Check management system audit data
            for (const section in project.managementSystemAudit) {
                if (Array.isArray(project.managementSystemAudit[section])) {
                    for (const item of project.managementSystemAudit[section]) {
                        if (item.score && item.score > 0) {
                            return true;
                        }
                    }
                }
            }
            
            // Check site audit data
            for (const siteName in project.sites) {
                const site = project.sites[siteName];
                for (const section in site) {
                    if (Array.isArray(site[section])) {
                        for (const item of site[section]) {
                            if (item.score && item.score > 0) {
                                return true;
                            }
                        }
                    }
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking project evaluation data:', error);
            return false;
        }
    }
    
    // Edit project name function  
    function editProjectName(projectName) {
        try {
            const newName = prompt('Enter new project name:', projectName);
            if (newName && newName !== projectName) {
                if (renameProject(projectName, newName)) {
                    alert(`Project renamed to "${newName}"`);
                }
            }
        } catch (error) {
            console.error('Error editing project name:', error);
        }
    }
    
    // Switch to project function
    function switchToProject(projectName) {
        try {
            selectProject(projectName);
            alert(`Switched to project: ${projectName}`);
        } catch (error) {
            console.error('Error switching to project:', error);
        }
    }
    
    // Delete project function
    function deleteProject(projectName) {
        try {
            if (!confirm(`Are you sure you want to delete project "${projectName}"? This cannot be undone.`)) {
                return;
            }
            
            delete app.inspectionData.projects[projectName];
            
            // If this was the current project, clear selection
            if (app.inspectionData.currentProject === projectName) {
                app.inspectionData.currentProject = '';
            }
            
            // Update UI
            updateProjectSelector();
            if (typeof updateProjectsList === 'function') {
                updateProjectsList();
            }
            
            if (typeof saveData === 'function') {
                saveData();
            }
            
            alert(`Project "${projectName}" deleted successfully`);
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    }
    
    // Switch to site function
    function switchToSite(siteName) {
        try {
            selectSite(siteName);
            alert(`Switched to site: ${siteName}`);
        } catch (error) {
            console.error('Error switching to site:', error);
        }
    }
    
    // Edit site name function
    function editSiteName(siteName) {
        try {
            const project = app.getCurrentProject();
            if (!project) return;
            
            const newName = prompt('Enter new site name:', siteName);
            if (newName && newName !== siteName && !project.sites[newName]) {
                project.sites[newName] = project.sites[siteName];
                delete project.sites[siteName];
                
                if (project.currentSite === siteName) {
                    project.currentSite = newName;
                }
                
                updateSiteSelector();
                if (typeof updateSitesList === 'function') {
                    updateSitesList();
                }
                
                if (typeof saveData === 'function') {
                    saveData();
                }
                
                alert(`Site renamed to "${newName}"`);
            }
        } catch (error) {
            console.error('Error editing site name:', error);
        }
    }
    
    // Delete site function
    function deleteSite(siteName) {
        try {
            const project = app.getCurrentProject();
            if (!project) return;
            
            if (!confirm(`Are you sure you want to delete site "${siteName}"? This cannot be undone.`)) {
                return;
            }
            
            delete project.sites[siteName];
            
            if (project.currentSite === siteName) {
                project.currentSite = '';
            }
            
            updateSiteSelector();
            if (typeof updateSitesList === 'function') {
                updateSitesList();
            }
            
            if (typeof saveData === 'function') {
                saveData();
            }
            
            alert(`Site "${siteName}" deleted successfully`);
        } catch (error) {
            console.error('Error deleting site:', error);
        }
    }

    // Expose functions to global scope
    window.initializeProjectManagement = initializeProjectManagement;
    window.updateProjectSelector = updateProjectSelector;
    window.updateSiteSelector = updateSiteSelector;
    window.selectProject = selectProject;
    window.selectSite = selectSite;
    window.addNewProject = addNewProject;
    window.cloneCurrentProject = cloneCurrentProject;
    window.addSiteFromInputField = addSiteFromInputField;
    window.importSitesFromCSV = importSitesFromCSV;
    window.getSummaryData = getSummaryData;
    window.getReportSummaryData = getReportSummaryData;
    window.generateExecutiveSummary = generateExecutiveSummary;
    window.updateDashboardExecutiveSummary = updateDashboardExecutiveSummary;
    window.renameProject = renameProject;
    window.editProjectName = editProjectName;
    window.switchToProject = switchToProject;
    window.deleteProject = deleteProject;
    window.switchToSite = switchToSite;
    window.editSiteName = editSiteName;
    window.deleteSite = deleteSite;
})();
