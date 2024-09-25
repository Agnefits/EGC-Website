// Show and Hide Password
document.getElementById("showPassword").addEventListener("click", function() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
});

const fileInput = document.getElementById('profilePicUpload');
const imageContainer = document.getElementById('picture');

fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        imageContainer.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

// Function to add a new doctor
document.getElementById('addDoctorForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the default way

    const formData = new FormData(this); // Automatically handles file inputs

    const response = await fetch('/add-doctor', {
        method: 'POST',
        body: formData // Send FormData object directly
    });

    if (!response.ok) {
        alert(response.headers.get('Error'));
    } else {
        alert('Doctor added successfully');
        window.location.href = '/admin/AddDoctor';
    }
});

// Function to load doctors and display them in a list
async function loadDoctors() {

    const response = await fetch('/doctors');
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }

    const doctors = await response.json();


}

// Load doctors on page load
document.addEventListener('DOMContentLoaded', loadDoctors);