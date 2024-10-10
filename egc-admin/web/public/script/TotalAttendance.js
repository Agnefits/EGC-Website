
document.addEventListener('DOMContentLoaded', async () => {
    loadAttendance();
    try {
        const response = await fetch('/courses');
        const courses = await response.json();

        const courseSelect = document.getElementById('course');

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.courseId;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
    }

    document.getElementById('department').addEventListener('change', loadAttendance);
    document.getElementById('yearlevel').addEventListener('change', loadAttendance);
    document.getElementById('n_section').addEventListener('change', loadAttendance);
    document.getElementById('course').addEventListener('change', loadAttendance);

    document.querySelector('th.sortable').addEventListener('click', () => {
    sortTableByName();
    });
});

document.addEventListener('DOMContentLoaded', loadAttendance);

async function loadAttendance() {

    try {

        const response = await fetch(`/TotalAttendance`);
        if (!response.ok) {
            throw new Error('Failed to fetch attendance data');
        }

        const attendanceData = await response.json();
        console.log('Fetched attendance data:', attendanceData);

        
        const department = document.getElementById('department').value;
        const yearLevel = document.getElementById('yearlevel').value;
        const section = document.getElementById('n_section').value;
        const courseId = document.getElementById('course').value;

        const studentsTableBody = document.getElementById('TableBody');
        if (!studentsTableBody) {
            throw new Error('Table body element not found');
        }

        studentsTableBody.innerHTML = ''; 

        const filteredStudents = attendanceData.filter(record => {
            return (!department || record.department === department) &&
                (!yearLevel || record.yearLevel === yearLevel) &&
                (!courseId || course.courseId === courseId) &&
                (!section || record.section == section);
        });

        filteredStudents.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.studentName || 'N/A'}</td>
                <td>${record.department || 'N/A'}</td>
                <td>${record.yearLevel || 'N/A'}</td>
                <td>${record.courseName || 'N/A'}</td>
                <td>${record.section || 'N/A'}</td>
                <td>${record.presenceTotal || 'N/A'}</td>
                <td>${record.absenceTotal || 'N/A'}</td>
                <td>${record.percentage + ' % '|| 'N/A'}</td>
            `;
            studentsTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading attendance data');
    }
}

function sortTableByName() {
    const table = document.querySelector('.table');
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const isAscending = table.dataset.sortDirection === 'asc';
    table.dataset.sortDirection = isAscending ? 'desc' : 'asc';

    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[0].textContent.trim(); 
        const cellB = rowB.children[0].textContent.trim();

        if (cellA > cellB) return isAscending ? 1 : -1;
        if (cellA < cellB) return isAscending ? -1 : 1;
        return 0;
    });

    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row));
}