document.addEventListener('DOMContentLoaded', () => {
    loadAssignments();
});

async function loadAssignments() {
    try {
        const courseData = JSON.parse(localStorage.getItem('courseData'));

        const response = await fetch('/courses-assignments/' + courseData.id);
        if (response.ok) {
            const assignments = await response.json();
            displayAssignments(assignments);
        } else {
            console.error('Failed to fetch assignments', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

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
                <div class = "card-info">
                    <div class= "assignmentTitle">${assignment.title}</div>
                    <div class= "instructorName">${assignment.instructor}</div>
                </div>
                <a ${assignment.file? 'href="/courses/assignments/file/' + assignment.id + '" target="_blank"' : ""}>
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

function toggleDropdown(id) {
    let elements = document.getElementsByClassName("dropdown-content2");
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].id != `dropdown-${id}`)
            elements[i].style.display = 'none';
    }

    const dropdown = document.getElementById(`dropdown-${id}`);
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
            showPopup();
            loadAssignments(); // إعادة تحميل المواد بعد الحذف
        } else {
            console.error('Failed to delete assignment', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function showAssignmentDetails(id) {

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
            window.location.href = '/staff/Course/AssignmentDetails';
        } else {
            throw new Error('assignment data is incomplete');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching assignment details');
    }
}

function goBack() {
    window.location.href = "/staff/Course/Content";
}

function addAssignment() {
    window.location.href = "/staff/Course/AddAssignment";
}
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'success!',
        text: 'The assignment has been deleted',
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