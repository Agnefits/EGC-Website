document.addEventListener('DOMContentLoaded', () => {
    loadAssignments();
});

// تحديث قائمة الواجبات بعد الإضافة
async function loadAssignments() {
    try {
        const courseData = JSON.parse(localStorage.getItem('courseData'));
        if (!courseData || !courseData.id) {
            alert('Course data is missing. Please select a course first.');
            return;
        }

        const response = await fetch(`/courses-assignments/${courseData.id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch assignments');
        }

        const assignments = await response.json();
        displayAssignments(assignments);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load assignments. Please try again.');
    }
}

// عرض الواجبات المضافة حديثًا
function displayAssignments(assignments) {
    const container = document.getElementById('assignmentsContainer');
    container.innerHTML = '';

    assignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <div class="card-left">
                <div class="menu-icon" onclick="toggleDropdown(${assignment.id})">&#x2022;&#x2022;&#x2022;</div>
                <span>${assignment.date.split(" ")[0]}</span>
            </div>
            <div class="card-right" onclick="showAssignmentDetails(${assignment.id})">
                <div class="card-info">
                    <div class="assignmentTitle">${assignment.title}</div>
                    <div class="instructorName">${assignment.instructor}</div>
                </div>
                <a ${assignment.file ? 'href="/courses/assignments/file/' + assignment.id + '" target="_blank"' : ""}>
                    <img class="icon" src="/img/file_icon.png" alt="icon">
                </a>
            </div>
            <div id="dropdown-${assignment.id}" class="dropdown-content2">
                <a href="#" class="edit" onclick="editAssignment(${assignment.id})">Edit</a>
                <a href="#" class="delete" onclick="deleteAssignment(${assignment.id})">Delete</a>
            </div>
        `;

        container.appendChild(card);
    });
}

// Toggle dropdown menu for an assignment
function toggleDropdown(id) {
    let elements = document.getElementsByClassName("dropdown-content2");
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].id !== `dropdown-${id}`) {
            elements[i].style.display = 'none';
        }
    }

    const dropdown = document.getElementById(`dropdown-${id}`);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Edit an assignment
async function editAssignment(id) {
    if (!id) {
        alert('Assignment ID is missing');
        return;
    }

    try {
        const response = await fetch(`/courses/assignments/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch assignment details');
        }

        const assignment = await response.json();
        if (assignment && assignment.id) {
            localStorage.setItem('assignmentData', JSON.stringify(assignment));
            window.location.href = '/staff/Course/EditAssignment';
        } else {
            throw new Error('Assignment data is incomplete');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching assignment details');
    }
}

// Delete an assignment
async function deleteAssignment(id) {
    try {
        const response = await fetch(`/delete-assignment/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete assignment');
        }

        showPopup();
        loadAssignments(); // Reload assignments after deletion
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete assignment. Please try again.');
    }
}

// Show assignment details
async function showAssignmentDetails(id) {
    if (!id) {
        alert('Assignment ID is missing');
        return;
    }

    try {
        // Fetch assignment details
        const assignmentResponse = await fetch(`/courses/assignments/${id}`);
        if (!assignmentResponse.ok) {
            throw new Error('Failed to fetch assignment details');
        }

        const assignment = await assignmentResponse.json();
        if (assignment && assignment.id) {
            localStorage.setItem('assignmentData', JSON.stringify(assignment));

            // Fetch student submissions for this assignment
            const submissionsResponse = await fetch(`/staff/Course/AssignmentDetails/${id}/submissions`);
            if (!submissionsResponse.ok) {
                throw new Error('Failed to fetch student submissions');
            }

            const submissions = await submissionsResponse.json();
            localStorage.setItem('assignmentSubmissions', JSON.stringify(submissions));

            // Redirect to the assignment details page
            window.location.href = '/staff/Course/AssignmentDetails';
        } else {
            throw new Error('Assignment data is incomplete');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching assignment details');
    }
}

// Redirect to the course content page
function goBack() {
    window.location.href = "/staff/Course/Content";
}

// Redirect to the add assignment page
function addAssignment() {
    window.location.href = "/staff/Course/AddAssignment";
}

// Show success popup
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Assignment deleted successfully',
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