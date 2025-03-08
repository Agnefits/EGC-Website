document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let studentId = urlParams.get('studentId'); // Try to get studentId from URL

    if (!studentId) { // If studentId is NOT in the URL
        const userDataString = localStorage.getItem('userData');
        if (userDataString) { // Check if userData exists in localStorage
            try {
                const userData = JSON.parse(userDataString);
                studentId = userData.id;
                console.log("Student ID from localStorage:", studentId);
            } catch (error) {
                console.error("Error parsing userData from localStorage:", error);
                // Handle the error, e.g., redirect to login or display a message
                return; // Stop further execution if localStorage is invalid
            }

        } else {
            console.error("userData not found in localStorage.");
            // Handle the error, e.g., redirect to login or display a message
            return; // Stop further execution if localStorage is missing
        }
    } else {
        console.log("Student ID from URL:", studentId);
    }
// Replace with the actual student_id (can be dynamic)

    // Fetch student grades from Dart server
    if (studentId) {
        fetch(`/student/get-student-grades/${studentId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                displayGrades(data);
            })
            .catch(error => {
                console.error('Error fetching grades:', error);
            });
    }
});

// Function to display the grades in the table
function displayGrades(grades) {
    const tableBody = document.querySelector('table tbody');
    const name = document.querySelector('h3');

    for (let i = 0; i < 1; i++) {
        const grade = grades[i];
        name.innerHTML += `${grade.student}`;
        if (i === 0) { // Stop after the third iteration
          break;
        }
      }
    // Loop through each course and display its grades
    grades.forEach(grade => {
        const finalExamDegree = parseFloat(grade.finalExamDegree);
        const midtermDegree = parseFloat(grade.midtermDegree);
        const practicalDegree = parseFloat(grade.practicalDegree);
        const sectionAttendance = parseFloat(grade.sectionAttendance);
        const lectureAttendance = parseFloat(grade.lectureAttendance);


        // const cfinal = parseFloat(grade.cfinal);
        // const midtermDegree = parseFloat(grade.midtermDegree);
        // const practicalDegree = parseFloat(grade.practicalDegree);
        // const sectionAttendance = parseFloat(grade.sectionAttendance);
        // const lectureAttendance = parseFloat(grade.lectureAttendance);

        const total = finalExamDegree + midtermDegree + practicalDegree + sectionAttendance + lectureAttendance;
        const ctotal = parseFloat(grade.cfinal) + parseFloat(grade.cmid) + parseFloat(grade.cpract) + parseFloat(grade.csec) + parseFloat(grade.clec);
        const totalatt = sectionAttendance + lectureAttendance;
        const ctotalatt =  parseFloat(grade.csec) + parseFloat(grade.clec);
        const totalperc = (parseFloat(total) / parseFloat(ctotal) * 100).toFixed(2) + '%';
        const attprec = (parseFloat(totalatt) / parseFloat(ctotalatt) * 100).toFixed(2) + '%';
        const lecprec = (parseFloat(lectureAttendance) / parseFloat(grade.clec) * 100).toFixed(2) + '%';
        const secprec = (parseFloat(sectionAttendance) / parseFloat(grade.csec) * 100).toFixed(2) + '%';
        const finalprec = (parseFloat(finalExamDegree) / parseFloat(grade.cfinal) * 100).toFixed(2) + '%';
        const midprec = (parseFloat(midtermDegree) / parseFloat(grade.cmid) * 100).toFixed(2) + '%';
        const pracprec = (parseFloat(practicalDegree) / parseFloat(grade.cpract) * 100).toFixed(2) + '%';



        tableBody.innerHTML += `
                <tr>
                  <td class="name" colspan="4"> ${grade.name}</td>
                  </tr>
                  <tr>
                <td class="td">Final Exam Degree</td>
                  <td class="td">${grade.finalExamDegree}</td>
                  <td class="td">${grade.cfinal}</td>
                  <td class="td">${finalprec} </td>
                  </tr>

                  <tr>
                  <td class="td">Midterm Degree</td>

  <td class="td">${grade.midtermDegree}</td>
  <td class="td">${grade.cmid}</td>
   <td class="td">${midprec}</td>
</tr>


<tr>
<td class="td">Practical Degree</td>
  <td class="td"> ${grade.practicalDegree}</td>
  <td class="td"> ${grade.cpract}</td>
      <td class="td"> ${pracprec}</td>
     </tr>
     
<tr>
<td class="td">Lecture Attendance</td>
  <td class="td"> ${grade.lectureAttendance}</td>
  <td class="td"> ${grade.clec}</td>
    <td class="td"> ${lecprec}</td>
     </tr>

<tr>
<td class="td">Section Attendance</td>
  <td class="td"> ${grade.sectionAttendance}</td>
  <td class="td"> ${grade.csec}</td>
     <td class="td"> ${secprec}</td>
     </tr>


     
<tr>
<td class="td">Total Attendance</td>
  <td class="td">${totalatt}</td>
  <td class="td">${ctotalatt}</td>
 <td class="td">${attprec}</td>
</tr>

<tr>
<td class="td">Total</td>
  <td class="td">${total}</td>
  <td class="td">${ctotal}</td>
 <td class="td">${totalperc} </td>
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