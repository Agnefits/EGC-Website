let deletedCells = [-1, -1, -1, -1, -1, -1];
let classes = []; // متغير لتخزين قائمة الفصول الدراسية

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
        cell.classList.add("cell");
        if (cell) {
            cell.colSpan = duration; // Merge cells to show the entire class span
            cell.innerHTML = `
                <div>
                    <strong>${title}</strong><br>
                    ${instructor}<br>
                    ${place}<br>
                    ${timeFrom} - ${timeTo}
                    <br>
                    <br>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                <br>
                <br>
                </div>
            `;
            // Remove the next cells that are now part of the span
            for (let i = fromIndex + 1; i <= toIndex; i++) {
                row.deleteCell(fromIndex + 1); // Keep deleting the next cell after the first one
            }

            // Add event listeners for Edit and Delete buttons
            const editButton = cell.querySelector(".edit-btn");
            const deleteButton = cell.querySelector(".delete-btn");

            editButton.addEventListener("click", () => {
                showPopup(classItem); // Show the popup when the "Edit" button is clicked
            });

            deleteButton.addEventListener("click", () => {
                // Handle the delete logic
                deleteClass(classItem, row, fromIndex, toIndex);
            });
        }
    });
}

// Function to delete a class from the schedule
function deleteClass(classItem, row, fromIndex, toIndex) {
    // Find the index of the class to delete in the classes array
    const classIndex = classes.findIndex(item => item.title === classItem.title && item.timeFrom === classItem.timeFrom);
    if (classIndex !== -1) {
        // Remove the class from the array
        classes.splice(classIndex, 1);
    }

    // Remove the merged cells for the class
    for (let i = fromIndex; i <= toIndex; i++) {
        row.deleteCell(fromIndex); // Remove the cells
    }

    // Re-populate the schedule to reflect changes
    populateSchedule(classes); // Assuming `classes` is your class data
}

// Function to show the popup with class details
function showPopup(classItem) {
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const closeBtn = document.getElementById('close-btn');
    const editForm = document.getElementById('edit-form');

    // Populate the popup with class details
    document.getElementById('edit-title').value = classItem.title;
    document.getElementById('edit-instructor').value = classItem.instructor;
    document.getElementById('edit-place').value = classItem.place;
    document.getElementById('edit-time-from').value = classItem.timeFrom;
    document.getElementById('edit-time-to').value = classItem.timeTo;

    // Show the popup
    popup.style.display = 'block';

    // Close the popup when the close button is clicked
    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Handle form submission (Save Changes)
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Update the class details with the new values
        classItem.title = document.getElementById('edit-title').value;
        classItem.instructor = document.getElementById('edit-instructor').value;
        classItem.place = document.getElementById('edit-place').value;
        classItem.timeFrom = document.getElementById('edit-time-from').value;
        classItem.timeTo = document.getElementById('edit-time-to').value;

        // Close the popup
        popup.style.display = 'none';

        // Update the classes array with the modified classItem
        const index = classes.findIndex(item => item.title === classItem.title && item.timeFrom === classItem.timeFrom);
        if (index !== -1) {
            classes[index] = { ...classItem }; // Update the class in the array
        }

        // Re-populate the schedule to reflect changes
        populateSchedule(classes); // Assuming `classes` is your class data
    });
}

document.getElementById("department").addEventListener("change", loadClasses);
document.getElementById("year_level").addEventListener("change", loadClasses);
document.getElementById("section").addEventListener("change", loadClasses);

async function loadClasses() {
    if (document.getElementById("department").value && document.getElementById("year_level").value && document.getElementById("section").value) {
        const response = await fetch(`/class-schedule/${document.getElementById("department").value}/${document.getElementById("year_level").value}/${document.getElementById("section").value}`);
        if (!response.ok) {
            throw new Error('Failed to fetch class schedule');
        }

        classes = await response.json();
        console.log('Fetched classes:', classes); // أضف هذا السطر للتحقق من البيانات

        populateSchedule(classes);
    }
}
function goBack() {
    window.location.href = "/admin/ClassSchedules";
}
populateSchedule([]); // Initial empty schedule
