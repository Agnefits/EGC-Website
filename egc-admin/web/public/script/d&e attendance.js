document.getElementById('department').addEventListener('change', loadStudents);
document.getElementById('yearlevel').addEventListener('change', loadStudents);
document.getElementById('n_section').addEventListener('change', loadStudents);

async function loadStudents() {
    const department = document.getElementById('department').value;
    const yearLevel = document.getElementById('yearlevel').value;
    const section = document.getElementById('n_section').value;
    const course = document.getElementById('course').value;

    try {

        const instructorData = JSON.parse(localStorage.getItem('userData'));

        let response;
        if (instructorData.role == "Doctor")
            response = await fetch(`/doctor/courses/${instructorData.id}`);
        else
            response = await fetch(`/teaching-assistant/courses/${instructorData.id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }

        const courses = await response.json();
        console.log('Fetched courses:', courses); // أضف هذا السطر للتحقق من البيانات

        const CourseSelect = document.getElementById('course');
        if (!CourseSelect) {
            throw new Error('Table body element not found');
        }
        CourseSelect.innerHTML = "<option value=''>Select Course</option>";

        courses.filter(courses => {
            return (!department || courses.department === department) &&
                (!yearLevel || courses.year === yearLevel)
        }).forEach(course => {
            const option = document.createElement('option');
            option.value = course.id; // Assuming each section has a unique ID
            option.textContent = course.name; // Display section name
            CourseSelect.appendChild(option);
        });

        CourseSelect.value = course;

        response = await fetch('/students'); // Fetch all students
        if (!response.ok) throw new Error('Failed to fetch students');

        const students = await response.json();
        const sectionSelect = document.getElementById('n_section');
        const sections = [];
        sectionSelect.innerHTML = "<option value=''>Select Section</option>";
        students.forEach(element => {
            if (!sections.includes(element.No_section)) {
                sections.push(element.No_section);
                const option = document.createElement('option');
                option.value = element.No_section; // Assuming each section has a unique ID
                option.textContent = "Section " + element.No_section; // Display section name
                sectionSelect.appendChild(option);
            }
        });

        sectionSelect.value = section;

        const filteredStudents = students.filter(student => {
            return (!department || student.department === department) &&
                (!yearLevel || student.year_level === yearLevel) &&
                (!section || student.No_section == section);
        });

        populateStudentsTable(filteredStudents);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading students');
    }
}

function populateStudentsTable(students) {
    const studentsTableBody = document.getElementById('studentsTableBody');
    studentsTableBody.innerHTML = ''; // Clear previous entries

    if (students.length === 0) {
        const messageItem = document.createElement('li');
        messageItem.textContent = 'No students found';
        studentsTableBody.appendChild(messageItem);
        return;
    }

    students.forEach(student => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;" data-id="${student.id}" data-status="A" class="student-data">
            <div>
                <button class="attendance-button" data-attendance="A">A</button>
                <button class="attendance-button" data-attendance="P">P</button>
            </div>
            <span style="margin-left: auto;">${student.name || 'N/A'}</span>
        </div>
    `;

        // Add event listeners for attendance buttons
        listItem.querySelector('button[data-attendance="P"]').addEventListener('click', () => markAttendance(listItem, 'P'));
        listItem.querySelector('button[data-attendance="A"]').addEventListener('click', () => markAttendance(listItem, 'A'));

        studentsTableBody.appendChild(listItem);
    });
}

function markAttendance(listItem, status) {
    // Remove any existing attendance classes
    listItem.classList.remove('present', 'absent');

    // Add class based on the attendance status
    if (status === 'P') {
        listItem.dataset.status = "P";
        listItem.classList.add('present');
        // Optionally, change background color
        listItem.style.backgroundColor = '#c6efce'; // Light green
    } else if (status === 'A') {
        listItem.dataset.status = "A";
        listItem.classList.add('absent');
        // Optionally, change background color
        listItem.style.backgroundColor = '#ffc7ce'; // Light red
    }

    updateAttendanceSummary();
}

function updateAttendanceSummary() {
    const totalStudents = document.getElementById('studentsTableBody').getElementsByTagName('li').length;
    let totalPresent = 0;
    let totalAbsent = 0;

    const listItems = document.querySelectorAll('#studentsTableBody li');
    listItems.forEach(listItem => {
        if (listItem.classList.contains('present')) {
            totalPresent++;
        } else if (listItem.classList.contains('absent')) {
            totalAbsent++;
        }
    });

    // Update the summary section
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalPresent').textContent = totalPresent;
    document.getElementById('totalAbsent').textContent = totalAbsent;
}

document.getElementById('save-notes-btn').addEventListener('click', function() {
    // Get the notes text from the textarea
    const notesText = document.getElementById('notes-textarea').value;

    // Display the notes in the notes display section
    const notesDisplay = document.getElementById('notes-display');
    notesDisplay.innerText = notesText;

    // Clear the textarea after saving
    document.getElementById('notes-textarea').value = '';
});

async function submitAttendance() {
    const sectionNo = document.getElementById('n_section').value;
    const courseId = document.getElementById('course').value;
    const notes = document.getElementById('notes-textarea').value;

    const userData = JSON.parse(localStorage.getItem('userData'));
    const formData = new FormData();

    // General attendance data
    formData.append('sectionNo', sectionNo);
    formData.append('courseId', courseId);
    formData.append('note', notes);

    // Add instructor ID based on role
    if (userData.role === 'Doctor') {
        formData.append('doctorId', userData.id);
    } else {
        formData.append('teaching_assistantId', userData.id);
    }

    // Add student attendance data
    const studentDataTags = document.querySelectorAll('.student-data');
    studentDataTags.forEach(tag => {
        const studentId = tag.getAttribute('data-id');
        const status = tag.getAttribute('data-status');
        formData.append(`student-${studentId}`, status);
    });

    try {
        const response = await fetch('/add-attendance', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.text();
            alert('Attendance submitted successfully');
        } else {
            const error = await response.text();
            console.error('Error:', error);
            alert('Error submitting attendance');
        }
    } catch (err) {
        console.error('Request failed:', err);
        alert('Request failed');
    }


    // Get the current date and time
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // Create the attendance summary string
    const attendanceSummary = `<p> Date: ${date} </p>  <p> Time: ${time}</p> `;

    // Update the result section
    const resultSection = document.getElementById('resultSection');
    resultSection.innerHTML = `<p>${attendanceSummary}</p>`;

    // Show the result section
    resultSection.style.display = 'block';
}
/*
document.addEventListener('DOMContentLoaded', async() => {


    await loadSections(); // Load sections on page load

    document.getElementById('n_section').addEventListener('change', async function() {
        const sectionId = this.value;
        if (sectionId) {
            await fetchStudents(sectionId); // Fetch students when a section is selected
        } else {
            document.getElementById('studentsTableBody').innerHTML = ''; // Clear if no section selected
        }
    });
});

// Function to load sections into the dropdown
/*async function loadSections() {
    const sectionSelect = document.getElementById('n_section');
    const response = await fetch('/Get-Sections'); // Adjust this endpoint as needed

    if (response.ok) {
        const sections = await response.json();
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section.id; // Assuming each section has a unique ID
            option.textContent = section.name; // Display section name
            sectionSelect.appendChild(option);
        });
    }
}*/

// Function to fetch and display students based on selected section
async function fetchStudents(sectionId) {
    const response = await fetch(`/Get-Students/${sectionId}`); // Adjust this endpoint as needed

    if (response.ok) {
        const students = await response.json();
        const studentsTableBody = document.getElementById('studentsTableBody');
        studentsTableBody.innerHTML = ''; // Clear existing students

        students.forEach(student => {
            const listItem = document.createElement('li');
            listItem.textContent = student.name; // Display student name
            studentsTableBody.appendChild(listItem); // Append to the UL
        });
    }
}