// questionEvaluation.js
(function() {
    // Event delegation for action buttons in question cards
    document.addEventListener('click', function(event) {
        // Check if the clicked element is an action button
        if (event.target.classList.contains('action-btn')) {
            // Find the parent question card
            const questionCard = event.target.closest('.question-card');
            if (questionCard) {
                // Get the question data from data attributes
                const department = questionCard.dataset.department;
                const area = questionCard.dataset.area;
                const text = questionCard.dataset.text;
                
                // Get the action type from the button text
                const buttonText = event.target.textContent.trim();
                
                // Handle different actions
                if (buttonText === 'Evaluate') {
                    event.preventDefault();
                    handleEvaluate(department, area, text);
                } else if (buttonText === 'Mark N/A') {
                    event.preventDefault();
                    handleMarkNA(department, area, text);
                } else if (buttonText === 'Create Action Plan') {
                    event.preventDefault();
                    handleCreateActionPlan(department, area, text);
                } else if (buttonText === 'Assign Responsibility') {
                    event.preventDefault();
                    handleAssignResponsibility(department, area, text);
                } else if (buttonText === 'Schedule Action') {
                    event.preventDefault();
                    handleScheduleAction(department, area, text);
                } else if (buttonText === 'Add Comments') {
                    event.preventDefault();
                    handleAddComments(department, area, text);
                } else if (buttonText === 'Create Improvement') {
                    event.preventDefault();
                    handleCreateImprovement(department, area, text);
                } else if (buttonText === 'Track Progress') {
                    event.preventDefault();
                    handleTrackProgress(department, area, text);
                } else if (buttonText === 'Share Best Practice') {
                    event.preventDefault();
                    handleShareBestPractice(department, area, text);
                } else if (buttonText === 'Document') {
                    event.preventDefault();
                    handleDocument(department, area, text);
                }
            }
        }
    });

    // Function to handle evaluate button click
    function handleEvaluate(department, area, text) {
        // Create a simple modal for evaluation
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close-modal">&times;</span>
                <h3>Evaluate Question</h3>
                <div class="evaluation-form">
                    <div class="form-group">
                        <label>Question:</label>
                        <div class="question-display">${text}</div>
                    </div>
                    <div class="form-group">
                        <label for="evaluationScore">Score:</label>
                        <select id="evaluationScore" class="score-select">
                            <option value="0">0 - Not Applicable/Not Observed</option>
                            <option value="1">1 - Major Non-Conformance</option>
                            <option value="2">2 - Minor Non-Conformance</option>
                            <option value="3">3 - Observation/Improvement Opportunity</option>
                            <option value="4">4 - Conformance</option>
                            <option value="5">5 - Best Practice</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="evaluationComments">Comments:</label>
                        <textarea id="evaluationComments" rows="4" placeholder="Add comments or observations..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-green" id="saveEvaluationBtn">Save Evaluation</button>
                        <button class="btn btn-secondary" id="cancelEvaluationBtn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listeners for the modal
        const closeBtn = modal.querySelector('.close-modal');
        const saveBtn = modal.querySelector('#saveEvaluationBtn');
        const cancelBtn = modal.querySelector('#cancelEvaluationBtn');
        
        closeBtn.onclick = function() {
            document.body.removeChild(modal);
        };
        
        cancelBtn.onclick = function() {
            document.body.removeChild(modal);
        };
        
        saveBtn.onclick = function() {
            const score = parseInt(document.getElementById('evaluationScore').value);
            const comments = document.getElementById('evaluationComments').value;
            
            // Update the question in the data structure
            updateQuestionScore(department, area, text, score, comments);
            
            // Close the modal
            document.body.removeChild(modal);
            
            // Refresh the current tab to show the updated question
            const activeTab = document.querySelector('.tab.active').dataset.tabName;
            if (typeof showTab === 'function') {
                showTab(activeTab);
            }
        };
    }

    // Function to update the question score in the data structure
    function updateQuestionScore(department, area, text, score, comments) {
        const project = window.app.getCurrentProject();
        if (!project) return;
        
        // Check if the question is in management system audit
        if (department === 'Management') {
            if (project.managementSystemAudit && project.managementSystemAudit[area]) {
                const items = project.managementSystemAudit[area];
                for (let i = 0; i < items.length; i++) {
                    if (items[i].name === text) {
                        items[i].score = score;
                        items[i].comment = comments;
                        break;
                    }
                }
            }
        } else {
            // The question is in site performance audit
            if (project.sites && project.sites[department]) {
                const site = project.sites[department];
                if (site[area]) {
                    const items = site[area];
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].name === text) {
                            items[i].score = score;
                            items[i].comment = comments;
                            break;
                        }
                    }
                }
            }
        }
        
        // Save the data
        if (typeof saveData === 'function') {
            saveData();
        }
        
        // Update the executive dashboard metrics
        if (typeof updateExecutiveDashboardMetrics === 'function') {
            updateExecutiveDashboardMetrics();
        }
        
        // Show success message
        showNotification('Question evaluated successfully!', 'success');
    }

    // Function to handle Mark N/A button
    function handleMarkNA(department, area, text) {
        updateQuestionScore(department, area, text, 0, '');
    }

    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Placeholder functions for other action buttons
    function handleCreateActionPlan(department, area, text) {
        showNotification('Action plan creation for: ' + text, 'info');
    }

    function handleAssignResponsibility(department, area, text) {
        showNotification('Assign responsibility for: ' + text, 'info');
    }

    function handleScheduleAction(department, area, text) {
        showNotification('Schedule action for: ' + text, 'info');
    }

    function handleAddComments(department, area, text) {
        showNotification('Add comments for: ' + text, 'info');
    }

    function handleCreateImprovement(department, area, text) {
        showNotification('Create improvement for: ' + text, 'info');
    }

    function handleTrackProgress(department, area, text) {
        showNotification('Track progress for: ' + text, 'info');
    }

    function handleShareBestPractice(department, area, text) {
        showNotification('Share best practice: ' + text, 'info');
    }

    function handleDocument(department, area, text) {
        showNotification('Document: ' + text, 'info');
    }

    // Expose functions to global scope
    window.handleEvaluate = handleEvaluate;
    window.updateQuestionScore = updateQuestionScore;
    window.showNotification = showNotification;
})();