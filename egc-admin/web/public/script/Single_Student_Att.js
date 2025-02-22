document.getElementById('department').addEventListener('change', loadStudents);
document.getElementById('yearlevel').addEventListener('change', loadStudents);
document.getElementById('n_section').addEventListener('change', loadStudents);

async function loadStudents() {
    const department = document.getElementById('department').value;
    const yearLevel = document.getElementById('yearlevel').value;
    const section = document.getElementById('n_section').value;
    const course = document.getElementById('course').value;

    try {
        let response = await fetch(`/admin/courses/${department}/${yearLevel}`);

        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }

        const courses = await response.json();
        console.log('Fetched courses:', courses); // أضف هذا السطر للتحقق من البيانات

        const CourseSelect = document.getElementById('course');
        if (!CourseSelect) {
            throw new Error('Table body element not found');
        }
        CourseSelect.innerHTML = "<option value=''>Select Course</option>";

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id; // Assuming each section has a unique ID
            option.textContent = course.name; // Display section name
            CourseSelect.appendChild(option);
        });

        CourseSelect.value = course;

        response = await fetch('/students'); // Fetch all students
        if (!response.ok) throw new Error('Failed to fetch students');

        const students = await response.json();
        const sectionSelect = document.getElementById('n_section');
        const sections = [];
        sectionSelect.innerHTML = "<option value=''>Select Section</option>";
        students.forEach(element => {
            if (!sections.includes(element.No_section)) {
                sections.push(element.No_section);
                const option = document.createElement('option');
                option.value = element.No_section; // Assuming each section has a unique ID
                option.textContent = "Section " + element.No_section; // Display section name
                sectionSelect.appendChild(option);
            }
        });

        sectionSelect.value = section;

        const filteredStudents = students.filter(student => {
            return (!department || student.department === department) &&
                (!yearLevel || student.year_level === yearLevel) &&
                (!section || student.No_section == section);
        });

        const studentSelect = document.getElementById('name');
        studentSelect.innerHTML = "<option value=''>Select Student</option>";

        filteredStudents.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id; // Assuming each section has a unique ID
            option.textContent = element.name; // Display section name
            studentSelect.appendChild(option);
        });

        if (studentSelect.value) {
            let response = await fetch(`/students/${studentId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch student details');
            }

            const student = await response.json();
            console.log('Fetched student:', student); // For debugging

            const studentInfo = document.getElementById("student-info");
            studentInfo.innerHTML = `
            <h2>Student Name: ${student.name}</h2>
            <p>ID: ${student.id}</p>
            <p>Year: ${student.year} Year</p>
            <p>Section: ${student.section}</p>`

            response = await fetch(`/single-student-attendance/${studentSelect.value}`);

            if (!response.ok) {
                throw new Error('Failed to fetch attendance');
            }

            const attendance = await response.json();
            console.log('Fetched attendances:', attendance); // أضف هذا السطر للتحقق من البيانات

        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading students');
    }
}


async function showAttendance() {
    try {
        const studentSelect = document.getElementById('name');
        if (studentSelect.value) {
            let response = await fetch(`/students/${studentSelect.value}`);

            if (!response.ok) {
                throw new Error('Failed to fetch student details');
            }

            const student = await response.json();
            console.log('Fetched student:', student); // For debugging

            const studentInfo = document.getElementsByClassName("student-info")[0];
            studentInfo.innerHTML = `
            <h2>Student Name: ${student.name}</h2>
            <p>ID: ${student.id}</p>
            <p>Year: ${student.year_level} Year</p>
            <p>Section: ${student.No_section}</p>`

            response = await fetch(`/single-student-attendance/${studentSelect.value}`);

            if (!response.ok) {
                throw new Error('Failed to fetch attendance');
            }

            const attendance = await response.json();
            console.log('Fetched attendances:', attendance); // أضف هذا السطر للتحقق من البيانات

            const filteredAttendance = attendance.filter(attendance => {
                return true;
            });

            const table = document.querySelector("#attendance-table tbody");
            table.innerHTML = "";

            filteredAttendance.forEach(element => {
                table.innerHTML += `<tr data-courseId="${element.courseId}" data-status="${element.status}" data-date="${element.date}">
                    <td>${element.date}</td>
                    <td>${element.status === "P"? "Present" : "Absent"}</td>
                </tr>`;
            });

        }
        else {
            const studentInfo = document.getElementById("student-info");
            studentInfo.innerHTML = `
            <h2>Student Name: </h2>
            <p>ID: </p>
            <p>Year: </p>
            <p>Section: </p>`
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading students');
    }
}
