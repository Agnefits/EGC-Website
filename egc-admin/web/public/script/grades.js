
document.addEventListener('DOMContentLoaded', function() {

    const courseId = 123;  // تأكد من أنك استبدلت 123 بالقيمة الصحيحة لـ courseId الخاص بك.

    // تحميل الدرجات عند تحميل الصفحة
    async function loadGrades() {
        try {
            const response = await fetch('/get-grades');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const grades = await response.json();
            console.log(grades);
            const gradesTableBody = document.getElementById('gradesTableBody');

            // تفريغ الصفوف الحالية
            gradesTableBody.innerHTML = '';

            // تعبئة الجدول بالبيانات
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

            // عرض زر "التحديث" إذا كانت هناك درجات
            if (grades.length > 0) {
                let updateButton = document.getElementById('updateButton');
                if (!updateButton) {
                    updateButton = document.createElement('button');
                    updateButton.id = 'updateButton';
                    updateButton.textContent = 'Update';
                    document.body.appendChild(updateButton);
                }

                updateButton.addEventListener('click', async function() {
                    await updateGrades(grades, courseId);  // تمرير courseId هنا
                });
            }
        } catch (error) {
            console.error('Error loading grades:', error);
        }
    }

    // دالة تحديث الدرجات
    async function updateGrades(grades, courseId) {
        const updatedGrades = [];
        const rows = document.querySelectorAll('#gradesTableBody tr');

        rows.forEach((row, index) => {
            const updatedGrade = {
                id: row.querySelector('.student-id').value,
                courseId: courseId,  // استخدام courseId مباشرة
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

    // استدعاء الدالة لتحميل الدرجات عند تحميل الصفحة
    loadGrades();
});

