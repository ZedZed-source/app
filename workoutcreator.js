// workoutcreator.js - CLEAN FIXED VERSION
console.log("Workout Creator JS loaded");

let currentWeek = 1;
let selectedDay = null;
let workoutPlan = null;
let savedDays = [];

// Initialize
async function initializeWorkoutCreator() {
    console.log("Initializing Workout Creator...");
    
    try {
        // Load saved days
        loadSavedDays();
        
        // Load or create workout plan
        loadWorkoutPlan();
        
        // Setup event listeners
        setupEventListeners();
        
        // Render with the loaded days
        renderCalendar();
        
        console.log("Workout Creator initialized!");
    } catch (error) {
        console.error("Error initializing Workout Creator:", error);
        showNotification("Error initializing workout creator", "error", "Initialization Error");
    }
}

// Load saved days from localStorage
function loadSavedDays() {
    const saved = localStorage.getItem('workoutDays');
    if (saved) {
        try {
            savedDays = JSON.parse(saved);
            console.log(`Loaded ${savedDays.length} saved days`);
        } catch (error) {
            console.error("Error parsing saved days:", error);
            savedDays = [];
        }
    } else {
        savedDays = [];
        console.log("No saved days found");
    }
}

// Load workout plan (for editing) or create new one
function loadWorkoutPlan() {
    // Check if we're editing an existing workout
    const editWorkoutId = localStorage.getItem('editingWorkoutId');
    
    if (editWorkoutId) {
        // Load the workout being edited
        const allPlans = getAllWorkoutPlans();
        workoutPlan = allPlans.find(plan => plan.id === editWorkoutId);
        
        if (workoutPlan) {
            console.log("Editing existing workout plan:", workoutPlan.name);
        } else {
            // Create new plan
            createNewWorkoutPlan();
        }
        
        // Clear the editing flag
        localStorage.removeItem('editingWorkoutId');
    } else {
        // Create new plan
        createNewWorkoutPlan();
    }
    
    // Update the name input
    const nameInput = document.getElementById('workout-name');
    if (nameInput && workoutPlan) {
        nameInput.value = workoutPlan.name;
    }
}

// Create a new workout plan
function createNewWorkoutPlan() {
    workoutPlan = {
        id: 'workout-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: 'New Workout Plan',
        schedule: Array(14).fill(null).map((_, index) => ({
            id: index + 1,
            dayNumber: index + 1,
            assignedDayId: null,
            isRestDay: true,
            notes: ''
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    console.log("Created new workout plan");
}

// Get ALL workout plans from localStorage
function getAllWorkoutPlans() {
    try {
        const saved = localStorage.getItem('workoutPlans');
        const plans = saved ? JSON.parse(saved) : [];
        console.log(`Found ${plans.length} saved workout plans`);
        return plans;
    } catch (error) {
        console.error('Error getting workout plans:', error);
        return [];
    }
}

// Save workout plan to localStorage (does NOT set as active)
// Save workout plan to localStorage (does NOT set as active)
async function saveWorkoutPlan() {
    // Update name from input
    const nameInput = document.getElementById('workout-name');
    if (nameInput && workoutPlan) {
        const newName = nameInput.value.trim();
        if (newName) {
            workoutPlan.name = newName;
        }
    }
    
    if (!workoutPlan) {
        showNotification("No workout plan to save", "error", "Save Error");
        return;
    }
    
    workoutPlan.updatedAt = new Date().toISOString();
    
    // Get all existing plans
    const allPlans = getAllWorkoutPlans();
    
    // Check if this plan already exists
    const existingIndex = allPlans.findIndex(plan => plan.id === workoutPlan.id);
    
    if (existingIndex !== -1) {
        // Update existing plan
        allPlans[existingIndex] = workoutPlan;
        console.log(`Updated existing workout plan: ${workoutPlan.name}`);
    } else {
        // Add new plan
        allPlans.push(workoutPlan);
        console.log(`Added new workout plan: ${workoutPlan.name}`);
    }
    
    // Save all plans back to localStorage
    localStorage.setItem('workoutPlans', JSON.stringify(allPlans));
    
    // Ask user if they want to set this as active using dialog manager
    const confirmed = await window.dialogManager.confirm({
        title: "Save Workout Plan",
        message: `"${workoutPlan.name}" saved successfully!`,
        details: "Would you like to set this as your active workout plan?",
        cancelText: "No, Just Save",
        confirmText: "Yes, Set as Active"
    });
    
    if (confirmed) {
        console.log("User confirmed - setting as active workout");
        console.log("Workout plan to set as active:", workoutPlan);
        
        // Create a simplified version for current workout
        const simplifiedSchedule = workoutPlan.schedule.map(day => ({
            dayId: day.assignedDayId,
            dayName: day.assignedDayId ? 
                savedDays.find(d => d.id === day.assignedDayId)?.name : 'Rest Day',
            isRestDay: day.isRestDay
        }));
        
        const currentWorkoutData = {
            id: workoutPlan.id,
            name: workoutPlan.name,
            schedule: simplifiedSchedule,
            createdAt: workoutPlan.createdAt,
            updatedAt: workoutPlan.updatedAt
        };
        
        console.log("Current workout data to save:", currentWorkoutData);
        
        // Save to localStorage
        localStorage.setItem('currentWorkout', JSON.stringify(currentWorkoutData));
        console.log("Saved to localStorage under 'currentWorkout'");
        
        // Check if saved correctly
        const saved = localStorage.getItem('currentWorkout');
        console.log("Retrieved from localStorage:", saved);
        
        // Update current workout manager if available
        if (window.currentWorkoutManager) {
            console.log("Current workout manager found, calling setCurrentWorkout...");
            // Use the manager's method to ensure proper event dispatching
            const success = await window.currentWorkoutManager.setCurrentWorkout(currentWorkoutData);
            console.log("setCurrentWorkout result:", success ? "Success" : "Failed");
        } else {
            console.log("Current workout manager NOT found!");
            // Fallback: dispatch event manually
            const event = new CustomEvent('currentWorkoutChanged');
            window.dispatchEvent(event);
            console.log("Dispatched currentWorkoutChanged event");
        }
        
        showNotification(`"${workoutPlan.name}" is now your active workout plan!`, "success", "Workout Activated");
    } else {
        console.log("User chose not to set as active, just saving");
        showNotification(`"${workoutPlan.name}" saved successfully!`, "success", "Workout Saved");
    }
    
    // Go back to workout builder
    setTimeout(() => {
        showFitnessPage('workout');
    }, 1000);
}

// Setup event listeners
function setupEventListeners() {
    const backBtn = document.getElementById('workoutcreator-back');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            showFitnessPage('workout');
        });
    }
    
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', function() {
            if (currentWeek > 1) {
                currentWeek--;
                showWeek(currentWeek);
            }
        });
    }
    
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', function() {
            if (currentWeek < 2) {
                currentWeek++;
                showWeek(currentWeek);
            }
        });
    }
    
    const saveBtn = document.getElementById('save-workout-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            await saveWorkoutPlan();
        });
    }
    
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    const modalOverlay = document.getElementById('day-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
}

// Show week
function showWeek(weekNumber) {
    currentWeek = weekNumber;
    
    const weekTitle = document.getElementById('week-title');
    if (weekTitle) {
        weekTitle.textContent = `Week ${weekNumber}`;
    }
    
    const prevBtn = document.getElementById('prev-week-btn');
    const nextBtn = document.getElementById('next-week-btn');
    
    if (prevBtn) {
        prevBtn.disabled = weekNumber === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = weekNumber === 2;
    }
    
    document.querySelectorAll('.week-calendar').forEach(week => {
        week.style.display = 'none';
    });
    
    const currentWeekElement = document.getElementById(`week-${weekNumber}`);
    if (currentWeekElement) {
        currentWeekElement.style.display = 'block';
    }
}

// Render calendar
function renderCalendar() {
    console.log("Rendering calendar with saved days:", savedDays.length);
    
    for (let week = 1; week <= 2; week++) {
        const weekElement = document.getElementById(`week-${week}`);
        if (!weekElement) continue;
        
        const calendarGrid = weekElement.querySelector('.calendar-grid');
        if (!calendarGrid) continue;
        
        const headers = calendarGrid.querySelectorAll('.calendar-header');
        calendarGrid.innerHTML = '';
        headers.forEach(header => calendarGrid.appendChild(header));
        
        const startDay = (week - 1) * 7;
        
        for (let i = 0; i < 7; i++) {
            const dayNumber = startDay + i + 1;
            const daySchedule = workoutPlan && workoutPlan.schedule ? workoutPlan.schedule[dayNumber - 1] : null;
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.dataset.day = dayNumber;
            
            let dayContent = '';
            
            if (daySchedule && daySchedule.assignedDayId) {
                const assignedDay = savedDays.find(d => d.id === daySchedule.assignedDayId);
                if (assignedDay) {
                    dayContent = `
                        <div class="day-icon">${assignedDay.icon || '🏋️'}</div>
                        <div class="day-name">${assignedDay.name}</div>
                    `;
                    dayElement.classList.add('has-workout');
                }
            } else if (daySchedule && daySchedule.isRestDay) {
                dayContent = `
                    <div class="day-icon">🛌</div>
                    <div class="day-name">Rest Day</div>
                `;
                dayElement.classList.add('rest-day');
            } else {
                dayContent = `
                    <div class="day-icon">❓</div>
                    <div class="day-name">Click to assign</div>
                `;
            }
            
            dayElement.innerHTML = `
                <div class="day-number">${dayNumber}</div>
                ${dayContent}
            `;
            
            dayElement.addEventListener('click', function() {
                openDayModal(dayNumber);
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    showWeek(currentWeek);
}

// Open day modal
function openDayModal(dayNumber) {
    selectedDay = dayNumber;
    
    const modal = document.getElementById('day-modal');
    const optionsContainer = document.getElementById('day-options');
    
    if (!modal || !optionsContainer) return;
    
    optionsContainer.innerHTML = '';
    
    // Rest Day option
    const restOption = document.createElement('div');
    restOption.className = 'day-option';
    restOption.innerHTML = `
        <div class="option-icon">🛌</div>
        <div class="option-info">
            <div class="option-name">Rest Day</div>
            <div class="option-desc">No workout - recovery day</div>
        </div>
    `;
    restOption.addEventListener('click', function() {
        assignDayToCalendar(null, true);
        closeModal();
    });
    optionsContainer.appendChild(restOption);
    
    // Empty option
    const emptyOption = document.createElement('div');
    emptyOption.className = 'day-option';
    emptyOption.innerHTML = `
        <div class="option-icon">❓</div>
        <div class="option-info">
            <div class="option-name">Empty</div>
            <div class="option-desc">Not assigned yet</div>
        </div>
    `;
    emptyOption.addEventListener('click', function() {
        assignDayToCalendar(null, false);
        closeModal();
    });
    optionsContainer.appendChild(emptyOption);
    
    // Saved days options
    if (savedDays.length > 0) {
        savedDays.forEach(day => {
            const dayOption = document.createElement('div');
            dayOption.className = 'day-option';
            dayOption.innerHTML = `
                <div class="option-icon">${day.icon || '🏋️'}</div>
                <div class="option-info">
                    <div class="option-name">${day.name}</div>
                    <div class="option-desc">${day.exercises ? day.exercises.length : 0} exercises</div>
                </div>
            `;
            dayOption.addEventListener('click', function() {
                assignDayToCalendar(day.id, false);
                closeModal();
            });
            optionsContainer.appendChild(dayOption);
        });
    } else {
        const noDaysOption = document.createElement('div');
        noDaysOption.className = 'day-option disabled';
        noDaysOption.innerHTML = `
            <div class="option-icon">⚠️</div>
            <div class="option-info">
                <div class="option-name">No saved days</div>
                <div class="option-desc">Create days in Day Maker first</div>
            </div>
        `;
        noDaysOption.addEventListener('click', function() {
            showNotification('Please create workout days in Day Maker first!', 'warning', 'No Saved Days');
        });
        optionsContainer.appendChild(noDaysOption);
    }
    
    modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('day-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    selectedDay = null;
}

// Assign day to calendar
function assignDayToCalendar(dayId, isRestDay) {
    if (!selectedDay || !workoutPlan) return;
    
    const dayIndex = selectedDay - 1;
    
    if (workoutPlan.schedule[dayIndex]) {
        workoutPlan.schedule[dayIndex].assignedDayId = dayId;
        workoutPlan.schedule[dayIndex].isRestDay = isRestDay;
        workoutPlan.schedule[dayIndex].updatedAt = new Date().toISOString();
    }
    
    renderCalendar();
}

// Make available globally
window.initializeWorkoutCreator = initializeWorkoutCreator;

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    const workoutPage = document.getElementById('workoutcreator-page');
    if (workoutPage && window.getComputedStyle(workoutPage).display !== 'none') {
        initializeWorkoutCreator();
    }
});