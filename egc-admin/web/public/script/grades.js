document.addEventListener("DOMContentLoaded", () => {
    const courseData = JSON.parse(localStorage.getItem('courseData'));
    if (courseData) {
        document.getElementById('name_c').innerText = courseData.name;
        document.getElementById("log").src = courseData.photo ? "/courses/photo/" + courseData.id : "/img/img-course.png";
    } else {
        alert('Course ID is missing');
        window.location.href = '/staff/ShowCourses';
    }

   

    // Load students when the page loads
    loadStudents();

    // Add event listeners for dropdowns
    document.getElementById("filter").addEventListener("change", loadStudents);
});















document.addEventListener('DOMContentLoaded', function() {
    const courseData = JSON.parse(localStorage.getItem('courseData'));
    const courseId = courseData.id;
    
    

    // Function to load grades when the page loads
    async function loadGrades() {
        try {
            const response = await fetch(`/get-grades/${courseId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const grades = await response.json();
            const gradesTableBody = document.getElementById('gradesTableBody');

            // Clear current rows
            gradesTableBody.innerHTML = '';

            // Check if there are any grades to display
            if (grades.length > 0) {
                // Populate the table with data
                grades.forEach((grade) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <input type="hidden" value="${grade.studentId}" class="student-id" readonly>
                        <td><input type="text" value="${grade.studentName}" class="student-name" readonly></td>
                        <td><input type="number" value="${grade.practicalDegree}" class="practical-degree"></td>
                        <td><input type="number" value="${grade.midtermDegree}" class="midterm-degree"></td>
                        <td><input type="number" value="${grade.finalExamDegree}" class="final-exam-degree"></td>
                        <td><input type="number" value="${grade.lectureAttendance}" class="lecture-attendance" readonly></td>
                        <td><input type="number" value="${grade.sectionAttendance}" class="section-attendance" readonly></td>
                    `;
                    gradesTableBody.appendChild(row);
                });

                // Show the update button since there's data
                updateButton.style.display = 'block';
            } else {
                // Hide the update button if no data
                updateButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading grades:', error);
        }
    }

    // Function to update grades on the server
    async function updateGrades() {
        const updatedGrades = [];
        const rows = document.querySelectorAll('#gradesTableBody tr');

        rows.forEach((row) => {
            const updatedGrade = {
                student_id: row.querySelector('.student-id').value,
                courseId: courseId,
                practicalDegree: row.querySelector('.practical-degree').value,
                midtermDegree: row.querySelector('.midterm-degree').value,
                finalExamDegree: row.querySelector('.final-exam-degree').value
            };
            updatedGrades.push(updatedGrade);
        });

        try {
            const response = await fetch('/update-grades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedGrades)
            });

            if (response.ok) {
                alert('Grades updated successfully!');
            } else {
                alert('Failed to update grades.');
            }
        } catch (error) {
            console.error('Error updating grades:', error);
        }
    }

    // Create and configure the "Update" button
    let updateButton = document.getElementById('updateButton');
    if (!updateButton) {
        updateButton = document.createElement('button');
        updateButton.id = 'updateButton';
        updateButton.textContent = 'Update';
        document.body.appendChild(updateButton);
    }
    updateButton.style.display = 'none'; // Initially hide the button

    // Attach the event listener to update grades
    updateButton.addEventListener('click', updateGrades);

    // Load grades on page load
    loadGrades();
});
