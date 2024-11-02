document.addEventListener('DOMContentLoaded', loadCoruses);

async function loadCoruses() {


    const instructorData = JSON.parse(localStorage.getItem('userData'));

    let response;
    if (instructorData.role == "Doctor")
        response = await fetch(`/doctor/courses/${instructorData.id}`);
    else
        response = await fetch(`/teaching-assistant/courses/${instructorData.id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch courses');
    }
    if (!response.ok) {
        throw new Error('Failed to fetch courses');
    }

    const courses = await response.json();
    console.log('Fetched courses:', courses); // أضف هذا السطر للتحقق من البيانات

    const CoursesTableBody = document.getElementsByClassName('row-container')[0];
    if (!CoursesTableBody) {
        throw new Error('Table body element not found');
    }

    CoursesTableBody.innerHTML = ''; // Clear the table before adding new rows

    let courseNo = 0;
    let row;
    courses.forEach(course => {
        if (courseNo++ % 3 == 0) {
            row = document.createElement('div');
            row.className = "row";
            CoursesTableBody.appendChild(row);
        }
        const cell = document.createElement('div');
        cell.innerHTML = `
           <div class="card card-hover" data-id="${course.id}">
                <img src="${course.photo? ("/courses/photo/" + course.id) : ("/img/img-course.png")}" alt="">
                <div class="overlay"></div>
                <h3 class="card-title">${course.name}</h3>
            </div>
        `;
        row.appendChild(cell);
    });

    addEventListeners(); // نقل عملية إضافة المستمعات إلى دالة منفصلة
}

function addEventListeners() {
    document.querySelectorAll('.card').forEach(button => {
        button.addEventListener('click', async(event) => {
            const courseId = button.dataset.id;
            if (!courseId) {
                alert('Course ID is missing');
                return;
            }

            try {
                const response = await fetch(`/courses/Details/${courseId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch course details');
                }

                const course = await response.json();
                console.log('Fetched course:', course); // أضف هذا السطر للتحقق من البيانات

                // Ensure the data contains ID
                if (course && course.id) {
                    localStorage.setItem('courseData', JSON.stringify(course));
                    window.location.href = '/staff/Course/Home';
                } else {
                    throw new Error('Course data is incomplete');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching course details');
            }
        });
    });
}