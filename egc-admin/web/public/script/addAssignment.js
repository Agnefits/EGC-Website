document.getElementById("uploadForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const courseData = JSON.parse(localStorage.getItem('courseData'));
    if (!courseData || !courseData.id) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Course data is missing. Please select a course first.',
        });
        return;
    }

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.id) {
        alert('User data is missing. Please log in again.');
        return;
    }

    const formData = new FormData(this);
    formData.append("courseId", courseData.id);
    formData.append(userData["role"] === 'Doctor' ? "doctorId" : "teaching_assistantId", userData.id);

    try {
        const response = await fetch('/add-assignment', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload assignment');
        }

        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'The assignment has been added',
            width: '320px',
            heightAuto: false,
            position: 'top',
            showConfirmButton: false,
            timer: 2000,
            didClose: () => {
                // تحديث قائمة الواجبات مباشرة
                if (typeof loadAssignments === "function") {
                    loadAssignments();
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Something went wrong. Please try again.');
    }
});

// Handle degree input validation
document.getElementById("degree").addEventListener("change", function changeValue(e) {
    if (isNaN(parseFloat(e.target.value))) {
        e.target.value = "0";
    } else {
        e.target.value = parseFloat(e.target.value);
    }
});

// Show success popup
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'The assignment has been added',
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
            window.location.href = '/staff/Course/Assignments';
        }
    });
}