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

// const eventsArr = [
//   {
//     day: 13,
//     month: 11,
//     year: 2022,
//     events: [
//       {
//         title: "Event 1 lorem ipsun dolar sit genfa tersd dsad ",
//         time: "10:00 AM",
//       },
//       {
//         title: "Event 2",
//         time: "11:00 AM",
//       },
//     ],
//   },
// ];

const eventsArr = [];
getEvents();
console.log(eventsArr);

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

// Make it available globally
window.showNotification = showNotification;

//function to add days in days with class day and prev-date next-date on previous month and next month days and active on today
function initCalendar() {
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
    //check if event is present on that day
    let event = false;
    eventsArr.forEach((eventObj) => {
      if (
        eventObj.day === i &&
        eventObj.month === month + 1 &&
        eventObj.year === year
      ) {
        event = true;
      }
    });
    if (
      i === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
      if (event) {
        days += `<div class="day today active event">${i}</div>`;
      } else {
        days += `<div class="day today active">${i}</div>`;
      }
    } else {
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else {
        days += `<div class="day ">${i}</div>`;
      }
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  daysContainer.innerHTML = days;
  addListner();
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

//function to add active on day
function addListner() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      getActiveDay(e.target.innerHTML);
      updateEvents(Number(e.target.innerHTML));
      activeDay = Number(e.target.innerHTML);
      //remove active
      days.forEach((day) => {
        day.classList.remove("active");
      });
      //if clicked prev-date or next-date switch to that month
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        //add active to clicked day afte month is change
        setTimeout(() => {
          //add active where no prev-date or next-date
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        //add active to clicked day afte month is changed
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
      }
    });
  });
}

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
  eventsArr.forEach((event) => {
    if (
      date === event.day &&
      month + 1 === event.month &&
      year === event.year
    ) {
      event.events.forEach((event) => {
        events += `<div class="event">
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
  //select active day and add event class if not added
  const activeDayEl = document.querySelector(".day.active");
  if (!activeDayEl.classList.contains("event")) {
    activeDayEl.classList.add("event");
  }
});

// ============================================
// CONFIRM MODAL FOR EVENT DELETION
// ============================================

const confirmModal = document.getElementById('confirm-modal');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');

// Replace the event listener for event deletion
eventsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("event")) {
    const eventTitle = e.target.children[0].children[1].innerHTML;
    
    // Show custom modal instead of confirm()
    confirmModal.style.display = 'flex';
    
    // Handle Yes button
    const handleYes = () => {
      // Delete event logic here (your original delete code)
      eventsArr.forEach((event) => {
        if (
          event.day === activeDay &&
          event.month === month + 1 &&
          event.year === year
        ) {
          event.events.forEach((item, index) => {
            if (item.title === eventTitle) {
              event.events.splice(index, 1);
            }
          });
          
          if (event.events.length === 0) {
            eventsArr.splice(eventsArr.indexOf(event), 1);
            const activeDayEl = document.querySelector(".day.active");
            if (activeDayEl.classList.contains("event")) {
              activeDayEl.classList.remove("event");
            }
          }
        }
      });
      updateEvents(activeDay);
      confirmModal.style.display = 'none';
      // Clean up event listeners
      confirmYes.removeEventListener('click', handleYes);
      confirmNo.removeEventListener('click', handleNo);
    };
    
    // Handle No button
    const handleNo = () => {
      confirmModal.style.display = 'none';
      // Clean up event listeners
      confirmYes.removeEventListener('click', handleYes);
      confirmNo.removeEventListener('click', handleNo);
    };
    
    // Add event listeners
    confirmYes.addEventListener('click', handleYes);
    confirmNo.addEventListener('click', handleNo);
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
        else {
            button.addEventListener('click', showCalendarView);
        }
    });
    
    // Add click handlers to workout option buttons (in workout builder)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.workout-option-btn')) {
            const pageId = e.target.closest('.workout-option-btn').getAttribute('data-page');
            showFitnessPage(pageId);
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
    });
    
    // Initialize workout builder preview
    updateWorkoutBuilderPreview();
    
    // Optional: Add keyboard navigation (Esc to go back)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentView !== 'calendar') {
            if (currentView === 'daymaker' || currentView === 'workoutcreator' || currentView === 'currentworkout') {
                showFitnessPage('workout');
            } else {
                showCalendarView();
            }
        }
    });
    
    console.log('Navigation system loaded');
});

// Function to update workout builder preview
// Function to update workout builder preview
function updateWorkoutBuilderPreview() {
    console.log("=== updateWorkoutBuilderPreview called ===");
    const previewElement = document.getElementById('current-workout-preview');
    if (!previewElement) {
        console.log("Preview element not found!");
        return;
    }
    
    // Check if Current Workout Manager is available
    if (window.currentWorkoutManager) {
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
    } else {
        console.log("Current workout manager NOT found!");
        previewElement.innerHTML = '<p>No workout plan selected</p>';
    }
    console.log("=== updateWorkoutBuilderPreview finished ===");
}