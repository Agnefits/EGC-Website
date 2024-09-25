document.addEventListener("DOMContentLoaded", function() {
    populateAttendanceTable();
    populateClasses();
    showStudentsList();
});

function populateAttendanceTable() {
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    const attendanceSummary = document.getElementById('attendanceSummary');

    let students = {};

    attendanceData.forEach(record => {
        if (!students[record.name]) {
            students[record.name] = {
                total: 0,
                present: 0,
                absent: 0,
                leave: 0,
                department: record.department || 'N/A',
                class: record.class || 'N/A',
                rollNumber: record.rollNumber || 'N/A'
            };
        }

        students[record.name].total += 1;
        students[record.name][record.status] = (students[record.name][record.status] || 0) + 1;
    });

    Object.keys(students).forEach(studentName => {
        const student = students[studentName];
        const percentage = ((student.present / student.total) * 100).toFixed(2);

        const row = document.createElement('tr');
        row.classList.add('attendance-row');
        row.innerHTML = `
            <td>${student.rollNumber}</td>
            <td>${studentName}</td>
            <td>${student.department}</td>
            <td>${student.class}</td>
            <td>${student.present}</td>
            <td>${student.absent}</td>
            <td>${student.leave}</td>
            <td>${percentage}%</td>`
            //<td class="edit"><a href="/staff/AddStudentAttendance" class="edit-button">Edit</a></td>

        ;
        attendanceTableBody.appendChild(row);
    });

    const totalStudents = Object.keys(students).length;
    const totalPresent = attendanceData.filter(record => record.status === 'present').length;
    const totalAbsent = attendanceData.filter(record => record.status === 'absent').length;
    const totalLeave = attendanceData.filter(record => record.status === 'leave').length;

    attendanceSummary.innerHTML = `
        <h3 class="summary-title">Attendance Summary</h3>
        <p>Total Students: ${totalStudents}</p>
        <p>Total Present: ${totalPresent}</p>
        <p>Total Absent: ${totalAbsent}</p>
        <p>Total Late: ${totalLeave}</p>
    `;
}
console.log(localStorage.getItem('attendanceData'));


document.querySelectorAll('th i.bx').forEach((icon, index) => {
    icon.addEventListener('click', () => {
        const table = icon.closest('table');
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const sortOrder = icon.classList.contains('sort-asc') ? 'desc' : 'asc';

        rows.sort((a, b) => {
            const aText = a.cells[index].innerText;
            const bText = b.cells[index].innerText;
            return sortOrder === 'asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
        });

        rows.forEach(row => table.querySelector('tbody').appendChild(row));

        document.querySelectorAll('th i.bx').forEach(icon => icon.classList.remove('sort-asc', 'sort-desc'));
        icon.classList.add(`sort-${sortOrder}`);
    });
});