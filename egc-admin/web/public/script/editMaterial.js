const materialData = JSON.parse(localStorage.getItem('materialData'));

document.addEventListener('DOMContentLoaded', loadMaterialData);

async function loadMaterialData() {

    if (materialData) {
        if (!materialData.id) {
            alert('Material ID is missing');
            return;
        } else {
            document.getElementById('saveAs').value = materialData.saveAs;
            document.getElementById('date').value = materialData.date;
            document.getElementById('note').value = materialData.note;

            localStorage.removeItem('materialData');
        }
    }
}

document.getElementById("uploadForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // منع إعادة التحميل الافتراضية للصفحة


    const formData = new FormData(this); // Automatically handles file inputs


    const courseData = JSON.parse(localStorage.getItem('courseData'));

    formData.append("courseId", courseData.id);

    const response = await fetch('/update-material/' + materialData.id, {
        method: 'PUT',
        body: formData // Send FormData object directly
    });

    if (!response.ok) {
        alert(response.headers.get('Error'));
    } else {
        alert('Material uploaded successfully');
        window.location.href = '/staff/Course/Materials';
    }
});