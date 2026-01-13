// currentWorkoutManager.js - FIXED VERSION (NO DUPLICATE VARIABLES)
console.log("Current Workout Manager loaded");

// Global current workout variable - DO NOT redeclare currentWeek here
window.currentWorkoutManager = null;

class CurrentWorkoutManager {
    constructor() {
        this.currentWorkout = null;
        this.init();
    }

    async init() {
        // Load current workout from storage
        await this.loadCurrentWorkout();
        // Update all displays
        this.updateAllDisplays();
        console.log("Current Workout Manager initialized");
    }

    async loadCurrentWorkout() {
        try {
            // Load from localStorage
            const saved = localStorage.getItem('currentWorkout');
            this.currentWorkout = saved ? JSON.parse(saved) : null;
            console.log("Loaded current workout:", this.currentWorkout ? this.currentWorkout.name : "None");
        } catch (error) {
            console.error('Error loading current workout:', error);
            this.currentWorkout = null;
        }
    }

    // In currentWorkoutManager.js - setCurrentWorkout method
async setCurrentWorkout(workoutPlan) {
    this.currentWorkout = workoutPlan;
    
    try {
        // Save to localStorage
        localStorage.setItem('currentWorkout', JSON.stringify(workoutPlan));
        
        // Dispatch event for other parts of the app
        this.dispatchWorkoutChangedEvent();
        
        // Update all displays across the app
        this.updateAllDisplays();
        
        console.log("Set current workout:", workoutPlan.name);
        return true;
    } catch (error) {
        console.error('Error saving current workout:', error);
        return false;
    }
}

    getCurrentWorkout() {
        return this.currentWorkout;
    }

    clearCurrentWorkout() {
        this.currentWorkout = null;
        try {
            localStorage.removeItem('currentWorkout');
            
            this.dispatchWorkoutChangedEvent();
            
            this.updateAllDisplays();
            console.log("Cleared current workout");
        } catch (error) {
            console.error('Error clearing current workout:', error);
        }
    }

    // Get all saved workout plans
    getAllWorkoutPlans() {
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

    // Delete a workout plan
    deleteWorkoutPlan(workoutId) {
        try {
            const allPlans = this.getAllWorkoutPlans();
            const planToDelete = allPlans.find(plan => plan.id === workoutId);
            
            if (!planToDelete) {
                console.error("Workout plan not found:", workoutId);
                return false;
            }
            
            // Remove from array
            const updatedPlans = allPlans.filter(plan => plan.id !== workoutId);
            
            // Save back to localStorage
            localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
            
            // Check if it was the current workout
            if (this.currentWorkout && this.currentWorkout.id === workoutId) {
                this.clearCurrentWorkout();
            }
            
            console.log("Deleted workout plan:", planToDelete.name);
            return true;
        } catch (error) {
            console.error('Error deleting workout plan:', error);
            return false;
        }
    }

    dispatchWorkoutChangedEvent() {
        const event = new CustomEvent('currentWorkoutChanged');
        window.dispatchEvent(event);
    }

    updateAllDisplays() {
        // Update workout builder display
        this.updateWorkoutBuilderDisplay();
        
        // Update current workout page if it's open
        this.updateCurrentWorkoutPage();
    }

    updateWorkoutBuilderDisplay() {
        // Update the preview in workout builder
        const previewElement = document.getElementById('current-workout-preview');
        if (previewElement) {
            if (this.currentWorkout) {
                const dayCount = this.getWorkoutDayCount(this.currentWorkout);
                previewElement.innerHTML = `
                    <h4>${this.currentWorkout.name}</h4>
                    <p>${dayCount} workout days</p>
                    <small>${this.getWorkoutDaysSummary(this.currentWorkout)}</small>
                `;
            } else {
                previewElement.innerHTML = '<p>No workout plan selected</p>';
            }
        }
    }

    updateCurrentWorkoutPage() {
        // Update the current workout page if visible
        const currentPage = document.getElementById('currentworkout-page');
        if (currentPage && window.getComputedStyle(currentPage).display !== 'none') {
            if (window.updateCurrentWorkoutDisplay) {
                window.updateCurrentWorkoutDisplay();
            }
            if (window.loadWorkoutPlans) {
                window.loadWorkoutPlans();
            }
        }
    }

    getWorkoutDayCount(workoutPlan) {
        if (!workoutPlan || !workoutPlan.schedule) return 0;
        return workoutPlan.schedule.filter(day => day && day.dayId && !day.isRestDay).length;
    }

    getWorkoutDaysSummary(workoutPlan) {
        if (!workoutPlan || !workoutPlan.schedule) return 'No days configured';
        
        const dayTypes = {};
        workoutPlan.schedule.forEach(day => {
            if (day && day.dayId && !day.isRestDay) {
                const dayName = day.dayName || 'Workout';
                dayTypes[dayName] = (dayTypes[dayName] || 0) + 1;
            } else if (day && day.isRestDay) {
                dayTypes['Rest Day'] = (dayTypes['Rest Day'] || 0) + 1;
            }
        });
        
        const summary = Object.entries(dayTypes)
            .map(([name, count]) => `${count} ${name}`)
            .join(', ');
        
        return summary || 'No workout days';
    }
}

// Create global instance when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.currentWorkoutManager = new CurrentWorkoutManager();
});