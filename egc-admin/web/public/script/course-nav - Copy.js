document.addEventListener('DOMContentLoaded', loadDoctorData);

async function loadDoctorData() {
    const courseData = JSON.parse(localStorage.getItem('courseData'));

    if (courseData) {
        const courseName = courseData.name || 'Unknown Course';  // Default if name is missing
        document.getElementsByClassName('name_c')[0].innerText = courseName;

        const coursePhoto = courseData.photo ? "/courses/photo/" + courseData.id : "/img/img-course.png";
        document.querySelector('.log img').src = coursePhoto;
    } else {
        alert('Course data is missing');
        window.location.href = '/staff/ShowCourses';
    }
}

function goBackToCoursePage() {
    window.location.href = '/staff/Dashboard';
}
