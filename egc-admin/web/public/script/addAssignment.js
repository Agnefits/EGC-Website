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
        alert('Assignment uploaded successfully');
        window.location.href = '/staff/Course/Assignments';
    }
});

document.getElementById("degree").addEventListener("change", function changeValue(e) {
    if (isNaN(parseFloat(e.target.value)))
        e.target.value = "0";
    else
        e.target.value = parseFloat(e.target.value);
});