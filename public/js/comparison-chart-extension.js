// comparison-chart-extension.js
// Enhanced site performance comparison with hierarchical grouping and drill-down

// Global variables for chart state
let currentViewMode = 'category'; // 'category' or 'question'
let categoryDetailChart = null;
let currentChartType = 'stacked';

// Define section categories and their sections
const sectionCategories = {
    'Management System': [
        'Policy and Planning',
        'Training and Competency',
        'Risk Management',
        'Incident Management',
        'Emergency Preparedness',
        'Monitoring and Review'
    ],
    'Site Performance': [
        'Site Conditions',
        'Work Procedures',
        'Plant and Equipment',
        'Contractor Management',
        'Environmental Management'
    ]
};

// Initialize comparison charts
function initializeComparisonCharts() {
    console.log('Initializing comparison charts...');
    
    // Initialize event listeners for comparison controls
    initializeComparisonControls();
    
    // Initialize event listeners for new controls
    initializeNewControls();
    
    // Create initial chart
    updateSiteComparisonChart();
    
    console.log('Comparison charts initialized successfully');
}

// Initialize event listeners for new controls
function initializeNewControls() {
    console.log('Initializing new chart controls...');
    
    // Toggle view button
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', toggleChartView);
    } else {
        console.error('Toggle View button not found');
    }
    
    // Add limit selector for question view
    const limitSelector = document.getElementById('dataLimitSelector');
    if (limitSelector) {
        limitSelector.addEventListener('change', updateSiteComparisonChart);
    }
    
    console.log('New chart controls initialized successfully');
}

// Initialize event listeners for comparison controls
function initializeComparisonControls() {
    console.log('Initializing comparison controls...');
    
    // Select all sites button
    const selectAllSitesBtn = document.getElementById('selectAllSitesBtn');
    if (selectAllSitesBtn) {
        selectAllSitesBtn.addEventListener('click', selectAllSitesForComparison);
    } else {
        console.error('Select All Sites button not found');
    }
    
    // Clear site selection button
    const clearSiteSelectionBtn = document.getElementById('clearSiteSelectionBtn');
    if (clearSiteSelectionBtn) {
        clearSiteSelectionBtn.addEventListener('click', clearSiteSelectionForComparison);
    } else {
        console.error('Clear Site Selection button not found');
    }
    
    // Chart type selector buttons
    const chartTypeButtons = document.querySelectorAll('.chart-type-selector button');
    if (chartTypeButtons.length > 0) {
        chartTypeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chartType;
                selectChartType(chartType);
            });
        });
    } else {
        console.error('Chart type buttons not found');
    }
    
    // Include management audit checkbox
    const includeManagementAuditCheckbox = document.getElementById('includeManagementAudit');
    if (includeManagementAuditCheckbox) {
        includeManagementAuditCheckbox.addEventListener('change', updateSiteComparisonChart);
    } else {
        console.error('Include Management Audit checkbox not found');
    }
    
    // Comparison site selector
    const comparisonSiteSelector = document.getElementById('comparisonSiteSelector');
    if (comparisonSiteSelector) {
        comparisonSiteSelector.addEventListener('change', updateSiteComparisonChart);
    } else {
        console.error('Comparison site selector not found');
    }
    
    console.log('Comparison controls initialized successfully');
}

// Toggle between category and question view
function toggleChartView() {
    currentViewMode = currentViewMode === 'category' ? 'question' : 'category';
    const toggleBtn = document.getElementById('toggleViewBtn');
    toggleBtn.innerHTML = `<i class="fas fa-${currentViewMode === 'category' ? 'layer-group' : 'list'}"></i> View: ${currentViewMode === 'category' ? 'Categories' : 'Questions'}`;
    updateSiteComparisonChart();
}

// Update site comparison chart based on current view
function updateSiteComparisonChart() {
    try {
        console.log('Updating site comparison chart...');
        
        const selector = document.getElementById('comparisonSiteSelector');
        const includeManagementAudit = document.getElementById('includeManagementAudit').checked;
        const noDataMessage = document.getElementById('noSiteComparisonData');
        
        if (!selector) {
            console.error('Comparison site selector not found');
            return;
        }
        
        // Get selected sites
        const selectedOptions = Array.from(selector.selectedOptions);
        if (selectedOptions.length < 2) {
            // Show no data message
            if (noDataMessage) {
                noDataMessage.style.display = 'block';
            }
            
            // Clear the chart
            const canvas = document.getElementById('siteComparisonChart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Destroy existing chart if it exists
                const existingChart = Chart.getChart(canvas);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
            
            console.log('Not enough sites selected for comparison');
            return;
        }
        
        // Hide no data message
        if (noDataMessage) {
            noDataMessage.style.display = 'none';
        }
        
        // Get selected site names
        const selectedSiteNames = selectedOptions.map(option => option.value);
        
        // Get chart type
        const activeChartTypeButton = document.querySelector('.chart-type-selector button.active');
        currentChartType = activeChartTypeButton ? activeChartTypeButton.dataset.chartType : 'stacked';
        
        // Get current project
        const project = app.getCurrentProject();
        if (!project) {
            console.error('No project found');
            return;
        }
        
        // Get site data for selected sites
        const sites = selectedSiteNames.map(siteName => {
            const siteData = project.sites[siteName];
            
            return {
                name: siteName,
                data: siteData
            };
        });
        
        // Prepare data for the chart based on current view
        let chartData;
        if (currentViewMode === 'category') {
            chartData = prepareCategoryComparisonData(sites, includeManagementAudit);
        } else {
            chartData = prepareQuestionComparisonData(sites, includeManagementAudit);
        }
        
        // Render the chart
        renderSiteComparisonChart(chartData, currentChartType);
        
        console.log('Site comparison chart updated successfully');
    } catch (error) {
        console.error('Error updating site comparison chart:', error);
    }
}

// Prepare data for category comparison chart
function prepareCategoryComparisonData(sites, includeManagementAudit) {
    const project = app.getCurrentProject();
    if (!project) return null;
    
    const chartData = {
        labels: Object.keys(sectionCategories),
        datasets: []
    };
    
    // Create datasets for each site
    const colors = [
        'rgba(102, 126, 234, 0.7)',   // #667eea
        'rgba(118, 75, 162, 0.7)',    // #764ba2
        'rgba(240, 147, 251, 0.7)',   // #f093fb
        'rgba(245, 87, 108, 0.7)',    // #f5576c
        'rgba(79, 172, 254, 0.7)',    // #4facfe
        'rgba(0, 242, 254, 0.7)',     // #00f2fe
        'rgba(67, 233, 123, 0.7)',    // #43e97b
        'rgba(56, 249, 215, 0.7)'     // #38f9d7
    ];
    
    let colorIndex = 0;
    
    // Add management dataset if included
    if (includeManagementAudit && project.managementSystemAudit) {
        const managementData = [];
        
        for (const category in sectionCategories) {
            let totalScore = 0;
            let itemCount = 0;
            
            sectionCategories[category].forEach(section => {
                if (project.managementSystemAudit[section]) {
                    const items = project.managementSystemAudit[section];
                    items.forEach(item => {
                        if (item.score > 0) {
                            totalScore += item.score;
                            itemCount++;
                        }
                    });
                }
            });
            
            const averageScore = itemCount > 0 ? totalScore / itemCount : 0;
            managementData.push(averageScore);
        }
        
        chartData.datasets.push({
            label: 'Management System',
            data: managementData,
            backgroundColor: colors[colorIndex % colors.length],
            borderColor: colors[colorIndex % colors.length].replace('0.7', '1'),
            borderWidth: 1
        });
        
        colorIndex++;
    }
    
    // Add datasets for each site
    sites.forEach(site => {
        const siteData = [];
        
        for (const category in sectionCategories) {
            let totalScore = 0;
            let itemCount = 0;
            
            if (site.data) {
                sectionCategories[category].forEach(section => {
                    if (site.data[section]) {
                        const items = site.data[section];
                        items.forEach(item => {
                            if (item.score > 0) {
                                totalScore += item.score;
                                itemCount++;
                            }
                        });
                    }
                });
            }
            
            const averageScore = itemCount > 0 ? totalScore / itemCount : 0;
            siteData.push(averageScore);
        }
        
        chartData.datasets.push({
            label: site.name,
            data: siteData,
            backgroundColor: colors[colorIndex % colors.length],
            borderColor: colors[colorIndex % colors.length].replace('0.7', '1'),
            borderWidth: 1
        });
        
        colorIndex++;
    });
    
    console.log('Category comparison data prepared:', chartData);
    return chartData;
}

// Prepare data for question comparison chart with limit
function prepareQuestionComparisonData(sites, includeManagementAudit) {
    const project = app.getCurrentProject();
    if (!project) return null;
    
    // Get data limit from selector
    const limitSelector = document.getElementById('dataLimitSelector');
    const limit = limitSelector ? parseInt(limitSelector.value) : 10;
    
    const chartData = {
        labels: [],
        datasets: []
    };
    
    // Get all question texts with their scores
    const questionData = [];
    
    // Add management questions if included
    if (includeManagementAudit && project.managementSystemAudit) {
        for (const section in project.managementSystemAudit) {
            if (Array.isArray(project.managementSystemAudit[section])) {
                project.managementSystemAudit[section].forEach(item => {
                    if (item.name && item.score > 0) {
                        questionData.push({
                            text: item.name,
                            source: 'Management System',
                            score: item.score,
                            section: section
                        });
                    }
                });
            }
        }
    }
    
    // Add site questions
    for (const site of sites) {
        if (site.data) {
            for (const section in site.data) {
                if (Array.isArray(site.data[section])) {
                    site.data[section].forEach(item => {
                        if (item.name && item.score > 0) {
                            questionData.push({
                                text: item.name,
                                source: site.name,
                                score: item.score,
                                section: section
                            });
                        }
                    });
                }
            }
        }
    }
    
    // Group by question text and calculate average score and variance
    const questionMap = {};
    questionData.forEach(q => {
        if (!questionMap[q.text]) {
            questionMap[q.text] = {
                text: q.text,
                scores: [],
                sources: []
            };
        }
        questionMap[q.text].scores.push(q.score);
        questionMap[q.text].sources.push(q.source);
    });
    
    // Calculate average score and variation for each question
    const questionsWithStats = Object.keys(questionMap).map(key => {
        const scores = questionMap[key].scores;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / scores.length;
        
        return {
            text: key,
            average: avg,
            variance: variance,
            sources: questionMap[key].sources
        };
    });
    
    // Sort by variance (highest variation first) to show most interesting questions
    questionsWithStats.sort((a, b) => b.variance - a.variance);
    
    // Take top N questions
    const topQuestions = questionsWithStats.slice(0, limit);
    
    // Set chart labels
    chartData.labels = topQuestions.map(q => q.text.length > 30 ? q.text.substring(0, 30) + '...' : q.text);
    
    // Create datasets for each site
    const colors = [
        'rgba(102, 126, 234, 0.7)',   // #667eea
        'rgba(118, 75, 162, 0.7)',    // #764ba2
        'rgba(240, 147, 251, 0.7)',   // #f093fb
        'rgba(245, 87, 108, 0.7)',    // #f5576c
        'rgba(79, 172, 254, 0.7)',    // #4facfe
        'rgba(0, 242, 254, 0.7)',     // #00f2fe
        'rgba(67, 233, 123, 0.7)',    // #43e97b
        'rgba(56, 249, 215, 0.7)'     // #38f9d7
    ];
    
    let colorIndex = 0;
    
    // Add management dataset if included
    if (includeManagementAudit) {
        const managementData = topQuestions.map(q => {
            const question = questionData.find(qd => qd.text === q.text && qd.source === 'Management System');
            return question ? question.score : 0;
        });
        
        chartData.datasets.push({
            label: 'Management System',
            data: managementData,
            backgroundColor: colors[colorIndex % colors.length],
            borderColor: colors[colorIndex % colors.length].replace('0.7', '1'),
            borderWidth: 1
        });
        
        colorIndex++;
    }
    
    // Add datasets for each site
    sites.forEach(site => {
        const siteData = topQuestions.map(q => {
            const question = questionData.find(qd => qd.text === q.text && qd.source === site.name);
            return question ? question.score : 0;
        });
        
        chartData.datasets.push({
            label: site.name,
            data: siteData,
            backgroundColor: colors[colorIndex % colors.length],
            borderColor: colors[colorIndex % colors.length].replace('0.7', '1'),
            borderWidth: 1
        });
        
        colorIndex++;
    });
    
    console.log('Question comparison data prepared:', chartData);
    return chartData;
}

// Render site comparison chart
function renderSiteComparisonChart(chartData, chartType) {
    try {
        console.log('Rendering site comparison chart...');
        
        const canvas = document.getElementById('siteComparisonChart');
        if (!canvas) {
            console.error('Site comparison chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Create new chart based on chart type
        const chartConfig = {
            type: chartType === 'radar' ? 'radar' : 'bar',
            data: chartData,
            options: getChartOptions(chartType, chartData.labels)
        };
        
        // Add click event for category view
        if (currentViewMode === 'category') {
            chartConfig.options.onClick = (event, elements) => {
                if (elements.length > 0) {
                    const categoryIndex = elements[0].index;
                    const categoryName = chartData.labels[categoryIndex];
                    showCategoryDetailModal(categoryName, chartData.datasets);
                }
            };
        }
        
        // Create the chart
        window.siteComparisonChart = new Chart(ctx, chartConfig);
        
        console.log('Site comparison chart rendered successfully');
    } catch (error) {
        console.error('Error rendering site comparison chart:', error);
    }
}

// Get chart options based on chart type
function getChartOptions(chartType, labels) {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: currentViewMode === 'category' ? 
                    'Site Performance Comparison by Category' : 
                    `Top ${labels.length} Questions by Score Variation`
            },
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        }
    };
    
    switch (chartType) {
        case 'stacked':
            return {
                ...baseOptions,
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: currentViewMode === 'category' ? 'Categories' : 'Questions'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        max: 5,
                        title: {
                            display: true,
                            text: 'Average Score'
                        }
                    }
                }
            };
            
        case 'grouped':
            return {
                ...baseOptions,
                scales: {
                    x: {
                        stacked: false,
                        title: {
                            display: true,
                            text: currentViewMode === 'category' ? 'Categories' : 'Questions'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true,
                        max: 5,
                        title: {
                            display: true,
                            text: 'Average Score'
                        }
                    }
                }
            };
            
        case 'radar':
            return {
                ...baseOptions,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            };
            
        default:
            return baseOptions;
    }
}

// Show category detail modal with sections table
function showCategoryDetailModal(categoryName, datasets) {
    // Set modal title
    document.getElementById('sectionDetailModalLabel').textContent = `Category: ${categoryName}`;
    
    // Get project data
    const project = app.getCurrentProject();
    if (!project) return;
    
    // Get all sections in this category
    const sections = sectionCategories[categoryName] || [];
    
    // Create table HTML
    let tableHTML = `
        <div class="category-detail-container">
            <h5>Sections in ${categoryName}</h5>
            <div class="section-cards">
    `;
    
    // Add section cards
    sections.forEach(section => {
        // Calculate section average for each site
        const sectionAverages = {};
        
        // Get selected site names
        const selectedSiteNames = Array.from(document.getElementById('comparisonSiteSelector').selectedOptions)
            .map(option => option.value);
        
        // Add management data if included
        const includeManagementAudit = document.getElementById('includeManagementAudit').checked;
        if (includeManagementAudit && project.managementSystemAudit && project.managementSystemAudit[section]) {
            const items = project.managementSystemAudit[section];
            const totalScore = items.reduce((sum, item) => sum + (item.score || 0), 0);
            const itemCount = items.filter(item => item.score > 0).length;
            sectionAverages['Management System'] = itemCount > 0 ? (totalScore / itemCount).toFixed(2) : 'N/A';
        }
        
        // Add site data
        selectedSiteNames.forEach(siteName => {
            if (project.sites && project.sites[siteName] && project.sites[siteName][section]) {
                const items = project.sites[siteName][section];
                const totalScore = items.reduce((sum, item) => sum + (item.score || 0), 0);
                const itemCount = items.filter(item => item.score > 0).length;
                sectionAverages[siteName] = itemCount > 0 ? (totalScore / itemCount).toFixed(2) : 'N/A';
            } else {
                sectionAverages[siteName] = 'N/A';
            }
        });
        
        // Create section card
        tableHTML += `
            <div class="section-card">
                <div class="section-header">
                    <h6>${section}</h6>
                    <button class="btn btn-sm btn-outline-primary view-questions-btn" data-section="${section}">
                        View Questions
                    </button>
                </div>
                <div class="section-scores">
        `;
        
        // Add scores for each site
        Object.keys(sectionAverages).forEach(siteName => {
            tableHTML += `
                <div class="score-item">
                    <span class="site-name">${siteName}:</span>
                    <span class="score-value">${sectionAverages[siteName]}</span>
                </div>
            `;
        });
        
        tableHTML += `
                </div>
            </div>
        `;
    });
    
    tableHTML += `
            </div>
            
            <div class="questions-detail" id="questionsDetailContainer" style="display: none;">
                <h5>Questions in Selected Section</h5>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Question</th>
        `;
    
    // Add headers for each site
    selectedSiteNames.forEach(siteName => {
        tableHTML += `<th>${siteName}</th>`;
    });
    
    // Add management header if included
    if (includeManagementAudit) {
        tableHTML += `<th>Management System</th>`;
    }
    
    tableHTML += `
                            </tr>
                        </thead>
                        <tbody id="questionsTableBody">
                            <!-- Questions will be populated here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Set modal body content
    const modalBody = document.querySelector('#sectionDetailModal .modal-body');
    if (modalBody) {
        modalBody.innerHTML = tableHTML;
        
        // Add event listeners to "View Questions" buttons
        modalBody.querySelectorAll('.view-questions-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const section = this.dataset.section;
                showSectionQuestions(section, selectedSiteNames, includeManagementAudit);
            });
        });
    }
    
    // Show modal
    $('#sectionDetailModal').modal('show');
}

// Show questions for a specific section
function showSectionQuestions(section, siteNames, includeManagementAudit) {
    const project = app.getCurrentProject();
    if (!project) return;
    
    // Get all questions in this section
    const sectionQuestions = [];
    
    // Add management questions if included
    if (includeManagementAudit && project.managementSystemAudit && project.managementSystemAudit[section]) {
        project.managementSystemAudit[section].forEach(item => {
            if (item.name && item.score > 0) {
                sectionQuestions.push({
                    text: item.name,
                    source: 'Management System',
                    score: item.score
                });
            }
        });
    }
    
    // Add site questions
    siteNames.forEach(siteName => {
        if (project.sites && project.sites[siteName] && project.sites[siteName][section]) {
            project.sites[siteName][section].forEach(item => {
                if (item.name && item.score > 0) {
                    sectionQuestions.push({
                        text: item.name,
                        source: siteName,
                        score: item.score
                    });
                }
            });
        }
    });
    
    // Group by question text
    const questionMap = {};
    sectionQuestions.forEach(q => {
        if (!questionMap[q.text]) {
            questionMap[q.text] = {
                text: q.text,
                scores: {}
            };
        }
        questionMap[q.text].scores[q.source] = q.score;
    });
    
    // Create table rows
    let tableHTML = '';
    Object.keys(questionMap).forEach(questionText => {
        const question = questionMap[questionText];
        
        tableHTML += `
            <tr>
                <td>${question.text}</td>
        `;
        
        // Add scores for each site
        siteNames.forEach(siteName => {
            const score = question.scores[siteName] || '-';
            tableHTML += `<td>${score}</td>`;
        });
        
        // Add management score if included
        if (includeManagementAudit) {
            const score = question.scores['Management System'] || '-';
            tableHTML += `<td>${score}</td>`;
        }
        
        tableHTML += `
            </tr>
        `;
    });
    
    // Update table body
    const tableBody = document.getElementById('questionsTableBody');
    if (tableBody) {
        tableBody.innerHTML = tableHTML;
    }
    
    // Show questions detail container
    const questionsDetailContainer = document.getElementById('questionsDetailContainer');
    if (questionsDetailContainer) {
        questionsDetailContainer.style.display = 'block';
    }
}

// Select all sites for comparison
function selectAllSitesForComparison() {
    try {
        console.log('Selecting all sites for comparison...');
        const selector = document.getElementById('comparisonSiteSelector');
        if (!selector) {
            console.error('Comparison site selector not found');
            return;
        }
        
        const options = selector.querySelectorAll('option');
        options.forEach(option => {
            option.selected = true;
        });
        
        updateSiteComparisonChart();
        console.log('All sites selected for comparison');
    } catch (error) {
        console.error('Error selecting all sites for comparison:', error);
    }
}

// Clear site selection for comparison
function clearSiteSelectionForComparison() {
    try {
        console.log('Clearing site selection for comparison...');
        const selector = document.getElementById('comparisonSiteSelector');
        if (!selector) {
            console.error('Comparison site selector not found');
            return;
        }
        
        const options = selector.querySelectorAll('option');
        options.forEach(option => {
            option.selected = false;
        });
        
        // Clear the chart
        const canvas = document.getElementById('siteComparisonChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
        }
        
        // Show no data message
        const noDataMessage = document.getElementById('noSiteComparisonData');
        if (noDataMessage) {
            noDataMessage.style.display = 'block';
        }
        
        console.log('Site selection for comparison cleared');
    } catch (error) {
        console.error('Error clearing site selection for comparison:', error);
    }
}

// Select chart type
function selectChartType(chartType) {
    try {
        console.log(`Selecting chart type: ${chartType}`);
        
        // Update active button
        const chartTypeButtons = document.querySelectorAll('.chart-type-selector button');
        chartTypeButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-chart-type="${chartType}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Update chart
        updateSiteComparisonChart();
        console.log(`Chart type selected: ${chartType}`);
    } catch (error) {
        console.error('Error selecting chart type:', error);
    }
}

// Export functions for use in other modules
window.comparisonCharts = {
    initializeComparisonCharts,
    updateSiteComparisonChart
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other modules to initialize
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            initializeComparisonCharts();
        }
    }, 1000);
});