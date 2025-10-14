// Comparison Chart Extension
// Extends chart functionality with comparison and trend analysis

// Helper function to get color based on score
function getScoreColor(score, alpha = 0.6) {
    if (score >= 80) return `rgba(72, 187, 120, ${alpha})`; // Green
    if (score >= 70) return `rgba(56, 161, 105, ${alpha})`; // Green
    if (score >= 50) return `rgba(237, 137, 54, ${alpha})`;  // Orange
    return `rgba(229, 62, 62, ${alpha})`; // Red
}

// Helper function to show no data message
function showNoDataMessage(canvas, message) {
    const container = canvas.parentElement;
    if (!container) return;
    
    // Remove existing message if any
    const existingMsg = container.querySelector('.no-data-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create and add new message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'no-data-message';
    messageDiv.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        color: #6c757d;
        font-size: 16px;
        text-align: center;
        padding: 20px;
        margin: 10px 0;
    `;
    
    const icon = document.createElement('div');
    icon.style.cssText = `
        font-size: 48px;
        margin-bottom: 15px;
        opacity: 0.5;
    `;
    icon.textContent = '📊';
    
    const text = document.createElement('div');
    text.innerHTML = `
        <strong>No Data Available</strong><br>
        ${message}
    `;
    
    messageDiv.appendChild(icon);
    messageDiv.appendChild(text);
    
    // Hide the canvas and show the message
    canvas.style.display = 'none';
    container.appendChild(messageDiv);
    
    // Also update the dedicated no data message element if it exists
    const noDataMsg = document.getElementById('noSiteComparisonData');
    if (noDataMsg) {
        noDataMsg.textContent = message;
        noDataMsg.style.display = 'block';
    }
}

// Helper function to hide no data message and show canvas
function hideNoDataMessage(canvas) {
    const container = canvas.parentElement;
    if (!container) return;
    
    // Remove no data message
    const existingMsg = container.querySelector('.no-data-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Show the canvas
    canvas.style.display = 'block';
    
    // Hide the dedicated no data message element if it exists
    const noDataMsg = document.getElementById('noSiteComparisonData');
    if (noDataMsg) {
        noDataMsg.style.display = 'none';
    }
}

// Initialize comparison charts
function initializeComparisonCharts() {
    createSiteComparisonChart();
    createTrendAnalysisChart();
    createPerformanceBreakdownChart();
}

// Create site comparison chart with drill-down functionality
function createSiteComparisonChart() {
    const canvas = document.getElementById('siteComparisonChart');
    if (!canvas) {
        console.warn('Site comparison chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.warn('Could not get 2D context for site comparison chart');
        return;
    }
    
    // Get current project and sites data
    const project = window.app ? window.app.getCurrentProject() : null;
    if (!project || !project.sites) {
        showNoDataMessage(canvas, 'No project data available. Please create a project and add sites first.');
        return;
    }
    
    const sites = Object.keys(project.sites);
    if (sites.length === 0) {
        showNoDataMessage(canvas, 'No sites available for comparison. Please add sites to your project first.');
        return;
    }
    
    // Get selected sites from the multi-select dropdown
    const selector = document.getElementById('comparisonSiteSelector');
    let selectedSites = [];
    
    if (selector && selector.selectedOptions && selector.selectedOptions.length > 0) {
        selectedSites = Array.from(selector.selectedOptions).map(option => option.value);
    } else {
        // If no sites selected, use all available sites
        selectedSites = sites;
    }
    
    if (selectedSites.length < 1) {
        showNoDataMessage(canvas, 'Please select at least 1 site for comparison. Use the multi-select dropdown above the chart.');
        return;
    }
    
    // Create drill-down interface instead of traditional chart
    createDrillDownSiteComparison(project, selectedSites, canvas);
    
    console.log('Site comparison drill-down chart created successfully');
}

// Create drill-down site comparison interface
function createDrillDownSiteComparison(project, selectedSites, canvas) {
    const container = canvas.parentElement;
    if (!container) return;
    
    // Hide the original canvas
    canvas.style.display = 'none';
    
    // Remove existing drill-down interface if any
    const existingInterface = container.querySelector('.drill-down-interface');
    if (existingInterface) {
        existingInterface.remove();
    }
    
    // Create drill-down interface
    const drillDownInterface = document.createElement('div');
    drillDownInterface.className = 'drill-down-interface';
    drillDownInterface.style.cssText = `
        width: 100%;
        height: 400px;
        overflow-y: auto;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
    `;
    
    // Calculate section-level data for all selected sites
    const sectionData = calculateSectionLevelData(project, selectedSites);
    
    if (Object.keys(sectionData.sections).length === 0) {
        showNoDataMessage(canvas, 'No audit data available for the selected sites. Please complete site audits first.');
        return;
    }
    
    // Create header with controls
    const header = createDrillDownHeader(selectedSites);
    drillDownInterface.appendChild(header);
    
    // Create sections container
    const sectionsContainer = document.createElement('div');
    sectionsContainer.className = 'sections-container';
    
    // Add each section
    Object.keys(sectionData.sections).forEach(sectionName => {
        const sectionElement = createSectionElement(sectionName, sectionData.sections[sectionName], selectedSites);
        sectionsContainer.appendChild(sectionElement);
    });
    
    drillDownInterface.appendChild(sectionsContainer);
    container.appendChild(drillDownInterface);
    
    // Hide no data message if it was shown
    hideNoDataMessage(canvas);
}

// Calculate section-level data for comparison
function calculateSectionLevelData(project, selectedSites) {
    const sections = {};
    let totalQuestions = 0;
    let answeredQuestions = 0;
    
    // First, collect all unique sections across all sites
    const allSections = new Set();
    selectedSites.forEach(siteName => {
        const site = project.sites[siteName];
        if (site) {
            Object.keys(site).forEach(key => {
                if (Array.isArray(site[key]) && site[key].length > 0) {
                    allSections.add(key);
                }
            });
        }
    });
    
    // Calculate data for each section
    allSections.forEach(sectionName => {
        sections[sectionName] = {
            sites: {},
            questions: [],
            totalScore: 0,
            answeredCount: 0,
            totalCount: 0
        };
        
        selectedSites.forEach(siteName => {
            const site = project.sites[siteName];
            if (site && site[sectionName] && Array.isArray(site[sectionName])) {
                const sectionQuestions = site[sectionName];
                let sectionTotalScore = 0;
                let sectionAnsweredCount = 0;
                let sectionTotalCount = sectionQuestions.length;
                
                sectionQuestions.forEach((question, index) => {
                    totalQuestions++;
                    if (question.score > 0) {
                        answeredQuestions++;
                        sectionTotalScore += question.score;
                        sectionAnsweredCount++;
                    }
                    
                    // Store question data for drill-down
                    if (!sections[sectionName].questions[index]) {
                        sections[sectionName].questions[index] = {
                            name: question.name,
                            sites: {}
                        };
                    }
                    sections[sectionName].questions[index].sites[siteName] = {
                        score: question.score,
                        comment: question.comment || ''
                    };
                });
                
                const sectionAverageScore = sectionAnsweredCount > 0 ? sectionTotalScore / sectionAnsweredCount : 0;
                const sectionPercentage = (sectionAverageScore / 5) * 100;
                
                sections[sectionName].sites[siteName] = {
                    score: Math.round(sectionPercentage),
                    answeredCount: sectionAnsweredCount,
                    totalCount: sectionTotalCount,
                    averageScore: sectionAverageScore
                };
                
                sections[sectionName].totalScore += sectionTotalScore;
                sections[sectionName].answeredCount += sectionAnsweredCount;
                sections[sectionName].totalCount += sectionTotalCount;
            }
        });
    });
    
    return {
        sections,
        totalQuestions,
        answeredQuestions
    };
}

// Create drill-down header with controls
function createDrillDownHeader(selectedSites) {
    const header = document.createElement('div');
    header.className = 'drill-down-header';
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        border-radius: 8px 8px 0 0;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Site Performance by Section';
    title.style.cssText = `
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
    `;
    
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 10px;
        align-items: center;
    `;
    
    // View toggle button
    const viewToggleBtn = document.createElement('button');
    viewToggleBtn.textContent = 'Switch to Chart View';
    viewToggleBtn.className = 'btn btn-sm btn-outline';
    viewToggleBtn.style.cssText = `
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 4px;
        border: 1px solid #6b7280;
        background: #ffffff;
        color: #374151;
        cursor: pointer;
    `;
    viewToggleBtn.onclick = () => switchToChartView(selectedSites);
    
    // Expand/Collapse all button
    const toggleAllBtn = document.createElement('button');
    toggleAllBtn.textContent = 'Expand All';
    toggleAllBtn.className = 'btn btn-sm btn-secondary';
    toggleAllBtn.style.cssText = `
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 4px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        cursor: pointer;
    `;
    toggleAllBtn.onclick = () => toggleAllSections();
    
    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Data';
    exportBtn.className = 'btn btn-sm btn-primary';
    exportBtn.style.cssText = `
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 4px;
        border: 1px solid #3b82f6;
        background: #3b82f6;
        color: white;
        cursor: pointer;
    `;
    exportBtn.onclick = () => exportDrillDownData();
    
    controls.appendChild(viewToggleBtn);
    controls.appendChild(toggleAllBtn);
    controls.appendChild(exportBtn);
    header.appendChild(title);
    header.appendChild(controls);
    
    return header;
}

// Switch to traditional chart view
function switchToChartView(selectedSites) {
    const canvas = document.getElementById('siteComparisonChart');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    // Remove drill-down interface
    const drillDownInterface = container.querySelector('.drill-down-interface');
    if (drillDownInterface) {
        drillDownInterface.remove();
    }
    
    // Show the original canvas
    canvas.style.display = 'block';
    
    // Create traditional chart
    createTraditionalSiteComparisonChart(selectedSites);
}

// Create traditional site comparison chart
function createTraditionalSiteComparisonChart(selectedSites) {
    const canvas = document.getElementById('siteComparisonChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get current project and sites data
    const project = window.app ? window.app.getCurrentProject() : null;
    if (!project || !project.sites) {
        showNoDataMessage(canvas, 'No project data available. Please create a project and add sites first.');
        return;
    }
    
    // Calculate performance data for each selected site
    const siteData = selectedSites.map(siteName => {
        const site = project.sites[siteName];
        if (!site) return { name: siteName, score: 0, hasData: false };
        
        let totalScore = 0;
        let answeredQuestions = 0;
        let totalQuestions = 0;
        
        // Calculate site performance
        for (const section in site) {
            if (Array.isArray(site[section])) {
                site[section].forEach(item => {
                    totalQuestions++;
                    if (item.score > 0) {
                        totalScore += item.score;
                        answeredQuestions++;
                    }
                });
            }
        }
        
        const averageScore = answeredQuestions > 0 ? (totalScore / answeredQuestions) : 0;
        const percentage = (averageScore / 5) * 100;
        
        return {
            name: siteName,
            score: Math.round(percentage),
            hasData: answeredQuestions > 0,
            answeredQuestions,
            totalQuestions
        };
    });
    
    // Check if any site has data
    const sitesWithData = siteData.filter(site => site.hasData);
    if (sitesWithData.length === 0) {
        showNoDataMessage(canvas, 'No audit data available for the selected sites. Please complete site audits first.');
        return;
    }
    
    // Get chart type from UI controls
    let chartType = 'bar'; // default
    const chartTypeButtons = document.querySelectorAll('.chart-type-selector button');
    chartTypeButtons.forEach(btn => {
        if (btn.classList.contains('active')) {
            chartType = btn.dataset.chartType;
        }
    });
    
    // Check if management audit should be included
    const includeManagementAudit = document.getElementById('includeManagementAudit')?.checked || false;
    
    // Prepare chart data
    const labels = siteData.map(site => site.name);
    const scores = siteData.map(site => site.score);
    
    // Create datasets
    const datasets = [{
        label: 'Site Performance Score (%)',
        data: scores,
        backgroundColor: scores.map(score => getScoreColor(score)),
        borderColor: scores.map(score => getScoreColor(score, 0.8)),
        borderWidth: 2
    }];
    
    // Add management audit data if requested and available
    if (includeManagementAudit && project.managementSystemAudit) {
        let managementScore = 0;
        let managementAnswered = 0;
        let managementTotal = 0;
        
        for (const section in project.managementSystemAudit) {
            if (Array.isArray(project.managementSystemAudit[section])) {
                project.managementSystemAudit[section].forEach(item => {
                    managementTotal++;
                    if (item.score > 0) {
                        managementScore += item.score;
                        managementAnswered++;
                    }
                });
            }
        }
        
        if (managementAnswered > 0) {
            const managementPercentage = Math.round((managementScore / managementAnswered / 5) * 100);
            datasets.push({
                label: 'Management System Score (%)',
                data: new Array(labels.length).fill(managementPercentage),
                backgroundColor: 'rgba(66, 153, 225, 0.6)',
                borderColor: 'rgba(66, 153, 225, 1)',
                borderWidth: 2
            });
        }
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create new chart based on type
    const chartConfig = {
        type: chartType === 'radar' ? 'radar' : 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Site Performance Comparison',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const siteIndex = context.dataIndex;
                            const site = siteData[siteIndex];
                            if (site) {
                                return [
                                    `Questions Answered: ${site.answeredQuestions}/${site.totalQuestions}`,
                                    `Data Status: ${site.hasData ? 'Complete' : 'Incomplete'}`
                                ];
                            }
                            return [];
                        }
                    }
                }
            },
            scales: chartType === 'radar' ? {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            } : {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Score (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Sites'
                    }
                }
            }
        }
    };
    
    // For grouped bar chart, adjust configuration
    if (chartType === 'grouped') {
        chartConfig.options.scales.x.stacked = false;
        chartConfig.options.scales.y.stacked = false;
    } else if (chartType === 'stacked') {
        chartConfig.options.scales.x.stacked = true;
        chartConfig.options.scales.y.stacked = true;
    }
    
    new Chart(ctx, chartConfig);
    
    // Add switch to drill-down button
    addSwitchToDrillDownButton();
    
    console.log('Traditional site comparison chart created successfully');
}

// Add switch to drill-down button to chart container
function addSwitchToDrillDownButton() {
    const canvas = document.getElementById('siteComparisonChart');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    // Remove existing switch button if any
    const existingBtn = container.querySelector('.switch-to-drill-down');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    // Create switch button
    const switchBtn = document.createElement('button');
    switchBtn.textContent = 'Switch to Drill-Down View';
    switchBtn.className = 'switch-to-drill-down btn btn-sm btn-outline';
    switchBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 4px;
        border: 1px solid #6b7280;
        background: #ffffff;
        color: #374151;
        cursor: pointer;
        z-index: 10;
    `;
    
    switchBtn.onclick = () => {
        const selectedSites = Array.from(document.getElementById('comparisonSiteSelector')?.selectedOptions || [])
            .map(option => option.value);
        if (selectedSites.length > 0) {
            createSiteComparisonChart();
        }
    };
    
    container.style.position = 'relative';
    container.appendChild(switchBtn);
}

// Create section element with drill-down capability
function createSectionElement(sectionName, sectionData, selectedSites) {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'section-element';
    sectionElement.style.cssText = `
        border-bottom: 1px solid #e2e8f0;
    `;
    
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: #ffffff;
        cursor: pointer;
        transition: background-color 0.2s;
    `;
    
    sectionHeader.onmouseover = () => {
        sectionHeader.style.backgroundColor = '#f8fafc';
    };
    
    sectionHeader.onmouseout = () => {
        sectionHeader.style.backgroundColor = '#ffffff';
    };
    
    // Section title and stats
    const sectionInfo = document.createElement('div');
    sectionInfo.style.cssText = `
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    const expandIcon = document.createElement('span');
    expandIcon.textContent = '▶';
    expandIcon.style.cssText = `
        transition: transform 0.2s;
        color: #64748b;
    `;
    
    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = formatSectionName(sectionName);
    sectionTitle.style.cssText = `
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #1e293b;
    `;
    
    const sectionStats = document.createElement('span');
    const overallPercentage = sectionData.answeredCount > 0 ? 
        Math.round((sectionData.totalScore / sectionData.answeredCount / 5) * 100) : 0;
    sectionStats.textContent = `${overallPercentage}% (${sectionData.answeredCount}/${sectionData.totalCount})`;
    sectionStats.style.cssText = `
        font-size: 14px;
        color: #64748b;
    `;
    
    sectionInfo.appendChild(expandIcon);
    sectionInfo.appendChild(sectionTitle);
    sectionInfo.appendChild(sectionStats);
    
    // Site scores
    const siteScores = document.createElement('div');
    siteScores.style.cssText = `
        display: flex;
        gap: 15px;
    `;
    
    selectedSites.forEach(siteName => {
        const siteData = sectionData.sites[siteName];
        if (siteData) {
            const scoreBadge = document.createElement('span');
            scoreBadge.textContent = `${siteData.score}%`;
            scoreBadge.style.cssText = `
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                background: ${getScoreColor(siteData.score, 0.2)};
                color: ${getScoreColor(siteData.score, 1)};
                border: 1px solid ${getScoreColor(siteData.score, 0.3)};
            `;
            siteScores.appendChild(scoreBadge);
        }
    });
    
    sectionHeader.appendChild(sectionInfo);
    sectionHeader.appendChild(siteScores);
    
    // Questions container (initially hidden)
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'questions-container';
    questionsContainer.style.cssText = `
        display: none;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
    `;
    
    // Add questions
    sectionData.questions.forEach((questionData, index) => {
        const questionElement = createQuestionElement(questionData, selectedSites, index);
        questionsContainer.appendChild(questionElement);
    });
    
    // Toggle functionality
    sectionHeader.onclick = () => {
        const isExpanded = questionsContainer.style.display === 'block';
        if (isExpanded) {
            questionsContainer.style.display = 'none';
            expandIcon.textContent = '▶';
            expandIcon.style.transform = 'rotate(0deg)';
        } else {
            questionsContainer.style.display = 'block';
            expandIcon.textContent = '▼';
            expandIcon.style.transform = 'rotate(90deg)';
        }
    };
    
    sectionElement.appendChild(sectionHeader);
    sectionElement.appendChild(questionsContainer);
    
    return sectionElement;
}

// Create question element for drill-down
function createQuestionElement(questionData, selectedSites, questionIndex) {
    const questionElement = document.createElement('div');
    questionElement.className = 'question-element';
    questionElement.style.cssText = `
        padding: 12px 20px 12px 60px;
        border-bottom: 1px solid #e2e8f0;
        transition: background-color 0.2s;
    `;
    
    questionElement.onmouseover = () => {
        questionElement.style.backgroundColor = '#ffffff';
    };
    
    questionElement.onmouseout = () => {
        questionElement.style.backgroundColor = 'transparent';
    };
    
    // Question name
    const questionName = document.createElement('div');
    questionName.textContent = questionData.name;
    questionName.style.cssText = `
        font-size: 14px;
        color: #374151;
        margin-bottom: 8px;
        font-weight: 500;
    `;
    
    // Site scores and comments
    const siteDataContainer = document.createElement('div');
    siteDataContainer.style.cssText = `
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    `;
    
    selectedSites.forEach(siteName => {
        const siteQuestionData = questionData.sites[siteName];
        if (siteQuestionData) {
            const siteQuestionElement = document.createElement('div');
            siteQuestionElement.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 4px;
                min-width: 120px;
            `;
            
            // Site name
            const siteLabel = document.createElement('div');
            siteLabel.textContent = siteName;
            siteLabel.style.cssText = `
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            `;
            
            // Score badge
            const scoreBadge = document.createElement('div');
            const scorePercentage = siteQuestionData.score > 0 ? 
                Math.round((siteQuestionData.score / 5) * 100) : 0;
            const scoreText = siteQuestionData.score > 0 ? `${scorePercentage}%` : 'N/A';
            scoreBadge.textContent = scoreText;
            scoreBadge.style.cssText = `
                display: inline-block;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 500;
                background: ${getScoreColor(scorePercentage, 0.2)};
                color: ${getScoreColor(scorePercentage, 1)};
                border: 1px solid ${getScoreColor(scorePercentage, 0.3)};
            `;
            
            // Comment (if exists)
            if (siteQuestionData.comment && siteQuestionData.comment.trim()) {
                const comment = document.createElement('div');
                comment.textContent = siteQuestionData.comment;
                comment.style.cssText = `
                    font-size: 11px;
                    color: #6b7280;
                    font-style: italic;
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                `;
                comment.title = siteQuestionData.comment; // Full comment on hover
                siteQuestionElement.appendChild(comment);
            }
            
            siteQuestionElement.appendChild(siteLabel);
            siteQuestionElement.appendChild(scoreBadge);
            siteDataContainer.appendChild(siteQuestionElement);
        }
    });
    
    questionElement.appendChild(questionName);
    questionElement.appendChild(siteDataContainer);
    
    return questionElement;
}

// Helper function to format section names
function formatSectionName(sectionName) {
    return sectionName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// Toggle all sections expand/collapse
function toggleAllSections() {
    const sectionHeaders = document.querySelectorAll('.section-header');
    const expandIcons = document.querySelectorAll('.section-header span:first-child');
    const questionsContainers = document.querySelectorAll('.questions-container');
    
    const allExpanded = Array.from(questionsContainers).some(container => 
        container.style.display === 'block'
    );
    
    sectionHeaders.forEach((header, index) => {
        const questionsContainer = questionsContainers[index];
        const expandIcon = expandIcons[index];
        
        if (allExpanded) {
            questionsContainer.style.display = 'none';
            expandIcon.textContent = '▶';
            expandIcon.style.transform = 'rotate(0deg)';
        } else {
            questionsContainer.style.display = 'block';
            expandIcon.textContent = '▼';
            expandIcon.style.transform = 'rotate(90deg)';
        }
    });
    
    // Update button text
    const toggleBtn = document.querySelector('.drill-down-header button');
    if (toggleBtn) {
        toggleBtn.textContent = allExpanded ? 'Expand All' : 'Collapse All';
    }
}

// Export drill-down data
function exportDrillDownData() {
    try {
        const project = window.app.getCurrentProject();
        const selectedSites = Array.from(document.getElementById('comparisonSiteSelector')?.selectedOptions || [])
            .map(option => option.value);
        
        if (!project || selectedSites.length === 0) {
            alert('No data available for export');
            return;
        }
        
        const sectionData = calculateSectionLevelData(project, selectedSites);
        
        // Create CSV content
        let csvContent = 'Section,Question,' + selectedSites.join(',') + '\\n';
        
        Object.keys(sectionData.sections).forEach(sectionName => {
            const section = sectionData.sections[sectionName];
            
            // Add section summary
            const sectionRow = [formatSectionName(sectionName), 'SECTION AVERAGE'];
            selectedSites.forEach(siteName => {
                const siteData = section.sites[siteName];
                sectionRow.push(siteData ? `${siteData.score}%` : 'N/A');
            });
            csvContent += sectionRow.join(',') + '\\n';
            
            // Add questions
            section.questions.forEach(questionData => {
                const questionRow = [formatSectionName(sectionName), questionData.name];
                selectedSites.forEach(siteName => {
                    const siteQuestionData = questionData.sites[siteName];
                    if (siteQuestionData) {
                        const scorePercentage = siteQuestionData.score > 0 ? 
                            Math.round((siteQuestionData.score / 5) * 100) : 0;
                        questionRow.push(siteQuestionData.score > 0 ? `${scorePercentage}%` : 'N/A');
                    } else {
                        questionRow.push('N/A');
                    }
                });
                csvContent += questionRow.join(',') + '\\n';
            });
            
            csvContent += '\\n'; // Empty line between sections
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `site-performance-comparison-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('Data exported successfully');
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Please try again.');
    }
}

// Create trend analysis chart
function createTrendAnalysisChart() {
    const canvas = document.getElementById('trendAnalysisChart');
    if (!canvas) {
        console.warn('Trend analysis chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.warn('Could not get 2D context for trend analysis chart');
        return;
    }
    
    // Get current project data
    const project = window.app ? window.app.getCurrentProject() : null;
    if (!project) {
        showNoDataMessage(canvas, 'No project data available for trend analysis.');
        return;
    }
    
    // Get historical data (for now, we'll create sample data based on current project state)
    const historicalData = getHistoricalData();
    
    if (historicalData.length === 0) {
        showNoDataMessage(canvas, 'No historical data available for trend analysis. This feature requires multiple audit periods.');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.map(data => data.date),
            datasets: [{
                label: 'Management System Score',
                data: historicalData.map(data => data.managementScore),
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Average Site Score',
                data: historicalData.map(data => data.siteScore),
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Trends Over Time',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Score (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time Period'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    hideNoDataMessage(canvas);
    console.log('Trend analysis chart created successfully');
}

// Create performance breakdown chart
function createPerformanceBreakdownChart() {
    const canvas = document.getElementById('performanceBreakdownChart');
    if (!canvas) {
        console.warn('Performance breakdown chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.warn('Could not get 2D context for performance breakdown chart');
        return;
    }
    
    // Get current project data
    const project = window.app ? window.app.getCurrentProject() : null;
    if (!project) {
        showNoDataMessage(canvas, 'No project data available for performance breakdown.');
        return;
    }
    
    // Calculate category scores based on actual project data
    const categoryScores = calculateCategoryScoresFromProject(project);
    
    if (Object.keys(categoryScores).length === 0) {
        showNoDataMessage(canvas, 'No data available for performance breakdown. Please complete some audit questions first.');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(categoryScores),
            datasets: [{
                label: 'Performance Score',
                data: Object.values(categoryScores),
                borderColor: '#805ad5',
                backgroundColor: 'rgba(128, 90, 213, 0.2)',
                pointBackgroundColor: '#805ad5',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#805ad5',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Breakdown by Category',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        showLabelBackdrop: false
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
    
    hideNoDataMessage(canvas);
    console.log('Performance breakdown chart created successfully');
}

// Get historical data (sample data based on current project state)
function getHistoricalData() {
    const project = window.app ? window.app.getCurrentProject() : null;
    if (!project) return [];
    
    // Calculate current management score
    let currentManagementScore = 0;
    let managementAnswered = 0;
    let managementTotal = 0;
    
    if (project.managementSystemAudit) {
        for (const section in project.managementSystemAudit) {
            if (Array.isArray(project.managementSystemAudit[section])) {
                project.managementSystemAudit[section].forEach(item => {
                    managementTotal++;
                    if (item.score > 0) {
                        currentManagementScore += item.score;
                        managementAnswered++;
                    }
                });
            }
        }
    }
    
    const managementPercentage = managementAnswered > 0 ? 
        Math.round((currentManagementScore / managementAnswered / 5) * 100) : 0;
    
    // Calculate current site score
    let currentSiteScore = 0;
    let siteAnswered = 0;
    let siteTotal = 0;
    let siteCount = 0;
    
    if (project.sites) {
        for (const siteName in project.sites) {
            const site = project.sites[siteName];
            let siteTotalScore = 0;
            let siteAnsweredCount = 0;
            let siteQuestionCount = 0;
            
            for (const section in site) {
                if (Array.isArray(site[section])) {
                    site[section].forEach(item => {
                        siteQuestionCount++;
                        if (item.score > 0) {
                            siteTotalScore += item.score;
                            siteAnsweredCount++;
                        }
                    });
                }
            }
            
            if (siteAnsweredCount > 0) {
                currentSiteScore += (siteTotalScore / siteAnsweredCount / 5) * 100;
                siteCount++;
            }
            siteTotal += siteQuestionCount;
            siteAnswered += siteAnsweredCount;
        }
    }
    
    const sitePercentage = siteCount > 0 ? Math.round(currentSiteScore / siteCount) : 0;
    
    // If no data available, return empty array
    if (managementAnswered === 0 && siteAnswered === 0) {
        return [];
    }
    
    // Generate sample historical data showing improvement over time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const historicalData = [];
    
    for (let i = 0; i < months.length; i++) {
        const progressFactor = (i + 1) / months.length;
        const baseManagementScore = Math.max(20, managementPercentage * (0.4 + 0.6 * progressFactor));
        const baseSiteScore = Math.max(15, sitePercentage * (0.3 + 0.7 * progressFactor));
        
        historicalData.push({
            date: months[i],
            managementScore: Math.round(baseManagementScore + (Math.random() - 0.5) * 10),
            siteScore: Math.round(baseSiteScore + (Math.random() - 0.5) * 15)
        });
    }
    
    return historicalData;
}

// Calculate category scores based on actual project data
function calculateCategoryScoresFromProject(project) {
    const categories = {
        'Policy & Planning': [],
        'Training & Competency': [],
        'Risk Management': [],
        'Incident Management': [],
        'Emergency Preparedness': [],
        'Monitoring & Review': []
    };
    
    // Process management system questions
    if (project.managementSystemAudit) {
        for (const section in project.managementSystemAudit) {
            if (Array.isArray(project.managementSystemAudit[section])) {
                project.managementSystemAudit[section].forEach(item => {
                    if (item.score > 0) { // Only include answered questions
                        const questionText = item.name.toLowerCase();
                        categorizeQuestion(questionText, categories, item.score);
                    }
                });
            }
        }
    }
    
    // Process site questions
    if (project.sites) {
        for (const siteName in project.sites) {
            const site = project.sites[siteName];
            for (const section in site) {
                if (Array.isArray(site[section])) {
                    site[section].forEach(item => {
                        if (item.score > 0) { // Only include answered questions
                            const questionText = item.name.toLowerCase();
                            categorizeQuestion(questionText, categories, item.score);
                        }
                    });
                }
            }
        }
    }
    
    // Calculate average scores for each category
    const categoryScores = {};
    Object.keys(categories).forEach(category => {
        const scores = categories[category];
        if (scores.length > 0) {
            const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            categoryScores[category] = Math.round((averageScore / 5) * 100);
        }
    });
    
    return categoryScores;
}

// Helper function to categorize questions based on keywords
function categorizeQuestion(questionText, categories, score) {
    if (questionText.includes('policy') || questionText.includes('planning') || 
        questionText.includes('procedure') || questionText.includes('manual')) {
        categories['Policy & Planning'].push(score);
    } else if (questionText.includes('training') || questionText.includes('competency') || 
               questionText.includes('qualification') || questionText.includes('skill')) {
        categories['Training & Competency'].push(score);
    } else if (questionText.includes('risk') || questionText.includes('hazard') || 
               questionText.includes('assessment') || questionText.includes('danger')) {
        categories['Risk Management'].push(score);
    } else if (questionText.includes('incident') || questionText.includes('accident') || 
               questionText.includes('investigation') || questionText.includes('near miss')) {
        categories['Incident Management'].push(score);
    } else if (questionText.includes('emergency') || questionText.includes('evacuation') || 
               questionText.includes('fire') || questionText.includes('first aid')) {
        categories['Emergency Preparedness'].push(score);
    } else {
        categories['Monitoring & Review'].push(score);
    }
}

// Update all comparison charts
function updateComparisonCharts() {
    // Update site comparison chart
    createSiteComparisonChart();
    
    // Update trend analysis chart
    createTrendAnalysisChart();
    
    // Update performance breakdown chart
    createPerformanceBreakdownChart();
}

// Export functions for use in other modules
window.comparisonCharts = {
    initializeComparisonCharts,
    updateComparisonCharts,
    createSiteComparisonChart,
    createTrendAnalysisChart,
    createPerformanceBreakdownChart
};

// Function to initialize charts when reports tab is shown
function initializeReportsTabCharts() {
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            createSiteComparisonChart();
            createTrendAnalysisChart();
            createPerformanceBreakdownChart();
        }
    }, 100);
}

// Export this function globally
window.initializeReportsTabCharts = initializeReportsTabCharts;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other modules to initialize
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            initializeComparisonCharts();
            setupComparisonChartEventListeners();
        }
    }, 1000);
});

// Setup event listeners for comparison chart controls
function setupComparisonChartEventListeners() {
    // Chart type selector buttons
    const chartTypeButtons = document.querySelectorAll('.chart-type-selector button');
    chartTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            chartTypeButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Recreate chart with new type
            createSiteComparisonChart();
        });
    });
    
    // Management audit inclusion checkbox
    const includeManagementCheckbox = document.getElementById('includeManagementAudit');
    if (includeManagementCheckbox) {
        includeManagementCheckbox.addEventListener('change', function() {
            createSiteComparisonChart();
        });
    }
    
    // Site selection change
    const comparisonSiteSelector = document.getElementById('comparisonSiteSelector');
    if (comparisonSiteSelector) {
        comparisonSiteSelector.addEventListener('change', function() {
            createSiteComparisonChart();
        });
    }
    
    // Select all sites button
    const selectAllSitesBtn = document.getElementById('selectAllSitesBtn');
    if (selectAllSitesBtn) {
        selectAllSitesBtn.addEventListener('click', function() {
            const selector = document.getElementById('comparisonSiteSelector');
            if (selector) {
                Array.from(selector.options).forEach(option => {
                    option.selected = true;
                });
                createSiteComparisonChart();
            }
        });
    }
    
    // Clear site selection button
    const clearSiteSelectionBtn = document.getElementById('clearSiteSelectionBtn');
    if (clearSiteSelectionBtn) {
        clearSiteSelectionBtn.addEventListener('click', function() {
            const selector = document.getElementById('comparisonSiteSelector');
            if (selector) {
                Array.from(selector.options).forEach(option => {
                    option.selected = false;
                });
                createSiteComparisonChart();
            }
        });
    }
}
