// progressive.js - FIXED VERSION (Uses same data source as other pages)
console.log('⚙️ Progressive Overload loaded');

let progressiveSelectedWorkout = null;
let progressiveSelectedDay = null;
let editingPlan = null;
let activePlans = [];
let currentPlanIndex = 0;

// Initialize Progressive Overload
function initializeProgressive() {
    console.log('Initializing Progressive Overload...');
    
    // Set up event listeners
    const backBtn = document.getElementById('progressive-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showFitnessPage('workout');
        });
    }
    
    // Setup other buttons
    setupProgressiveButtons();
    
    // Load data
    loadActivePlans();
    loadWorkoutPlans();
    
    console.log('Progressive Overload initialized');
}

function setupProgressiveButtons() {
    // Setup navigation buttons
    const buttons = [
        { id: 'backToStep1', action: () => showStep(1) },
        { id: 'backToStep2', action: () => showStep(2) },
        { id: 'saveProgressionBtn', action: saveProgressionPlan },
        { id: 'photosHeaderBtn', action: openPhotosModal },
        { id: 'prevPlan', action: showPreviousPlan },
        { id: 'nextPlan', action: showNextPlan },
        { id: 'closePhotosModal', action: closePhotosModal },
        { id: 'closeEditModal', action: closeEditModal }
    ];
    
    buttons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.action);
        }
    });
}

async function loadActivePlans() {
    try {
        const saved = localStorage.getItem('progressionPlans');
        activePlans = saved ? JSON.parse(saved) : [];
        displayActivePlans(activePlans);
    } catch (error) {
        console.error('Error loading active plans:', error);
        showNotification('Error loading progression plans', 'error');
    }
}

function displayActivePlans(plans) {
    const container = document.getElementById('activePlans');
    const navigation = document.getElementById('plansNavigation');
    
    activePlans = plans;
    
    if (!plans || plans.length === 0) {
        container.innerHTML = '<p class="no-data">No active progression plans. Create one below.</p>';
        if (navigation) navigation.style.display = 'none';
        return;
    }
    
    // Show navigation if we have multiple plans
    if (plans.length > 1 && navigation) {
        navigation.style.display = 'flex';
        document.getElementById('totalPlans').textContent = plans.length;
    } else if (navigation) {
        navigation.style.display = 'none';
    }
    
    // Reset to first plan
    currentPlanIndex = 0;
    showCurrentPlan();
}

function showCurrentPlan() {
    const container = document.getElementById('activePlans');
    const plan = activePlans[currentPlanIndex];
    
    if (!plan || !container) return;
    
    // Update navigation counter
    const currentIndexEl = document.getElementById('currentPlanIndex');
    if (currentIndexEl) {
        currentIndexEl.textContent = currentPlanIndex + 1;
    }
    
    const enabledExercises = Object.entries(plan.exercises).filter(([_, ex]) => ex.enabled);
    
    container.innerHTML = `
        <div class="progression-plan-card active">
            <div class="plan-header">
                <h4>${plan.workoutName} - ${plan.dayName}</h4>
                <p class="plan-meta"><strong>Start Date:</strong> ${new Date(plan.startDate).toLocaleDateString()}</p>
                <p class="plan-meta"><strong>Active Exercises:</strong> ${enabledExercises.length}</p>
            </div>
            
            <div class="exercise-progression-list">
                ${enabledExercises.map(([name, ex]) => `
                    <div class="exercise-progression-item">
                        <div class="exercise-name">${name}</div>
                        <div class="exercise-details">
                            ${ex.variable} increases by ${ex.increaseAmount} every ${ex.intervalWeeks} weeks
                            <br><strong>Current:</strong> ${ex.currentValue} ${getVariableUnit(ex.variable)}
                            ${ex.nextIncreaseDate ? `<br><strong>Next Increase:</strong> ${new Date(ex.nextIncreaseDate).toLocaleDateString()}` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="plan-actions">
                <button class="action-btn btn-secondary" onclick="editProgressivePlan('${plan.id}')">Edit Plan</button>
                <button class="action-btn btn-danger" onclick="deleteProgressivePlan('${plan.id}')">Delete Plan</button>
            </div>
        </div>
    `;
}

function showPreviousPlan() {
    if (activePlans.length <= 1) return;
    currentPlanIndex = currentPlanIndex > 0 ? currentPlanIndex - 1 : activePlans.length - 1;
    showCurrentPlan();
}

function showNextPlan() {
    if (activePlans.length <= 1) return;
    currentPlanIndex = currentPlanIndex < activePlans.length - 1 ? currentPlanIndex + 1 : 0;
    showCurrentPlan();
}

async function editProgressivePlan(planId) {
    try {
        const saved = localStorage.getItem('progressionPlans');
        const plans = saved ? JSON.parse(saved) : [];
        editingPlan = plans.find(p => p.id === planId);
        
        if (!editingPlan) {
            showNotification('Plan not found', 'error');
            return;
        }
        
        displayEditModal(editingPlan);
    } catch (error) {
        console.error('Error loading plan for editing:', error);
        showNotification('Error loading plan', 'error');
    }
}

function displayEditModal(plan) {
    const container = document.getElementById('editPlanContent');
    if (!container) return;
    
    container.innerHTML = '';
    const exercises = Object.entries(plan.exercises);
    
    exercises.forEach(([name, ex]) => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'exercise-config';
        
        exerciseCard.innerHTML = `
            <div class="exercise-header">
                <h4 class="exercise-title">${name}</h4>
                <label class="toggle-label">
                    <input type="checkbox" class="enable-progression" data-exercise="${name}" ${ex.enabled ? 'checked' : ''}>
                    Enable Progression
                </label>
            </div>
            
            <div class="progression-settings" style="display: ${ex.enabled ? 'block' : 'none'}">
                <p><strong>Current Value:</strong> ${ex.currentValue} ${getVariableUnit(ex.variable)}</p>
                
                <div class="form-group">
                    <label>Variable to Increase:</label>
                    <select class="progression-variable" data-exercise="${name}">
                        <option value="weight" ${ex.variable === 'weight' ? 'selected' : ''}>Weight</option>
                        <option value="reps" ${ex.variable === 'reps' ? 'selected' : ''}>Reps</option>
                        <option value="sets" ${ex.variable === 'sets' ? 'selected' : ''}>Sets</option>
                        <option value="rest" ${ex.variable === 'rest' ? 'selected' : ''}>Rest Time</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Increase Amount:</label>
                    <input type="number" min="0.5" step="0.5" value="${ex.increaseAmount}" 
                           class="increase-amount" data-exercise="${name}">
                    <span class="unit-display">${getVariableUnit(ex.variable)}</span>
                </div>
                
                <div class="form-group">
                    <label>Increase Interval (weeks):</label>
                    <input type="number" min="1" value="${ex.intervalWeeks}" 
                           class="interval-weeks" data-exercise="${name}">
                </div>
            </div>
        `;
        
        container.appendChild(exerciseCard);
        
        const checkbox = exerciseCard.querySelector('.enable-progression');
        const settings = exerciseCard.querySelector('.progression-settings');
        
        checkbox.addEventListener('change', function() {
            settings.style.display = this.checked ? 'block' : 'none';
        });
    });
    
    const saveButton = document.createElement('button');
    saveButton.className = 'action-btn';
    saveButton.textContent = 'Save Changes';
    saveButton.onclick = () => saveEditedProgressivePlan(plan.id);
    container.appendChild(saveButton);
    
    document.getElementById('editPlanModal').style.display = 'flex';
}

async function saveEditedProgressivePlan(planId) {
    try {
        const saved = localStorage.getItem('progressionPlans');
        const plans = saved ? JSON.parse(saved) : [];
        const planIndex = plans.findIndex(p => p.id === planId);
        
        if (planIndex === -1) {
            showNotification('Plan not found', 'error');
            return;
        }
        
        const updatedExercises = {};
        document.querySelectorAll('#editPlanContent .exercise-config').forEach(config => {
            const checkbox = config.querySelector('.enable-progression');
            const exerciseName = checkbox.dataset.exercise;
            
            if (checkbox.checked) {
                const variable = config.querySelector('.progression-variable').value;
                const increaseAmount = parseFloat(config.querySelector('.increase-amount').value);
                const intervalWeeks = parseInt(config.querySelector('.interval-weeks').value);
                const existingExercise = plans[planIndex].exercises[exerciseName];
                
                updatedExercises[exerciseName] = {
                    ...existingExercise,
                    variable: variable,
                    increaseAmount: increaseAmount,
                    intervalWeeks: intervalWeeks,
                    enabled: true
                };
            } else {
                updatedExercises[exerciseName] = {
                    ...plans[planIndex].exercises[exerciseName],
                    enabled: false
                };
            }
        });
        
        if (Object.keys(updatedExercises).filter(([_, ex]) => ex.enabled).length === 0) {
            showNotification('Please enable at least one exercise', 'error');
            return;
        }
        
        plans[planIndex].exercises = updatedExercises;
        plans[planIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('progressionPlans', JSON.stringify(plans));
        
        showNotification('Progression plan updated!', 'success');
        closeEditModal();
        loadActivePlans();
        
    } catch (error) {
        console.error('Error saving edited plan:', error);
        showNotification('Error updating plan', 'error');
    }
}

function closeEditModal() {
    const modal = document.getElementById('editPlanModal');
    if (modal) modal.style.display = 'none';
    editingPlan = null;
}

async function deleteProgressivePlan(planId) {
    if (!window.dialogManager || !await window.dialogManager.confirm({
        title: "Delete Progression Plan",
        message: "Are you sure you want to delete this progression plan?",
        details: "This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        danger: true
    })) return;
    
    try {
        const saved = localStorage.getItem('progressionPlans');
        const plans = saved ? JSON.parse(saved) : [];
        const filteredPlans = plans.filter(p => p.id !== planId);
        localStorage.setItem('progressionPlans', JSON.stringify(filteredPlans));
        
        showNotification('Progression plan deleted', 'success');
        loadActivePlans();
    } catch (error) {
        console.error('Error deleting plan:', error);
        showNotification('Error deleting plan', 'error');
    }
}

// ============================================
// FIXED: Uses same data source as other pages
// ============================================
// REPLACE the entire loadWorkoutPlans function with this:

async function loadWorkoutPlans() {
    try {
        console.log("Loading workout plans from localStorage...");
        
        // DIRECT localStorage access - NO manager dependency
        const saved = localStorage.getItem('workoutPlans');
        const workoutPlans = saved ? JSON.parse(saved) : [];
        
        console.log(`Found ${workoutPlans.length} workout plans`);
        displayWorkoutPlans(workoutPlans);
    } catch (error) {
        console.error('Error loading workout plans:', error);
        showNotification('Error loading workout plans', 'error');
    }
}

function displayWorkoutPlans(plans) {
    const container = document.getElementById('workoutList');
    if (!container) {
        console.error("Workout list container not found!");
        return;
    }
    
    if (!plans || plans.length === 0) {
        container.innerHTML = '<p class="no-data">No workout plans found. Create one in Workout Builder first.</p>';
        return;
    }
    
    container.innerHTML = '';
    plans.forEach(plan => {
        const card = document.createElement('div');
        card.className = 'workout-card';
        card.innerHTML = `
            <h4>${plan.name}</h4>
            <p>Created: ${new Date(plan.createdAt).toLocaleDateString()}</p>
        `;
        card.onclick = () => selectProgressiveWorkout(plan);
        container.appendChild(card);
    });
}

function selectProgressiveWorkout(plan) {
    progressiveSelectedWorkout = plan;
    console.log("Selected workout:", plan.name);
    loadDaysForProgressiveWorkout(plan);
    showStep(2);
}

async function loadDaysForProgressiveWorkout(workout) {
    try {
        console.log("Loading days for workout:", workout.name);
        
        // Get workout days from localStorage (same as other pages)
        const saved = localStorage.getItem('workoutDays');
        const workoutDays = saved ? JSON.parse(saved) : [];
        console.log(`Found ${workoutDays.length} workout days total`);
        
        // Get unique days from schedule
        const uniqueDays = {};
        if (workout.schedule && Array.isArray(workout.schedule)) {
            workout.schedule.forEach(day => {
                if (day && day.dayId) {
                    const dayData = workoutDays.find(d => d.id === day.dayId);
                    if (dayData) {
                        uniqueDays[day.dayId] = dayData;
                        console.log("Found day:", dayData.name);
                    }
                }
            });
        }
        
        console.log(`Found ${Object.keys(uniqueDays).length} unique days in schedule`);
        displayProgressiveDays(Object.values(uniqueDays));
    } catch (error) {
        console.error('Error loading days:', error);
        showNotification('Error loading workout days', 'error');
    }
}

function displayProgressiveDays(days) {
    const container = document.getElementById('dayList');
    if (!container) return;
    
    if (!days || days.length === 0) {
        container.innerHTML = '<p class="no-data">No workout days found in this plan.</p>';
        return;
    }
    
    container.innerHTML = '';
    days.forEach(day => {
        const card = document.createElement('div');
        card.className = 'day-card';
        card.innerHTML = `
            <div class="day-card-content">
                <span class="day-icon">${day.icon || '🏋️'}</span>
                <div class="day-info">
                    <h4>${day.name}</h4>
                    <p>${day.exercises ? day.exercises.length : 0} exercises</p>
                </div>
            </div>
        `;
        card.onclick = () => selectProgressiveDay(day);
        container.appendChild(card);
    });
}

function selectProgressiveDay(day) {
    progressiveSelectedDay = day;
    console.log("Selected day:", day.name);
    displayProgressiveExerciseConfiguration(day.exercises);
    
    // Update info displays
    const workoutNameEl = document.getElementById('currentWorkoutName');
    const dayNameEl = document.getElementById('currentDayName');
    const startDateEl = document.getElementById('workoutStartDate');
    
    if (workoutNameEl) workoutNameEl.textContent = progressiveSelectedWorkout.name;
    if (dayNameEl) dayNameEl.textContent = day.name;
    if (startDateEl && progressiveSelectedWorkout.createdAt) {
        startDateEl.textContent = new Date(progressiveSelectedWorkout.createdAt).toLocaleDateString();
    }
    
    showStep(3);
}

function displayProgressiveExerciseConfiguration(exercises) {
    const container = document.getElementById('exercisesConfig');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!exercises || exercises.length === 0) {
        container.innerHTML = '<p class="no-data">No exercises found in this day.</p>';
        return;
    }
    
    exercises.forEach((exercise, index) => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'exercise-config';
        const exerciseId = `exercise-${index}`;
        
        exerciseCard.innerHTML = `
            <div class="exercise-header">
                <h4 class="exercise-title">${exercise.name}</h4>
                <div class="current-exercise-info">
                    <span class="current-stats">Current: ${exercise.weight} lbs × ${exercise.reps} reps × ${exercise.sets} sets</span>
                </div>
                <label class="toggle-label">
                    <input type="checkbox" class="enable-progression" data-exercise="${exercise.name}" id="${exerciseId}">
                    Enable Progression
                </label>
            </div>
            
            <div class="progression-settings" id="settings-${exerciseId}">
                <div class="form-group">
                    <label>Variable to Increase:</label>
                    <select class="progression-variable" data-exercise="${exercise.name}">
                        <option value="weight">Weight</option>
                        <option value="reps">Reps</option>
                        <option value="sets">Sets</option>
                        <option value="rest">Rest Time</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Increase Amount:</label>
                    <input type="number" min="0.5" step="0.5" value="5" 
                           class="increase-amount" data-exercise="${exercise.name}">
                    <span class="unit-display" id="unit-${exerciseId}">lbs</span>
                </div>
                
                <div class="form-group">
                    <label>Increase Interval (weeks):</label>
                    <input type="number" min="1" value="2" 
                           class="interval-weeks" data-exercise="${exercise.name}">
                </div>
                
                <div class="starting-value-info">
                    <strong>Starting Value:</strong> <span id="starting-value-${exerciseId}">${exercise.weight}</span> 
                    <span id="starting-unit-${exerciseId}">lbs</span>
                </div>
            </div>
        `;
        
        container.appendChild(exerciseCard);
        
        const checkbox = exerciseCard.querySelector(`#${exerciseId}`);
        const settings = exerciseCard.querySelector(`#settings-${exerciseId}`);
        const variableSelect = exerciseCard.querySelector('.progression-variable');
        
        settings.style.display = 'none';
        
        variableSelect.addEventListener('change', function() {
            updateProgressiveUnits(exerciseId, this.value, exercise);
        });
        
        checkbox.addEventListener('change', function() {
            settings.style.display = this.checked ? 'block' : 'none';
            saveProgressiveCheckboxState(exercise.name, this.checked);
        });
        
        const savedState = getProgressiveCheckboxState(exercise.name);
        if (savedState) {
            checkbox.checked = true;
            settings.style.display = 'block';
        }
    });
}

function updateProgressiveUnits(exerciseId, variable, exercise) {
    const units = {
        'weight': 'lbs',
        'reps': 'reps', 
        'sets': 'sets',
        'rest': 'seconds'
    };
    
    const startingValues = {
        'weight': exercise.weight,
        'reps': exercise.reps,
        'sets': exercise.sets,
        'rest': exercise.rest || 60
    };
    
    const unit = units[variable] || '';
    const startingValue = startingValues[variable] || 0;
    
    const unitDisplay = document.getElementById(`unit-${exerciseId}`);
    const startingUnit = document.getElementById(`starting-unit-${exerciseId}`);
    const startingValueDisplay = document.getElementById(`starting-value-${exerciseId}`);
    
    if (unitDisplay) unitDisplay.textContent = unit;
    if (startingUnit) startingUnit.textContent = unit;
    if (startingValueDisplay) startingValueDisplay.textContent = startingValue;
}

function saveProgressiveCheckboxState(exerciseName, checked) {
    if (!progressiveSelectedWorkout || !progressiveSelectedDay) return;
    const key = `progression-${progressiveSelectedWorkout.id}-${progressiveSelectedDay.id}-${exerciseName}`;
    localStorage.setItem(key, checked ? 'true' : 'false');
}

function getProgressiveCheckboxState(exerciseName) {
    if (!progressiveSelectedWorkout || !progressiveSelectedDay) return false;
    const key = `progression-${progressiveSelectedWorkout.id}-${progressiveSelectedDay.id}-${exerciseName}`;
    return localStorage.getItem(key) === 'true';
}

function getVariableUnit(variable) {
    const units = {
        'weight': 'lbs',
        'reps': 'reps',
        'sets': 'sets',
        'rest': 'seconds'
    };
    return units[variable] || '';
}

async function saveProgressionPlan() {
    if (!progressiveSelectedWorkout || !progressiveSelectedDay) {
        showNotification('Please select a workout and day first', 'error');
        return;
    }
    
    const exercises = {};
    
    document.querySelectorAll('.exercise-config').forEach(config => {
        const checkbox = config.querySelector('.enable-progression');
        if (checkbox && checkbox.checked) {
            const exerciseName = checkbox.dataset.exercise;
            const variable = config.querySelector('.progression-variable').value;
            const increaseAmount = parseFloat(config.querySelector('.increase-amount').value);
            const intervalWeeks = parseInt(config.querySelector('.interval-weeks').value);
            const exerciseData = progressiveSelectedDay.exercises.find(ex => ex.name === exerciseName);
            const startingValue = getProgressiveStartingValue(exerciseData, variable);
            
            const startDate = new Date(progressiveSelectedWorkout.createdAt);
            const nextIncreaseDate = new Date(startDate);
            nextIncreaseDate.setDate(nextIncreaseDate.getDate() + (intervalWeeks * 7));
            
            exercises[exerciseName] = {
                variable: variable,
                increaseAmount: increaseAmount,
                intervalWeeks: intervalWeeks,
                startingValue: startingValue,
                currentValue: startingValue,
                startDate: startDate.toISOString().split('T')[0],
                nextIncreaseDate: nextIncreaseDate.toISOString().split('T')[0],
                lastIncreased: null,
                enabled: true
            };
        }
    });
    
    if (Object.keys(exercises).length === 0) {
        showNotification('Please enable at least one exercise', 'error');
        return;
    }
    
    try {
        const saved = localStorage.getItem('progressionPlans');
        const existingPlans = saved ? JSON.parse(saved) : [];
        const filteredPlans = existingPlans.filter(plan => 
            !(plan.workoutId === progressiveSelectedWorkout.id && plan.dayId === progressiveSelectedDay.id)
        );
        
        const progressionPlan = {
            id: `progression-${Date.now()}`,
            workoutId: progressiveSelectedWorkout.id,
            workoutName: progressiveSelectedWorkout.name,
            dayId: progressiveSelectedDay.id,
            dayName: progressiveSelectedDay.name,
            exercises: exercises,
            startDate: new Date(progressiveSelectedWorkout.createdAt).toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        filteredPlans.push(progressionPlan);
        localStorage.setItem('progressionPlans', JSON.stringify(filteredPlans));
        
        showNotification('Progression plan saved!', 'success');
        
        // Clear checkbox states
        Object.keys(exercises).forEach(name => {
            const key = `progression-${progressiveSelectedWorkout.id}-${progressiveSelectedDay.id}-${name}`;
            localStorage.removeItem(key);
        });
        
        showStep(1);
        loadActivePlans();
        
    } catch (error) {
        console.error('Error saving progression plan:', error);
        showNotification('Error saving progression plan', 'error');
    }
}

function getProgressiveStartingValue(exercise, variable) {
    if (!exercise) return 0;
    const values = {
        'weight': parseFloat(exercise.weight) || 0,
        'reps': parseInt(exercise.reps) || 0,
        'sets': parseInt(exercise.sets) || 0,
        'rest': parseInt(exercise.rest) || 0
    };
    return values[variable] || 0;
}

function showStep(stepNumber) {
    document.querySelectorAll('.setup-step').forEach(step => {
        step.style.display = 'none';
    });
    const stepEl = document.getElementById(`step${stepNumber}`);
    if (stepEl) stepEl.style.display = 'block';
}

function openPhotosModal() {
    const modal = document.getElementById('photosModal');
    if (modal) {
        modal.style.display = 'flex';
        if (typeof window.loadCurrentFolder === 'function') {
            window.loadCurrentFolder();
        }
    }
}

function closePhotosModal() {
    const modal = document.getElementById('photosModal');
    if (modal) modal.style.display = 'none';
}

// Make functions globally available
window.initializeProgressive = initializeProgressive;
window.deleteProgressivePlan = deleteProgressivePlan;
window.editProgressivePlan = editProgressivePlan;