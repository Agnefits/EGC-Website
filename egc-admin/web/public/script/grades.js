document.addEventListener('DOMContentLoaded', function() {

    async function loadGrades() {
        try {
            const response = await fetch('/get-grades');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const grades = await response.json();
            console.log(grades);
            const gradesTableBody = document.getElementById('gradesTableBody');

            // Clear existing rows
            gradesTableBody.innerHTML = '';

            // Populate table with data
            grades.forEach((grade, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <input type="hidden" value="${grade.id || 'N/A'}" class="student-id" readonly>
                    <td><input type="text" value="${grade.studentName || 'N/A'}" class="student-name" readonly></td>
                    <td><input type="number" value="${grade.practicalDegree || 0}" class="practical-degree"></td>
                    <td><input type="number" value="${grade.midtermDegree || 0}" class="midterm-degree"></td>
                    <td><input type="number" value="${grade.finalExamDegree || 0}" class="final-exam-degree"></td>
                    <td><input type="number" value="${grade.lectureAttendance || 0}" class="lecture-attendance" readonly></td>
                    <td><input type="number" value="${grade.sectionAttendance || 0}" class="section-attendance" readonly></td>
                `;
                gradesTableBody.appendChild(row);
            });

            // Display the "Update" button if grades are available
            if (grades.length > 0) {
                let updateButton = document.getElementById('updateButton');
                if (!updateButton) {
                    updateButton = document.createElement('button');
                    updateButton.id = 'updateButton';
                    updateButton.textContent = 'Update';
                    document.body.appendChild(updateButton);
                }

                updateButton.addEventListener('click', async function() {
                    await updateGrades(grades);
                });
            }
        } catch (error) {
            console.error('Error loading grades:', error);
        }
    }

    // Function to update grades
    async function updateGrades(grades) {
        const updatedGrades = [];
        const rows = document.querySelectorAll('#gradesTableBody tr');

        rows.forEach((row, index) => {
            const updatedGrade = {
                id: row.querySelector('.student-id').value,
                courseId: document.getElementById('CoursesFilter').value,
                studentName: grades[index].studentName,
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

    // Load grades on page load
    loadGrades();
    loadCourses();
});





async function loadCourses() {
    const doctorData = JSON.parse(localStorage.getItem('userData'));
    fetch(`/doctor/courses/${doctorData.id}`)
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
                option.value = course.id; // Assuming course.id corresponds to the course
                option.textContent = course.name;
                // تخزين معلومات القسم والسنة لكل كورس في data attributes
                option.setAttribute('data-year', course.year);
                option.setAttribute('data-department', course.department);
                coursesFilter.appendChild(option);
            });

            // إضافة مستمع عند اختيار الكورس
            coursesFilter.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
                const selectedYear = selectedOption.getAttribute('data-year');
                const selectedDepartment = selectedOption.getAttribute('data-department');

                const selectedCourseId = selectedOption.value; // الحصول على ID الكورس المحدد

                console.log('Selected Year:', selectedYear);
                console.log('Selected Department:', selectedDepartment);
                console.log('Selected Course ID:', selectedCourseId);

                // هنا يتم استدعاء الكود الجديد باستخدام السنة والقسم وcourseId
                insertStudentDegreesByYearAndDepartment(selectedYear, selectedDepartment, selectedCourseId);
            });
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
        });
}

// الدالة التي تقوم بإدراج الدرجات بصفر بناءً على السنة والقسم
function insertStudentDegreesByYearAndDepartment(year, department, courseId) {
    console.log('Selected Year:', year);
    console.log('Selected Department:', department);
    console.log('Selected Course ID:', courseId);

    // استدعاء API لإدراج البيانات في الجدول
    fetch('/insertStudentDegrees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ year: year, department: department, courseId: courseId }), // إضافة courseId هنا
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data inserted successfully:', data);
        })
        .catch(error => {
            console.error('Error inserting data:', error);
        });
}