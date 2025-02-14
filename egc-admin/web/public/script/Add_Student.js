function togglePassword() {
    var x = document.getElementById("password");
    x.type = x.type === "password" ? "text" : "password";
}

const fileInput = document.getElementById('student_image');
const imageContainer = document.getElementById('picture');

fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        imageContainer.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

document.getElementById('addstudentForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    try {
        const response = await fetch('/Add_Student', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorText || 'An error occurred while adding the student.',
                position: 'top',
                backdrop: false,
                customClass: {
                    popup: 'custom-popup',
                },
                didOpen: () => {
                    const popup = Swal.getPopup();
                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '&times;';
                    closeBtn.classList.add('close-btn');
                    closeBtn.onclick = () => Swal.close();
                    popup.appendChild(closeBtn);
                },
                timer: 3000, // Auto-close after 3 seconds
                showConfirmButton: false // Hide the "OK" button
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Student added successfully!',
                position: 'top',
                backdrop: false,
                customClass: {
                    popup: 'custom-popup',
                },
                didOpen: () => {
                    const popup = Swal.getPopup();
                   
                },
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = '/admin/AddStudent';
            });
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'A network error occurred. Please try again later.',
            position: 'top',
            backdrop: false,
            customClass: {
                popup: 'custom-popup',
            },
            didOpen: () => {
                const popup = Swal.getPopup();
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '&times;';
                closeBtn.classList.add('close-btn');
                closeBtn.onclick = () => Swal.close();
                popup.appendChild(closeBtn);
            },
            timer: 3000,
            showConfirmButton: false
        });
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const studentData = JSON.parse(localStorage.getItem('studentData'));

    if (studentData) {
        document.getElementById('firstname').value = studentData.name.split(' ')[0];
        document.getElementById('lastname').value = studentData.name.split(' ')[1];
        document.getElementById('username').value = studentData.username;
        document.getElementById('email').value = studentData.email;
        document.getElementById('phone_no').value = studentData.phone;
        document.getElementById('national_id').value = studentData.national_id;
        document.getElementById('department').value = studentData.department;
        document.getElementById('yearlevel').value = studentData.year_level;
        document.getElementById('password').value = studentData.password;
        document.querySelector(`input[name="gender"][value="${studentData.gender}"]`).checked = true;

        localStorage.removeItem('studentData');
    }
    getLastStudentNumber();
});

const department = document.getElementById('department');
const yearlevel = document.getElementById('yearlevel');

department.addEventListener("change", getLastStudentNumber);
yearlevel.addEventListener("change", getLastStudentNumber);

async function getLastStudentNumber() {
    if (!department.value || !yearlevel.value) return; // Simplified check

    try {
        const response = await fetch(`/Last-Student-Number/${yearlevel.value}/${department.value}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); // Throw error for non-ok responses
        }
        document.getElementsByName('No_list')[0].value = response.headers.get('Number');
        document.getElementsByName('No_section')[0].value = response.headers.get('Section');
    } catch (error) {
        console.error("Error fetching student number:", error);
        // Handle error, e.g., display a message to the user
        document.getElementsByName('No_list')[0].value = ""; // Or some default value
        document.getElementsByName('No_section')[0].value = ""; // Or some default value

    }
}