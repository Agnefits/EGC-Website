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

const doctorData = JSON.parse(localStorage.getItem('doctorData'));

document.addEventListener('DOMContentLoaded', loadDoctorData);

async function loadDoctorData() {
    const doctorData = JSON.parse(localStorage.getItem('doctorData'));

    if (doctorData) {
        if (!doctorData.id) {
            alert('Doctor ID is missing');
            return;
        } else {
            document.getElementById('name').value = doctorData.name;
            document.getElementById('email').value = doctorData.email;
            document.getElementById('phone').value = doctorData.phone;
            document.getElementById('username').value = doctorData.username;
            document.getElementById('major').value = doctorData.major;
            document.getElementById('password').value = doctorData.password;

            if (doctorData.photo) {
                imageContainer.src = "/doctors/photo/" + doctorData.id;
            }

            localStorage.removeItem('doctorData');
        }
    }
}
document.getElementById('UploadDoctorForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    try {
        if (!doctorData.id) {
            throw new Error('Doctor ID is missing');
        }

        const response = await fetch(`/update-doctor/${doctorData.id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update doctor');
        }

        showPopup();

        this.reset();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update doctor: ' + error.message);
    }
});

function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'success!',
        text: 'The doctor has been edited',
        width: '320px',
        heightAuto: false,
        position: 'top',
        showConfirmButton: false,
        timer: 3000, // مدة البوب أب 3 ثوانٍ
        backdrop: false,
        customClass: {
            popup: 'custom-popup',
            icon: 'custom-icon'
        },
        didClose: () => {
            // عند إغلاق البوب أب، يتم تنفيذ التوجيه
            window.location.href = '/admin/ShowDoctors';
        }
    });
}
