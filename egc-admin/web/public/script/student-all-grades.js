document.addEventListener('DOMContentLoaded', () => {
    const studentId = JSON.parse(localStorage.getItem("userData"))["id"]; // Replace with the actual student_id (can be dynamic)

    // Fetch student grades from Dart server
    fetch(`/student/get-student-grades/${studentId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayGrades(data);
        })
        .catch(error => {
            console.error('Error fetching grades:', error);
        });
});

// Function to display the grades in the table
function displayGrades(grades) {
    const tableBody = document.querySelector('table tbody');

    // Loop through each course and display its grades
    grades.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Course ID: ${grade.course_id}</td>
            <td>Final Exam: ${grade.finalExamDegree}</td>
            <td>Midterm: ${grade.midtermDegree}</td>
            <td>Practical: ${grade.practicalDegree}</td>
            <td>Attendance: ${grade.sectionAttendance + grade.lectureAttendance}</td>
        `;
        tableBody.appendChild(row);
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