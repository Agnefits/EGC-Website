document.addEventListener("DOMContentLoaded", () => {
    // Load courses and assignments
    loadCourses();
    loadAssignments();

    // Add event listener for course filter
    const courseFilter = document.getElementById('course-filter');
    if (courseFilter) {
        courseFilter.addEventListener('change', function () {
            const selectedCourseId = this.value;
            loadAssignments(selectedCourseId);
        });
    } else {
        console.error('Course filter element not found');
    }

    // Add event listeners for menu icons
    document.querySelectorAll('.menu-icon').forEach(icon => {
        icon.addEventListener('click', function () {
            const assignmentId = this.getAttribute('data-assignment-id');
            toggleDropdown(assignmentId);
        });
    });

    // Add event listeners for submit buttons
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('submit-button')) {
            event.preventDefault();
    
            const assignmentElement = event.target.closest('.assignment');
            const assignmentId = assignmentElement.dataset.assignmentId;
            const fileInput = assignmentElement.querySelector('input[type="file"]');
            const studentId = JSON.parse(localStorage.getItem("userData"))?.id;
            const deadline = assignmentElement.querySelector('.deadline').textContent.replace('Deadline: ', '');
            const currentDate = new Date('2025-03-07'); // Current date based on context
    
            // Parse the deadline string into a Date object
            const deadlineDate = new Date(deadline);
    
            // Check if the current date is after the deadline
            if (currentDate > deadlineDate) {
                Swal.fire({
                    title: 'Submission Denied',
                    text: 'You cannot submit after the deadline (Deadline: ' + deadline + ').',
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                    width: '320px',
                    heightAuto: false,
                    position: 'top',
                    backdrop: false,
                    customClass: {
                        popup: 'custom-popup',
                        icon: 'custom-icon'
                    }
                });
                return; // Exit the function to prevent submission
            }
    
            if (!fileInput.files.length) {
                showPopup('warning', 'No File Selected', 'Please select a file before submitting.');
                return;
            }
    
            if (!assignmentId || !studentId) {
                showPopup('error', 'Invalid Data', 'Invalid assignment or student ID.');
                return;
            }
    
            const formData = new FormData();
            formData.append('studentId', studentId);
            formData.append('assignmentId', assignmentId);
            formData.append('file', fileInput.files[0]);
    
            fetch('/student/submit-assignment', {
                method: 'POST',
                body: formData,
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to submit assignment');
                    }
                    return response.json();
                })
                .then(submission => {
                    if (submission) {
                        showPopup('success', 'Success!', 'File uploaded successfully.');
                        loadAssignments(); // Reload assignments to reflect the new submission
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
// Load courses that the student is enrolled in
async function loadCourses() {
    try {
        const studentId = JSON.parse(localStorage.getItem("userData"))?.id;
        if (!studentId) {
            console.error('Student ID not found');
            return;
        }

        const response = await fetch(`/student/courses/${studentId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }

        const courses = await response.json();
        const courseFilter = document.getElementById('course-filter');

        // Clear existing options
        courseFilter.innerHTML = '<option value="all">All Courses</option>';

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
// Load assignments for the student's enrolled courses
async function loadAssignments(courseId = 'all') {
    try {
        const studentId = JSON.parse(localStorage.getItem("userData"))?.id;
        if (!studentId) {
            console.error('Student ID not found');
            return;
        }

        // Fetch the student's enrolled courses
        const coursesResponse = await fetch(`/student/courses/${studentId}`);
        if (!coursesResponse.ok) {
            throw new Error('Failed to fetch enrolled courses');
        }
        const enrolledCourses = await coursesResponse.json();

        let allAssignments = [];

        if (courseId !== 'all') {
            const url = `/courses-assignments/${courseId}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch assignments: ${response.statusText}`);
            }
            allAssignments = await response.json();
        } else {
            const assignmentsPromises = enrolledCourses.map(course =>
                fetch(`/courses-assignments/${course.id}`).then(res => res.json())
            );
            const assignmentsResults = await Promise.all(assignmentsPromises);
            allAssignments = assignmentsResults.flat();
        }

        // Fetch submissions for each assignment
        const submissionPromises = allAssignments.map(assignment =>
            fetch(`/student/submission/${assignment.id}/${studentId}`)
                .then(res => res.json())
                .then(submission => ({
                    ...assignment,
                    submission: submission // Add submission data to the assignment object
                }))
                .catch(err => {
                    console.error(`Error fetching submission for assignment ${assignment.id}:`, err);
                    return { ...assignment, submission: null }; // If no submission exists or error occurs
                })
        );

        const assignmentsWithSubmissions = await Promise.all(submissionPromises);
        displayAssignments(assignmentsWithSubmissions);
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

        // Check if the assignment has any submissions
        const submissions = assignment.submission || [];

        card.innerHTML = `
            <div class="card-left">
                <span>${assignment.date.split(" ")[0]}</span>
            </div>
            <div class="card-right">
                <div class="card-info">
                    <div class="assignmentTitle">${assignment.title}</div>
                    <div class="instructorName">Instructor: ${assignment.instructor || 'null'}</div>
                    <div class="deadline">Deadline: ${assignment.deadline}</div>
                    <div class="degree">Degree: ${assignment.degree}</div>
                    <div class="description">Description: ${assignment.description || ''}</div>
                    ${assignment.file ? `
                        <div class="attachment-container">
                            <a href="/courses/assignments/file/${assignment.id}" target="_blank" class="attachment-link">
                                <span>Download Attachment</span>
                            </a>
                        </div>
                    ` : ''}
                </div>
                <div class="submit-section">
                    <div class="file-input-wrapper">
                        <button class="file-input-button">Choose File</button>
                        <span class="file-input-label">${submissions.length > 0 ? 'Multiple files submitted' : 'No file chosen'}</span>
                        <input type="file" id="file-${assignment.id}" class="file-input" style="display: none;" />
                    </div>
                    <button class="submit-button" data-assignment-id="${assignment.id}" aria-label="Submit work for assignment ${assignment.title}">Submit Work</button>
                </div>
                ${submissions.length > 0 ? `
                    <div class="submission-files">
                        ${submissions.map(sub => `
                            <div class="submission-file">
                                <span>${sub.filename} (Submitted on: ${sub.submissionDate.split(" ")[0]})</span>
                                <button class="delete-submission-button" data-submission-id="${sub.id}">Delete</button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        container.appendChild(card);

        // Add event listener to the "Choose File" button to trigger the file input
        const fileInputButton = card.querySelector('.file-input-button');
        const fileInput = card.querySelector('.file-input');
        const fileInputLabel = card.querySelector('.file-input-label');

        fileInputButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            fileInputLabel.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
        });
    });

    // Add event listeners for delete submission buttons
    document.querySelectorAll('.delete-submission-button').forEach(button => {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            const submissionId = this.getAttribute('data-submission-id');
            deleteSubmission(submissionId);
        });
    });
}



// Delete a submission
async function deleteSubmission(submissionId) {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this submission? This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel',
            width: '320px',
            heightAuto: false,
            position: 'top',
            backdrop: false,
            customClass: {
                popup: 'custom-popup',
                icon: 'custom-icon'
            }
        });

        if (result.isConfirmed) {
            const response = await fetch(`/student/delete-submission/${submissionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete submission');
            }

            showPopup('success', 'Success!', 'Submission deleted successfully.');
            loadAssignments();
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('error', 'Error', 'Failed to delete submission. Please try again.');
    }
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