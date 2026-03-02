// Comparison Chart Extension
// Extends chart functionality with comparison and trend analysis

// Initialize comparison charts
function initializeComparisonCharts() {
    createSiteComparisonChart();
    createTrendAnalysisChart();
    createPerformanceBreakdownChart();
}

function getCurrentProjectData() {
    if (window.app?.getCurrentProject) return window.app.getCurrentProject();
    return null;
}

function getSitesForComparison(project) {
    if (!project?.sites) return [];
    return Object.entries(project.sites).map(([name, site]) => {
        let totalScore = 0;
        let scoredQuestions = 0;
        let totalQuestions = 0;

        Object.values(site || {}).forEach(section => {
            if (!Array.isArray(section)) return;
            totalQuestions += section.length;
            section.forEach(item => {
                if (item.score > 0) {
                    totalScore += item.score;
                    scoredQuestions += 1;
                }
            });
        });

        const averageScore = scoredQuestions > 0 ? totalScore / scoredQuestions : 0;
        const scorePercentage = Math.round((averageScore / 5) * 100);

        return {
            name,
            score: scorePercentage,
            completed: totalQuestions > 0 && scoredQuestions === totalQuestions
        };
    });
}

// Create site comparison chart
function createSiteComparisonChart() {
    const ctx = document.getElementById('siteComparisonChart');
    if (!ctx) return;

    const project = getCurrentProjectData();
    const sitesData = getSitesForComparison(project);
    const completedSites = sitesData.filter(site => site.score > 0);

    if (completedSites.length === 0) {
        ctx.parentElement.innerHTML = '<p>No completed sites available for comparison.</p>';
        return;
    }

    const labels = completedSites.map(site => site.name);
    const scores = completedSites.map(site => site.score);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Site Performance Score (%)',
                data: scores,
                backgroundColor: scores.map(score => {
                    if (score >= 80) return '#48bb78';
                    if (score >= 70) return '#38a169';
                    if (score >= 50) return '#ed8936';
                    return '#e53e3e';
                }),
                borderColor: '#2d3748',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        text: 'Sites'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Site Performance Comparison'
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

// Create trend analysis chart
function createTrendAnalysisChart() {
    const ctx = document.getElementById('trendAnalysisChart');
    if (!ctx) return;
    
    // Get historical data from localStorage or create sample data
    const historicalData = getHistoricalData();
    
    if (historicalData.length === 0) {
        ctx.parentElement.innerHTML = '<p>No historical data available for trend analysis.</p>';
        return;
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
                tension: 0.4
            }, {
                label: 'Average Site Score',
                data: historicalData.map(data => data.siteScore),
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Trends Over Time'
                }
            }
        }
    });
}

// Create performance breakdown chart
function createPerformanceBreakdownChart() {
    const ctx = document.getElementById('performanceBreakdownChart');
    if (!ctx) return;

    const projectData = getCurrentProjectData();
    const sitesData = getSitesForComparison(projectData);

    // Calculate category scores
    const categoryScores = calculateCategoryScores(projectData, sitesData);

    if (Object.keys(categoryScores).length === 0) {
        ctx.parentElement.innerHTML = '<p>No data available for performance breakdown.</p>';
        return;
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
                pointHoverBorderColor: '#805ad5'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Breakdown by Category'
                }
            }
        }
    });
}

// Get historical data (mock data for demonstration)
function getHistoricalData() {
    // In a real application, this would come from a database
    // For now, we'll create some sample historical data
    const currentProject = getCurrentProjectData();
    const currentSites = getSitesForComparison(currentProject);
    
    if (!currentProject && currentSites.length === 0) {
        return [];
    }

    let currentManagementScore = 0;
    if (currentProject?.managementSystemAudit) {
        let totalScore = 0;
        let scoredItems = 0;
        Object.values(currentProject.managementSystemAudit).forEach(section => {
            if (!Array.isArray(section)) return;
            section.forEach(item => {
                if (item.score > 0) {
                    totalScore += item.score;
                    scoredItems += 1;
                }
            });
        });
        currentManagementScore = scoredItems > 0 ? Math.round((totalScore / scoredItems / 5) * 100) : 0;
    }

    const currentSiteScore = currentSites.length > 0 ?
        Math.round(currentSites.reduce((sum, site) => sum + site.score, 0) / currentSites.length) : 0;
    
    // Generate sample historical data showing improvement over time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const historicalData = [];
    
    for (let i = 0; i < months.length; i++) {
        const progressFactor = (i + 1) / months.length;
        historicalData.push({
            date: months[i],
            managementScore: Math.round(currentManagementScore * (0.6 + 0.4 * progressFactor)),
            siteScore: Math.round(currentSiteScore * (0.5 + 0.5 * progressFactor))
        });
    }
    
    return historicalData;
}

// Calculate category scores based on question groupings
function calculateCategoryScores(projectData, sitesData) {
    const categories = {
        'Policy & Planning': [],
        'Training & Competency': [],
        'Risk Management': [],
        'Incident Management': [],
        'Emergency Preparedness': [],
        'Monitoring & Review': []
    };

    const classifyQuestion = (text) => {
        const questionText = (text || '').toLowerCase();
        if (questionText.includes('policy') || questionText.includes('planning')) {
            return 'Policy & Planning';
        }
        if (questionText.includes('training') || questionText.includes('competency')) {
            return 'Training & Competency';
        }
        if (questionText.includes('risk') || questionText.includes('hazard')) {
            return 'Risk Management';
        }
        if (questionText.includes('incident') || questionText.includes('accident')) {
            return 'Incident Management';
        }
        if (questionText.includes('emergency') || questionText.includes('evacuation')) {
            return 'Emergency Preparedness';
        }
        return 'Monitoring & Review';
    };

    if (projectData?.managementSystemAudit) {
        Object.values(projectData.managementSystemAudit).forEach(section => {
            if (!Array.isArray(section)) return;
            section.forEach(item => {
                const category = classifyQuestion(item.name);
                categories[category].push(item.score);
            });
        });
    }

    if (projectData?.sites) {
        Object.values(projectData.sites).forEach(site => {
            Object.values(site || {}).forEach(section => {
                if (!Array.isArray(section)) return;
                section.forEach(item => {
                    const category = classifyQuestion(item.name);
                    categories[category].push(item.score);
                });
            });
        });
    }

    // Calculate average scores for each category
    const categoryScores = {};
    Object.keys(categories).forEach(category => {
        const scores = categories[category].filter(score => score > 0); // Exclude N/A scores
        if (scores.length > 0) {
            categoryScores[category] = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 20);
        }
    });
    
    return categoryScores;
}

// Update all comparison charts
function updateComparisonCharts() {
    // Clear existing charts
    const chartContainers = ['siteComparisonChart', 'trendAnalysisChart', 'performanceBreakdownChart'];
    chartContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(container);
            if (existingChart) {
                existingChart.destroy();
            }
        }
    });
    
    // Recreate charts with updated data
    setTimeout(() => {
        initializeComparisonCharts();
    }, 100);
}

// Export functions for use in other modules
window.comparisonCharts = {
    initializeComparisonCharts,
    updateComparisonCharts
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