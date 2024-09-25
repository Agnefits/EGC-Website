const departmentSelect = document.getElementById('department');
const classSelect = document.getElementById('class');
const studentsList = document.getElementById('students-list');

// Define the classes for each department
const departmentClasses = {
  mechanics: ['Mechanics 1', 'Mechanics 2', 'Mechanics 3'],
  electronics: ['Electronics 1', 'Electronics 2', 'Electronics 3'],
  computers: ['Computers 1', 'Computers 2', 'Computers 3']
};

// Define the students for each class and department
const departmentStudents = {
  mechanics: {
    'Mechanics 1': ['John Doe', 'Jane Smith'],
    'Mechanics 2': ['Mike Johnson', 'Sara Lee'],
    'Mechanics 3': ['Bob Brown', 'Kate White']
  },
  electronics: {
    'Electronics 1': ['David Lee', 'Jessica Brown'],
    'Electronics 2': ['James Johnson', 'Grace White'],
    'Electronics 3': ['Emily Smith', 'Daniel Lee']
  },
  computers: {
    'Computers 1': ['Oliver Black', 'Sophia White'],
    'Computers 2': ['Ella Green', 'Liam Brown'],
    'Computers 3': ['Noah Johnson', 'Ava Lee']
  }
};

// Function to generate the class options based on the selected department
function generateClassOptions() {
  // Get the selected department value
  const selectedDepartment = departmentSelect.value;

  // Clear the class select options
  classSelect.innerHTML = '';

  // Generate the class options based on the selected department
  departmentClasses[selectedDepartment].forEach(classOption => {
    const optionElement = document.createElement('option');
    optionElement.value = classOption;
    optionElement.textContent = classOption;
    classSelect.appendChild(optionElement);
  });
}

// Function to generate the student list based on the selected class and department
function generateStudentList() {
  // Get the selected department and class values
  const selectedDepartment = departmentSelect.value;
  const selectedClass = classSelect.value;

  // Clear the student list items
  studentsList.innerHTML = '';

  // Generate the student list items based on the selected class and department
  if (departmentStudents[selectedDepartment][selectedClass]) {
    departmentStudents[selectedDepartment][selectedClass].forEach(studentName => {
      const listItemElement = document.createElement('li');
      listItemElement.className = 'student-list-item'; // Add a class to the list item

      const studentNameElement = document.createElement('span');
      studentNameElement.textContent = studentName;
      studentNameElement.className = 'student-name'; // Add a class to the student name
      listItemElement.appendChild(studentNameElement);

      const attendanceButtons = document.createElement('span');
      attendanceButtons.className = 'attendance-buttons'; // Add a class to the attendance buttons
      attendanceButtons.innerHTML = `
        <button class="attendance-button" data-attendance="A">A</button>
        <button class="attendance-button" data-attendance="P">P</button>
        <button class="attendance-button" data-attendance="L">L</button>
      `;
      listItemElement.appendChild(attendanceButtons);

      studentsList.appendChild(listItemElement);
    });
  }

  // Add event listeners to the attendance buttons
  const attendanceButtons = document.getElementsByClassName('attendance-button');
  for (let i = 0; i < attendanceButtons.length; i++) {
    attendanceButtons[i].addEventListener('click', function() {
      // Deselect any previously selected attendance button in the same student list item
      const previousSelectedButton = this.parentNode.getElementsByClassName('selected')[0];
      if (previousSelectedButton) {
        previousSelectedButton.classList.remove('selected');
      }

      // Select the clicked attendance button
      this.classList.add('selected');

      // Update the list item color based on the attendance status
      const listItem = this.parentNode.parentNode;
      listItem.classList.remove('present', 'absent', 'leave');
      if (this.dataset.attendance === 'P') {
        listItem.classList.add('present');
      } else if (this.dataset.attendance === 'A') {
        listItem.classList.add('absent');
      } else if (this.dataset.attendance === 'L') {
        listItem.classList.add('leave');
      }

      // Update the attendance summary
      updateAttendanceSummary();
    });
  }
}

// Function to update the attendance counts and summary section
function updateAttendanceSummary() {
  // Initialize the attendance counts
  let totalPresentCount = 0;
  let totalAbsentCount = 0;
  let totalLeaveCount = 0;

  // Get the total number of students
  const totalStudentsCount = studentsList.getElementsByClassName('student-list-item').length;

  // Iterate through the student list items and update the attendance counts
  for (let i = 0; i < totalStudentsCount; i++) {
    const attendanceButtons = studentsList.getElementsByClassName('student-list-item')[i].getElementsByClassName('attendance-buttons')[0];
    const attendanceButton = Array.from(attendanceButtons.getElementsByClassName('attendance-button')).find(button => button.classList.contains('selected'));
    if (attendanceButton) {
      const attendanceStatus = attendanceButton.dataset.attendance;
      if (attendanceStatus === 'P') {
        totalPresentCount++;
        // Add green color to the list item
        attendanceButtons.parentNode.style.backgroundColor = '#c6efce';
      } else if (attendanceStatus === 'A') {
        totalAbsentCount++;
        // Add red color to the list item
        attendanceButtons.parentNode.style.backgroundColor = '#ffc7ce';
      } else if (attendanceStatus === 'L') {
        totalLeaveCount++;
        // Add orange color to the list item
        attendanceButtons.parentNode.style.backgroundColor = '#ffd7be';
      }
    } else {
      // Remove any existing color from the list item
      attendanceButtons.parentNode.style.backgroundColor = '';
    }
  }

  // Update the summary section with the calculated values
  const totalStudentsSpan = document.getElementById('totalStudents');
  const totalPresentSpan = document.getElementById('totalPresent');
  const totalAbsentSpan = document.getElementById('totalAbsent');
  const totalLeaveSpan = document.getElementById('totalLeave');
  totalStudentsSpan.textContent = totalStudentsCount;
  totalPresentSpan.textContent = totalPresentCount;
  totalAbsentSpan.textContent = totalAbsentCount;
  totalLeaveSpan.textContent = totalLeaveCount;
}

// Add event listeners to the department and class select elements to call the generateClassOptions and generateStudentList functions when the value changes
departmentSelect.addEventListener('change', generateClassOptions);
classSelect.addEventListener('change', generateStudentList);

// Call the generateClassOptions function initially to generate the class options based on the default department
generateClassOptions();

// Call the generateStudentList function initially to generate the student list based on the default department and class
generateStudentList();

// Add event listeners to the submit attendance buttons
const submitAttendanceButtons = document.querySelectorAll('.submit_att');
submitAttendanceButtons.forEach((button) => {
  button.addEventListener('click', () => {
        // Remove any existing attendance summary paragraphs
        const attendanceSummaryParagraphs = button.parentNode.getElementsByClassName('attendance-summary');
        while (attendanceSummaryParagraphs.length > 0) {
          attendanceSummaryParagraphs[0].remove();
        }
    // Calculate the attendance summary
    const totalStudents = studentsList.getElementsByClassName('student-list-item').length;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    const attendanceButtonsArray = studentsList.getElementsByClassName('attendance-button');
    for (let i = 0; i < attendanceButtonsArray.length; i++) {
      const attendanceButton = attendanceButtonsArray[i];
      if (attendanceButton.classList.contains('selected')) {
        const attendanceStatus = attendanceButton.getAttribute('data-attendance');
        if (attendanceStatus === 'P') {
          totalPresent++;
        } else if (attendanceStatus === 'A') {
          totalAbsent++;
        } else if (attendanceStatus === 'L') {
          totalLeave++;
        }
      }
    }

    // Get the current date and time
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // Create a paragraph element containing the attendance summary information
    const attendanceSummaryParagraph = document.createElement('p');
    attendanceSummaryParagraph.className = 'attendance-summary'; // Add a class to the paragraph
    attendanceSummaryParagraph.textContent = `Date: ${date} | Time: ${time} | Total Students: ${totalStudents} | Total Present: ${totalPresent} | Total Absent: ${totalAbsent} | Total Leave: ${totalLeave}`;

    // Append the attendance summary paragraph to the parent element of the submit button
    button.parentNode.appendChild(attendanceSummaryParagraph);
  });
});

// Add event listener to the save notes button
const notesTextarea = document.getElementById('notes-textarea');
const saveNotesBtn = document.getElementById('save-notes-btn');
const notesDisplay = document.getElementById('notes-display');
saveNotesBtn.addEventListener('click', () => {
  // Get the notes text
  const notesText = notesTextarea.value;

  // Display the notes
  notesDisplay.innerText = notesText;

  // Clear the textarea
  notesTextarea.value = '';
});