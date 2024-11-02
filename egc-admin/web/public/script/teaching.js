document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem('userData');
    const parsedData = JSON.parse(userData); // Parse the JSON string
    const role = parsedData.role; // Get the role
    const btnAddCourse = document.getElementById('btn_join'); // Adjust selector as needed
    if (role === 'Doctor') {
        btnAddCourse.style.display = 'block'; // Show button
    } else {
        btnAddCourse.style.display = 'None'; // Hide button for other roles
        btnAddCourse.parentElement.appendChild(document.createElement("p"));
    }

    const courseData = JSON.parse(localStorage.getItem('courseData'));
    if (courseData) {
        document.getElementById('course').innerText = courseData.name;
        document.getElementById("imgnav").src = courseData.photo ? "/courses/photo/" + courseData.id : "/img/img-course.png";
    } else {
        alert('Course ID is missing');
        window.location.href = '/staff/ShowCourses';
    }

    // Load students when the page loads
    loadTeachingAssistant();
});



async function loadTeachingAssistant() {
    try {
        const courseData = JSON.parse(localStorage.getItem("courseData"));

        const response = await fetch("/course-teaching-assistants/" + courseData.id);
        if (!response.ok) {
            throw new Error("Failed to fetch teaching ");
        }

        const teaching = await response.json();
        console.log("Fetched teaching", teaching); // For debugging

        const teachingTableBody = document.getElementById("cards-container");
        if (!teachingTableBody) {
            throw new Error("Table body element not found");
        }

        teachingTableBody.innerHTML = ""; // Clear the table before adding new rows



        teaching.forEach((teacher) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
        <div id="card">
          <img src="${teacher.photo? "/teaching-assistants/photo/" + teacher.id:`/img/wallpaperflare.com_wallpaper (25).jpg`}"  id="card-image">
          <div id="details">
              <h4 id="text_card">Name: ${teacher.name}</h4>
              <h4 id="text_card">Email: ${teacher.email}</h4>
              <h4 id="text_card">Major : ${teacher.major}</h4>
          </div>
              `;
      teachingTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error:", error);
    alert("Error loading teacher");
  }
}

function goBackToCoursePage() {
    console.log('Go Back button clicked!'); // Debug log
    window.location.href = '/staff/Dashboard';
}