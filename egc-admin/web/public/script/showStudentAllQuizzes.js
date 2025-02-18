
const storedUserData = localStorage.getItem('userData');

if (storedUserData) {
    const userData = JSON.parse(storedUserData);
    const studentId = userData.id;

    fetchCoursesForStudent(studentId);
    fetchQuizzesForAllCourses(studentId);
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
            fetchQuizzesForAllCourses(studentId);
        } else {
            fetchQuizzesForCourse(selectedCourseId); 
        }
      });
    })
    .catch(error => {
      console.error('Error fetching courses:', error);
    });
}



function fetchQuizzesForCourse(courseId) {
      fetch(`/courses-quizzes/${courseId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const quizContainer = document.querySelector('.content');
          quizContainer.innerHTML = ''; 
          data.forEach(quiz => {
            const quizHTML = `
              <div class="student-quiz-container">
    <div class="student-quiz-title">
      <img src="/img/quiz.png" alt="Quiz icon">
      <div class="student-quiz-title-details">
        <div class="student-quiz-name">${quiz.title}</div>
        <div class="student-quiz-date">Publication Date : ${quiz.date}</div>
      </div>
    </div>
    <div class="student-quiz-details">
      <div class="student-quiz-dead-line">
        <p>Deadline: ${quiz.deadline}</p>
      </div>
      <div class="student-quiz-instructor">
        <p>Instructor: ${quiz.instructor}</p>
      </div>
    </div>
    <button class="btn-preview-quiz" onclick="location.href='/student/Quiz.html?quizId=${quiz.id}'">Preview Quiz</button>
  </div>
            `;
            quizContainer.innerHTML += quizHTML;
          });
        })
        .catch(error => console.error('Error fetching quizzes:', error));
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


function fetchQuizzesForAllCourses(studentId) {
  fetch(`/quizzes/${studentId}`) 
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const quizContainer = document.querySelector('.content');
      quizContainer.innerHTML = ''; 
      data.forEach(quiz => {
        const quizHTML = `
          <div class="student-quiz-container">
            <div class="student-quiz-title">
              <img src="/img/quiz.png" alt="Quiz icon">
              <div class="student-quiz-title-details">
                <div class="student-quiz-name">${quiz.title}</div>
                <div class="student-quiz-date">Publication Date : ${quiz.date}</div>
              </div>
            </div>
            <div class="student-quiz-details">
              <div class="student-quiz-dead-line">
<p>Deadline: ${quiz.deadline.replace("T", " ")}</p>
              </div>
              <div class="student-quiz-instructor">
                <p>Instructor: ${quiz.instructor}</p>
              </div>
            </div>
    <button class="btn-preview-quiz" onclick="location.href='/student/Quiz.html?quizId=${quiz.id}'">Preview Quiz</button>
          </div>
        `;
        quizContainer.innerHTML += quizHTML;
      });
    })
    .catch(error => console.error('Error fetching quizzes:', error));
}
