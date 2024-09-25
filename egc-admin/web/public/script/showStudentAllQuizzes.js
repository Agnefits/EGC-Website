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
          option.value = course.id;
          option.textContent = course.name;
          coursesFilter.appendChild(option);
        });

        // Add event listener to fetch materials and quizzes when a course is selected
        coursesFilter.addEventListener('change', () => {
          const selectedCourseId = coursesFilter.value;
          if (selectedCourseId) {
            fetchQuizzesForCourse(selectedCourseId);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
      });
}

// Fetch quizzes for the selected course
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
        quizContainer.innerHTML = ''; // Clear previous quizzes
        data.forEach(quiz => {
          const quizHTML = `
            <div class="student-quiz-container">
              <div class="student-quiz-title">
                <img src="/img/quiz.png" alt="Quiz icon">
                <div class="student-quiz-title-details">
                  <div class="student-quiz-name">${quiz.title}</div>
                  <div class="student-quiz-date">Publication date: ${quiz.date}</div>
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
              <button class="btn-preview-quiz">Preview Quiz</button>
            </div>
          `;
          quizContainer.innerHTML += quizHTML;
        });
      })
      .catch(error => console.error('Error fetching quizzes:', error));
}

