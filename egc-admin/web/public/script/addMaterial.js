document.getElementById("uploadForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    const courseData = JSON.parse(localStorage.getItem('courseData'));
    formData.append("courseId", courseData.id);

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData["role"] == 'Doctor') {
        formData.append("doctorId", userData.id);
    } else {
        formData.append("teaching_assistantId", userData.id);
    }

    try {
        const response = await fetch('/add-material', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get error message from server
            throw new Error(errorText || 'Error uploading material'); // Throw error with message
        }

        Swal.fire({ // Success popup
            icon: 'success',
            title: 'success!',
            text: 'The material has been uploaded',
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
            didOpen: () => {
                const popup = Swal.getPopup();
               
            },
            timer: 3000, // Auto-close after 3 seconds
            showConfirmButton: false 
        }).then(() => {
            window.location.href = '/staff/Course/Materials'; // Redirect after popup closes
        });

    } catch (error) {
        console.error("Error details:", error); // Log the full error for debugging

        Swal.fire({ // Error popup
            icon: 'error',
            title: 'Error',
            text: error.message || 'An error occurred during upload.', // Display error message
        });
    }
});