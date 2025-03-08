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
    console.log(fileInput.files[0]);
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        imageContainer.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

const teachingAssistantData = JSON.parse(localStorage.getItem('teachingAssistantData'));

document.addEventListener('DOMContentLoaded', loadTeachingAssistantData);
async function loadTeachingAssistantData() {
    if (teachingAssistantData) {
        if (!teachingAssistantData.id) {
            alert('Teaching Assistant ID is missing');
            return;
        }

        document.getElementById('name').value = teachingAssistantData.name;
        document.getElementById('email').value = teachingAssistantData.email;
        document.getElementById('phone').value = teachingAssistantData.phone;
        document.getElementById('username').value = teachingAssistantData.username;
        document.getElementById('major').value = teachingAssistantData.major;
        document.getElementById('password').value = teachingAssistantData.password;


        if (teachingAssistantData.photo) {
            imageContainer.src = "/teaching-assistants/photo/" + teachingAssistantData.id;
        }

        // Local storage doesn't hold file data, so skip setting file inputs
        localStorage.removeItem('teachingAssistantData');
    }

}


document.getElementById('updateTeachingAssistantForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email').value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

    if (!emailPattern.test(emailInput)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Email',
            text: 'Please enter a valid email ending with .com (e.g., user@example.com)',
            width: '320px',
            heightAuto: false,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            backdrop: false,
        });
        return; // Stop form submission if email is invalid
    }

    const formData = new FormData(this);

    try {
        const response = await fetch(`/update-teaching-assistants/${teachingAssistantData.id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update Teaching Assistant');
        }
        showPopup();
        this.reset();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update Teaching Assistant: ' + error.message);
    }
});


function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'success!',
        text: 'The student has been updated',
        width: '320px',
        heightAuto: false,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        backdrop: false,
        customClass: {
            popup: 'custom-popup',
            icon: 'custom-icon'
        },
        didClose: () =>{
            window.location.href = '/admin/ShowTeachingAssistants';
        }
    });

 
}
