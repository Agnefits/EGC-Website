document.getElementsByClassName("btnAddCourse")[0].addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/staff/AddCourse";
});

let currentPage = 0;
const coursesPerPage = 3;
let allCourses = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
    setupEventListeners();
});

async function loadCourses() {
    const doctorData = JSON.parse(localStorage.getItem('userData'));

    if (!doctorData || !doctorData.id) {
        console.error('User data is missing or invalid');
        return;
    }

    try {
        const response = await fetch(`/doctor/courses/${doctorData.id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }

        allCourses = await response.json();
        console.log('Fetched courses:', allCourses);

        filterCourses(); // Filter and display courses initially
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function filterCourses() {
    const departmentFilterValue = document.getElementById('departmentFilter').value;
    const yearFilterValue = document.getElementById('yearFilter').value;

    const filteredCourses = allCourses.filter(course => {
        const matchesDepartment = (departmentFilterValue === 'all') || (course.department === departmentFilterValue);
        const matchesYear = (yearFilterValue === 'all') || (course.year === yearFilterValue);
        return matchesDepartment && matchesYear;
    });

    console.log('Filtered courses:', filteredCourses); // Debugging

    // Display courses for the current page
    displayCourses(filteredCourses, currentPage);
}

function displayCourses(courses, page = 0) {
    const container = document.querySelector('#courseContainer');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    const start = page * coursesPerPage;
    const end = start + coursesPerPage;
    const coursesToDisplay = courses.slice(start, end);

    container.innerHTML = ''; // Clear existing content

    if (coursesToDisplay.length === 0) {
        container.innerHTML = "<p>No courses available for the selected filters.</p>";
        return;
    }

    coursesToDisplay.forEach(course => {
                const row = document.createElement('div');
                row.className = "course_details";
                row.dataset.id = course.id;
                row.dataset.department = course.department;
                row.dataset.year = course.year;
                row.innerHTML = `
        <div class="course-container">
            <div class="course-image">
                <h2 class="course-name">${course.name}</h2>
                <img src="${course.photo ? `/courses/photo/${course.id}` : '/img/img-course.png'}" alt="Course image" class="img_style">
            </div>
            <div class="card-course">
                <div class="row">
                    <div>
                        <h3>Course Details</h3>
                        <hr>
                        <p>Description: ${course.description}</p>
                        <hr>
                        <p>Duration: <span class="float-right">${course.hours} Hours</span></p>
                        <hr>
                        <p>Final Exam Degree: <span class="float-right">${course.finalExamDegree}</span></p>
                        <hr>
                        <p>Total Course Degree: <span class="float-right">${course.lectureAttendance + course.sectionAttendance + course.practicalDegree + course.midtermDegree + course.finalExamDegree}</span></p>
                        <hr>
                        <p>Department: <span class="float-right">${course.department}</span></p>
                        <hr>
                        <p>Year: <span class="float-right">${course.year}</span></p>
                        <button class="edit-btn" data-id="${course.id}">Edit Course</button> <!-- Add Edit Button -->
                    </div>
                </div>
            </div>
        </div>
    `;
        container.appendChild(row);
        container.appendChild(document.createElement('hr'));
    });

    updatePagination(courses.length);
    addEventListeners(); // نقل عملية إضافة المستمعات إلى دالة منفصلة
}

function setupEventListeners() {
    const departmentFilter = document.getElementById('departmentFilter');
    const yearFilter = document.getElementById('yearFilter');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    if (departmentFilter && yearFilter && prevPageBtn && nextPageBtn) {
        departmentFilter.addEventListener('change', filterCourses);
        yearFilter.addEventListener('change', filterCourses);
        prevPageBtn.addEventListener('click', () => changePage(-1));
        nextPageBtn.addEventListener('click', () => changePage(1));
    } else {
        console.error('One or more filter or pagination elements are missing in the HTML.');
    }

    // Add click event listener for the edit buttons
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const courseId = event.target.dataset.id;

            if (!courseId) {
                alert('course ID is missing');
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
                    window.location.href = `/staff/EditCourse`; // Redirect to edit course page with course ID
                } else {
                    throw new Error('course data is incomplete');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching course details');
            }
        }
    });
}

function addEventListeners() {
    document.querySelectorAll('.course_details').forEach(button => {
        button.querySelector('.course-image').addEventListener('click', async(event) => {
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

function changePage(direction) {
    const newPage = currentPage + direction;

    // Ensure the new page is within bounds
    if (newPage >= 0 && newPage * coursesPerPage < allCourses.length) {
        currentPage = newPage;
        console.log('Changing to page:', currentPage); // Debugging
        filterCourses(); // Apply the filter and display the courses for the new page
    }
}

function updatePagination(totalCourses) {
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    // Enable or disable pagination buttons
    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = (currentPage + 1) * coursesPerPage >= totalCourses;

    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage + 1}`;
}