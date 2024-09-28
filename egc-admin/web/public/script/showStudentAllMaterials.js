const storedUserData = localStorage.getItem('userData');

if (storedUserData) {
    const userData = JSON.parse(storedUserData);
    const studentId = userData.id;

    // Fetch courses for the student
    fetchCoursesForStudent(studentId);
} else {
    console.error('No user data found in localStorage');
}

// Fetch courses for the student
function fetchCoursesForStudent(studentId) {
  fetch(`/student/courses/${studentId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(courses => {
      const coursesFilter = document.getElementById('CoursesFilter');
      courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id; // Assuming courseId corresponds to the course
        option.textContent = course.name;
        coursesFilter.appendChild(option);
      });

      // Add event listener to fetch materials when a course is selected
      coursesFilter.addEventListener('change', () => {
        const selectedCourseId = coursesFilter.value;
        if (selectedCourseId === "all") {
            // If "All" is selected, fetch all materials
            fetchMaterialsForAllCourses();
        } else {
            fetchMaterialsForCourse(selectedCourseId); // Fetch materials for the selected course
        }
      });
    })
    .catch(error => {
      console.error('Error fetching courses:', error);
    });
}

// Fetch materials based on the selected course
function fetchMaterialsForCourse(courseId) {
    fetch(`/courses-materials/${courseId}`) // Update the endpoint as necessary
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const materialContainer = document.querySelector('.content'); // Adjust class if necessary
        materialContainer.innerHTML = ''; // Clear previous materials

        data.forEach(material => {
          const materialHTML = `
            <div class="material-container">
              <div class="material-title">
                <img src="/img/material_icon.png" alt="Material icon">
                <div class="material-title-details">
                  <div class="material-name">${material.saveAs}</div>
                  <div class="material-date">Publication Date: ${material.date}</div>
                </div>
              </div>
              <div class="material-details">
                <div class="student-quiz-dead-line">
                  <p>Note: ${material.note}</p>
                </div>
                <div class="student-quiz-dead-line">
                  <p>Instructor: ${material.instructor}</p>
                </div>
              </div>
              <button class="btn-preview-quiz" onclick="location.href='/download/${material.filename}'">Download Material</button>
            </div>
          `;
          materialContainer.innerHTML += materialHTML;
        });
      })
      .catch(error => {
        console.error('Error fetching materials:', error);
      });
}


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

const logout = document.getElementById("log_out");
logout.addEventListener("click", () => {
    localStorage.clear("userData");
    location.href = "/home";
});


var userData = JSON.parse(localStorage.getItem("userData"));
if (userData) {
    document.getElementsByClassName("profile")[0].getElementsByClassName("name")[0].innerText = userData.name;
    document.getElementsByClassName("profile")[0].getElementsByClassName("email")[0].innerText = userData.email;
    if (userData.photo) {
        document.querySelector(".profile-details img").src = (userData.role == "Student") + '/photo/' + userData.id;
    }
}


function fetchMaterialsForAllCourses() {
  fetch('/materials') // جلب جميع المواد
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const materialContainer = document.querySelector('.content');
      materialContainer.innerHTML = ''; // مسح المواد السابقة

      data.forEach(material => {
        const materialHTML = `
          <div class="material-container">
            <div class="material-title">
              <img src="/img/material_icon.png" alt="Material icon">
              <div class="material-title-details">
                <div class="material-name">${material.saveAs}</div>
                <div class="material-date">Publication Date: ${material.date}</div>
              </div>
            </div>
            <div class="material-details">
              <div class="student-quiz-dead-line">
                <p>Note: ${material.note}</p>
              </div>
              <div class="student-quiz-dead-line">
                <p>Instructor: ${material.instructor}</p>
              </div>
            </div>
            <button class="btn-preview-quiz" onclick="location.href='/download/${material.filename}'">Download Material</button>
          </div>
        `;
        materialContainer.innerHTML += materialHTML;
      });
    })
    .catch(error => {
      console.error('Error fetching materials:', error);
    });
}
