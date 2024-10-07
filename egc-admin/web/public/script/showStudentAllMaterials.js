const storedUserData = localStorage.getItem('userData');

if (storedUserData) {
    const userData = JSON.parse(storedUserData);
    const studentId = userData.id;

    fetchCoursesForStudent(studentId);
    fetchMaterialsForAllCourses(studentId);
} else {
    console.error('No user data found in localStorage');
}


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
        option.value = course.id; 
        option.textContent = course.name;
        coursesFilter.appendChild(option);
      });


      coursesFilter.addEventListener('change', () => {
        const selectedCourseId = coursesFilter.value;
        if (selectedCourseId === "all") {
            fetchMaterialsForAllCourses(studentId);
        } else {
            fetchMaterialsForCourse(selectedCourseId); 
        }
      });
    })
    .catch(error => {
      console.error('Error fetching courses:', error);
    });
}


function fetchMaterialsForCourse(courseId) {
    fetch(`/courses-materials/${courseId}`) 
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const materialContainer = document.querySelector('.content'); 
        materialContainer.innerHTML = ''; 

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


function fetchMaterialsForAllCourses(studentId) {
  fetch(`/materials/${studentId}`) 
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const materialContainer = document.querySelector('.content');
      materialContainer.innerHTML = ''; 

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
