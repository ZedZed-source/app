// daymaker.js - COMPLETELY CLEAN VERSION (NO ALERTS)
console.log("Day Maker JS loaded");

// Simple global storage
window.workoutDays = JSON.parse(localStorage.getItem('workoutDays') || '[]');
let currentDayId = null;

// Set up icon selection
function setupIconSelection() {
    const iconGrid = document.getElementById('icon-grid');
    const iconOptions = iconGrid.querySelectorAll('.icon-option');
    const dayIconInput = document.getElementById('day-icon');

    iconOptions.forEach(option => {
        option.addEventListener('click', () => {
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            dayIconInput.value = option.dataset.icon;
        });
    });

    if (iconOptions.length > 0) {
        iconOptions[iconOptions.length - 1].classList.add('selected');
        dayIconInput.value = iconOptions[iconOptions.length - 1].dataset.icon;
    }
}

// Add exercise
function addExercise(exerciseData = null) {
    const exercisesContainer = document.getElementById('exercises-container');
    const exerciseCount = exercisesContainer.children.length + 1;
    
    const exerciseHTML = `
        <div class="exercise">
            <div class="exercise-header">
                <h4>Exercise #${exerciseCount}</h4>
                <button type="button" class="remove-exercise">Remove</button>
            </div>
            <div class="exercise-fields">
                <div class="form-group">
                    <label>Exercise Name</label>
                    <input type="text" placeholder="e.g., Bicep Curls" 
                           value="${exerciseData ? exerciseData.name : ''}">
                </div>
                <div class="form-group">
                    <label>Sets</label>
                    <input type="number" min="1" 
                           value="${exerciseData ? exerciseData.sets : '3'}">
                </div>
                <div class="form-group">
                    <label>Reps</label>
                    <input type="number" min="1" 
                           value="${exerciseData ? exerciseData.reps : '10'}">
                </div>
                <div class="form-group">
                    <label>Weight (lbs)</label>
                    <input type="number" min="0" placeholder="Enter weight" 
                           value="${exerciseData ? exerciseData.weight : ''}">
                </div>
                <div class="form-group">
                    <label>Rest Time (seconds)</label>
                    <input type="number" min="0" 
                           value="${exerciseData ? exerciseData.rest : '60'}">
                </div>
                <div class="form-group">
                    <label>Notes (optional)</label>
                    <input type="text" placeholder="Any special instructions" 
                           value="${exerciseData ? exerciseData.notes : ''}">
                </div>
            </div>
        </div>
    `;
    
    exercisesContainer.insertAdjacentHTML('beforeend', exerciseHTML);
    
    const newExercise = exercisesContainer.lastElementChild;
    const removeBtn = newExercise.querySelector('.remove-exercise');
    removeBtn.addEventListener('click', function() {
        this.closest('.exercise').remove();
        renumberExercises();
    });
}

// Renumber exercises
function renumberExercises() {
    const exercises = document.querySelectorAll('.exercise');
    exercises.forEach((exercise, index) => {
        exercise.querySelector('h4').textContent = `Exercise #${index + 1}`;
    });
}

// Clear form
function clearForm() {
    document.getElementById('day-name').value = '';
    document.getElementById('exercises-container').innerHTML = '';
    currentDayId = null;
    
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(opt => opt.classList.remove('selected'));
    if (iconOptions.length > 0) {
        iconOptions[iconOptions.length - 1].classList.add('selected');
    }
    document.getElementById('day-icon').value = '🏋️';
    
    addExercise();
}

// Save day
async function saveDay() {
    const dayName = document.getElementById('day-name').value.trim();
    const dayIcon = document.getElementById('day-icon').value;
    
    if (!dayName) {
        showNotification("Please enter a name for your day", "error", "Missing Information");
        return;
    }
    
    // Collect exercise data
    const exercises = [];
    const exerciseElements = document.querySelectorAll('.exercise');
    
    exerciseElements.forEach(exercise => {
        const inputs = exercise.querySelectorAll('input');
        exercises.push({
            name: inputs[0].value,
            sets: inputs[1].value,
            reps: inputs[2].value,
            weight: inputs[3].value,
            rest: inputs[4].value,
            notes: inputs[5].value
        });
    });
    
    if (exercises.length === 0) {
        showNotification("Please add at least one exercise", "error", "Missing Exercises");
        return;
    }
    
    // Check if day with same name exists (for editing)
    let existingDayIndex = -1;
    if (currentDayId) {
        existingDayIndex = window.workoutDays.findIndex(day => day.id === currentDayId);
    }
    
    // Create day object
    const dayId = currentDayId || 'day-' + Date.now();
    const workoutDay = {
        id: dayId,
        name: dayName,
        icon: dayIcon,
        exercises: exercises,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Update or add to array
    if (currentDayId && existingDayIndex !== -1) {
        window.workoutDays[existingDayIndex] = workoutDay;
    } else {
        window.workoutDays.push(workoutDay);
    }
    
    // SAVE TO LOCALSTORAGE
    localStorage.setItem('workoutDays', JSON.stringify(window.workoutDays));
    
    showNotification(`"${dayName}" saved successfully with ${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'}!`, "success", "Day Saved");
    clearForm();
    renderSavedDays();
}

// Render saved days
function renderSavedDays() {
    const savedDaysList = document.getElementById('saved-days-list');
    savedDaysList.innerHTML = '';
    
    if (window.workoutDays.length === 0) {
        savedDaysList.innerHTML = '<p>No saved days yet. Create your first day above!</p>';
        return;
    }
    
    window.workoutDays.forEach(day => {
        const exerciseSummary = day.exercises.map(ex => 
            `<div class="exercise-item">${ex.name}: ${ex.sets} sets × ${ex.reps} reps</div>`
        ).join('');
        
        const dayCardHTML = `
            <div class="day-card">
                <div class="day-card-header">
                    <span class="day-icon-preview">${day.icon || '🏋️'}</span>
                    <h3>${day.name}</h3>
                </div>
                <div class="exercise-list">${exerciseSummary}</div>
                <div class="day-actions">
                    <button class="action-btn edit-btn">Edit</button>
                    <button class="action-btn delete-btn">Delete</button>
                </div>
            </div>
        `;
        
        savedDaysList.insertAdjacentHTML('beforeend', dayCardHTML);
        
        const dayCard = savedDaysList.lastElementChild;
        dayCard.querySelector('.edit-btn').addEventListener('click', () => loadDay(day.id));
        dayCard.querySelector('.delete-btn').addEventListener('click', () => deleteDay(day.id));
    });
}

// Load day for editing
function loadDay(dayId) {
    const day = window.workoutDays.find(d => d.id === dayId);
    if (!day) {
        showNotification("Day not found!", "error", "Error");
        return;
    }
    
    currentDayId = dayId;
    document.getElementById('day-name').value = day.name;
    
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.icon === day.icon) {
            opt.classList.add('selected');
        }
    });
    document.getElementById('day-icon').value = day.icon || '🏋️';
    
    document.getElementById('exercises-container').innerHTML = '';
    
    day.exercises.forEach(exercise => {
        addExercise(exercise);
    });
    
    document.querySelector('.day-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete day
async function deleteDay(dayId) {
    // Find the day to get its name
    const dayToDelete = window.workoutDays.find(day => day.id === dayId);
    if (!dayToDelete) return;
    
    // Use dialog manager for confirmation
    const confirmed = await window.dialogManager.confirm({
        title: "Delete Day",
        message: `Are you sure you want to delete "${dayToDelete.name}"?`,
        details: "This action cannot be undone.",
        cancelText: "Cancel",
        confirmText: "Delete",
        danger: true
    });
    
    if (confirmed) {
        window.workoutDays = window.workoutDays.filter(day => day.id !== dayId);
        
        // SAVE TO LOCALSTORAGE
        localStorage.setItem('workoutDays', JSON.stringify(window.workoutDays));
        
        if (currentDayId === dayId) {
            clearForm();
        }
        
        renderSavedDays();
        showNotification(`"${dayToDelete.name}" deleted successfully!`, "success", "Day Deleted");
    }
}

// Clear form with confirmation
async function clearFormWithConfirmation() {
    const hasContent = document.getElementById('day-name').value.trim() || 
                      document.querySelectorAll('.exercise').length > 0;
    
    if (!hasContent) {
        clearForm();
        return;
    }
    
    const confirmed = await window.dialogManager.confirm({
        title: "Clear Form",
        message: "Are you sure you want to clear the form?",
        details: "Any unsaved changes will be lost.",
        cancelText: "Keep Editing",
        confirmText: "Clear Form"
    });
    
    if (confirmed) {
        clearForm();
        showNotification("Form cleared", "info", "Form Cleared");
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("Day Maker initializing...");
    console.log("Loaded days from localStorage:", window.workoutDays.length);
    
    if (!document.getElementById('daymaker-page')) {
        return;
    }
    
    setupIconSelection();
    addExercise();
    renderSavedDays();
    
    document.getElementById('daymaker-back').addEventListener('click', () => {
        showFitnessPage('workout');
    });
    
    document.getElementById('addExerciseBtn').addEventListener('click', () => {
        addExercise();
    });
    
    document.getElementById('saveDayBtn').addEventListener('click', () => {
        saveDay();
    });
    
    document.getElementById('clearFormBtn').addEventListener('click', () => {
        clearFormWithConfirmation();
    });
    
    console.log("Day Maker initialized");
});