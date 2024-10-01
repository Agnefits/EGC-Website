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
        alert('Class added successfully');
        document.getElementById('addClassForm').reset();
    }
});