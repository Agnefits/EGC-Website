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

        //const teachingTableBody = document.getElementById("cards-container");
        const teachingTableBody = document.querySelector(".staff");
        if (!teachingTableBody) {
            throw new Error("Table body element not found");
        }

        teachingTableBody.innerHTML = ""; // Clear the table before adding new rows



        teaching.forEach((teacher) => {
                    // const row = document.createElement("tr");
                    const teachDiv = document.createElement("div");
                     teachDiv.classList.add("column");
                     teachDiv.innerHTML = `
       
 <img class="im" src="${
    teacher.photo ? `/staffImage/${teacher.email}` : "/img/images (2).png"
        }" alt="${teacher.name}">
        <div class="icon2">
          <a href="mailto:${teacher.email}">
          <img class="img" src="/img/email1.png" alt="Email Icon">
           <p>${teacher.email}</p>
          </a>
        </div>
        <h3>${teacher.name}</h3>
        <p>${teacher.major}</p>

              `;
      teachingTableBody.appendChild(teachDiv);
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








