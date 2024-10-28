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

        const studentsTableBody = document.getElementById("cards-container");
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
                    const row = document.createElement("tr");
                    row.innerHTML = `
      <div id="card">
        <img src="${student.photo? "/students/photo/" + student.id:`/img/pexels-photo-1438081.jpeg`}"  id="card-image">
        <div id="details">
            <h4 id="text_card">Name: ${student.name}</h4>
            <h4 id="text_card">Email: ${student.email}</h4>
            <h4 id="text_card">Year level: ${student.year_level} year</h4>
            <h4 id="text_card">Department: ${student.department}</h4>
            <h4 id="text_card"> Section: ${student.No_section}</h4>
        </div>
            `;
      studentsTableBody.appendChild(row);
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