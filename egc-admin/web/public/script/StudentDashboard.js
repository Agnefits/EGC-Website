let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
});

function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
}

var userData = JSON.parse(localStorage.getItem("userData"));
if (userData) {
    document.getElementsByClassName("profile")[0].getElementsByClassName("name")[0].innerText = userData.name;
    document.getElementsByClassName("profile")[0].getElementsByClassName("email")[0].innerText = userData.email;
    if (userData.photo) {
        document.querySelector(".profile-details img").src = (userData.role == "Doctor" ? "/doctors" : "/teaching-assistants") + '/photo/' + userData.id;
    }
}

const logout = document.getElementById("log_out");
logout.addEventListener("click", () => {
    localStorage.clear("userData");
    location.href = "/home";
});
// for count the quzzies
fetch('/courses-quizzes/1') // Replace '1' with the actual courseId
    .then(response => response.json())
    .then(data => {
        const quizContainer = document.querySelector('.content');
        const quizCountElement = document.getElementById('quiz-count'); // Select the count element
        // Update the quiz count
        quizCountElement.textContent = data.length; // Set the count in the card
        // Iterate through each quiz and display it
    })
    .catch(error => console.error('Error fetching quizzes:', error));
//for count the assignments
document.addEventListener('DOMContentLoaded', () => {
    const count = localStorage.getItem('assignmentCount');
    const taskCountElement = document.getElementById('task-count');

    // Update the task count in the card
    taskCountElement.textContent = count ? count : '0';
});

let deletedCells = [-1, -1, -1, -1, -1, -1];
// Function to generate time slots in 5-minute intervals from 8:00 AM to 6:00 PM
function generateTimeSlots() {
    const startHour = 8;
    const endHour = 18;
    const slots = [];

    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 5) {
            const time = `${hour}:${minutes.toString().padStart(2, '0')}`;
            slots.push(time);
        }
    }

    return slots;
}

// Populate the schedule with classes
function populateSchedule(classList) {
    deletedCells = [-1, -1, -1, -1, -1, -1];
    const scheduleTable = document.querySelector('.schedule-container table tbody');
    const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const timeSlots = generateTimeSlots(); // Get time slots in 5-minute intervals

    // Clear tbody
    scheduleTable.innerHTML = `
                            <tr>
                                <td class="day-header">Saturday</td>
                            </tr>
                            <tr>
                                <td class="day-header">Sunday</td>
                            </tr>
                            <tr>
                                <td class="day-header">Monday</td>
                            </tr>
                            <tr>
                                <td class="day-header">Tuesday</td>
                            </tr>
                            <tr>
                                <td class="day-header">Wednesday</td>
                            </tr>
                            <tr>
                                <td class="day-header">Thursday</td>
                            </tr>
                        `;

    // Create a lookup for rows by day
    const rowsByDay = {};
    days.forEach((day, index) => {
        rowsByDay[day] = scheduleTable.rows[index]; // Assume row index matches day order
        if (rowsByDay[day].cells.length < 145) { // 145 = 12 hours x 12 slots per hour + 1 day cell
            // Add empty cells to fill up the row for each 5-minute slot
            for (let i = 0; i < 144; i++) { // 144 = 12 hours x 12 slots
                rowsByDay[day].insertCell(-1); // Insert at the end of the row
            }
        }
    });

    // Function to convert a time (e.g., "9:20") into a slot index
    function getTimeSlotIndex(time) {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = (hour - 8) * 60 + minute; // Convert time to minutes starting from 8:00 AM
        return Math.floor(totalMinutes / 5); // Each slot represents 5 minutes
    }

    // Add only hour markers to the header (with colSpan for 12 intervals of 5 minutes)
    const headerRow = document.querySelector('thead tr');

    // Clear thead
    headerRow.innerHTML = `<th></th>`;

    for (let hour = 8; hour <= 18; hour++) {
        const th = document.createElement('th');
        th.textContent = `${hour}:00`;
        th.colSpan = 12; // 12 intervals of 5 minutes in each hour
        headerRow.appendChild(th);
    }

    // Loop through the class list and insert data into the correct slots
    classList.forEach(classItem => {
        const {
            title,
            instructor,
            place,
            day,
            timeFrom,
            timeTo
        } = classItem;

        const row = rowsByDay[day]; // Get the row corresponding to the day
        if (!row) {
            console.error(`Row for day ${day} not found`);
            return;
        }
        const fromIndex = getTimeSlotIndex(timeFrom) - deletedCells[days.indexOf(day)];
        const toIndex = getTimeSlotIndex(timeTo) - deletedCells[days.indexOf(day)] - 1;
        console.log(toIndex - fromIndex);
        deletedCells[days.indexOf(day)] += toIndex - fromIndex;

        if (fromIndex === -1 || toIndex === -1) {
            console.error(`Invalid time slot for class ${title}: ${timeFrom} - ${timeTo}`);
            return;
        }

        // Merge the cells spanning the class duration
        const duration = toIndex - fromIndex + 1;
        const cell = row.cells[fromIndex]; // Get the starting cell
        cell.classList += "cell";

        if (cell) {
            cell.colSpan = duration; // Merge cells to show the entire class span
            cell.innerHTML = `<div>${title}<br>${instructor}<br>${place}<br>${timeFrom} - ${timeTo}</div>`;
            // Remove the next cells that are now part of the span
            for (let i = fromIndex + 1; i <= toIndex; i++) {
                row.deleteCell(fromIndex + 1); // Keep deleting the next cell after the first one
            }
        }
    });
}

async function loadClassSchedule() {

    const response = await fetch(`/class-schedule/${userData.department}/${userData.year_level}/${userData.sectionNo}`);
    if (!response.ok) {
        throw new Error('Failed to fetch class schedule');
    }

    const classes = await response.json();
    console.log('Fetched classes:', classes); // أضف هذا السطر للتحقق من البيانات

    populateSchedule(classes);
}
loadClassSchedule();