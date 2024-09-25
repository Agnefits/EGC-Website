document.addEventListener('DOMContentLoaded', function() {
    loadCourseDetails(); // Load the existing course details when the page loads

    // Image file input to preview the image
    document.getElementById('course_image').addEventListener('change', function() {
        previewImage(this);
    });

    // Event listeners for dynamic total degree calculation
    const inputFields = ['lectureAttendance', 'sectionAttendance', 'practicalDegree', 'midtermDegree', 'finalDegree'];
    inputFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', calculateTotalDegree);
    });
});

// Function to preview selected image
function previewImage(input) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('picturecourse').src = e.target.result; // Update the image source
    };
    reader.readAsDataURL(file);
}

// Function to calculate the total degree
function calculateTotalDegree() {
    const lectureAttendance = parseFloat(document.getElementById('lectureAttendance').value) || 0;
    const sectionAttendance = parseFloat(document.getElementById('sectionAttendance').value) || 0;
    const practicalDegree = parseFloat(document.getElementById('practicalDegree').value) || 0;
    const midtermDegree = parseFloat(document.getElementById('midtermDegree').value) || 0;
    const finalDegree = parseFloat(document.getElementById('finalDegree').value) || 0;

    const total = lectureAttendance + sectionAttendance + practicalDegree + midtermDegree + finalDegree;
    document.getElementById('totalDegree').value = total; // Update the total degree input
}

const courseData = JSON.parse(localStorage.getItem('courseData'));

// Function to load course details from the backend
function loadCourseDetails() {

    if (courseData) {
        if (!courseData.id) {
            alert('course ID is missing');
            return;
        } else {
            document.getElementById('courseName').value = courseData.name;
            document.getElementById('courseID').value = courseData.courseId;
            document.getElementById('courseDescription').value = courseData.description;
            document.getElementById('courseHours').value = courseData.hours;
            document.getElementById('lectureAttendance').value = courseData.lectureAttendance;
            document.getElementById('sectionAttendance').value = courseData.sectionAttendance;
            document.getElementById('practicalDegree').value = courseData.practicalDegree;
            document.getElementById('midtermDegree').value = courseData.midtermDegree;
            document.getElementById('finalDegree').value = courseData.finalExamDegree;
            document.getElementById('departmentFilter').value = courseData.department;
            document.getElementById('yearFilter').value = courseData.year;
            calculateTotalDegree(); // Update total degree on load


            if (courseData.photo) {
                document.getElementById('picturecourse').src = "/courses/photo/" + courseData.id;
            }

            localStorage.removeItem('courseData');
        }
    }
}



// Add event listener to the button
document.getElementById('editCourseForm').addEventListener("submit", async function(event) {
    event.preventDefault(); // منع إعادة التحميل الافتراضية للصفحة


    const formData = new FormData(this); // Automatically handles file inputs

    const response = await fetch('/update-course/' + courseData.id, {
        method: 'PUT',
        body: formData // Send FormData object directly
    });

    if (!response.ok) {
        alert(response.headers.get('Error'));
    } else {
        alert('Course uploaded successfully');
        window.location.href = '/staff/ShowCourses';
    }
});










// Function to submit the edited course form
function submitEditForm() {
    const courseId = getCourseIdFromURL(); // Ensure this retrieves the correct ID
    const formData = new FormData(document.getElementById('editCourseForm'));

    // Make a POST request to update the course details
    fetch('/updateCourse', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                alert('Course updated successfully');
                window.location.href = '/course'; // Redirect to course page after successful edit
            } else {
                alert('Failed to update course');
            }
        })
        .catch(error => console.error('Error submitting the form:', error));
}

// Helper function to extract course ID from URL
function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('courseId');
}

// Function for go back button
function goBackToCoursePage() {
    window.history.back();
}

//function goBackToCoursePage() {
//   window.location.href = '/staff/ShowCourses';
//}