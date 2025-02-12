document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    document.getElementById('department').addEventListener('change', loadStudents);
    document.getElementById('yearlevel').addEventListener('change', loadStudents);
    document.getElementById('n_section').addEventListener('change', loadStudents);
    document.querySelector('th.sortable').addEventListener('click', sortTableByName);
    document.getElementById('show-all-grades').addEventListener('change', handleShowAllChange);
    document.getElementById('hide-all-grades').addEventListener('change', handleHideAllChange);
});

async function loadStudents() {
    try {
        const response = await fetch('/students');
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json(); 
        const studentsTableBody = document.getElementById('studentsTableBody');
        studentsTableBody.innerHTML = '';
        studentsTableBody.innerHTML = ''; // Clear the table before adding new rows

        // Get values from dropdowns
        const department = document.getElementById('department').value;
        const yearLevel = document.getElementById('yearlevel').value;
        const section = document.getElementById('n_section').value;

        // Filter students based on selections
        const filteredStudents = students.filter(student => {
            return (!department || student.department === department) &&
                (!yearLevel || student.year_level === yearLevel) &&
                (!section || student.No_section == section);
        });

        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name || 'N/A'}</td>
                <td>${student.department || 'N/A'}</td>
                <td>${student.year_level || 'N/A'}</td>
                <td>${student.No_section || 'N/A'}</td>
                <td>${student.total_grade || '0'}</td>
                <td>
                    <input type="checkbox" class="grade-checkbox show-grade" data-id="${student.id}" ${student.showDegrees === 'show' ? 'checked' : ''}>
                    Show Grade
                    <input type="checkbox" class="grade-checkbox hide-grade" data-id="${student.id}" ${student.showDegrees === 'hide' ? 'checked' : ''}> 
                    Hide Grade
                </td>
                <td>
                    <button class="details-btn show-details" data-id="${student.id}" onclick="window.location.href='/admin/AdminStudentGrades?studentId=${student.id}'">
                        Show Grades
                    </button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });

        document.querySelectorAll('.grade-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading students');
    }
}

async function updateStudentDegreeVisibility(id, showDegrees) {
    try {
        const response = await fetch(`/update-student-degree-visibility/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ showDegrees: showDegrees ? 'show' : 'hide' })
        });

        if (!response.ok) {
            throw new Error('Failed to update degree visibility');
        }
        console.log('Degree visibility updated in the database');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateAllStudentsVisibility(showDegrees) {
    try {
        const students = await fetch('/students');
        const studentsList = await students.json();
        const updates = studentsList.map(student => {
            return updateStudentDegreeVisibility(student.id, showDegrees);
        });
        await Promise.all(updates);
        console.log('All students visibility updated in the database');
    } catch (error) {
        console.error('Error updating all students visibility:', error);
    }
}

function handleCheckboxChange(event) {
    const clickedCheckbox = event.target;
    const id = clickedCheckbox.dataset.id;
    const isShowGrade = clickedCheckbox.classList.contains('show-grade');

    // تحديث حالة الرؤية في قاعدة البيانات
    updateStudentDegreeVisibility(id, isShowGrade);

    // قم بإلغاء تحديد صندوق الاختيار الآخر
    document.querySelectorAll(`input[data-id="${id}"]`).forEach(checkbox => {
        if (checkbox !== clickedCheckbox) {
            checkbox.checked = false;
        }
    });
}

function handleShowAllChange(event) {
    const isChecked = event.target.checked;
    document.getElementById('hide-all-grades').checked = false;

    document.querySelectorAll('.show-grade').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    document.querySelectorAll('.hide-grade').forEach(checkbox => {
        checkbox.checked = false;
    });

    // تحديث حالة جميع الطلاب في قاعدة البيانات
    updateAllStudentsVisibility(true);
}

function handleHideAllChange(event) {
    const isChecked = event.target.checked;
    document.getElementById('show-all-grades').checked = false;

    document.querySelectorAll('.hide-grade').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    document.querySelectorAll('.show-grade').forEach(checkbox => {
        checkbox.checked = false;
    });

    // تحديث حالة جميع الطلاب في قاعدة البيانات
    updateAllStudentsVisibility(false);
}

function sortTableByName() {
    const table = document.querySelector('.students-table');
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const isAscending = table.dataset.sortDirection === 'asc';
    table.dataset.sortDirection = isAscending ? 'desc' : 'asc';

    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[0].textContent.trim();
        const cellB = rowB.children[0].textContent.trim();

        return cellA.localeCompare(cellB) * (isAscending ? 1 : -1);
    });

    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row));
}

