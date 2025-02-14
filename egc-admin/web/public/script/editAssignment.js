const assignmentData = JSON.parse(localStorage.getItem('assignmentData'));

document.addEventListener('DOMContentLoaded', loadAssignmentData);

async function loadAssignmentData() {

    if (assignmentData) {
        if (!assignmentData.id) {
            alert('Assignment ID is missing');
            return;
        } else {
            document.getElementById('title').value = assignmentData.title;
            document.getElementById('deadline').value = assignmentData.deadline;
            document.getElementById('description').value = assignmentData.description;
            document.getElementById('degree').value = assignmentData.degree;

            localStorage.removeItem('assignmentData');
        }
    }
}

document.getElementById("uploadForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // منع إعادة التحميل الافتراضية للصفحة


    const formData = new FormData(this); // Automatically handles file inputs


    const courseData = JSON.parse(localStorage.getItem('courseData'));

    formData.append("courseId", courseData.id);

    const response = await fetch('/update-assignment/' + assignmentData.id, {
        method: 'PUT',
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
        text: 'The assignmet has been edited',
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
