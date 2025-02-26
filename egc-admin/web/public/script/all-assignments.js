document.addEventListener("DOMContentLoaded", () => {
    // Load courses and assignments
    loadCourses();
    loadAssignments();

    // Add event listener for course filter
    const courseFilter = document.getElementById('course-filter');
    if (courseFilter) {
        courseFilter.addEventListener('change', function() {
            const selectedCourseId = this.value;
            loadAssignments(selectedCourseId);
        });
    } else {
        console.error('Course filter element not found');
    }

    // Add event listeners for menu icons
    document.querySelectorAll('.menu-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const assignmentId = this.getAttribute('data-assignment-id');
            toggleDropdown(assignmentId);
        });
    });

    // Add event listeners for submit buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('submit-button')) {
            event.preventDefault(); // Prevent default form submission

            const assignmentElement = event.target.closest('.assignment');
            const assignmentId = assignmentElement.dataset.assignmentId;
            const fileInput = assignmentElement.querySelector('input[type="file"]');
            const studentId = JSON.parse(localStorage.getItem("userData"))?.id;

            // Debugging logs
            console.log("Assignment ID:", assignmentId);
            console.log("Student ID:", studentId);
            console.log("Selected File:", fileInput.files[0]);

            // Check if a file is selected
            if (!fileInput.files.length) {
                showPopup('warning', 'No File Selected', 'Please select a file before submitting.');
                return;
            }

            // Check if assignmentId and studentId are valid
            if (!assignmentId || !studentId) {
                showPopup('error', 'Invalid Data', 'Invalid assignment or student ID.');
                return;
            }

            // Create FormData object to send the file
            const formData = new FormData();
            formData.append('studentId', studentId);
            formData.append('assignmentId', assignmentId);
            formData.append('file', fileInput.files[0]);

            // Send the file to the server
            fetch('/student/submit-assignment', {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit assignment');
                }
                return response.text();
            })
            .then(result => {
                console.log("Server Response:", result); // Debugging log
                if (result === 'Assignment submitted successfully') {
                    showPopup('success', 'Success!', 'File uploaded successfully.');
                    fileInput.value = ''; // Clear the file input
                } else {
                    showPopup('error', 'Upload Failed', 'Failed to upload file. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showPopup('error', 'Error', 'An error occurred while uploading the file.');
            });
        }
    });


    // Add click event listeners to assignment cards
    document.querySelectorAll('.assignment').forEach(assignment => {
        assignment.addEventListener('click', () => {
            const assignmentId = assignment.dataset.assignmentId;
            const assignmentData = assignments.find(a => a.id === assignmentId); // Assuming `assignments` is the list of assignments loaded from the server

            if (assignmentData) {
                localStorage.setItem('assignmentData', JSON.stringify(assignmentData));
                window.location.href = `/student/AssignmentDetails/${assignmentId}`; // Redirect to the assignment details page
            } else {
                console.error('Assignment data not found');
            }
        });
    });
});

// Function to toggle dropdown
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

// Load courses
async function loadCourses() {
    try {
        const response = await fetch('/courses');
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }

        const courses = await response.json();
        const courseFilter = document.getElementById('course-filter');

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            courseFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load courses. Please try again.');
    }
}

// Load assignments
async function loadAssignments(courseId = 'all') {
    try {
        const url = courseId === 'all' ? '/courses-assignments' : `/courses-assignments/${courseId}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch assignments: ${response.statusText}`);
        }

        const assignments = await response.json();
        displayAssignments(assignments);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load assignments. Please try again.');
    }
}

// Display assignments
function displayAssignments(assignments) {
    const container = document.getElementById('assignmentsContainer');
    if (!container) {
        console.error('Assignments container not found');
        return;
    }
    container.innerHTML = ''; // Clear existing content

    assignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'assignment';
        card.setAttribute('data-assignment-id', assignment.id);

        card.innerHTML = `
            <div class="card-left">
                <div class="menu-icon" data-assignment-id="${assignment.id}">&#x2022;&#x2022;&#x2022;</div>
                <span>${assignment.date.split(" ")[0]}</span>
            </div>
            <div class="card-right">
                <div class="card-info">
                    <div class="assignmentTitle">${assignment.title}</div>
                    <div class="instructorName">Instructor: ${assignment.instructor}</div>
                    <div class="deadline">Deadline: ${assignment.deadline}</div>
                    <div class="degree">Degree: ${assignment.degree}</div>
                    <div class="description">Description: ${assignment.description}</div>
                    ${assignment.file ? `
                        <a href="/courses/assignments/file/${assignment.id}" target="_blank">
                            <img class="icon" src="/img/file_icon.png" alt="icon">
                            <span>Download Attachment</span>
                        </a>
                    ` : ''}
                </div>
                <div class="submit-section">
                    <input type="file" id="file-${assignment.id}" class="file-input" placeholder="Choose file" />
                    <button class="submit-button" data-assignment-id="${assignment.id}" aria-label="Submit work for assignment ${assignment.title}">Submit Work</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Function to show pop-up messages
function showPopup(icon, title, text) {
    console.log(`Popup Triggered: ${icon}, ${title}, ${text}`); // Debugging log
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

// Function to handle assignment submission
async function submitAssignment(assignmentId, file) {
    if (!file) {
        alert('Please select a file to submit.');
        return;
    }

    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', file);

    try {
        const response = await fetch('/student/submit-assignment', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Failed to submit assignment: ${response.statusText}`);
        }

        const result = await response.text();
        if (result === 'Assignment submitted successfully') {
            alert('Assignment submitted successfully!');
        } else {
            throw new Error(result);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit assignment. Please try again.');
    }
}

document.getElementById('course-filter').addEventListener('change', function() {
    const selectedCourseId = this.value;
    loadAssignments(selectedCourseId);
});

document.addEventListener("DOMContentLoaded", () => {
    const assignments = document.querySelectorAll('.assignment');
    const count = assignments.length;

    // Store the count in localStorage
    localStorage.setItem('assignmentCount', count);
});

let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
});

function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
}

const logout = document.getElementById("log_out");
logout.addEventListener("click", () => {
    localStorage.clear("userData");
    location.href = "/home";
});

var userData = JSON.parse(localStorage.getItem("userData"));
if (userData) {
    document.getElementsByClassName("profile")[0].getElementsByClassName("name")[0].innerText = userData.name;
    document.getElementsByClassName("profile")[0].getElementsByClassName("email")[0].innerText = userData.email;
    if (userData.photo) {
        document.querySelector(".profile-details img").src = (userData.role == "Student") + '/photo/' + userData.id;
    }
}