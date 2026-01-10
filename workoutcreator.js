// workoutcreator.js - SIMPLE WORKING VERSION
console.log("Workout Creator JS loaded");

let currentWeek = 1;
let selectedDay = null;
let workoutPlan = null;

// Initialize
function initializeWorkoutCreator() {
    console.log("Initializing Workout Creator...");
    
    // ALWAYS load fresh from localStorage
    const savedDays = JSON.parse(localStorage.getItem('workoutDays') || '[]');
    console.log("Workout Creator loaded days:", savedDays.length);
    
    // Load or create workout plan
    loadWorkoutPlan();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render with the loaded days
    renderCalendar(savedDays);
    
    console.log("Workout Creator initialized!");
}

// Load workout plan
function loadWorkoutPlan() {
    const saved = localStorage.getItem('currentWorkoutPlan');
    
    if (saved) {
        workoutPlan = JSON.parse(saved);
    } else {
        workoutPlan = {
            id: 'plan-' + Date.now(),
            name: 'My Workout Plan',
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
    }
    
    const nameInput = document.getElementById('workout-name');
    if (nameInput) {
        nameInput.value = workoutPlan.name;
    }
}

// Save workout plan
function saveWorkoutPlan() {
    const nameInput = document.getElementById('workout-name');
    if (nameInput) {
        workoutPlan.name = nameInput.value.trim() || 'My Workout Plan';
    }
    
    workoutPlan.updatedAt = new Date().toISOString();
    localStorage.setItem('currentWorkoutPlan', JSON.stringify(workoutPlan));
    
    // Also save as current workout
    localStorage.setItem('currentWorkout', JSON.stringify({
        id: workoutPlan.id,
        name: workoutPlan.name,
        schedule: workoutPlan.schedule.map(day => ({
            dayId: day.assignedDayId,
            dayName: 'Workout Day',
            isRestDay: day.isRestDay
        }))
    }));
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
        saveBtn.addEventListener('click', function() {
            saveWorkoutPlan();
            alert('Workout plan saved successfully!');
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
function renderCalendar(savedDays) {
    console.log("Rendering calendar with days:", savedDays);
    
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
            const daySchedule = workoutPlan.schedule[dayNumber - 1];
            
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
                openDayModal(dayNumber, savedDays);
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    showWeek(currentWeek);
}

// Open day modal
function openDayModal(dayNumber, savedDays) {
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
            alert('Please create workout days in Day Maker first!');
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
    if (!selectedDay) return;
    
    const dayIndex = selectedDay - 1;
    
    if (workoutPlan.schedule[dayIndex]) {
        workoutPlan.schedule[dayIndex].assignedDayId = dayId;
        workoutPlan.schedule[dayIndex].isRestDay = isRestDay;
        workoutPlan.schedule[dayIndex].updatedAt = new Date().toISOString();
    }
    
    // Reload days fresh and re-render
    const savedDays = JSON.parse(localStorage.getItem('workoutDays') || '[]');
    renderCalendar(savedDays);
    
    saveWorkoutPlan();
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