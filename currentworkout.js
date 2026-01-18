// currentworkout.js - BYPASS BROKEN INITIALIZATION
console.log("Current Workout page loaded - BYPASS VERSION");

// OVERRIDE: Direct page initialization
window.initializeCurrentWorkout = function() {
    console.log("=== DIRECT INITIALIZE CURRENT WORKOUT ===");
    
    // Force show loading message
    const container = document.getElementById('workout-plans-container');
    if (container) {
        container.innerHTML = '<div style="padding: 20px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 5px; margin: 10px;"><h3 style="color: #495057;">Loading workout plans...</h3></div>';
    }
    
    // Setup back button
    const backBtn = document.getElementById('currentworkout-back');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            console.log("Back to workout builder");
            showFitnessPage('workout');
        });
    }
    
    // Load data after short delay to ensure DOM is ready
    setTimeout(() => {
        console.log("Loading workout plans data...");
        directLoadWorkoutPlans();
        directUpdateCurrentWorkoutDisplay();
    }, 50);
};

// Direct load function
function directLoadWorkoutPlans() {
    console.log("=== DIRECT LOAD WORKOUT PLANS ===");
    
    const container = document.getElementById('workout-plans-container');
    if (!container) {
        console.error("Container not found!");
        // Try to create it
        const parent = document.querySelector('.workout-plans-list');
        if (parent) {
            const newContainer = document.createElement('div');
            newContainer.id = 'workout-plans-container';
            parent.appendChild(newContainer);
            console.log("Created container");
            return directLoadWorkoutPlans();
        }
        return;
    }
    
    try {
        // Get data
        const saved = localStorage.getItem('workoutPlans');
        const plans = saved ? JSON.parse(saved) : [];
        
        console.log(`Found ${plans.length} workout plans`);
        
        if (plans.length === 0) {
            container.innerHTML = '<div class="no-workouts"><p>No workout plans found. Create one in Workout Creator first.</p></div>';
            return;
        }
        
        // Get current workout ID
        let currentWorkoutId = null;
        const current = localStorage.getItem('currentWorkout');
        if (current) {
            try {
                const currentWorkout = JSON.parse(current);
                currentWorkoutId = currentWorkout ? currentWorkout.id : null;
            } catch (e) {
                console.error("Error parsing current workout:", e);
            }
        }
        
        // Build HTML
        let html = '';
        plans.forEach((plan, index) => {
            const isCurrent = currentWorkoutId === plan.id;
            
            // Count workout days
            let dayCount = 0;
            if (plan.schedule && Array.isArray(plan.schedule)) {
                dayCount = plan.schedule.filter(day => day && !day.isRestDay).length;
            }
            
            html += `
                <div class="workout-plan-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div class="workout-plan-info">
                        <h3 style="margin: 0 0 8px 0; color: #333; font-size: 1.2em;">
                            ${plan.name} 
                            ${isCurrent ? '<span style="background: #4CAF50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 8px;">Current</span>' : ''}
                        </h3>
                        <p style="margin: 0 0 5px 0; color: #666;">${dayCount} workout days</p>
                        <small style="color: #999;">Created: ${plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Unknown'}</small>
                    </div>
                    <div class="workout-actions" style="margin-top: 12px; display: flex; gap: 8px;">
                        ${!isCurrent ? `
                            <button class="direct-select-btn" data-id="${plan.id}" 
                                    style="background: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                                Select as Current
                            </button>
                        ` : ''}
                        <button class="direct-delete-btn" data-id="${plan.id}" 
                                style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Add direct event listeners
        container.querySelectorAll('.direct-select-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.dataset.id;
                console.log("Select clicked:", planId);
                const plan = plans.find(p => p.id === planId);
                if (plan) {
                    directSelectWorkout(plan);
                }
            });
        });
        
        container.querySelectorAll('.direct-delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.dataset.id;
                console.log("Delete clicked:", planId);
                const plan = plans.find(p => p.id === planId);
                if (plan) {
                    directDeleteWorkout(plan);
                }
            });
        });
        
        console.log(`Displayed ${plans.length} workout plans`);
        
    } catch (error) {
        console.error("Error loading workout plans:", error);
        container.innerHTML = '<div style="border: 2px solid #e74c3c; padding: 15px; border-radius: 5px; background: #ffe6e6; color: #c0392b;"><p>Error loading workout plans: ' + error.message + '</p></div>';
    }
}

// Direct select function
async function directSelectWorkout(plan) {
    console.log("Selecting:", plan.name);
    
    try {
        // Save as current
        localStorage.setItem('currentWorkout', JSON.stringify(plan));
        
        // Update manager if exists
        if (window.currentWorkoutManager && window.currentWorkoutManager.setCurrentWorkout) {
            await window.currentWorkoutManager.setCurrentWorkout(plan);
        }
        
        // Refresh display
        directLoadWorkoutPlans();
        directUpdateCurrentWorkoutDisplay();
        
        // Show notification
        if (window.showNotification) {
            window.showNotification(`"${plan.name}" is now your current workout!`, "success", "Selected");
        } else {
            alert(`"${plan.name}" is now your current workout!`);
        }
        
    } catch (error) {
        console.error("Error selecting workout:", error);
        if (window.showNotification) {
            window.showNotification("Error selecting workout", "error", "Error");
        }
    }
}

// Direct delete function
async function directDeleteWorkout(plan) {
    console.log("Deleting:", plan.name);
    
    // Confirm
    if (window.dialogManager && window.dialogManager.confirm) {
        const confirmed = await window.dialogManager.confirm({
            title: "Delete Workout Plan",
            message: `Are you sure you want to delete "${plan.name}"?`,
            details: "This action cannot be undone.",
            cancelText: "Cancel",
            confirmText: "Delete",
            danger: true
        });
        if (!confirmed) return;
    } else if (!confirm(`Delete "${plan.name}"?`)) {
        return;
    }
    
    try {
        // Get all plans
        const saved = localStorage.getItem('workoutPlans');
        let allPlans = saved ? JSON.parse(saved) : [];
        
        // Remove plan
        allPlans = allPlans.filter(p => p.id !== plan.id);
        
        // Save back
        localStorage.setItem('workoutPlans', JSON.stringify(allPlans));
        
        // Check if it was current
        const current = localStorage.getItem('currentWorkout');
        if (current) {
            try {
                const currentWorkout = JSON.parse(current);
                if (currentWorkout && currentWorkout.id === plan.id) {
                    localStorage.removeItem('currentWorkout');
                    if (window.currentWorkoutManager && window.currentWorkoutManager.clearCurrentWorkout) {
                        window.currentWorkoutManager.clearCurrentWorkout();
                    }
                }
            } catch (e) {
                console.error("Error checking current workout:", e);
            }
        }
        
        // Refresh
        directLoadWorkoutPlans();
        directUpdateCurrentWorkoutDisplay();
        
        // Notification
        if (window.showNotification) {
            window.showNotification(`"${plan.name}" deleted`, "success", "Deleted");
        }
        
    } catch (error) {
        console.error("Error deleting workout:", error);
        if (window.showNotification) {
            window.showNotification("Error deleting workout", "error", "Error");
        }
    }
}

// Direct update display
function directUpdateCurrentWorkoutDisplay() {
    console.log("=== DIRECT UPDATE DISPLAY ===");
    
    const display = document.getElementById('current-workout-display');
    if (!display) {
        console.error("Display element not found!");
        return;
    }
    
    try {
        const saved = localStorage.getItem('currentWorkout');
        if (saved) {
            const currentWorkout = JSON.parse(saved);
            console.log("Current workout:", currentWorkout.name);
            
            // Count days
            let dayCount = 0;
            if (currentWorkout.schedule && Array.isArray(currentWorkout.schedule)) {
                dayCount = currentWorkout.schedule.filter(day => day && !day.isRestDay).length;
            }
            
            display.innerHTML = `
                <div class="current-workout-card" style="border: 2px solid #2ecc71; border-radius: 8px; padding: 15px; background: #d4edda; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0 0 8px 0; color: #155724;">${currentWorkout.name}</h3>
                        <p style="margin: 0 0 5px 0; color: #0c5460;">${dayCount} workout days</p>
                        <small style="color: #138496;">Updated: ${currentWorkout.updatedAt ? new Date(currentWorkout.updatedAt).toLocaleDateString() : 'Recently'}</small>
                    </div>
                    <button id="direct-clear-btn" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
                        Clear
                    </button>
                </div>
            `;
            
            // Add clear button listener
            document.getElementById('direct-clear-btn').addEventListener('click', directClearWorkout);
            
        } else {
            console.log("No current workout");
            display.innerHTML = '<div style="border: 1px dashed #ccc; border-radius: 5px; padding: 15px; background: #f8f9fa; color: #6c757d; font-style: italic;">No workout plan selected</div>';
        }
    } catch (error) {
        console.error("Error updating display:", error);
        display.innerHTML = '<div style="border: 2px solid #e74c3c; padding: 15px; border-radius: 5px; background: #ffe6e6; color: #c0392b;">Error loading current workout</div>';
    }
}

// Direct clear function
async function directClearWorkout() {
    console.log("Clearing current workout");
    
    // Confirm
    if (window.dialogManager && window.dialogManager.confirm) {
        const confirmed = await window.dialogManager.confirm({
            title: "Clear Current Workout",
            message: "Are you sure you want to clear your current workout plan?",
            cancelText: "Cancel",
            confirmText: "Clear"
        });
        if (!confirmed) return;
    } else if (!confirm("Clear current workout?")) {
        return;
    }
    
    try {
        localStorage.removeItem('currentWorkout');
        
        if (window.currentWorkoutManager && window.currentWorkoutManager.clearCurrentWorkout) {
            window.currentWorkoutManager.clearCurrentWorkout();
        }
        
        directUpdateCurrentWorkoutDisplay();
        directLoadWorkoutPlans();
        
        if (window.showNotification) {
            window.showNotification('Current workout cleared', "info", "Cleared");
        }
        
    } catch (error) {
        console.error("Error clearing workout:", error);
        if (window.showNotification) {
            window.showNotification("Error clearing workout", "error", "Error");
        }
    }
}

// Force initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded for Current Workout");
    
    // Check if we're on the current workout page
    const currentPage = document.getElementById('currentworkout-page');
    if (currentPage) {
        console.log("Current Workout page found in DOM");
        
        // Set up a direct initialization when page becomes visible
        const checkPage = setInterval(() => {
            if (window.getComputedStyle(currentPage).display !== 'none') {
                console.log("Current Workout page is visible - INITIALIZING NOW");
                window.initializeCurrentWorkout();
                clearInterval(checkPage);
            }
        }, 100);
        
        // Also check immediately
        if (window.getComputedStyle(currentPage).display !== 'none') {
            console.log("Current Workout page already visible - INITIALIZING");
            window.initializeCurrentWorkout();
        }
    }
});

// Manual refresh function
window.refreshCurrentWorkoutDirect = function() {
    console.log("Manual direct refresh");
    directLoadWorkoutPlans();
    directUpdateCurrentWorkoutDisplay();
};