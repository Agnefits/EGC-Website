// document.addEventListener("DOMContentLoaded", () => {
//     const courseData = JSON.parse(localStorage.getItem('courseData'));
//     if (courseData) {
//         document.getElementById('course').innerText = courseData.name;
//         document.getElementById("imgnav").src = courseData.photo ? "/courses/photo/" + courseData.id : "/img/img-course.png";
//     } else {
//         alert('Course ID is missing');
//         window.location.href = '/staff/ShowCourses';
//     }

//     // Load students when the page loads
//     loadStudents();

//     // Add event listeners for dropdowns
//     document.getElementById("filter").addEventListener("change", loadStudents);
// });
document.addEventListener('DOMContentLoaded', function() {
    const courseData = JSON.parse(localStorage.getItem('courseData'));
     const courseId = courseData.id;
 
     if (courseData) {
         document.getElementById('course').innerText = courseData.name;
         document.getElementById("imgnav").src = courseData.photo ? "/courses/photo/" + courseData.id : "/img/img-course.png";
     } else {
         alert('Course ID is missing');
         window.location.href = '/staff/ShowCourses';
     }
    });
    
     



function goBackToCoursePage() {
    console.log('Go Back button clicked!'); // Debug log
    window.location.href = '/staff/Dashboard';
  }

/*
document.getElementById('message-form').addEventListener('submit', async(event) => {
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
});*/