document.getElementById("showPassword").addEventListener("click", function() {
    var x = document.getElementById("password");
    x.type = (x.type === "password") ? "text" : "password";
});

document.getElementById('addTeachingAssistantForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    try {
        const formData = new FormData(this); // Automatically handles file inputs

        const response = await fetch('/add-teaching-assistant', {
            method: 'POST',
            body: formData // Send FormData object directly
        });

        if (!response.ok) {
            // Handle server error response
            const errorText = await response.headers.get('Error') || 'An error occurred while adding the Teaching Assistant.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error processing request',
                width: '320px',
                heightAuto: false,
                position: 'top',
                backdrop: false,
                customClass: {
                    popup: 'custom-popup',
                },
                timer: 3000, // Auto-close after 3 seconds
                showConfirmButton: false // Hide "OK" button
            });
        } else {
            showPopup(); // Call the success pop-up function
        }
    } catch (error) {
        console.error('Error:', error);
        // Show error pop-up for network issues
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'A network error occurred. Please try again later.',
            position: 'top',
            backdrop: false,
            customClass: {
                popup: 'custom-popup',
            },
            timer: 3000, // Auto-close after 3 seconds
            showConfirmButton: false
        });
    }
});

// Function to show success pop-up
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'Successfully Added!',
        text: 'Teaching Assistant added successfully.',
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
            window.location.href = '/admin/AddTeachingAssistant'; // Redirect after success
        }
    });
}
