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
        tableBody.innerHTML += `
                <tr>
                  <td> ${grade.name}</td>
                  </tr>
                  <tr>
                <td>finalExamDegree</td>
                  <td> ${grade.finalExamDegree}</td>
                  <td>--</td>
                  <td>-- </td>
                  <td> --</td>
                  </tr>

                  <tr>
                  <td> midtermDegree</td>
<td> ${grade.midtermDegree}</td>
  <td>--</td>
 <td>-- </td>
<td> --</td>
</tr>


<tr>
<td> practicalDegree</td>
<td> ${grade.practicalDegree}</td>
  <td>--</td>
    <td>-- </td>
     <td> --</td>
     </tr>
     
<tr>
<td>Total Attendance</td>
<td> ${grade.sectionAttendance + grade.lectureAttendance}</td>
  <td>--</td>
 <td>-- </td>
<td> --</td> 
</tr>
                
                <tr>
                    <td>Report</td>
                    <td>40.00</td>
                    <td>39.00</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Attendance</td>
                    <td>10.00</td>
                    <td>10.00</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Midterm Exam</td>
                    <td>20.00</td>
                    <td>15.00</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Final Exam</td>
                    <td>30.00</td>
                    <td>29.00</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td><strong>Total</strong></td>
                    <td>100.00</td>
                    <td>93.00</td>
                    <td>93.00%</td>
                    <td>-</td>
                </tr>
           
        `;

        
        
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