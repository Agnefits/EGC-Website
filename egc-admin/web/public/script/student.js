document.addEventListener("DOMContentLoaded", () => {
    const courseData = JSON.parse(localStorage.getItem('courseData'));
    if (courseData) {
        document.getElementById('course').innerText = courseData.name;
        document.getElementById("imgnav").src = courseData.photo ? "/courses/photo/" + courseData.id : "/img/img-course.png";
    } else {
        alert('Course ID is missing');
        window.location.href = '/staff/ShowCourses';
    }

    // Load students when the page loads
    loadStudents();

    // Add event listeners for dropdowns
    document.getElementById("filter").addEventListener("change", loadStudents);
});

async function loadStudents() {
    try {
        const response = await fetch("/students");
        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const students = await response.json();
        console.log("Fetched students:", students); // For debugging
        const studentsTableBody = document.querySelector(".staff");
        if (!studentsTableBody) {
            throw new Error("Table body element not found");
        }

        studentsTableBody.innerHTML = ""; // Clear the table before adding new rows

        // Get values from dropdowns

        const courseData = JSON.parse(localStorage.getItem("courseData"));

        const department = courseData.department;
        const yearLevel = courseData.year;
        const section = document.getElementById("filter").value;

        // Filter students based on selections
        const filteredStudents = students.filter((student) => {
            return (
                (!department || student.department === department) &&
                (!yearLevel || student.year_level === yearLevel) &&
                (!section || student.No_section == section)
            );
        });
        filteredStudents.forEach((student) => {
            const studentDiv = document.createElement("div");
            studentDiv.classList.add("column");
            studentDiv.innerHTML = `
<img class="im" src="${
    student.photo ? `/staffImage/${student.email}` : "/img/profile.png"
        }" alt="${student.name}">
        <div class="icon2">
          <a href="mailto:${student.email}">
           <img class="img" src="/img/email1.png" alt="Email Icon">
           <p>${student.email}</p>
          </a>
        </div>
        <h3>Name: ${student.name}</h3>
       <p>Year Level: ${student.year_level}</p>
        <p>Department: ${student.department}</p>
        <p>Section: ${student.No_section}</p>


            `;
      studentsTableBody.appendChild(studentDiv);
    });
  } catch (error) {
    console.error("Error:", error);
    alert("Error loading students");
  }
}

function goBackToCoursePage() {
  console.log('Go Back button clicked!'); // Debug log
  window.location.href = '/staff/Dashboard';
}