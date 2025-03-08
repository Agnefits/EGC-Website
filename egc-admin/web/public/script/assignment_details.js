document.addEventListener('DOMContentLoaded', () => {
    loadAssignmentData();
});

async function loadAssignmentData() {
    const assignmentData = JSON.parse(localStorage.getItem('assignmentData'));

    if (!assignmentData) {
        console.error('Assignment data not found in localStorage');
        return;
    }

    // Populate assignment details
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

    // Load student submissions
    loadStudentAssignments();
}

async function loadStudentAssignments() {
    try {
        const assignmentData = JSON.parse(localStorage.getItem('assignmentData'));
        const response = await fetch(`/staff/Course/AssignmentDetails/${assignmentData.id}/submissions`);
        if (!response.ok) {
            throw new Error('Failed to fetch submissions');
        }
        const submissions = await response.json();
        displayStudentAssignments(submissions);
    } catch (error) {
        console.error('Error:', error);
        showPopup('error', 'Error', 'Failed to load student submissions.');
    }
}

function displayStudentAssignments(submissions) {
    const container = document.getElementById('studentSubmissionsContainer');
    if (!container) {
        console.error('Submissions container not found');
        return;
    }

    container.innerHTML = ''; // Clear old data

    submissions.forEach(submission => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <div class="card-left">
                <span>${submission.submissionDate.split(" ")[0]}</span>
            </div>
            <div class="card-right">
                <div class="studentName">${submission.student}</div>
                ${submission.file ? `
                    <a href="/courses/student-assignments/file/${submission.id}" target="_blank">
                        <img class="icon" src="/img/file_icon.png" alt="Download">
                    </a>` : ''}
            </div>
        `;

        container.appendChild(card);
    });
}
function showPopup(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        width: '320px',
        heightAuto: false,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        backdrop: false,
        customClass: {
            popup: 'custom-popup',
            icon: 'custom-icon'
        }
    });
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
        console.log('Fetched assignment:', assignment);

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
            loadAssignments(); // Reload assignments after deletion
        } else {
            console.error('Failed to delete assignment', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function goBack() {
    window.location.href = "/staff/Course/Assignments";
}