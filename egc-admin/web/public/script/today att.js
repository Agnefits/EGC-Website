

// document.addEventListener('DOMContentLoaded', loadAttendance);

// async function loadAttendance() {

//     try {

//         const response = await fetch(`/TodayAttendance`);
//         if (!response.ok) {
//             throw new Error('Failed to fetch attendance data');
//         }

//         const attendanceData = await response.json();
//         console.log('Fetched attendance data:', attendanceData);

        
//         // const department = document.getElementById('department').value;
//         // const yearLevel = document.getElementById('yearlevel').value;
//         // const section = document.getElementById('n_section').value;
//         // const courseId = document.getElementById('course').value;

//         const studentsTableBody = document.getElementById('TableBody');
//         if (!studentsTableBody) {
//             throw new Error('Table body element not found');
//         }

//         studentsTableBody.innerHTML = ''; 

//         // const filteredStudents = attendanceData.filter(record => {
//         //     return (!department || record.department === department) &&
//         //         (!yearLevel || record.yearLevel === yearLevel) &&
//         //         (!courseId || record.courseId === courseId) &&
//         //         (!section || record.section == section);
//         // });

//         attendanceData.forEach(record => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${record.studentName || 'N/A'}</td>
//                 <td>${record.department || 'N/A'}</td>
//                 <td>${record.yearLevel || 'N/A'}</td>
//                 <td>${record.courseName || 'N/A'}</td>
//                 <td>${record.section || 'N/A'}</td>
//                 <td>${record.presenceTotal || 'N/A'}</td>
//                 <td>${record.absenceTotal || 'N/A'}</td>
//                 <td>${record.percentage + ' % '|| 'N/A'}</td>
//             `;
//             studentsTableBody.appendChild(row);
//         });

//     } catch (error) {
//         console.error('Error:', error);
//         alert('Error loading attendance data');
//     }
// }









async function fetchAttendance() {
    try {
        const response = await fetch('/TodayAttendance');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const attendanceData = await response.json();
        
        // Clear the existing list
        const studentsTableBody = document.getElementById('studentsTableBody');
        studentsTableBody.innerHTML = '';

        let totalStudents = 0;
        let totalPresent = 0;
        let totalAbsent = 0;

        attendanceData.forEach(student => {
            totalStudents++; // Increment total students
            
            // Add present and absent counts
            totalPresent += student.totalPresent || 0; // Fallback to 0 if undefined
            totalAbsent += student.totalAbsent || 0; // Fallback to 0 if undefined

            // Create a list item for each student
            // const listItem = document.createElement('li');
            // listItem.textContent = `${student.studentName} - Present: ${student.totalPresent}, Absent: ${student.totalAbsent}`;
            // studentsTableBody.appendChild(listItem);
        });

        // Update the summary counts in the HTML
        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('totalPresent').textContent = totalPresent;
        document.getElementById('totalAbsent').textContent = totalAbsent;
        
    } catch (error) {
        console.error('Error fetching attendance data:', error);
    }
}

// Call the function to fetch attendance data when the page loads
document.addEventListener('DOMContentLoaded', fetchAttendance);































document.getElementById('department').addEventListener('change', loadStudents);
document.getElementById('yearlevel').addEventListener('change', loadStudents);
document.getElementById('n_section').addEventListener('change', loadStudents);

async function loadStudents() {
    const department = document.getElementById('department').value;
    const yearLevel = document.getElementById('yearlevel').value;
    const section = document.getElementById('n_section').value;

    try {
        const response = await fetch('/students'); // Fetch all students
        if (!response.ok) throw new Error('Failed to fetch students');

        const students = await response.json();
        const filteredStudents = students.filter(student => {
            return (!department || student.department === department) &&
                   (!yearLevel || student.year_level === yearLevel) &&
                   (!section || student.no_section === section);
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
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="margin-left: auto;">${student.name || 'N/A'}</span>
        </div>
    `;

    // Add event listeners for attendance buttons
    // listItem.querySelector('button[data-attendance="P"]').addEventListener('click', () => markAttendance(listItem, 'P'));
    // listItem.querySelector('button[data-attendance="A"]').addEventListener('click', () => markAttendance(listItem, 'A'));

    studentsTableBody.appendChild(listItem);
});
}
function markAttendance(listItem, status) {
  // Remove any existing attendance classes
  listItem.classList.remove('present', 'absent');

  // Add class based on the attendance status
  if (status === 'P') {
      listItem.classList.add('present');
      // Optionally, change background color
      listItem.style.backgroundColor = '#c6efce'; // Light green
  } else if (status === 'A') {
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
function submitAttendance() {


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












///////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', async () => {
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
async function loadSections() {
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
}

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
