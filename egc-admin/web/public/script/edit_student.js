function togglePassword() {
    var passwordField = document.getElementById("password");
    passwordField.type = passwordField.type === "password" ? "text" : "password";
}

// دالة لعرض رسالة منبثقة
function showPopup(message, type = 'success') {
    Swal.fire({
        icon: type,
        title: type === 'success' ? 'Success!' : 'Error!',
        text: message,
        timer: 3000,
        showConfirmButton: false
    });
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

const studentData = JSON.parse(localStorage.getItem('studentData'));

document.addEventListener('DOMContentLoaded', loadStudentData);

async function loadStudentData() {
    if (studentData) {
        if (!studentData.id) {
            showPopup('Student ID is missing', 'error');
            return;
        } else {
            document.getElementById('firstname').value = studentData.name.split(' ')[0] || '';
            document.getElementById('lastname').value = studentData.name.split(' ')[1] || '';
            document.getElementById('email').value = studentData.email;
            document.getElementById('phone_no').value = studentData.phone;
            document.getElementById('username').value = studentData.username;
            document.getElementById('department').value = studentData.department;
            document.getElementById('yearlevel').value = studentData.year_level;
            document.getElementById('national_id').value = studentData.national_id;
            document.getElementById('password').value = studentData.password;
            document.getElementById('No_list').value = studentData.number;
            document.getElementById('No_section').value = studentData.no_section;
            
            document.querySelector(`input[name="gender"][value="${studentData.gender}"]`).checked = true;

            currentDepartment = studentData.department;
            currentYearlevel = studentData.year_level;
            currentNoList = studentData.number;
            currentSection = studentData.section;

            if (studentData.photo) {
                imageContainer.src = "/students/photo/" + studentData.id;
            }

            localStorage.removeItem('studentData');
        }
    }
}

document.getElementById('updatestudentForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    try {
        if (!studentData.id) {
            throw new Error('Student ID is missing');
        }

        const response = await fetch(`/update-student/${studentData.id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update student');
        }

        showPopup('The student information has been updated successfully!', 'success');

        setTimeout(() => {
            window.location.href = '/admin/ShowStudents';
        }, 3000);

    } catch (error) {
        showPopup(error.message, 'error');
    }
});

let currentDepartment;
let currentYearlevel;
let currentNoList;
let currentSection;

const department = document.getElementById('department');
const yearlevel = document.getElementById('yearlevel');

department.addEventListener("change", getLastStudentNumber);
yearlevel.addEventListener("change", getLastStudentNumber);

async function getLastStudentNumber() {
    if (department.value == null || yearlevel.value == null) return;
    
    if (department.value == currentDepartment && yearlevel.value == currentYearlevel) {
        document.getElementsByName('No_list')[0].value = currentNoList;
        document.getElementsByName('No_section')[0].value = currentSection;
    } else {
        const response = await fetch(`/Last-Student-Number/${yearlevel.value}/${department.value}`);

        if (response.ok) {
            document.getElementsByName('No_list')[0].value = response.headers.get('Number');
            document.getElementsByName('No_section')[0].value = response.headers.get('Section');
        }
    }
}
