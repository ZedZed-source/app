// currentworkout.js - CLEAN VERSION (NO ALERTS)
console.log("Current Workout page loaded");

let workoutPlans = [];

// Initialize the page
function initializeCurrentWorkout() {
    console.log("Initializing Current Workout page...");
    
    // Setup back button
    const backBtn = document.getElementById('currentworkout-back');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            showFitnessPage('workout');
        });
    }
    
    // Load and display data
    loadWorkoutPlans();
    updateCurrentWorkoutDisplay();
    
    console.log("Current Workout page initialized");
}

// Load all workout plans
function loadWorkoutPlans() {
    try {
        if (window.currentWorkoutManager) {
            workoutPlans = window.currentWorkoutManager.getAllWorkoutPlans();
            console.log("Loaded workout plans:", workoutPlans.length);
            displayWorkoutPlans(workoutPlans);
        } else {
            console.error("Current Workout Manager not available");
            displayWorkoutPlans([]);
            showNotification("Error loading workout plans", "error", "Load Error");
        }
    } catch (error) {
        console.error('Error loading workout plans:', error);
        displayWorkoutPlans([]);
        showNotification("Error loading workout plans", "error", "Load Error");
    }
}

// Display workout plans
function displayWorkoutPlans(plans) {
    const container = document.getElementById('workout-plans-container');
    if (!container) return;
    
    if (plans.length === 0) {
        container.innerHTML = '<p class="no-workouts">No workout plans found. Create one in Workout Creator first.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    plans.forEach(plan => {
        const workoutCard = document.createElement('div');
        workoutCard.className = 'workout-plan-card';
        
        const isCurrent = window.currentWorkoutManager && 
                         window.currentWorkoutManager.currentWorkout && 
                         window.currentWorkoutManager.currentWorkout.id === plan.id;
        
        workoutCard.innerHTML = `
            <div class="workout-plan-info">
                <h3>${plan.name} ${isCurrent ? '<span class="current-badge">(Current)</span>' : ''}</h3>
                <p>${window.currentWorkoutManager.getWorkoutDayCount(plan)} workout days</p>
                <p class="workout-days">${window.currentWorkoutManager.getWorkoutDaysSummary(plan)}</p>
                <small>Created: ${new Date(plan.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="workout-actions">
                ${!isCurrent ? `<button class="action-btn select-workout-btn" data-workout-id="${plan.id}">
                    Select as Current
                </button>` : ''}
                <button class="action-btn btn-secondary delete-workout-btn" data-workout-id="${plan.id}">
                    Delete
                </button>
            </div>
        `;
        
        container.appendChild(workoutCard);
    });
    
    // Add event listeners
    document.querySelectorAll('.select-workout-btn').forEach(button => {
        button.addEventListener('click', function() {
            const workoutId = this.dataset.workoutId;
            const workoutPlan = workoutPlans.find(p => p.id === workoutId);
            if (workoutPlan) {
                setCurrentWorkout(workoutPlan);
            }
        });
    });
    
    document.querySelectorAll('.delete-workout-btn').forEach(button => {
        button.addEventListener('click', function() {
            const workoutId = this.dataset.workoutId;
            const workoutPlan = workoutPlans.find(p => p.id === workoutId);
            if (workoutPlan) {
                deleteWorkoutPlan(workoutPlan);
            }
        });
    });
}

// Set current workout
async function setCurrentWorkout(workoutPlan) {
    if (window.currentWorkoutManager) {
        const success = await window.currentWorkoutManager.setCurrentWorkout(workoutPlan);
        if (success) {
            updateCurrentWorkoutDisplay();
            loadWorkoutPlans(); // Refresh the list
            showNotification(`"${workoutPlan.name}" is now your current workout!`, "success", "Workout Activated");
        } else {
            showNotification("Error setting current workout", "error", "Error");
        }
    }
}

// Delete workout plan
async function deleteWorkoutPlan(workoutPlan) {
    const confirmed = await window.dialogManager.confirm({
        title: "Delete Workout Plan",
        message: `Are you sure you want to delete "${workoutPlan.name}"?`,
        details: "This action cannot be undone.",
        cancelText: "Cancel",
        confirmText: "Delete",
        danger: true
    });
    
    if (confirmed) {
        if (window.currentWorkoutManager) {
            const success = window.currentWorkoutManager.deleteWorkoutPlan(workoutPlan.id);
            if (success) {
                // Refresh displays
                loadWorkoutPlans();
                updateCurrentWorkoutDisplay();
                showNotification(`"${workoutPlan.name}" deleted successfully`, "success", "Workout Deleted");
            } else {
                showNotification("Error deleting workout plan", "error", "Delete Failed");
            }
        }
    }
}

// Update current workout display
function updateCurrentWorkoutDisplay() {
    const display = document.getElementById('current-workout-display');
    if (!display) return;
    
    if (window.currentWorkoutManager && window.currentWorkoutManager.currentWorkout) {
        const currentWorkout = window.currentWorkoutManager.currentWorkout;
        display.innerHTML = `
            <div class="current-workout-card">
                <div class="current-workout-info">
                    <h3>${currentWorkout.name}</h3>
                    <p>${window.currentWorkoutManager.getWorkoutDayCount(currentWorkout)} workout days</p>
                    <p class="workout-days">${window.currentWorkoutManager.getWorkoutDaysSummary(currentWorkout)}</p>
                    <small>Last updated: ${new Date(currentWorkout.updatedAt).toLocaleDateString()}</small>
                </div>
                <button class="action-btn btn-secondary" id="clear-workout-btn">
                    Clear
                </button>
            </div>
        `;
        
        const clearBtn = document.getElementById('clear-workout-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearCurrentWorkout);
        }
    } else {
        display.innerHTML = '<p class="no-workout">No workout plan selected</p>';
    }
}

// Clear current workout
async function clearCurrentWorkout() {
    const confirmed = await window.dialogManager.confirm({
        title: "Clear Current Workout",
        message: "Are you sure you want to clear your current workout plan?",
        cancelText: "Cancel",
        confirmText: "Clear"
    });
    
    if (confirmed) {
        if (window.currentWorkoutManager) {
            window.currentWorkoutManager.clearCurrentWorkout();
            updateCurrentWorkoutDisplay();
            loadWorkoutPlans(); // Refresh the list
            showNotification('Current workout cleared', "info", "Workout Cleared");
        }
    }
}

// Make initialize function available globally
window.initializeCurrentWorkout = initializeCurrentWorkout;

// Auto-initialize if page is visible
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = document.getElementById('currentworkout-page');
    if (currentPage && window.getComputedStyle(currentPage).display !== 'none') {
        initializeCurrentWorkout();
    }
});