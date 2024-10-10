function togglePassword() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
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
    event.preventDefault(); // Prevent the form from submitting the default way

    const formData = new FormData(this); // Automatically handles file inputs

    const response = await fetch('/Add_Student', {
        method: 'POST',
        body: formData // Send FormData object directly
    });

    if (!response.ok) {
        alert(response.headers.get('Error'));
    } else {
        alert('Student added successfully');
        window.location.href = '/admin/AddStudent';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const studentData = JSON.parse(localStorage.getItem('studentData'));

    if (studentData) {
        // Populate the form fields with the stdocument.getElementById('yearlevel').value = studentData.year_level;udent data
        document.getElementById('firstname').value = studentData.name.split(' ')[0]; // Assuming name format "First Last"
        document.getElementById('lastname').value = studentData.name.split(' ')[1]; // Assuming name format "First Last"
        document.getElementById('username').value = studentData.username;
        document.getElementById('email').value = studentData.email;
        document.getElementById('phone_no').value = studentData.phone;
        document.getElementById('national_id').value = studentData.national_id; // Assuming field exists
        document.getElementById('department').value = studentData.department;
        document.getElementById('yearlevel').value = studentData.year_level;
        document.getElementById('password').value = studentData.password;
        document.querySelector(`input[name="gender"][value="${studentData.gender}"]`).checked = true;


        // Optionally, you can also set gender and other fields if needed
        // For example:
        // document.querySelector(`input[name="gender"][value="${studentData.gender}"]`).checked = true;

        // Clear the student data from localStorage
        localStorage.removeItem('studentData');
    }
    getLastStudentNumber();
});

const department = document.getElementById('department');
const yearlevel = document.getElementById('yearlevel');

department.addEventListener("change", getLastStudentNumber);
yearlevel.addEventListener("change", getLastStudentNumber);

async function getLastStudentNumber() {

    if (department.value == null || yearlevel.value == null)
        return;
    const response = await fetch(`/Last-Student-Number/${yearlevel.value}/${department.value}`);

    if (response.ok) {
        document.getElementsByName('No_list')[0].value = response.headers.get('Number');
        document.getElementsByName('No_section')[0].value = response.headers.get('Section');
    }
}
