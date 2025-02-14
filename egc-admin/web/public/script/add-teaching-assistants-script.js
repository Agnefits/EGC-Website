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

document.getElementById('addTeachingAssistantForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // منع الإرسال الافتراضي للنموذج


    try {
        const formData = new FormData(this); // Automatically handles file inputs

        const response = await fetch('/add-teaching-assistant', {
            method: 'POST',
            body: formData // Send FormData object directly
        });

        if (!response.ok) {
            alert(response.headers.get('Error'));
        } else {
            showPopup(); // استدعاء الـ popup
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the Teaching Assistant');
    }
});

// وظيفة لتحميل قائمة المعيدين وعرضها في القائمة
async function loadTeachingAssistants() {
    try {
        const response = await fetch('/teaching-assistants');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const teachingAssistants = await response.json();
        // يمكن الآن استخدام البيانات لتحميلها وعرضها في واجهة المستخدم
    } catch (error) {
        console.error('Error:', error);
    }
}

// تحميل المعيدين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadTeachingAssistants);


function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'successfully !',
        text: 'Teaching Assistant added',
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
        didClose: () => {
            window.location.href = '/admin/AddTeachingAssistant';
        }
    });
}