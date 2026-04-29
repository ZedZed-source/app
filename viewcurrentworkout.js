// viewcurrentworkout.js - Display current workout details
console.log("View Current Workout JS loaded");

// Initialize the view current workout page
function initializeViewCurrentWorkout() {
    console.log("Initializing View Current Workout page...");
    
    // Setup back button
    const backBtn = document.getElementById('viewcurrentworkout-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showFitnessPage('workout');
        });
    }
    
    // Load and display current workout
    loadAndDisplayCurrentWorkout();
}

// Load current workout and display details
async function loadAndDisplayCurrentWorkout() {
    const container = document.getElementById('current-workout-full-details');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div style="text-align: center; padding: 50px;">Loading workout details...</div>';
    
    // Wait for currentWorkoutManager if needed
    if (!window.currentWorkoutManager) {
        setTimeout(loadAndDisplayCurrentWorkout, 100);
        return;
    }
    
    const currentWorkout = window.currentWorkoutManager.getCurrentWorkout();
    
    if (!currentWorkout) {
        container.innerHTML = `
            <div class="no-workout-message">
                <h3>⚠️ No Active Workout</h3>
                <p>You haven't selected a current workout plan yet.</p>
                <p>Go to Workout Builder → Workout Creator to create and activate a workout plan.</p>
                <button class="action-btn" onclick="showFitnessPage('workoutcreator')" style="margin-top: 15px;">
                    Go to Workout Creator
                </button>
            </div>
        `;
        return;
    }
    
    // Load saved days to get exercise details
    const savedDays = JSON.parse(localStorage.getItem('workoutDays') || '[]');
    
    // Build the display
    let html = `
        <div class="workout-summary-card">
            <h2>${escapeHtml(currentWorkout.name)}</h2>
            <p><strong>Created:</strong> ${new Date(currentWorkout.createdAt).toLocaleDateString()}</p>
            <p><strong>Last Updated:</strong> ${new Date(currentWorkout.updatedAt).toLocaleDateString()}</p>
            <p><strong>Schedule:</strong> 2-week rotation</p>
        </div>
    `;
    
    // Split into weeks
    const week1Days = currentWorkout.schedule.slice(0, 7);
    const week2Days = currentWorkout.schedule.slice(7, 14);
    
    // Week 1
    html += `<div class="week-section">
        <div class="week-title">Week 1</div>
    `;
    html += renderWeekDays(week1Days, savedDays, 1);
    html += `</div>`;
    
    // Week 2
    html += `<div class="week-section">
        <div class="week-title">Week 2</div>
    `;
    html += renderWeekDays(week2Days, savedDays, 8);
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Add collapse/expand functionality
    document.querySelectorAll('.day-header').forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const content = this.nextElementSibling;
            content.classList.toggle('collapsed');
        });
    });
}

// Render days for a week
function renderWeekDays(days, savedDays, startDayNumber) {
    let html = '';
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach((day, index) => {
        const dayNumber = startDayNumber + index;
        const dayName = dayNames[index];
        
        if (day.isRestDay) {
            html += `
                <div class="rest-day-card">
                    <div class="rest-icon">🛌</div>
                    <h3>Day ${dayNumber}: ${dayName} - Rest Day</h3>
                    <p>Take time to recover. Rest is essential for muscle growth!</p>
                </div>
            `;
        } else if (day.dayId) {
            // Find the saved day details
            const savedDay = savedDays.find(d => d.id === day.dayId);
            
            if (savedDay) {
                html += `
                    <div class="day-details-card">
                        <div class="day-header">
                            <h3>
                                <span class="day-icon-large">${savedDay.icon || '🏋️'}</span>
                                Day ${dayNumber}: ${dayName} - ${escapeHtml(savedDay.name)}
                            </h3>
                            <span class="collapse-icon">▼</span>
                        </div>
                        <div class="day-content">
                            <table class="exercise-table">
                                <thead>
                                    <tr>
                                        <th>Exercise</th>
                                        <th>Sets</th>
                                        <th>Reps</th>
                                        <th>Target Weight</th>
                                        <th>Rest</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                savedDay.exercises.forEach(exercise => {
                    html += `
                        <tr>
                            <td><strong>${escapeHtml(exercise.name)}</strong></td>
                            <td>${exercise.sets || '-'}</td>
                            <td>${exercise.reps || '-'}</td>
                            <td>${exercise.weight ? exercise.weight + ' lbs' : '-'}</td>
                            <td>${exercise.rest ? exercise.rest + 's' : '-'}</td>
                            <td>${exercise.notes ? escapeHtml(exercise.notes) : '-'}</td>
                        </tr>
                    `;
                });
                
                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="empty-day-card">
                        <h3>Day ${dayNumber}: ${dayName} - Missing Day Configuration</h3>
                        <p>The workout day "${day.dayName || 'Unknown'}" was not found in your saved days.</p>
                        <p>Please check your Day Maker or recreate this workout plan.</p>
                    </div>
                `;
            }
        } else {
            html += `
                <div class="empty-day-card">
                    <h3>Day ${dayNumber}: ${dayName} - Not Assigned</h3>
                    <p>No workout assigned to this day.</p>
                </div>
            `;
        }
    });
    
    return html;
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally
window.initializeViewCurrentWorkout = initializeViewCurrentWorkout;

// Auto-initialize if page is visible
document.addEventListener('DOMContentLoaded', function() {
    const viewCurrentPage = document.getElementById('viewcurrentworkout-page');
    if (viewCurrentPage && window.getComputedStyle(viewCurrentPage).display !== 'none') {
        initializeViewCurrentWorkout();
    }
});