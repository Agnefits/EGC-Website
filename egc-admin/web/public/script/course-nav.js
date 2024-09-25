document.addEventListener('DOMContentLoaded', loadDoctorData);

async function loadDoctorData() {
    const courseData = JSON.parse(localStorage.getItem('courseData'));

    if (courseData) {
        document.getElementsByClassName('name_c')[0].innerText = courseData.name;
        document.querySelector('.log img').src = courseData.photo ? "/courses/photo/" + courseData.id : "/img/img-course.png";
    } else {
        alert('Course ID is missing');
        window.location.href = '/staff/ShowCourses';
    }
}



function goBackToCoursePage() 
{
    console.log('Go Back button clicked!'); // Debug log
    window.location.href = '/staff/Dashboard';
}


document.getElementById('message-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const description = document.getElementById('description').value;
    const fileInput = document.getElementById('fileInput');
    const formData = new FormData();
    
    // Append the description to the FormData
    formData.append('description', description);

    // Append all files to the FormData
    for (const file of fileInput.files) {
        formData.append('files', file);
    }

    const response = await fetch('/send-announcement', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        // Optionally redirect to the staff-announcement page
        window.location.href = '/staff-announcement';
    } else {
        alert('Failed to send announcement');
    }
});
