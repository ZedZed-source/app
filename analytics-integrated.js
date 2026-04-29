// analytics-integrated.js - FIXED VERSION (no duplicate declarations)
console.log("📈 Analytics module loaded");

// Use different variable names to avoid conflicts
let analyticsSelectedWorkout = null;
let analyticsSelectedDay = null;
let analyticsProgressChart = null;
let analyticsWorkoutHistory = [];

// Initialize analytics
function initializeAnalytics() {
    console.log("Initializing Analytics...");
    
    // Setup back button - FIXED: Now goes to calendar
    const backBtn = document.getElementById('analytics-back');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            showCalendarView();  // Changed from 'workout' to calendar view
        });
    }
    
    // Setup navigation buttons
    const backToWorkoutsBtn = document.getElementById('analytics-back-to-workouts');
    const backToDaysBtn = document.getElementById('analytics-back-to-days');
    const metricSelect = document.getElementById('analytics-metric-select');
    
    if (backToWorkoutsBtn) {
        backToWorkoutsBtn.addEventListener('click', showAnalyticsWorkoutSelection);
    }
    
    if (backToDaysBtn) {
        backToDaysBtn.addEventListener('click', showAnalyticsDaySelection);
    }
    
    if (metricSelect) {
        metricSelect.addEventListener('change', updateAnalyticsChart);
    }
    
    // Load data
    loadAnalyticsWorkoutHistory();
    loadAnalyticsWorkoutPlans();
    
    console.log("Analytics initialized");
}

// Navigation functions
function showAnalyticsWorkoutSelection() {
    document.getElementById('analytics-step1').style.display = 'block';
    document.getElementById('analytics-step2').style.display = 'none';
    document.getElementById('analytics-step3').style.display = 'none';
    analyticsSelectedWorkout = null;
}

function showAnalyticsDaySelection() {
    document.getElementById('analytics-step1').style.display = 'none';
    document.getElementById('analytics-step2').style.display = 'block';
    document.getElementById('analytics-step3').style.display = 'none';
    analyticsSelectedDay = null;
}

function showAnalyticsDashboard() {
    document.getElementById('analytics-step1').style.display = 'none';
    document.getElementById('analytics-step2').style.display = 'none';
    document.getElementById('analytics-step3').style.display = 'block';
    updateAnalyticsChart();
}

// Load workout history
function loadAnalyticsWorkoutHistory() {
    try {
        const saved = localStorage.getItem('workoutHistory');
        analyticsWorkoutHistory = saved ? JSON.parse(saved) : [];
        
        console.log(`Loaded ${analyticsWorkoutHistory.length} workout history entries`);
        
    } catch (error) {
        console.error('Error loading workout history:', error);
        analyticsWorkoutHistory = [];
    }
}

// Load workout plans
function loadAnalyticsWorkoutPlans() {
    try {
        console.log("Loading workout plans for analytics...");
        
        const saved = localStorage.getItem('workoutPlans');
        const workoutPlans = saved ? JSON.parse(saved) : [];
        
        console.log(`Found ${workoutPlans.length} workout plans for analytics`);
        displayAnalyticsWorkoutPlans(workoutPlans);
        
    } catch (error) {
        console.error('Error loading workout plans for analytics:', error);
        const container = document.getElementById('analytics-workout-list');
        if (container) {
            container.innerHTML = '<p class="no-data">Error loading workout plans</p>';
        }
    }
}

// Display workout plans
function displayAnalyticsWorkoutPlans(workoutPlans) {
    const container = document.getElementById('analytics-workout-list');
    if (!container) return;
    
    if (!workoutPlans || workoutPlans.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <p>No workout plans found.</p>
                <p>Create workout plans in the Workout Builder to see analytics.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    workoutPlans.forEach(plan => {
        const workoutCard = document.createElement('div');
        workoutCard.className = 'analytics-card';
        
        const completionStats = getAnalyticsWorkoutCompletionStats(plan.id);
        
        workoutCard.innerHTML = `
            <div class="workout-plan-info">
                <h3>${plan.name}</h3>
                <p>${getAnalyticsWorkoutDayCount(plan)} workout days</p>
                <p class="workout-stats">${completionStats}</p>
            </div>
            <button class="action-btn select-workout-btn" data-workout-id="${plan.id}">
                Analyze
            </button>
        `;
        
        container.appendChild(workoutCard);
        
        // Add event listener
        const selectBtn = workoutCard.querySelector('.select-workout-btn');
        selectBtn.addEventListener('click', function() {
            analyticsSelectedWorkout = workoutPlans.find(p => p.id === this.dataset.workoutId);
            loadAnalyticsDaysForWorkout(analyticsSelectedWorkout);
        });
    });
}

// Get workout completion stats
function getAnalyticsWorkoutCompletionStats(workoutId) {
    const workoutSessions = analyticsWorkoutHistory.filter(session => session.workoutId === workoutId);
    
    if (workoutSessions.length === 0) {
        return 'No workouts completed yet';
    }
    
    const completed = workoutSessions.length;
    const lastSession = workoutSessions[workoutSessions.length - 1];
    const lastDate = lastSession.date ? new Date(lastSession.date).toLocaleDateString() : 'Unknown';
    
    return `${completed} sessions completed | Last: ${lastDate}`;
}

function getAnalyticsWorkoutDayCount(workoutPlan) {
    if (!workoutPlan.schedule) return 0;
    return workoutPlan.schedule.filter(day => day && day.dayId).length;
}

// Load days for selected workout
function loadAnalyticsDaysForWorkout(workout) {
    const container = document.getElementById('analytics-day-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!workout.schedule || workout.schedule.length === 0) {
        container.innerHTML = '<p class="no-data">No days configured for this workout plan.</p>';
        return;
    }
    
    // Get unique days from schedule
    const uniqueDays = {};
    workout.schedule.forEach((day, index) => {
        if (day && day.dayId) {
            if (!uniqueDays[day.dayId]) {
                uniqueDays[day.dayId] = {
                    ...day,
                    positions: [index]
                };
            } else {
                uniqueDays[day.dayId].positions.push(index);
            }
        }
    });
    
    // Display each unique day
    Object.values(uniqueDays).forEach(day => {
        const dayStats = getAnalyticsDayPerformanceStats(day.dayId);
        
        const dayCard = document.createElement('div');
        dayCard.className = 'analytics-card';
        dayCard.innerHTML = `
            <div class="day-card-header">
                <span class="day-icon-preview">${day.icon || '🏋️'}</span>
                <h3>${day.dayName || 'Workout Day'}</h3>
            </div>
            <p>${dayStats.sessions} sessions completed</p>
            <p>${dayStats.improvement}</p>
            <button class="action-btn select-day-btn" data-day-id="${day.dayId}">
                View Progress
            </button>
        `;
        
        container.appendChild(dayCard);
        
        // Add event listener
        const selectBtn = dayCard.querySelector('.select-day-btn');
        selectBtn.addEventListener('click', function() {
            analyticsSelectedDay = day;
            showAnalyticsDashboard();
        });
    });
    
    showAnalyticsDaySelection();
}

function getAnalyticsDayPerformanceStats(dayId) {
    const daySessions = analyticsWorkoutHistory.filter(session => session.dayId === dayId);
    
    if (daySessions.length === 0) {
        return {
            sessions: 0,
            improvement: 'No data yet'
        };
    }
    
    // Calculate improvement
    let improvement = 'Steady progress';
    if (daySessions.length > 1) {
        const firstSession = daySessions[0];
        const lastSession = daySessions[daySessions.length - 1];
        
        if (lastSession.avgWeight && firstSession.avgWeight) {
            const percentChange = Math.round((lastSession.avgWeight - firstSession.avgWeight) / firstSession.avgWeight * 100);
            improvement = `${percentChange > 0 ? '↑' : '↓'} ${Math.abs(percentChange)}% weight change`;
        }
    }
    
    return {
        sessions: daySessions.length,
        improvement: improvement
    };
}

// Update chart
function updateAnalyticsChart() {
    const metricSelect = document.getElementById('analytics-metric-select');
    const metric = metricSelect ? metricSelect.value : 'weight';
    renderAnalyticsProgressChart(metric);
}

// Render progress chart
function renderAnalyticsProgressChart(metric) {
    if (!analyticsSelectedDay) return;
    
    const chartData = getAnalyticsChartDataForDay(analyticsSelectedDay.dayId, metric);
    const canvas = document.getElementById('analytics-progress-chart');
    
    if (!canvas) return;
    
    // Destroy existing chart
    if (analyticsProgressChart) {
        analyticsProgressChart.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    analyticsProgressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.dates,
            datasets: chartData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${analyticsSelectedDay.dayName || 'Workout'} Progress - ${getAnalyticsMetricName(metric)}`,
                    color: '#333',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        color: '#666'
                    },
                    ticks: {
                        color: '#666'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: getAnalyticsMetricName(metric),
                        color: '#666'
                    },
                    ticks: {
                        color: '#666'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    // Update legend
    updateAnalyticsChartLegend(chartData.datasets);
}

function getAnalyticsChartDataForDay(dayId, metric) {
    const daySessions = analyticsWorkoutHistory.filter(session => session.dayId === dayId);
    
    if (daySessions.length === 0) {
        // Return empty data structure
        return {
            dates: ['No data'],
            datasets: [{
                label: 'No data',
                data: [0],
                borderColor: '#ccc',
                backgroundColor: 'transparent',
                borderWidth: 1,
                pointRadius: 0
            }]
        };
    }
    
    // Get all unique exercises
    const allExercises = new Set();
    daySessions.forEach(session => {
        if (session.exercises && Array.isArray(session.exercises)) {
            session.exercises.forEach(exercise => {
                allExercises.add(exercise.name);
            });
        }
    });
    
    // Prepare datasets for each exercise
    const datasets = Array.from(allExercises).map((exerciseName, index) => {
        const exerciseData = daySessions.map(session => {
            if (!session.exercises) return null;
            
            const exercise = session.exercises.find(e => e.name === exerciseName);
            if (!exercise) return null;
            
            switch (metric) {
                case 'weight':
                    return exercise.avgWeight || exercise.weight || 0;
                case 'reps':
                    return exercise.reps || 0;
                case 'volume':
                    const weight = exercise.avgWeight || exercise.weight || 0;
                    const reps = exercise.reps || 0;
                    const sets = exercise.sets || 1;
                    return weight * reps * sets;
                case 'recovery':
                    return exercise.restTime || 0;
                default:
                    return exercise.avgWeight || exercise.weight || 0;
            }
        }).filter(value => value !== null);
        
        // Only include exercises that have data
        if (exerciseData.length === 0) return null;
        
        return {
            label: exerciseName,
            data: exerciseData,
            borderColor: getAnalyticsExerciseColor(index),
            backgroundColor: 'transparent',
            tension: 0.1,
            borderWidth: 2
        };
    }).filter(dataset => dataset !== null);
    
    // Get dates
    const dates = daySessions.map(session => {
        return session.date ? new Date(session.date).toLocaleDateString() : 'Unknown date';
    });
    
    return {
        dates: dates,
        datasets: datasets
    };
}

function getAnalyticsMetricName(metric) {
    const metricNames = {
        'weight': 'Weight (lbs)',
        'volume': 'Volume (lbs × reps × sets)',
        'reps': 'Reps',
        'recovery': 'Recovery Time (s)'
    };
    return metricNames[metric] || metric;
}

function updateAnalyticsChartLegend(datasets) {
    const legendContainer = document.getElementById('analytics-chart-legend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = '<h3>Exercises:</h3>';
    
    datasets.forEach(dataset => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <span class="legend-color" style="background-color: ${dataset.borderColor}"></span>
            <span class="legend-label">${dataset.label}</span>
        `;
        legendContainer.appendChild(legendItem);
    });
}

function getAnalyticsExerciseColor(index) {
    const colors = [
        '#3498db',  // Blue
        '#2ecc71',  // Green
        '#e74c3c',  // Red
        '#f39c12',  // Orange
        '#9b59b6',  // Purple
        '#1abc9c',  // Teal
        '#d35400',  // Pumpkin
        '#c0392b'   // Dark red
    ];
    return colors[index % colors.length];
}

// Make functions available globally
window.initializeAnalytics = initializeAnalytics;
window.showAnalyticsWorkoutSelection = showAnalyticsWorkoutSelection;

// Auto-initialize if page is visible
document.addEventListener('DOMContentLoaded', function() {
    const analyticsPage = document.getElementById('analytics-page');
    if (analyticsPage && window.getComputedStyle(analyticsPage).display !== 'none') {
        initializeAnalytics();
    }
});