const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  addEventBtn = document.querySelector(".add-event"),
  addEventWrapper = document.querySelector(".add-event-wrapper "),
  addEventCloseBtn = document.querySelector(".close "),
  addEventTitle = document.querySelector(".event-name "),
  addEventFrom = document.querySelector(".event-time-from "),
  addEventTo = document.querySelector(".event-time-to "),
  addEventSubmit = document.querySelector(".add-event-btn ");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const eventsArr = [];
getEvents();
console.log(eventsArr);

// Store workout events separately
let workoutEvents = [];

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'success', title = null) {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Default titles based on type
    const defaultTitles = {
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Information'
    };
    
    const notificationTitle = title || defaultTitles[type];
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icons for different notification types
    const icons = {
        'success': '✓',
        'error': '✗',
        'warning': '⚠',
        'info': 'ℹ'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type]}</div>
        <div class="notification-content">
            <div class="notification-title">${notificationTitle}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
    
    return notification;
}

// Add this to console to check localStorage
function debugStorage() {
    console.log("=== LOCALSTORAGE DEBUG ===");
    console.log("workoutDays:", localStorage.getItem('workoutDays'));
    console.log("workoutPlans:", localStorage.getItem('workoutPlans'));
    console.log("currentWorkout:", localStorage.getItem('currentWorkout'));
    console.log("=== END DEBUG ===");
}

// Run in console: debugStorage()
window.debugStorage = debugStorage;

// ============================================
// WORKOUT CALENDAR INTEGRATION
// ============================================

// Load workout events from current workout
// FIXED: Load workout events from current workout
function loadWorkoutEvents() {
    workoutEvents = [];
    
    try {
        const saved = localStorage.getItem('currentWorkout');
        if (!saved) {
            console.log("No current workout found");
            return;
        }
        
        const currentWorkout = JSON.parse(saved);
        console.log("Current workout:", currentWorkout);
        
        if (!currentWorkout || !currentWorkout.schedule) {
            console.log("No schedule in current workout");
            return;
        }
        
        // Get workout days for icons
        const savedDays = localStorage.getItem('workoutDays');
        const workoutDays = savedDays ? JSON.parse(savedDays) : [];
        console.log("Workout days available:", workoutDays.length);
        
        // Create workout events for the current month being displayed
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Map Sunday=0 to position 6, Monday=1 to position 0, etc.
            // This assumes schedule[0] = Monday, schedule[1] = Tuesday, etc.
            let scheduleIndex;
            if (dayOfWeek === 0) {
                scheduleIndex = 6; // Sunday = position 6
            } else {
                scheduleIndex = dayOfWeek - 1; // Monday=0, Tuesday=1, etc.
            }
            
            // Check if there's a workout scheduled for this day
            if (currentWorkout.schedule[scheduleIndex] && 
                !currentWorkout.schedule[scheduleIndex].isRestDay) {
                
                const dayData = currentWorkout.schedule[scheduleIndex];
                
                // Find the workout day details
                const workoutDay = workoutDays.find(d => d.id === dayData.dayId);
                
                if (workoutDay) {
                    console.log(`Adding workout for ${currentDate.toDateString()}: ${workoutDay.name} (${workoutDay.icon})`);
                    
                    workoutEvents.push({
                        day: day,
                        month: month + 1,
                        year: year,
                        type: 'workout',
                        icon: workoutDay.icon || '🏋️',
                        dayName: workoutDay.name || 'Workout',
                        workoutId: currentWorkout.id
                    });
                }
            }
        }
        
        console.log(`Loaded ${workoutEvents.length} workout events for ${months[month]} ${year}`);
        
    } catch (error) {
        console.error('Error loading workout events:', error);
    }
}

// Update initCalendar to include workout events
function initCalendar() {
    // Load workout events first
    loadWorkoutEvents();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const day = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay() - 1;

    date.innerHTML = months[month] + " " + year;

    let days = "";

    for (let x = day; x > 0; x--) {
        days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
    }

    for (let i = 1; i <= lastDate; i++) {
        // Check for regular events
        let hasEvent = false;
        eventsArr.forEach((eventObj) => {
            if (
                eventObj.day === i &&
                eventObj.month === month + 1 &&
                eventObj.year === year
            ) {
                hasEvent = true;
            }
        });
        
        // Check for workout events
        let workoutEvent = null;
        workoutEvents.forEach((eventObj) => {
            if (
                eventObj.day === i &&
                eventObj.month === month + 1 &&
                eventObj.year === year
            ) {
                workoutEvent = eventObj;
            }
        });
        
        let dayClasses = "day";
        let workoutIndicator = "";
        
        if (hasEvent) {
            dayClasses += " event";
        }
        
        if (workoutEvent) {
            dayClasses += " workout-event";
            workoutIndicator = `<div class="workout-indicator" title="${workoutEvent.dayName}">${workoutEvent.icon}</div>`;
        }
        
        if (
            i === new Date().getDate() &&
            year === new Date().getFullYear() &&
            month === new Date().getMonth()
        ) {
            activeDay = i;
            getActiveDay(i);
            updateEvents(i);
            dayClasses += " today active";
        }
        
        days += `<div class="${dayClasses}">${i}${workoutIndicator}</div>`;
    }

    for (let j = 1; j <= nextDays; j++) {
        days += `<div class="day next-date">${j}</div>`;
    }
    daysContainer.innerHTML = days;
    addListner();
}

// ============================================
// FIXED EVENT DELETION
// ============================================

// Update the event deletion logic in addListner
function addListner() {
    const days = document.querySelectorAll(".day");
    days.forEach((day) => {
        day.addEventListener("click", (e) => {
            // Don't trigger if clicking on workout indicator
            if (e.target.classList.contains('workout-indicator')) {
                return;
            }
            
            const dayElement = e.target.classList.contains('workout-indicator') ? e.target.parentElement : e.target;
            const dayNumber = parseInt(dayElement.textContent.match(/\d+/)?.[0] || dayElement.textContent);
            
            if (isNaN(dayNumber)) return;
            
            getActiveDay(dayNumber);
            updateEvents(dayNumber);
            activeDay = dayNumber;
            
            //remove active
            days.forEach((day) => {
                day.classList.remove("active");
            });
            
            //if clicked prev-date or next-date switch to that month
            if (dayElement.classList.contains("prev-date")) {
                prevMonth();
                //add active to clicked day after month is changed
                setTimeout(() => {
                    //add active where no prev-date or next-date
                    const days = document.querySelectorAll(".day");
                    days.forEach((day) => {
                        if (
                            !day.classList.contains("prev-date") &&
                            day.textContent.includes(dayNumber.toString())
                        ) {
                            day.classList.add("active");
                        }
                    });
                }, 100);
            } else if (dayElement.classList.contains("next-date")) {
                nextMonth();
                //add active to clicked day after month is changed
                setTimeout(() => {
                    const days = document.querySelectorAll(".day");
                    days.forEach((day) => {
                        if (
                            !day.classList.contains("next-date") &&
                            day.textContent.includes(dayNumber.toString())
                        ) {
                            day.classList.add("active");
                        }
                    });
                }, 100);
            } else {
                dayElement.classList.add("active");
            }
        });
    });
}

//function to add month and year on prev and next button
function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}

prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);

initCalendar();

todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

dateInput.addEventListener("input", (e) => {
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  if (dateInput.value.length === 2) {
    dateInput.value += "/";
  }
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
  if (e.inputType === "deleteContentBackward") {
    if (dateInput.value.length === 3) {
      dateInput.value = dateInput.value.slice(0, 2);
    }
  }
});

gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
  console.log("here");
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  showNotification("Invalid date format. Please use mm/yyyy format (e.g., 12/2023).", "error", "Invalid Date");
}

//function get active day day name and date and update eventday eventdate
function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = date + " " + months[month] + " " + year;
}

//function update events when a day is active
function updateEvents(date) {
  let events = "";
  
  // Add regular events
  eventsArr.forEach((event) => {
    if (
      date === event.day &&
      month + 1 === event.month &&
      year === event.year
    ) {
      event.events.forEach((event) => {
        events += `<div class="event" data-event-title="${event.title}">
            <div class="title">
              <i class="fas fa-circle"></i>
              <h3 class="event-title">${event.title}</h3>
            </div>
            <div class="event-time">
              <span class="event-time">${event.time}</span>
            </div>
        </div>`;
      });
    }
  });
  
  // Add workout events
  workoutEvents.forEach((event) => {
    if (
      date === event.day &&
      month + 1 === event.month &&
      year === event.year
    ) {
      events += `<div class="event workout-calendar-event" data-workout-id="${event.workoutId}">
          <div class="title">
            <i class="fas fa-dumbbell"></i>
            <h3 class="event-title">${event.dayName} Workout</h3>
          </div>
          <div class="event-time">
            <span class="event-time">${event.icon} Scheduled</span>
          </div>
      </div>`;
    }
  });
  
  if (events === "") {
    events = `<div class="no-event">
            <h3>No Events</h3>
        </div>`;
  }
  eventsContainer.innerHTML = events;
  saveEvents();
}

//function to add event
addEventBtn.addEventListener("click", () => {
  addEventWrapper.classList.toggle("active");
});

addEventCloseBtn.addEventListener("click", () => {
  addEventWrapper.classList.remove("active");
});

document.addEventListener("click", (e) => {
  if (e.target !== addEventBtn && !addEventWrapper.contains(e.target)) {
    addEventWrapper.classList.remove("active");
  }
});

//allow 50 chars in eventtitle
addEventTitle.addEventListener("input", (e) => {
  addEventTitle.value = addEventTitle.value.slice(0, 60);
});

//allow only time in eventtime from and to
addEventFrom.addEventListener("input", (e) => {
  addEventFrom.value = addEventFrom.value.replace(/[^0-9:]/g, "");
  if (addEventFrom.value.length === 2) {
    addEventFrom.value += ":";
  }
  if (addEventFrom.value.length > 5) {
    addEventFrom.value = addEventFrom.value.slice(0, 5);
  }
});

addEventTo.addEventListener("input", (e) => {
  addEventTo.value = addEventTo.value.replace(/[^0-9:]/g, "");
  if (addEventTo.value.length === 2) {
    addEventTo.value += ":";
  }
  if (addEventTo.value.length > 5) {
    addEventTo.value = addEventTo.value.slice(0, 5);
  }
});

//function to add event to eventsArr
addEventSubmit.addEventListener("click", () => {
  const eventTitle = addEventTitle.value;
  const eventTimeFrom = addEventFrom.value;
  const eventTimeTo = addEventTo.value;
  if (eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "") {
    showNotification("Please fill all the fields", "error", "Missing Information");
    return;
  }

  //check correct time format 24 hour
  const timeFromArr = eventTimeFrom.split(":");
  const timeToArr = eventTimeTo.split(":");
  if (
    timeFromArr.length !== 2 ||
    timeToArr.length !== 2 ||
    timeFromArr[0] > 23 ||
    timeFromArr[1] > 59 ||
    timeToArr[0] > 23 ||
    timeToArr[1] > 59
  ) {
    showNotification("Invalid time format. Please use 24-hour format (HH:MM).", "error", "Invalid Time");
    return;
  }

  const timeFrom = convertTime(eventTimeFrom);
  const timeTo = convertTime(eventTimeTo);

  //check if event is already added
  let eventExist = false;
  eventsArr.forEach((event) => {
    if (
      event.day === activeDay &&
      event.month === month + 1 &&
      event.year === year
    ) {
      event.events.forEach((event) => {
        if (event.title === eventTitle) {
          eventExist = true;
        }
      });
    }
  });
  if (eventExist) {
    showNotification("An event with this name already exists for this day.", "warning", "Duplicate Event");
    return;
  }
  const newEvent = {
    title: eventTitle,
    time: timeFrom + " - " + timeTo,
  };
  console.log(newEvent);
  console.log(activeDay);
  let eventAdded = false;
  if (eventsArr.length > 0) {
    eventsArr.forEach((item) => {
      if (
        item.day === activeDay &&
        item.month === month + 1 &&
        item.year === year
      ) {
        item.events.push(newEvent);
        eventAdded = true;
      }
    });
  }

  if (!eventAdded) {
    eventsArr.push({
      day: activeDay,
      month: month + 1,
      year: year,
      events: [newEvent],
    });
  }

  console.log(eventsArr);
  addEventWrapper.classList.remove("active");
  addEventTitle.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
  updateEvents(activeDay);
  initCalendar(); // Refresh calendar to show new event dot
});

// ============================================
// FIXED: CONFIRM MODAL FOR EVENT DELETION
// ============================================

const confirmModal = document.getElementById('confirm-modal');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');

// FIXED: Replace the event listener for event deletion
eventsContainer.addEventListener("click", (e) => {
  // Check if clicked element is an event (not workout event)
  const eventElement = e.target.closest('.event');
  if (eventElement && !eventElement.classList.contains('workout-calendar-event')) {
    const eventTitle = eventElement.querySelector('.event-title').textContent;
    
    // Show custom modal
    confirmModal.style.display = 'flex';
    
    // Remove any existing listeners first
    const newConfirmYes = confirmYes.cloneNode(true);
    const newConfirmNo = confirmNo.cloneNode(true);
    
    confirmYes.parentNode.replaceChild(newConfirmYes, confirmYes);
    confirmNo.parentNode.replaceChild(newConfirmNo, confirmNo);
    
    // Update references
    const currentConfirmYes = newConfirmYes;
    const currentConfirmNo = newConfirmNo;
    
    // Handle Yes button - FIXED VERSION
    const handleYes = () => {
      console.log("Deleting event:", eventTitle);
      
      // Find and remove the event
      eventsArr.forEach((event, index) => {
        if (
          event.day === activeDay &&
          event.month === month + 1 &&
          event.year === year
        ) {
          // Find the specific event within the day's events
          const eventIndex = event.events.findIndex(e => e.title === eventTitle);
          if (eventIndex !== -1) {
            event.events.splice(eventIndex, 1);
            
            // If no more events for this day, remove the entire day entry
            if (event.events.length === 0) {
              eventsArr.splice(index, 1);
              const activeDayEl = document.querySelector(".day.active");
              if (activeDayEl) {
                activeDayEl.classList.remove("event");
              }
            }
          }
        }
      });
      
      saveEvents();
      updateEvents(activeDay);
      initCalendar(); // Refresh calendar to update dots
      confirmModal.style.display = 'none';
    };
    
    // Handle No button
    const handleNo = () => {
      confirmModal.style.display = 'none';
    };
    
    // Add NEW event listeners
    currentConfirmYes.addEventListener('click', handleYes);
    currentConfirmNo.addEventListener('click', handleNo);
    
    // Also close modal if clicking outside
    confirmModal.addEventListener('click', function(e) {
      if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
        currentConfirmYes.removeEventListener('click', handleYes);
        currentConfirmNo.removeEventListener('click', handleNo);
      }
    });
  }
});

//function to save events in local storage
function saveEvents() {
  localStorage.setItem("events", JSON.stringify(eventsArr));
}

//function to get events from local storage
function getEvents() {
  //check if events are already saved in local storage then return event else nothing
  if (localStorage.getItem("events") === null) {
    return;
  }
  eventsArr.push(...JSON.parse(localStorage.getItem("events")));
}

function convertTime(time) {
  //convert time to 24 hour format
  let timeArr = time.split(":");
  let timeHour = timeArr[0];
  let timeMin = timeArr[1];
  let timeFormat = timeHour >= 12 ? "PM" : "AM";
  timeHour = timeHour % 12 || 12;
  time = timeHour + ":" + timeMin + " " + timeFormat;
  return time;
}

// ============================================
// FULL PAGE NAVIGATION
// ============================================

// Store the current view
let currentView = 'calendar';

// Function to hide ALL views
function hideAllViews() {
    // Hide calendar container
    document.querySelector('.container').style.display = 'none';
    
    // Hide all full pages
    document.querySelectorAll('.full-page').forEach(page => {
        page.style.display = 'none';
    });
}

// Function to show calendar view
function showCalendarView() {
    hideAllViews();
    document.querySelector('.container').style.display = 'flex';
    currentView = 'calendar';
    initCalendar(); // Refresh calendar when returning
    console.log('Showing calendar view');
}

// Function to show a fitness page
function showFitnessPage(pageId) {
    console.log(`=== showFitnessPage called for: ${pageId} ===`);
    
    // Clean up any open dialogs first
    const existingDialogs = document.querySelectorAll('.custom-dialog-overlay');
    console.log(`Found ${existingDialogs.length} existing dialogs to clean up`);
    existingDialogs.forEach(dialog => {
        if (dialog.parentNode) {
            dialog.parentNode.removeChild(dialog);
        }
    });
    
    hideAllViews();
    const pageElement = document.getElementById(pageId + '-page');
    if (pageElement) {
        console.log(`Found ${pageId}-page element, displaying...`);
        pageElement.style.display = 'block';
        currentView = pageId;
        
        // Initialize page-specific functionality with a small delay
        setTimeout(() => {
            if (pageId === 'workoutcreator' && window.initializeWorkoutCreator) {
                console.log("Calling initializeWorkoutCreator...");
                try {
                    window.initializeWorkoutCreator();
                } catch (error) {
                    console.error("Error in initializeWorkoutCreator:", error);
                }
            }
            if (pageId === 'daymaker') {
                console.log("Reloading saved days for Day Maker...");
                // Force reload of saved days
                if (window.loadSavedDays && window.renderSavedDays) {
                    window.loadSavedDays();
                    window.renderSavedDays();
                }
            }
            if (pageId === 'currentworkout' && window.initializeCurrentWorkout) {
                console.log("Initializing Current Workout page...");
                try {
                    window.initializeCurrentWorkout();
                } catch (error) {
                    console.error("Error initializing Current Workout:", error);
                }
            }
            if (pageId === 'progressive' && window.initializeProgressive) {
                console.log("Initializing Progressive Overload page...");
                try {
                    window.initializeProgressive();
                } catch (error) {
                    console.error("Error initializing Progressive:", error);
                }
            }
            if (pageId === 'analytics' && window.initializeAnalytics) {
                console.log("Initializing Analytics page...");
                try {
                    window.initializeAnalytics();
                } catch (error) {
                    console.error("Error initializing Analytics:", error);
                }
            }
            if (pageId === 'spreadsheets' && window.initializeSpreadsheets) {
                console.log("Initializing Spreadsheets page...");
                try {
                    window.initializeSpreadsheets();
                } catch (error) {
                    console.error("Error initializing Spreadsheets:", error);
                }
            }
            if (pageId === 'viewcurrentworkout' && window.initializeViewCurrentWorkout) {
                console.log("Initializing View Current Workout page...");
                try {
                    window.initializeViewCurrentWorkout();
                } catch (error) {
                    console.error("Error initializing View Current Workout:", error);
                }
            }
            if (pageId === 'workout') {
                console.log("On workout builder page - just updating preview");
                // Only update the current workout preview
                updateWorkoutBuilderPreview();
            }
        }, 50); // Small delay to ensure DOM is ready
    } else {
        console.error(`Page ${pageId}-page not found!`);
    }
}

// Set up navigation buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to fitness navigation buttons (in calendar)
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            showFitnessPage(pageId);
        });
    });
    
    // Add click handlers to back buttons in full pages
    document.querySelectorAll('.back-btn').forEach(button => {
        // Check if it's the daymaker back button (special case)
        if (button.id === 'daymaker-back') {
            button.addEventListener('click', () => {
                showFitnessPage('workout');
            });
        } 
        // Workout creator back button
        else if (button.id === 'workoutcreator-back') {
            button.addEventListener('click', () => {
                showFitnessPage('workout');
            });
        }
        // Current workout back button
        else if (button.id === 'currentworkout-back') {
            button.addEventListener('click', () => {
                showFitnessPage('workout');
            });
        }
        // Progressive overload back button
        else if (button.id === 'progressive-back') {
            button.addEventListener('click', () => {
                showFitnessPage('workout');
            });
        }
        // Analytics back button - FIXED: Now goes to calendar
        else if (button.id === 'analytics-back') {
            button.addEventListener('click', () => {
                showCalendarView();  // Changed from 'workout' to calendar view
            });
        }
        // Spreadsheets back button - FIXED: Now goes to calendar
        else if (button.id === 'spreadsheets-back') {
            button.addEventListener('click', () => {
                showCalendarView();  // Changed from 'workout' to calendar view
            });
        }
        // View Current Workout back button
        else if (button.id === 'viewcurrentworkout-back') {
            button.addEventListener('click', () => {
                showFitnessPage('workout');
            });
        }
        else {
            button.addEventListener('click', showCalendarView);
        }
    });
    
    // Add click handlers to workout option buttons (in workout builder)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.workout-option-btn')) {
            const btn = e.target.closest('.workout-option-btn');
            const pageId = btn.getAttribute('data-page');
            
            // Handle View Current Workout button (which has an id instead of data-page)
            if (btn.id === 'view-current-workout-btn') {
                console.log("View Current Workout button clicked");
                showFitnessPage('viewcurrentworkout');
            } else if (pageId) {
                showFitnessPage(pageId);
            }
        }
    });
    
    // Handle Change Current Workout button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'change-current-workout-btn') {
            console.log("Change Current Workout button clicked");
            showFitnessPage('currentworkout');
        }
    });
    
    // Update current workout preview when workout changes
    window.addEventListener('currentWorkoutChanged', function() {
        updateWorkoutBuilderPreview();
        // Refresh calendar when workout changes
        initCalendar();
    });
    
    // Initialize workout builder preview
    updateWorkoutBuilderPreview();
    
    // Optional: Add keyboard navigation (Esc to go back)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentView !== 'calendar') {
            if (currentView === 'daymaker' || currentView === 'workoutcreator' || 
                currentView === 'currentworkout' || currentView === 'progressive' ||
                currentView === 'analytics' || currentView === 'spreadsheets' ||
                currentView === 'viewcurrentworkout') {
                showFitnessPage('workout');
            } else {
                showCalendarView();
            }
        }
    });
    
    // ============================================
    // DATA SYNC FUNCTION (KEEP THIS SIMPLE)
    // ============================================
    function syncWorkoutData() {
        console.log("=== SYNC WORKOUT DATA ===");
        
        const workoutPlansStorage = localStorage.getItem('workoutPlans');
        const workoutDataStorage = localStorage.getItem('workoutData');
        
        console.log("workoutPlans in localStorage:", workoutPlansStorage ? JSON.parse(workoutPlansStorage).length : 0);
        console.log("workoutData in localStorage:", workoutDataStorage ? JSON.parse(workoutDataStorage).length : 0);
        
        // SIMPLE SYNC: If workoutData has data but workoutPlans doesn't, copy it
        if (workoutDataStorage && !workoutPlansStorage) {
            console.log("Copying workoutData to workoutPlans...");
            localStorage.setItem('workoutPlans', workoutDataStorage);
        }
        // If workoutPlans has data but workoutData doesn't, also sync (optional)
        else if (workoutPlansStorage && !workoutDataStorage) {
            console.log("Copying workoutPlans to workoutData...");
            localStorage.setItem('workoutData', workoutPlansStorage);
        }
        
        console.log("=== SYNC COMPLETE ===");
    }
    
    // Run sync on startup
    syncWorkoutData();
    
    console.log('Navigation system loaded');
});

// Function to update workout builder preview
function updateWorkoutBuilderPreview() {
    console.log("=== updateWorkoutBuilderPreview called ===");
    const previewElement = document.getElementById('current-workout-preview');
    if (!previewElement) {
        console.log("Preview element not found!");
        return;
    }
    
    // Wait for currentWorkoutManager to load if not available
    if (!window.currentWorkoutManager) {
        console.log("currentWorkoutManager not available yet, retrying in 100ms...");
        setTimeout(updateWorkoutBuilderPreview, 100);
        return;
    }
    
    console.log("Current workout manager found");
    console.log("Current workout:", window.currentWorkoutManager.currentWorkout);
    
    if (window.currentWorkoutManager.currentWorkout) {
        const currentWorkout = window.currentWorkoutManager.currentWorkout;
        previewElement.innerHTML = `
            <h4>${currentWorkout.name}</h4>
            <p>${window.currentWorkoutManager.getWorkoutDayCount(currentWorkout)} workout days</p>
            <small>${window.currentWorkoutManager.getWorkoutDaysSummary(currentWorkout)}</small>
        `;
        console.log("Updated preview with:", currentWorkout.name);
    } else {
        previewElement.innerHTML = '<p>No workout plan selected</p>';
        console.log("No current workout found");
    }
    console.log("=== updateWorkoutBuilderPreview finished ===");
}

// Workout completion tracking function (for analytics)
function recordWorkoutCompletion(workoutId, dayId, exercises) {
    try {
        const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
        
        const workoutSession = {
            id: 'session-' + Date.now(),
            workoutId: workoutId,
            dayId: dayId,
            date: new Date().toISOString(),
            exercises: exercises,
            avgWeight: calculateAverageWeight(exercises)
        };
        
        workoutHistory.push(workoutSession);
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
        
        console.log(`Recorded workout session for ${workoutId}`);
        showNotification('Workout completed! Data saved for analytics.', 'success', 'Workout Logged');
        return true;
    } catch (error) {
        console.error("Error recording workout completion:", error);
        return false;
    }
}

function calculateAverageWeight(exercises) {
    if (!exercises || exercises.length === 0) return 0;
    
    const total = exercises.reduce((sum, ex) => {
        return sum + (parseFloat(ex.weight) || 0);
    }, 0);
    
    return total / exercises.length;
}

// Make functions globally available
window.showNotification = showNotification;
window.showFitnessPage = showFitnessPage;
window.showCalendarView = showCalendarView;
window.recordWorkoutCompletion = recordWorkoutCompletion;