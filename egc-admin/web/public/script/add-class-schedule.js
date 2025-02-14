document.getElementById('addClassForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the default way

    const formData = new FormData(this); // Automatically handles file inputs

    const response = await fetch('/add-class-schedule', {
        method: 'POST',
        body: formData // Send FormData object directly   

    });

    if (!response.ok) {
        alert(response.headers.get('Error'));
    } else {
        showPopup();

        document.getElementById('addClassForm').reset();
    }
});
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'success!',
        text: 'The class has been added',
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
    });

 
}