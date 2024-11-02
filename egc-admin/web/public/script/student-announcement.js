const storedUserData = localStorage.getItem('userData');

if (storedUserData) {
    const userData = JSON.parse(storedUserData);
    const studentId = userData.id;

    fetchCoursesForStudent(studentId);
    fetchAnnouncementsForAllCourses(studentId);
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
                    fetchAnnouncementsForAllCourses(studentId);
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
    fetch(`/courses/announcements/${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
                const messagesContainer = document.querySelector('.content');
                messagesContainer.innerHTML = '';

                data.forEach(announcement => {
                            const announcementDiv = document.createElement('div');
                            announcementDiv.classList.add('announcement'); // Optional: Add a class for styling

                            // Create content for the announcement
                            announcementDiv.innerHTML = `
<strong>Sender: ${announcement.instructor}</strong>
<p><strong>Description:</strong> ${announcement.description}</p>
${announcement.file ? `<p><strong>File:</strong> <a href="/courses/announcements/file/${announcement.id}" target="_blank">Download File (${announcement.filename})</a></p>` : ''}
<p><strong>Date:</strong> ${new Date(announcement.date).toLocaleString()}</p>
`;

                messagesContainer.appendChild(announcementDiv);
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


function fetchAnnouncementsForAllCourses(studentId) {
    fetch(`/student/courses-announcements/${studentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const messagesContainer = document.querySelector('.content');
            messagesContainer.innerHTML = '';

            data.forEach(announcement => {
                const announcementDiv = document.createElement('div');
                announcementDiv.classList.add('announcement'); // Optional: Add a class for styling

                // Create content for the announcement
                announcementDiv.innerHTML = `
<strong>Sender: ${announcement.instructor }</strong>
<p><strong>Description:</strong> ${announcement.description}</p>
${announcement.file ? `<p><strong>File:</strong> <a href="/courses/announcements/file/${announcement.id}" target="_blank">Download File (${announcement.filename})</a></p>` : ''}
<p><strong>Date:</strong> ${new Date(announcement.date).toLocaleString()}</p>
`;

                messagesContainer.appendChild(announcementDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching assignments:', error);
        });
}