document.querySelectorAll('button[type="submit"]').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();

        const assignmentElement = this.closest('.assignment');
        const assignmentId = assignmentElement.dataset.assignmentId;
        const fileInput = assignmentElement.querySelector('input[type="file"]');
        const studentId = JSON.parse(localStorage.getItem("userData"))["id"]; // Example student ID, replace with actual value

        // Check if a file is selected
        if (!fileInput.files.length) {
            alert('Please select a file before submitting.');
            return; // Stop if no file is selected
        }

        const formData = new FormData();
        formData.append('studentId', studentId);
        formData.append('assignmentId', assignmentId);
        formData.append('file', fileInput.files[0]);

        fetch('/student/submit-assignment', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.text())
            .then(result => {
                if (result === 'Assignment submitted successfully') {
                    alert('File uploaded successfully.');
                } else {
                    alert('Failed to upload file. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while uploading the file.');
            });
    });
});


document.getElementById('subject-filter').addEventListener('change', function() {
    const selectedSubject = this.value;
    const assignments = document.querySelectorAll('.assignment');

    assignments.forEach(assignment => {
        const assignmentSubject = assignment.getAttribute('data-subject');
        if (selectedSubject === 'all' || assignmentSubject === selectedSubject) {
            assignment.style.display = 'block'; // Show the assignment
        } else {
            assignment.style.display = 'none'; // Hide the assignment
        }
    });
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