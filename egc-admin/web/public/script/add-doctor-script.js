// إظهار وإخفاء كلمة المرور
document.getElementById("showPassword").addEventListener("click", function() {
    var x = document.getElementById("password");
    x.type = (x.type === "password") ? "text" : "password";
});

// تحميل صورة البروفايل وعرضها عند الاختيار
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

// دالة لإظهار رسالة نجاح
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'Success !',
        text: 'The doctor has been added',
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
    }).then(() => {
        window.location.href = '/admin/AddDoctor'; // إعادة التوجيه بعد نجاح العملية
    });
}

// دالة لإضافة طبيب جديد
document.getElementById('addDoctorForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // منع الإرسال الافتراضي

    const formData = new FormData(this); // جمع البيانات بما فيها الصورة

    try {
        const response = await fetch('/add-doctor', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorMsg = response.headers.get('Error') || 'Failed to add doctor';
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error processing request',
                width: '320px',
                heightAuto: false,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                backdrop: false
            });
        } else {
            showPopup(); // عرض رسالة النجاح
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Network error. Please try again.',
            width: '320px',
            heightAuto: false,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            backdrop: false
        });
    }
});

// تحميل قائمة الأطباء عند تحميل الصفحة
async function loadDoctors() {
    try {
        const response = await fetch('/doctors');
        if (!response.ok) throw new Error('Network response was not ok.');

        const doctors = await response.json();
        console.log(doctors); // استبدل هذا بكود عرض البيانات في الصفحة
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// تحميل الأطباء عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadDoctors);
