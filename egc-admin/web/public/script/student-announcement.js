let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
});
document.addEventListener('DOMContentLoaded', () => {
    const courseFilter = document.getElementById('coursefilter');
    const announcementRows = Array.from(document.querySelectorAll('.comment2'));

    // Filter announcements based on selected course
    courseFilter.addEventListener('change', (e) => {
        const selectedCourse = e.target.value;
        announcementRows.forEach(row => {
            if (selectedCourse === "" || row.getAttribute('data-course') === selectedCourse) {
                row.style.display = ''; // Show the row
            } else {
                row.style.display = 'none'; // Hide the row
            }
        });
    });
});
