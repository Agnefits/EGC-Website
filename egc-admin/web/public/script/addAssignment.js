document.getElementById("uploadForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // منع إعادة التحميل الافتراضية للصفحة


    const formData = new FormData(this); // Automatically handles file inputs


    const courseData = JSON.parse(localStorage.getItem('courseData'));

    formData.append("courseId", courseData.id);

    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData["role"] == 'Doctor')
        formData.append("doctorId", userData.id);
    else
        formData.append("teaching_assistantId", userData.id);

    const response = await fetch('/add-assignment', {
        method: 'POST',
        body: formData // Send FormData object directly
    });

    if (!response.ok) {
        alert(response.headers.get('Error'));
    } else {
        showPopup();
    }
});

document.getElementById("degree").addEventListener("change", function changeValue(e) {
    if (isNaN(parseFloat(e.target.value)))
        e.target.value = "0";
    else
        e.target.value = parseFloat(e.target.value);
});
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'success!',
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
   
    didClose: () =>{
        window.location.href = '/staff/Course/Assignments';
    }
  });
}