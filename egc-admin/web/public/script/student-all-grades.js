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