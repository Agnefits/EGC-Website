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
      listItemElement.textContent = studentName;
      studentsList.appendChild(listItemElement);
    });
  }
}

// Add event listeners to the department and class select elements to call the generateClassOptions and generateStudentList functions when the value changes
departmentSelect.addEventListener('change', generateClassOptions);
classSelect.addEventListener('change', generateStudentList);

// Call the generateClassOptions function initially to generate the class options based on the default department
generateClassOptions();

// Call the generateStudentList function initially to generate the student list based on the default department and class
generateStudentList();


const now = new Date();
const date = now.toLocaleDateString();
const time = now.toLocaleTimeString();

// Create a paragraph element containing the attendance summary information
const attendanceSummaryParagraph = document.getElementById('Summaryatt');
attendanceSummaryParagraph.innerHTML = `Date: ${date} | Time: ${time} | Total Students: 2 | Total Present: 1 | Total Absent: 1 | Total Leave: 0`;
