
document.addEventListener('DOMContentLoaded', () => {
    loadTeachingAssistants();

});
const teachingId=[];

async function loadTeachingAssistants() {
    try {
        const response = await fetch('/teaching-assistants');
        if (!response.ok) {
            throw new Error('Failed to fetch teaching assistants');
        }

        const teachingAssistants = await response.json();
        console.log('Fetched teaching assistants:', teachingAssistants);

        const teachingAssistantsTableBody = document.getElementById('teach');
        if (!teachingAssistantsTableBody) {
            throw new Error('Table body element not found');
        }

        teachingAssistantsTableBody.innerHTML = ''; // Clear the table before adding new rows


        teachingAssistants.forEach(teachingAssistant => {
            teachingId[teachingAssistant.id]={"major":teachingAssistant.major,"photo":teachingAssistant.photo};
            const option = document.createElement('option');
            option.value=teachingAssistant.id;
            option.innerHTML = teachingAssistant.name;
            teachingAssistantsTableBody.appendChild(option);

        });
        const dep=document.getElementById("dep");
        const imgProfile=document.getElementById("imgProfile");
    teachingAssistantsTableBody.addEventListener("change",function(){
        dep.value=teachingId[teachingAssistantsTableBody.value].major;
        imgProfile.src=teachingId[teachingAssistantsTableBody.value].photo?`/teaching-assistants/photo/${teachingAssistantsTableBody.value}`:"/img/wallpaperflare.com_wallpaper (25).jpg";
    } )
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading teaching assistants');
    }
}
document.getElementById("join-Student").addEventListener("submit", async function(event) {
    event.preventDefault(); // منع إعادة التحميل الافتراضية للصفحة

    const courseData = JSON.parse(localStorage.getItem('courseData'));
    const formData = new FormData(this); // Automatically handles file inputs

    formData.append("courseId", courseData.id);
    const response = await fetch('/join_course_teaching_assistant', {
        method: 'POST',
        body: formData // Send FormData object directly
    });
   
    if (!response.ok) {
        alert(response.headers.get('Error'));
    } else {
        alert('Teaching Assistant joined');
    }
});

