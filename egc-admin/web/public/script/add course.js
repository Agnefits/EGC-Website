document.getElementById('addCourseForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    formData.append('year', document.getElementById('yearFilter').value);

    const doctorData = JSON.parse(localStorage.getItem('userData'));
    formData.append("doctorId", doctorData.id);

    const response = await fetch('/add-course', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: response.headers.get('Error'),
            width: '320px',
            heightAuto: false,
            position: 'top',
            showConfirmButton: true,
            backdrop: false
        });
    } else {
        showPopup();
        // 🟢 Added: Force pagination reset
        localStorage.setItem('forcePageReset', 'true');
        setTimeout(() => {
            window.location.href = '/staff/ShowCourses';
        }, 3000);
    }
});

const fileInput = document.getElementById('course_image');
const imageContainer = document.getElementById('picturecourse');

fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        imageContainer.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

const hours = document.getElementById("courseHours");
hours.addEventListener("change", changeValue);

const lectureAttendance = document.getElementById("lectureAttendance");
const sectionAttendance = document.getElementById("sectionAttendance");
const practicalDegree = document.getElementById("practicalDegree");
const midtermDegree = document.getElementById("midtermDegree");
const finalDegree = document.getElementById("finalDegree");
const totalDegree = document.getElementById("totalDegree");

lectureAttendance.addEventListener("change", changeValue);
sectionAttendance.addEventListener("change", changeValue);
practicalDegree.addEventListener("change", changeValue);
midtermDegree.addEventListener("change", changeValue);
finalDegree.addEventListener("change", changeValue);

function changeValue(e) {
    if (isNaN(parseFloat(e.target.value)))
        e.target.value = "0";
    else
        e.target.value = parseFloat(e.target.value);
    totalDegree.value = parseFloat(lectureAttendance.value) + parseFloat(sectionAttendance.value) + parseFloat(practicalDegree.value) +
        parseFloat(midtermDegree.value) + parseFloat(finalDegree.value);
}

function goBackToCoursePage() {
    window.location.href = '/staff/ShowCourses';
}

function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'Success !',
        text: 'The course has been added successfully',
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


