const assignmentData = JSON.parse(localStorage.getItem('assignmentData'));

document.addEventListener('DOMContentLoaded', loadAssignmentData);


async function loadAssignmentData() {

    if (assignmentData) {
        if (!assignmentData.id) {
            alert('Assignment ID is missing');
            return;
        } else {
            document.getElementById('instructor').innerText = assignmentData.instructor;
            document.getElementById('title').innerText = assignmentData.title;
            document.getElementById('date').innerText = "Uploaded on: " + assignmentData.date.split(" ")[0];
            document.getElementById('deadline').innerText = "Deadline on: " + assignmentData.deadline;
            document.getElementById('degree').innerText = assignmentData.degree + " Degrees";
            document.getElementById('description').innerText = assignmentData.description;
            if (assignmentData.file) {
                document.getElementById('file').href = '/courses/assignments/file/' + assignmentData.id;
                document.getElementById('file').target = '_blank';

                document.getElementById('fileName').innerText = assignmentData.filename;
                document.getElementById('fileName').href = '/courses/assignments/file/' + assignmentData.id;
                document.getElementById('fileName').target = '_blank';
            } else {
                document.getElementById('fileName').style.display = "none";
            }
        }
    }

    loadStudentAssignments();
}

function toggleDropdown(id) {
    let elements = document.getElementsByClassName("dropdown-content2");

    const dropdown = document.getElementById(`dropdown`);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

async function editAssignment(id) {

    if (!id) {
        alert('assignment ID is missing');
        return;
    }

    try {
        const response = await fetch(`/courses/assignments/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch assignment details');
        }

        const assignment = await response.json();
        console.log('Fetched assignment:', assignment); // أضف هذا السطر للتحقق من البيانات

        // Ensure the data contains ID
        if (assignment && assignment.id) {
            localStorage.setItem('assignmentData', JSON.stringify(assignment));
            window.location.href = '/staff/Course/EditAssignment';
        } else {
            throw new Error('assignment data is incomplete');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching assignment details');
    }
}

async function deleteAssignment(id) {
    try {
        const response = await fetch(`/delete-assignment/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert('Assignment deleted successfully!');
            loadAssignments(); // إعادة تحميل المواد بعد الحذف
        } else {
            console.error('Failed to delete assignment', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

let fullDegree;
async function loadStudentAssignments() {
    try {
        const assignmentData = JSON.parse(localStorage.getItem('assignmentData'));

        fullDegree = assignmentData.degree;

        const response = await fetch('/student-assignments/' + assignmentData.id);
        if (response.ok) {
            const assignments = await response.json();
            displayStudentAssignments(assignments);
        } else {
            console.error('Failed to fetch assignments', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayStudentAssignments(assignments) {
    const container = document.getElementById('assignmentsContainer');

    assignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <div class="card-left">
                <span>${assignment.date.split(" ")[0]}</span>
                <form class="updateForm Upload-${assignment.id}" id="updateForm-${assignment.id}" method="POST" enctype="multipart/form-data" onSubmit="updateSturentAssignment(id); return false;">
                    <label for="degree-${assignment.id}">Degree: </label>
                    <input name="degree" class="studentDegree" id="degree-${assignment.id}" value="${assignment.degree?? ""}">
                </form>
            </div>
            <div class="card-right" ${assignment.file ? ('onclick="window.open(\'/courses/student-assignments/file/' + assignment.id + '\',\'_blank\')"') : ""})">
                <div class= "studentName">${assignment.student}</div>
                <a ${assignment.file? 'href="/courses/student-assignments/file/' + assignment.id + '" target="_blank"' : ""}>
                    <img class="icon" src="/img/file_icon.png" alt="icon">
                </a>
            </div>
        `;

        container.appendChild(card);

        document.getElementById(`degree-${assignment.id}`).addEventListener("change", (e) => { updateSturentAssignment(assignment.id); })

    });
}
async function updateSturentAssignment(id) {
    try {
        const input = document.getElementById(`degree-${id}`);
        if (input == null)
            return;

        if (isNaN(parseFloat(input.value)))
            input.value = "0";
        else
            input.value = parseFloat(input.value);

        if (parseFloat(input.value) > fullDegree)
            input.value = fullDegree;

        const formData = new FormData(document.getElementById(`updateForm-${id}`));
        const response = await fetch('/update-student-assignment/' + id, {
            method: 'PUT',
            body: formData // Send FormData object directly
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

function goBack() {
    window.location.href = "/staff/Course/Assignments";
}